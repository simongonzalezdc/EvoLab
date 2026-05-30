// Auto-pilot system for automatic cell survival
// Handles movement, resource collection, and predator avoidance automatically

import { Cell } from '../entities/Cell';
import { Resource } from '../entities/Resource';
import { BiomeGenerator, BiomeData } from '../environment/BiomeGenerator';
import { Config } from './Config';
import { logger } from '../utils/Logger';

interface Vector2D {
  x: number;
  y: number;
}

export class AutoPilot {
  private biomeGenerator: BiomeGenerator;
  // Use a Map to store per-cell wander state
  private cellWanderState: Map<string, { cooldown: number; direction: { x: number; y: number } }> = new Map();
  // Target caching: cell ID -> resource ID
  private cellTargets: Map<string, string> = new Map();
  private lastResourceCheck = 0;

  constructor(biomeGenerator: BiomeGenerator) {
    this.biomeGenerator = biomeGenerator;
  }

  // Get movement direction for auto-pilot
  getMovementDirection(
    player: Cell,
    allCells: Cell[],
    resources: Resource[],
    deltaTime: number
  ): { x: number; y: number } {
    const direction = { x: 0, y: 0 };

    // Priority 1: Flee from dangerous predators
    const predator = this.findNearestPredator(player, allCells);
    if (predator && this.shouldFlee(player, predator)) {
      const fleeDir = this.getDirectionAway(player.position, predator.position);
      direction.x = fleeDir.x;
      direction.y = fleeDir.y;
      return direction;
    }

    // Priority 2: Seek resources if ATP is low or compounds are needed
    // Improved hunger detection using ATP ratio and projected ATP
    const atpRatio = player.traits.atp / player.traits.maxATP;

    // Calculate projected ATP (current - drain rate * starvation window)
    // Must match Cell.drainATP() calculation including metabolismRate
    const baseDrain = Config.ATP_DRAIN_RATE;
    const sizeDrain = player.traits.size * Config.ATP_DRAIN_MULTIPLIER_SIZE;
    const drainRate = (baseDrain + sizeDrain) * player.traits.metabolismRate;
    const projectedATP = player.traits.atp - (drainRate * Config.AUTO_PILOT_STARVATION_WINDOW_SECONDS);
    const projectedATPRatio = projectedATP / player.traits.maxATP;
    
    // Trigger resource-seeking if:
    // - ATP ratio below hunger threshold OR
    // - Projected ATP will drop below 30% OR
    // - Compounds are needed for reproduction
    const needsResources = 
      atpRatio < Config.AUTO_PILOT_HUNGER_THRESHOLD ||
      projectedATPRatio < 0.3 ||
      player.compounds.glucose < Config.REPRODUCTION_GLUCOSE_REQUIRED ||
      player.compounds.aminoAcids < Config.REPRODUCTION_AMINO_ACIDS_REQUIRED ||
      player.compounds.phosphates < Config.REPRODUCTION_PHOSPHATES_REQUIRED;

    if (needsResources) {
      if (Config.DEBUG_AUTO_PILOT) {
        logger.log(`[AutoPilot] Cell ${player.id} needs resources - ATP: ${atpRatio.toFixed(2)}, Projected: ${projectedATPRatio.toFixed(2)}`);
      }

      // Check if cell has cached target
      const cachedTargetId = this.cellTargets.get(player.id);
      let targetResource: Resource | null = null;

      if (cachedTargetId) {
        // Verify cached target still exists and is collectable
        targetResource = resources.find(r => r.id === cachedTargetId && !r.isCollected) || null;
        
        if (!targetResource) {
          // Cached target is invalid, clear it
          this.cellTargets.delete(player.id);
          if (Config.DEBUG_AUTO_PILOT) {
            logger.log(`[AutoPilot] Cell ${player.id} cached target invalid, finding new one`);
          }
        } else {
          if (Config.DEBUG_AUTO_PILOT) {
            logger.log(`[AutoPilot] Cell ${player.id} using cached target: ${cachedTargetId}`);
          }
        }
      }

      // If no valid cached target, find new nearest resource
      if (!targetResource) {
        targetResource = this.findNearestResource(player, resources);
        if (targetResource) {
          // Cache the new target
          this.cellTargets.set(player.id, targetResource.id);
          if (Config.DEBUG_AUTO_PILOT) {
            logger.log(`[AutoPilot] Cell ${player.id} cached new target: ${targetResource.id}`);
          }
        }
      }

      if (targetResource) {
        const resourceDir = this.getDirectionTo(player.position, targetResource.position);
        direction.x = resourceDir.x;
        direction.y = resourceDir.y;
        return direction;
      }
    }

    // Priority 3: If ready to reproduce, find a nutrient-rich, low-hazard biome
    if (player.canReproduce()) {
      if (Config.DEBUG_AUTO_PILOT) {
        logger.log(`[AutoPilot] Cell ${player.id} ready to reproduce, seeking nutrient-rich, low-hazard biome`);
      }
      
      // Get current biome
      const currentBiome = this.biomeGenerator.getBiomeAt(player.position.x, player.position.y);
      
      // Check if current biome is suitable for reproduction
      const isNutrientRich = currentBiome.nutrients > 7;
      const hasLowHazards = currentBiome.hazards.length === 0;
      const isSuitableBiome = isNutrientRich && hasLowHazards;
      
      if (isSuitableBiome) {
        // Found suitable biome - slow movement for reproduction
        direction.x *= 0.5;
        direction.y *= 0.5;
        if (Config.DEBUG_AUTO_PILOT) {
          logger.log(`[AutoPilot] Cell ${player.id} in suitable biome (nutrients: ${currentBiome.nutrients}, hazards: ${currentBiome.hazards.length}), slowing for reproduction`);
        }
        return direction;
      } else {
        // Find a better biome to move toward
        const safeResource = this.findNearestResource(player, resources);
        if (safeResource) {
          // Move toward resources which often indicate better biome conditions
          const safeDir = this.getDirectionTo(player.position, safeResource.position);
          direction.x = safeDir.x;
          direction.y = safeDir.y;
          
          if (Config.DEBUG_AUTO_PILOT) {
            logger.log(`[AutoPilot] Cell ${player.id} moving toward better biome (current nutrients: ${currentBiome.nutrients}, hazards: ${currentBiome.hazards.length})`);
          }
          return direction;
        }
      }
    }

    // Priority 4: Wander around (per-cell wander state)
    // Dynamic wandering based on hunger level
    const cellId = player.id;
    let wanderState = this.cellWanderState.get(cellId);
    if (!wanderState) {
      wanderState = {
        cooldown: 0,
        direction: this.wander(atpRatio),
      };
      this.cellWanderState.set(cellId, wanderState);
    }

    // Make cooldown depend on hunger: hungrier = more frequent direction changes
    // Formula: 0.5 + Math.max(0.3, atpRatio) * 2
    // When ATP is high (1.0), cooldown = 2.5s. When low (0.3), cooldown = 1.1s
    const baseCooldown = 0.5 + Math.max(0.3, atpRatio) * 2;

    wanderState.cooldown -= deltaTime;
    if (wanderState.cooldown <= 0) {
      // Bias wander direction outward from lake center when hungry (explore more)
      wanderState.direction = this.wander(atpRatio);
      wanderState.cooldown = baseCooldown + Math.random() * 1; // Add some randomness
      
      if (Config.DEBUG_AUTO_PILOT) {
        logger.log(`[AutoPilot] Cell ${player.id} new wander direction, cooldown: ${wanderState.cooldown.toFixed(2)}s`);
      }
    }

    direction.x = wanderState.direction.x;
    direction.y = wanderState.direction.y;
    return direction;
  }

