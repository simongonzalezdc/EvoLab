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
  achievements!: Table<{ id: number; data: string }>;

  constructor() {
    super('EvoLabDB');
    this.version(1).stores({
      simulations: '++id, name, timestamp, generation',
      creatures: '++id, name, timestamp',
      settings: 'id',
    });

    // Version 2: Add achievements table
    this.version(2).stores({
      simulations: '++id, name, timestamp, generation',
      creatures: '++id, name, timestamp',
      settings: 'id',
      achievements: 'id',
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
    try {
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
      return id;
    } catch (error) {
      console.error('Failed to save simulation:', error);
      throw new Error(`Failed to save simulation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async loadSimulation(id: number): Promise<SavedSimulation | undefined> {
    try {
      return await this.db.simulations.get(id);
    } catch (error) {
      console.error('Failed to load simulation:', error);
      throw new Error(`Failed to load simulation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAllSimulations(): Promise<SavedSimulation[]> {
    try {
      return await this.db.simulations.orderBy('timestamp').reverse().toArray();
    } catch (error) {
      console.error('Failed to get simulations:', error);
      throw new Error(`Failed to get simulations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteSimulation(id: number): Promise<void> {
    try {
      await this.db.simulations.delete(id);
    } catch (error) {
      console.error('Failed to delete simulation:', error);
      throw new Error(`Failed to delete simulation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async saveCreature(name: string, genome: Genome, thumbnail?: string): Promise<number> {
    try {
      const creature: SavedCreature = {
        name,
        timestamp: Date.now(),
        genome,
        thumbnail,
      };

      const id = await this.db.creatures.add(creature);
      return id;
    } catch (error) {
      console.error('Failed to save creature:', error);
      throw new Error(`Failed to save creature: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async loadCreature(id: number): Promise<SavedCreature | undefined> {
    try {
      return await this.db.creatures.get(id);
    } catch (error) {
      console.error('Failed to load creature:', error);
      throw new Error(`Failed to load creature: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAllCreatures(): Promise<SavedCreature[]> {
    try {
      return await this.db.creatures.orderBy('timestamp').reverse().toArray();
    } catch (error) {
      console.error('Failed to get creatures:', error);
      throw new Error(`Failed to get creatures: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteCreature(id: number): Promise<void> {
    try {
      await this.db.creatures.delete(id);
    } catch (error) {
      console.error('Failed to delete creature:', error);
      throw new Error(`Failed to delete creature: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async saveSettings(settings: GameSettings): Promise<void> {
    try {
      await this.db.settings.put({ id: 1, data: settings });
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw new Error(`Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async loadSettings(): Promise<GameSettings | undefined> {
    try {
      const result = await this.db.settings.get(1);
      return result?.data;
    } catch (error) {
      console.error('Failed to load settings:', error);
      throw new Error(`Failed to load settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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

  async saveAchievements(achievementData: string): Promise<void> {
    try {
      await this.db.achievements.put({ id: 1, data: achievementData });
    } catch (error) {
      console.error('Failed to save achievements:', error);
    }
  }

  async loadAchievements(): Promise<string | undefined> {
    try {
      const result = await this.db.achievements.get(1);
      return result?.data;
    } catch (error) {
      console.error('Failed to load achievements:', error);
      return undefined;
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
