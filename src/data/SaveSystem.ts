import Dexie, { type Table } from 'dexie';
import { Genome } from '../genetics/Genome';
import type { Traits } from '../types/entities';

export interface SavedSimulation {
  id?: number;
  name: string;
  timestamp: number;
  generation: number;
  playerData: {
    genome: Genome;
    position: { x: number; y: number };
    atp: number;
  };
  populationData: {
    herbivores: number;
    carnivores: number;
    omnivores: number;
  };
  historyData: string; // JSON serialized history
  settings: GameSettings;
}

export interface SavedCreature {
  id?: number;
  name: string;
  timestamp: number;
  genome: Genome;
  thumbnail?: string; // Base64 image
}

export interface GameSettings {
  graphicsQuality: 'low' | 'medium' | 'high';
  showBiomes: boolean;
  showGrid: boolean;
  showStats: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  autoSave: boolean;
  autoSaveInterval: number; // minutes
}

class EvoLabDatabase extends Dexie {
  simulations!: Table<SavedSimulation>;
  creatures!: Table<SavedCreature>;
  settings!: Table<{ id: number; data: GameSettings }>;

  constructor() {
    super('EvoLabDB');
    this.version(1).stores({
      simulations: '++id, name, timestamp, generation',
      creatures: '++id, name, timestamp',
      settings: 'id',
    });
  }
}

export class SaveSystem {
  private db: EvoLabDatabase;
  private autoSaveTimer: number | null = null;

  constructor() {
    this.db = new EvoLabDatabase();
  }

  async saveSimulation(
    name: string,
    playerData: SavedSimulation['playerData'],
    populationData: SavedSimulation['populationData'],
    historyData: string,
    generation: number,
    settings: GameSettings
  ): Promise<number> {
    const save: SavedSimulation = {
      name,
      timestamp: Date.now(),
      generation,
      playerData,
      populationData,
      historyData,
      settings,
    };

    const id = await this.db.simulations.add(save);
    console.log(`Simulation saved with ID: ${id}`);
    return id;
  }

  async loadSimulation(id: number): Promise<SavedSimulation | undefined> {
    return await this.db.simulations.get(id);
  }

  async getAllSimulations(): Promise<SavedSimulation[]> {
    return await this.db.simulations.orderBy('timestamp').reverse().toArray();
  }

  async deleteSimulation(id: number): Promise<void> {
    await this.db.simulations.delete(id);
  }

  async saveCreature(name: string, genome: Genome, thumbnail?: string): Promise<number> {
    const creature: SavedCreature = {
      name,
      timestamp: Date.now(),
      genome,
      thumbnail,
    };

    const id = await this.db.creatures.add(creature);
    console.log(`Creature saved with ID: ${id}`);
    return id;
  }

  async loadCreature(id: number): Promise<SavedCreature | undefined> {
    return await this.db.creatures.get(id);
  }

  async getAllCreatures(): Promise<SavedCreature[]> {
    return await this.db.creatures.orderBy('timestamp').reverse().toArray();
  }

  async deleteCreature(id: number): Promise<void> {
    await this.db.creatures.delete(id);
  }

  async saveSettings(settings: GameSettings): Promise<void> {
    await this.db.settings.put({ id: 1, data: settings });
  }

  async loadSettings(): Promise<GameSettings | undefined> {
    const result = await this.db.settings.get(1);
    return result?.data;
  }

  getDefaultSettings(): GameSettings {
    return {
      graphicsQuality: 'high',
      showBiomes: true,
      showGrid: false,
      showStats: true,
      soundEnabled: false,
      musicEnabled: false,
      autoSave: true,
      autoSaveInterval: 5,
    };
  }

  exportCreatureToJSON(genome: Genome, name: string): string {
    return JSON.stringify({
      name,
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      genome: {
        traits: genome.traits,
        lineage: genome.lineage,
      },
    }, null, 2);
  }

  importCreatureFromJSON(json: string): { name: string; genome: Genome } | null {
    try {
      const data = JSON.parse(json);

      if (!data.genome || !data.genome.traits) {
        throw new Error('Invalid creature format');
      }

      // Create a new Genome from the imported data
      const genome = new (Genome as any)();
      genome.traits = data.genome.traits;
      genome.lineage = data.genome.lineage || {
        generationNumber: 0,
        parentId: null,
        mutationHistory: [],
      };

      return {
        name: data.name || 'Imported Creature',
        genome,
      };
    } catch (error) {
      console.error('Failed to import creature:', error);
      return null;
    }
  }

  startAutoSave(
    callback: () => Promise<void>,
    intervalMinutes: number
  ): void {
    this.stopAutoSave();
    this.autoSaveTimer = window.setInterval(callback, intervalMinutes * 60 * 1000);
  }

  stopAutoSave(): void {
    if (this.autoSaveTimer !== null) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }
}
