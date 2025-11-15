// Advanced AI System for Pack Behavior, Territory, and Learning

import { Cell } from '../entities/Cell';
import type { Vector2D } from '../types/entities';

export interface PackData {
  id: string;
  leaderId: string;
  members: Set<string>;
  packCenter: Vector2D;
  packRadius: number;
  packType: 'herbivore' | 'carnivore' | 'omnivore';
}

export interface TerritoryData {
  ownerId: string;
  center: Vector2D;
  radius: number;
  resourceValue: number; // How valuable this territory is
  lastDefended: number;
}

export interface LearningData {
  cellId: string;
  successfulStrategies: Map<string, number>; // strategy -> success count
  failedStrategies: Map<string, number>; // strategy -> failure count
  playerEncounters: number;
  playerVictories: number; // If AI won against player
  playerDefeats: number; // If player won against AI
  preferredBiomes: Map<string, number>; // biome -> time spent
}

export class AdvancedAISystem {
  private packs: Map<string, PackData> = new Map();
  private territories: Map<string, TerritoryData> = new Map();
  private learningData: Map<string, LearningData> = new Map();
  private nextPackId = 0;

  // Pack behavior parameters
  private readonly PACK_FORMATION_DISTANCE = 200;
  private readonly MAX_PACK_SIZE = 5;
  private readonly PACK_COHESION_STRENGTH = 0.3;
  private readonly PACK_SEPARATION_DISTANCE = 30;

  // Territory parameters
  private readonly TERRITORY_CLAIM_RADIUS = 150;
  private readonly TERRITORY_DEFENSE_RADIUS = 200;
  private readonly TERRITORY_DECAY_TIME = 30000; // 30 seconds

  /**
   * Pack Behavior System
   */

  // Try to form or join a pack
  formPack(cell: Cell, nearbyCells: Cell[]): PackData | null {
    // Check if already in a pack
    const existingPack = this.findCellPack(cell.id);
    if (existingPack) return existingPack;

    // Determine pack type based on aggression (high aggression = carnivore, low = herbivore, medium = omnivore)
    const getDietType = (c: Cell): 'herbivore' | 'carnivore' | 'omnivore' => {
      if (c.traits.aggression > 6) return 'carnivore';
      if (c.traits.aggression < 4) return 'herbivore';
      return 'omnivore';
    };

    const cellDiet = getDietType(cell);

    // Look for nearby cells of same type to form pack
    const sameTypeCells = nearbyCells.filter(
      c => c.id !== cell.id &&
      getDietType(c) === cellDiet &&
      !this.findCellPack(c.id) &&
      this.getDistance(cell.position, c.position) < this.PACK_FORMATION_DISTANCE
    );

    if (sameTypeCells.length >= 1) {
      // Form new pack
      const packId = `pack_${this.nextPackId++}`;
      const members = new Set<string>([cell.id]);

      // Add up to MAX_PACK_SIZE members
      for (let i = 0; i < Math.min(sameTypeCells.length, this.MAX_PACK_SIZE - 1); i++) {
        const cellToAdd = sameTypeCells[i];
        if (cellToAdd) {
          members.add(cellToAdd.id);
        }
      }

      const pack: PackData = {
        id: packId,
        leaderId: cell.id, // First cell becomes leader
        members,
        packCenter: { ...cell.position },
        packRadius: this.PACK_FORMATION_DISTANCE,
        packType: cellDiet,
      };

      this.packs.set(packId, pack);
      return pack;
    }

    return null;
  }

  // Update pack behavior
  updatePack(pack: PackData, allCells: Cell[]): void {
    // Remove dead/missing members
    const aliveMemberIds = new Set<string>();
    const aliveMembers: Cell[] = [];

    for (const memberId of pack.members) {
      const cell = allCells.find(c => c.id === memberId);
      if (cell && cell.traits.health > 0) {
        aliveMemberIds.add(memberId);
        aliveMembers.push(cell);
      }
    }

    pack.members = aliveMemberIds;

    // If pack too small, disband
    if (pack.members.size < 2) {
      this.packs.delete(pack.id);
      return;
    }

    // Update pack center (average position of members)
    if (aliveMembers.length > 0) {
      const avgX = aliveMembers.reduce((sum, c) => sum + c.position.x, 0) / aliveMembers.length;
      const avgY = aliveMembers.reduce((sum, c) => sum + c.position.y, 0) / aliveMembers.length;
      pack.packCenter = { x: avgX, y: avgY };
    }

    // Update leader if current leader is dead
    if (!pack.members.has(pack.leaderId)) {
      // Pick strongest member as new leader (use size + aggression as strength metric)
      const strongestMember = aliveMembers.reduce((strongest, current) => {
        const strengthCurrent = current.traits.size + current.traits.aggression;
        const strengthStrongest = strongest.traits.size + strongest.traits.aggression;
        return strengthCurrent > strengthStrongest ? current : strongest;
      });
      pack.leaderId = strongestMember.id;
    }
  }

