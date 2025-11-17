/**
 * Tests for Config
 * Verifies game configuration constants
 */

import { describe, it, expect } from 'vitest';
import { Config } from '../../src/core/Config';

describe('Config', () => {
  it('should have valid lake dimensions', () => {
    expect(Config.LAKE_WIDTH).toBeGreaterThan(0);
    expect(Config.LAKE_HEIGHT).toBeGreaterThan(0);
  });

  it('should have reasonable ATP values', () => {
    expect(Config.START_ATP).toBeGreaterThan(0);
    expect(Config.MAX_ATP).toBeGreaterThanOrEqual(Config.START_ATP);
  });

  it('should have valid DNA costs', () => {
    expect(Config.DNA_COST_PER_TRAIT_CHANGE).toBeGreaterThan(0);
    expect(Config.DNA_FROM_SURVIVAL_TIME).toBeGreaterThan(0);
    expect(Config.DNA_FROM_GLUCOSE).toBeGreaterThan(0);
  });

  it('should have valid resource settings', () => {
    expect(Config.GLUCOSE_COUNT).toBeGreaterThan(0);
    expect(Config.GLUCOSE_RADIUS).toBeGreaterThan(0);
    expect(Config.RESOURCE_COLLECTION_RANGE).toBeGreaterThan(0);
  });

  it('should have valid combat settings', () => {
    expect(Config.TOXIN_DAMAGE_MULTIPLIER).toBeGreaterThan(0);
    expect(Config.ARMOR_REDUCTION_PER_POINT).toBeGreaterThan(0);
    expect(Config.MINIMUM_DAMAGE).toBeGreaterThan(0);
  });
});
