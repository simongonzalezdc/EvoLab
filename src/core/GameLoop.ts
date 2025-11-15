// Main game loop using requestAnimationFrame

import { PixiApp } from '../rendering/PixiApp';
import { InputHandler } from './InputHandler';
import { EntityManager } from '../entities/EntityManager';
import { Config } from './Config';

export class GameLoop {
  private renderer: PixiApp;
  private inputHandler: InputHandler;
  private entityManager: EntityManager;
  private lastTime = 0;
  private isRunning = false;
  private isPaused = false;
  private animationFrameId: number | null = null;

  constructor() {
    this.renderer = new PixiApp();
    this.inputHandler = new InputHandler();
    this.entityManager = new EntityManager(this.renderer);
  }

  async initialize(): Promise<void> {
    console.log('Initializing EvoLab...');

    // Initialize renderer
    await this.renderer.initialize();

    // Create player cell
    this.entityManager.createPlayerCell();

    // Spawn resources
    this.entityManager.spawnResources();

    console.log('Game initialized successfully!');
  }

  // Start the game loop
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);

    console.log('Game loop started');
  }

  // Main game loop
  private loop = (currentTime: number): void => {
    if (!this.isRunning) return;

    // Calculate delta time
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1); // Cap at 100ms
    this.lastTime = currentTime;

    // Check for pause toggle
    if (this.inputHandler.isKeyPressed(' ')) {
      // Debounce pause (simple approach)
      if (!this.isPaused) {
        this.isPaused = true;
        console.log('Game paused');
      }
    }

    if (!this.isPaused) {
      this.update(deltaTime);
      this.render();
    }

    // Continue loop
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  // Update game state
  private update(deltaTime: number): void {
    // Handle player input
    const player = this.entityManager.playerCell;
    if (player) {
      const direction = this.inputHandler.getMovementDirection();
      if (direction.x !== 0 || direction.y !== 0) {
        player.applyForce(direction, Config.ACCELERATION);
      }
    }

    // Update all entities
    this.entityManager.update(deltaTime);

    // Update camera to follow player
    if (player) {
      this.renderer.updateCamera(player.position.x, player.position.y);
    }

    // Update HUD
    this.updateHUD();
  }

  // Render game
  private render(): void {
    // PixiJS automatically renders via ticker
    // Additional rendering logic can go here
  }

  // Update HUD elements
  private updateHUD(): void {
    const player = this.entityManager.playerCell;
    if (!player) return;

    // Update ATP
    const atpValue = document.getElementById('atp-value');
    const atpBar = document.getElementById('atp-bar');
    if (atpValue && atpBar) {
      atpValue.textContent = Math.floor(player.traits.atp).toString();
      const atpPercent = (player.traits.atp / player.traits.maxATP) * 100;
      atpBar.style.width = `${atpPercent}%`;
    }

    // Update Health
    const healthValue = document.getElementById('health-value');
    const healthBar = document.getElementById('health-bar');
    if (healthValue && healthBar) {
      healthValue.textContent = Math.floor(player.traits.health).toString();
      const healthPercent = (player.traits.health / player.traits.maxHealth) * 100;
      healthBar.style.width = `${healthPercent}%`;
    }

    // Update Glucose
    const glucoseValue = document.getElementById('glucose-value');
    if (glucoseValue) {
      glucoseValue.textContent = this.entityManager.glucoseCollected.toString();
    }

    // Update Position
    const positionValue = document.getElementById('position-value');
    if (positionValue) {
      positionValue.textContent = `${Math.floor(player.position.x)}, ${Math.floor(player.position.y)}`;
    }
  }

  // Stop the game loop
  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    console.log('Game loop stopped');
  }

  // Dispose resources
  dispose(): void {
    this.stop();
    this.entityManager.dispose();
    this.renderer.dispose();
    this.inputHandler.dispose();
  }
}
