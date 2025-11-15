// Carnivore AI behavior - hunts other cells with pack behavior

import { AIBehavior, BehaviorType } from './AIBehavior';
import { Cell } from '../entities/Cell';
import { Resource } from '../entities/Resource';
import type { AdvancedAISystem } from './AdvancedAI';

export class CarnivoreAI extends AIBehavior {
  private huntCooldown = 0;
  public currentTarget: Cell | null = null; // Made public for pack coordination
  private wanderDirection = this.wander();
  private wanderCooldown = 0;
  public advancedAI: AdvancedAISystem | null = null;

  constructor(cell: Cell) {
    super(cell, BehaviorType.CARNIVORE);
  }

  setAdvancedAI(ai: AdvancedAISystem): void {
    this.advancedAI = ai;
  }

  update(deltaTime: number, nearbyCells: Cell[], nearbyResources: Resource[]): void {
    // Try to form pack if not in one (carnivores hunt better in packs)
    if (this.advancedAI && Math.random() < 0.01) { // 1% chance per frame
      this.advancedAI.formPack(this.cell, nearbyCells);
    }

    // Priority 0: Use pack behavior if in a pack
    if (this.advancedAI) {
      const packBehavior = this.advancedAI.getPackBehavior(this.cell.id, nearbyCells);
      if (packBehavior) {
        // Blend pack cohesion with hunting behavior

        // If pack leader, coordinate hunt
        if (this.advancedAI.isPackLeader(this.cell.id)) {
          const prey = this.findPrey(nearbyCells);
          if (prey) {
            this.currentTarget = prey;
            const huntDirection = this.getDirectionTo(prey.position);

            // Mix pack cohesion with hunt direction (70% hunt, 30% pack)
            this.cell.applyForce({
              x: huntDirection.x * 0.7 + packBehavior.x * 0.3,
              y: huntDirection.y * 0.7 + packBehavior.y * 0.3,
            }, this.cell.traits.speed * 1.2);
            return;
          }
        } else {
          // Follow pack leader's hunt
          const packMembers = this.advancedAI.getPackMembers(this.cell.id, nearbyCells);
          const leader = packMembers.find(m => this.advancedAI?.isPackLeader(m.id));

          if (leader) {
            // Move toward leader
            const leaderDirection = this.getDirectionTo(leader.position);
            this.cell.applyForce({
              x: leaderDirection.x * 0.6 + packBehavior.x * 0.4,
              y: leaderDirection.y * 0.6 + packBehavior.y * 0.4,
            }, this.cell.traits.speed);
            return;
          }
        }

        // No active hunt, maintain pack formation
        this.cell.applyForce(packBehavior, this.cell.traits.speed * 0.6);
        return; // Don't proceed to individual hunting if in pack
      }
    }

    // Priority 1: Hunt prey (individual hunting)
    if (this.cell.traits.atp < this.cell.traits.maxATP * 0.8) {
      const prey = this.findPrey(nearbyCells);

      if (prey) {
        this.currentTarget = prey;
        this.huntCooldown = 5; // Chase for 5 seconds

        const direction = this.getDirectionTo(prey.position);
        const distance = this.cell.distanceTo(prey.position);

        // Speed burst if close
        const speedMultiplier = distance < 100 ? 1.5 : 1.0;

        // Apply learning - if AI should avoid player, reduce aggression
        let finalSpeed = this.cell.traits.speed * speedMultiplier;
        if (this.advancedAI && prey.isPlayer && this.advancedAI.shouldAvoidPlayer(this.cell.id)) {
          finalSpeed *= 0.5; // Much more cautious
        }

        this.cell.applyForce(direction, finalSpeed);
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
