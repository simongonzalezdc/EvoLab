// PixiJS application wrapper for rendering

import { Application, Graphics, Container } from 'pixi.js';
import { Config } from '../core/Config';
import { ParticleSystem } from './ParticleSystem';
import { MiniMap } from '../ui/MiniMap';
import type { BiomeGenerator } from '../environment/BiomeGenerator';

export class PixiApp {
  public app: Application;
  public worldContainer: Container;
  public particleSystem: ParticleSystem;
  public miniMap: MiniMap | null = null;
  private uiContainer: Container; // Container for UI elements (not affected by world transforms)
  private biomeLayer: Container | null = null;
  private particleLayer: Container;
  private mapBoundary: Graphics | null = null;
  private backgroundLayer: Graphics | null = null;
  private isInitialized = false;
  private zoomLevel: number = 0.5; // Default to fully zoomed out
  private minZoom: number = 0.5;
  private maxZoom: number = 3.0;

  constructor() {
    this.app = new Application();
    this.worldContainer = new Container();
    this.uiContainer = new Container(); // UI container stays fixed on screen
    // this.worldContainer.name = 'WorldContainer'; // Name for debugging - REMOVED due to deprecation
    this.worldContainer.visible = true; // Ensure visible
    this.worldContainer.alpha = 1.0; // Start fully visible

    // Create particle layer (rendered above entities)
    this.particleLayer = new Container();
    this.particleSystem = new ParticleSystem(this.particleLayer);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Use full viewport size
    const width = window.innerWidth;
    const height = window.innerHeight;

    await this.app.init({
      width,
      height,
      backgroundColor: Config.BACKGROUND_COLOR,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: true,
      resizeTo: window, // Auto-resize with window
    });

    // Add canvas to DOM
    const appElement = document.getElementById('app');
    if (appElement) {
      appElement.appendChild(this.app.canvas);
    }

    // Make canvas fill the viewport
    this.app.canvas.style.width = '100%';
    this.app.canvas.style.height = '100%';
    this.app.canvas.style.display = 'block';

    // Create background layer for UI (outside map boundary)
    this.createBackgroundLayer();

    // Add world container to stage
    this.app.stage.addChild(this.worldContainer);

    // Add UI container to stage (rendered on top, not affected by camera)
    this.app.stage.addChild(this.uiContainer);

    // Add particle layer to world container (on top of everything)
    this.worldContainer.addChild(this.particleLayer);

    // Add map boundary visualization
    this.createMapBoundary();

    // Set initial zoom to fully zoomed out (default view)
    this.worldContainer.scale.set(this.zoomLevel, this.zoomLevel);
    // Center the world when fully zoomed out
    const screenSize = this.getScreenSize();
    this.worldContainer.x = screenSize.width / 2;
    this.worldContainer.y = screenSize.height / 2;

    this.isInitialized = true;
  }

  // Create background layer that covers everything outside the map boundary
  // This serves as the UI background - only the game space (inside green rectangle) has tiles
  private createBackgroundLayer(): void {
    const background = new Graphics();
    this.backgroundLayer = background;

    // Get screen size
    const { width, height } = this.getScreenSize();

    // Fill entire screen with background color (can be styled for UI)
    // Since biome tiles only render inside the map boundary, this background
    // will show through everywhere outside the green rectangle
    background.rect(0, 0, width, height);
    background.fill({ color: Config.BACKGROUND_COLOR, alpha: 1.0 });

    // Add to stage at the bottom (behind everything)
    // This background is static and always covers the full screen
    this.app.stage.addChildAt(background, 0);
  }

  // Update background layer when screen resizes
  private updateBackgroundLayer(): void {
    if (!this.backgroundLayer) return;

    this.backgroundLayer.clear();
    const { width, height } = this.getScreenSize();
    this.backgroundLayer.rect(0, 0, width, height);
    this.backgroundLayer.fill({ color: Config.BACKGROUND_COLOR, alpha: 1.0 });
  }

  // Create visual boundary for the map
  private createMapBoundary(): void {
    const halfWidth = Config.LAKE_WIDTH / 2;
    const halfHeight = Config.LAKE_HEIGHT / 2;

    const mapBoundary = new Graphics();
    this.mapBoundary = mapBoundary;

    // Draw boundary rectangle with semi-transparent border
    mapBoundary.rect(-halfWidth, -halfHeight, Config.LAKE_WIDTH, Config.LAKE_HEIGHT);
    mapBoundary.stroke({
      width: 4,
      color: 0x4CAF50,
      alpha: 0.5
    });

    // Add subtle gradient fade at edges to indicate boundary
    const fadeWidth = 100;

    // Left edge fade
    mapBoundary.rect(-halfWidth, -halfHeight, fadeWidth, Config.LAKE_HEIGHT);
    mapBoundary.fill({ color: 0x0a0e27, alpha: 0.3 });

    // Right edge fade
    mapBoundary.rect(halfWidth - fadeWidth, -halfHeight, fadeWidth, Config.LAKE_HEIGHT);
    mapBoundary.fill({ color: 0x0a0e27, alpha: 0.3 });

    // Top edge fade
    mapBoundary.rect(-halfWidth, -halfHeight, Config.LAKE_WIDTH, fadeWidth);
    mapBoundary.fill({ color: 0x0a0e27, alpha: 0.3 });

    // Bottom edge fade
    mapBoundary.rect(-halfWidth, halfHeight - fadeWidth, Config.LAKE_WIDTH, fadeWidth);
    mapBoundary.fill({ color: 0x0a0e27, alpha: 0.3 });

    // Add to world container (above biomes but below entities)
    this.worldContainer.addChild(mapBoundary);
  }

