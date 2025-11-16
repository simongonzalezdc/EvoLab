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
import { EvolutionSystemsManager } from './EvolutionSystemsManager';
import { AutoPilot } from './AutoPilot';
import { Cell } from '../entities/Cell';

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
  private evolutionSystems: EvolutionSystemsManager;
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
  private autoPilot: AutoPilot;
  private autoMode = false; // Auto-pilot mode (cell manages itself)

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
    this.evolutionSystems = new EvolutionSystemsManager({
      lakeWidth: Config.LAKE_WIDTH,
      lakeHeight: Config.LAKE_HEIGHT,
      enablePhysics: false, // Start disabled, can be toggled
      enableSexualReproduction: false, // Start with asexual
      enableSpeciation: false, // Start disabled
    });
    this.currentSettings = this.saveSystem.getDefaultSettings();
    this.autoPilot = new AutoPilot();

    // Initialize base species for speciation system
    const baseGenome = Genome.createDefault();
    this.evolutionSystems.initializeBaseSpecies(baseGenome, 10);

    // Setup achievement unlock callback
    this.achievementSystem.onAchievementUnlocked((achievement) => {
      this.uiController.showAchievementNotification(achievement);
    });

    // Setup UI callbacks
    this.setupUICallbacks();

    // Setup zoom controls
    this.setupZoomControls();

    // Load saved settings
    this.loadSettings();
  }

  private setupZoomControls(): void {
    // Mouse wheel zoom
    this.inputHandler.onZoom((delta) => {
      const currentZoom = this.renderer.getZoom();
      const newZoom = currentZoom + delta;
      this.renderer.setZoom(newZoom);
    });

    // Keyboard zoom
    this.inputHandler.onZoomIn(() => {
      this.renderer.zoomIn();
    });

    this.inputHandler.onZoomOut(() => {
      this.renderer.zoomOut();
    });

    this.inputHandler.onResetZoom(() => {
      this.renderer.resetZoom();
    });
  }

  private setupUICallbacks(): void {
    this.uiController.onApply((modifications) => {
      // Apply evolution modifications to species
      if (this.entityManager.playerSpecies) {
        // Apply evolution (even if modifications are empty, generation still advances)
        this.entityManager.playerSpecies.applyEvolution(modifications);
        // Close trait editor after applying
        this.uiController.hideTraitEditor();
      } else if (this.entityManager.playerCell) {
        // Legacy single-cell mode
        this.pendingModifications = modifications;
      }
    });

    this.uiController.onReportContinue(() => {
      // Show trait editor after generation report (species-level)
      if (this.entityManager.playerSpecies) {
        const stats = this.entityManager.playerSpecies.getStats();
        const baseGenome = this.entityManager.playerSpecies.getBaseGenome();
        const avgTraits = stats.averageTraits as Traits;
        this.uiController.showTraitEditor(
          avgTraits,
          stats.generation,
          baseGenome.dnaPoints
        );
      } else if (this.entityManager.playerCell) {
        // Legacy single-cell mode
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

    // Evolution systems callbacks
    this.uiController.setTogglePhysicsCallback(() => {
      this.evolutionSystems.togglePhysics();
    });

    this.uiController.setToggleReproductionModeCallback(() => {
      this.evolutionSystems.toggleSexualReproduction();
    });

    this.uiController.setToggleSpeciationCallback(() => {
      this.evolutionSystems.toggleSpeciation();
    });

    this.uiController.setShowPhylogeneticTreeCallback(() => {
      this.showPhylogeneticTree();
    });

    this.uiController.setToggleAutoModeCallback(() => {
      this.toggleAutoMode();
    });

    this.uiController.setAutoModeStateCallback(() => {
      return this.autoMode;
    });

    // Setup zoom callbacks
    this.uiController.setZoomCallbacks(
      () => this.renderer.getZoom(),
      () => this.renderer.zoomIn(),
      () => this.renderer.zoomOut(),
      () => this.renderer.resetZoom()
    );

    // Setup music manager callback
    this.uiController.setMusicManagerCallback(() => this.musicManager);

    // Setup music preset hotkeys
    window.addEventListener('musicPresetChange', ((e: CustomEvent<number>) => {
      const presetIndex = e.detail;
      this.musicManager.applyPreset(presetIndex);
    }) as EventListener);

    // Setup biome highlight handler
    window.addEventListener('biomeHighlight', ((e: CustomEvent<string | null>) => {
      const biomeType = e.detail;
      this.biomeRenderer.setHighlightedBiome(biomeType);
    }) as EventListener);
  }

  // Toggle auto-pilot mode
  toggleAutoMode(): void {
    this.autoMode = !this.autoMode;
  }

  // Get auto mode state
  getAutoMode(): boolean {
    return this.autoMode;
  }

  private showPhylogeneticTree(): void {
    const tree = this.evolutionSystems.getPhylogeneticTree();
    const species = this.evolutionSystems.getAllSpecies();
    this.uiController.showPhylogeneticTree(tree, species);
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

    // Create player species (species-level gameplay)
    this.entityManager.createPlayerSpecies();

    // Set up species extinction check (species-level gameplay)
    // Species extinction will be checked in the update loop

    // Initialize camera to species position immediately
    if (this.entityManager.playerSpecies) {
      const speciesCenter = this.entityManager.playerSpecies.getCenterPosition();
      this.renderer.updateCamera(speciesCenter.x, speciesCenter.y);
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

    // Species-level gameplay: no direct control, species manages itself
    // Auto-pilot is always enabled for species-level view

    // Update achievement tracking
    this.updateAchievements(deltaTime);

    // Apply environmental hazards
    this.applyEnvironmentalHazards(deltaTime);

    // Update all entities (species-level gameplay)
    this.entityManager.update(deltaTime, true); // Always use auto-mode for species

    // Update evolution systems (physics, mating, speciation)
    const allCells = this.entityManager.getAllCells();
    this.evolutionSystems.update(deltaTime, allCells);

    // Update camera to follow species center (species-level view)
    if (this.entityManager.playerSpecies) {
      const speciesCenter = this.entityManager.playerSpecies.getCenterPosition();
      const speciesCells = this.entityManager.playerSpecies.getAllCells();
      
      // Only update camera if we have valid coordinates and cells exist
      if (speciesCells.length > 0 && !isNaN(speciesCenter.x) && !isNaN(speciesCenter.y) && isFinite(speciesCenter.x) && isFinite(speciesCenter.y)) {
        // Calculate species spread to determine if we should zoom out
        let maxDistance = 0;
        speciesCells.forEach(cell => {
          const dist = Math.sqrt(
            Math.pow(cell.position.x - speciesCenter.x, 2) +
            Math.pow(cell.position.y - speciesCenter.y, 2)
          );
          if (dist > maxDistance) maxDistance = dist;
        });
        
        // Update camera to species center
        this.renderer.updateCamera(speciesCenter.x, speciesCenter.y);

        // Update biome rendering around camera (with wider view for species)
        const canvasWidth = this.renderer.app.canvas.width;
        const canvasHeight = this.renderer.app.canvas.height;
        const viewWidth = Math.max(canvasWidth, maxDistance * 2 + 200);
        const viewHeight = Math.max(canvasHeight, maxDistance * 2 + 200);
        this.biomeRenderer.render(
          speciesCenter.x,
          speciesCenter.y,
          viewWidth,
          viewHeight
        );
      }

      // Check for species extinction
      if (this.entityManager.playerSpecies.isExtinct()) {
        const stats = this.entityManager.playerSpecies.getStats();
        this.uiController.showDeathScreen(
          stats.generation,
          stats.averageSurvivalTime,
          stats.totalResourcesCollected,
          'atp' // Species went extinct
        );
      }
    }
    // Note: Always use species-level view - single-cell mode removed

    // Update lighting based on day/night
    const lightLevel = this.dayNightCycle.getLightLevel();
    this.biomeRenderer.updateLighting(lightLevel);

    // Update music based on game state
    this.updateMusic();

    // Update population tracking (every second in game time)
    this.updatePopulationTracking();

    // Update HUD
    this.updateHUD();

    // Update stats UI (species-level)
    if (this.entityManager.playerSpecies) {
      const speciesStats = this.entityManager.playerSpecies.getStats();
      // Use average traits for display
      const avgTraits = speciesStats.averageTraits as Traits;
      this.uiController.updateStats(
        avgTraits,
        speciesStats.generation,
        this.historyTracker.getPopulationData(),
        this.historyTracker.getLineageTree()
      );

      // Update evolution control panel
      this.uiController.updateEvolutionControls(
        this.evolutionSystems.physicsEnabled,
        this.evolutionSystems.sexualReproductionEnabled ? 'sexual' : 'asexual',
        this.evolutionSystems.speciationEnabled,
        this.evolutionSystems.getSpeciesCount(),
        this.evolutionSystems.getMatingStats()
      );
    } else if (this.entityManager.playerCell) {
      // Legacy single-cell mode
      const player = this.entityManager.playerCell;
      this.uiController.updateStats(
        player.traits,
        this.historyTracker.getCurrentGeneration(),
        this.historyTracker.getPopulationData(),
        this.historyTracker.getLineageTree()
      );

      // Update evolution control panel
      this.uiController.updateEvolutionControls(
        this.evolutionSystems.physicsEnabled,
        this.evolutionSystems.sexualReproductionEnabled ? 'sexual' : 'asexual',
        this.evolutionSystems.speciationEnabled,
        this.evolutionSystems.getSpeciesCount(),
        this.evolutionSystems.getMatingStats()
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
    // Get species center or player position for music
    let position: { x: number; y: number } = { x: Config.PLAYER_START_X, y: Config.PLAYER_START_Y };
    let generation = 1;
    
    if (this.entityManager.playerSpecies) {
      position = this.entityManager.playerSpecies.getCenterPosition();
      generation = this.entityManager.playerSpecies.getStats().generation;
    } else if (this.entityManager.playerCell) {
      position = this.entityManager.playerCell.position;
      generation = this.entityManager.playerCell.genome.lineage.generation;
    } else {
      return;
    }

    // Get current biome at species center position
    const biome = this.biomeGenerator.getBiomeAt(position.x, position.y);

    // Calculate combat intensity based on nearby threats
    const combatIntensity = this.calculateCombatIntensity();

    // Update music state
    this.musicManager.updateState({
      biome: biome.type,
      timeOfDay: this.dayNightCycle.getTimeOfDay(),
      lightLevel: this.dayNightCycle.getLightLevel(),
      combatIntensity,
      generation,
    });
  }

  private calculateCombatIntensity(): number {
    // Calculate combat intensity based on nearby threats to species
    if (this.entityManager.playerSpecies) {
      const speciesCells = this.entityManager.playerSpecies.getAllCells();
      if (speciesCells.length === 0) return 0;
      
      // Check for nearby predators
      const allCells = this.entityManager.getAllCells();
      let threatCount = 0;
      speciesCells.forEach(cell => {
        allCells.forEach(otherCell => {
          if (otherCell.id !== cell.id && !speciesCells.includes(otherCell)) {
            const distance = Math.sqrt(
              Math.pow(cell.position.x - otherCell.position.x, 2) +
              Math.pow(cell.position.y - otherCell.position.y, 2)
            );
            if (distance < 100 && otherCell.traits.aggression > 6) {
              threatCount++;
            }
          }
        });
      });
      return Math.min(1, threatCount / speciesCells.length);
    }
    
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
    // Apply hazards to all cells in player species
    if (this.entityManager.playerSpecies) {
      const speciesCells = this.entityManager.playerSpecies.getAllCells();
      speciesCells.forEach(cell => {
        const biome = this.biomeGenerator.getBiomeAt(cell.position.x, cell.position.y);
        this.applyHazardsToCell(cell, biome, deltaTime);
      });
    } else if (this.entityManager.playerCell) {
      // Legacy single-cell mode
      const player = this.entityManager.playerCell;
      const biome = this.biomeGenerator.getBiomeAt(player.position.x, player.position.y);
      this.applyHazardsToCell(player, biome, deltaTime);
    }
  }

  private applyHazardsToCell(cell: Cell, biome: any, deltaTime: number): void {
    for (const hazard of biome.hazards) {
      switch (hazard.type) {
        case 'current': {
          // Apply current force to push cell
          if (hazard.direction) {
            const currentForce = hazard.intensity * 50 * deltaTime;
            cell.applyForce(hazard.direction, currentForce);
          }
          break;
        }

        case 'temperature': {
          // Extreme temperatures cause damage over time
          // Damage scales with intensity and is reduced by armor
          const tempDamage = hazard.intensity * 2 * deltaTime;
          const armorReduction = cell.traits.armor * 0.1;
          const finalTempDamage = Math.max(0, tempDamage - armorReduction);
          cell.traits.health -= finalTempDamage;
          break;
        }

        case 'oxygen': {
          // Low oxygen reduces ATP regeneration
          // Reduces effectiveness of metabolism
          const oxygenPenalty = hazard.intensity * 0.5;
          const atpDrain = oxygenPenalty * cell.traits.metabolismRate * deltaTime;
          cell.traits.atp = Math.max(0, cell.traits.atp - atpDrain);
          break;
        }

        case 'radiation': {
          // Radiation causes gradual health damage
          const radiationDamage = hazard.intensity * 1.5 * deltaTime;
          const radiationArmorReduction = cell.traits.armor * 0.05;
          const finalRadDamage = Math.max(0, radiationDamage - radiationArmorReduction);
          cell.traits.health -= finalRadDamage;
          break;
        }

        case 'pressure': {
          // High pressure slows movement and causes damage
          // Pressure damage (armor helps significantly)
          const pressureDamage = hazard.intensity * 1 * deltaTime;
          const pressureArmorReduction = cell.traits.armor * 0.15;
          const finalPressureDamage = Math.max(0, pressureDamage - pressureArmorReduction);
          cell.traits.health -= finalPressureDamage;
          break;
        }
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
    // Species-level HUD
    if (this.entityManager.playerSpecies) {
      const stats = this.entityManager.playerSpecies.getStats();
      const avgTraits = stats.averageTraits as Traits;
      
      // Update ATP (average)
      const atpValue = document.getElementById('atp-value');
      if (atpValue) {
        atpValue.textContent = Math.floor(avgTraits.atp || 0).toString();
      }

      // Update Health (average)
      const healthValue = document.getElementById('health-value');
      if (healthValue) {
        healthValue.textContent = Math.floor(avgTraits.health || 0).toString();
      }

      // Update Generation
      const generationValue = document.getElementById('generation-value');
      if (generationValue) {
        generationValue.textContent = stats.generation.toString();
      }

      // Update DNA Points
      const dnaValue = document.getElementById('dna-value');
      if (dnaValue) {
        const baseGenome = this.entityManager.playerSpecies.getBaseGenome();
        dnaValue.textContent = Math.floor(baseGenome.dnaPoints).toString();
      }

      // Update Population (species size)
      const populationValue = document.getElementById('population-value');
      if (populationValue) {
        populationValue.textContent = stats.population.toString();
      }

      // Update Time of Day
      const timeValue = document.getElementById('time-value');
      if (timeValue) {
        const time = this.dayNightCycle.getTime();
        const hours = Math.floor(time);
        const minutes = Math.floor((time % 1) * 60);
        timeValue.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }

      // Evolution button - show when species is ready (based on average survival time)
      const reproduceBtn = document.getElementById('reproduce-btn') as HTMLButtonElement;
      if (reproduceBtn) {
        // Show evolution button periodically (every 30 seconds of average survival)
        const canEvolve = stats.averageSurvivalTime > 30 && stats.population > 0;
        reproduceBtn.style.display = canEvolve ? 'block' : 'none';
        reproduceBtn.textContent = '🧬 Evolve Species';

        // Add click handler if not already added
        if (canEvolve && !reproduceBtn.onclick) {
          reproduceBtn.onclick = () => this.handleReproduction();
        }
      }
      return;
    }

    // Legacy single-cell HUD
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

  // Handle reproduction trigger (species-level evolution)
  private handleReproduction(): void {
    if (this.entityManager.playerSpecies) {
      // Species-level evolution
      const stats = this.entityManager.playerSpecies.getStats();
      const baseGenome = this.entityManager.playerSpecies.getBaseGenome();
      
      // Calculate DNA points from species performance
      const dnaPoints = stats.averageSurvivalTime * Config.DNA_FROM_SURVIVAL_TIME + 
                         stats.totalResourcesCollected * Config.DNA_FROM_GLUCOSE;
      baseGenome.dnaPoints += dnaPoints;

      // Show generation report
      // Evolution will be applied when user clicks "Apply" in trait editor
      this.uiController.showGenerationReport({
        generation: stats.generation + 1,
        survivalTime: stats.averageSurvivalTime,
        resourcesCollected: stats.totalResourcesCollected,
        mutations: baseGenome.lineage.mutations,
        dnaPointsEarned: dnaPoints,
      });

      // Evolution is applied via onApply callback when user clicks "Apply" in trait editor
    } else if (this.entityManager.playerCell) {
      // Legacy single-cell mode
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
    this.entityManager.createPlayerSpecies(); // Species-level gameplay

    // Initialize camera to species position
    if (this.entityManager.playerSpecies) {
      const speciesCenter = this.entityManager.playerSpecies.getCenterPosition();
      this.renderer.updateCamera(speciesCenter.x, speciesCenter.y);
    }

    this.entityManager.spawnResources();

    this.start();
  }

  // Load a saved simulation
  private async loadSimulation(sim: SavedSimulation): Promise<void> {
    try {
      this.stop();

      // Restore player species
      const playerGenome = Genome.createDefault();
      playerGenome.traits = sim.playerData.genome.traits;
      playerGenome.lineage = sim.playerData.genome.lineage;
      playerGenome.dnaPoints = sim.playerData.genome.dnaPoints;

      this.entityManager.dispose();
      this.entityManager = new EntityManager(this.renderer);
      this.entityManager.createPlayerSpecies(playerGenome); // Species-level gameplay
      
      // Initialize camera to species position
      if (this.entityManager.playerSpecies) {
        const speciesCenter = this.entityManager.playerSpecies.getCenterPosition();
        this.renderer.updateCamera(speciesCenter.x, speciesCenter.y);
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
      } else {
        // Apply default settings if none are saved
        const defaultSettings = this.saveSystem.getDefaultSettings();
        this.currentSettings = defaultSettings;
        this.applySettings(defaultSettings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Apply defaults on error
      const defaultSettings = this.saveSystem.getDefaultSettings();
      this.currentSettings = defaultSettings;
      this.applySettings(defaultSettings);
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
    this.evolutionSystems.dispose();
  }
}
