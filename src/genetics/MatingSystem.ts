// Sexual reproduction system with genetic crossover and mating behavior

import { Genome } from './Genome';
import { MutationEngine } from './MutationEngine';
import type { Cell } from '../entities/Cell';
import type { Traits, MatingAttempt } from '../types/entities';

export class MatingSystem {
  private mutationEngine: MutationEngine;
  private matingHistory: MatingAttempt[] = [];
  private matingDisplays: Map<string, number> = new Map(); // cellId -> display intensity

  constructor() {
    this.mutationEngine = new MutationEngine();
  }

  // Initialize gender for cells (50/50 split)
  assignGender(): 'male' | 'female' {
    return Math.random() < 0.5 ? 'male' : 'female';
  }

  // Check if two cells are compatible for mating
  checkCompatibility(cell1: Cell, cell2: Cell): number {
    // Must be opposite genders
    if (!cell1.traits.gender || !cell2.traits.gender) {
      return 0;
    }

    if (cell1.traits.gender === cell2.traits.gender) {
      return 0;
    }

    // Calculate genetic distance (lower is more compatible)
    const geneticDistance = this.calculateGeneticDistance(cell1.genome, cell2.genome);

    // Too genetically distant = incompatible (different species)
    if (geneticDistance > 0.5) {
      return 0;
    }

    // Too genetically similar = incompatible (inbreeding avoidance)
    if (geneticDistance < 0.05) {
      return 0.2;
    }

    // Calculate compatibility based on multiple factors
    let compatibility = 1.0;

    // Genetic distance factor (sweet spot is 0.1-0.3)
    if (geneticDistance >= 0.1 && geneticDistance <= 0.3) {
      compatibility *= 1.2; // Bonus for optimal genetic distance
    } else {
      compatibility *= 0.8;
    }

    // Size similarity (prefer similar sizes)
    const sizeDiff = Math.abs(cell1.traits.size - cell2.traits.size);
    compatibility *= Math.max(0.5, 1.0 - sizeDiff / 10);

    // Fertility rates
    const avgFertility = ((cell1.traits.fertilityRate || 1.0) + (cell2.traits.fertilityRate || 1.0)) / 2;
    compatibility *= avgFertility;

    // Mating display strength (males with stronger displays are more attractive)
    if (cell1.traits.gender === 'male') {
      compatibility *= 1.0 + (cell1.traits.matingDisplayStrength || 5) / 20;
    } else {
      compatibility *= 1.0 + (cell2.traits.matingDisplayStrength || 5) / 20;
    }

    // Health check (both must be healthy)
    const avgHealth = (cell1.traits.health / cell1.traits.maxHealth + cell2.traits.health / cell2.traits.maxHealth) / 2;
    if (avgHealth < 0.5) {
      compatibility *= 0.5; // Unhealthy cells less likely to mate
    }

    return Math.max(0, Math.min(1, compatibility));
  }

  // Calculate genetic distance between two genomes (0 = identical, 1 = completely different)
  calculateGeneticDistance(genome1: Genome, genome2: Genome): number {
    const traits1 = genome1.traits;
    const traits2 = genome2.traits;

    // Compare key genetic traits
    const traitKeys: (keyof Traits)[] = [
      'size', 'speed', 'maxATP', 'metabolismRate', 'armor', 'maxHealth',
      'visionRange', 'chemotaxis', 'aggression', 'intelligence', 'socialBehavior',
      'toxinStrength', 'camouflage', 'absorptionRate', 'temperatureTolerance',
      'photosynthesis', 'regeneration'
    ];

    let totalDifference = 0;
    let count = 0;

    for (const key of traitKeys) {
      const val1 = traits1[key] as number;
      const val2 = traits2[key] as number;

      if (typeof val1 === 'number' && typeof val2 === 'number') {
        // Normalize difference based on typical trait ranges
        const maxRange = this.getTraitMaxRange(key);
        const difference = Math.abs(val1 - val2) / maxRange;
        totalDifference += difference;
        count++;
      }
    }

    return count > 0 ? totalDifference / count : 0;
  }