  // Assess nearby threats and determine if cell should flee
  private assessThreats(player: Cell, allCells: Cell[]): {
    shouldFlee: boolean;
    threatCount: number;
    threatCenter: Vector2D;
    powerRatio: number;
  } {
    const detectionRange = 200;
    const threats: Cell[] = [];
    let totalThreatPower = 0;
    const playerPower = player.traits.size * (1 + player.traits.armor * 0.5);

    // Find all nearby threats
    allCells.forEach(cell => {
      if (cell.id === player.id) return;

      const distance = Math.sqrt(
        Math.pow(cell.position.x - player.position.x, 2) +
        Math.pow(cell.position.y - player.position.y, 2)
      );

      if (distance < detectionRange) {
        // Consider as threat if larger, more aggressive, or has more combat traits
        const cellPower = cell.traits.size * (1 + cell.traits.armor * 0.5);
        const isThreat = cellPower > playerPower * 0.7 || cell.traits.aggression > 5;

        if (isThreat) {
          threats.push(cell);
          totalThreatPower += cellPower;
        }
      }
    });

    // Calculate threat center (average position of threats)
    let threatCenter = { x: player.position.x, y: player.position.y };
    if (threats.length > 0) {
      threatCenter.x = threats.reduce((sum, t) => sum + t.position.x, 0) / threats.length;
      threatCenter.y = threats.reduce((sum, t) => sum + t.position.y, 0) / threats.length;
    }

    // Decide if should flee: outnumbered (3+ threats) OR outmatched (total power > 2x player power)
    const powerRatio = totalThreatPower / playerPower;
    const shouldFlee = threats.length >= 3 || powerRatio > 2.0;

    return {
      shouldFlee,
      threatCount: threats.length,
      threatCenter,
      powerRatio,
    };
  }

