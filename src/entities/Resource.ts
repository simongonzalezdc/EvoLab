// Resource entities (glucose, amino acids, phosphates)

import { Graphics } from 'pixi.js';
import type { Vector2D } from '../types/entities';

export type ResourceType = 'glucose' | 'aminoAcid' | 'phosphate';

export class Resource {
  public id: string;
  public position: Vector2D;
  public type: ResourceType;
  public amount: number;
  public sprite: Graphics;
  public isCollected = false;
  public respawnTimer = 0;
  private pulseTime = 0;
  private baseScale = 1.0;

  constructor(id: string, x: number, y: number, type: ResourceType, sprite: Graphics) {
    this.id = id;
    this.position = { x, y };
    this.type = type;
    this.amount = this.getResourceAmount(type);
    this.sprite = sprite;
    this.pulseTime = Math.random() * Math.PI * 2; // Random start for variety
  }

  private getResourceAmount(type: ResourceType): number {
    switch (type) {
      case 'glucose':
        return 25; // ATP value
      case 'aminoAcid':
        return 15;
      case 'phosphate':
        return 10;
      default:
        return 10;
    }
  }

  // Mark resource as collected
  collect(): void {
    this.isCollected = true;
    this.sprite.visible = false;
  }

  // Update respawn timer and visual effects
  update(deltaTime: number, respawnTime: number): void {
    if (this.isCollected) {
      this.respawnTimer += deltaTime;

      if (this.respawnTimer >= respawnTime) {
        this.respawn();
      }
    } else {
      // Update pulsing effect when visible
      this.updateVisualEffects(deltaTime);
    }
  }

  // Update visual effects (pulse and shimmer)
  private updateVisualEffects(deltaTime: number): void {
    this.pulseTime += deltaTime * 2; // 2x speed for noticeable effect

    // Pulsing scale effect (0.9 to 1.1)
    const pulseScale = 1.0 + Math.sin(this.pulseTime) * 0.1;
    this.sprite.scale.set(pulseScale);

    // Shimmering alpha effect (0.7 to 1.0)
    const shimmerAlpha = 0.85 + Math.sin(this.pulseTime * 1.5) * 0.15;
    this.sprite.alpha = shimmerAlpha;
  }

  // Respawn resource with animation
  private respawn(): void {
    this.isCollected = false;
    this.sprite.visible = true;
    this.sprite.alpha = 0;
    this.sprite.scale.set(0.5);
    this.respawnTimer = 0;

    // Animate spawn (will be handled by update loop)
    this.animateSpawn();
  }

  // Animate resource spawn
  private animateSpawn(): void {
    const startTime = Date.now();
    const duration = 300; // ms

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      this.sprite.alpha = eased;
      this.sprite.scale.set(0.5 + eased * 0.5);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  dispose(): void {
    this.sprite.destroy();
  }
}
