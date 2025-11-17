/**
 * Tests for MatingSystem
 * Verifies sexual reproduction and trait inheritance
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MatingSystem } from '../../src/genetics/MatingSystem';

describe('MatingSystem', () => {
  let matingSystem: MatingSystem;

  beforeEach(() => {
    matingSystem = new MatingSystem();
  });

  it('should create a mating system instance', () => {
    expect(matingSystem).toBeDefined();
  });

  it('should assign gender randomly', () => {
    const gender = matingSystem.assignGender();

    expect(gender === 'male' || gender === 'female').toBe(true);
  });

  it('should assign male and female genders over multiple calls', () => {
    const genders = new Set<string>();

    for (let i = 0; i < 100; i++) {
      genders.add(matingSystem.assignGender());
    }

    // Over 100 random assignments, we should see both genders
    expect(genders.has('male')).toBe(true);
    expect(genders.has('female')).toBe(true);
  });
});
