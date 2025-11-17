/**
 * Tests for GameStateManager
 * Verifies game state tracking and management
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GameStateManager } from '../../src/core/GameStateManager';

describe('GameStateManager', () => {
  let stateManager: GameStateManager;

  beforeEach(() => {
    stateManager = new GameStateManager();
  });

  it('should create a game state manager', () => {
    expect(stateManager).toBeDefined();
  });

  it('should initialize with default state', () => {
    const state = stateManager.getState();

    expect(state.maxPopulationReached).toBe(0);
    expect(state.totalResourcesCollected).toBe(0);
    expect(state.isRunning).toBe(false);
    expect(state.hasUnlockedMusic).toBe(false);
  });

  it('should track max population', () => {
    stateManager.updateMaxPopulation(50);
    expect(stateManager.getMaxPopulation()).toBe(50);

    stateManager.updateMaxPopulation(30); // Lower than max
    expect(stateManager.getMaxPopulation()).toBe(50); // Should stay at 50

    stateManager.updateMaxPopulation(75); // Higher than max
    expect(stateManager.getMaxPopulation()).toBe(75); // Should update
  });

  it('should track resources collected', () => {
    expect(stateManager.getTotalResourcesCollected()).toBe(0);

    stateManager.addResourcesCollected(10);
    expect(stateManager.getTotalResourcesCollected()).toBe(10);

    stateManager.addResourcesCollected(5);
    expect(stateManager.getTotalResourcesCollected()).toBe(15);
  });

  it('should manage running state', () => {
    expect(stateManager.isRunning()).toBe(false);

    stateManager.start();
    expect(stateManager.isRunning()).toBe(true);

    stateManager.stop();
    expect(stateManager.isRunning()).toBe(false);
  });

  it('should track auto-save timing', () => {
    stateManager.setAutoSaveInterval(1); // 1 minute

    const now = Date.now();
    stateManager.markAutoSaveCompleted(now);

    const justAfter = now + 30000; // 30 seconds later
    expect(stateManager.isAutoSaveDue(justAfter)).toBe(false);

    const muchLater = now + 70000; // 70 seconds later
    expect(stateManager.isAutoSaveDue(muchLater)).toBe(true);
  });

  it('should handle music unlock state', () => {
    expect(stateManager.isMusicUnlocked()).toBe(false);

    stateManager.unlockMusic();
    expect(stateManager.isMusicUnlocked()).toBe(true);
  });

  it('should reset state correctly', () => {
    stateManager.updateMaxPopulation(100);
    stateManager.addResourcesCollected(50);
    stateManager.start();

    stateManager.reset();

    expect(stateManager.getMaxPopulation()).toBe(0);
    expect(stateManager.getTotalResourcesCollected()).toBe(0);
    expect(stateManager.isRunning()).toBe(false);
  });

  it('should persist music unlock across resets', () => {
    stateManager.unlockMusic();
    stateManager.reset();

    // Music should still be unlocked after reset
    expect(stateManager.isMusicUnlocked()).toBe(true);
  });
});
