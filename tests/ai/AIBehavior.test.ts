/**
 * Tests for AIBehavior
 * Verifies AI decision-making and behavior logic
 */

import { describe, it, expect } from 'vitest';
import { BehaviorType } from '../../src/ai/AIBehavior';

describe('AIBehavior', () => {
  it('should have behavior types defined', () => {
    expect(BehaviorType.HERBIVORE).toBeDefined();
    expect(BehaviorType.CARNIVORE).toBeDefined();
    expect(BehaviorType.OMNIVORE).toBeDefined();
  });

  it('should have correct behavior type values', () => {
    expect(BehaviorType.HERBIVORE).toBe('herbivore');
    expect(BehaviorType.CARNIVORE).toBe('carnivore');
    expect(BehaviorType.OMNIVORE).toBe('omnivore');
  });
});
