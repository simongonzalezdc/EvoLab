// Herbivore AI behavior - seeks resources, flees from predators

import { AIBehavior, BehaviorType } from './AIBehavior';
import { Cell } from '../entities/Cell';
import { Resource } from '../entities/Resource';
import { Config } from '../core/Config';

export class HerbivoreAI extends AIBehavior {
  private wanderCooldown = 0;
  private wanderDirection = this.wander();
  private stuckTimer = 0;
  private resourceTargetId: string | null = null;

  constructor(cell: Cell) {
    super(cell, BehaviorType.HERBIVORE);
    // Herbivores rely on strong foraging instincts—give them a long detection range
    this.detectionRange = Math.max(this.detectionRange, 800);
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
      // Don't apply background grazing - focus on fleeing!
      return;
    }

    // Priority 2: Seek food if hungry
    if (this.isHungry()) {
      const targetResource = this.getResourceTarget(nearbyResources);
      if (targetResource) {
        const distance = this.cell.distanceTo(targetResource.position);
        if (distance < Config.RESOURCE_COLLECTION_RANGE) {
          this.consumeResource(targetResource);
        } else {
          const direction = this.getDirectionTo(targetResource.position);
          this.cell.applyForce(direction, this.cell.traits.speed);
        }
        // Don't apply background grazing - focus on reaching food!
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
        // Don't apply background grazing - focus on reaching reproduction site!
        return;
      }
    }

    // Priority 4: Wander with gentle drifting so they never stagnate
    this.applyBackgroundGrazing(deltaTime, 0.8);
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

  private applyBackgroundGrazing(deltaTime: number, intensity: number): void {
    this.updateWanderDirection(deltaTime);
    const speedMagnitude = Math.hypot(this.cell.velocity.x, this.cell.velocity.y);
    if (speedMagnitude < 0.2) {
      this.stuckTimer += deltaTime;
    } else {
      this.stuckTimer = 0;
    }

    if (this.stuckTimer > 0.6) {
      this.wanderDirection = this.wander();
      this.stuckTimer = 0;
    }
    const baseForce = this.cell.traits.speed * intensity + 0.8;
    this.cell.applyForce(this.wanderDirection, baseForce);
  }

  private isHungry(): boolean {
    // Match AutoPilot's safer threshold - seek food earlier to prevent starvation
    const hungerThreshold = 0.85;
    const isHungry = this.cell.traits.atp < this.cell.traits.maxATP * hungerThreshold;
    if (!isHungry) {
      this.resourceTargetId = null;
    }
    return isHungry;
  }

  private getResourceTarget(resources: Resource[]): Resource | null {
    if (this.resourceTargetId) {
      const current = resources.find(r => r.id === this.resourceTargetId && !r.isCollected);
      if (current) {
        return current;
      }
      this.resourceTargetId = null;
    }

    let best: Resource | null = null;
    let bestDistance = Infinity;
    for (const resource of resources) {
      if (resource.isCollected) continue;
      const distance = this.cell.distanceTo(resource.position);
      if (distance < bestDistance && distance < this.detectionRange) {
        bestDistance = distance;
        best = resource;
      }
    }

    this.resourceTargetId = best?.id ?? null;
    return best;
  }

  private consumeResource(resource: Resource): void {
    if (resource.isCollected) {
      this.resourceTargetId = null;
      return;
    }

    resource.collect();
    this.resourceTargetId = null;

    switch (resource.type) {
      case 'glucose':
        // Give full ATP from glucose (not 50%)
        this.cell.restoreATP(Config.ATP_FROM_GLUCOSE);
        this.cell.collectCompound('glucose', 5);
        break;
      case 'aminoAcid':
        this.cell.collectCompound('aminoAcid', 3);
        break;
      case 'phosphate':
        this.cell.collectCompound('phosphate', 2);
        break;
    }
  }
}
