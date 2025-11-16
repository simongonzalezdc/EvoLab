// Population manager for AI species

import { Cell } from '../entities/Cell';
import { Resource } from '../entities/Resource';
import { Genome } from '../genetics/Genome';
import { PixiApp } from '../rendering/PixiApp';
import { HerbivoreAI } from './HerbivoreAI';
import { CarnivoreAI } from './CarnivoreAI';
import { OmnivoreAI } from './OmnivoreAI';
import { BehaviorType, type AIBehavior } from './AIBehavior';
import { Config } from '../core/Config';
import { AdvancedAISystem } from './AdvancedAI';

interface Species {
  name: string;
  behaviorType: BehaviorType;
  baseGenome: Genome;
  color: number;
  population: Cell[];
  maxPopulation: number;
}

export interface AISpeciesSetup {
  name?: string;
  type: BehaviorType;
  population: number;
  color?: number;
}

export class PopulationManager {
  private species: Map<string, Species> = new Map();
  private renderer: PixiApp;
  private aiBehaviors: Map<string, AIBehavior> = new Map();
  private spawnCooldown = 0;
  private lakeWidth: number;
  private lakeHeight: number;
  public advancedAI: AdvancedAISystem;

  constructor(renderer: PixiApp, lakeWidth: number, lakeHeight: number) {
    this.renderer = renderer;
    this.lakeWidth = lakeWidth;
    this.lakeHeight = lakeHeight;
    this.advancedAI = new AdvancedAISystem();
  }

  // Register a new species
  registerSpecies(
    name: string,
    behaviorType: BehaviorType,
    genome: Genome,
    color: number,
    maxPopulation: number
  ): void {
    this.species.set(name, {
      name,
      behaviorType,
      baseGenome: genome,
      color,
      population: [],
      maxPopulation,
    });
  }

  // Initialize default species or apply a custom configuration
  initializeDefaultSpecies(): void {
    this.initializeCustomSpecies([
      {
        name: 'Herbivore',
        type: BehaviorType.HERBIVORE,
        population: Config.HERBIVORE_POPULATION,
        color: Config.HERBIVORE_COLOR,
      },
      {
        name: 'Carnivore',
        type: BehaviorType.CARNIVORE,
        population: Config.CARNIVORE_POPULATION,
        color: Config.CARNIVORE_COLOR,
      },
      {
        name: 'Omnivore',
        type: BehaviorType.OMNIVORE,
        population: Config.OMNIVORE_POPULATION,
        color: Config.OMNIVORE_COLOR,
      },
    ]);
  }

  initializeCustomSpecies(setups?: AISpeciesSetup[]): void {
    this.resetSpecies();

    if (!setups || setups.length === 0) {
      this.initializeDefaultSpecies();
      return;
    }

    setups.forEach((setup, index) => {
      const type = setup.type;
      const baseGenome = this.createBaseGenome(type);
      const color = setup.color ?? this.getDefaultColor(type);
      baseGenome.traits.color = color;
      const safePopulation = Math.max(1, Math.floor(setup.population));
      const name = setup.name || `${this.getTypeLabel(type)} ${index + 1}`;
      this.registerSpecies(name, type, baseGenome, color, safePopulation);
    });
  }

  // Update all AI cells
  update(deltaTime: number, allCells: Cell[], resources: Resource[]): void {
    this.spawnCooldown -= deltaTime;

    // Spawn new cells if below max population
    if (this.spawnCooldown <= 0) {
      this.spawnCooldown = 10; // Spawn check every 10 seconds
      this.trySpawnCells();
    }

    // Update advanced AI systems (pack behavior, territories, learning)
    this.advancedAI.update(allCells, deltaTime);

    // Update AI behaviors
    for (const species of this.species.values()) {
      for (const cell of species.population) {
        const behavior = this.aiBehaviors.get(cell.id);
        if (behavior) {
          behavior.update(deltaTime, allCells, resources);
        }

        // Remove dead cells
        if (cell.traits.atp <= 0 || cell.traits.health <= 0) {
          this.removeCell(cell.id);
        }
      }
    }

    // Cleanup advanced AI data for dead cells
    const aliveCellIds = new Set(allCells.map(c => c.id));
    this.advancedAI.cleanup(aliveCellIds);
  }

  // Try to spawn cells for species below max population
  private trySpawnCells(): void {
    for (const species of this.species.values()) {
      if (species.population.length < species.maxPopulation) {
        const needed = Math.min(
          3, // Spawn up to 3 at a time
          species.maxPopulation - species.population.length
        );

        for (let i = 0; i < needed; i++) {
          this.spawnCell(species);
        }
      }
    }
  }

