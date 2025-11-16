// Combat system for predator-prey interactions

import { Cell } from './Cell';
import { Config } from '../core/Config';
import type { ParticleSystem } from '../rendering/ParticleSystem';

export class CombatSystem {
  private combatRange = 30; // Distance for combat
  private damageMultiplier = 0.5;
  private particleSystem: ParticleSystem | null = null;

  setParticleSystem(particleSystem: ParticleSystem): void {
    this.particleSystem = particleSystem;
  }

  // Check and resolve combat between cells
  checkCombat(cells: Cell[]): void {
    for (let i = 0; i < cells.length; i++) {
      for (let j = i + 1; j < cells.length; j++) {
        const cell1 = cells[i];
        const cell2 = cells[j];

        if (!cell1 || !cell2) continue;

        // Skip player vs player (shouldn't happen)
        if (cell1.isPlayer && cell2.isPlayer) continue;

        const distance = cell1.distanceTo(cell2.position);

        if (distance < this.combatRange) {
          this.resolveCombat(cell1, cell2);
        }
      }
    }
  }

  private resolveCombat(cell1: Cell, cell2: Cell): void {
    // Determine aggressor based on aggression trait
    const aggressor = cell1.traits.aggression > cell2.traits.aggression ? cell1 : cell2;
    const defender = aggressor === cell1 ? cell2 : cell1;

    // Only aggressive cells attack
    if (aggressor.traits.aggression < 5) return;

    // Calculate damage based on size, toxin strength, and armor
    const baseDamage = aggressor.traits.size * this.damageMultiplier;
    const toxinDamage = aggressor.traits.toxinStrength * Config.TOXIN_DAMAGE_MULTIPLIER;
    const totalDamage = baseDamage + toxinDamage;

    // Apply armor reduction
    const armorReduction = defender.traits.armor * Config.ARMOR_REDUCTION_PER_POINT;
    const finalDamage = Math.max(Config.MINIMUM_DAMAGE, totalDamage * (1 - armorReduction));

    // Create attack particle effect
    if (this.particleSystem) {
      const angle = Math.atan2(
        defender.position.y - aggressor.position.y,
        defender.position.x - aggressor.position.x
      );
      this.particleSystem.createAttackEffect(
        defender.position.x,
        defender.position.y,
        angle,
        0xff0000 // Red for damage
      );
    }

    // Apply damage
    defender.traits.health -= finalDamage;

    // If defender dies, aggressor gains ATP
    if (defender.traits.health <= 0) {
      defender.traits.health = 0;
      defender.traits.atp = 0;

      // Create death burst particle effect
      if (this.particleSystem) {
        this.particleSystem.createDeathBurst(
          defender.position.x,
          defender.position.y,
          defender.traits.color,
          16
        );
      }

      // Aggressor gains energy from kill
      const energyGain = defender.traits.size * Config.ENERGY_GAIN_FROM_KILL_MULTIPLIER;
      aggressor.restoreATP(energyGain);
    }

    // Aggressor loses some ATP from attacking
    aggressor.traits.atp -= finalDamage * Config.ATP_COST_OF_ATTACKING_MULTIPLIER;
  }

  // Calculate combat power for AI decision making
  calculateCombatPower(cell: Cell): number {
    return (
      cell.traits.size * Config.COMBAT_POWER_SIZE_MULTIPLIER +
      cell.traits.armor * Config.COMBAT_POWER_ARMOR_MULTIPLIER +
      cell.traits.toxinStrength * Config.COMBAT_POWER_TOXIN_MULTIPLIER +
      cell.traits.aggression * 0.5
    );
  }
}
