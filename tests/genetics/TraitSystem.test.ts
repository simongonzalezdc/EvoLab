/**
 * Tests for TraitSystem
 * Verifies trait calculations and interactions
 */

import { describe, it, expect } from 'vitest';
import { TraitSystem } from '../../src/genetics/TraitSystem';
import { Genome } from '../../src/genetics/Genome';

describe('TraitSystem', () => {
  it('should calculate metabolic cost correctly', () => {
    const genome = Genome.createDefault();

    const cost = TraitSystem.calculateMetabolicCost(genome.traits);

    expect(cost).toBeGreaterThan(0);
    expect(typeof cost).toBe('number');
  });

  it('should calculate higher cost for larger size', () => {
    const small = Genome.createDefault();
    const large = Genome.createDefault();

    small.traits.size = 3;
    large.traits.size = 8;

    const smallCost = TraitSystem.calculateMetabolicCost(small.traits);
    const largeCost = TraitSystem.calculateMetabolicCost(large.traits);

    expect(largeCost).toBeGreaterThan(smallCost);
  });

  it('should calculate fitness score', () => {
    const genome = Genome.createDefault();

    const fitness = TraitSystem.calculateFitness(genome.traits);

    expect(fitness).toBeGreaterThanOrEqual(0);
    expect(typeof fitness).toBe('number');
    expect(isNaN(fitness)).toBe(false);
  });

  it('should calculate combat strength', () => {
    const genome = Genome.createDefault();

    const strength = TraitSystem.calculateCombatStrength(genome.traits);

    expect(strength).toBeGreaterThan(0);
    expect(typeof strength).toBe('number');
  });

  it('should calculate higher combat strength for aggressive cells', () => {
    const weak = Genome.createDefault();
    const strong = Genome.createDefault();

    weak.traits.aggression = 2;
    weak.traits.size = 3;

    strong.traits.aggression = 9;
    strong.traits.size = 8;

    const weakStrength = TraitSystem.calculateCombatStrength(weak.traits);
    const strongStrength = TraitSystem.calculateCombatStrength(strong.traits);

    expect(strongStrength).toBeGreaterThan(weakStrength);
  });

  it('should validate traits are within bounds', () => {
    const genome = Genome.createDefault();

    // All traits should be non-negative
    expect(genome.traits.size).toBeGreaterThanOrEqual(0);
    expect(genome.traits.speed).toBeGreaterThanOrEqual(0);
    expect(genome.traits.health).toBeGreaterThanOrEqual(0);
    expect(genome.traits.atp).toBeGreaterThanOrEqual(0);
  });
});
