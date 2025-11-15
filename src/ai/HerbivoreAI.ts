// Herbivore AI behavior - seeks resources, flees from predators

import { AIBehavior, BehaviorType } from './AIBehavior';
import { Cell } from '../entities/Cell';
import { Resource } from '../entities/Resource';

export class HerbivoreAI extends AIBehavior {
  private wanderCooldown = 0;
  private wanderDirection = this.wander();

  constructor(cell: Cell) {
    super(cell, BehaviorType.HERBIVORE);
  }

  update(deltaTime: number, nearbyCells: Cell[], nearbyResources: Resource[]): void {
    // Priority 1: Flee from predators
    const predator = this.findNearestCell(
      nearbyCells,
      c => c.traits.aggression > 6 && c.traits.size > this.cell.traits.size
    );

    if (predator && this.shouldFlee(predator)) {
      const fleeDirection = this.getDirectionAway(predator.position);
      this.cell.applyForce(fleeDirection, this.cell.traits.speed * 1.5); // Flee faster
      return;
    }

    // Priority 2: Seek food if hungry
    if (this.cell.traits.atp < this.cell.traits.maxATP * 0.6) {
      const nearestResource = this.findNearestResource(nearbyResources);
      if (nearestResource) {
        const direction = this.getDirectionTo(nearestResource.position);
        this.cell.applyForce(direction, this.cell.traits.speed);
        return;
      }
    }

    // Priority 3: Seek reproduction opportunities if ready
    if (this.cell.canReproduce()) {
      // Find safe area with good resources
      const safeResource = this.findNearestResource(nearbyResources);
      if (safeResource) {
        const direction = this.getDirectionTo(safeResource.position);
        this.cell.applyForce(direction, this.cell.traits.speed * 0.5);
        return;
      }
    }

    // Priority 4: Wander
    this.wanderCooldown -= deltaTime;
    if (this.wanderCooldown <= 0) {
      this.wanderDirection = this.wander();
      this.wanderCooldown = 2 + Math.random() * 3; // 2-5 seconds
    }

    this.cell.applyForce(this.wanderDirection, this.cell.traits.speed * 0.3);
  }
}
