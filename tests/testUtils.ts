/**
 * Test utilities for mocking PixiJS and other dependencies
 */

import { Graphics } from 'pixi.js';

/**
 * Create a mock Graphics object for testing
 * This mimics the PixiJS Graphics API without requiring a renderer
 */
export function createMockGraphics(): Graphics {
  const mockGraphics = {
    x: 0,
    y: 0,
    alpha: 1,
    visible: true,
    scale: { x: 1, y: 1, set: (_value: number) => {} },
    clear: () => mockGraphics,
    beginFill: () => mockGraphics,
    drawCircle: () => mockGraphics,
    endFill: () => mockGraphics,
    destroy: () => {},
    position: { x: 0, y: 0 },
  } as unknown as Graphics;

  return mockGraphics;
}

/**
 * Generate a unique ID for testing
 */
export function generateTestId(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
