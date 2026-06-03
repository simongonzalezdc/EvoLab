import Dexie, { type Table } from 'dexie';
import { Genome } from '../genetics/Genome';
import { logger } from '../utils/Logger';

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
  // Mutation settings
  mutationRate: number; // 0-1 (0-100%)
  mutationMagnitude: number; // 0-1 (0-100%)
  beneficialBias: number; // 0-1 (0-100%)
  // Event settings
  randomEventsEnabled: boolean;
  // Accessibility settings
  highContrastMode: boolean;
  reduceMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  screenReaderAnnouncements: boolean;
  dyslexiaFriendlyFont: boolean;
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

function formatErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

function createCausedError(message: string, cause: unknown): Error {
  const error = new Error(message) as Error & { cause?: unknown };
  error.cause = cause;
  return error;
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
      logger.error('Failed to save simulation:', error);
      throw createCausedError(`Failed to save simulation: ${formatErrorMessage(error)}`, error);
    }
  }

  async loadSimulation(id: number): Promise<SavedSimulation | undefined> {
    try {
      return await this.db.simulations.get(id);
    } catch (error) {
      logger.error('Failed to load simulation:', error);
      throw createCausedError(`Failed to load simulation: ${formatErrorMessage(error)}`, error);
    }
  }

  async getAllSimulations(): Promise<SavedSimulation[]> {
    try {
      return await this.db.simulations.orderBy('timestamp').reverse().toArray();
    } catch (error) {
      logger.error('Failed to get simulations:', error);
      throw createCausedError(`Failed to get simulations: ${formatErrorMessage(error)}`, error);
    }
  }

  async deleteSimulation(id: number): Promise<void> {
    try {
      await this.db.simulations.delete(id);
    } catch (error) {
      logger.error('Failed to delete simulation:', error);
      throw createCausedError(`Failed to delete simulation: ${formatErrorMessage(error)}`, error);
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
      logger.error('Failed to save creature:', error);
      throw createCausedError(`Failed to save creature: ${formatErrorMessage(error)}`, error);
    }
  }

  async loadCreature(id: number): Promise<SavedCreature | undefined> {
    try {
      return await this.db.creatures.get(id);
    } catch (error) {
      logger.error('Failed to load creature:', error);
      throw createCausedError(`Failed to load creature: ${formatErrorMessage(error)}`, error);
    }
  }

  async getAllCreatures(): Promise<SavedCreature[]> {
    try {
      return await this.db.creatures.orderBy('timestamp').reverse().toArray();
    } catch (error) {
      logger.error('Failed to get creatures:', error);
      throw createCausedError(`Failed to get creatures: ${formatErrorMessage(error)}`, error);
    }
  }

  async deleteCreature(id: number): Promise<void> {
    try {
      await this.db.creatures.delete(id);
    } catch (error) {
      logger.error('Failed to delete creature:', error);
      throw createCausedError(`Failed to delete creature: ${formatErrorMessage(error)}`, error);
    }
  }

  async saveSettings(settings: GameSettings): Promise<void> {
    try {
      await this.db.settings.put({ id: 1, data: settings });
    } catch (error) {
      logger.error('Failed to save settings:', error);
      throw createCausedError(`Failed to save settings: ${formatErrorMessage(error)}`, error);
    }
  }

  async loadSettings(): Promise<GameSettings | undefined> {
    try {
      const result = await this.db.settings.get(1);
      if (!result?.data) {
        return undefined;
      }
      // Merge with defaults to handle new settings from updates
      return this.migrateSettings(result.data);
    } catch (error) {
      logger.error('Failed to load settings:', error);
      throw createCausedError(`Failed to load settings: ${formatErrorMessage(error)}`, error);
    }
  }

  /**
   * Migrate old settings to include new properties with defaults
   * This ensures backward compatibility when new settings are added
   */
  private migrateSettings(savedSettings: Partial<GameSettings>): GameSettings {
    const defaults = this.getDefaultSettings();
    return {
      ...defaults,
      ...savedSettings,
      // Ensure accessibility settings have defaults if missing
      highContrastMode: savedSettings.highContrastMode ?? defaults.highContrastMode,
      reduceMotion: savedSettings.reduceMotion ?? defaults.reduceMotion,
      fontSize: savedSettings.fontSize ?? defaults.fontSize,
      screenReaderAnnouncements: savedSettings.screenReaderAnnouncements ?? defaults.screenReaderAnnouncements,
      dyslexiaFriendlyFont: savedSettings.dyslexiaFriendlyFont ?? defaults.dyslexiaFriendlyFont,
    };
  }

  getDefaultSettings(): GameSettings {
    return {
      graphicsQuality: 'high',
      showBiomes: true,
      showGrid: false,
      showStats: true,
      soundEnabled: false,
      musicEnabled: true, // Enable music by default
      autoSave: true,
      autoSaveInterval: 5,
      // Mutation settings (defaults match MutationEngine)
      mutationRate: 0.15, // 15%
      mutationMagnitude: 0.15, // 15%
      beneficialBias: 0.1, // 10%
      // Event settings
      randomEventsEnabled: true,
      // Accessibility settings
      highContrastMode: false,
      reduceMotion: false,
      fontSize: 'medium',
      screenReaderAnnouncements: true,
      dyslexiaFriendlyFont: false,
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
      const lineage = data.genome.lineage || {
        generation: 0,
        lineageId: `lineage-${Date.now()}`,
        mutations: [],
      };
      const genome = new Genome(data.genome.traits, lineage);
      genome.dnaPoints = data.genome.dnaPoints || 0;

      return {
        name: data.name || 'Imported Creature',
        genome,
      };
    } catch (error) {
      logger.error('Failed to import creature:', error);
      return null;
    }
  }

  async saveAchievements(achievementData: string): Promise<void> {
    try {
      await this.db.achievements.put({ id: 1, data: achievementData });
    } catch (error) {
      logger.error('Failed to save achievements:', error);
    }
  }

  async loadAchievements(): Promise<string | undefined> {
    try {
      const result = await this.db.achievements.get(1);
      return result?.data;
    } catch (error) {
      logger.error('Failed to load achievements:', error);
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
