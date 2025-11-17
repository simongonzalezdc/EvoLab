// Entity manager for handling all game entities

import { Cell } from './Cell';
import { Resource } from './Resource';
import { PixiApp } from '../rendering/PixiApp';
import { BiomeGenerator } from '../environment/BiomeGenerator';
import { Config } from '../core/Config';
import { Genome } from '../genetics/Genome';
import { ReproductionSystem } from '../genetics/ReproductionSystem';
import { TraitSystem } from '../genetics/TraitSystem';
import { PopulationManager, type AISpeciesSetup } from '../ai/PopulationManager';
import { CombatSystem } from './CombatSystem';
import { PlayerSpeciesManager } from '../core/PlayerSpeciesManager';
import { SoundManager } from '../audio/SoundManager';
import type { Traits } from '../types/entities';

export class EntityManager {
  private cells: Map<string, Cell> = new Map();
  private resources: Map<string, Resource> = new Map();
  private renderer: PixiApp;
  private biomeGenerator: BiomeGenerator;
  private soundManager: SoundManager | null = null;
  public playerCell: Cell | null = null; // Keep for backward compatibility, but deprecated
  public playerSpecies: PlayerSpeciesManager | null = null;
  public glucoseCollected = 0;
  public reproductionSystem: ReproductionSystem;
  public populationManager: PopulationManager;
  public combatSystem: CombatSystem;

  // Combo system for dopamine boost!
  private recentCollections: number[] = []; // Timestamps of recent resource collections
  private comboCount: number = 0;
  private readonly COMBO_TIME_WINDOW = 5; // seconds
  private readonly COMBO_THRESHOLD = 3; // 3+ collections for a combo
  private readonly COMBO_DNA_MULTIPLIER = 2; // 2x DNA bonus for combos

  constructor(renderer: PixiApp, biomeGenerator: BiomeGenerator, aiSpeciesSetup?: AISpeciesSetup[]) {
    this.renderer = renderer;
    this.reproductionSystem = new ReproductionSystem();
    this.populationManager = new PopulationManager(renderer, Config.LAKE_WIDTH, Config.LAKE_HEIGHT);
    this.combatSystem = new CombatSystem();
    this.biomeGenerator = biomeGenerator;

    // Connect particle system to combat system
    this.combatSystem.setParticleSystem(renderer.particleSystem);

    // Initialize AI species
    if (aiSpeciesSetup && aiSpeciesSetup.length > 0) {
      this.populationManager.initializeCustomSpecies(aiSpeciesSetup);
    } else {
      this.populationManager.initializeDefaultSpecies();
    }
  }

  setSoundManager(soundManager: SoundManager): void {
    this.soundManager = soundManager;
  }

  // Create player species from genome
  createPlayerSpecies(genome?: Genome): PlayerSpeciesManager {
    const playerGenome = genome || Genome.createDefault();
    this.playerSpecies = new PlayerSpeciesManager(this.renderer, this.biomeGenerator, playerGenome);
    this.playerSpecies.initialize();
    return this.playerSpecies;
  }

  // Create player cell from genome (deprecated - kept for compatibility)
  createPlayerCell(genome?: Genome): Cell {
    const playerGenome = genome || Genome.createDefault();

    const sprite = this.renderer.createCircle(
      Config.PLAYER_START_X,
      Config.PLAYER_START_Y,
      Config.PLAYER_RADIUS,
      playerGenome.traits.color
    );

    this.renderer.addToWorld(sprite);

    const cell = new Cell(
      'player',
      Config.PLAYER_START_X,
      Config.PLAYER_START_Y,
      playerGenome,
      sprite,
      true
    );

    this.cells.set(cell.id, cell);
    this.playerCell = cell;

    return cell;
  }

  // Spawn resources (glucose) - Week 3: with golden resource chance
  spawnResources(): void {
    const halfWidth = Config.LAKE_WIDTH / 2;
    const halfHeight = Config.LAKE_HEIGHT / 2;

    for (let i = 0; i < Config.GLUCOSE_COUNT; i++) {
      const x = Math.random() * Config.LAKE_WIDTH - halfWidth;
      const y = Math.random() * Config.LAKE_HEIGHT - halfHeight;

      // Week 3: 2% chance for golden resource (10x value)
      const isGolden = Math.random() < Config.GOLDEN_RESOURCE_CHANCE;
      const rarity = isGolden ? 'golden' : 'common';
      const color = isGolden ? 0xffd700 : Config.GLUCOSE_COLOR; // Gold color for golden resources

      const sprite = this.renderer.createCircle(x, y, Config.GLUCOSE_RADIUS, color);
      this.renderer.addToWorld(sprite);

      const resource = new Resource(`glucose-${i}`, x, y, 'glucose', sprite, rarity);
      this.resources.set(resource.id, resource);
    }
  }

