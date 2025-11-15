// Main game loop using requestAnimationFrame

import { PixiApp } from '../rendering/PixiApp';
import { InputHandler } from './InputHandler';
import { EntityManager } from '../entities/EntityManager';
import { Config } from './Config';
import { UIController } from '../ui/UIController';
import type { Traits } from '../types/entities';

import { BiomeGenerator } from '../environment/BiomeGenerator';
import { BiomeRenderer } from '../rendering/BiomeRenderer';
import { DayNightCycle } from '../environment/DayNightCycle';

export class GameLoop {
  private renderer: PixiApp;
  private inputHandler: InputHandler;
  private entityManager: EntityManager;
  private uiController: UIController;
  private biomeGenerator: BiomeGenerator;
  private biomeRenderer: BiomeRenderer;
  private dayNightCycle: DayNightCycle;
  private lastTime = 0;
  private isRunning = false;
  private isPaused = false;
  private animationFrameId: number | null = null;
  private pendingModifications: Partial<Traits> | null = null;

  constructor() {
    this.renderer = new PixiApp();
    this.inputHandler = new InputHandler();
    this.entityManager = new EntityManager(this.renderer);
    this.uiController = new UIController();
    this.biomeGenerator = new BiomeGenerator(Config.LAKE_WIDTH, Config.LAKE_HEIGHT);
    this.biomeRenderer = new BiomeRenderer(this.biomeGenerator);
    this.dayNightCycle = new DayNightCycle(12, 10); // Start at noon, 10x speed

    // Setup UI callbacks
    this.setupUICallbacks();
  }

  private setupUICallbacks(): void {
    this.uiController.onApply((modifications) => {
      this.pendingModifications = modifications;
    });

    this.uiController.onReportContinue(() => {
      // Show trait editor after generation report
      if (this.entityManager.playerCell) {
        const player = this.entityManager.playerCell;
        this.uiController.showTraitEditor(
          player.traits,
          player.genome.lineage.generation,
          player.genome.dnaPoints
        );
      }
    });
  }

  async initialize(): Promise<void> {
    console.log('Initializing EvoLab...');

    // Initialize renderer
    await this.renderer.initialize();

    // Add biome layer to renderer (underneath entities)
    this.renderer.addBiomeLayer(this.biomeRenderer.getContainer());

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
    // Update day/night cycle
    this.dayNightCycle.update(deltaTime);

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

      // Update biome rendering around camera
      this.biomeRenderer.render(
        player.position.x,
        player.position.y,
        Config.CANVAS_WIDTH,
        Config.CANVAS_HEIGHT
      );
    }

    // Update lighting based on day/night
    const lightLevel = this.dayNightCycle.getLightLevel();
    this.biomeRenderer.updateLighting(lightLevel);

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

    // Update Compounds
    const glucoseValue = document.getElementById('glucose-value');
    if (glucoseValue) {
      glucoseValue.textContent = Math.floor(player.compounds.glucose).toString();
    }

    const aminoAcidValue = document.getElementById('aminoacid-value');
    if (aminoAcidValue) {
      aminoAcidValue.textContent = Math.floor(player.compounds.aminoAcids).toString();
    }

    const phosphateValue = document.getElementById('phosphate-value');
    if (phosphateValue) {
      phosphateValue.textContent = Math.floor(player.compounds.phosphates).toString();
    }

    // Update Generation
    const generationValue = document.getElementById('generation-value');
    if (generationValue) {
      generationValue.textContent = player.genome.lineage.generation.toString();
    }

    // Update DNA Points
    const dnaValue = document.getElementById('dna-value');
    if (dnaValue) {
      dnaValue.textContent = Math.floor(player.genome.dnaPoints).toString();
    }

    // Update Time of Day
    const timeValue = document.getElementById('time-value');
    if (timeValue) {
      const time = this.dayNightCycle.getTime();
      const hours = Math.floor(time);
      const minutes = Math.floor((time % 1) * 60);
      timeValue.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    // Update Population
    const populationValue = document.getElementById('population-value');
    if (populationValue) {
      const stats = this.entityManager.getPopulationStats();
      const total = Object.values(stats).reduce((a, b) => a + b, 0);
      populationValue.textContent = total.toString();
    }

    // Update Reproduction Button
    const reproduceBtn = document.getElementById('reproduce-btn') as HTMLButtonElement;
    if (reproduceBtn) {
      const canReproduce = player.canReproduce();
      reproduceBtn.style.display = canReproduce ? 'block' : 'none';

      // Add click handler if not already added
      if (canReproduce && !reproduceBtn.onclick) {
        reproduceBtn.onclick = () => this.handleReproduction();
      }
    }
  }

  // Handle reproduction trigger
  private handleReproduction(): void {
    const player = this.entityManager.playerCell;
    if (!player || !player.canReproduce()) return;

    // Calculate DNA points
    const dnaPoints = player.survivalTime * 0.1 + this.entityManager.glucoseCollected * 0.05;
    player.genome.dnaPoints += dnaPoints;

    // Show generation report
    this.uiController.showGenerationReport({
      generation: player.genome.lineage.generation + 1,
      survivalTime: player.survivalTime,
      resourcesCollected: this.entityManager.glucoseCollected,
      mutations: player.genome.lineage.mutations,
      dnaPointsEarned: dnaPoints,
    });

    // Wait for user to continue, then reproduction happens in the callback
    if (this.pendingModifications) {
      this.entityManager.reproducePlayer(this.pendingModifications);
      this.pendingModifications = null;
    } else {
      // Auto-reproduce with no modifications
      this.entityManager.reproducePlayer();
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
