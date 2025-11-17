// Local leaderboard system for tracking top runs
export interface LeaderboardEntry {
  id: string;
  date: number; // Timestamp
  generation: number;
  survivalTime: number;
  dnaCollected: number;
  resourcesCollected: number;
  maxPopulation: number;
  deathCause: 'atp' | 'health' | 'ongoing';
  speciesName?: string;
}

export class LeaderboardSystem {
  private static readonly STORAGE_KEY = 'evolab_leaderboard';
  private static readonly MAX_ENTRIES = 10;
  private entries: LeaderboardEntry[] = [];

  constructor() {
    this.loadFromStorage();
  }

  // Add new entry and return if it made the top 10
  addEntry(entry: Omit<LeaderboardEntry, 'id' | 'date'>): { isNewRecord: boolean; rank: number } {
    const newEntry: LeaderboardEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: Date.now(),
    };

    this.entries.push(newEntry);
    this.sortEntries();

    // Keep only top 10
    const rank = this.entries.findIndex(e => e.id === newEntry.id) + 1;
    const isNewRecord = rank <= LeaderboardSystem.MAX_ENTRIES;

    this.entries = this.entries.slice(0, LeaderboardSystem.MAX_ENTRIES);
    this.saveToStorage();

    return { isNewRecord, rank };
  }

  // Get all entries
  getEntries(): LeaderboardEntry[] {
    return [...this.entries];
  }

  // Get top N entries
  getTopEntries(count: number = 5): LeaderboardEntry[] {
    return this.entries.slice(0, count);
  }

  // Calculate score for an entry (used for sorting)
  private calculateScore(entry: LeaderboardEntry): number {
    // Weighted score: generation is most important, then DNA, then survival time
    return (
      entry.generation * 1000 +
      entry.dnaCollected * 10 +
      entry.survivalTime * 0.1 +
      entry.resourcesCollected * 0.5 +
      entry.maxPopulation * 2
    );
  }

  // Sort entries by score (highest first)
  private sortEntries(): void {
    this.entries.sort((a, b) => this.calculateScore(b) - this.calculateScore(a));
  }

  // Get personal best in each category
  getPersonalBests(): {
    highestGeneration: LeaderboardEntry | null;
    mostDNA: LeaderboardEntry | null;
    longestSurvival: LeaderboardEntry | null;
    mostResources: LeaderboardEntry | null;
  } {
    if (this.entries.length === 0) {
      return {
        highestGeneration: null,
        mostDNA: null,
        longestSurvival: null,
        mostResources: null,
      };
    }

    return {
      highestGeneration: this.entries.reduce((max, e) =>
        e.generation > (max?.generation || 0) ? e : max
      , this.entries[0] || null),
      mostDNA: this.entries.reduce((max, e) =>
        e.dnaCollected > (max?.dnaCollected || 0) ? e : max
      , this.entries[0] || null),
      longestSurvival: this.entries.reduce((max, e) =>
        e.survivalTime > (max?.survivalTime || 0) ? e : max
      , this.entries[0] || null),
      mostResources: this.entries.reduce((max, e) =>
        e.resourcesCollected > (max?.resourcesCollected || 0) ? e : max
      , this.entries[0] || null),
    };
  }

  // Check if current run would make the leaderboard
  wouldMakeLeaderboard(entry: Omit<LeaderboardEntry, 'id' | 'date'>): boolean {
    if (this.entries.length < LeaderboardSystem.MAX_ENTRIES) return true;

    const tempEntry: LeaderboardEntry = {
      ...entry,
      id: 'temp',
      date: Date.now(),
    };

    const worstEntry = this.entries[this.entries.length - 1];
    if (!worstEntry) return true;
    const worstScore = this.calculateScore(worstEntry);
    return this.calculateScore(tempEntry) > worstScore;
  }

  // Clear all entries
  clear(): void {
    this.entries = [];
    this.saveToStorage();
  }

  // Save to localStorage
  private saveToStorage(): void {
    try {
      localStorage.setItem(LeaderboardSystem.STORAGE_KEY, JSON.stringify(this.entries));
    } catch (error) {
      console.error('Failed to save leaderboard:', error);
    }
  }

  // Load from localStorage
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(LeaderboardSystem.STORAGE_KEY);
      if (stored) {
        this.entries = JSON.parse(stored);
        this.sortEntries();
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      this.entries = [];
    }
  }
}
