// Faction/Playstyle System
// Defines different approaches to evolution with unique bonuses and goals

export enum FactionType {
  NATURAL_SELECTION = 'natural_selection',
  INTELLIGENT_DESIGN = 'intelligent_design',
  DESTROYER = 'destroyer',
  BALANCER = 'balancer',
}

export interface FactionBonus {
  type: 'dna_multiplier' | 'mutation_rate' | 'resource_bonus' | 'combat_bonus' | 'survival_bonus';
  value: number;
  description: string;
}

export interface VictoryCondition {
  type: 'generation' | 'population' | 'diversity' | 'biomass' | 'survival_time' | 'kills' | 'equilibrium';
  target: number;
  description: string;
}

export interface Faction {
  type: FactionType;
  name: string;
  description: string;
  philosophy: string;
  bonuses: FactionBonus[];
  victoryConditions: VictoryCondition[];
  color: number; // UI accent color
  icon: string;
}

export class FactionSystem {
  private currentFaction?: Faction;
  private factionProgress: Map<string, number> = new Map();

  constructor() {
    this.initializeFactions();
  }

  private initializeFactions(): void {
    // Progress trackers for each faction
    this.factionProgress.set('generation', 0);
    this.factionProgress.set('population', 0);
    this.factionProgress.set('diversity', 0);
    this.factionProgress.set('biomass', 0);
    this.factionProgress.set('survival_time', 0);
    this.factionProgress.set('kills', 0);
    this.factionProgress.set('equilibrium_time', 0);
  }

  getFaction(type: FactionType): Faction {
    switch (type) {
      case FactionType.NATURAL_SELECTION:
        return {
          type,
          name: '🌿 Natural Selection',
          description: 'Let evolution run its course with minimal intervention',
          philosophy: 'Nature finds a way. Trust the process of natural selection to create the strongest species.',
          bonuses: [
            {
              type: 'mutation_rate',
              value: 1.5,
              description: '+50% mutation rate - evolution happens faster',
            },
            {
              type: 'survival_bonus',
              value: 1.2,
              description: '+20% ATP from survival - rewards patience',
            },
          ],
          victoryConditions: [
            {
              type: 'generation',
              target: 50,
              description: 'Reach generation 50 through pure natural selection',
            },
            {
              type: 'diversity',
              target: 8,
              description: 'Maintain genetic diversity index of 8+',
            },
          ],
          color: 0x4caf50, // Green
          icon: '🌿',
        };

      case FactionType.INTELLIGENT_DESIGN:
        return {
          type,
          name: '🧬 Intelligent Design',
          description: 'Actively guide evolution through careful trait selection',
          philosophy: 'With knowledge and foresight, we can perfect life itself through intentional design.',
          bonuses: [
            {
              type: 'dna_multiplier',
              value: 1.5,
              description: '+50% DNA points earned - more evolution budget',
            },
            {
              type: 'mutation_rate',
              value: 0.5,
              description: '-50% random mutations - more control',
            },
          ],
          victoryConditions: [
            {
              type: 'generation',
              target: 30,
              description: 'Reach generation 30 with precise evolution',
            },
            {
              type: 'biomass',
              target: 5000,
              description: 'Achieve 5000 total biomass through optimization',
            },
          ],
          color: 0x2196f3, // Blue
          icon: '🧬',
        };

      case FactionType.DESTROYER:
        return {
          type,
          name: '⚔️ Destroyer',
          description: 'Thrive in chaos and hostile environments',
          philosophy: 'Only the strong survive. Create an apex predator that dominates through power.',
          bonuses: [
            {
              type: 'combat_bonus',
              value: 1.3,
              description: '+30% combat damage - dominate prey',
            },
            {
              type: 'resource_bonus',
              value: 1.5,
              description: '+50% ATP from kills - rewarding aggression',
            },
          ],
          victoryConditions: [
            {
              type: 'kills',
              target: 100,
              description: 'Eliminate 100 competing organisms',
            },
            {
              type: 'survival_time',
              target: 600,
              description: 'Survive 600 seconds in hostile biomes',
            },
          ],
          color: 0xf44336, // Red
          icon: '⚔️',
        };

      case FactionType.BALANCER:
        return {
          type,
          name: '⚖️ Balancer',
          description: 'Maintain ecosystem equilibrium and harmony',
          philosophy: 'True mastery lies in balance. Create a sustainable ecosystem where all can thrive.',
          bonuses: [
            {
              type: 'resource_bonus',
              value: 1.2,
              description: '+20% resource spawn rate - abundance for all',
            },
            {
              type: 'survival_bonus',
              value: 1.3,
              description: '+30% ATP from equilibrium - rewards stability',
            },
          ],
          victoryConditions: [
            {
              type: 'equilibrium',
              target: 300,
              description: 'Maintain stable populations for 300 seconds',
            },
            {
              type: 'diversity',
              target: 10,
              description: 'Achieve diversity index of 10+ (maximum variety)',
            },
          ],
          color: 0xff9800, // Orange
          icon: '⚖️',
        };

      default:
        return this.getFaction(FactionType.NATURAL_SELECTION);
    }
  }

  getAllFactions(): Faction[] {
    return [
      this.getFaction(FactionType.NATURAL_SELECTION),
      this.getFaction(FactionType.INTELLIGENT_DESIGN),
      this.getFaction(FactionType.DESTROYER),
      this.getFaction(FactionType.BALANCER),
    ];
  }

  setFaction(type: FactionType): void {
    this.currentFaction = this.getFaction(type);
  }

  getCurrentFaction(): Faction | undefined {
    return this.currentFaction;
  }

  // Apply faction bonuses to a value
  applyBonus(bonusType: string, baseValue: number): number {
    if (!this.currentFaction) return baseValue;

    const bonus = this.currentFaction.bonuses.find(b => b.type === bonusType);
    if (bonus) {
      return baseValue * bonus.value;
    }

    return baseValue;
  }

  // Update faction progress
  updateProgress(type: string, value: number): void {
    this.factionProgress.set(type, value);
  }

  // Check victory conditions
  checkVictory(): { achieved: boolean; condition?: VictoryCondition } {
    if (!this.currentFaction) {
      return { achieved: false };
    }

    for (const condition of this.currentFaction.victoryConditions) {
      const progress = this.factionProgress.get(condition.type) || 0;
      if (progress >= condition.target) {
        return { achieved: true, condition };
      }
    }

    return { achieved: false };
  }

  // Get progress toward victory conditions
  getVictoryProgress(): Array<{ condition: VictoryCondition; progress: number; percentage: number }> {
    if (!this.currentFaction) return [];

    return this.currentFaction.victoryConditions.map(condition => {
      const progress = this.factionProgress.get(condition.type) || 0;
      const percentage = Math.min(100, (progress / condition.target) * 100);
      return { condition, progress, percentage };
    });
  }

  // Reset progress
  reset(): void {
    this.factionProgress.clear();
    this.initializeFactions();
  }

  // Serialize faction state
  export(): { type: FactionType | undefined; progress: Record<string, number> } {
    return {
      type: this.currentFaction?.type,
      progress: Object.fromEntries(this.factionProgress),
    };
  }

  // Deserialize faction state
  import(data: { type?: FactionType; progress: Record<string, number> }): void {
    if (data.type) {
      this.setFaction(data.type);
    }
    this.factionProgress = new Map(Object.entries(data.progress));
  }
}