  // Add biome layer underneath entities
  addBiomeLayer(biomeContainer: Container): void {
    this.biomeLayer = biomeContainer;
    this.worldContainer.addChildAt(biomeContainer, 0); // Add at bottom
  }

  // Camera smoothing properties
  private targetCameraX = 0;
  private targetCameraY = 0;
  private currentCameraX = 0;
  private currentCameraY = 0;
  private cameraSmoothing = 0.15; // 0.1 = very smooth, 0.3 = responsive

  // Update camera to follow target position with smooth easing
  updateCamera(targetX: number, targetY: number): void {
    // Don't move camera when fully zoomed out (at minimum zoom)
    if (this.zoomLevel <= this.minZoom) {
      // Center the world at (0, 0) when fully zoomed out
      const { width, height } = this.getScreenSize();
      this.worldContainer.x = width / 2;
      this.worldContainer.y = height / 2;
      return;
    }

    // Smooth camera easing (lerp)
    this.targetCameraX = targetX;
    this.targetCameraY = targetY;
    this.currentCameraX += (this.targetCameraX - this.currentCameraX) * this.cameraSmoothing;
    this.currentCameraY += (this.targetCameraY - this.currentCameraY) * this.cameraSmoothing;

    // Camera follows player with smoothed position
    const { width, height } = this.getScreenSize();
    // Position target at exact screen center
    this.worldContainer.x = width / 2;
    this.worldContainer.y = height / 2;

    // Apply zoom and smoothed target offset
    this.worldContainer.x -= this.currentCameraX * this.zoomLevel;
    this.worldContainer.y -= this.currentCameraY * this.zoomLevel;
  }

  // Zoom methods
  zoomIn(factor: number = 1.2): void {
    this.setZoom(this.zoomLevel * factor);
  }

  zoomOut(factor: number = 1.2): void {
    this.setZoom(this.zoomLevel / factor);
  }

  setZoom(level: number): void {
    this.zoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, level));
    this.worldContainer.scale.set(this.zoomLevel, this.zoomLevel);
  }

  getZoom(): number {
    return this.zoomLevel;
  }

  getScreenSize(): { width: number; height: number } {
    const screen = this.app.renderer.screen;
    return { width: screen.width, height: screen.height };
  }

  getWorldViewSize(): { width: number; height: number } {
    const { width, height } = this.getScreenSize();
    return {
      width: width / this.zoomLevel,
      height: height / this.zoomLevel,
    };
  }

  resetZoom(): void {
    this.setZoom(this.minZoom); // Reset to fully zoomed out view
  }

  // Create a circular sprite (for cells)
  createCircle(x: number, y: number, radius: number, color: number): Graphics {
    const circle = new Graphics();
    circle.circle(0, 0, radius);
    circle.fill(color);
    circle.stroke({ width: 2, color: 0xffffff, alpha: 0.5 });
    circle.x = x;
    circle.y = y;
    return circle;
  }

  // Add sprite to world
  addToWorld(sprite: Graphics): void {
    this.worldContainer.addChild(sprite);
  }

  // Remove sprite from world
  removeFromWorld(sprite: Graphics): void {
    this.worldContainer.removeChild(sprite);
    sprite.destroy();
  }

  // Initialize mini-map
  initializeMiniMap(biomeGenerator: BiomeGenerator): void {
    const miniMapWidth = 150;
    const miniMapHeight = 150;

    this.miniMap = new MiniMap(
      miniMapWidth,
      miniMapHeight,
      Config.LAKE_WIDTH,
      Config.LAKE_HEIGHT,
      biomeGenerator
    );

    // Position in bottom-right corner
    const { width, height } = this.getScreenSize();
    this.miniMap.setPosition(width - miniMapWidth - 20, height - miniMapHeight - 20);

    this.uiContainer.addChild(this.miniMap.getContainer());
  }

  // Update mini-map player position
  updateMiniMap(playerX: number, playerY: number): void {
    if (this.miniMap) {
      this.miniMap.updatePlayerPosition(playerX, playerY);
    }
  }

  // Update particle system
  updateParticles(deltaTime: number): void {
    this.particleSystem.update(deltaTime);
  }

  dispose(): void {
    this.particleSystem.dispose();
    if (this.miniMap) {
      this.miniMap.dispose();
    }
    if (this.backgroundLayer) {
      this.backgroundLayer.destroy();
      this.backgroundLayer = null;
    }
    this.app.destroy(true, { children: true });
    this.isInitialized = false;
  }
}
