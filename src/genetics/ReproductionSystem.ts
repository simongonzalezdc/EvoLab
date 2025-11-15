// Reproduction system with requirements checking and sexual reproduction support

import type { CompoundStorage, ReproductionRequirements } from '../types/entities';
import { Genome } from './Genome';
import { MutationEngine } from './MutationEngine';
import { MatingSystem } from './MatingSystem';

export class ReproductionSystem {
  private mutationEngine: MutationEngine;
  private matingSystem: MatingSystem;
  public reproductionMode: 'asexual' | 'sexual' = 'asexual'; // Can be toggled

  constructor() {
    this.mutationEngine = new MutationEngine();
    this.matingSystem = new MatingSystem();
  }

  // Get the mating system
  getMatingSystem(): MatingSystem {
    return this.matingSystem;
  }

  // Set reproduction mode
  setReproductionMode(mode: 'asexual' | 'sexual'): void {
    this.reproductionMode = mode;
  }

  // Perform asexual reproduction (create offspring genome from single parent)
  reproduce(parentGenome: Genome, playerModifications: Partial<typeof parentGenome.traits> = {}) {
    // Clone parent genome
    const offspring = parentGenome.clone();

    // Apply player modifications if DNA budget allows
    if (Object.keys(playerModifications).length > 0) {
      const result = this.mutationEngine.applyPlayerModifications(
        offspring.traits,
        playerModifications,
        parentGenome.dnaPoints
      );

      if (result.success) {
        offspring.traits = result.newTraits;
        offspring.dnaPoints -= result.dnaSpent;
      }
    }

    // Apply automatic mutations
    const { mutatedTraits, mutations } = this.mutationEngine.mutate(offspring.traits);
    offspring.traits = mutatedTraits;
    offspring.lineage.mutations = mutations;

    // Assign gender if not already set (for transition to sexual reproduction)
    if (!offspring.traits.gender) {
      offspring.traits.gender = this.matingSystem.assignGender();
    }

    // Reset ATP and health to max for newborn
    offspring.traits.atp = offspring.traits.maxATP;
    offspring.traits.health = offspring.traits.maxHealth;

    // Reset compounds
    offspring.compounds = {
      glucose: 0,
      aminoAcids: 0,
      phosphates: 0,
    };

    return offspring;
  }

  // Calculate generation stats
  getGenerationStats(genome: Genome, survivalTime: number, resourcesCollected: number) {
    return {
      generation: genome.lineage.generation,
      survivalTime: survivalTime,
      resourcesCollected: resourcesCollected,
      mutations: genome.lineage.mutations,
      dnaPointsEarned: genome.dnaPoints,
    };
  }

  getMutationEngine(): MutationEngine {
    return this.mutationEngine;
  }
}
