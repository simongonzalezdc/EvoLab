// Achievement and Challenge System

export enum AchievementCategory {
  SURVIVAL = 'survival',
  EVOLUTION = 'evolution',
  COMBAT = 'combat',
  EXPLORATION = 'exploration',
  TRAITS = 'traits',
  CHALLENGES = 'challenges',
}

export enum AchievementRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  requirement: number;
  hidden: boolean; // Secret achievements
  unlocked: boolean;
  unlockedAt?: number; // Timestamp
  progress: number; // Current progress toward requirement
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  timeLimit?: number; // Seconds
  active: boolean;
  completed: boolean;
  progress: number;
  target: number;
  reward: {
    dnaPoints: number;
    description: string;
  };
}

export class AchievementSystem {
  private achievements: Map<string, Achievement> = new Map();
  private challenges: Map<string, Challenge> = new Map();
  private activeChallenges: Challenge[] = [];
  private listeners: Array<(achievement: Achievement) => void> = [];

  constructor() {
    this.initializeAchievements();
    this.initializeChallenges();
  }

  private initializeAchievements(): void {
    const achievementList: Achievement[] = [
      // SURVIVAL ACHIEVEMENTS
      {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Survive for 60 seconds',
        category: AchievementCategory.SURVIVAL,
        rarity: AchievementRarity.COMMON,
        icon: '🐣',
        requirement: 60,
        hidden: false,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'survivor',
        name: 'Survivor',
        description: 'Survive for 5 minutes',
        category: AchievementCategory.SURVIVAL,
        rarity: AchievementRarity.UNCOMMON,
        icon: '💪',
        requirement: 300,
        hidden: false,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'endurance_master',
        name: 'Endurance Master',
        description: 'Survive for 15 minutes',
        category: AchievementCategory.SURVIVAL,
        rarity: AchievementRarity.RARE,
        icon: '🏆',
        requirement: 900,
        hidden: false,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'immortal',
        name: 'Immortal',
        description: 'Survive for 30 minutes',
        category: AchievementCategory.SURVIVAL,
        rarity: AchievementRarity.EPIC,
        icon: '👑',
        requirement: 1800,
        hidden: false,
        unlocked: false,
        progress: 0,
      },

      // EVOLUTION ACHIEVEMENTS
      {
        id: 'first_evolution',
        name: 'First Evolution',
        description: 'Reach generation 2',
        category: AchievementCategory.EVOLUTION,
        rarity: AchievementRarity.COMMON,
        icon: '🧬',
        requirement: 2,
        hidden: false,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'evolution_master',
        name: 'Evolution Master',
        description: 'Reach generation 10',
        category: AchievementCategory.EVOLUTION,
        rarity: AchievementRarity.RARE,
        icon: '🔬',
        requirement: 10,
        hidden: false,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'ancient_lineage',
        name: 'Ancient Lineage',
        description: 'Reach generation 25',
        category: AchievementCategory.EVOLUTION,
        rarity: AchievementRarity.EPIC,
        icon: '🦖',
        requirement: 25,
        hidden: false,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'gene_collector',
        name: 'Gene Collector',
        description: 'Accumulate 1000 DNA points',
        category: AchievementCategory.EVOLUTION,
        rarity: AchievementRarity.RARE,
        icon: '💎',
        requirement: 1000,
        hidden: false,
        unlocked: false,
        progress: 0,
      },

      // COMBAT ACHIEVEMENTS
      {
        id: 'first_kill',
        name: 'First Kill',
        description: 'Defeat another cell',
        category: AchievementCategory.COMBAT,
        rarity: AchievementRarity.COMMON,
        icon: '⚔️',
        requirement: 1,
        hidden: false,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'predator',
        name: 'Predator',
        description: 'Defeat 25 cells',
        category: AchievementCategory.COMBAT,
        rarity: AchievementRarity.UNCOMMON,
        icon: '🦈',
        requirement: 25,
        hidden: false,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'apex_predator',
        name: 'Apex Predator',
        description: 'Defeat 100 cells',
        category: AchievementCategory.COMBAT,
        rarity: AchievementRarity.RARE,
        icon: '🦁',
        requirement: 100,
        hidden: false,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'carnivore_hunter',
        name: 'Carnivore Hunter',
        description: 'Defeat 10 carnivore cells',
        category: AchievementCategory.COMBAT,
        rarity: AchievementRarity.EPIC,
        icon: '🗡️',
        requirement: 10,
        hidden: false,
        unlocked: false,
        progress: 0,
      },

      // EXPLORATION ACHIEVEMENTS
      {
        id: 'explorer',
        name: 'Explorer',
        description: 'Visit 3 different biomes',
        category: AchievementCategory.EXPLORATION,
        rarity: AchievementRarity.COMMON,
        icon: '🗺️',
        requirement: 3,
        hidden: false,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'world_traveler',
        name: 'World Traveler',
        description: 'Visit all 7 biomes',
        category: AchievementCategory.EXPLORATION,
        rarity: AchievementRarity.UNCOMMON,
        icon: '🌍',
        requirement: 7,
        hidden: false,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'resource_collector',
        name: 'Resource Collector',
        description: 'Collect 500 glucose',
        category: AchievementCategory.EXPLORATION,
        rarity: AchievementRarity.UNCOMMON,
        icon: '🍬',
        requirement: 500,
        hidden: false,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'hoarder',
        name: 'Hoarder',
        description: 'Collect 2000 glucose',
        category: AchievementCategory.EXPLORATION,
        rarity: AchievementRarity.RARE,
        icon: '💰',
        requirement: 2000,
        hidden: false,
        unlocked: false,
        progress: 0,
      },

      // TRAIT ACHIEVEMENTS
      {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Reach speed trait 10',
        category: AchievementCategory.TRAITS,
        rarity: AchievementRarity.UNCOMMON,
        icon: '⚡',
        requirement: 10,
        hidden: false,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'tank_build',
        name: 'Tank Build',
        description: 'Reach armor trait 10',
        category: AchievementCategory.TRAITS,
        rarity: AchievementRarity.UNCOMMON,
        icon: '🛡️',
        requirement: 10,
        hidden: false,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'giant',
        name: 'Giant',
        description: 'Reach size trait 10',
        category: AchievementCategory.TRAITS,
        rarity: AchievementRarity.UNCOMMON,
        icon: '🐘',
        requirement: 10,
        hidden: false,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'genius',
        name: 'Genius',
        description: 'Reach intelligence trait 10',
        category: AchievementCategory.TRAITS,
        rarity: AchievementRarity.UNCOMMON,
        icon: '🧠',
        requirement: 10,
        hidden: false,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'perfect_specimen',
        name: 'Perfect Specimen',
        description: 'Have 5 traits at maximum',
        category: AchievementCategory.TRAITS,
        rarity: AchievementRarity.LEGENDARY,
        icon: '🌟',
        requirement: 5,
        hidden: false,
        unlocked: false,
        progress: 0,
      },

      // SECRET ACHIEVEMENTS
      {
        id: 'pacifist',
        name: 'Pacifist',
        description: 'Reach generation 5 without killing any cells',
        category: AchievementCategory.CHALLENGES,
        rarity: AchievementRarity.EPIC,
        icon: '☮️',
        requirement: 5,
        hidden: true,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'underdog',
        name: 'Underdog',
        description: 'Defeat a cell twice your size',
        category: AchievementCategory.COMBAT,
        rarity: AchievementRarity.RARE,
        icon: '🎯',
        requirement: 1,
        hidden: true,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'close_call',
        name: 'Close Call',
        description: 'Survive with less than 5% health',
        category: AchievementCategory.SURVIVAL,
        rarity: AchievementRarity.RARE,
        icon: '💀',
        requirement: 1,
        hidden: true,
        unlocked: false,
        progress: 0,
      },
    ];

    achievementList.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  private initializeChallenges(): void {
    const challengeList: Challenge[] = [
      {
        id: 'speed_run',
        name: 'Speed Run',
        description: 'Reach generation 3 in under 5 minutes',
        difficulty: 'medium',
        timeLimit: 300,
        active: false,
        completed: false,
        progress: 0,
        target: 3,
        reward: {
          dnaPoints: 100,
          description: '+100 DNA Points',
        },
      },
      {
        id: 'exterminator',
        name: 'Exterminator',
        description: 'Defeat 20 cells in 3 minutes',
        difficulty: 'hard',
        timeLimit: 180,
        active: false,
        completed: false,
        progress: 0,
        target: 20,
        reward: {
          dnaPoints: 150,
          description: '+150 DNA Points',
        },
      },
      {
        id: 'collector',
        name: 'Collector',
        description: 'Collect 100 glucose in 2 minutes',
        difficulty: 'easy',
        timeLimit: 120,
        active: false,
        completed: false,
        progress: 0,
        target: 100,
        reward: {
          dnaPoints: 50,
          description: '+50 DNA Points',
        },
      },
      {
        id: 'tour_guide',
        name: 'Tour Guide',
        description: 'Visit all biomes in 5 minutes',
        difficulty: 'medium',
        timeLimit: 300,
        active: false,
        completed: false,
        progress: 0,
        target: 7,
        reward: {
          dnaPoints: 120,
          description: '+120 DNA Points',
        },
      },
    ];

    challengeList.forEach(challenge => {
      this.challenges.set(challenge.id, challenge);
    });
  }

  // Track progress for achievements
  trackProgress(achievementId: string, value: number): void {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || achievement.unlocked) return;

    achievement.progress = Math.max(achievement.progress, value);

    if (achievement.progress >= achievement.requirement) {
      this.unlockAchievement(achievementId);
    }
  }