  // Get max range for trait normalization
  private getTraitMaxRange(trait: keyof Traits): number {
    const ranges: Partial<Record<keyof Traits, number>> = {
      size: 10,
      speed: 10,
      maxATP: 200,
      metabolismRate: 2.0,
      armor: 10,
      maxHealth: 200,
      visionRange: 500,
      chemotaxis: 10,
      aggression: 10,
      intelligence: 10,
      socialBehavior: 10,
      toxinStrength: 10,
      camouflage: 10,
      absorptionRate: 2.0,
      temperatureTolerance: 10,
      photosynthesis: 1.0,
      regeneration: 5,
    };

    return ranges[trait] || 10;
  }

  // Perform sexual reproduction (genetic crossover)
  mate(mother: Cell, father: Cell): Genome | null {
    // Check compatibility
    const compatibility = this.checkCompatibility(mother, father);

    if (compatibility < 0.3) {
      return null; // Mating failed
    }

    // Random chance of success based on compatibility
    if (Math.random() > compatibility) {
      // Record failed attempt
      this.matingHistory.push({
        maleId: father.id,
        femaleId: mother.id,
        compatibilityScore: compatibility,
        success: false,
        timestamp: Date.now(),
      });
      return null;
    }

    // Perform genetic crossover
    const offspringTraits = this.crossover(mother.genome.traits, father.genome.traits);

    // Apply dominant/recessive trait rules
    this.applyDominanceRules(offspringTraits, mother.genome.traits, father.genome.traits);

    // Create new genome with both parents
    const offspringGenome = new Genome(offspringTraits, {
      generation: Math.max(mother.genome.lineage.generation, father.genome.lineage.generation) + 1,
      lineageId: `lineage-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      parentId: null,
      motherLineageId: mother.genome.lineage.lineageId,
      fatherLineageId: father.genome.lineage.lineageId,
      birthTime: Date.now(),
      mutations: [],
    });

    // Apply random mutations
    const { mutatedTraits, mutations } = this.mutationEngine.mutate(offspringTraits);
    offspringGenome.traits = mutatedTraits;
    offspringGenome.lineage.mutations = mutations;

    // Assign gender to offspring
    offspringGenome.traits.gender = this.assignGender();

    // Inherit some DNA points from parents
    offspringGenome.dnaPoints = Math.floor((mother.genome.dnaPoints + father.genome.dnaPoints) / 4);

    // Reset ATP and health
    offspringGenome.traits.atp = offspringGenome.traits.maxATP;
    offspringGenome.traits.health = offspringGenome.traits.maxHealth;

    // Record successful mating
    this.matingHistory.push({
      maleId: father.id,
      femaleId: mother.id,
      compatibilityScore: compatibility,
      success: true,
      timestamp: Date.now(),
    });

    return offspringGenome;
  }

  // Genetic crossover - mix traits from both parents
  private crossover(motherTraits: Traits, fatherTraits: Traits): Traits {
    const offspring: Traits = { ...motherTraits };

    // For each trait, randomly inherit from mother or father
    const traitKeys = Object.keys(motherTraits) as (keyof Traits)[];

    for (const key of traitKeys) {
      if (key === 'color') {
        // Blend colors
        offspring.color = this.blendColors(motherTraits.color, fatherTraits.color);
        continue;
      }

      if (key === 'gender') {
        // Skip gender, will be assigned later
        continue;
      }

      const motherVal = motherTraits[key];
      const fatherVal = fatherTraits[key];

      if (typeof motherVal === 'number' && typeof fatherVal === 'number') {
        // 50% chance to inherit from each parent, with some blending
        if (Math.random() < 0.5) {
          // Inherit from mother with slight influence from father
          offspring[key] = motherVal * 0.7 + fatherVal * 0.3;
        } else {
          // Inherit from father with slight influence from mother
          offspring[key] = fatherVal * 0.7 + motherVal * 0.3;
        }
      }
    }

    return offspring;
  }

  // Apply dominant/recessive trait rules
  private applyDominanceRules(offspring: Traits, mother: Traits, father: Traits): void {
    // Define dominant traits (always expressed if present)
    const dominantTraits: Partial<Record<keyof Traits, number>> = {
      toxinStrength: 5, // If either parent has toxin > 5, offspring likely has it
      camouflage: 5,
      photosynthesis: 0.5,
      electricShock: 3,
    };

    for (const [trait, threshold] of Object.entries(dominantTraits)) {
      const key = trait as keyof Traits;
      const motherVal = mother[key] as number;
      const fatherVal = father[key] as number;

      // If either parent exceeds threshold, offspring has higher chance of expressing it
      if (motherVal > threshold || fatherVal > threshold) {
        const maxParent = Math.max(motherVal, fatherVal);
        (offspring as unknown as Record<string, unknown>)[key] = maxParent * (0.7 + Math.random() * 0.3);
      }
    }

    // Recessive traits (only expressed if both parents have it)
    const recessiveTraits: (keyof Traits)[] = ['fearResponse', 'oxygenNeed'];

    for (const trait of recessiveTraits) {
      const motherVal = mother[trait] as number;
      const fatherVal = father[trait] as number;

      // Both parents must have the trait for it to be expressed strongly
      if (motherVal > 5 && fatherVal > 5) {
        (offspring as unknown as Record<string, unknown>)[trait] = (motherVal + fatherVal) / 2;
      } else {
        (offspring as unknown as Record<string, unknown>)[trait] = Math.min(motherVal, fatherVal);
      }
    }
  }

  // Blend two colors
  private blendColors(color1: number, color2: number): number {
    const r1 = (color1 >> 16) & 0xff;
    const g1 = (color1 >> 8) & 0xff;
    const b1 = color1 & 0xff;

    const r2 = (color2 >> 16) & 0xff;
    const g2 = (color2 >> 8) & 0xff;
    const b2 = color2 & 0xff;

    const r = Math.floor((r1 + r2) / 2);
    const g = Math.floor((g1 + g2) / 2);
    const b = Math.floor((b1 + b2) / 2);

    return (r << 16) | (g << 8) | b;
  }

  // Trigger mating display (visual/behavioral)
  performMatingDisplay(cell: Cell): void {
    if (cell.traits.gender === 'male') {
      const displayStrength = cell.traits.matingDisplayStrength || 5;
      this.matingDisplays.set(cell.id, displayStrength);

      // Display lasts for a short time
      setTimeout(() => {
        this.matingDisplays.delete(cell.id);
      }, 3000);
    }
  }

  // Get mating display strength for a cell
  getDisplayStrength(cellId: string): number {
    return this.matingDisplays.get(cellId) || 0;
  }

  // Find potential mates near a cell
  findPotentialMates(cell: Cell, nearbyCells: Cell[], maxDistance: number = 200): Cell[] {
    if (!cell.traits.gender) {
      return [];
    }

    return nearbyCells.filter((otherCell) => {
      if (otherCell.id === cell.id) return false;
      if (!otherCell.traits.gender) return false;
      if (otherCell.traits.gender === cell.traits.gender) return false;

      // Check distance
      const distance = cell.distanceTo(otherCell.position);
      if (distance > maxDistance) return false;

      // Check compatibility
      const compatibility = this.checkCompatibility(cell, otherCell);
      return compatibility >= 0.3;
    });
  }

  // Get mating history
  getMatingHistory(): MatingAttempt[] {
    return [...this.matingHistory];
  }

  // Clear old mating history (keep last 1000 entries)
  clearOldHistory(): void {
    if (this.matingHistory.length > 1000) {
      this.matingHistory = this.matingHistory.slice(-1000);
    }
  }
}
