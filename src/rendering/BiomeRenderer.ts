// Biome rendering system for PixiJS

import { Graphics, Container } from 'pixi.js';
import { BiomeGenerator } from '../environment/BiomeGenerator';
import { Config } from '../core/Config';
import { logger } from '../utils/Logger';

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
      logger.log('[BiomeRenderer] Constructor: Container initialized with visible=true, alpha=1.0');
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
      logger.log(`[BiomeRenderer] Render camera (${cameraX}, ${cameraY}) view ${viewWidth}x${viewHeight}`);
    }
    
    // Map boundary limits - only render tiles within the game space
    const halfWidth = Config.LAKE_WIDTH / 2;
    const halfHeight = Config.LAKE_HEIGHT / 2;
    const minX = -halfWidth;
    const maxX = halfWidth;
    const minY = -halfHeight;
    const maxY = halfHeight;
    
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
        // Only create tiles within the map boundary
        if (x < minX || x >= maxX || y < minY || y >= maxY) {
          continue;
        }
        
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
      logger.log(`[BiomeRenderer] Created ${tilesCreated} new tiles. Total tiles: ${this.tiles.size}`);
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
      logger.log(`[BiomeRenderer] Removed ${tilesRemoved} tiles. Remaining tiles: ${this.tiles.size}`);
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

    // Add texture overlay pattern based on biome type
    this.addTexturePattern(tile, biome.type, x, y);

    if (outlineWidth > 0) {
      tile.stroke({ color: outlineColor, width: outlineWidth, alpha: 0.8 });
    }

    // Position tile at world coordinates
    tile.x = x;
    tile.y = y;

    this.container.addChild(tile);
    if (Config.DEBUG_BIOME_RENDERER) {
      logger.log(`[BiomeRenderer] Tile (${x},${y}) added for biome ${biome.type}`);
    }

    this.tiles.set(`${x},${y}`, tile);
  }

  // Add texture pattern overlay to tiles
  private addTexturePattern(tile: Graphics, biomeType: string, worldX: number, worldY: number): void {
    const size = this.tileSize;

    switch (biomeType) {
      case 'TOXIC':
        // Toxic: diagonal lines
        for (let i = 0; i < 3; i++) {
          const offset = (i * size) / 3;
          tile.moveTo(0, offset);
          tile.lineTo(offset, 0);
          tile.moveTo(size - offset, size);
          tile.lineTo(size, size - offset);
        }
        tile.stroke({ width: 1, color: 0x9c27b0, alpha: 0.3 });
        break;

      case 'VOLCANIC':
        // Volcanic: random cracks
        for (let i = 0; i < 4; i++) {
          const startX = Math.random() * size;
          const startY = Math.random() * size;
          const endX = startX + (Math.random() - 0.5) * size * 0.3;
          const endY = startY + (Math.random() - 0.5) * size * 0.3;
          tile.moveTo(startX, startY);
          tile.lineTo(endX, endY);
        }
        tile.stroke({ width: 1, color: 0xff3300, alpha: 0.4 });
        break;

      case 'FROZEN':
        // Frozen: crystalline pattern
        tile.moveTo(size / 2, 0);
        tile.lineTo(size / 2, size);
        tile.moveTo(0, size / 2);
        tile.lineTo(size, size / 2);
        tile.moveTo(0, 0);
        tile.lineTo(size, size);
        tile.moveTo(size, 0);
        tile.lineTo(0, size);
        tile.stroke({ width: 1, color: 0xffffff, alpha: 0.2 });
        break;

      case 'CRYSTAL': {
        // Crystal: grid pattern
        const gridSize = size / 4;
        for (let i = 1; i < 4; i++) {
          tile.moveTo(i * gridSize, 0);
          tile.lineTo(i * gridSize, size);
          tile.moveTo(0, i * gridSize);
          tile.lineTo(size, i * gridSize);
        }
        tile.stroke({ width: 1, color: 0xffffff, alpha: 0.25 });
        break;
      }

      case 'SWAMP':
        // Swamp: organic blobs
        for (let i = 0; i < 3; i++) {
          const cx = Math.random() * size;
          const cy = Math.random() * size;
          const r = 2 + Math.random() * 3;
          tile.circle(cx, cy, r);
          tile.fill({ color: 0x558b2f, alpha: 0.3 });
        }
        break;

      case 'ABYSS':
        // Abyss: wavy lines
        for (let i = 0; i < 2; i++) {
          const y = (i + 1) * (size / 3);
          tile.moveTo(0, y);
          tile.bezierCurveTo(
            size / 4, y - 3,
            size * 3 / 4, y + 3,
            size, y
          );
        }
        tile.stroke({ width: 1, color: 0x000066, alpha: 0.4 });
        break;

      case 'NUTRIENT_RICH':
        // Nutrient rich: dots pattern
        for (let i = 0; i < 8; i++) {
          const dx = (i % 4) * (size / 4) + size / 8;
          const dy = Math.floor(i / 4) * (size / 2) + size / 4;
          tile.circle(dx, dy, 1);
          tile.fill({ color: 0x00ff00, alpha: 0.4 });
        }
        break;

      case 'BARREN':
        // Barren: sparse dots
        for (let i = 0; i < 3; i++) {
          const dx = Math.random() * size;
          const dy = Math.random() * size;
          tile.circle(dx, dy, 0.5);
          tile.fill({ color: 0x666666, alpha: 0.3 });
        }
        break;
    }
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
    // Normalize light level (BiomeGenerator returns 0-100)
    const normalizedLight = Math.max(0, Math.min(1, lightLevel / 100));
    const newAlpha = 0.4 + normalizedLight * 0.6; // Keep alpha between 0.4-1.0

    if (Config.DEBUG_BIOME_RENDERER) {
      logger.log(
        `[BiomeRenderer] updateLighting: lightLevel=${lightLevel} (normalized=${normalizedLight.toFixed(2)}), alpha=${newAlpha.toFixed(2)}`
      );
    }

    this.container.alpha = newAlpha;
  }

  dispose(): void {
    this.tiles.forEach(tile => tile.destroy());
    this.tiles.clear();
    this.container.destroy();
  }
}
