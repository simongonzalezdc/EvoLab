// Selection pressure and environmental fitness calculation

import type { Traits } from '../types/entities';

export interface EnvironmentConditions {
  temperature: number; // 5-80°C
  light: number; // 0-100%
  nutrients: number; // 0-10
  pressure: number; // 0-10 (depth)
  toxicity: number; // 0-10
  pH: number; // 0-14
}

export class SelectionPressure {
  // Calculate fitness score based on environment
  calculateFitness(traits: Traits, environment: EnvironmentConditions): number {
    let fitness = 1.0; // Base fitness

    // Temperature fitness
    const tempDiff = Math.abs(environment.temperature - 20) / 10; // Optimal at 20°C
    const tempFitness = 1 - Math.min(tempDiff / traits.temperatureTolerance, 1);
    fitness *= tempFitness;

    // Light fitness (affects photosynthesis)
    if (traits.photosynthesis > 0) {
      const lightFitness = (environment.light / 100) * traits.photosynthesis;
      fitness *= 1 + lightFitness * 0.2; // Up to 20% bonus
    }

    // Pressure fitness (depth tolerance)
    const pressureDiff = Math.abs(environment.pressure - 5) / 5; // Optimal at mid-depth
    const pressureFitness = 1 - Math.min(pressureDiff / traits.pressureResistance, 1);
    fitness *= pressureFitness;

    // Toxicity fitness
    if (environment.toxicity > 0) {
      const toxicityFitness = 1 - (environment.toxicity / 10) * (1 - traits.toxinResistance / 10);
      fitness *= toxicityFitness;
    }

    // pH fitness
    const pHDiff = Math.abs(environment.pH - 7) / 7; // Optimal at neutral pH
    const pHFitness = 1 - Math.min(pHDiff / traits.pHTolerance, 1);
    fitness *= pHFitness;

    // Nutrient fitness (affects resource availability)
    const nutrientBonus = (environment.nutrients / 10) * 0.1; // Up to 10% bonus
    fitness *= 1 + nutrientBonus;

    // Clamp fitness to 0-1 range
    return Math.max(0, Math.min(fitness, 1));
  }

  // Get default environment (neutral/balanced)
  static getDefaultEnvironment(): EnvironmentConditions {
    return {
      temperature: 20,
      light: 70,
      nutrients: 5,
      pressure: 3,
      toxicity: 0,
      pH: 7,
    };
  }

  // Calculate survival probability based on fitness
  getSurvivalProbability(fitness: number): number {
    // Fitness of 1.0 = 100% survival, 0.0 = 0% survival
    return fitness;
  }

  // Determine if entity survives based on fitness
  shouldSurvive(fitness: number): boolean {
    return Math.random() < this.getSurvivalProbability(fitness);
  }
}