  private findNearestPredator(player: Cell, allCells: Cell[]): Cell | null {
    let nearest: Cell | null = null;
    let nearestDistance = Infinity;

    for (const cell of allCells) {
      if (cell.id === player.id || cell.isPlayer) continue;
      
      // Consider cells with high aggression and larger size as predators
      const isPredator = 
        cell.traits.aggression > 6 && 
        cell.traits.size > player.traits.size * 0.8;

      if (isPredator) {
        const distance = this.getDistance(player.position, cell.position);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = cell;
        }
      }
    }

    return nearest;
  }

  private shouldFlee(player: Cell, predator: Cell): boolean {
    const distance = this.getDistance(player.position, predator.position);
    const safeDistance = player.traits.visionRange || 200;
    
    // Flee if predator is within vision range
    return distance < safeDistance;
  }

  private findNearestResource(player: Cell, resources: Resource[]): Resource | null {
    let nearest: Resource | null = null;
    let nearestDistance = Infinity;

    // Use vision range as detection limit (same as HerbivoreAI)
    const detectionRange = player.traits.visionRange || 800;

    for (const resource of resources) {
      // Skip already collected resources
      if (resource.isCollected) continue;

      const distance = this.getDistance(player.position, resource.position);

      // Only consider resources within detection range
      if (distance < nearestDistance && distance < detectionRange) {
        nearestDistance = distance;
        nearest = resource;
      }
    }

    return nearest;
  }

  private getDirectionTo(from: { x: number; y: number }, to: { x: number; y: number }): { x: number; y: number } {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    
    if (magnitude === 0) return { x: 0, y: 0 };
    
    return {
      x: dx / magnitude,
      y: dy / magnitude,
    };
  }

  private getDirectionAway(from: { x: number; y: number }, awayFrom: { x: number; y: number }): { x: number; y: number } {
    const direction = this.getDirectionTo(awayFrom, from);
    return direction;
  }

  private getDistance(pos1: { x: number; y: number }, pos2: { x: number; y: number }): number {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private wander(atpRatio?: number): { x: number; y: number } {
    let angle = Math.random() * Math.PI * 2;
    
    // Optionally bias direction toward unexplored space (outward from lake center) when hungry
    if (atpRatio !== undefined && atpRatio < 0.5) {
      // When hungry, bias toward exploring outward
      // Lake center is approximately at Config.PLAYER_START_X, Config.PLAYER_START_Y
      // This is a simplified approach - in a full implementation, we'd track explored areas
      const outwardBias = (Math.random() - 0.5) * 0.3; // Small bias
      angle += outwardBias;
    }
    
    return {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
  }

  // Clear cached target for a cell (called when resource is collected)
  clearTarget(cellId: string): void {
    this.cellTargets.delete(cellId);
    if (Config.DEBUG_AUTO_PILOT) {
      logger.log(`[AutoPilot] Cleared target for cell ${cellId}`);
    }
  }
}
