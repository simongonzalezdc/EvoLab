// Speciation system for tracking when populations diverge into distinct species

import type { Cell } from '../entities/Cell';
import type { Species } from '../types/entities';
import { Genome } from './Genome';
import { MatingSystem } from './MatingSystem';

interface PhylogeneticNode {
  speciesId: string;
  parentSpeciesId: string | null;
  divergenceTime: number;
  children: PhylogeneticNode[];
  isExtinct: boolean;
}

export class SpeciationSystem {
  private species: Map<string, Species> = new Map();
  private matingSystem: MatingSystem;
  private phylogeneticTree: PhylogeneticNode[] = [];
  private extinctionEvents: Array<{ speciesId: string; time: number; reason: string }> = [];
  private speciesNameCounter = 0;

  // Speciation constants
  private readonly GENETIC_DISTANCE_THRESHOLD = 0.4; // When populations are this different, they're separate species
  private readonly REPRODUCTIVE_ISOLATION_THRESHOLD = 0.15; // When compatibility drops below this
  private readonly MIN_POPULATION_FOR_SPECIES = 5; // Minimum population to be considered a species
  private readonly EXTINCTION_THRESHOLD_TIME = 300000; // 5 minutes without any individuals = extinct

  constructor(matingSystem: MatingSystem) {
    this.matingSystem = matingSystem;
  }

  // Initialize base species
  initializeBaseSpecies(initialGenome: Genome, population: number = 10): Species {
    const species: Species = {
      id: 'species-001',
      name: this.generateSpeciesName(1),
      commonAncestorLineageId: initialGenome.lineage.lineageId,
      divergenceTime: Date.now(),
      population: population,
      averageTraits: { ...initialGenome.traits },
      isExtinct: false,
      color: initialGenome.traits.color,
    };

    this.species.set(species.id, species);

    // Add to phylogenetic tree
    this.phylogeneticTree.push({
      speciesId: species.id,
      parentSpeciesId: null,
      divergenceTime: Date.now(),
      children: [],
      isExtinct: false,
    });

    return species;
  }

  // Check if population should diverge into new species
  checkForSpeciation(cells: Cell[]): Species[] {
    const newSpecies: Species[] = [];

    // Group cells by current species
    const cellsBySpecies = this.groupCellsBySpecies(cells);

    // For each species, check if there are divergent subpopulations
    for (const [speciesId, speciesCells] of cellsBySpecies.entries()) {
      if (speciesCells.length < this.MIN_POPULATION_FOR_SPECIES * 2) {
        continue; // Too small to split
      }

      // Cluster cells by genetic similarity
      const clusters = this.clusterByGeneticSimilarity(speciesCells);

      // If we have multiple distinct clusters, create new species
      if (clusters.length > 1) {
        for (let i = 1; i < clusters.length; i++) {
          const cluster = clusters[i];

          if (cluster && cluster.length >= this.MIN_POPULATION_FOR_SPECIES) {
            const newSpec = this.createNewSpecies(cluster, speciesId);
            newSpecies.push(newSpec);
          }
        }
      }
    }

    return newSpecies;
  }

  // Group cells by their current species ID
  private groupCellsBySpecies(cells: Cell[]): Map<string, Cell[]> {
    const groups = new Map<string, Cell[]>();

    for (const cell of cells) {
      const speciesId = cell.genome.lineage.speciesId || 'species-001';

      if (!groups.has(speciesId)) {
        groups.set(speciesId, []);
      }

      groups.get(speciesId)!.push(cell);
    }

    return groups;
  }

