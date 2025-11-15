// Base AI behavior system

import { Cell } from '../entities/Cell';
import { Resource } from '../entities/Resource';
import type { Vector2D } from '../types/entities';

export enum BehaviorType {
  HERBIVORE = 'herbivore',
  CARNIVORE = 'carnivore',
  OMNIVORE = 'omnivore',
}

export abstract class AIBehavior {
  protected cell: Cell;
  protected type: BehaviorType;
  protected detectionRange: number;
  protected fleeDistance: number;

  constructor(cell: Cell, type: BehaviorType) {
    this.cell = cell;
    this.type = type;
    this.detectionRange = cell.traits.visionRange;
    this.fleeDistance = this.detectionRange * 0.7;
  }

  // Update AI behavior each frame
  abstract update(
    deltaTime: number,
    nearbyCells: Cell[],
    nearbyResources: Resource[]
  ): void;

  // Calculate direction to target
  protected getDirectionTo(target: Vector2D): Vector2D {
    const dx = target.x - this.cell.position.x;
    const dy = target.y - this.cell.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return { x: 0, y: 0 };

    return {
      x: dx / distance,
      y: dy / distance,
    };
  }

  // Calculate direction away from target
  protected getDirectionAway(target: Vector2D): Vector2D {
    const direction = this.getDirectionTo(target);
    return {
      x: -direction.x,
      y: -direction.y,
    };
  }

  // Find nearest resource
  protected findNearestResource(resources: Resource[]): Resource | null {
    let nearest: Resource | null = null;
    let minDistance = Infinity;

    for (const resource of resources) {
      if (resource.isCollected) continue;

      const distance = this.cell.distanceTo(resource.position);
      if (distance < minDistance && distance < this.detectionRange) {
        minDistance = distance;
        nearest = resource;
      }
    }

    return nearest;
  }

  // Find nearest cell matching predicate
  protected findNearestCell(
    cells: Cell[],
    predicate: (cell: Cell) => boolean
  ): Cell | null {
    let nearest: Cell | null = null;
    let minDistance = Infinity;

    for (const cell of cells) {
      if (cell.id === this.cell.id) continue;
      if (!predicate(cell)) continue;

      const distance = this.cell.distanceTo(cell.position);
      if (distance < minDistance && distance < this.detectionRange) {
        minDistance = distance;
        nearest = cell;
      }
    }

    return nearest;
  }

  // Wander randomly
  protected wander(): Vector2D {
    const angle = Math.random() * Math.PI * 2;
    return {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
  }

  // Check if should flee from threat
  protected shouldFlee(threat: Cell): boolean {
    const distance = this.cell.distanceTo(threat.position);
    return (
      distance < this.fleeDistance &&
      threat.traits.size > this.cell.traits.size * 1.2 &&
      threat.traits.aggression > 5
    );
  }

  getType(): BehaviorType {
    return this.type;
  }
}
