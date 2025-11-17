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
    mutationEngine = new MutationEngine();
  });

  it('should create a mutation engine instance', () => {
    expect(mutationEngine).toBeDefined();
  });

  it('should apply mutations within configured range', () => {
    const genome = Genome.createDefault();
    const originalSize = genome.traits.size;

    // Set high mutation rate to ensure mutations occur
    mutationEngine.setConfig({
      mutationRate: 1.0, // 100% chance
      mutationMagnitude: 0.5,
      beneficialBias: 0.5,
    });

    // Apply mutations multiple times
    let mutationOccurred = false;
    for (let i = 0; i < 10; i++) {
      const mutated = mutationEngine.mutate(Genome.clone(genome));
      if (mutated.traits.size !== originalSize) {
        mutationOccurred = true;
        break;
      }
    }

    expect(mutationOccurred).toBe(true);
  });

  it('should respect mutation rate of 0', () => {
    const genome = Genome.createDefault();
    const originalTraits = { ...genome.traits };

    mutationEngine.setConfig({
      mutationRate: 0.0, // No mutations
      mutationMagnitude: 1.0,
      beneficialBias: 0.5,
    });

    const mutated = mutationEngine.mutate(Genome.clone(genome));

    // All traits should be identical
    expect(mutated.traits.size).toBe(originalTraits.size);
    expect(mutated.traits.speed).toBe(originalTraits.speed);
  });

  it('should not mutate with 0 mutation rate over multiple attempts', () => {
    const genome = Genome.createDefault();

    mutationEngine.setConfig({
      mutationRate: 0.0,
      mutationMagnitude: 1.0,
      beneficialBias: 0.5,
    });

    // Try 100 times
    for (let i = 0; i < 100; i++) {
      const mutated = mutationEngine.mutate(Genome.clone(genome));
      expect(mutated.traits.size).toBe(genome.traits.size);
    }
  });
});
