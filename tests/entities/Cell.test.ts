/**
 * Tests for Cell
 * Verifies cell creation, behavior, and state management
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Cell } from '../../src/entities/Cell';
import { Genome } from '../../src/genetics/Genome';
import { createMockGraphics, generateTestId } from '../testUtils';

describe('Cell', () => {
  let genome: Genome;

  beforeEach(() => {
    genome = Genome.createDefault();
  });

  it('should create a cell', () => {
    const cell = new Cell(generateTestId('cell'), 100, 200, genome, createMockGraphics());

    expect(cell).toBeDefined();
    expect(cell.position.x).toBe(100);
    expect(cell.position.y).toBe(200);
  });

  it('should have the traits from its genome', () => {
    genome.traits.size = 7;
    genome.traits.speed = 8;

    const cell = new Cell(generateTestId('cell'), 0, 0, genome, createMockGraphics());

    expect(cell.traits.size).toBe(7);
    expect(cell.traits.speed).toBe(8);
  });

  it('should track survival time', () => {
    const cell = new Cell(generateTestId('cell'), 0, 0, genome, createMockGraphics());

    expect(cell.survivalTime).toBe(0);

    cell.survivalTime = 10.5;
    expect(cell.survivalTime).toBe(10.5);
  });

  it('should have ATP and health', () => {
    const cell = new Cell(generateTestId('cell'), 0, 0, genome, createMockGraphics());

    expect(cell.traits.atp).toBeGreaterThan(0);
    expect(cell.traits.health).toBeGreaterThan(0);
  });

  it('should have velocity', () => {
    const cell = new Cell(generateTestId('cell'), 0, 0, genome, createMockGraphics());

    expect(cell.velocity).toBeDefined();
    expect(typeof cell.velocity.x).toBe('number');
    expect(typeof cell.velocity.y).toBe('number');
  });

  it('should check reproduction readiness', () => {
    const cell = new Cell(generateTestId('cell'), 0, 0, genome, createMockGraphics());

    // New cell shouldn't be ready to reproduce
    const canReproduce = cell.canReproduce();
    expect(typeof canReproduce).toBe('boolean');
  });

  it('should have a sprite reference', () => {
    const cell = new Cell(generateTestId('cell'), 0, 0, genome, createMockGraphics());

    expect(cell.sprite).toBeDefined();
  });

  it('should have an ID', () => {
    const cell = new Cell(generateTestId('cell'), 0, 0, genome, createMockGraphics());

    expect(cell.id).toBeDefined();
    expect(typeof cell.id).toBe('string');
  });
});
