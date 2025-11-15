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

  constructor(id: string, x: number, y: number, type: ResourceType, sprite: Graphics) {
    this.id = id;
    this.position = { x, y };
    this.type = type;
    this.amount = this.getResourceAmount(type);
    this.sprite = sprite;
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

  // Update respawn timer
  update(deltaTime: number, respawnTime: number): void {
    if (this.isCollected) {
      this.respawnTimer += deltaTime;

      if (this.respawnTimer >= respawnTime) {
        this.respawn();
      }
    }
  }

  // Respawn resource
  private respawn(): void {
    this.isCollected = false;
    this.sprite.visible = true;
    this.respawnTimer = 0;
  }

  dispose(): void {
    this.sprite.destroy();
  }
}
