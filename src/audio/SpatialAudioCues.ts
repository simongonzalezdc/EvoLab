/**
 * SpatialAudioCues - Provides spatial audio feedback for navigation
 * Helps users understand their environment through directional sound cues
 */

import { SoundManager } from './SoundManager';

type Direction = 'left' | 'right' | 'front' | 'back';
type ResourceType = 'glucose' | 'amino' | 'phosphate';

export interface AudioCueConfig {
  enabled: boolean;
  volume: number; // 0-1
  minDistance: number; // Distance at which sound is at full volume
  maxDistance: number; // Distance at which sound fades to zero
}

export class SpatialAudioCues {
  private static instance: SpatialAudioCues;
  private soundManager: SoundManager | null = null;
  private config: AudioCueConfig;
  private lastThreatCue: number = 0;
  private lastResourceCue: number = 0;
  private lastBoundary: number = 0;

  private readonly THREAT_CUE_INTERVAL = 3000; // 3 seconds
  private readonly RESOURCE_CUE_INTERVAL = 5000; // 5 seconds
  private readonly BOUNDARY_CUE_INTERVAL = 2000; // 2 seconds

  private constructor() {
    this.config = {
      enabled: false, // Disabled by default
      volume: 0.5,
      minDistance: 50,
      maxDistance: 300,
    };
  }

  public static getInstance(): SpatialAudioCues {
    if (!SpatialAudioCues.instance) {
      SpatialAudioCues.instance = new SpatialAudioCues();
    }
    return SpatialAudioCues.instance;
  }

  public setSoundManager(soundManager: SoundManager): void {
    this.soundManager = soundManager;
  }

  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  public setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume));
  }

  public configure(config: Partial<AudioCueConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Calculate volume based on distance (inverse square law)
   */
  private calculateVolume(distance: number): number {
    if (distance < this.config.minDistance) {
      return this.config.volume;
    }
    if (distance > this.config.maxDistance) {
      return 0;
    }

    // Inverse square falloff
    const normalizedDistance = (distance - this.config.minDistance) /
                               (this.config.maxDistance - this.config.minDistance);
    const volume = this.config.volume * (1 - normalizedDistance * normalizedDistance);
    return Math.max(0, volume);
  }

  /**
   * Play threat proximity cue
   * Higher pitch = closer threat
   */
  public playThreatCue(distance: number, direction: Direction): void {
    if (!this.config.enabled || !this.soundManager) return;

    const now = Date.now();
    if (now - this.lastThreatCue < this.THREAT_CUE_INTERVAL) return;

    const volume = this.calculateVolume(distance);
    if (volume <= 0) return;

    // Play warning sound with volume based on distance
    // In a real implementation, you'd want different sounds for different directions
    this.soundManager.play('damage', volume);
    this.lastThreatCue = now;
  }

  /**
   * Play resource proximity cue
   * Different sounds for different resource types
   */
  public playResourceCue(
    distance: number,
    resourceType: ResourceType,
    direction: Direction
  ): void {
    if (!this.config.enabled || !this.soundManager) return;

    const now = Date.now();
    if (now - this.lastResourceCue < this.RESOURCE_CUE_INTERVAL) return;

    const volume = this.calculateVolume(distance);
    if (volume <= 0) return;

    // Play appropriate sound for resource type
    // In a full implementation, you'd want different sounds for each type
    this.soundManager.play('pickup', volume * 0.7); // Slightly quieter than threats
    this.lastResourceCue = now;
  }

  /**
   * Play boundary warning cue
   * Warns when approaching world boundaries
   */
  public playBoundaryCue(distanceToBoundary: number): void {
    if (!this.config.enabled || !this.soundManager) return;

    const now = Date.now();
    if (now - this.lastBoundary < this.BOUNDARY_CUE_INTERVAL) return;

    // Only play if getting close to boundary (within 200 units)
    if (distanceToBoundary < 200) {
      const volume = this.calculateVolume(distanceToBoundary) * 0.5;
      if (volume > 0) {
        // Play a subtle warning sound
        this.soundManager.play('damage', volume * 0.3);
        this.lastBoundary = now;
      }
    }
  }

  /**
   * Play biome transition cue
   */
  public playBiomeTransitionCue(newBiomeType: string): void {
    if (!this.config.enabled || !this.soundManager) return;

    // Play a subtle sound to indicate biome change
    // Different biomes could have different sounds
    this.soundManager.play('pickup', 0.4);
  }

  /**
   * Play combat engagement cue
   */
  public playCombatEngagementCue(intensity: number): void {
    if (!this.config.enabled || !this.soundManager) return;

    const volume = Math.min(0.8, intensity) * this.config.volume;
    this.soundManager.play('damage', volume);
  }

  /**
   * Play success/achievement cue
   */
  public playSuccessCue(): void {
    if (!this.config.enabled || !this.soundManager) return;

    this.soundManager.play('victory', this.config.volume * 0.8);
  }

  /**
   * Update spatial audio based on game state
   * Should be called from game loop
   */
  public update(
    playerX: number,
    playerY: number,
    nearbyThreats: Array<{ x: number; y: number; size: number }>,
    nearbyResources: Array<{ x: number; y: number; type: ResourceType }>,
    worldBounds: { minX: number; maxX: number; minY: number; maxY: number }
  ): void {
    if (!this.config.enabled) return;

    // Find closest threat
    let closestThreat: { distance: number; direction: Direction } | null = null;
    for (const threat of nearbyThreats) {
      const dx = threat.x - playerX;
      const dy = threat.y - playerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (!closestThreat || distance < closestThreat.distance) {
        // Determine direction
        const angle = Math.atan2(dy, dx);
        let direction: Direction;
        if (Math.abs(angle) < Math.PI / 4) direction = 'right';
        else if (Math.abs(angle) > (3 * Math.PI) / 4) direction = 'left';
        else if (angle > 0) direction = 'back';
        else direction = 'front';

        closestThreat = { distance, direction };
      }
    }

    if (closestThreat) {
      this.playThreatCue(closestThreat.distance, closestThreat.direction);
    }

    // Find closest resource
    let closestResource: {
      distance: number;
      direction: Direction;
      type: ResourceType;
    } | null = null;
    for (const resource of nearbyResources) {
      const dx = resource.x - playerX;
      const dy = resource.y - playerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (!closestResource || distance < closestResource.distance) {
        const angle = Math.atan2(dy, dx);
        let direction: Direction;
        if (Math.abs(angle) < Math.PI / 4) direction = 'right';
        else if (Math.abs(angle) > (3 * Math.PI) / 4) direction = 'left';
        else if (angle > 0) direction = 'back';
        else direction = 'front';

        closestResource = { distance, direction, type: resource.type };
      }
    }

    if (closestResource) {
      this.playResourceCue(closestResource.distance, closestResource.type, closestResource.direction);
    }

    // Check distance to boundaries
    const distToLeft = playerX - worldBounds.minX;
    const distToRight = worldBounds.maxX - playerX;
    const distToTop = playerY - worldBounds.minY;
    const distToBottom = worldBounds.maxY - playerY;
    const minBoundaryDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);

    this.playBoundaryCue(minBoundaryDist);
  }

  /**
   * Reset all timers (useful when starting new game)
   */
  public reset(): void {
    this.lastThreatCue = 0;
    this.lastResourceCue = 0;
    this.lastBoundary = 0;
  }
}

// Export singleton instance
export const spatialAudioCues = SpatialAudioCues.getInstance();
