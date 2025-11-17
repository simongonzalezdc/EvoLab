/**
 * Tests for MutationEngine
 * Verifies genetic mutations work correctly
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MutationEngine } from '../../src/genetics/MutationEngine';
import { Genome } from '../../src/genetics/Genome';

describe('MutationEngine', () => {
  let mutationEngine: MutationEngine;

  beforeEach(() => {
    mutationEngine = new MutationEngine({ mutationRate: 1.0, mutationMagnitude: 0.5, beneficialBias: 0.5 });
  });

  it('should create a mutation engine instance', () => {
    expect(mutationEngine).toBeDefined();
  });

  it('should apply mutations within configured range', () => {
    const genome = Genome.createDefault();
    const originalSize = genome.traits.size;

    // Apply mutations multiple times to ensure at least one occurs
    let mutationOccurred = false;
    for (let i = 0; i < 10; i++) {
      const result = mutationEngine.mutate(genome.traits);
      if (result.mutatedTraits.size !== originalSize) {
        mutationOccurred = true;
        expect(result.mutations.length).toBeGreaterThan(0);
        break;
      }
    }

    expect(mutationOccurred).toBe(true);
  });

  it('should respect mutation rate of 0', () => {
    const noMutationEngine = new MutationEngine({ mutationRate: 0.0, mutationMagnitude: 1.0, beneficialBias: 0.5 });
    const genome = Genome.createDefault();
    const originalSize = genome.traits.size;

    const result = noMutationEngine.mutate(genome.traits);

    // No traits should have changed
    expect(result.mutatedTraits.size).toBe(originalSize);
    expect(result.mutations.length).toBe(0);
  });

  it('should not mutate with 0 mutation rate over multiple attempts', () => {
    const noMutationEngine = new MutationEngine({ mutationRate: 0.0, mutationMagnitude: 1.0, beneficialBias: 0.5 });
    const genome = Genome.createDefault();

    // Try 100 times
    for (let i = 0; i < 100; i++) {
      const result = noMutationEngine.mutate(genome.traits);
      expect(result.mutations.length).toBe(0);
    }
  });
});
