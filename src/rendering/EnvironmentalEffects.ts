// Environmental particle effects for different biome types

import { ParticleSystem } from './ParticleSystem';
import { BiomeType } from '../environment/BiomeGenerator';

export class EnvironmentalEffects {
  private particleSystem: ParticleSystem;
  private spawnTimers: Map<string, number> = new Map();
  private spawnRates: Map<BiomeType, number> = new Map([
    [BiomeType.TOXIC, 0.1], // Spawn toxic particles frequently
    [BiomeType.VOLCANIC, 0.15], // Spawn embers frequently
    [BiomeType.FROZEN, 0.2], // Spawn snowflakes frequently
    [BiomeType.SWAMP, 0.08], // Spawn bubbles
    [BiomeType.ABYSS, 0.05], // Spawn deep particles
    [BiomeType.CRYSTAL, 0.12], // Spawn sparkles
  ]);

  constructor(particleSystem: ParticleSystem) {
    this.particleSystem = particleSystem;
  }

  // Update environmental effects for visible biomes
  update(
    deltaTime: number,
    cameraCenterX: number,
    cameraCenterY: number,
    viewWidth: number,
    viewHeight: number,
    getBiomeAt: (x: number, y: number) => { type: BiomeType }
  ): void {
    // Sample biome at camera center and a few points around it
    const samplePoints = [
      { x: cameraCenterX, y: cameraCenterY },
      { x: cameraCenterX - viewWidth / 4, y: cameraCenterY - viewHeight / 4 },
      { x: cameraCenterX + viewWidth / 4, y: cameraCenterY - viewHeight / 4 },
      { x: cameraCenterX - viewWidth / 4, y: cameraCenterY + viewHeight / 4 },
      { x: cameraCenterX + viewWidth / 4, y: cameraCenterY + viewHeight / 4 },
    ];

    samplePoints.forEach((point, index) => {
      const biome = getBiomeAt(point.x, point.y);
      const biomeKey = `${biome.type}-${index}`;

      // Get or initialize timer for this biome location
      const timer = this.spawnTimers.get(biomeKey) || 0;
      const spawnRate = this.spawnRates.get(biome.type) || 0;

      if (spawnRate > 0) {
        const newTimer = timer + deltaTime;

        if (newTimer >= spawnRate) {
          this.spawnEnvironmentalParticles(biome.type, point.x, point.y, viewWidth, viewHeight);
          this.spawnTimers.set(biomeKey, 0);
        } else {
          this.spawnTimers.set(biomeKey, newTimer);
        }
      }
    });
  }

  // Spawn particles based on biome type
  private spawnEnvironmentalParticles(
    biomeType: BiomeType,
    centerX: number,
    centerY: number,
    viewWidth: number,
    viewHeight: number
  ): void {
    // Spawn particles in random locations within view
    const count = this.getParticleCount(biomeType);

    for (let i = 0; i < count; i++) {
      const x = centerX + (Math.random() - 0.5) * viewWidth * 0.8;
      const y = centerY + (Math.random() - 0.5) * viewHeight * 0.8;

      switch (biomeType) {
        case BiomeType.TOXIC:
          this.createToxicParticle(x, y);
          break;

        case BiomeType.VOLCANIC:
          this.createVolcanicEmber(x, y);
          break;

        case BiomeType.FROZEN:
          this.createSnowflake(x, y);
          break;

        case BiomeType.SWAMP:
          this.createSwampBubble(x, y);
          break;

        case BiomeType.ABYSS:
          this.createAbyssParticle(x, y);
          break;

        case BiomeType.CRYSTAL:
          this.createCrystalSparkle(x, y);
          break;
      }
    }
  }

  private getParticleCount(biomeType: BiomeType): number {
    switch (biomeType) {
      case BiomeType.TOXIC:
      case BiomeType.VOLCANIC:
        return 3;
      case BiomeType.FROZEN:
        return 5;
      case BiomeType.SWAMP:
        return 2;
      case BiomeType.ABYSS:
        return 1;
      case BiomeType.CRYSTAL:
        return 4;
      default:
        return 0;
    }
  }

  // Toxic mist particles
  private createToxicParticle(x: number, y: number): void {
    const vx = (Math.random() - 0.5) * 10;
    const vy = -5 - Math.random() * 10; // Float upward
    this.particleSystem.createEnvironmentalParticle(
      x,
      y,
      vx,
      vy,
      0x9c27b0, // Purple
      2 + Math.random() * 3,
      2 + Math.random() * 2
    );
  }

  // Volcanic embers
  private createVolcanicEmber(x: number, y: number): void {
    const vx = (Math.random() - 0.5) * 20;
    const vy = -20 - Math.random() * 30; // Rise quickly
    this.particleSystem.createEnvironmentalParticle(
      x,
      y,
      vx,
      vy,
      0xff6600, // Orange-red
      1.5 + Math.random() * 2,
      1.5 + Math.random() * 1.5
    );
  }

  // Snowflakes
  private createSnowflake(x: number, y: number): void {
    const vx = (Math.random() - 0.5) * 5;
    const vy = 10 + Math.random() * 15; // Fall down
    this.particleSystem.createEnvironmentalParticle(
      x,
      y,
      vx,
      vy,
      0xffffff, // White
      1 + Math.random() * 2,
      3 + Math.random() * 2
    );
  }

  // Swamp bubbles
  private createSwampBubble(x: number, y: number): void {
    const vx = (Math.random() - 0.5) * 3;
    const vy = -15 - Math.random() * 10; // Rise
    this.particleSystem.createEnvironmentalParticle(
      x,
      y,
      vx,
      vy,
      0x8bc34a, // Muddy green
      2 + Math.random() * 3,
      2 + Math.random() * 1.5
    );
  }

  // Abyss particles (bioluminescence)
  private createAbyssParticle(x: number, y: number): void {
    const vx = (Math.random() - 0.5) * 8;
    const vy = (Math.random() - 0.5) * 8;
    this.particleSystem.createEnvironmentalParticle(
      x,
      y,
      vx,
      vy,
      0x00ffff, // Cyan glow
      1 + Math.random() * 1.5,
      3 + Math.random() * 3
    );
  }

  // Crystal sparkles
  private createCrystalSparkle(x: number, y: number): void {
    const vx = (Math.random() - 0.5) * 15;
    const vy = (Math.random() - 0.5) * 15;
    this.particleSystem.createEnvironmentalParticle(
      x,
      y,
      vx,
      vy,
      0xffffff, // White sparkle
      1 + Math.random(),
      0.5 + Math.random() * 0.5
    );
  }

  // Clear all timers
  clear(): void {
    this.spawnTimers.clear();
  }
}
