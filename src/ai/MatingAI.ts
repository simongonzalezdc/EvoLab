// AI behavior for finding mates and sexual reproduction

import type { Cell } from '../entities/Cell';
import type { Vector2D } from '../types/entities';
import { MatingSystem } from '../genetics/MatingSystem';

export interface MatingState {
  isSeekingMate: boolean;
  targetMate: Cell | null;
  displayTimer: number;
  lastMatingAttempt: number;
}

export class MatingAI {
  private matingStates: Map<string, MatingState> = new Map();
  private matingSystem: MatingSystem;

  // Constants
  private readonly MATING_COOLDOWN = 30000; // 30 seconds between mating attempts
  private readonly DISPLAY_DURATION = 3000; // 3 seconds display
  private readonly MATE_SEARCH_PROBABILITY = 0.3; // 30% chance to seek mate when ready
  private readonly APPROACH_DISTANCE = 50; // How close to get to mate
  private readonly MATE_DETECTION_RANGE = 300; // Range to detect potential mates

  constructor(matingSystem: MatingSystem) {
    this.matingSystem = matingSystem;
  }

  // Initialize mating state for a cell
  initializeMatingState(cellId: string): void {
    if (!this.matingStates.has(cellId)) {
      this.matingStates.set(cellId, {
        isSeekingMate: false,
        targetMate: null,
        displayTimer: 0,
        lastMatingAttempt: 0,
      });
    }
  }

  // Update mating behavior for a cell
  updateMatingBehavior(
    cell: Cell,
    nearbyCells: Cell[],
    deltaTime: number
  ): Vector2D | null {
    this.initializeMatingState(cell.id);
    const state = this.matingStates.get(cell.id)!;

    // Update display timer
    if (state.displayTimer > 0) {
      state.displayTimer -= deltaTime * 1000;
    }

    // Check if cell is ready to seek a mate
    const timeSinceLastAttempt = Date.now() - state.lastMatingAttempt;
    const isReadyToMate = this.isReadyToMate(cell, timeSinceLastAttempt);

    if (!isReadyToMate) {
      state.isSeekingMate = false;
      state.targetMate = null;
      return null;
    }

    // Decide whether to seek mate (with some randomness)
    if (!state.isSeekingMate && Math.random() < this.MATE_SEARCH_PROBABILITY * deltaTime) {
      state.isSeekingMate = true;
    }

    if (!state.isSeekingMate) {
      return null;
    }

    // Find or update target mate
    if (!state.targetMate || this.isTargetInvalid(cell, state.targetMate, nearbyCells)) {
      state.targetMate = this.findBestMate(cell, nearbyCells);

      if (!state.targetMate) {
        state.isSeekingMate = false;
        return null;
      }
    }

    // Perform mating display if male
    if (cell.traits.gender === 'male' && state.displayTimer <= 0) {
      this.matingSystem.performMatingDisplay(cell);
      state.displayTimer = this.DISPLAY_DURATION;
    }

    // Move towards target mate
    const distance = cell.distanceTo(state.targetMate.position);

    if (distance < this.APPROACH_DISTANCE) {
      // Close enough to attempt mating
      const success = this.attemptMating(cell, state.targetMate);

      if (success) {
        state.lastMatingAttempt = Date.now();
        state.isSeekingMate = false;
        state.targetMate = null;
      }

      return null; // Stop moving
    }

    // Calculate direction to mate
    const dx = state.targetMate.position.x - cell.position.x;
    const dy = state.targetMate.position.y - cell.position.y;
    const magnitude = Math.sqrt(dx * dx + dy * dy);

    if (magnitude > 0) {
      return {
        x: dx / magnitude,
        y: dy / magnitude,
      };
    }

    return null;
  }

  // Check if cell is ready to mate
  private isReadyToMate(cell: Cell, timeSinceLastAttempt: number): boolean {
    // Must have gender
    if (!cell.traits.gender) return false;

    // Must have enough ATP (at least 70%)
    const atpPercent = (cell.traits.atp / cell.traits.maxATP) * 100;
    if (atpPercent < 70) return false;

    // Must have enough health (at least 60%)
    const healthPercent = (cell.traits.health / cell.traits.maxHealth) * 100;
    if (healthPercent < 60) return false;

    // Must wait cooldown period
    if (timeSinceLastAttempt < this.MATING_COOLDOWN) return false;

    return true;
  }

  // Check if target mate is still valid
  private isTargetInvalid(cell: Cell, target: Cell, nearbyCells: Cell[]): boolean {
    // Target no longer in nearby cells (dead or too far)
    if (!nearbyCells.includes(target)) {
      return true;
    }

    // Target is not healthy enough
    const healthPercent = (target.traits.health / target.traits.maxHealth) * 100;
    if (healthPercent < 50) {
      return true;
    }

    // Too far away
    const distance = cell.distanceTo(target.position);
    if (distance > this.MATE_DETECTION_RANGE) {
      return true;
    }

    return false;
  }

  // Find best mate from nearby cells
  private findBestMate(cell: Cell, nearbyCells: Cell[]): Cell | null {
    const potentialMates = this.matingSystem.findPotentialMates(
      cell,
      nearbyCells,
      this.MATE_DETECTION_RANGE
    );

    if (potentialMates.length === 0) {
      return null;
    }

    // Sort by compatibility (highest first)
    const matesWithScores = potentialMates.map((mate) => ({
      mate,
      compatibility: this.matingSystem.checkCompatibility(cell, mate),
      distance: cell.distanceTo(mate.position),
    }));

    matesWithScores.sort((a, b) => {
      // Prioritize compatibility, but consider distance too
      const scoreA = a.compatibility * 10 - a.distance / 100;
      const scoreB = b.compatibility * 10 - b.distance / 100;
      return scoreB - scoreA;
    });

    return matesWithScores[0]?.mate || null;
  }

  // Attempt to mate with target
  private attemptMating(cell: Cell, target: Cell): boolean {
    // Determine which is male and which is female
    let male: Cell, female: Cell;

    if (cell.traits.gender === 'male') {
      male = cell;
      female = target;
    } else {
      male = target;
      female = cell;
    }

    // Attempt mating (this returns a genome if successful)
    const offspring = this.matingSystem.mate(female, male);

    // Success is determined by whether offspring was created
    return offspring !== null;
  }

  // Get mating state for a cell (for visualization)
  getMatingState(cellId: string): MatingState | null {
    return this.matingStates.get(cellId) || null;
  }

  // Check if cell is performing mating display
  isDisplaying(cellId: string): boolean {
    const state = this.matingStates.get(cellId);
    return state ? state.displayTimer > 0 : false;
  }

  // Clean up state for removed cells
  removeCellState(cellId: string): void {
    this.matingStates.delete(cellId);
  }

  // Get statistics
  getStats() {
    let seeking = 0;
    let displaying = 0;

    for (const state of this.matingStates.values()) {
      if (state.isSeekingMate) seeking++;
      if (state.displayTimer > 0) displaying++;
    }

    return {
      cellsSeekingMate: seeking,
      cellsDisplaying: displaying,
      totalCellsTracked: this.matingStates.size,
    };
  }
}
