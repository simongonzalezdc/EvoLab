// Main game loop using requestAnimationFrame

import { PixiApp } from '../rendering/PixiApp';
import { InputHandler } from './InputHandler';
import { EntityManager } from '../entities/EntityManager';
import { Config } from './Config';
import { UIController } from '../ui/UIController';
import { TimeControl } from './TimeControl';
import { SaveSystem } from '../data/SaveSystem';
import { HistoryTracker } from '../data/HistoryTracker';
import type { Traits } from '../types/entities';
import type { GameSettings, SavedSimulation, SavedCreature } from '../data/SaveSystem';

import { BiomeGenerator } from '../environment/BiomeGenerator';
import { BiomeRenderer } from '../rendering/BiomeRenderer';
import { DayNightCycle } from '../environment/DayNightCycle';
import { Genome } from '../genetics/Genome';

export class GameLoop {
  private renderer: PixiApp;
  private inputHandler: InputHandler;
  private entityManager: EntityManager;
  private uiController: UIController;
  private timeControl: TimeControl;
  private saveSystem: SaveSystem;
  private historyTracker: HistoryTracker;
  private biomeGenerator: BiomeGenerator;
  private biomeRenderer: BiomeRenderer;
  private dayNightCycle: DayNightCycle;
  private lastTime = 0;
  private isRunning = false;
  private animationFrameId: number | null = null;
  private pendingModifications: Partial<Traits> | null = null;
  private lastAutoSave = 0;
  private autoSaveInterval = 5 * 60 * 1000; // 5 minutes default

  constructor() {
    this.renderer = new PixiApp();
    this.inputHandler = new InputHandler();
    this.entityManager = new EntityManager(this.renderer);
    this.timeControl = new TimeControl();
    this.saveSystem = new SaveSystem();
    this.historyTracker = new HistoryTracker();
    this.uiController = new UIController(this.timeControl, this.saveSystem);
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

    this.uiController.setNewGameCallback(() => {
      this.resetGame();
    });

    this.uiController.setLoadSimulationCallback((sim: SavedSimulation) => {
      this.loadSimulation(sim);
    });

    this.uiController.setLoadCreatureCallback((creature: SavedCreature) => {
      this.loadCreature(creature);
    });

    this.uiController.setSettingsChangeCallback((settings: GameSettings) => {
      this.applySettings(settings);
    });

    this.uiController.setExportHistoryCallback(() => {
      this.exportHistory();
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

    // Record birth in history tracker
    if (this.entityManager.playerCell) {
      this.historyTracker.recordBirth(
        this.entityManager.playerCell.id,
        this.entityManager.playerCell.genome,
        null,
        true
      );
    }

    // Spawn resources
    this.entityManager.spawnResources();

    // Show tutorial on first launch
    const hasSeenTutorial = localStorage.getItem('evolab_tutorial_seen');
    if (!hasSeenTutorial) {
      setTimeout(() => {
        this.uiController.showTutorial();
        localStorage.setItem('evolab_tutorial_seen', 'true');
      }, 1000);
    }

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

    // Calculate base delta time
    const baseDeltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1); // Cap at 100ms
    this.lastTime = currentTime;

    // Apply time control multiplier
    const deltaTime = this.timeControl.getEffectiveDeltaTime(baseDeltaTime);

    if (deltaTime > 0) {
      this.update(deltaTime);
      this.render();
    }

    // Auto-save check
    if (currentTime - this.lastAutoSave > this.autoSaveInterval) {
      this.autoSave();
      this.lastAutoSave = currentTime;
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

    // Update population tracking (every second in game time)
    this.updatePopulationTracking();

    // Update HUD
    this.updateHUD();

    // Update stats UI
    if (player) {
      this.uiController.updateStats(
        player.traits,
        this.historyTracker.getCurrentGeneration(),
        this.historyTracker.getPopulationData(),
        this.historyTracker.getLineageTree()
      );
    }
  }

  private updatePopulationTracking(): void {
    const stats = this.entityManager.getPopulationStats();
    this.historyTracker.addPopulationSnapshot(
      stats.herbivore || 0,
      stats.carnivore || 0,
      stats.omnivore || 0,
      stats.player || 0
    );
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

  // Reset game to initial state
  private resetGame(): void {
    this.stop();
    this.entityManager.dispose();
    this.historyTracker.reset();
    this.timeControl.reset();
    this.dayNightCycle = new DayNightCycle(12, 10);
    this.entityManager = new EntityManager(this.renderer);
    this.entityManager.createPlayerCell();
    this.entityManager.spawnResources();

    // Record new player birth
    if (this.entityManager.playerCell) {
      this.historyTracker.recordBirth(
        this.entityManager.playerCell.id,
        this.entityManager.playerCell.genome,
        null,
        true
      );
    }

    this.start();
    console.log('Game reset');
  }

  // Load a saved simulation
  private async loadSimulation(sim: SavedSimulation): Promise<void> {
    try {
      this.stop();

      // Restore player
      const playerGenome = Genome.createDefault();
      playerGenome.traits = sim.playerData.genome.traits;
      playerGenome.lineage = sim.playerData.genome.lineage;
      playerGenome.dnaPoints = sim.playerData.genome.dnaPoints;

      this.entityManager.dispose();
      this.entityManager = new EntityManager(this.renderer);
      this.entityManager.createPlayerCell();

      if (this.entityManager.playerCell) {
        this.entityManager.playerCell.genome = playerGenome;
        this.entityManager.playerCell.traits = playerGenome.traits;
        this.entityManager.playerCell.position = sim.playerData.position;
        this.entityManager.playerCell.traits.atp = sim.playerData.atp;
      }

      // Restore history
      const historyData = JSON.parse(sim.historyData);
      // Note: Would need to fully deserialize history tracker here

      // Restore settings
      this.applySettings(sim.settings);

      this.start();
      console.log('Simulation loaded');
    } catch (error) {
      console.error('Failed to load simulation:', error);
      alert('Failed to load simulation');
    }
  }

  // Load a saved creature
  private loadCreature(creature: SavedCreature): void {
    if (this.entityManager.playerCell) {
      this.entityManager.playerCell.genome = creature.genome;
      this.entityManager.playerCell.traits = creature.genome.traits;
      console.log('Creature loaded:', creature.name);
    }
  }

  // Apply settings
  private applySettings(settings: GameSettings): void {
    this.autoSaveInterval = settings.autoSaveInterval * 60 * 1000;
    // Apply other settings as needed
    console.log('Settings applied');
  }

  // Export evolution history to CSV
  private exportHistory(): void {
    const csv = this.historyTracker.exportToCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `evolab-history-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    console.log('History exported');
  }

  // Auto-save current state
  private async autoSave(): Promise<void> {
    if (!this.entityManager.playerCell) return;

    try {
      const player = this.entityManager.playerCell;
      const stats = this.entityManager.getPopulationStats();

      await this.saveSystem.saveSimulation(
        `AutoSave-${new Date().toLocaleString()}`,
        {
          genome: player.genome,
          position: player.position,
          atp: player.traits.atp,
        },
        {
          herbivores: stats.herbivore || 0,
          carnivores: stats.carnivore || 0,
          omnivores: stats.omnivore || 0,
        },
        this.historyTracker.exportToJSON(),
        this.historyTracker.getCurrentGeneration(),
        this.saveSystem.getDefaultSettings()
      );

      console.log('Auto-saved');
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  // Dispose resources
  dispose(): void {
    this.stop();
    this.entityManager.dispose();
    this.renderer.dispose();
    this.inputHandler.dispose();
  }
}
