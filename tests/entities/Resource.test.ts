/**
 * Tests for Resource
 * Verifies resource creation and behavior
 */

import { describe, it, expect } from 'vitest';
import { Resource } from '../../src/entities/Resource';
import { createMockGraphics, generateTestId } from '../testUtils';

describe('Resource', () => {
  it('should create a resource', () => {
    const resource = new Resource(generateTestId('resource'), 100, 200, 'glucose', createMockGraphics());

    expect(resource).toBeDefined();
    expect(resource.position.x).toBe(100);
    expect(resource.position.y).toBe(200);
    expect(resource.type).toBe('glucose');
  });

  it('should have an energy value', () => {
    const resource = new Resource(generateTestId('resource'), 0, 0, 'glucose', createMockGraphics());

    expect(resource.amount).toBeGreaterThan(0);
    expect(typeof resource.amount).toBe('number');
  });

  it('should support different resource types', () => {
    const glucose = new Resource(generateTestId('resource'), 0, 0, 'glucose', createMockGraphics());
    const aminoAcid = new Resource(generateTestId('resource'), 0, 0, 'aminoAcid', createMockGraphics());
    const phosphate = new Resource(generateTestId('resource'), 0, 0, 'phosphate', createMockGraphics());

    expect(glucose.type).toBe('glucose');
    expect(aminoAcid.type).toBe('aminoAcid');
    expect(phosphate.type).toBe('phosphate');
  });

  it('should have a unique ID', () => {
    const resource1 = new Resource(generateTestId('resource'), 0, 0, 'glucose', createMockGraphics());
    const resource2 = new Resource(generateTestId('resource'), 0, 0, 'glucose', createMockGraphics());

    expect(resource1.id).toBeDefined();
    expect(resource2.id).toBeDefined();
    expect(resource1.id).not.toBe(resource2.id);
  });

  it('should have a sprite reference', () => {
    const resource = new Resource(generateTestId('resource'), 0, 0, 'glucose', createMockGraphics());

    expect(resource.sprite).toBeDefined();
  });

  it('should be collected', () => {
    const resource = new Resource(generateTestId('resource'), 0, 0, 'glucose', createMockGraphics());

    resource.collect();

    expect(resource.isCollected).toBe(true);
  });
});
