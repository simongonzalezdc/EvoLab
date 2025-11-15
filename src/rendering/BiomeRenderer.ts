// Biome rendering system for PixiJS

import { Graphics, Container } from 'pixi.js';
import { BiomeGenerator } from '../environment/BiomeGenerator';

export class BiomeRenderer {
  private container: Container;
  private biomeGenerator: BiomeGenerator;
  private tileSize = 50; // Size of each biome tile
  private tiles: Map<string, Graphics> = new Map();

  constructor(biomeGenerator: BiomeGenerator) {
    this.container = new Container();
    this.biomeGenerator = biomeGenerator;
  }

  // Render biomes in visible area around camera position
  render(cameraX: number, cameraY: number, viewWidth: number, viewHeight: number): void {
    // Calculate visible tile range
    const startX = Math.floor((cameraX - viewWidth / 2) / this.tileSize) * this.tileSize;
    const endX = Math.ceil((cameraX + viewWidth / 2) / this.tileSize) * this.tileSize;
    const startY = Math.floor((cameraY - viewHeight / 2) / this.tileSize) * this.tileSize;
    const endY = Math.ceil((cameraY + viewHeight / 2) / this.tileSize) * this.tileSize;

    // Remove tiles outside visible area
    const visibleKeys = new Set<string>();

    for (let x = startX; x <= endX; x += this.tileSize) {
      for (let y = startY; y <= endY; y += this.tileSize) {
        const key = `${x},${y}`;
        visibleKeys.add(key);

        if (!this.tiles.has(key)) {
          this.createTile(x, y);
        }
      }
    }

    // Clean up tiles far from camera
    for (const [key, tile] of this.tiles) {
      if (!visibleKeys.has(key)) {
        this.container.removeChild(tile);
        tile.destroy();
        this.tiles.delete(key);
      }
    }
  }

  private createTile(x: number, y: number): void {
    const biome = this.biomeGenerator.getBiomeAt(x, y);
    const tile = new Graphics();

    // Draw tile with biome color
    tile.rect(0, 0, this.tileSize, this.tileSize);
    tile.fill({ color: biome.color, alpha: 0.3 });

    tile.x = x;
    tile.y = y;

    this.container.addChild(tile);
    this.tiles.set(`${x},${y}`, tile);
  }

  getContainer(): Container {
    return this.container;
  }

  updateLighting(lightLevel: number): void {
    // Adjust alpha based on light level
    this.container.alpha = 0.2 + lightLevel * 0.3; // 0.2-0.5 range
  }

  dispose(): void {
    this.tiles.forEach(tile => tile.destroy());
    this.tiles.clear();
    this.container.destroy();
  }
}
