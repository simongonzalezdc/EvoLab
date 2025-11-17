// Trait system with interconnections and constraints

import type { Traits } from '../types/entities';

export class TraitSystem {
  // Apply trait interconnections (size affects speed, armor, etc.)
  static applyInterconnections(traits: Traits): Traits {
    const modified = { ...traits };

    // Size affects multiple stats
    if (modified.size > 5) {
      modified.speed *= 0.7; // Bigger = slower
      modified.maxHealth *= 1.5; // Bigger = more HP
      modified.energyEfficiency *= 1.3; // Bigger = more food needed
      modified.visionRange *= 1.2; // Bigger = see farther
    } else if (modified.size < 5) {
      modified.speed *= 1.2; // Smaller = faster
      modified.maxHealth *= 0.8; // Smaller = less HP
      modified.energyEfficiency *= 0.8; // Smaller = less food needed
    }

    // Armor reduces speed
    modified.speed *= 1 - modified.armor * 0.05; // Each armor point = -5% speed

    // Intelligence improves all senses
    modified.visionRange *= 1 + modified.intelligence * 0.05;
    modified.chemotaxis *= 1 + modified.intelligence * 0.05;
    modified.hearing *= 1 + modified.intelligence * 0.05;

    // Special abilities drain ATP
    if (modified.toxinStrength > 0) {
      modified.energyEfficiency *= 1 + modified.toxinStrength * 0.05;
    }
    if (modified.camouflage > 0) {
      modified.energyEfficiency *= 1 + modified.camouflage * 0.03;
    }
    if (modified.electricShock > 0) {
      modified.energyEfficiency *= 1 + modified.electricShock * 0.08;
    }

    // Photosynthesis reduces food need
    if (modified.photosynthesis > 0) {
      modified.energyEfficiency *= 1 - modified.photosynthesis * 0.2;
    }

    // Clamp all values to valid ranges
    return this.clampTraits(modified);
  }

  // Clamp all trait values to their valid ranges
  static clampTraits(traits: Traits): Traits {
    return {
      // Energy & Metabolism
      atp: this.clamp(traits.atp, 0, traits.maxATP),
      maxATP: this.clamp(traits.maxATP, 50, 200),
      metabolismRate: this.clamp(traits.metabolismRate, 0.5, 2.0),
      energyEfficiency: this.clamp(traits.energyEfficiency, 0.5, 1.5),
      photosynthesis: this.clamp(traits.photosynthesis, 0, 1.0),

      // Physical Stats
      size: this.clamp(traits.size, 1, 10),
      speed: this.clamp(traits.speed, 1, 10),
      maxSpeed: this.clamp(traits.maxSpeed, 3, 15),
      armor: this.clamp(traits.armor, 0, 10),
      health: this.clamp(traits.health, 0, traits.maxHealth),
      maxHealth: this.clamp(traits.maxHealth, 50, 200),
      regeneration: this.clamp(traits.regeneration, 0, 5),

      // Senses & Detection
      visionRange: this.clamp(traits.visionRange, 50, 500),
      chemotaxis: this.clamp(traits.chemotaxis, 0, 10),
      hearing: this.clamp(traits.hearing, 0, 10),
      magnetoreception: this.clamp(traits.magnetoreception, 0, 10),

      // Behavioral/Mental
      aggression: this.clamp(traits.aggression, 0, 10),
      intelligence: this.clamp(traits.intelligence, 0, 10),
      socialBehavior: this.clamp(traits.socialBehavior, 0, 10),
      fearResponse: this.clamp(traits.fearResponse, 0, 10),
      learningRate: this.clamp(traits.learningRate, 0, 1.0),

      // Special Abilities
      toxinStrength: this.clamp(traits.toxinStrength, 0, 10),
      speedBurstPower: this.clamp(traits.speedBurstPower, 0, 10),
      camouflage: this.clamp(traits.camouflage, 0, 10),
      electricShock: this.clamp(traits.electricShock, 0, 10),

      // Resource Collection
      absorptionRate: this.clamp(traits.absorptionRate, 0.5, 2.0),
      digestionEfficiency: this.clamp(traits.digestionEfficiency, 0.5, 2.0),
      maxStorage: this.clamp(traits.maxStorage, 50, 500),
      scavengerBonus: this.clamp(traits.scavengerBonus, 0, 2.0),

      // Environmental Adaptation
      temperatureTolerance: this.clamp(traits.temperatureTolerance, 0, 10),
      pressureResistance: this.clamp(traits.pressureResistance, 0, 10),
      toxinResistance: this.clamp(traits.toxinResistance, 0, 10),
      pHTolerance: this.clamp(traits.pHTolerance, 0, 10),
      oxygenNeed: this.clamp(traits.oxygenNeed, 0, 10),

      // Visual
      color: traits.color,
    };
  }

  private static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  // Calculate DNA points earned based on survival
  static calculateDNAPoints(survivalTime: number, resourcesCollected: number): number {
    return survivalTime * 0.1 + resourcesCollected * 0.05;
  }

  // Check if trait modification is within budget
  static canAffordModification(currentDNA: number, cost: number): boolean {
    return currentDNA >= cost;
  }

  // Calculate metabolic cost based on traits
  static calculateMetabolicCost(traits: Traits): number {
    let cost = 0;

    // Base cost from size
    cost += traits.size * 2;

    // Special abilities increase cost
    cost += traits.toxinStrength * 3;
    cost += traits.camouflage * 2;
    cost += traits.electricShock * 4;
    cost += traits.speedBurstPower * 1.5;

    // Armor increases cost
    cost += traits.armor * 1.5;

    // Photosynthesis reduces cost
    cost -= traits.photosynthesis * 5;

    // Ensure minimum cost
    return Math.max(1, cost);
  }

  // Calculate overall fitness score
  static calculateFitness(traits: Traits): number {
    let fitness = 0;

    // Survival traits
    fitness += traits.health / 10;
    fitness += traits.atp / 10;
    fitness += traits.armor * 2;
    fitness += traits.regeneration * 3;

    // Combat traits
    fitness += traits.aggression;
    fitness += traits.size;

    // Sensory traits
    fitness += traits.visionRange / 50;
    fitness += traits.chemotaxis * 2;
    fitness += traits.hearing * 2;

    // Resource gathering
    fitness += traits.absorptionRate * 5;
    fitness += traits.digestionEfficiency * 5;

    // Special abilities
    fitness += traits.toxinStrength * 2;
    fitness += traits.speedBurstPower * 2;
    fitness += traits.camouflage * 2;
    fitness += traits.electricShock * 2;

    // Environmental adaptation
    fitness += traits.temperatureTolerance;
    fitness += traits.toxinResistance;
    fitness += traits.pressureResistance;

    return Math.max(0, fitness);
  }

  // Calculate combat strength
  static calculateCombatStrength(traits: Traits): number {
    let strength = 0;

    // Base strength from size and aggression
    strength += traits.size * 3;
    strength += traits.aggression * 2;

    // Physical attributes
    strength += traits.armor * 2;
    strength += traits.health / 20;

    // Special combat abilities
    strength += traits.toxinStrength * 4;
    strength += traits.electricShock * 4;
    strength += traits.speedBurstPower * 1.5;

    // Intelligence provides tactical advantage
    strength += traits.intelligence * 1.5;

    return Math.max(1, strength);
  }
}
