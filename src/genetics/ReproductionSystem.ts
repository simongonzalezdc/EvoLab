// Reproduction system with requirements checking

import type { CompoundStorage, ReproductionRequirements } from '../types/entities';
import { Genome } from './Genome';
import { MutationEngine } from './MutationEngine';

export class ReproductionSystem {
  private mutationEngine: MutationEngine;
  private lastReproductionTime = 0;

  constructor() {
    this.mutationEngine = new MutationEngine();
  }

  // Check if reproduction requirements are met
  canReproduce(
    genome: Genome,
    compounds: CompoundStorage,
    currentTime: number
  ): { canReproduce: boolean; reason?: string } {
    // ATP threshold check (70% of max)
    const atpPercent = (genome.traits.atp / genome.traits.maxATP) * 100;
    if (atpPercent < 70) {
      return { canReproduce: false, reason: 'ATP below 70%' };
    }

    // Compound reserve check
    if (
      compounds.glucose < 50 ||
      compounds.aminoAcids < 30 ||
      compounds.phosphates < 20
    ) {
      return {
        canReproduce: false,
        reason: `Insufficient compounds (need: 50G, 30A, 20P)`,
      };
    }

    // Maturity timer check (60 seconds since last reproduction)
    const timeSinceLastReproduction = (currentTime - this.lastReproductionTime) / 1000;
    if (timeSinceLastReproduction < 60) {
      return {
        canReproduce: false,
        reason: `Need ${Math.ceil(60 - timeSinceLastReproduction)}s more maturity`,
      };
    }

    return { canReproduce: true };
  }

  // Perform reproduction (create offspring genome)
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

    // Reset ATP and health to max for newborn
    offspring.traits.atp = offspring.traits.maxATP;
    offspring.traits.health = offspring.traits.maxHealth;

    // Reset compounds
    offspring.compounds = {
      glucose: 0,
      aminoAcids: 0,
      phosphates: 0,
    };

    // Update last reproduction time
    this.lastReproductionTime = Date.now();

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
