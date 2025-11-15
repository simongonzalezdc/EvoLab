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

interface Species {
  name: string;
  behaviorType: BehaviorType;
  baseGenome: Genome;
  color: number;
  population: Cell[];
  maxPopulation: number;
}

export class PopulationManager {
  private species: Map<string, Species> = new Map();
  private renderer: PixiApp;
  private aiBehaviors: Map<string, AIBehavior> = new Map();
  private spawnCooldown = 0;
  private lakeWidth: number;
  private lakeHeight: number;

  constructor(renderer: PixiApp, lakeWidth: number, lakeHeight: number) {
    this.renderer = renderer;
    this.lakeWidth = lakeWidth;
    this.lakeHeight = lakeHeight;
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

  // Initialize default species
  initializeDefaultSpecies(): void {
    // Herbivore species - small, fast, timid
    const herbivoreGenome = Genome.createDefault();
    herbivoreGenome.traits.size = Config.HERBIVORE_SIZE;
    herbivoreGenome.traits.speed = 7;
    herbivoreGenome.traits.aggression = 2;
    herbivoreGenome.traits.fearResponse = 8;
    herbivoreGenome.traits.color = Config.HERBIVORE_COLOR;
    this.registerSpecies('Herbivore', BehaviorType.HERBIVORE, herbivoreGenome, Config.HERBIVORE_COLOR, Config.HERBIVORE_POPULATION);

    // Carnivore species - medium, aggressive
    const carnivoreGenome = Genome.createDefault();
    carnivoreGenome.traits.size = Config.CARNIVORE_SIZE;
    carnivoreGenome.traits.speed = 6;
    carnivoreGenome.traits.aggression = 8;
    carnivoreGenome.traits.fearResponse = 3;
    carnivoreGenome.traits.toxinStrength = 3;
    carnivoreGenome.traits.color = Config.CARNIVORE_COLOR;
    this.registerSpecies('Carnivore', BehaviorType.CARNIVORE, carnivoreGenome, Config.CARNIVORE_COLOR, Config.CARNIVORE_POPULATION);

    // Omnivore species - balanced
    const omnivoreGenome = Genome.createDefault();
    omnivoreGenome.traits.size = Config.OMNIVORE_SIZE;
    omnivoreGenome.traits.speed = 6;
    omnivoreGenome.traits.aggression = 5;
    omnivoreGenome.traits.fearResponse = 5;
    omnivoreGenome.traits.intelligence = 6;
    omnivoreGenome.traits.color = Config.OMNIVORE_COLOR;
    this.registerSpecies('Omnivore', BehaviorType.OMNIVORE, omnivoreGenome, Config.OMNIVORE_COLOR, Config.OMNIVORE_POPULATION);
  }

  // Update all AI cells
  update(deltaTime: number, allCells: Cell[], resources: Resource[]): void {
    this.spawnCooldown -= deltaTime;

    // Spawn new cells if below max population
    if (this.spawnCooldown <= 0) {
      this.spawnCooldown = 10; // Spawn check every 10 seconds
      this.trySpawnCells();
    }

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
      case 'herbivore':
        behavior = new HerbivoreAI(cell);
        break;
      case 'carnivore':
        behavior = new CarnivoreAI(cell);
        break;
      case 'omnivore':
        behavior = new OmnivoreAI(cell);
        break;
      default:
        behavior = new HerbivoreAI(cell);
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
    for (const species of this.species.values()) {
      for (const cell of species.population) {
        cell.dispose();
      }
    }
    this.species.clear();
    this.aiBehaviors.clear();
  }
}