  // Get pack behavior direction for a cell
  getPackBehavior(cellId: string, allCells: Cell[]): Vector2D | null {
    const pack = this.findCellPack(cellId);
    if (!pack) return null;

    const cell = allCells.find(c => c.id === cellId);
    if (!cell) return null;

    // Calculate cohesion (move toward pack center)
    const cohesion = this.normalize({
      x: pack.packCenter.x - cell.position.x,
      y: pack.packCenter.y - cell.position.y,
    });

    // Calculate separation (avoid crowding pack mates)
    let separationX = 0;
    let separationY = 0;
    let separationCount = 0;

    for (const memberId of pack.members) {
      if (memberId === cellId) continue;

      const member = allCells.find(c => c.id === memberId);
      if (!member) continue;

      const distance = this.getDistance(cell.position, member.position);
      if (distance < this.PACK_SEPARATION_DISTANCE && distance > 0) {
        separationX += (cell.position.x - member.position.x) / distance;
        separationY += (cell.position.y - member.position.y) / distance;
        separationCount++;
      }
    }

    const separation = separationCount > 0
      ? this.normalize({ x: separationX, y: separationY })
      : { x: 0, y: 0 };

    // Combine behaviors
    return {
      x: cohesion.x * this.PACK_COHESION_STRENGTH + separation.x * 0.5,
      y: cohesion.y * this.PACK_COHESION_STRENGTH + separation.y * 0.5,
    };
  }

  // Check if cell is pack leader
  isPackLeader(cellId: string): boolean {
    const pack = this.findCellPack(cellId);
    return pack !== null && pack.leaderId === cellId;
  }

  // Get pack for coordinated hunting
  getPackMembers(cellId: string, allCells: Cell[]): Cell[] {
    const pack = this.findCellPack(cellId);
    if (!pack) return [];

    return allCells.filter(c => pack.members.has(c.id));
  }

  private findCellPack(cellId: string): PackData | null {
    for (const pack of this.packs.values()) {
      if (pack.members.has(cellId)) {
        return pack;
      }
    }
    return null;
  }

  /**
   * Territory System
   */

  // Claim territory around current position
  claimTerritory(cell: Cell, resourceValue: number): void {
    const existingTerritory = this.territories.get(cell.id);

    if (existingTerritory) {
      // Update existing territory
      existingTerritory.center = { ...cell.position };
      existingTerritory.resourceValue = Math.max(existingTerritory.resourceValue, resourceValue);
      existingTerritory.lastDefended = Date.now();
    } else {
      // Create new territory
      this.territories.set(cell.id, {
        ownerId: cell.id,
        center: { ...cell.position },
        radius: this.TERRITORY_CLAIM_RADIUS,
        resourceValue,
        lastDefended: Date.now(),
      });
    }
  }

  // Check if position is in cell's territory
  isInTerritory(cellId: string, position: Vector2D): boolean {
    const territory = this.territories.get(cellId);
    if (!territory) return false;

    const distance = this.getDistance(territory.center, position);
    return distance < territory.radius;
  }

  // Check if should defend territory from intruder
  shouldDefendTerritory(defenderId: string, intruder: Cell): boolean {
    const territory = this.territories.get(defenderId);
    if (!territory) return false;

    const distance = this.getDistance(territory.center, intruder.position);
    return distance < this.TERRITORY_DEFENSE_RADIUS;
  }

  // Get direction to patrol territory
  getTerritoryPatrolDirection(cellId: string, currentPosition: Vector2D): Vector2D | null {
    const territory = this.territories.get(cellId);
    if (!territory) return null;

    // Patrol in a circle around territory center
    const angle = Math.atan2(
      currentPosition.y - territory.center.y,
      currentPosition.x - territory.center.x
    );

    // Patrol clockwise
    const patrolAngle = angle + Math.PI / 4;
    const targetX = territory.center.x + Math.cos(patrolAngle) * territory.radius * 0.7;
    const targetY = territory.center.y + Math.sin(patrolAngle) * territory.radius * 0.7;

    return this.normalize({
      x: targetX - currentPosition.x,
      y: targetY - currentPosition.y,
    });
  }

