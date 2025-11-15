// Omnivore AI behavior - opportunistic, eats both resources and cells

import { AIBehavior, BehaviorType } from './AIBehavior';
import { Cell } from '../entities/Cell';
import { Resource } from '../entities/Resource';

export class OmnivoreAI extends AIBehavior {
  private wanderCooldown = 0;
  private wanderDirection = this.wander();
  private opportunisticTimer = 0;

  constructor(cell: Cell) {
    super(cell, BehaviorType.OMNIVORE);
  }

  update(deltaTime: number, nearbyCells: Cell[], nearbyResources: Resource[]): void {
    // Priority 1: Flee from much larger predators
    const threat = this.findNearestCell(
      nearbyCells,
      c =>
        c.traits.aggression > 7 &&
        c.traits.size > this.cell.traits.size * 1.5 &&
        !c.isPlayer
    );

    if (threat && this.shouldFlee(threat)) {
      const fleeDirection = this.getDirectionAway(threat.position);
      this.cell.applyForce(fleeDirection, this.cell.traits.speed * 1.3);
      return;
    }

    // Priority 2: Opportunistic hunting - attack weak cells
    if (this.cell.traits.atp > this.cell.traits.maxATP * 0.4) {
      const weakPrey = this.findNearestCell(
        nearbyCells,
        c =>
          !c.isPlayer &&
          c.traits.size < this.cell.traits.size * 0.7 &&
          c.traits.health < c.traits.maxHealth * 0.5
      );

      if (weakPrey) {
        const direction = this.getDirectionTo(weakPrey.position);
        this.cell.applyForce(direction, this.cell.traits.speed * 1.2);
        return;
      }
    }

    // Priority 3: Gather resources if hungry
    if (this.cell.traits.atp < this.cell.traits.maxATP * 0.6) {
      const nearestResource = this.findNearestResource(nearbyResources);
      if (nearestResource) {
        const direction = this.getDirectionTo(nearestResource.position);
        this.cell.applyForce(direction, this.cell.traits.speed * 0.8);
        return;
      }
    }

    // Priority 4: Wander and explore
    this.wanderCooldown -= deltaTime;
    if (this.wanderCooldown <= 0) {
      this.wanderDirection = this.wander();
      this.wanderCooldown = 2 + Math.random() * 3;
    }

    this.cell.applyForce(this.wanderDirection, this.cell.traits.speed * 0.5);
  }
}
