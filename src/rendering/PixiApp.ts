// PixiJS application wrapper for rendering

import { Application, Graphics, Container } from 'pixi.js';
import { Config } from '../core/Config';

export class PixiApp {
  public app: Application;
  public worldContainer: Container;
  private biomeLayer: Container | null = null;
  private isInitialized = false;

  constructor() {
    this.app = new Application();
    this.worldContainer = new Container();
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
    this.app.stage.addChild(this.worldContainer);

    // Center world container (for camera) - will be updated by camera
    this.worldContainer.x = width / 2;
    this.worldContainer.y = height / 2;

    this.isInitialized = true;
  }

  // Add biome layer underneath entities
  addBiomeLayer(biomeContainer: Container): void {
    this.biomeLayer = biomeContainer;
    this.worldContainer.addChildAt(biomeContainer, 0); // Add at bottom
  }

  // Update camera to follow target position
  updateCamera(targetX: number, targetY: number): void {
    // Camera follows player - use actual canvas size
    const width = this.app.canvas.width;
    const height = this.app.canvas.height;
    this.worldContainer.x = width / 2 - targetX;
    this.worldContainer.y = height / 2 - targetY;
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

  dispose(): void {
    this.app.destroy(true, { children: true });
    this.isInitialized = false;
  }
}
