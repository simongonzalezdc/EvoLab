/**
 * Tests for Config
 * Verifies game configuration constants
 */

import { describe, it, expect } from 'vitest';
import { Config } from '../../src/core/Config';

describe('Config', () => {
  it('should have positive entity limits', () => {
    expect(Config.HERBIVORE_POPULATION).toBeGreaterThan(0);
    expect(Config.CARNIVORE_POPULATION).toBeGreaterThan(0);
    expect(Config.OMNIVORE_POPULATION).toBeGreaterThan(0);
  });

  it('should have valid world dimensions', () => {
    expect(Config.WORLD_WIDTH).toBeGreaterThan(0);
    expect(Config.WORLD_HEIGHT).toBeGreaterThan(0);
  });

  it('should have reasonable ATP values', () => {
    expect(Config.STARTING_ATP).toBeGreaterThan(0);
    expect(Config.MAX_ATP).toBeGreaterThan(Config.STARTING_ATP);
  });

  it('should have reasonable health values', () => {
    expect(Config.STARTING_HEALTH).toBeGreaterThan(0);
    expect(Config.MAX_HEALTH).toBeGreaterThan(Config.STARTING_HEALTH);
  });

  it('should have valid DNA costs', () => {
    expect(Config.DNA_COST_PER_TRAIT_CHANGE).toBeGreaterThan(0);
    expect(Config.DNA_FROM_SURVIVAL_TIME).toBeGreaterThan(0);
  });
});
