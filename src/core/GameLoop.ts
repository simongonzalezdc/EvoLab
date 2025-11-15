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
import { MusicManager } from '../audio/MusicManager';
import { AchievementSystem } from '../achievements/AchievementSystem';
import type { Achievement } from '../achievements/AchievementSystem';

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
  private musicManager: MusicManager;
  private achievementSystem: AchievementSystem;
  private lastTime = 0;
  private isRunning = false;
  private animationFrameId: number | null = null;
  private pendingModifications: Partial<Traits> | null = null;
  private lastAutoSave = 0;
  private autoSaveInterval = Config.AUTO_SAVE_INTERVAL_MINUTES * 60 * 1000;
  private currentSettings: GameSettings;
  private survivalTimeTracker = 0;
  private totalKills = 0;
  private carnivoreKills = 0;
  private visitedBiomes: Set<string> = new Set();
  private totalGlucoseCollected = 0;

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
    this.dayNightCycle = new DayNightCycle(Config.DAY_NIGHT_START_TIME, Config.DAY_NIGHT_SPEED_MULTIPLIER);
    this.musicManager = new MusicManager();
    this.achievementSystem = new AchievementSystem();
    this.currentSettings = this.saveSystem.getDefaultSettings();

    // Setup achievement unlock callback
    this.achievementSystem.onAchievementUnlocked((achievement) => {
      this.uiController.showAchievementNotification(achievement);
    });

    // Setup UI callbacks
    this.setupUICallbacks();

    // Load saved settings
    this.loadSettings();
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

    this.uiController.setRestartCallback(() => {
      this.resetGame();
    });

    this.uiController.setAchievementsCallback(() => {
      this.showAchievementsPanel();
    });
  }

  private showAchievementsPanel(): void {
    this.uiController.showAchievements(
      this.achievementSystem.getAllAchievements(),
      this.achievementSystem.getAllChallenges()
    );
  }

  async initialize(): Promise<void> {
    // console.log('Initializing EvoLab...');

    // Initialize renderer
    await this.renderer.initialize();

    // Initialize music manager
    await this.musicManager.initialize();

    // Load achievement progress
    const achievementData = await this.saveSystem.loadAchievements();
    if (achievementData) {
      this.achievementSystem.importProgress(achievementData);
    }

    // Add biome layer to renderer (underneath entities)
    this.renderer.addBiomeLayer(this.biomeRenderer.getContainer());

    // Create player cell
    this.entityManager.createPlayerCell();

    // Set up death callback for player
    if (this.entityManager.playerCell) {
      this.entityManager.playerCell.setDeathCallback((cause) => {
        const player = this.entityManager.playerCell;
        if (player) {
          this.uiController.showDeathScreen(
            player.genome.lineage.generation,
            player.survivalTime,
            this.entityManager.glucoseCollected,
            cause
          );
        }
      });
    }

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

    // console.log('Game initialized successfully!');
  }

  // Start the game loop
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
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

    // Update achievement tracking
    this.updateAchievements(deltaTime);

    // Apply environmental hazards
    this.applyEnvironmentalHazards(deltaTime);

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

    // Update music based on game state
    this.updateMusic();

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

  private updateMusic(): void {
    const player = this.entityManager.playerCell;
    if (!player) return;

    // Get current biome at player position
    const biome = this.biomeGenerator.getBiomeAt(player.position.x, player.position.y);

    // Calculate combat intensity based on nearby threats
    const combatIntensity = this.calculateCombatIntensity();

    // Update music state
    this.musicManager.updateState({
      biome: biome.type,
      timeOfDay: this.dayNightCycle.getTimeOfDay(),
      lightLevel: this.dayNightCycle.getLightLevel(),
      combatIntensity,
      generation: player.genome.lineage.generation,
    });
  }

  private calculateCombatIntensity(): number {
    const player = this.entityManager.playerCell;
    if (!player) return 0;

    // Check for nearby cells within detection range
    // Cells larger than player are considered threats
    let closestThreatDistance = Infinity;

    for (const cell of this.entityManager.getAllCells()) {
      if (cell === player) continue;
      if (cell.traits.health <= 0) continue; // Skip dead cells

      // Larger cells are potential threats
      const isThreat = cell.traits.size > player.traits.size * 0.8;

      if (isThreat) {
        const dx = cell.position.x - player.position.x;
        const dy = cell.position.y - player.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < closestThreatDistance) {
          closestThreatDistance = distance;
        }
      }
    }

    // Combat intensity: 0 at far distances, 1 at very close
    const maxDetectionRange = 300;
    if (closestThreatDistance === Infinity) return 0;

    return Math.max(0, 1 - (closestThreatDistance / maxDetectionRange));
  }

  private updateAchievements(deltaTime: number): void {
    const player = this.entityManager.playerCell;
    if (!player) return;

    // Track survival time
    this.survivalTimeTracker += deltaTime;
    this.achievementSystem.trackProgress('first_steps', this.survivalTimeTracker);
    this.achievementSystem.trackProgress('survivor', this.survivalTimeTracker);
    this.achievementSystem.trackProgress('endurance_master', this.survivalTimeTracker);
    this.achievementSystem.trackProgress('immortal', this.survivalTimeTracker);

    // Track generation
    const generation = player.genome.lineage.generation;
    this.achievementSystem.trackProgress('first_evolution', generation);
    this.achievementSystem.trackProgress('evolution_master', generation);
    this.achievementSystem.trackProgress('ancient_lineage', generation);

    // Track DNA points
    this.achievementSystem.trackProgress('gene_collector', player.genome.dnaPoints);

    // Track glucose collected
    this.totalGlucoseCollected = this.entityManager.glucoseCollected;
    this.achievementSystem.trackProgress('resource_collector', this.totalGlucoseCollected);
    this.achievementSystem.trackProgress('hoarder', this.totalGlucoseCollected);

    // Track biomes visited
    const currentBiome = this.biomeGenerator.getBiomeAt(player.position.x, player.position.y);
    if (!this.visitedBiomes.has(currentBiome.type)) {
      this.visitedBiomes.add(currentBiome.type);
      this.achievementSystem.trackProgress('explorer', this.visitedBiomes.size);
      this.achievementSystem.trackProgress('world_traveler', this.visitedBiomes.size);
    }

    // Track trait achievements
    this.achievementSystem.trackProgress('speed_demon', player.traits.speed);
    this.achievementSystem.trackProgress('tank_build', player.traits.armor);
    this.achievementSystem.trackProgress('giant', player.traits.size);
    this.achievementSystem.trackProgress('genius', player.traits.intelligence);

    // Track perfect specimen (5 traits at max)
    const maxTraitCount = [
      player.traits.speed,
      player.traits.armor,
      player.traits.size,
      player.traits.intelligence,
      player.traits.metabolismRate,
    ].filter(t => t >= 10).length;
    this.achievementSystem.trackProgress('perfect_specimen', maxTraitCount);

    // Track close call achievement
    const healthPercent = player.traits.health / player.traits.maxHealth;
    if (healthPercent < 0.05 && healthPercent > 0) {
      this.achievementSystem.incrementProgress('close_call', 1);
    }

    // Pacifist achievement - check if reached gen 5 with 0 kills
    if (generation >= 5 && this.totalKills === 0) {
      this.achievementSystem.trackProgress('pacifist', generation);
    }
  }

  // Call this when player kills another cell
  public trackKill(victimSize: number, victimType: string): void {
    this.totalKills++;
    this.achievementSystem.incrementProgress('first_kill', 1);
    this.achievementSystem.incrementProgress('predator', 1);
    this.achievementSystem.incrementProgress('apex_predator', 1);

    if (victimType === 'carnivore') {
      this.carnivoreKills++;
      this.achievementSystem.incrementProgress('carnivore_hunter', 1);
    }

    // Check underdog achievement
    const player = this.entityManager.playerCell;
    if (player && victimSize > player.traits.size * 2) {
      this.achievementSystem.incrementProgress('underdog', 1);
    }
  }

  private applyEnvironmentalHazards(deltaTime: number): void {
    const player = this.entityManager.playerCell;
    if (!player) return;

    const biome = this.biomeGenerator.getBiomeAt(player.position.x, player.position.y);

    for (const hazard of biome.hazards) {
      switch (hazard.type) {
        case 'current':
          // Apply current force to push player
          if (hazard.direction) {
            const currentForce = hazard.intensity * 50 * deltaTime;
            player.applyForce(hazard.direction, currentForce);
          }
          break;

        case 'temperature':
          // Extreme temperatures cause damage over time
          // Damage scales with intensity and is reduced by armor
          const tempDamage = hazard.intensity * 2 * deltaTime;
          const armorReduction = player.traits.armor * 0.1;
          const finalTempDamage = Math.max(0, tempDamage - armorReduction);
          player.traits.health -= finalTempDamage;
          break;

        case 'oxygen':
          // Low oxygen reduces ATP regeneration
          // Reduces effectiveness of metabolism
          const oxygenPenalty = hazard.intensity * 0.5;
          const atpDrain = oxygenPenalty * player.traits.metabolismRate * deltaTime;
          player.traits.atp = Math.max(0, player.traits.atp - atpDrain);
          break;

        case 'radiation':
          // Radiation causes gradual health damage
          const radiationDamage = hazard.intensity * 1.5 * deltaTime;
          const radiationArmorReduction = player.traits.armor * 0.05;
          const finalRadDamage = Math.max(0, radiationDamage - radiationArmorReduction);
          player.traits.health -= finalRadDamage;
          break;

        case 'pressure':
          // High pressure slows movement and causes damage
          // Speed penalty (applied as reduced effectiveness)
          const pressurePenalty = hazard.intensity * 0.3;

          // Pressure damage (armor helps significantly)
          const pressureDamage = hazard.intensity * 1 * deltaTime;
          const pressureArmorReduction = player.traits.armor * 0.15;
          const finalPressureDamage = Math.max(0, pressureDamage - pressureArmorReduction);
          player.traits.health -= finalPressureDamage;
          break;
      }
    }
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
    const dnaPoints = player.survivalTime * Config.DNA_FROM_SURVIVAL_TIME + this.entityManager.glucoseCollected * Config.DNA_FROM_GLUCOSE;
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
  }

  // Reset game to initial state
  private resetGame(): void {
    this.stop();
    this.entityManager.dispose();
    this.historyTracker.reset();
    this.timeControl.reset();
    this.dayNightCycle = new DayNightCycle(Config.DAY_NIGHT_START_TIME, Config.DAY_NIGHT_SPEED_MULTIPLIER);
    this.entityManager = new EntityManager(this.renderer);
    this.entityManager.createPlayerCell();

    // Set up death callback for new player
    if (this.entityManager.playerCell) {
      this.entityManager.playerCell.setDeathCallback((cause) => {
        const player = this.entityManager.playerCell;
        if (player) {
          this.uiController.showDeathScreen(
            player.genome.lineage.generation,
            player.survivalTime,
            this.entityManager.glucoseCollected,
            cause
          );
        }
      });
    }

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

        // Set up death callback
        this.entityManager.playerCell.setDeathCallback((cause) => {
          const player = this.entityManager.playerCell;
          if (player) {
            this.uiController.showDeathScreen(
              player.genome.lineage.generation,
              player.survivalTime,
              this.entityManager.glucoseCollected,
              cause
            );
          }
        });
      }

      // Restore history
      this.historyTracker.importFromJSON(sim.historyData);

      // Restore settings
      this.applySettings(sim.settings);

      this.start();
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
    }
  }

  // Load settings from storage
  private async loadSettings(): Promise<void> {
    try {
      const savedSettings = await this.saveSystem.loadSettings();
      if (savedSettings) {
        this.currentSettings = savedSettings;
        this.applySettings(savedSettings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  // Apply settings
  private applySettings(settings: GameSettings): void {
    this.currentSettings = settings;
    this.autoSaveInterval = settings.autoSaveInterval * 60 * 1000;

    // Apply music settings
    if (settings.musicEnabled) {
      this.musicManager.enable();
    } else {
      this.musicManager.disable();
    }

    // Save settings
    this.saveSystem.saveSettings(settings).catch(err => {
      console.error('Failed to save settings:', err);
    });
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

      // Save achievement progress
      const achievementData = this.achievementSystem.exportProgress();
      await this.saveSystem.saveAchievements(achievementData);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  // Dispose resources
  async dispose(): Promise<void> {
    this.stop();

    // Save achievement progress before disposing
    try {
      const achievementData = this.achievementSystem.exportProgress();
      await this.saveSystem.saveAchievements(achievementData);
    } catch (error) {
      console.error('Failed to save achievements on exit:', error);
    }

    this.entityManager.dispose();
    this.renderer.dispose();
    this.inputHandler.dispose();
    this.musicManager.dispose();
  }
}