  incrementProgress(achievementId: string, amount: number = 1): void {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || achievement.unlocked) return;

    achievement.progress += amount;

    if (achievement.progress >= achievement.requirement) {
      this.unlockAchievement(achievementId);
    }
  }

  private unlockAchievement(achievementId: string): void {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || achievement.unlocked) return;

    achievement.unlocked = true;
    achievement.unlockedAt = Date.now();

    // Notify listeners
    this.listeners.forEach(listener => listener(achievement));
  }

  onAchievementUnlocked(callback: (achievement: Achievement) => void): void {
    this.listeners.push(callback);
  }

  getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  getUnlockedAchievements(): Achievement[] {
    return Array.from(this.achievements.values()).filter(a => a.unlocked);
  }

  getAchievementsByCategory(category: AchievementCategory): Achievement[] {
    return Array.from(this.achievements.values()).filter(a => a.category === category);
  }

  getCompletionPercentage(): number {
    const total = this.achievements.size;
    const unlocked = this.getUnlockedAchievements().length;
    return (unlocked / total) * 100;
  }

  // Challenge methods
  startChallenge(challengeId: string): boolean {
    const challenge = this.challenges.get(challengeId);
    if (!challenge || challenge.completed) return false;

    challenge.active = true;
    challenge.progress = 0;
    this.activeChallenges.push(challenge);
    return true;
  }

  updateChallengeProgress(challengeId: string, progress: number): void {
    const challenge = this.challenges.get(challengeId);
    if (!challenge || !challenge.active) return;

    challenge.progress = progress;

    if (challenge.progress >= challenge.target) {
      this.completeChallenge(challengeId);
    }
  }

  private completeChallenge(challengeId: string): void {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) return;

    challenge.completed = true;
    challenge.active = false;
    this.activeChallenges = this.activeChallenges.filter(c => c.id !== challengeId);
  }

  getActiveChallenges(): Challenge[] {
    return this.activeChallenges;
  }

  getAllChallenges(): Challenge[] {
    return Array.from(this.challenges.values());
  }

  // Save/Load
  exportProgress(): string {
    return JSON.stringify({
      achievements: Array.from(this.achievements.entries()),
      challenges: Array.from(this.challenges.entries()),
    });
  }

  importProgress(data: string): void {
    try {
      const parsed = JSON.parse(data);
      this.achievements = new Map(parsed.achievements);
      this.challenges = new Map(parsed.challenges);
    } catch (error) {
      console.error('Failed to import achievement progress:', error);
    }
  }
}
