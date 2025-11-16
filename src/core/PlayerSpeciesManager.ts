// Manages the player's species population and evolution
// Handles species-level operations instead of single organism control

import { Cell } from '../entities/Cell';
import { Resource } from '../entities/Resource';
import { Genome } from '../genetics/Genome';
import { PixiApp } from '../rendering/PixiApp';
import { Config } from './Config';
import { AutoPilot } from './AutoPilot';
import type { Traits } from '../types/entities';

export interface SpeciesStats {
  population: number;
  averageTraits: Partial<Traits>;
  totalResourcesCollected: number;
  averageSurvivalTime: number;
  generation: number;
  diversity: number; // Genetic diversity measure
}

export class PlayerSpeciesManager {
  private cells: Cell[] = [];
  private baseGenome: Genome;
  private renderer: PixiApp;
  private autoPilot: AutoPilot;
  private totalResourcesCollected = 0;
  private generation = 1;
  private speciesColor: number;
  private initialPopulationSize = 15; // Increased for better visibility

  constructor(renderer: PixiApp, initialGenome?: Genome) {
    this.renderer = renderer;
    this.baseGenome = initialGenome || Genome.createDefault();
    this.speciesColor = this.baseGenome.traits.color;
    this.autoPilot = new AutoPilot();
  }

  // Initialize the species with starting population
  initialize(): void {
    const halfWidth = Config.LAKE_WIDTH / 2;
    const halfHeight = Config.LAKE_HEIGHT / 2;
    const spawnRadius = 200; // Spawn in a cluster

    for (let i = 0; i < this.initialPopulationSize; i++) {
      // Spawn in a cluster around starting position
      const angle = (Math.PI * 2 * i) / this.initialPopulationSize;
      const distance = Math.random() * spawnRadius;
      const x = Config.PLAYER_START_X + Math.cos(angle) * distance;
      const y = Config.PLAYER_START_Y + Math.sin(angle) * distance;

      // Create cell with slight genetic variation
      const genome = this.baseGenome.clone();
      // Add small random mutations for diversity
      const mutationAmount = 0.1;
      genome.traits.size += (Math.random() - 0.5) * mutationAmount;
      genome.traits.speed += (Math.random() - 0.5) * mutationAmount;
      genome.traits.color = this.speciesColor;
      
      // Ensure cells start with full ATP and health
      genome.traits.atp = genome.traits.maxATP;
      genome.traits.health = genome.traits.maxHealth;

      const radius = 10 + genome.traits.size;
      const sprite = this.renderer.createCircle(x, y, radius, genome.traits.color);
      this.renderer.addToWorld(sprite);

      const cell = new Cell(`player-species-${i}`, x, y, genome, sprite, false);
      
      // Give cells initial random velocity so they start moving
      const velocityAngle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 2;
      cell.velocity.x = Math.cos(velocityAngle) * speed;
      cell.velocity.y = Math.sin(velocityAngle) * speed;
      
      // Ensure sprite position matches cell position
      cell.sprite.x = cell.position.x;
      cell.sprite.y = cell.position.y;
      
      this.cells.push(cell);
    }
  }

  // Update all cells in the species
  update(deltaTime: number, allCells: Cell[], resources: Resource[], autoMode: boolean): void {
    // Update each cell
    this.cells.forEach(cell => {
      cell.update(deltaTime);

      // Auto-pilot for each cell (always enabled for species-level gameplay)
      // Filter out this cell from allCells to avoid self-reference
      const otherCells = allCells.filter(c => c.id !== cell.id);
      const direction = this.autoPilot.getMovementDirection(cell, otherCells, resources, deltaTime);
      
      // Always apply movement - auto-pilot should always return a direction (at least wander)
      if (direction.x !== 0 || direction.y !== 0) {
        cell.applyForce(direction, Config.ACCELERATION);
      } else {
        // Fallback: ensure cells always have some movement
        const fallbackAngle = (cell.id.charCodeAt(0) + Date.now() * 0.001) % (Math.PI * 2);
        cell.applyForce(
          { x: Math.cos(fallbackAngle), y: Math.sin(fallbackAngle) },
          Config.ACCELERATION * 0.3
        );
      }

      // Check resource collection
      this.checkResourceCollection(cell, resources);
    });

    // Remove dead cells
    this.cells = this.cells.filter(cell => {
      if (cell.traits.atp <= 0 || cell.traits.health <= 0) {
        this.renderer.removeFromWorld(cell.sprite);
        cell.dispose();
        return false;
      }
      return true;
    });

    // Natural reproduction within species
    this.handleNaturalReproduction();
  }

  // Check resource collection for a cell
  private checkResourceCollection(cell: Cell, resources: Resource[]): void {
    resources.forEach(resource => {
      if (!resource.isCollected) {
        const distance = cell.distanceTo(resource.position);
        if (distance < Config.RESOURCE_COLLECTION_RANGE) {
          resource.collect();
          // Clear cached target when resource is collected
          this.autoPilot.clearTarget(cell.id);
          
          if (resource.type === 'glucose') {
            cell.restoreATP(Config.ATP_FROM_GLUCOSE);
            cell.collectCompound('glucose', 5);
            this.totalResourcesCollected++;
          } else if (resource.type === 'aminoAcid') {
            cell.collectCompound('aminoAcid', 3);
          } else if (resource.type === 'phosphate') {
            cell.collectCompound('phosphate', 2);
          }
        }
      }
    });
  }

