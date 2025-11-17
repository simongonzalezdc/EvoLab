/**
 * Tests for Genome
 * Verifies genome creation, cloning, and trait inheritance
 */

import { describe, it, expect } from 'vitest';
import { Genome } from '../../src/genetics/Genome';

describe('Genome', () => {
  it('should create a default genome', () => {
    const genome = Genome.createDefault();

    expect(genome).toBeDefined();
    expect(genome.traits).toBeDefined();
    expect(genome.dnaPoints).toBe(0);
    expect(genome.lineage.generation).toBe(1);
  });

  it('should clone a genome correctly', () => {
    const original = Genome.createDefault();
    original.dnaPoints = 100;
    original.lineage.generation = 5;

    const clone = original.clone();

    expect(clone.dnaPoints).toBe(original.dnaPoints);
    expect(clone.lineage.generation).toBe(6); // Generation increments on clone
    expect(clone.traits.size).toBe(original.traits.size);

    // Ensure it's a deep clone
    clone.dnaPoints = 200;
    expect(original.dnaPoints).toBe(100);
  });

  it('should have valid default traits', () => {
    const genome = Genome.createDefault();
    const traits = genome.traits;

    // Check basic traits are positive
    expect(traits.size).toBeGreaterThan(0);
    expect(traits.speed).toBeGreaterThan(0);
    expect(traits.health).toBeGreaterThan(0);
    expect(traits.atp).toBeGreaterThan(0);

    // Check max values are reasonable
    expect(traits.maxHealth).toBeGreaterThanOrEqual(traits.health);
    expect(traits.maxATP).toBeGreaterThanOrEqual(traits.atp);
  });

  it('should track lineage correctly', () => {
    const genome = Genome.createDefault();

    expect(genome.lineage.generation).toBe(1);
    expect(genome.lineage.parentId).toBeNull();
    expect(genome.lineage.speciesId).toBeDefined();
  });

  it('should handle trait modifications', () => {
    const genome = Genome.createDefault();
    const originalSize = genome.traits.size;

    genome.traits.size = 8;

    expect(genome.traits.size).toBe(8);
    expect(genome.traits.size).not.toBe(originalSize);
  });
});
