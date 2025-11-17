// Manager class that integrates all evolution systems (physics, mating, speciation)

import { PhysicsEngine } from '../physics/PhysicsEngine';
import { MatingSystem } from '../genetics/MatingSystem';
import { SpeciationSystem } from '../genetics/SpeciationSystem';
import { MatingAI } from '../ai/MatingAI';
import { ReproductionSystem } from '../genetics/ReproductionSystem';
import type { Cell } from '../entities/Cell';
import type { Species } from '../types/entities';
import { Genome } from '../genetics/Genome';
import { Config } from './Config';
import { logger } from '../utils/Logger';

export interface EvolutionSystemsConfig {
  lakeWidth: number;
  lakeHeight: number;
  enablePhysics?: boolean;
  enableSexualReproduction?: boolean;
  enableSpeciation?: boolean;
}

export class EvolutionSystemsManager {
  // Core systems
  public physicsEngine: PhysicsEngine;
  public matingSystem: MatingSystem;
  public speciationSystem: SpeciationSystem;
  public matingAI: MatingAI;
  public reproductionSystem: ReproductionSystem;

  // Feature flags
  public physicsEnabled: boolean;
  public sexualReproductionEnabled: boolean;
  public speciationEnabled: boolean;

  constructor(config: EvolutionSystemsConfig) {
    // Initialize physics engine
    this.physicsEngine = new PhysicsEngine(config.lakeWidth, config.lakeHeight);

    // Initialize mating and reproduction systems
    this.matingSystem = new MatingSystem();
    this.reproductionSystem = new ReproductionSystem();
    this.matingAI = new MatingAI(this.matingSystem);

    // Initialize speciation system
    this.speciationSystem = new SpeciationSystem(this.matingSystem);

    // Set feature flags
    this.physicsEnabled = config.enablePhysics ?? false;
    this.sexualReproductionEnabled = config.enableSexualReproduction ?? false;
    this.speciationEnabled = config.enableSpeciation ?? false;

    // Configure reproduction mode
    this.reproductionSystem.setReproductionMode(
      this.sexualReproductionEnabled ? 'sexual' : 'asexual'
    );
  }

  // Initialize base species for speciation tracking
  initializeBaseSpecies(genome: Genome, population: number = 10): Species {
    return this.speciationSystem.initializeBaseSpecies(genome, population);
  }

  // Toggle physics on/off
  togglePhysics(): void {
    this.physicsEnabled = !this.physicsEnabled;
  }

  // Toggle sexual reproduction on/off
  toggleSexualReproduction(): void {
    this.sexualReproductionEnabled = !this.sexualReproductionEnabled;
    this.reproductionSystem.setReproductionMode(
      this.sexualReproductionEnabled ? 'sexual' : 'asexual'
    );
  }

  // Toggle speciation tracking on/off
  toggleSpeciation(): void {
    this.speciationEnabled = !this.speciationEnabled;
  }

  // Create physics body for a cell
  createPhysicsBodyForCell(cell: Cell): void {
    if (!this.physicsEnabled) return;

    const mass = cell.traits.size / 5; // Larger cells are heavier
    this.physicsEngine.createCellBody(
      cell.id,
      cell.position.x,
      cell.position.y,
      cell.traits.size,
      mass
    );
  }

  // Remove physics body for a cell
  removePhysicsBodyForCell(cellId: string): void {
    if (!this.physicsEnabled) return;
    this.physicsEngine.removeBody(cellId);
  }

  // Update all systems
  update(deltaTime: number, cells: Cell[]): void {
    // Update physics
    if (this.physicsEnabled) {
      this.physicsEngine.update(deltaTime);

      // Sync cell positions with physics
      for (const cell of cells) {
        this.physicsEngine.syncCellToPhysics(cell);
      }
    }

    // Update mating AI for sexual reproduction
    if (this.sexualReproductionEnabled) {
      for (const cell of cells) {
        if (!cell.isPlayer) {
          // AI cells seek mates
          const direction = this.matingAI.updateMatingBehavior(cell, cells, deltaTime);

          if (direction) {
            // Apply mating-seeking movement
            const speed = cell.traits.speed * 0.5; // Move slower when seeking mate
            if (this.physicsEnabled) {
              this.physicsEngine.applyForce(cell.id, {
                x: direction.x * speed * 0.01,
                y: direction.y * speed * 0.01,
              });
            } else {
              cell.applyForce(direction, speed);
            }
          }
        }
      }

      // Clean up old mating history
      this.matingSystem.clearOldHistory();
    }

    // Update speciation tracking
    if (this.speciationEnabled) {
      this.speciationSystem.updatePopulations(cells);

      // Check for new species divergence (every 100 updates to avoid overhead)
      if (Math.random() < 0.01) {
        const newSpecies = this.speciationSystem.checkForSpeciation(cells);

        if (newSpecies.length > 0 && Config.DEBUG_EVOLUTION) {
          logger.log(`🧬 New species emerged: ${newSpecies.map(s => s.name).join(', ')}`);
        }
      }
    }
  }

  // Attempt sexual reproduction between two cells
  attemptSexualReproduction(mother: Cell, father: Cell): Genome | null {
    if (!this.sexualReproductionEnabled) {
      return null;
    }

    return this.matingSystem.mate(mother, father);
  }

  // Get species count
  getSpeciesCount(): number {
    if (!this.speciationEnabled) return 1;
    return this.speciationSystem.getSpeciesDiversity();
  }

  // Get all species
  getAllSpecies(): Species[] {
    if (!this.speciationEnabled) return [];
    return this.speciationSystem.getAllSpecies();
  }

  // Get phylogenetic tree data
  getPhylogeneticTree() {
    if (!this.speciationEnabled) return [];
    return this.speciationSystem.getPhylogeneticTree();
  }

  // Get mating AI stats
  getMatingStats() {
    if (!this.sexualReproductionEnabled) return null;
    return this.matingAI.getStats();
  }

  // Get extinction events
  getExtinctionEvents() {
    if (!this.speciationEnabled) return [];
    return this.speciationSystem.getExtinctionEvents();
  }

  // Export all data for saving/analysis
  exportData() {
    return {
      physicsEnabled: this.physicsEnabled,
      sexualReproductionEnabled: this.sexualReproductionEnabled,
      speciationEnabled: this.speciationEnabled,
      speciation: this.speciationEnabled ? this.speciationSystem.exportData() : null,
      matingHistory: this.sexualReproductionEnabled ? this.matingSystem.getMatingHistory() : [],
      matingStats: this.getMatingStats(),
    };
  }

  // Dispose all systems
  dispose(): void {
    this.physicsEngine.dispose();
  }
}
