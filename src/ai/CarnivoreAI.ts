// Carnivore AI behavior - hunts other cells

import { AIBehavior, BehaviorType } from './AIBehavior';
import { Cell } from '../entities/Cell';
import { Resource } from '../entities/Resource';

export class CarnivoreAI extends AIBehavior {
  private huntCooldown = 0;
  private currentTarget: Cell | null = null;
  private wanderDirection = this.wander();
  private wanderCooldown = 0;

  constructor(cell: Cell) {
    super(cell, BehaviorType.CARNIVORE);
  }

  update(deltaTime: number, nearbyCells: Cell[], nearbyResources: Resource[]): void {
    // Priority 1: Hunt prey
    if (this.cell.traits.atp < this.cell.traits.maxATP * 0.8) {
      const prey = this.findPrey(nearbyCells);

      if (prey) {
        this.currentTarget = prey;
        this.huntCooldown = 5; // Chase for 5 seconds

        const direction = this.getDirectionTo(prey.position);
        const distance = this.cell.distanceTo(prey.position);

        // Speed burst if close
        const speedMultiplier = distance < 100 ? 1.5 : 1.0;
        this.cell.applyForce(direction, this.cell.traits.speed * speedMultiplier);
        return;
      }
    }

    // Priority 2: Continue chasing current target
    if (this.currentTarget && this.huntCooldown > 0) {
      this.huntCooldown -= deltaTime;

      const direction = this.getDirectionTo(this.currentTarget.position);
      this.cell.applyForce(direction, this.cell.traits.speed);
      return;
    }

    this.currentTarget = null;

    // Priority 3: Patrol/wander
    this.wanderCooldown -= deltaTime;
    if (this.wanderCooldown <= 0) {
      this.wanderDirection = this.wander();
      this.wanderCooldown = 3 + Math.random() * 4; // 3-7 seconds
    }

    this.cell.applyForce(this.wanderDirection, this.cell.traits.speed * 0.4);
  }

  private findPrey(cells: Cell[]): Cell | null {
    return this.findNearestCell(cells, c => {
      // Hunt cells smaller than self or similar size if very aggressive
      const sizeRatio = c.traits.size / this.cell.traits.size;
      const isWeaker = sizeRatio < 0.8;
      const isSimilarSize = sizeRatio >= 0.8 && sizeRatio <= 1.2;
      const isVeryAggressive = this.cell.traits.aggression > 8;

      return (
        !c.isPlayer && // Don't auto-hunt player (for now)
        (isWeaker || (isSimilarSize && isVeryAggressive))
      );
    });
  }
}
