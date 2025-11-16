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
import type { GameSetupOptions } from '../types/game';

import { BiomeGenerator } from '../environment/BiomeGenerator';
import { BiomeRenderer } from '../rendering/BiomeRenderer';
import { DayNightCycle } from '../environment/DayNightCycle';
import { EnvironmentalEffects } from '../rendering/EnvironmentalEffects';
import { Genome } from '../genetics/Genome';
import { MusicManager } from '../audio/MusicManager';
import { AchievementSystem } from '../achievements/AchievementSystem';
import type { Achievement } from '../achievements/AchievementSystem';
import { EvolutionSystemsManager } from './EvolutionSystemsManager';
import { AutoPilot } from './AutoPilot';
import { Cell } from '../entities/Cell';
import { BehaviorType } from '../ai/AIBehavior';
import type { AISpeciesSetup } from '../ai/PopulationManager';
import { EventManager } from '../events/EventManager';
import type { GameEvent } from '../events/EventManager';
import { AtmosphericSystem } from '../environment/AtmosphericSystem';
import { FactionSystem } from './FactionSystem';
import { EcosystemRegulator } from '../ai/EcosystemRegulator';

const MAX_COMPETITOR_SPECIES = 6;

const buildDefaultCompetitionSetup = (): GameSetupOptions => ({
  species: [
    {
      id: 'default-herbivore',
      type: 'herbivore',
      population: Config.HERBIVORE_POPULATION,
      name: 'Herbivore',
    },
    {
      id: 'default-carnivore',
      type: 'carnivore',
      population: Config.CARNIVORE_POPULATION,
      name: 'Carnivore',
    },
    {
      id: 'default-omnivore',
      type: 'omnivore',
      population: Config.OMNIVORE_POPULATION,
      name: 'Omnivore',
    },
  ],
});

const sanitizeCompetitionSetup = (setup?: GameSetupOptions): GameSetupOptions => {
  if (!setup || !Array.isArray(setup.species)) {
    return buildDefaultCompetitionSetup();
  }

  const normalized = setup.species
    .slice(0, MAX_COMPETITOR_SPECIES)
    .map((spec, index) => ({
      id: spec.id || `species-${index + 1}`,
      type: spec.type,
      population: Math.max(1, Math.floor(spec.population || 1)),
      name: spec.name,
    }))
    .filter(spec => spec.population > 0);

  if (normalized.length === 0) {
    return buildDefaultCompetitionSetup();
  }

  return { species: normalized };
};

const mapCompetitorType = (type: string): BehaviorType => {
  switch (type) {
    case 'carnivore':
      return BehaviorType.CARNIVORE;
    case 'omnivore':
      return BehaviorType.OMNIVORE;
    case 'herbivore':
    default:
      return BehaviorType.HERBIVORE;
  }
};