  // Cluster cells by genetic similarity using simple k-means-like approach
  private clusterByGeneticSimilarity(cells: Cell[]): Cell[][] {
    if (cells.length < 2) return [cells];

    // Calculate pairwise genetic distances
    const distances: number[][] = [];

    for (let i = 0; i < cells.length; i++) {
      distances[i] = [];
      for (let j = 0; j < cells.length; j++) {
        const cellI = cells[i];
        const cellJ = cells[j];

        if (i === j || !cellI || !cellJ) {
          distances[i]![j] = 0;
        } else {
          distances[i]![j] = this.matingSystem.calculateGeneticDistance(
            cellI.genome,
            cellJ.genome
          );
        }
      }
    }

    // Simple clustering: find cells that are far from the majority
    const clusters: Cell[][] = [[]];
    const assigned = new Set<number>();

    // Start with first cell in first cluster
    const firstCell = cells[0];
    if (firstCell && clusters[0]) {
      clusters[0].push(firstCell);
      assigned.add(0);
    }

    for (let i = 1; i < cells.length; i++) {
      const currentCell = cells[i];
      if (!currentCell) continue;

      let minAvgDistance = Infinity;
      let bestCluster = 0;

      // Find best cluster for this cell
      for (let c = 0; c < clusters.length; c++) {
        const cluster = clusters[c];
        if (!cluster) continue;

        let totalDistance = 0;

        for (const clusterCell of cluster) {
          const cellIndex = cells.indexOf(clusterCell);
          const distRow = distances[i];
          if (distRow && typeof distRow[cellIndex] === 'number') {
            totalDistance += distRow[cellIndex]!;
          }
        }

        const avgDistance = cluster.length > 0 ? totalDistance / cluster.length : 0;

        if (avgDistance < minAvgDistance) {
          minAvgDistance = avgDistance;
          bestCluster = c;
        }
      }

      // If too far from all clusters, create new cluster
      if (minAvgDistance > this.GENETIC_DISTANCE_THRESHOLD) {
        clusters.push([currentCell]);
      } else {
        const bestClusterArray = clusters[bestCluster];
        if (bestClusterArray) {
          bestClusterArray.push(currentCell);
        }
      }

      assigned.add(i);
    }

    // Filter out clusters that are too small
    return clusters.filter(cluster => cluster.length >= this.MIN_POPULATION_FOR_SPECIES);
  }

  // Create a new species from a population cluster
  private createNewSpecies(cells: Cell[], parentSpeciesId: string): Species {
    this.speciesNameCounter++;

    const averageTraits = this.calculateAverageTraits(cells);
    const firstCell = cells[0];
    const commonAncestor = firstCell?.genome.lineage.lineageId || 'unknown';

    const newSpecies: Species = {
      id: `species-${String(this.speciesNameCounter).padStart(3, '0')}`,
      name: this.generateSpeciesName(this.speciesNameCounter),
      commonAncestorLineageId: commonAncestor,
      divergenceTime: Date.now(),
      population: cells.length,
      averageTraits: averageTraits,
      isExtinct: false,
      color: averageTraits.color || 0x00ff00,
    };

    this.species.set(newSpecies.id, newSpecies);

    // Update cells to belong to new species
    for (const cell of cells) {
      cell.genome.lineage.speciesId = newSpecies.id;
    }

    // Add to phylogenetic tree
    this.addToPhylogeneticTree(newSpecies.id, parentSpeciesId);

    return newSpecies;
  }

  // Add species to phylogenetic tree
  private addToPhylogeneticTree(speciesId: string, parentSpeciesId: string | null): void {
    const node: PhylogeneticNode = {
      speciesId,
      parentSpeciesId,
      divergenceTime: Date.now(),
      children: [],
      isExtinct: false,
    };

    if (parentSpeciesId) {
      // Find parent and add as child
      const parent = this.findNodeById(this.phylogeneticTree, parentSpeciesId);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      // Root species
      this.phylogeneticTree.push(node);
    }
  }

  // Find node in phylogenetic tree
  private findNodeById(nodes: PhylogeneticNode[], speciesId: string): PhylogeneticNode | null {
    for (const node of nodes) {
      if (node.speciesId === speciesId) {
        return node;
      }

      const found = this.findNodeById(node.children, speciesId);
      if (found) return found;
    }

    return null;
  }

  // Calculate average traits for a population
  private calculateAverageTraits(cells: Cell[]): Partial<typeof cells[0]['traits']> {
    if (cells.length === 0) return {};

    const firstCell = cells[0];
    if (!firstCell) return {};

    const traits = firstCell.traits;
    const traitKeys = Object.keys(traits) as (keyof typeof traits)[];
    const averages: any = {};

    for (const key of traitKeys) {
      if (typeof traits[key] === 'number' && key !== 'color') {
        const sum = cells.reduce((acc, cell) => acc + (cell.traits[key] as number), 0);
        averages[key] = sum / cells.length;
      }
    }

    // Average color
    let totalR = 0, totalG = 0, totalB = 0;

    for (const cell of cells) {
      const color = cell.traits.color;
      totalR += (color >> 16) & 0xff;
      totalG += (color >> 8) & 0xff;
      totalB += color & 0xff;
    }

    const avgR = Math.floor(totalR / cells.length);
    const avgG = Math.floor(totalG / cells.length);
    const avgB = Math.floor(totalB / cells.length);
    averages.color = (avgR << 16) | (avgG << 8) | avgB;

    return averages;
  }

