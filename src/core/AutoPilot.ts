// Auto-pilot system for automatic cell survival
// Handles movement, resource collection, and predator avoidance automatically

import { Cell } from '../entities/Cell';
import { Resource } from '../entities/Resource';
import { Config } from './Config';

export class AutoPilot {
  // Use a Map to store per-cell wander state
  private cellWanderState: Map<string, { cooldown: number; direction: { x: number; y: number } }> = new Map();
  private lastResourceCheck = 0;

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
    const needsResources = 
      player.traits.atp < player.traits.maxATP * 0.7 ||
      player.compounds.glucose < Config.REPRODUCTION_GLUCOSE_REQUIRED ||
      player.compounds.aminoAcids < Config.REPRODUCTION_AMINO_ACIDS_REQUIRED ||
      player.compounds.phosphates < Config.REPRODUCTION_PHOSPHATES_REQUIRED;

    if (needsResources) {
      const nearestResource = this.findNearestResource(player, resources);
      if (nearestResource) {
        const resourceDir = this.getDirectionTo(player.position, nearestResource.position);
        direction.x = resourceDir.x;
        direction.y = resourceDir.y;
        return direction;
      }
    }

    // Priority 3: If ready to reproduce, find a safe area
    if (player.canReproduce()) {
      // Look for a resource-rich, safe area
      const safeResource = this.findNearestResource(player, resources);
      if (safeResource) {
        const safeDir = this.getDirectionTo(player.position, safeResource.position);
        direction.x = safeDir.x * 0.5; // Move slower when ready to reproduce
        direction.y = safeDir.y * 0.5;
        return direction;
      }
    }

    // Priority 4: Wander around (per-cell wander state)
    const cellId = player.id;
    let wanderState = this.cellWanderState.get(cellId);
    if (!wanderState) {
      wanderState = {
        cooldown: 0,
        direction: this.wander(),
      };
      this.cellWanderState.set(cellId, wanderState);
    }

    wanderState.cooldown -= deltaTime;
    if (wanderState.cooldown <= 0) {
      wanderState.direction = this.wander();
      wanderState.cooldown = 2 + Math.random() * 3; // 2-5 seconds
    }

    direction.x = wanderState.direction.x;
    direction.y = wanderState.direction.y;
    return direction;
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

    for (const resource of resources) {
      const distance = this.getDistance(player.position, resource.position);
      
      // Prefer resources that are closer and needed
      if (distance < nearestDistance) {
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

  private wander(): { x: number; y: number } {
    const angle = Math.random() * Math.PI * 2;
    return {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
  }
}

