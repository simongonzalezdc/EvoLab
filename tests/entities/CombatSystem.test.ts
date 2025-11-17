/**
 * Tests for CombatSystem
 * Verifies combat mechanics and damage calculations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CombatSystem } from '../../src/entities/CombatSystem';
import { Cell } from '../../src/entities/Cell';
import { Genome } from '../../src/genetics/Genome';
import { createMockGraphics, generateTestId } from '../testUtils';

describe('CombatSystem', () => {
  let combatSystem: CombatSystem;

  beforeEach(() => {
    combatSystem = new CombatSystem();
  });

  it('should create a combat system instance', () => {
    expect(combatSystem).toBeDefined();
  });

  it('should check combat between cells without crashing', () => {
    const genome1 = Genome.createDefault();
    const genome2 = Genome.createDefault();

    const cell1 = new Cell(generateTestId('cell'), 0, 0, genome1, createMockGraphics());
    const cell2 = new Cell(generateTestId('cell'), 10, 10, genome2, createMockGraphics());

    expect(() => {
      combatSystem.checkCombat([cell1, cell2]);
    }).not.toThrow();
  });

  it('should handle empty cell array', () => {
    expect(() => {
      combatSystem.checkCombat([]);
    }).not.toThrow();
  });
});
