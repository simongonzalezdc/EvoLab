// Herbivore AI behavior - seeks resources, flees from predators

import { AIBehavior, BehaviorType } from './AIBehavior';
import { Cell } from '../entities/Cell';
import { Resource } from '../entities/Resource';

export class HerbivoreAI extends AIBehavior {
  private wanderCooldown = 0;
  private wanderDirection = this.wander();
  private stuckTimer = 0;

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

    // Priority 4: Wander with gentle drifting so they never stagnate
    this.updateWanderDirection(deltaTime);
    const speedMagnitude = Math.hypot(this.cell.velocity.x, this.cell.velocity.y);
    if (speedMagnitude < 0.2) {
      this.stuckTimer += deltaTime;
    } else {
      this.stuckTimer = 0;
    }

    if (this.stuckTimer > 1.5) {
      // Completely refresh direction if we've barely moved for a while
      this.wanderDirection = this.wander();
      this.stuckTimer = 0;
    }

    this.cell.applyForce(this.wanderDirection, Math.max(1, this.cell.traits.speed * 0.6));
  }

  private updateWanderDirection(deltaTime: number): void {
    this.wanderCooldown -= deltaTime;
    if (this.wanderCooldown <= 0) {
      const target = this.wander();
      // Smoothly blend towards the new direction to avoid jitter
      this.wanderDirection = this.blendDirections(this.wanderDirection, target, 0.35);
      this.wanderCooldown = 1 + Math.random() * 2; // update every 1-3 seconds
    }
  }

  private blendDirections(current: { x: number; y: number }, target: { x: number; y: number }, factor: number) {
    const blended = {
      x: current.x * (1 - factor) + target.x * factor,
      y: current.y * (1 - factor) + target.y * factor,
    };
    const length = Math.hypot(blended.x, blended.y) || 1;
    return {
      x: blended.x / length,
      y: blended.y / length,
    };
  }
}