  // Clean up old territories
  cleanupTerritories(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [id, territory] of this.territories) {
      if (now - territory.lastDefended > this.TERRITORY_DECAY_TIME) {
        toDelete.push(id);
      }
    }

    for (const id of toDelete) {
      this.territories.delete(id);
    }
  }

  /**
   * Learning System
   */

  // Initialize learning data for a cell
  initializeLearning(cellId: string): void {
    if (!this.learningData.has(cellId)) {
      this.learningData.set(cellId, {
        cellId,
        successfulStrategies: new Map(),
        failedStrategies: new Map(),
        playerEncounters: 0,
        playerVictories: 0,
        playerDefeats: 0,
        preferredBiomes: new Map(),
      });
    }
  }

  // Record strategy success
  recordSuccess(cellId: string, strategy: string): void {
    const data = this.learningData.get(cellId);
    if (!data) return;

    const count = data.successfulStrategies.get(strategy) || 0;
    data.successfulStrategies.set(strategy, count + 1);
  }

  // Record strategy failure
  recordFailure(cellId: string, strategy: string): void {
    const data = this.learningData.get(cellId);
    if (!data) return;

    const count = data.failedStrategies.get(strategy) || 0;
    data.failedStrategies.set(strategy, count + 1);
  }

  // Get best learned strategy
  getBestStrategy(cellId: string): string | null {
    const data = this.learningData.get(cellId);
    if (!data) return null;

    let bestStrategy: string | null = null;
    let bestScore = -Infinity;

    for (const [strategy, successCount] of data.successfulStrategies) {
      const failCount = data.failedStrategies.get(strategy) || 0;
      const totalAttempts = successCount + failCount;

      if (totalAttempts < 3) continue; // Need minimum attempts

      const successRate = successCount / totalAttempts;
      if (successRate > bestScore) {
        bestScore = successRate;
        bestStrategy = strategy;
      }
    }

    return bestStrategy;
  }

  // Record player encounter outcome
  recordPlayerEncounter(cellId: string, aiWon: boolean): void {
    const data = this.learningData.get(cellId);
    if (!data) return;

    data.playerEncounters++;
    if (aiWon) {
      data.playerVictories++;
    } else {
      data.playerDefeats++;
    }
  }

  // Check if AI should avoid player based on past encounters
  shouldAvoidPlayer(cellId: string): boolean {
    const data = this.learningData.get(cellId);
    if (!data || data.playerEncounters < 3) return false;

    // If losing more than 70% of encounters, avoid player
    const lossRate = data.playerDefeats / data.playerEncounters;
    return lossRate > 0.7;
  }

  // Record biome preference (called each frame in a biome)
  recordBiomeTime(cellId: string, biome: string, deltaTime: number): void {
    const data = this.learningData.get(cellId);
    if (!data) return;

    const currentTime = data.preferredBiomes.get(biome) || 0;
    data.preferredBiomes.set(biome, currentTime + deltaTime);
  }

  // Get difficulty scaling factor based on learning
  getDifficultyScaling(cellId: string): number {
    const data = this.learningData.get(cellId);
    if (!data) return 1.0;

    // If AI is consistently beating player, make it slightly harder
    if (data.playerEncounters > 5) {
      const winRate = data.playerVictories / data.playerEncounters;
      if (winRate > 0.6) {
        return 1.2; // 20% boost to stats
      }
    }

    return 1.0;
  }

  /**
   * Utility Methods
   */

  private getDistance(a: Vector2D, b: Vector2D): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private normalize(vector: Vector2D): Vector2D {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (length === 0) return { x: 0, y: 0 };
    return {
      x: vector.x / length,
      y: vector.y / length,
    };
  }

  // Update all systems
  update(allCells: Cell[], deltaTime: number): void {
    // Update all packs
    for (const pack of this.packs.values()) {
      this.updatePack(pack, allCells);
    }

    // Cleanup old territories
    this.cleanupTerritories();

    // Initialize learning for new cells
    for (const cell of allCells) {
      this.initializeLearning(cell.id);
    }
  }

  // Cleanup data for dead cells
  cleanup(aliveCellIds: Set<string>): void {
    // Remove learning data for dead cells
    for (const cellId of this.learningData.keys()) {
      if (!aliveCellIds.has(cellId)) {
        this.learningData.delete(cellId);
      }
    }

    // Remove territories for dead cells
    for (const cellId of this.territories.keys()) {
      if (!aliveCellIds.has(cellId)) {
        this.territories.delete(cellId);
      }
    }
  }
}