  // Update all entities
  update(deltaTime: number, autoMode: boolean = false): void {
    // Update player species (new species-level gameplay)
    if (this.playerSpecies) {
      const allCells = this.getAllCells();
      const allResources = Array.from(this.resources.values());
      this.playerSpecies.update(deltaTime, allCells, allResources, autoMode);
    }

    // Update legacy player cell (for backward compatibility)
    if (this.playerCell) {
      this.playerCell.update(deltaTime);
      this.checkResourceCollection(this.playerCell);
    }

    // Update AI population
    const allCells = this.getAllCells();
    const allResources = Array.from(this.resources.values());
    this.populationManager.update(deltaTime, allCells, allResources);

    // Update AI cell physics
    const aiCells = this.populationManager.getAllCells();
    aiCells.forEach(cell => {
      cell.update(deltaTime);
    });

    // Check combat between all cells
    this.combatSystem.checkCombat(allCells);

    // Update resources
    this.resources.forEach(resource => {
      resource.update(deltaTime, Config.GLUCOSE_RESPAWN_TIME);
    });
  }

  // Check combo status and award bonuses (dopamine boost!)
  private checkCombo(currentTime: number, player: Cell): { isCombo: boolean; comboSize: number } {
    // Remove old collections outside the time window
    this.recentCollections = this.recentCollections.filter(
      time => (currentTime - time) <= this.COMBO_TIME_WINDOW
    );

    // Add current collection
    this.recentCollections.push(currentTime);

    const comboSize = this.recentCollections.length;
    const isCombo = comboSize >= this.COMBO_THRESHOLD;

    if (isCombo) {
      // Award combo bonus DNA points!
      const baseDNA = Config.DNA_FROM_GLUCOSE;
      const bonusDNA = baseDNA * (this.COMBO_DNA_MULTIPLIER - 1); // Extra DNA from combo
      player.genome.dnaPoints += bonusDNA;

      // Visual feedback
      this.renderer.particleSystem.createComboEffect(
        player.position.x,
        player.position.y,
        comboSize
      );

      this.comboCount++;
    }

    return { isCombo, comboSize };
  }

  // Check if player is close enough to collect resources
  private checkResourceCollection(player: Cell): void {
    const currentTime = Date.now() / 1000; // Convert to seconds

    this.resources.forEach(resource => {
      if (!resource.isCollected) {
        const distance = player.distanceTo(resource.position);

        if (distance < Config.RESOURCE_COLLECTION_RANGE) {
          // Create eating particle effect
          this.renderer.particleSystem.createEatingEffect(
            resource.position.x,
            resource.position.y,
            Config.GLUCOSE_COLOR
          );

          // Collect resource
          resource.collect();

          if (resource.type === 'glucose') {
            player.restoreATP(Config.ATP_FROM_GLUCOSE);
            player.collectCompound('glucose', 5);
            this.glucoseCollected++;

            // Check for combo bonus!
            const combo = this.checkCombo(currentTime, player);
            if (combo.isCombo) {
              // Play combo sound!
              this.soundManager?.playCombo(combo.comboSize);
              if (Config.DEBUG_GAME_LOOP) {
                console.log(`🔥 COMBO x${combo.comboSize}! Bonus DNA awarded!`);
              }
            } else {
              // Play regular collection sound
              this.soundManager?.play('collect');
            }
          } else if (resource.type === 'aminoAcid') {
            player.collectCompound('aminoAcid', 3);
            this.soundManager?.play('collect');
          } else if (resource.type === 'phosphate') {
            player.collectCompound('phosphate', 2);
            this.soundManager?.play('collect');
          }
        }
      }
    });
  }

  // Handle player reproduction
  reproducePlayer(modifications: Partial<Traits> = {}): Cell | null {
    if (!this.playerCell) return null;

    // Calculate DNA points earned
    const dnaPoints = TraitSystem.calculateDNAPoints(
      this.playerCell.survivalTime,
      this.glucoseCollected
    );
    this.playerCell.genome.dnaPoints += dnaPoints;

    // Perform reproduction
    const offspringGenome = this.reproductionSystem.reproduce(
      this.playerCell.genome,
      modifications
    );

    // Remove old player cell
    this.renderer.removeFromWorld(this.playerCell.sprite);
    this.cells.delete('player');

    // Create new player cell with offspring genome
    const newCell = this.createPlayerCell(offspringGenome);

    // Mark reproduction
    newCell.markReproduction();

    // Reset glucose counter
    this.glucoseCollected = 0;

    return newCell;
  }

  // Get all cells (player species + AI)
  getAllCells(): Cell[] {
    const playerCells = Array.from(this.cells.values());
    const playerSpeciesCells = this.playerSpecies ? this.playerSpecies.getAllCells() : [];
    const aiCells = this.populationManager.getAllCells();
    return [...playerCells, ...playerSpeciesCells, ...aiCells];
  }

  // Get all cells
  getCells(): Cell[] {
    return Array.from(this.cells.values());
  }

  // Get all resources
  getResources(): Resource[] {
    return Array.from(this.resources.values());
  }

  // Get population stats
  getPopulationStats(): { [key: string]: number } {
    const stats = this.populationManager.getStats();
    if (this.playerSpecies) {
      stats['Your Species'] = this.playerSpecies.getStats().population;
    } else {
      stats['Player'] = this.playerCell ? 1 : 0;
    }
    return stats;
  }

  dispose(): void {
    this.cells.forEach(cell => cell.dispose());
    this.resources.forEach(resource => resource.dispose());
    this.playerSpecies?.dispose();
    this.populationManager.dispose();
    this.cells.clear();
    this.resources.clear();
  }
}
