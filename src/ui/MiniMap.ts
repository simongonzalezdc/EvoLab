// Mini-map showing biome layout and player position

import { Graphics, Container } from 'pixi.js';
import type { BiomeGenerator } from '../environment/BiomeGenerator';

export class MiniMap {
  private container: Container;
  private mapGraphic: Graphics;
  private playerMarker: Graphics;
  private width: number;
  private height: number;
  private worldWidth: number;
  private worldHeight: number;
  private biomeGenerator: BiomeGenerator;
  private sampleResolution: number = 10; // Sample every N world units

  constructor(
    width: number,
    height: number,
    worldWidth: number,
    worldHeight: number,
    biomeGenerator: BiomeGenerator
  ) {
    this.width = width;
    this.height = height;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.biomeGenerator = biomeGenerator;

    this.container = new Container();
    this.mapGraphic = new Graphics();
    this.playerMarker = new Graphics();

    this.container.addChild(this.mapGraphic);
    this.container.addChild(this.playerMarker);

    // Generate initial map
    this.generateMap();
    this.createPlayerMarker();
  }

  // Generate the mini-map by sampling biomes
  private generateMap(): void {
    this.mapGraphic.clear();

    // Draw background
    this.mapGraphic.rect(0, 0, this.width, this.height);
    this.mapGraphic.fill({ color: 0x000000, alpha: 0.7 });
    this.mapGraphic.stroke({ width: 2, color: 0x333333, alpha: 0.8 });

    // Sample biomes and draw pixels
    const scaleX = this.width / this.worldWidth;
    const scaleY = this.height / this.worldHeight;

    for (let worldX = -this.worldWidth / 2; worldX < this.worldWidth / 2; worldX += this.sampleResolution) {
      for (let worldY = -this.worldHeight / 2; worldY < this.worldHeight / 2; worldY += this.sampleResolution) {
        const biome = this.biomeGenerator.getBiomeAt(worldX, worldY);

        // Convert world coords to mini-map coords
        const mapX = (worldX + this.worldWidth / 2) * scaleX;
        const mapY = (worldY + this.worldHeight / 2) * scaleY;
        const pixelSize = this.sampleResolution * scaleX;

        // Draw biome pixel
        this.mapGraphic.rect(mapX, mapY, Math.max(1, pixelSize), Math.max(1, pixelSize));
        this.mapGraphic.fill({ color: biome.color, alpha: 0.8 });
      }
    }
  }

  // Create player marker
  private createPlayerMarker(): void {
    this.playerMarker.clear();

    // Draw cross-hair marker
    const size = 4;
    this.playerMarker.circle(0, 0, size);
    this.playerMarker.fill({ color: 0xffffff, alpha: 0.9 });
    this.playerMarker.circle(0, 0, size - 1);
    this.playerMarker.stroke({ width: 1, color: 0x000000, alpha: 0.9 });
  }

  // Update player position marker
  updatePlayerPosition(worldX: number, worldY: number): void {
    const scaleX = this.width / this.worldWidth;
    const scaleY = this.height / this.worldHeight;

    const mapX = (worldX + this.worldWidth / 2) * scaleX;
    const mapY = (worldY + this.worldHeight / 2) * scaleY;

    this.playerMarker.x = mapX;
    this.playerMarker.y = mapY;
  }

  // Get container for adding to stage
  getContainer(): Container {
    return this.container;
  }

  // Set position on screen
  setPosition(x: number, y: number): void {
    this.container.x = x;
    this.container.y = y;
  }

  // Set visibility
  setVisible(visible: boolean): void {
    this.container.visible = visible;
  }

  dispose(): void {
    this.mapGraphic.destroy();
    this.playerMarker.destroy();
    this.container.destroy();
  }
}