const convertCompetitionSetupToAI = (setup: GameSetupOptions): AISpeciesSetup[] =>
  setup.species.map((spec, index) => ({
    name: spec.name || `Species ${index + 1}`,
    type: mapCompetitorType(spec.type),
    population: Math.max(1, Math.floor(spec.population || 1)),
  }));

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
  private environmentalEffects: EnvironmentalEffects;
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
  private autoMode = true; // Auto-pilot mode (cell manages itself)
  private competitionSetup: GameSetupOptions;
  private hasUnlockedMusic = false;
  private eventManager: EventManager;
  private atmosphericSystem: AtmosphericSystem;
  private factionSystem: FactionSystem;
  private ecosystemRegulator: EcosystemRegulator;
  private currentEvent: GameEvent | null = null;

  constructor() {
    this.renderer = new PixiApp();
    this.inputHandler = new InputHandler();
    this.biomeGenerator = new BiomeGenerator(Config.LAKE_WIDTH, Config.LAKE_HEIGHT);
    this.competitionSetup = this.sanitizeCompetitionSetup(this.getDefaultCompetitionSetup());
    this.entityManager = new EntityManager(
      this.renderer,
      this.biomeGenerator,
      this.convertCompetitionSetupToAI(this.competitionSetup)
    );
    this.timeControl = new TimeControl();
    this.saveSystem = new SaveSystem();
    this.historyTracker = new HistoryTracker();
    this.uiController = new UIController(this.timeControl, this.saveSystem);
    this.biomeRenderer = new BiomeRenderer(this.biomeGenerator);
    this.dayNightCycle = new DayNightCycle(Config.DAY_NIGHT_START_TIME, Config.DAY_NIGHT_SPEED_MULTIPLIER);
    this.environmentalEffects = new EnvironmentalEffects(this.renderer.particleSystem);
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
    this.autoPilot = new AutoPilot(this.biomeGenerator);

    // Initialize Phase 5 systems
    this.eventManager = new EventManager();
    this.atmosphericSystem = new AtmosphericSystem();
    this.factionSystem = new FactionSystem();
    this.ecosystemRegulator = new EcosystemRegulator();

    // Setup event callback
    this.eventManager.setEventCallback((event) => {
      this.currentEvent = event;
      // TODO: Implement showEventNotification in UIController
      // this.uiController.showEventNotification(event);
      if (Config.DEBUG_GAME_LOOP) {
        console.log('[GameLoop] Event triggered:', event.name);
      }
    });

    // Initialize base species for speciation system
    const baseGenome = Genome.createDefault();
    this.evolutionSystems.initializeBaseSpecies(baseGenome, 10);

    // Setup achievement unlock callback
    this.achievementSystem.onAchievementUnlocked((achievement) => {
      this.uiController.showAchievementNotification(achievement);
    });

    // Setup UI callbacks
    this.setupUICallbacks();
    this.setupMusicUnlock();

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

    this.uiController.setNewGameCallback((options) => {
      this.resetGame(options);
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

  private setupMusicUnlock(): void {
    if (typeof window === 'undefined' || this.hasUnlockedMusic) {
      return;
    }

    const unlock = async () => {
      if (this.hasUnlockedMusic) return;
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      try {
        await this.musicManager.enable();
        this.hasUnlockedMusic = true;
      } catch (error) {
        console.warn('[GameLoop] Failed to unlock music on interaction:', error);
        this.hasUnlockedMusic = false;
        this.setupMusicUnlock();
      }
    };

    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
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
    // Initialize renderer
    await this.renderer.initialize();

    // Initialize music manager (non-blocking to avoid audio context hang)
    try {
      // Don't await this to avoid blocking on audio context
      this.musicManager.initialize().catch(error => {
        console.warn('[GameLoop] Music manager initialization failed (expected on first load):', error);
      });
    } catch (error) {
      console.error('[GameLoop] ERROR: Failed to start music manager initialization:', error);
    }

    // Load achievement progress
    const achievementData = await this.saveSystem.loadAchievements();
    if (achievementData) {
      this.achievementSystem.importProgress(achievementData);
    }

    try {
      // Add biome layer to renderer (underneath entities)
      this.renderer.addBiomeLayer(this.biomeRenderer.getContainer());
    } catch (error) {
      console.error('[GameLoop] ERROR: Failed to add biome layer:', error);
      throw error;
    }

    try {
      // Create player species (species-level gameplay)
      this.entityManager.createPlayerSpecies();
    } catch (error) {
      console.error('[GameLoop] ERROR: Failed to create player species:', error);
      throw error;
    }

    try {
      // Initialize camera to species position immediately
      if (this.entityManager.playerSpecies) {
        const speciesCenter = this.entityManager.playerSpecies.getCenterPosition();
        this.renderer.updateCamera(speciesCenter.x, speciesCenter.y);
      }
    } catch (error) {
      console.error('[GameLoop] ERROR: Failed to initialize camera:', error);
      throw error;
    }

    try {
      // Spawn resources
      this.entityManager.spawnResources();
    } catch (error) {
      console.error('[GameLoop] ERROR: Failed to spawn resources:', error);
      throw error;
    }

    // Set up species extinction check (species-level gameplay)
    // Species extinction will be checked in the update loop

    // Initialize camera to species position immediately
    if (this.entityManager.playerSpecies) {
      const speciesCenter = this.entityManager.playerSpecies.getCenterPosition();
      this.renderer.updateCamera(speciesCenter.x, speciesCenter.y);
    }

    // Spawn resources
    this.entityManager.spawnResources();

    // Initialize mini-map
    this.renderer.initializeMiniMap(this.biomeGenerator);

    // Show tutorial on first launch
    const hasSeenTutorial = localStorage.getItem('evolab_tutorial_seen');
    if (!hasSeenTutorial) {
      setTimeout(() => {
        this.uiController.showTutorial();
        localStorage.setItem('evolab_tutorial_seen', 'true');
      }, 1000);
    }
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

    // Update Phase 5 systems
    const resources = this.entityManager.getResources();

    // Count plants vs animals for atmospheric system
    let plantCount = 0;
    let animalCount = 0;
    allCells.forEach(cell => {
      if (cell.traits.photosynthesis && cell.traits.photosynthesis > 0) {
        plantCount++;
      } else {
        animalCount++;
      }
    });

    // Update atmospheric system
    if (this.entityManager.playerSpecies) {
      const center = this.entityManager.playerSpecies.getCenterPosition();
      this.atmosphericSystem.update(deltaTime, plantCount, animalCount, center.x, center.y);
    }

    // Update event manager
    this.eventManager.update(deltaTime, allCells, resources);

    // Update ecosystem regulator
    const ecosystemStats = this.ecosystemRegulator.calculateStats(allCells, resources);
    this.ecosystemRegulator.update(ecosystemStats, deltaTime);

    // Update faction progress
    if (this.entityManager.playerSpecies) {
      const stats = this.entityManager.playerSpecies.getStats();
      this.factionSystem.updateProgress('generation', stats.generation);
      this.factionSystem.updateProgress('population', stats.population);
      this.factionSystem.updateProgress('diversity', stats.diversity || 0);
      this.factionSystem.updateProgress('biomass', ecosystemStats.biomass);
    }

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
        const { width: visibleWidth, height: visibleHeight } = this.renderer.getWorldViewSize();
        const viewPadding = Config.BIOME_RENDER_PADDING;
        const viewWidth = Math.max(visibleWidth, maxDistance * 2 + viewPadding);
        const viewHeight = Math.max(visibleHeight, maxDistance * 2 + viewPadding);
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

    // Update particle system
    this.renderer.updateParticles(deltaTime);

    // Update environmental effects based on current view
    if (this.entityManager.playerSpecies) {
      const speciesCenter = this.entityManager.playerSpecies.getCenterPosition();
      const { width: viewWidth, height: viewHeight } = this.renderer.getWorldViewSize();
      this.environmentalEffects.update(
        deltaTime,
        speciesCenter.x,
        speciesCenter.y,
        viewWidth,
        viewHeight,
        (x, y) => this.biomeGenerator.getBiomeAt(x, y)
      );

      // Update mini-map
      this.renderer.updateMiniMap(speciesCenter.x, speciesCenter.y);
    }

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

      // PERFORMANCE FIX: Sample only a subset of cells to avoid O(n²) complexity
      // For large populations, check only 5-10 representative cells instead of all
      const sampleSize = Math.min(10, speciesCells.length);
      const sampledCells = speciesCells.length <= sampleSize
        ? speciesCells
        : Array.from({ length: sampleSize }, (_, i) =>
            speciesCells[Math.floor(i * speciesCells.length / sampleSize)]
          );

      // Get all non-species cells once
      const allCells = this.entityManager.getAllCells();
      const otherCells = allCells.filter(cell => !speciesCells.includes(cell));

      let totalThreatLevel = 0;

      // For each sampled cell, check only nearby threats using distance threshold
      sampledCells.forEach(cell => {
        let nearbyThreats = 0;
        const detectionRange = 100;
        const detectionRangeSq = detectionRange * detectionRange; // Avoid sqrt by comparing squared distances

        otherCells.forEach(otherCell => {
          // Quick distance check using squared distance (faster than sqrt)
          const dx = cell.position.x - otherCell.position.x;
          const dy = cell.position.y - otherCell.position.y;
          const distanceSq = dx * dx + dy * dy;

          if (distanceSq < detectionRangeSq && otherCell.traits.aggression > 6) {
            nearbyThreats++;
          }
        });

        totalThreatLevel += nearbyThreats;
      });

      return Math.min(1, totalThreatLevel / (sampledCells.length * 3)); // Normalize to 0-1 range
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

  private setHudLabel(id: string, text: string): void {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    }
  }

  private setHudValue(id: string, value: string | number): void {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = typeof value === 'number' ? `${value}` : value;
    }
  }

  private setHudBarRatio(id: string, ratio: number): void {
    const bar = document.getElementById(id) as HTMLElement | null;
    if (bar) {
      const clamped = Math.max(0, Math.min(1, ratio));
      bar.style.width = `${clamped * 100}%`;
    }
  }

  // Update HUD elements
  private updateHUD(): void {
    // Species-level HUD
    if (this.entityManager.playerSpecies) {
      const stats = this.entityManager.playerSpecies.getStats();
      const avgTraits = stats.averageTraits as Traits;
      const averageAtp = avgTraits.atp ?? 0;
      const maxAtp = avgTraits.maxATP ?? Config.MAX_ATP;
      const averageHealth = avgTraits.health ?? 0;
      const maxHealth = avgTraits.maxHealth ?? 100;

      // Update averaged ATP/health bars and labels
      this.setHudLabel('atp-label', 'Avg ATP (Species):');
      this.setHudValue('atp-value', Math.round(averageAtp));
      this.setHudBarRatio('atp-bar', maxAtp > 0 ? averageAtp / maxAtp : 0);

      this.setHudLabel('health-label', 'Avg Health (Species):');
      this.setHudValue('health-value', Math.round(averageHealth));
      this.setHudBarRatio('health-bar', maxHealth > 0 ? averageHealth / maxHealth : 0);

      // Repurpose resource stats for species-wide metrics
      this.setHudLabel('glucose-label', 'Population:');
      this.setHudValue('glucose-value', stats.population);

      this.setHudLabel('aminoacid-label', 'Avg Survival (s):');
      this.setHudValue('aminoacid-value', Math.round(stats.averageSurvivalTime || 0));

      this.setHudLabel('phosphate-label', 'Diversity Index:');
      this.setHudValue('phosphate-value', stats.diversity ? stats.diversity.toFixed(1) : '0.0');

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
        // Update DNA progress bar
        this.uiController.updateDNAProgress(baseGenome.dnaPoints, 50);
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

    this.setHudLabel('atp-label', 'ATP:');
    this.setHudLabel('health-label', 'Health:');
    this.setHudLabel('glucose-label', 'Glucose:');
    this.setHudLabel('aminoacid-label', 'Amino Acids:');
    this.setHudLabel('phosphate-label', 'Phosphates:');

    // Update ATP
    this.setHudValue('atp-value', Math.floor(player.traits.atp));
    this.setHudBarRatio('atp-bar', player.traits.maxATP > 0 ? player.traits.atp / player.traits.maxATP : 0);

    // Update Health
    this.setHudValue('health-value', Math.floor(player.traits.health));
    this.setHudBarRatio('health-bar', player.traits.maxHealth > 0 ? player.traits.health / player.traits.maxHealth : 0);

    // Update Compounds
    this.setHudValue('glucose-value', Math.floor(player.compounds.glucose));
    this.setHudValue('aminoacid-value', Math.floor(player.compounds.aminoAcids));
    this.setHudValue('phosphate-value', Math.floor(player.compounds.phosphates));

    // Update Generation
    const generationValue = document.getElementById('generation-value');
    if (generationValue) {
      generationValue.textContent = player.genome.lineage.generation.toString();
    }

    // Update DNA Points
    const dnaValue = document.getElementById('dna-value');
    if (dnaValue) {
      dnaValue.textContent = Math.floor(player.genome.dnaPoints).toString();
      // Update DNA progress bar
      this.uiController.updateDNAProgress(player.genome.dnaPoints, 50);
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
  private resetGame(newSetup?: GameSetupOptions): void {
    if (newSetup) {
      this.competitionSetup = this.sanitizeCompetitionSetup(newSetup);
    } else if (!this.competitionSetup || this.competitionSetup.species.length === 0) {
      this.competitionSetup = this.sanitizeCompetitionSetup(this.getDefaultCompetitionSetup());
    }

    this.stop();
    this.entityManager.dispose();
    this.historyTracker.reset();
    this.timeControl.reset();
    this.dayNightCycle = new DayNightCycle(Config.DAY_NIGHT_START_TIME, Config.DAY_NIGHT_SPEED_MULTIPLIER);
    this.entityManager = new EntityManager(
      this.renderer,
      this.biomeGenerator,
      this.convertCompetitionSetupToAI(this.competitionSetup)
    );
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
      this.entityManager = new EntityManager(
        this.renderer,
        this.biomeGenerator,
        this.convertCompetitionSetupToAI(this.competitionSetup)
      );
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

  private getDefaultCompetitionSetup(): GameSetupOptions {
    return buildDefaultCompetitionSetup();
  }

  private sanitizeCompetitionSetup(setup?: GameSetupOptions): GameSetupOptions {
    return sanitizeCompetitionSetup(setup);
  }

  private convertCompetitionSetupToAI(setup: GameSetupOptions): AISpeciesSetup[] {
    return convertCompetitionSetupToAI(setup);
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
