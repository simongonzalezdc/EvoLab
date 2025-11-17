/**
 * GameStateManager - Manages game state tracking
 * Extracted from GameLoop to improve modularity
 */

export interface GameState {
  // Population tracking
  maxPopulationReached: number;
  totalResourcesCollected: number;

  // Auto-save
  lastAutoSave: number;
  autoSaveInterval: number;

  // Music
  hasUnlockedMusic: boolean;

  // Lifecycle
  isRunning: boolean;
  lastTime: number;
}

export class GameStateManager {
  private state: GameState;

  constructor() {
    this.state = {
      maxPopulationReached: 0,
      totalResourcesCollected: 0,
      lastAutoSave: 0,
      autoSaveInterval: 5 * 60 * 1000, // 5 minutes default
      hasUnlockedMusic: false,
      isRunning: false,
      lastTime: 0,
    };
  }

  /**
   * Get the current game state
   */
  getState(): Readonly<GameState> {
    return this.state;
  }

  /**
   * Update max population reached
   */
  updateMaxPopulation(currentPopulation: number): void {
    if (currentPopulation > this.state.maxPopulationReached) {
      this.state.maxPopulationReached = currentPopulation;
    }
  }

  /**
   * Track resources collected
   */
  addResourcesCollected(amount: number): void {
    this.state.totalResourcesCollected += amount;
  }

  /**
   * Get max population reached
   */
  getMaxPopulation(): number {
    return this.state.maxPopulationReached;
  }

  /**
   * Get total resources collected
   */
  getTotalResourcesCollected(): number {
    return this.state.totalResourcesCollected;
  }

  /**
   * Check if auto-save is due
   */
  isAutoSaveDue(currentTime: number): boolean {
    return currentTime - this.state.lastAutoSave >= this.state.autoSaveInterval;
  }

  /**
   * Mark auto-save as completed
   */
  markAutoSaveCompleted(currentTime: number): void {
    this.state.lastAutoSave = currentTime;
  }

  /**
   * Set auto-save interval
   */
  setAutoSaveInterval(minutes: number): void {
    this.state.autoSaveInterval = minutes * 60 * 1000;
  }

  /**
   * Mark music as unlocked
   */
  unlockMusic(): void {
    this.state.hasUnlockedMusic = true;
  }

  /**
   * Check if music is unlocked
   */
  isMusicUnlocked(): boolean {
    return this.state.hasUnlockedMusic;
  }

  /**
   * Start the game loop
   */
  start(): void {
    this.state.isRunning = true;
    this.state.lastTime = performance.now();
  }

  /**
   * Stop the game loop
   */
  stop(): void {
    this.state.isRunning = false;
  }

  /**
   * Check if game is running
   */
  isRunning(): boolean {
    return this.state.isRunning;
  }

  /**
   * Update last frame time
   */
  updateLastTime(time: number): void {
    this.state.lastTime = time;
  }

  /**
   * Get last frame time
   */
  getLastTime(): number {
    return this.state.lastTime;
  }

  /**
   * Reset all state (for new game)
   */
  reset(): void {
    this.state.maxPopulationReached = 0;
    this.state.totalResourcesCollected = 0;
    this.state.lastAutoSave = 0;
    this.state.isRunning = false;
    this.state.lastTime = 0;
    // Note: hasUnlockedMusic persists across games
  }
}
