// Biome rendering system for PixiJS

import { Graphics, Container } from 'pixi.js';
import { BiomeGenerator } from '../environment/BiomeGenerator';

export class BiomeRenderer {
  private container: Container;
  private biomeGenerator: BiomeGenerator;
  private tileSize = 50; // Size of each biome tile
  private tiles: Map<string, Graphics> = new Map();
  private highlightedBiomeType: string | null = null; // BiomeType to highlight

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
        } else if (this.highlightedBiomeType !== null) {
          // Update existing tile if highlight changed
          const biome = this.biomeGenerator.getBiomeAt(x, y);
          const tile = this.tiles.get(key);
          if (tile && this.highlightedBiomeType === biome.type) {
            // Recreate tile to update highlight
            this.container.removeChild(tile);
            tile.destroy();
            this.tiles.delete(key);
            this.createTile(x, y);
          }
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

    // Check if this tile should be highlighted
    const isHighlighted = this.highlightedBiomeType === biome.type;
    const alpha = isHighlighted ? 0.6 : 0.3; // Brighter when highlighted
    const outlineColor = isHighlighted ? 0xffffff : 0x000000;
    const outlineWidth = isHighlighted ? 2 : 0;

    // Draw tile with biome color
    tile.rect(0, 0, this.tileSize, this.tileSize);
    tile.fill({ color: biome.color, alpha });
    if (outlineWidth > 0) {
      tile.stroke({ color: outlineColor, width: outlineWidth, alpha: 0.8 });
    }

    tile.x = x;
    tile.y = y;

    this.container.addChild(tile);
    this.tiles.set(`${x},${y}`, tile);
  }

  // Highlight a specific biome type (for interactive legend)
  setHighlightedBiome(biomeType: string | null): void {
    if (this.highlightedBiomeType !== biomeType) {
      this.highlightedBiomeType = biomeType;
      // Re-render all tiles to update highlights
      this.tiles.forEach((tile, key) => {
        const parts = key.split(',');
        const x = Number(parts[0]);
        const y = Number(parts[1]);
        if (!isNaN(x) && !isNaN(y)) {
          this.container.removeChild(tile);
          tile.destroy();
          this.tiles.delete(key);
          this.createTile(x, y);
        }
      });
    }
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
