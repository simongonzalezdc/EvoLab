// Cell entity representing a single-celled organism

import { Graphics } from 'pixi.js';
import type { Vector2D, Traits, CompoundStorage } from '../types/entities';
import { Config } from '../core/Config';
import { Genome } from '../genetics/Genome';

export class Cell {
  public id: string;
  public position: Vector2D;
  public velocity: Vector2D;
  public traits: Traits;
  public sprite: Graphics;
  public isPlayer: boolean;
  public genome: Genome;
  public compounds: CompoundStorage;
  public survivalTime = 0;
  public birthTime: number;
  public lastReproductionTime = 0;
  private deathCallback: ((cause: 'atp' | 'health') => void) | null = null;

  constructor(
    id: string,
    x: number,
    y: number,
    genome: Genome,
    sprite: Graphics,
    isPlayer = false
  ) {
    this.id = id;
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.genome = genome;
    this.traits = genome.traits;
    this.sprite = sprite;
    this.isPlayer = isPlayer;
    this.birthTime = Date.now();
    this.compounds = {
      glucose: 0,
      aminoAcids: 0,
      phosphates: 0,
    };
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

    // Update survival time
    this.survivalTime = (Date.now() - this.birthTime) / 1000;

    // Boundary check (keep within lake)
    this.constrainToLake();
  }

  // Collect compound
  collectCompound(type: 'glucose' | 'aminoAcid' | 'phosphate', amount: number): void {
    if (type === 'glucose') {
      this.compounds.glucose += amount;
    } else if (type === 'aminoAcid') {
      this.compounds.aminoAcids += amount;
    } else if (type === 'phosphate') {
      this.compounds.phosphates += amount;
    }

    // Clamp to max storage
    const maxStorage = this.traits.maxStorage;
    this.compounds.glucose = Math.min(this.compounds.glucose, maxStorage);
    this.compounds.aminoAcids = Math.min(this.compounds.aminoAcids, maxStorage);
    this.compounds.phosphates = Math.min(this.compounds.phosphates, maxStorage);
  }

  // Check if reproduction requirements are met
  canReproduce(): boolean {
    const atpPercent = (this.traits.atp / this.traits.maxATP) * 100;
    const timeSinceLastReproduction = (Date.now() - this.lastReproductionTime) / 1000;

    return (
      atpPercent >= Config.REPRODUCTION_ATP_THRESHOLD &&
      this.compounds.glucose >= Config.REPRODUCTION_GLUCOSE_REQUIRED &&
      this.compounds.aminoAcids >= Config.REPRODUCTION_AMINO_ACIDS_REQUIRED &&
      this.compounds.phosphates >= Config.REPRODUCTION_PHOSPHATES_REQUIRED &&
      timeSinceLastReproduction >= Config.REPRODUCTION_COOLDOWN_SECONDS
    );
  }

  // Update last reproduction time
  markReproduction(): void {
    this.lastReproductionTime = Date.now();
  }

  // Apply movement force (for player input)
  applyForce(direction: Vector2D, speed: number): void {
    this.velocity.x += direction.x * speed;
    this.velocity.y += direction.y * speed;

    // Cap maximum velocity
    const magnitude = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
    if (magnitude > Config.MAX_VELOCITY && magnitude > 0) {
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

    // Bounce off walls instead of getting stuck
    if (this.position.x < -halfWidth) {
      this.position.x = -halfWidth;
      this.velocity.x = Math.abs(this.velocity.x) * 0.5; // Bounce with damping
    }
    if (this.position.x > halfWidth) {
      this.position.x = halfWidth;
      this.velocity.x = -Math.abs(this.velocity.x) * 0.5; // Bounce with damping
    }
    if (this.position.y < -halfHeight) {
      this.position.y = -halfHeight;
      this.velocity.y = Math.abs(this.velocity.y) * 0.5; // Bounce with damping
    }
    if (this.position.y > halfHeight) {
      this.position.y = halfHeight;
      this.velocity.y = -Math.abs(this.velocity.y) * 0.5; // Bounce with damping
    }
  }

  // Handle cell death
  private onDeath(): void {
    if (this.isPlayer && this.deathCallback) {
      // Determine cause of death: if health is 0, it's health damage; otherwise ATP depletion
      const cause: 'atp' | 'health' = this.traits.health <= 0 ? 'health' : 'atp';
      this.deathCallback(cause);
    }
  }

  // Set callback for when cell dies (used for player death screen)
  setDeathCallback(callback: (cause: 'atp' | 'health') => void): void {
    this.deathCallback = callback;
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