  // Generate creative species name
  private generateSpeciesName(number: number): string {
    const prefixes = [
      'Aqua', 'Bio', 'Cyto', 'Dyna', 'Evo', 'Foto', 'Geno', 'Hydro',
      'Iso', 'Kine', 'Lyso', 'Micro', 'Nano', 'Osmo', 'Proto', 'Quasi',
      'Ribo', 'Soma', 'Thermo', 'Ultra', 'Vivo', 'Xeno', 'Zygo'
    ];

    const suffixes = [
      'coccus', 'bacillus', 'spirillum', 'vibrio', 'forma', 'plasma',
      'cyte', 'zoon', 'phyte', 'morph', 'genesis', 'trophus', 'spore',
      'plast', 'soma', 'thrix', 'monas', 'ella', 'ensis', 'idae'
    ];

    const prefix = prefixes[number % prefixes.length];
    const suffix = suffixes[Math.floor(number / prefixes.length) % suffixes.length];

    return `${prefix}${suffix}`;
  }

  // Update species populations based on current cells
  updatePopulations(cells: Cell[]): void {
    // Reset all populations
    for (const species of this.species.values()) {
      species.population = 0;
    }

    // Count current populations
    for (const cell of cells) {
      const speciesId = cell.genome.lineage.speciesId || 'species-001';
      const species = this.species.get(speciesId);

      if (species) {
        species.population++;

        // Update average traits (running average)
        this.updateRunningAverage(species, cell.traits);
      }
    }

    // Check for extinctions
    this.checkForExtinctions();
  }

  // Update running average of species traits
  private updateRunningAverage(species: Species, traits: typeof species.averageTraits): void {
    const alpha = 0.05; // Smoothing factor

    for (const [key, value] of Object.entries(traits)) {
      if (typeof value === 'number' && key in species.averageTraits) {
        const oldValue = species.averageTraits[key as keyof typeof species.averageTraits] as number;
        const newValue = oldValue * (1 - alpha) + value * alpha;
        (species.averageTraits as Record<string, unknown>)[key] = newValue;
      }
    }
  }

  // Check for species extinctions
  private checkForExtinctions(): void {
    const currentTime = Date.now();

    for (const species of this.species.values()) {
      if (species.isExtinct) continue;

      // Species with 0 population for too long = extinct
      if (species.population === 0) {
        if (!species.extinctionTime) {
          species.extinctionTime = currentTime;
        } else if (currentTime - species.extinctionTime > this.EXTINCTION_THRESHOLD_TIME) {
          this.declareExtinct(species.id, 'Population depleted');
        }
      } else {
        // Population recovered, clear extinction timer
        delete species.extinctionTime;
      }
    }
  }

  // Declare a species extinct
  private declareExtinct(speciesId: string, reason: string): void {
    const species = this.species.get(speciesId);

    if (species && !species.isExtinct) {
      species.isExtinct = true;
      species.extinctionTime = Date.now();

      // Record extinction event
      this.extinctionEvents.push({
        speciesId,
        time: Date.now(),
        reason,
      });

      // Update phylogenetic tree
      const node = this.findNodeById(this.phylogeneticTree, speciesId);
      if (node) {
        node.isExtinct = true;
      }
    }
  }

  // Check reproductive isolation between two cells
  checkReproductiveIsolation(cell1: Cell, cell2: Cell): boolean {
    const compatibility = this.matingSystem.checkCompatibility(cell1, cell2);
    return compatibility < this.REPRODUCTIVE_ISOLATION_THRESHOLD;
  }

  // Get all species
  getAllSpecies(): Species[] {
    return Array.from(this.species.values());
  }

  // Get living species only
  getLivingSpecies(): Species[] {
    return Array.from(this.species.values()).filter(s => !s.isExtinct);
  }

  // Get phylogenetic tree
  getPhylogeneticTree(): PhylogeneticNode[] {
    return this.phylogeneticTree;
  }

  // Get extinction events
  getExtinctionEvents(): typeof this.extinctionEvents {
    return [...this.extinctionEvents];
  }

  // Get species by ID
  getSpecies(speciesId: string): Species | undefined {
    return this.species.get(speciesId);
  }

  // Get species diversity (number of living species)
  getSpeciesDiversity(): number {
    return this.getLivingSpecies().length;
  }

  // Export data for visualization
  exportData() {
    return {
      species: Array.from(this.species.values()),
      phylogeneticTree: this.phylogeneticTree,
      extinctionEvents: this.extinctionEvents,
      diversity: this.getSpeciesDiversity(),
    };
  }
}
