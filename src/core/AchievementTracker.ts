/**
 * AchievementTracker - Manages achievement progress tracking
 * Extracted from GameLoop to improve modularity
 */

import type { AchievementSystem } from '../achievements/AchievementSystem';
import type { EntityManager } from '../entities/EntityManager';
import type { BiomeGenerator } from '../environment/BiomeGenerator';

export class AchievementTracker {
  private achievementSystem: AchievementSystem;
  private entityManager: EntityManager;
  private biomeGenerator: BiomeGenerator;

  // State tracking
  private survivalTimeTracker = 0;
  private totalKills = 0;
  private carnivoreKills = 0;
  private visitedBiomes: Set<string> = new Set();
  private totalGlucoseCollected = 0;

  constructor(
    achievementSystem: AchievementSystem,
    entityManager: EntityManager,
    biomeGenerator: BiomeGenerator
  ) {
    this.achievementSystem = achievementSystem;
    this.entityManager = entityManager;
    this.biomeGenerator = biomeGenerator;
  }

  /**
   * Update achievement tracking based on current game state
   * @param deltaTime Time elapsed since last frame (seconds)
   */
  update(deltaTime: number): void {
    const player = this.entityManager.playerCell;
    if (!player) return;

    // Track survival time
    this.survivalTimeTracker += deltaTime;
    this.achievementSystem.trackProgress('first_steps', this.survivalTimeTracker);
    this.achievementSystem.trackProgress('survivor', this.survivalTimeTracker);
    this.achievementSystem.trackProgress('endurance_master', this.survivalTimeTracker);
    this.achievementSystem.trackProgress('immortal', this.survivalTimeTracker);

    // Track generation
    const generation = player.genome.lineage.generation;
    this.achievementSystem.trackProgress('first_evolution', generation);
    this.achievementSystem.trackProgress('evolution_master', generation);
    this.achievementSystem.trackProgress('ancient_lineage', generation);

    // Track DNA points
    this.achievementSystem.trackProgress('gene_collector', player.genome.dnaPoints);

    // Track glucose collected
    this.totalGlucoseCollected = this.entityManager.glucoseCollected;
    this.achievementSystem.trackProgress('resource_collector', this.totalGlucoseCollected);
    this.achievementSystem.trackProgress('hoarder', this.totalGlucoseCollected);

    // Track biomes visited
    const currentBiome = this.biomeGenerator.getBiomeAt(player.position.x, player.position.y);
    if (!this.visitedBiomes.has(currentBiome.type)) {
      this.visitedBiomes.add(currentBiome.type);
      this.achievementSystem.trackProgress('explorer', this.visitedBiomes.size);
      this.achievementSystem.trackProgress('world_traveler', this.visitedBiomes.size);
    }

    // Track trait achievements
    this.achievementSystem.trackProgress('speed_demon', player.traits.speed);
    this.achievementSystem.trackProgress('tank_build', player.traits.armor);
    this.achievementSystem.trackProgress('giant', player.traits.size);
    this.achievementSystem.trackProgress('genius', player.traits.intelligence);

    // Track perfect specimen (5 traits at max)
    const maxTraitCount = [
      player.traits.speed,
      player.traits.armor,
      player.traits.size,
      player.traits.intelligence,
      player.traits.metabolismRate,
    ].filter(t => t >= 10).length;
    this.achievementSystem.trackProgress('perfect_specimen', maxTraitCount);

    // Track close call achievement
    const healthPercent = player.traits.health / player.traits.maxHealth;
    if (healthPercent < 0.05 && healthPercent > 0) {
      this.achievementSystem.incrementProgress('close_call', 1);
    }

    // Pacifist achievement - check if reached gen 5 with 0 kills
    if (generation >= 5 && this.totalKills === 0) {
      this.achievementSystem.trackProgress('pacifist', generation);
    }
  }

  /**
   * Track a kill made by the player
   * @param victimSize Size of the killed cell
   * @param victimType Type of the killed cell
   */
  trackKill(victimSize: number, victimType: string): void {
    this.totalKills++;
    this.achievementSystem.incrementProgress('first_kill', 1);
    this.achievementSystem.incrementProgress('predator', 1);
    this.achievementSystem.incrementProgress('apex_predator', 1);

    if (victimType === 'carnivore') {
      this.carnivoreKills++;
      this.achievementSystem.incrementProgress('carnivore_hunter', 1);
    }

    // Check underdog achievement
    const player = this.entityManager.playerCell;
    if (player && victimSize > player.traits.size * 2) {
      this.achievementSystem.incrementProgress('underdog', 1);
    }
  }

  /**
   * Reset all tracked state (for new game)
   */
  reset(): void {
    this.survivalTimeTracker = 0;
    this.totalKills = 0;
    this.carnivoreKills = 0;
    this.visitedBiomes.clear();
    this.totalGlucoseCollected = 0;
  }

  // Getters for state (useful for debugging or UI)
  getSurvivalTime(): number {
    return this.survivalTimeTracker;
  }

  getTotalKills(): number {
    return this.totalKills;
  }

  getCarnivoreKills(): number {
    return this.carnivoreKills;
  }

  getVisitedBiomesCount(): number {
    return this.visitedBiomes.size;
  }
}
