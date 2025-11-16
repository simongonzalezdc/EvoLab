// Biome rendering system for PixiJS

import { Graphics, Container } from 'pixi.js';
import { BiomeGenerator } from '../environment/BiomeGenerator';
import { Config } from '../core/Config';

export class BiomeRenderer {
  private container: Container;
  private biomeGenerator: BiomeGenerator;
  private tileSize = Config.BIOME_TILE_SIZE; // Size of each biome tile
  private tiles: Map<string, Graphics> = new Map();
  private highlightedBiomeType: string | null = null; // BiomeType to highlight
  private needsFullRedraw = false;

  constructor(biomeGenerator: BiomeGenerator) {
    this.container = new Container();
    // this.container.name = 'BiomeContainer'; // Name for debugging - REMOVED due to deprecation
    this.container.visible = true; // Ensure visible
    this.container.alpha = 1.0; // Start fully visible - FIX 5
    this.biomeGenerator = biomeGenerator;
    
    if (Config.DEBUG_BIOME_RENDERER) {
      console.log('[BiomeRenderer] Constructor: Container initialized with visible=true, alpha=1.0');
    }
  }

  // Render biomes in visible area around camera position
  render(cameraX: number, cameraY: number, viewWidth: number, viewHeight: number): void {
    if (this.needsFullRedraw) {
      this.tiles.forEach(tile => {
        this.container.removeChild(tile);
        tile.destroy();
      });
      this.tiles.clear();
      this.needsFullRedraw = false;
    }

    if (Config.DEBUG_BIOME_RENDERER) {
      console.log(`[BiomeRenderer] Render camera (${cameraX}, ${cameraY}) view ${viewWidth}x${viewHeight}`);
    }
    
    // Calculate visible tile range
    const startX = Math.floor((cameraX - viewWidth / 2) / this.tileSize) * this.tileSize;
    const endX = Math.ceil((cameraX + viewWidth / 2) / this.tileSize) * this.tileSize;
    const startY = Math.floor((cameraY - viewHeight / 2) / this.tileSize) * this.tileSize;
    const endY = Math.ceil((cameraY + viewHeight / 2) / this.tileSize) * this.tileSize;

    // Remove tiles outside visible area
    const visibleKeys = new Set<string>();
    let tilesCreated = 0;

    for (let x = startX; x <= endX; x += this.tileSize) {
      for (let y = startY; y <= endY; y += this.tileSize) {
        const key = `${x},${y}`;
        visibleKeys.add(key);

        if (!this.tiles.has(key)) {
          this.createTile(x, y);
          tilesCreated++;
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
            tilesCreated++;
          }
        }
      }
    }

    if (Config.DEBUG_BIOME_RENDERER) {
      console.log(`[BiomeRenderer] Created ${tilesCreated} new tiles. Total tiles: ${this.tiles.size}`);
    }

    // Clean up tiles far from camera
    let tilesRemoved = 0;
    for (const [key, tile] of this.tiles) {
      if (!visibleKeys.has(key)) {
        this.container.removeChild(tile);
        tile.destroy();
        this.tiles.delete(key);
        tilesRemoved++;
      }
    }

    if (tilesRemoved > 0 && Config.DEBUG_BIOME_RENDERER) {
      console.log(`[BiomeRenderer] Removed ${tilesRemoved} tiles. Remaining tiles: ${this.tiles.size}`);
    }
  }

  private createTile(x: number, y: number): void {
    const biome = this.biomeGenerator.getBiomeAt(x, y);
    const tile = new Graphics();

    // Check if this tile should be highlighted
    const isHighlighted = this.highlightedBiomeType === biome.type;
    const alpha = isHighlighted ? 1.0 : 0.8; // Much higher visibility - FIX 1
    const outlineColor = isHighlighted ? 0xffffff : 0x333333; // Darker outline for visibility
    const outlineWidth = isHighlighted ? 2 : 1; // Always have outline for visibility - FIX 2

    // Draw tile with biome color - Use local coordinates (0,0) and position via x/y
    tile.rect(0, 0, this.tileSize, this.tileSize); // Draw at local coordinates
    tile.fill({ color: biome.color, alpha });
    if (outlineWidth > 0) {
      tile.stroke({ color: outlineColor, width: outlineWidth, alpha: 0.8 });
    }

    // Position tile at world coordinates
    tile.x = x;
    tile.y = y;

    this.container.addChild(tile);
    if (Config.DEBUG_BIOME_RENDERER) {
      console.log(`[BiomeRenderer] Tile (${x},${y}) added for biome ${biome.type}`);
    }
    
    this.tiles.set(`${x},${y}`, tile);
  }

  // Highlight a specific biome type (for interactive legend)
  setHighlightedBiome(biomeType: string | null): void {
    if (this.highlightedBiomeType !== biomeType) {
      this.highlightedBiomeType = biomeType;
      this.needsFullRedraw = true;
    }
  }

  getContainer(): Container {
    return this.container;
  }

  updateLighting(lightLevel: number): void {
    // Adjust alpha based on light level - much higher visibility - FIX 4
    const newAlpha = 0.7 + lightLevel * 0.3; // 0.7-1.0 range - always very visible
    console.log(`[BiomeRenderer] updateLighting: lightLevel=${lightLevel}, setting container alpha to ${newAlpha}`);
    this.container.alpha = newAlpha;
  }

  dispose(): void {
    this.tiles.forEach(tile => tile.destroy());
    this.tiles.clear();
    this.container.destroy();
  }
}