  // Spawn a cell for a species
  private spawnCell(species: Species): void {
    // Random position in lake
    const x = (Math.random() - 0.5) * this.lakeWidth;
    const y = (Math.random() - 0.5) * this.lakeHeight;

    // Clone genome with slight variation
    const genome = species.baseGenome.clone();

    // Create sprite
    const radius = 10 + genome.traits.size;
    const sprite = this.renderer.createCircle(x, y, radius, species.color);
    this.renderer.addToWorld(sprite);

    // Create cell
    const cell = new Cell(`${species.name}-${Date.now()}-${Math.random()}`, x, y, genome, sprite, false);

    // Create AI behavior
    let behavior: AIBehavior;
    switch (species.behaviorType) {
      case BehaviorType.HERBIVORE:
        behavior = new HerbivoreAI(cell);
        break;
      case BehaviorType.CARNIVORE: {
        const carnivoreAI = new CarnivoreAI(cell);
        carnivoreAI.setAdvancedAI(this.advancedAI); // Inject advanced AI for pack behavior
        behavior = carnivoreAI;
        break;
      }
      case BehaviorType.OMNIVORE:
        behavior = new OmnivoreAI(cell);
        break;
      default:
        behavior = new HerbivoreAI(cell);
        break;
    }

    this.aiBehaviors.set(cell.id, behavior);
    species.population.push(cell);
  }

  // Remove a cell
  removeCell(cellId: string): void {
    for (const species of this.species.values()) {
      const index = species.population.findIndex(c => c.id === cellId);
      if (index !== -1) {
        const cell = species.population[index];
        if (cell) {
          this.renderer.removeFromWorld(cell.sprite);
          cell.dispose();
        }
        species.population.splice(index, 1);
        this.aiBehaviors.delete(cellId);
        break;
      }
    }
  }

  // Get all AI cells
  getAllCells(): Cell[] {
    const allCells: Cell[] = [];
    for (const species of this.species.values()) {
      allCells.push(...species.population);
    }
    return allCells;
  }

  // Get population stats
  getStats(): { [key: string]: number } {
    const stats: { [key: string]: number } = {};
    for (const [name, species] of this.species) {
      stats[name] = species.population.length;
    }
    return stats;
  }

  dispose(): void {
    this.resetSpecies();
  }

  private resetSpecies(): void {
    for (const species of this.species.values()) {
      for (const cell of species.population) {
        this.renderer.removeFromWorld(cell.sprite);
      }
    }
    this.species.clear();
    this.aiBehaviors.clear();
  }

  private createBaseGenome(type: BehaviorType): Genome {
    const genome = Genome.createDefault();

    switch (type) {
      case BehaviorType.CARNIVORE:
        genome.traits.size = Config.CARNIVORE_SIZE;
        genome.traits.speed = 6;
        genome.traits.aggression = 8;
        genome.traits.fearResponse = 3;
        genome.traits.toxinStrength = 3;
        genome.traits.color = Config.CARNIVORE_COLOR;
        break;
      case BehaviorType.OMNIVORE:
        genome.traits.size = Config.OMNIVORE_SIZE;
        genome.traits.speed = 6;
        genome.traits.aggression = 5;
        genome.traits.fearResponse = 5;
        genome.traits.intelligence = 6;
        genome.traits.color = Config.OMNIVORE_COLOR;
        break;
      case BehaviorType.HERBIVORE:
      default:
        genome.traits.size = Config.HERBIVORE_SIZE;
        genome.traits.speed = 7;
        genome.traits.aggression = 2;
        genome.traits.fearResponse = 8;
        genome.traits.color = Config.HERBIVORE_COLOR;
        break;
    }

    return genome;
  }

  private getDefaultColor(type: BehaviorType): number {
    switch (type) {
      case BehaviorType.CARNIVORE:
        return Config.CARNIVORE_COLOR;
      case BehaviorType.OMNIVORE:
        return Config.OMNIVORE_COLOR;
      case BehaviorType.HERBIVORE:
      default:
        return Config.HERBIVORE_COLOR;
    }
  }

  private getTypeLabel(type: BehaviorType): string {
    switch (type) {
      case BehaviorType.CARNIVORE:
        return 'Carnivore';
      case BehaviorType.OMNIVORE:
        return 'Omnivore';
      case BehaviorType.HERBIVORE:
      default:
        return 'Herbivore';
    }
  }
}
