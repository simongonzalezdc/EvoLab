import type { Traits } from '../types/entities';
import type { Genome } from '../genetics/Genome';

export interface GenerationSnapshot {
  generation: number;
  timestamp: number;
  population: number;
  averageTraits: Partial<Traits>;
  totalDeaths: number;
  totalBirths: number;
  dominantLineage: string;
}

export interface LineageNode {
  id: string;
  parentId: string | null;
  generation: number;
  traits: Traits;
  birthTime: number;
  deathTime: number | null;
  childrenIds: string[];
  isPlayerLineage: boolean;
}

export interface PopulationDataPoint {
  generation: number;
  timestamp: number;
  herbivores: number;
  carnivores: number;
  omnivores: number;
  player: number;
  total: number;
}

export class HistoryTracker {
  private generationHistory: GenerationSnapshot[] = [];
  private lineageTree: Map<string, LineageNode> = new Map();
  private populationData: PopulationDataPoint[] = [];
  private currentGeneration = 0;
  private birthsThisGen = 0;
  private deathsThisGen = 0;
  private readonly maxHistoryLength = 100;

  constructor() {
    // Initialize with generation 0
    this.addPopulationSnapshot(0, 0, 0, 0);
  }

  incrementGeneration(): void {
    this.currentGeneration++;
    this.birthsThisGen = 0;
    this.deathsThisGen = 0;
  }

  recordBirth(cellId: string, genome: Genome, parentId: string | null, isPlayer: boolean): void {
    this.birthsThisGen++;

    const node: LineageNode = {
      id: cellId,
      parentId,
      generation: this.currentGeneration,
      traits: { ...genome.traits },
      birthTime: Date.now(),
      deathTime: null,
      childrenIds: [],
      isPlayerLineage: isPlayer || this.isPlayerLineage(parentId),
    };

    this.lineageTree.set(cellId, node);

    // Update parent's children list
    if (parentId && this.lineageTree.has(parentId)) {
      this.lineageTree.get(parentId)!.childrenIds.push(cellId);
    }
  }

  recordDeath(cellId: string): void {
    this.deathsThisGen++;

    const node = this.lineageTree.get(cellId);
    if (node) {
      node.deathTime = Date.now();
    }
  }

  addPopulationSnapshot(
    herbivores: number,
    carnivores: number,
    omnivores: number,
    player: number
  ): void {
    const dataPoint: PopulationDataPoint = {
      generation: this.currentGeneration,
      timestamp: Date.now(),
      herbivores,
      carnivores,
      omnivores,
      player,
      total: herbivores + carnivores + omnivores + player,
    };

    this.populationData.push(dataPoint);

    // Keep only last maxHistoryLength entries
    if (this.populationData.length > this.maxHistoryLength) {
      this.populationData.shift();
    }
  }

  addGenerationSnapshot(
    population: number,
    averageTraits: Partial<Traits>,
    dominantLineage: string
  ): void {
    const snapshot: GenerationSnapshot = {
      generation: this.currentGeneration,
      timestamp: Date.now(),
      population,
      averageTraits,
      totalDeaths: this.deathsThisGen,
      totalBirths: this.birthsThisGen,
      dominantLineage,
    };

    this.generationHistory.push(snapshot);

    // Keep only last maxHistoryLength entries
    if (this.generationHistory.length > this.maxHistoryLength) {
      this.generationHistory.shift();
    }
  }

  private isPlayerLineage(cellId: string | null): boolean {
    if (!cellId) return false;
    const node = this.lineageTree.get(cellId);
    return node ? node.isPlayerLineage : false;
  }

  getCurrentGeneration(): number {
    return this.currentGeneration;
  }

  getPopulationData(): PopulationDataPoint[] {
    return [...this.populationData];
  }

  getGenerationHistory(): GenerationSnapshot[] {
    return [...this.generationHistory];
  }

  getLineageTree(): Map<string, LineageNode> {
    return new Map(this.lineageTree);
  }

  getPlayerLineage(): LineageNode[] {
    return Array.from(this.lineageTree.values())
      .filter(node => node.isPlayerLineage)
      .sort((a, b) => a.generation - b.generation);
  }

  exportToJSON(): string {
    return JSON.stringify({
      currentGeneration: this.currentGeneration,
      generationHistory: this.generationHistory,
      populationData: this.populationData,
      lineageTree: Array.from(this.lineageTree.entries()),
    }, null, 2);
  }

  importFromJSON(jsonString: string): void {
    try {
      const data = JSON.parse(jsonString);

      this.currentGeneration = data.currentGeneration || 0;
      this.generationHistory = data.generationHistory || [];
      this.populationData = data.populationData || [];

      // Restore lineage tree from array of entries
      this.lineageTree.clear();
      if (data.lineageTree && Array.isArray(data.lineageTree)) {
        for (const [id, node] of data.lineageTree) {
          this.lineageTree.set(id, node);
        }
      }

      this.birthsThisGen = 0;
      this.deathsThisGen = 0;
    } catch (error) {
      console.error('Failed to import history data:', error);
      throw error;
    }
  }

  exportToCSV(): string {
    let csv = 'Generation,Timestamp,Herbivores,Carnivores,Omnivores,Player,Total,Births,Deaths\n';

    for (let i = 0; i < this.populationData.length; i++) {
      const pop = this.populationData[i];
      const gen = i < this.generationHistory.length ? this.generationHistory[i] : null;

      if (pop) {
        csv += `${pop.generation},${pop.timestamp},${pop.herbivores},${pop.carnivores},${pop.omnivores},${pop.player},${pop.total},${gen?.totalBirths || 0},${gen?.totalDeaths || 0}\n`;
      }
    }

    return csv;
  }

  reset(): void {
    this.generationHistory = [];
    this.lineageTree.clear();
    this.populationData = [];
    this.currentGeneration = 0;
    this.birthsThisGen = 0;
    this.deathsThisGen = 0;
    this.addPopulationSnapshot(0, 0, 0, 0);
  }
}
