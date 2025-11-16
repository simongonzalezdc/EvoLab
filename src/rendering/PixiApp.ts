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
  private isInitialized = false;
  private zoomLevel: number = 1.0;
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

    console.log('[PixiApp] Constructor: WorldContainer initialized with visible=true, alpha=1.0');
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

    // Add world container to stage
    console.log('[PixiApp] initialize: Adding worldContainer to stage');
    console.log(`[PixiApp] initialize: Stage visible: ${this.app.stage.visible}, alpha: ${this.app.stage.alpha}`);
    this.app.stage.addChild(this.worldContainer);

    // Add UI container to stage (rendered on top, not affected by camera)
    this.app.stage.addChild(this.uiContainer);

    // Add particle layer to world container (on top of everything)
    this.worldContainer.addChild(this.particleLayer);

    // DEBUG: Start world container at (0, 0) instead of centering
    this.worldContainer.x = 0;
    this.worldContainer.y = 0;
    
    console.log(`[PixiApp] initialize: WorldContainer positioned at (${this.worldContainer.x}, ${this.worldContainer.y}) - DEBUG: Set to (0, 0)`);
    console.log(`[PixiApp] initialize: WorldContainer visible: ${this.worldContainer.visible}, alpha: ${this.worldContainer.alpha}`);
    console.log(`[PixiApp] initialize: Canvas size: ${width}x${height}`);

    this.isInitialized = true;
  }

  // Add biome layer underneath entities
  addBiomeLayer(biomeContainer: Container): void {
    console.log(`[PixiApp] Adding biome layer. WorldContainer children before: ${this.worldContainer.children.length}`);
    console.log(`[PixiApp] Biome container visible: ${biomeContainer.visible}, alpha: ${biomeContainer.alpha}`);
    console.log(`[PixiApp] WorldContainer position: (${this.worldContainer.x}, ${this.worldContainer.y})`);
    console.log(`[PixiApp] WorldContainer scale: (${this.worldContainer.scale.x}, ${this.worldContainer.scale.y})`);
    
    this.biomeLayer = biomeContainer;
    this.worldContainer.addChildAt(biomeContainer, 0); // Add at bottom
    
    console.log(`[PixiApp] Adding biome layer. WorldContainer children after: ${this.worldContainer.children.length}`);
    console.log(`[PixiApp] Biome layer index in worldContainer: ${this.worldContainer.getChildIndex(biomeContainer)}`);
    console.log(`[PixiApp] WorldContainer visible: ${this.worldContainer.visible}, alpha: ${this.worldContainer.alpha}`);
    console.log(`[PixiApp] Stage visible: ${this.app.stage.visible}, alpha: ${this.app.stage.alpha}`);
    console.log(`[PixiApp] Stage children count: ${this.app.stage.children.length}`);
  }

  // Update camera to follow target position
  updateCamera(targetX: number, targetY: number): void {
    // Camera follows player - use actual canvas size
    // Account for zoom level in camera positioning
    const { width, height } = this.getScreenSize();
    const oldX = this.worldContainer.x;
    const oldY = this.worldContainer.y;
    
    // MAJOR DEBUG: Try positioning target at exact screen center
    // First, position container so (0,0) is at screen center
    this.worldContainer.x = width / 2;
    this.worldContainer.y = height / 2;
    
    // Then apply zoom and target offset
    this.worldContainer.x -= targetX * this.zoomLevel;
    this.worldContainer.y -= targetY * this.zoomLevel;
    
    console.log(`[PixiApp] updateCamera: target(${targetX}, ${targetY}), zoom=${this.zoomLevel}, canvas(${width}x${height})`);
    console.log(`[PixiApp] updateCamera: WorldContainer moved from (${oldX}, ${oldY}) to (${this.worldContainer.x}, ${this.worldContainer.y})`);
    
    // DEBUG: Calculate where target should appear on screen
    const targetScreenX = targetX * this.zoomLevel + this.worldContainer.x;
    const targetScreenY = targetY * this.zoomLevel + this.worldContainer.y;
    console.log(`[PixiApp] DEBUG: Target should appear at screen: (${targetScreenX}, ${targetScreenY}), center: (${width/2}, ${height/2})`);
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
    this.setZoom(1.0);
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
    this.app.destroy(true, { children: true });
    this.isInitialized = false;
  }
}
