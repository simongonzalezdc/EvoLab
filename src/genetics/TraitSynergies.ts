// Trait synergy system - bonuses for specific trait combinations
import type { Traits } from '../types/entities';

export interface Synergy {
  name: string;
  description: string;
  conditions: (traits: Traits) => boolean;
  bonuses: Partial<Traits>;
  icon: string;
}

export class TraitSynergies {
  private static readonly SYNERGIES: Synergy[] = [
    // Speed + Vision = Hunter
    {
      name: 'Hunter',
      description: 'High speed + vision gives bonus aggression',
      conditions: (t) => t.speed > 7 && t.visionRange > 600,
      bonuses: { aggression: 2 },
      icon: '🎯',
    },

    // Armor + Size = Tank
    {
      name: 'Tank',
      description: 'High armor + size gives bonus health',
      conditions: (t) => t.armor > 7 && t.size > 12,
      bonuses: { maxHealth: 20 },
      icon: '🛡️',
    },

    // Speed + Metabolism = Sprinter
    {
      name: 'Sprinter',
      description: 'High speed + metabolism gives better ATP efficiency',
      conditions: (t) => t.speed > 8 && t.metabolismRate < 0.8,
      bonuses: { maxATP: 20 },
      icon: '⚡',
    },

    // Photosynthesis + Size = Solar Giant
    {
      name: 'Solar Giant',
      description: 'High photosynthesis + size creates self-sustaining organism',
      conditions: (t) => t.photosynthesis > 5 && t.size > 10,
      bonuses: { metabolismRate: -0.2 }, // 20% less ATP drain
      icon: '🌞',
    },

    // Camouflage + Speed = Ninja
    {
      name: 'Ninja',
      description: 'High camouflage + speed makes you nearly invisible',
      conditions: (t) => t.camouflage > 7 && t.speed > 6,
      bonuses: { visionRange: 100 }, // Harder to detect = bonus vision
      icon: '🥷',
    },

    // Fertility + Metabolism = Breeder
    {
      name: 'Breeder',
      description: 'High fertility + low metabolism enables rapid population growth',
      conditions: (t) => (t.fertilityRate || 0) > 0.8 && t.metabolismRate < 0.9,
      bonuses: { maxHealth: 10 },
      icon: '🐰',
    },

    // Armor + Camouflage = Fortress
    {
      name: 'Fortress',
      description: 'High armor + camouflage = impenetrable defense',
      conditions: (t) => t.armor > 6 && t.camouflage > 6,
      bonuses: { maxHealth: 15, size: 1 },
      icon: '🏰',
    },

    // Vision + Camouflage = Scout
    {
      name: 'Scout',
      description: 'High vision + camouflage = perfect reconnaissance',
      conditions: (t) => t.visionRange > 700 && t.camouflage > 5,
      bonuses: { speed: 1, maxATP: 10 },
      icon: '👁️',
    },

    // Aggression + Speed = Berserker
    {
      name: 'Berserker',
      description: 'High aggression + speed = devastating hit-and-run',
      conditions: (t) => t.aggression > 8 && t.speed > 7,
      bonuses: { armor: 1, maxHealth: 10 },
      icon: '⚔️',
    },

    // Low Metabolism + Low Speed = Survivor
    {
      name: 'Survivor',
      description: 'Low metabolism + low speed = extreme endurance',
      conditions: (t) => t.metabolismRate < 0.7 && t.speed < 4,
      bonuses: { maxATP: 30, maxHealth: 15 },
      icon: '🐢',
    },

    // Photosynthesis + Low Metabolism = Plant
    {
      name: 'Plant Form',
      description: 'High photosynthesis + very low metabolism = plant-like',
      conditions: (t) => t.photosynthesis > 7 && t.metabolismRate < 0.6,
      bonuses: { maxHealth: 25, armor: 2 },
      icon: '🌱',
    },

    // High Vision + Low Aggression = Observer
    {
      name: 'Observer',
      description: 'High vision + low aggression = peaceful watcher',
      conditions: (t) => t.visionRange > 800 && t.aggression < 3,
      bonuses: { camouflage: 2, maxATP: 15 },
      icon: '👀',
    },
  ];

  // Calculate all active synergies for a trait set
  static calculateSynergies(traits: Traits): Synergy[] {
    return this.SYNERGIES.filter(synergy => synergy.conditions(traits));
  }

  // Apply synergy bonuses to traits
  static applySynergies(traits: Traits): Traits {
    const activeSynergies = this.calculateSynergies(traits);
    let modifiedTraits = { ...traits };

    // Apply each synergy's bonuses
    activeSynergies.forEach(synergy => {
      Object.entries(synergy.bonuses).forEach(([key, bonus]) => {
        const traitKey = key as keyof Traits;
        const currentValue = modifiedTraits[traitKey];

        // Only apply to numeric traits
        if (typeof currentValue === 'number' && typeof bonus === 'number') {
          // Type-safe assignment using Record helper
          (modifiedTraits as Record<string, unknown>)[traitKey] = currentValue + bonus;
        }
      });
    });

    return modifiedTraits;
  }

  // Get synergy names for display
  static getSynergyNames(traits: Traits): string[] {
    return this.calculateSynergies(traits).map(s => `${s.icon} ${s.name}`);
  }

  // Get synergy descriptions
  static getSynergyDescriptions(traits: Traits): string[] {
    return this.calculateSynergies(traits).map(s => `${s.icon} ${s.name}: ${s.description}`);
  }

  // Check if a specific synergy is active
  static hasSynergy(traits: Traits, synergyName: string): boolean {
    return this.calculateSynergies(traits).some(s => s.name === synergyName);
  }

  // Get total bonus from synergies for a specific trait
  static getSynergyBonus(traits: Traits, traitKey: keyof Traits): number {
    const activeSynergies = this.calculateSynergies(traits);
    let totalBonus = 0;

    activeSynergies.forEach(synergy => {
      const bonus = synergy.bonuses[traitKey];
      if (typeof bonus === 'number') {
        totalBonus += bonus;
      }
    });

    return totalBonus;
  }

  // Get count of active synergies
  static getSynergyCount(traits: Traits): number {
    return this.calculateSynergies(traits).length;
  }
}
