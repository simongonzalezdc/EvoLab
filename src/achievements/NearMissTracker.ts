// Near-miss tracking system for close calls with predators
import type { Cell } from '../entities/Cell';
import { Config } from '../core/Config';
import { logger } from '../utils/Logger';

export interface NearMiss {
  timestamp: number;
  predatorId: string;
  distance: number;
  threatLevel: number; // 0-1, how dangerous the predator was
  escaped: boolean;
}

export class NearMissTracker {
  private nearMisses: NearMiss[] = [];
  private recentEscapes: Map<string, number> = new Map(); // predatorId -> timestamp
  private readonly NEAR_MISS_DISTANCE = 50; // Within 50px is considered "close"
  private readonly ESCAPE_WINDOW = 3000; // 3 seconds to count as escape
  private readonly BONUS_DNA_PER_ESCAPE = 0.5; // Bonus DNA for narrow escapes

  // Check for near misses and award bonuses
  update(player: Cell, allCells: Cell[], deltaTime: number): {
    nearMissDetected: boolean;
    bonusDNA: number;
    totalEscapes: number;
  } {
    let nearMissDetected = false;
    let bonusDNA = 0;

    // Find all threatening predators nearby
    const currentTime = Date.now();
    const threats: { cell: Cell; distance: number; threatLevel: number }[] = [];

    allCells.forEach(cell => {
      if (cell.id === player.id || cell.isPlayer) return;

      const distance = Math.sqrt(
        Math.pow(cell.position.x - player.position.x, 2) +
        Math.pow(cell.position.y - player.position.y, 2)
      );

      // Consider as threat if aggressive and larger
      const isPredator = cell.traits.aggression > 6 && cell.traits.size > player.traits.size * 0.8;

      if (isPredator && distance < this.NEAR_MISS_DISTANCE) {
        const threatLevel = Math.min(1, (cell.traits.size / player.traits.size) * (cell.traits.aggression / 10));
        threats.push({ cell, distance, threatLevel });
        nearMissDetected = true;
      }
    });

    // Process each threat
    threats.forEach(({ cell, distance, threatLevel }) => {
      const lastEscape = this.recentEscapes.get(cell.id) || 0;
      const timeSinceLastEscape = currentTime - lastEscape;

      // If this is a new close call (not recently tracked)
      if (timeSinceLastEscape > this.ESCAPE_WINDOW) {
        // Record near miss
        this.nearMisses.push({
          timestamp: currentTime,
          predatorId: cell.id,
          distance,
          threatLevel,
          escaped: false, // Will be marked true if player survives
        });

        // Track this predator
        this.recentEscapes.set(cell.id, currentTime);

        if (Config.DEBUG_GAME_LOOP) {
          logger.log(`⚠️ NEAR MISS! Predator ${cell.id} within ${distance.toFixed(0)}px - Threat: ${(threatLevel * 100).toFixed(0)}%`);
        }
      }
    });

    // Check for successful escapes (predator moved away)
    this.recentEscapes.forEach((timestamp, predatorId) => {
      const timeSinceEscape = currentTime - timestamp;

      // If enough time has passed since the near miss
      if (timeSinceEscape > this.ESCAPE_WINDOW) {
        // Find the predator
        const predator = allCells.find(c => c.id === predatorId);

        if (predator) {
          const distance = Math.sqrt(
            Math.pow(predator.position.x - player.position.x, 2) +
            Math.pow(predator.position.y - player.position.y, 2)
          );

          // If predator is now far away, count as escape!
          if (distance > this.NEAR_MISS_DISTANCE * 2) {
            // Mark most recent near miss as escaped
            const recentMiss = this.nearMisses
              .filter(nm => nm.predatorId === predatorId && !nm.escaped)
              .sort((a, b) => b.timestamp - a.timestamp)[0];

            if (recentMiss) {
              recentMiss.escaped = true;

              // Award bonus DNA based on threat level
              const dnaBonus = this.BONUS_DNA_PER_ESCAPE * recentMiss.threatLevel;
              bonusDNA += dnaBonus;

              if (Config.DEBUG_GAME_LOOP) {
                logger.log(`🎉 NARROW ESCAPE! Bonus DNA: +${dnaBonus.toFixed(2)}`);
              }
            }
          }
        }

        // Remove from tracking
        this.recentEscapes.delete(predatorId);
      }
    });

    // Clean old near misses (keep last 100)
    if (this.nearMisses.length > 100) {
      this.nearMisses = this.nearMisses.slice(-100);
    }

    return {
      nearMissDetected,
      bonusDNA,
      totalEscapes: this.getEscapeCount(),
    };
  }

  // Get count of successful escapes
  getEscapeCount(): number {
    return this.nearMisses.filter(nm => nm.escaped).length;
  }

  // Get total near misses (including non-escapes)
  getTotalNearMisses(): number {
    return this.nearMisses.length;
  }

  // Get recent near misses
  getRecentNearMisses(count: number = 10): NearMiss[] {
    return this.nearMisses.slice(-count);
  }

  // Calculate "luck" score (escapes / total near misses)
  getLuckScore(): number {
    if (this.nearMisses.length === 0) return 0;
    return this.getEscapeCount() / this.nearMisses.length;
  }

  // Reset tracker
  reset(): void {
    this.nearMisses = [];
    this.recentEscapes.clear();
  }
}