  // Handle natural reproduction within the species
  private handleNaturalReproduction(): void {
    // Find cells that can reproduce
    const readyCells = this.cells.filter(cell => cell.canReproduce());
    
    if (readyCells.length >= 2) {
      // Pair up cells for reproduction (sexual or asexual)
      for (let i = 0; i < readyCells.length - 1; i += 2) {
        const parent1 = readyCells[i];
        const parent2 = readyCells[i + 1];
        
        // Create offspring
        const offspringGenome = parent1.genome.clone();
        // Mix traits from both parents
        offspringGenome.traits.size = (parent1.traits.size + parent2.traits.size) / 2;
        offspringGenome.traits.speed = (parent1.traits.speed + parent2.traits.speed) / 2;
        offspringGenome.traits.color = this.speciesColor;
        
        // Spawn near parents
        const spawnX = (parent1.position.x + parent2.position.x) / 2 + (Math.random() - 0.5) * 50;
        const spawnY = (parent1.position.y + parent2.position.y) / 2 + (Math.random() - 0.5) * 50;
        
        const radius = 10 + offspringGenome.traits.size;
        const sprite = this.renderer.createCircle(spawnX, spawnY, radius, offspringGenome.traits.color);
        this.renderer.addToWorld(sprite);
        
        const offspring = new Cell(
          `player-species-${Date.now()}-${Math.random()}`,
          spawnX,
          spawnY,
          offspringGenome,
          sprite,
          false
        );
        
        this.cells.push(offspring);
        parent1.markReproduction();
        parent2.markReproduction();
        
        // Limit population growth
        if (this.cells.length > 50) break;
      }
    }
  }

  // Apply evolution modifications to the whole species
  applyEvolution(modifications: Partial<Traits>): void {
    this.generation++;
    
    // Update base genome
    Object.assign(this.baseGenome.traits, modifications);
    this.baseGenome.lineage.generation = this.generation;
    
    // Apply changes to all living cells (gradual evolution)
    this.cells.forEach(cell => {
      Object.keys(modifications).forEach(key => {
        const traitKey = key as keyof Traits;
        const newValue = modifications[traitKey];
        if (newValue !== undefined && typeof newValue === 'number') {
          // Gradually shift toward new trait value
          const currentValue = cell.traits[traitKey] as number;
          cell.traits[traitKey] = currentValue + (newValue - currentValue) * 0.1;
        }
      });
      cell.genome.traits = cell.traits;
    });
  }

  // Get species statistics
  getStats(): SpeciesStats {
    if (this.cells.length === 0) {
      return {
        population: 0,
        averageTraits: {},
        totalResourcesCollected: this.totalResourcesCollected,
        averageSurvivalTime: 0,
        generation: this.generation,
        diversity: 0,
      };
    }

    // Calculate average traits
    const avgTraits: Partial<Traits> = {};
    let totalSurvivalTime = 0;
    const traitValues: { [key: string]: number[] } = {};

    this.cells.forEach(cell => {
      totalSurvivalTime += cell.survivalTime;
      
      Object.keys(cell.traits).forEach(key => {
        const value = (cell.traits as any)[key];
        if (typeof value === 'number') {
          if (!traitValues[key]) traitValues[key] = [];
          traitValues[key].push(value);
        }
      });
    });

    Object.keys(traitValues).forEach(key => {
      const values = traitValues[key];
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      (avgTraits as any)[key] = avg;
    });

    // Calculate diversity (standard deviation of traits)
    let diversity = 0;
    Object.keys(traitValues).forEach(key => {
      const values = traitValues[key];
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
      diversity += Math.sqrt(variance);
    });
    diversity /= Object.keys(traitValues).length;

    return {
      population: this.cells.length,
      averageTraits: avgTraits,
      totalResourcesCollected: this.totalResourcesCollected,
      averageSurvivalTime: totalSurvivalTime / this.cells.length,
      generation: this.generation,
      diversity,
    };
  }

  // Get center position of species (for camera)
  getCenterPosition(): { x: number; y: number } {
    if (this.cells.length === 0) {
      return { x: Config.PLAYER_START_X, y: Config.PLAYER_START_Y };
    }

    // Filter out dead cells
    const aliveCells = this.cells.filter(cell => cell.traits.atp > 0 && cell.traits.health > 0);
    if (aliveCells.length === 0) {
      return { x: Config.PLAYER_START_X, y: Config.PLAYER_START_Y };
    }

    const sumX = aliveCells.reduce((sum, cell) => sum + cell.position.x, 0);
    const sumY = aliveCells.reduce((sum, cell) => sum + cell.position.y, 0);
    
    return {
      x: sumX / aliveCells.length,
      y: sumY / aliveCells.length,
    };
  }

  // Get all cells in the species
  getAllCells(): Cell[] {
    return this.cells;
  }

  // Get base genome
  getBaseGenome(): Genome {
    return this.baseGenome;
  }

  // Check if species is extinct
  isExtinct(): boolean {
    return this.cells.length === 0;
  }

  // Dispose of all cells
  dispose(): void {
    this.cells.forEach(cell => {
      this.renderer.removeFromWorld(cell.sprite);
      cell.dispose();
    });
    this.cells = [];
  }
}

