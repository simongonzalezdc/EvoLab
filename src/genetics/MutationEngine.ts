// Mutation engine for applying genetic mutations

import type { Traits } from '../types/entities';
import { TraitSystem } from './TraitSystem';
import { Config } from '../core/Config';

export interface MutationConfig {
  mutationRate: number; // Probability of mutation per trait (0-1)
  mutationMagnitude: number; // How much traits can change (0-1)
  beneficialBias: number; // Bias towards beneficial mutations (0-1)
}

export class MutationEngine {
  private config: MutationConfig;

  constructor(config: Partial<MutationConfig> = {}) {
    this.config = {
      mutationRate: config.mutationRate ?? 0.15, // 15% chance per trait
      mutationMagnitude: config.mutationMagnitude ?? 0.15, // ±15% change
      beneficialBias: config.beneficialBias ?? 0.1, // 10% bias towards beneficial
    };
  }

  // Apply mutations to traits
  mutate(traits: Traits): { mutatedTraits: Traits; mutations: string[] } {
    const mutated = { ...traits };
    const mutations: string[] = [];

    // Mutate each trait with probability
    const traitKeys = Object.keys(traits) as (keyof Traits)[];

    for (const key of traitKeys) {
      // Skip non-numeric traits
      if (key === 'color' || key === 'atp' || key === 'health') continue;

      if (Math.random() < this.config.mutationRate) {
        const oldValue = mutated[key] as number;
        const isSuperMutation = Math.random() < Config.SUPER_MUTATION_CHANCE;
        const change = this.generateMutation(oldValue, key, isSuperMutation);
        const newValue = oldValue + change;

        mutated[key] = newValue as never;

        // Record mutation (with super mutation indicator)
        const direction = change > 0 ? '↑' : '↓';
        const superIndicator = isSuperMutation ? '⚡' : '';
        mutations.push(`${key} ${direction}${Math.abs(change).toFixed(2)}${superIndicator}`);
      }
    }

    // Apply trait interconnections and clamp
    const finalTraits = TraitSystem.applyInterconnections(mutated);

    return { mutatedTraits: finalTraits, mutations };
  }

  // Generate mutation value for a trait
  private generateMutation(currentValue: number, traitKey: keyof Traits, isSuperMutation: boolean = false): number {
    // Calculate base mutation
    let range = currentValue * this.config.mutationMagnitude;

    // Apply super mutation multiplier for variable rewards (dopamine boost!)
    if (isSuperMutation) {
      range *= Config.SUPER_MUTATION_MULTIPLIER;
    }

    const mutation = (Math.random() * 2 - 1) * range; // Random between -range and +range

    // Apply beneficial bias (slightly favor positive mutations)
    const biasedMutation =
      mutation + (Math.random() < this.config.beneficialBias ? range * 0.1 : 0);

    return biasedMutation;
  }

  // Apply specific player modifications (spending DNA points)
  applyPlayerModifications(
    traits: Traits,
    modifications: Partial<Traits>,
    dnaBudget: number
  ): { success: boolean; newTraits: Traits; dnaSpent: number } {
    const modified = { ...traits };
    let totalCost = 0;

    for (const [key, value] of Object.entries(modifications)) {
      if (value === undefined) continue;

      const oldValue = traits[key as keyof Traits] as number;
      const newValue = value as number;
      const diff = Math.abs(newValue - oldValue);

      // Calculate DNA cost (2 points per unit change, capped at ±2 per generation)
      if (diff > 2) {
        return { success: false, newTraits: traits, dnaSpent: 0 }; // Exceeds max change
      }

      const cost = diff * 2;
      totalCost += cost;

      if (totalCost > dnaBudget) {
        return { success: false, newTraits: traits, dnaSpent: 0 }; // Insufficient DNA
      }

      modified[key as keyof Traits] = newValue as never;
    }

    // Apply interconnections and clamp
    const finalTraits = TraitSystem.applyInterconnections(modified);

    return { success: true, newTraits: finalTraits, dnaSpent: totalCost };
  }

  // Update mutation config
  setConfig(config: Partial<MutationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): MutationConfig {
    return { ...this.config };
  }
}
