/**
 * GameStateAnnouncer - Provides real-time announcements of game state changes
 * for screen reader users to understand dynamic canvas content
 */

import { screenReaderAnnouncer } from './ScreenReaderAnnouncer';

interface AnnouncementThrottle {
  lastAnnouncement: number;
  minInterval: number;
}

export class GameStateAnnouncer {
  private static instance: GameStateAnnouncer;
  private enabled: boolean = true;
  private throttles: Map<string, AnnouncementThrottle> = new Map();

  // Track previous states to detect significant changes
  private previousPopulation: number = 0;
  private previousResources: number = 0;
  private previousGeneration: number = 1;
  private previousHealth: number = 100;
  private previousATP: number = 100;
  private lastBiome: string = '';

  private constructor() {
    // Initialize throttles for different announcement types
    this.throttles.set('resource', { lastAnnouncement: 0, minInterval: 5000 }); // 5 seconds
    this.throttles.set('population', { lastAnnouncement: 0, minInterval: 10000 }); // 10 seconds
    this.throttles.set('health', { lastAnnouncement: 0, minInterval: 3000 }); // 3 seconds
    this.throttles.set('atp', { lastAnnouncement: 0, minInterval: 3000 }); // 3 seconds
    this.throttles.set('biome', { lastAnnouncement: 0, minInterval: 5000 }); // 5 seconds
  }

  public static getInstance(): GameStateAnnouncer {
    if (!GameStateAnnouncer.instance) {
      GameStateAnnouncer.instance = new GameStateAnnouncer();
    }
    return GameStateAnnouncer.instance;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  private shouldAnnounce(type: string): boolean {
    if (!this.enabled) return false;

    const throttle = this.throttles.get(type);
    if (!throttle) return true;

    const now = Date.now();
    if (now - throttle.lastAnnouncement >= throttle.minInterval) {
      throttle.lastAnnouncement = now;
      return true;
    }
    return false;
  }

  /**
   * Announce resource collection (throttled to avoid spam)
   */
  public announceResourceCollection(resourceType: string, amount: number, totalCollected: number): void {
    // Only announce significant resource gains (> 10% increase or every 50 resources)
    const increase = totalCollected - this.previousResources;
    const isSignificant = increase >= 50 || (this.previousResources > 0 && increase / this.previousResources > 0.1);

    if (isSignificant && this.shouldAnnounce('resource')) {
      screenReaderAnnouncer.announcePolite(
        `Collected ${resourceType}. Total resources: ${totalCollected}`
      );
      this.previousResources = totalCollected;
    }
  }

  /**
   * Announce population changes (throttled)
   */
  public announcePopulationChange(newPopulation: number, oldPopulation?: number): void {
    const previous = oldPopulation ?? this.previousPopulation;
    const change = newPopulation - previous;
    const percentChange = previous > 0 ? Math.abs(change) / previous : 1;

    // Only announce if population changed by at least 20% or by 5+ cells
    const isSignificant = Math.abs(change) >= 5 || percentChange >= 0.2;

    if (isSignificant && this.shouldAnnounce('population')) {
      const direction = change > 0 ? 'increased' : 'decreased';
      screenReaderAnnouncer.announcePolite(
        `Population ${direction} to ${newPopulation} cells`
      );
      this.previousPopulation = newPopulation;
    }
  }

  /**
   * Announce critical health status
   */
  public announceHealthStatus(currentHealth: number, maxHealth: number): void {
    const healthPercent = (currentHealth / maxHealth) * 100;
    const previousPercent = (this.previousHealth / maxHealth) * 100;

    // Announce critical health levels
    if (healthPercent <= 25 && previousPercent > 25 && this.shouldAnnounce('health')) {
      screenReaderAnnouncer.announceAssertive(
        `Warning! Health critical at ${Math.round(healthPercent)}%`
      );
    } else if (healthPercent <= 50 && previousPercent > 50 && this.shouldAnnounce('health')) {
      screenReaderAnnouncer.announcePolite(
        `Health low at ${Math.round(healthPercent)}%`
      );
    }

    this.previousHealth = currentHealth;
  }

  /**
   * Announce critical ATP/energy status
   */
  public announceATPStatus(currentATP: number, maxATP: number): void {
    const atpPercent = (currentATP / maxATP) * 100;
    const previousPercent = (this.previousATP / maxATP) * 100;

    // Announce critical ATP levels
    if (atpPercent <= 25 && previousPercent > 25 && this.shouldAnnounce('atp')) {
      screenReaderAnnouncer.announceAssertive(
        `Warning! Energy critical at ${Math.round(atpPercent)}%`
      );
    } else if (atpPercent <= 50 && previousPercent > 50 && this.shouldAnnounce('atp')) {
      screenReaderAnnouncer.announcePolite(
        `Energy low at ${Math.round(atpPercent)}%`
      );
    }

    this.previousATP = currentATP;
  }

  /**
   * Announce biome transitions
   */
  public announceBiomeChange(newBiome: string, biomeName: string): void {
    if (newBiome !== this.lastBiome && this.shouldAnnounce('biome')) {
      screenReaderAnnouncer.announcePolite(
        `Entered ${biomeName} biome`
      );
      this.lastBiome = newBiome;
    }
  }

  /**
   * Announce combat events
   */
  public announceCombat(eventType: 'attacked' | 'killed' | 'escaped', targetSize?: number): void {
    if (eventType === 'attacked') {
      screenReaderAnnouncer.announceAssertive('Under attack!');
    } else if (eventType === 'killed' && targetSize) {
      screenReaderAnnouncer.announcePolite(
        `Eliminated threat. Size: ${Math.round(targetSize)}`
      );
    } else if (eventType === 'escaped') {
      screenReaderAnnouncer.announcePolite('Escaped from predator');
    }
  }

  /**
   * Announce generation advancement
   */
  public announceGenerationChange(newGeneration: number): void {
    if (newGeneration !== this.previousGeneration) {
      screenReaderAnnouncer.announcePolite(
        `Advanced to generation ${newGeneration}`
      );
      this.previousGeneration = newGeneration;
    }
  }

  /**
   * Announce environmental hazards
   */
  public announceHazard(hazardType: string, intensity: number): void {
    if (intensity > 0.5 && this.shouldAnnounce(hazardType)) {
      const severityText = intensity > 0.8 ? 'extreme' : 'high';
      screenReaderAnnouncer.announcePolite(
        `${severityText} ${hazardType} detected`
      );
    }
  }

  /**
   * Announce movement direction (for keyboard navigation)
   */
  public announceMovement(direction: 'up' | 'down' | 'left' | 'right' | 'stopped'): void {
    // Only announce on state change
    const message = direction === 'stopped'
      ? 'Movement stopped'
      : `Moving ${direction}`;

    // Use polite announcements to avoid interrupting
    screenReaderAnnouncer.announcePolite(message);
  }

  /**
   * Reset all tracked states (useful when starting new game)
   */
  public reset(): void {
    this.previousPopulation = 0;
    this.previousResources = 0;
    this.previousGeneration = 1;
    this.previousHealth = 100;
    this.previousATP = 100;
    this.lastBiome = '';

    // Reset throttles
    this.throttles.forEach(throttle => {
      throttle.lastAnnouncement = 0;
    });
  }
}

// Export singleton instance
export const gameStateAnnouncer = GameStateAnnouncer.getInstance();
