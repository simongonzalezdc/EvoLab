// Genome data structure for storing all genetic traits

import type { Traits, LineageInfo, CompoundStorage } from '../types/entities';
import { TraitSynergies } from './TraitSynergies';

export class Genome {
  public traits: Traits;
  public lineage: LineageInfo;
  public compounds: CompoundStorage;
  public dnaPoints = 0;
  public survivalTime = 0;

  constructor(traits: Traits, lineage: LineageInfo) {
    this.traits = traits;
    this.lineage = lineage;
    this.compounds = {
      glucose: 0,
      aminoAcids: 0,
      phosphates: 0,
    };
  }

  // Create a default genome for starting cells
  static createDefault(): Genome {
    const defaultTraits: Traits = {
      // Energy & Metabolism
      atp: 100,
      maxATP: 100,
      metabolismRate: 1.0,
      energyEfficiency: 1.0,
      photosynthesis: 0,

      // Physical Stats
      size: 5,
      speed: 5,
      maxSpeed: 10,
      armor: 2,
      health: 100,
      maxHealth: 100,
      regeneration: 1,

      // Senses & Detection
      visionRange: 150,
      chemotaxis: 3,
      hearing: 3,
      magnetoreception: 2,

      // Behavioral/Mental
      aggression: 3,
      intelligence: 4,
      socialBehavior: 3,
      fearResponse: 5,
      learningRate: 0.5,

      // Special Abilities
      toxinStrength: 0,
      speedBurstPower: 2,
      camouflage: 0,
      electricShock: 0,

      // Resource Collection
      absorptionRate: 1.0,
      digestionEfficiency: 1.0,
      maxStorage: 100,
      scavengerBonus: 1.0,

      // Environmental Adaptation
      temperatureTolerance: 5,
      pressureResistance: 3,
      toxinResistance: 2,
      pHTolerance: 5,
      oxygenNeed: 5,

      // Visual
      color: 0x4caf50, // Green

      // Reproduction (initialized but can be set later)
      gender: undefined,
      fertilityRate: 0.8,
      matingDisplayStrength: 5,
    };

    const lineage: LineageInfo = {
      generation: 1,
      lineageId: 'lineage-' + Date.now(),
      parentId: null,
      birthTime: Date.now(),
      mutations: [],
      motherLineageId: undefined,
      fatherLineageId: undefined,
      speciesId: 'species-001', // Start with base species
    };

    return new Genome(defaultTraits, lineage);
  }

  // Get effective traits with synergy bonuses applied (Week 4)
  getEffectiveTraits(): Traits {
    return TraitSynergies.applySynergies(this.traits);
  }

  // Get active synergy names for display (Week 4)
  getActiveSynergies(): string[] {
    return TraitSynergies.getSynergyNames(this.traits);
  }

  // Clone genome with optional mutations
  clone(mutations: string[] = []): Genome {
    const clonedTraits = { ...this.traits };
    const clonedLineage: LineageInfo = {
      generation: this.lineage.generation + 1,
      lineageId: this.lineage.lineageId,
      parentId: `gen-${this.lineage.generation}`,
      birthTime: Date.now(),
      mutations: [...mutations],
    };

    const cloned = new Genome(clonedTraits, clonedLineage);
    cloned.dnaPoints = this.dnaPoints;
    return cloned;
  }

  // Export genome to JSON
  toJSON(): Record<string, unknown> {
    return {
      traits: this.traits,
      lineage: this.lineage,
      compounds: this.compounds,
      dnaPoints: this.dnaPoints,
      survivalTime: this.survivalTime,
    };
  }

  // Import genome from JSON
  static fromJSON(data: Record<string, unknown>): Genome {
    const genome = new Genome(data.traits as Traits, data.lineage as LineageInfo);
    genome.compounds = data.compounds as CompoundStorage;
    genome.dnaPoints = (data.dnaPoints as number) || 0;
    genome.survivalTime = (data.survivalTime as number) || 0;
    return genome;
  }
}
