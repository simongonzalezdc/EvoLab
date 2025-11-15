// Cell entity representing a single-celled organism

import { Graphics } from 'pixi.js';
import type { Vector2D, Traits } from '../types/entities';
import { Config } from '../core/Config';

export class Cell {
  public id: string;
  public position: Vector2D;
  public velocity: Vector2D;
  public traits: Traits;
  public sprite: Graphics;
  public isPlayer: boolean;

  constructor(
    id: string,
    x: number,
    y: number,
    traits: Traits,
    sprite: Graphics,
    isPlayer = false
  ) {
    this.id = id;
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.traits = traits;
    this.sprite = sprite;
    this.isPlayer = isPlayer;
  }

  // Update cell state each frame
  update(deltaTime: number): void {
    // Update position based on velocity
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Apply friction
    this.velocity.x *= Config.FRICTION;
    this.velocity.y *= Config.FRICTION;

    // Update sprite position
    this.sprite.x = this.position.x;
    this.sprite.y = this.position.y;

    // Drain ATP over time
    this.drainATP(deltaTime);

    // Boundary check (keep within lake)
    this.constrainToLake();
  }

  // Apply movement force (for player input)
  applyForce(direction: Vector2D, speed: number): void {
    this.velocity.x += direction.x * speed;
    this.velocity.y += direction.y * speed;

    // Cap maximum velocity
    const magnitude = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
    if (magnitude > Config.MAX_VELOCITY) {
      this.velocity.x = (this.velocity.x / magnitude) * Config.MAX_VELOCITY;
      this.velocity.y = (this.velocity.y / magnitude) * Config.MAX_VELOCITY;
    }
  }

  // Drain ATP based on metabolism and size
  private drainATP(_deltaTime: number): void {
    const baseDrain = Config.ATP_DRAIN_RATE;
    const sizeDrain = this.traits.size * Config.ATP_DRAIN_MULTIPLIER_SIZE;
    const totalDrain = (baseDrain + sizeDrain) * this.traits.metabolismRate;

    this.traits.atp -= totalDrain;

    // Clamp ATP to valid range
    if (this.traits.atp < 0) {
      this.traits.atp = 0;
      this.onDeath();
    }
    if (this.traits.atp > this.traits.maxATP) {
      this.traits.atp = this.traits.maxATP;
    }
  }

  // Restore ATP (from glucose collection)
  restoreATP(amount: number): void {
    this.traits.atp += amount;
    if (this.traits.atp > this.traits.maxATP) {
      this.traits.atp = this.traits.maxATP;
    }
  }

  // Keep cell within lake boundaries
  private constrainToLake(): void {
    const halfWidth = Config.LAKE_WIDTH / 2;
    const halfHeight = Config.LAKE_HEIGHT / 2;

    if (this.position.x < -halfWidth) this.position.x = -halfWidth;
    if (this.position.x > halfWidth) this.position.x = halfWidth;
    if (this.position.y < -halfHeight) this.position.y = -halfHeight;
    if (this.position.y > halfHeight) this.position.y = halfHeight;
  }

  // Handle cell death
  private onDeath(): void {
    if (this.isPlayer) {
      console.log('Player cell died! ATP depleted.');
      // TODO: Show death screen, offer restart
    }
  }

  // Get distance to another position
  distanceTo(target: Vector2D): number {
    const dx = this.position.x - target.x;
    const dy = this.position.y - target.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  dispose(): void {
    this.sprite.destroy();
  }
}
