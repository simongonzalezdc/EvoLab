// Ecosystem Regulator - Self-regulating feedback loops
// Implements Gaia-style ecosystem balance (SimEarth inspiration)

import type { Cell } from '../entities/Cell';
import type { Resource } from '../entities/Resource';

export interface EcosystemStats {
  herbivorePopulation: number;
  carnivorePopulation: number;
  omnivorePopulation: number;
  totalPopulation: number;
  resourceCount: number;
  biomass: number;
  carryingCapacity: number;
  equilibrium: number; // 0-1, where 1 is perfect balance
}

export interface FeedbackLoop {
  type: 'negative' | 'positive';
  strength: number; // 0-1
  description: string;
}

export class EcosystemRegulator {
  private herbivoreHistory: number[] = [];
  private carnivoreHistory: number[] = [];
  private resourceHistory: number[] = [];
  private historyLength = 20; // Track last 20 snapshots
  private baseCarryingCapacity = 50;
  private equilibriumTime = 0;
  private lastEquilibriumCheck = 0;

  // Calculate current ecosystem stats
  calculateStats(allCells: Cell[], resources: Resource[]): EcosystemStats {
    let herbivores = 0;
    let carnivores = 0;
    let omnivores = 0;
    let totalBiomass = 0;

    for (const cell of allCells) {
      const aggression = cell.traits.aggression || 5;
      if (aggression < 4) herbivores++;
      else if (aggression > 7) carnivores++;
      else omnivores++;

      totalBiomass += cell.traits.size * cell.traits.size; // Biomass scales with size²
    }

    const totalPop = allCells.length;
    const carryingCapacity = this.calculateCarryingCapacity(resources.length, totalBiomass);
    const equilibrium = this.calculateEquilibrium(herbivores, carnivores, omnivores, resources.length);

    return {
      herbivorePopulation: herbivores,
      carnivorePopulation: carnivores,
      omnivorePopulation: omnivores,
      totalPopulation: totalPop,
      resourceCount: resources.length,
      biomass: totalBiomass,
      carryingCapacity,
      equilibrium,
    };
  }

  // Calculate carrying capacity based on available resources
  private calculateCarryingCapacity(resourceCount: number, currentBiomass: number): number {
    // Carrying capacity increases with resources but decreases with biomass
    const resourceFactor = resourceCount / 40; // Assuming 40 is baseline
    const biomassFactor = Math.max(0.5, 1 - (currentBiomass / 5000)); // Penalty at high biomass

    return Math.floor(this.baseCarryingCapacity * resourceFactor * biomassFactor);
  }

  // Calculate ecosystem equilibrium (0-1)
  private calculateEquilibrium(herbivores: number, carnivores: number, omnivores: number, resources: number): number {
    // Ideal ratios (based on energy pyramid)
    const idealHerbivoreRatio = 0.5; // 50% herbivores
    const idealCarnivoreRatio = 0.2; // 20% carnivores
    const idealOmnivoreRatio = 0.3; // 30% omnivores

    const total = herbivores + carnivores + omnivores;
    if (total === 0) return 0;

    const herbivoreRatio = herbivores / total;
    const carnivoreRatio = carnivores / total;
    const omnivoreRatio = omnivores / total;

    // Calculate deviation from ideal
    const herbivoreDeviation = Math.abs(herbivoreRatio - idealHerbivoreRatio);
    const carnivoreDeviation = Math.abs(carnivoreRatio - idealCarnivoreRatio);
    const omnivoreDeviation = Math.abs(omnivoreRatio - idealOmnivoreRatio);

    const totalDeviation = herbivoreDeviation + carnivoreDeviation + omnivoreDeviation;
    const balance = Math.max(0, 1 - totalDeviation);

    // Factor in resource availability
    const resourceBalance = Math.min(1, resources / (total * 1.5)); // 1.5 resources per organism is ideal

    return (balance * 0.7 + resourceBalance * 0.3); // Weighted average
  }

  // Update ecosystem history
  update(stats: EcosystemStats, deltaTime: number): void {
    // Track population history
    this.herbivoreHistory.push(stats.herbivorePopulation);
    this.carnivoreHistory.push(stats.carnivorePopulation);
    this.resourceHistory.push(stats.resourceCount);

    // Keep history to fixed length
    if (this.herbivoreHistory.length > this.historyLength) {
      this.herbivoreHistory.shift();
    }
    if (this.carnivoreHistory.length > this.historyLength) {
      this.carnivoreHistory.shift();
    }
    if (this.resourceHistory.length > this.historyLength) {
      this.resourceHistory.shift();
    }

    // Track equilibrium time
    this.lastEquilibriumCheck += deltaTime;
    if (this.lastEquilibriumCheck >= 1) {
      // Check every second
      if (stats.equilibrium > 0.7) {
        this.equilibriumTime += this.lastEquilibriumCheck;
      } else {
        this.equilibriumTime = 0; // Reset if equilibrium breaks
      }
      this.lastEquilibriumCheck = 0;
    }
  }

  // Get active feedback loops
  getFeedbackLoops(stats: EcosystemStats): FeedbackLoop[] {
    const loops: FeedbackLoop[] = [];

    // Negative Feedback: Overpopulation → Resource Depletion → Die-off
    if (stats.totalPopulation > stats.carryingCapacity) {
      const overpopulation = (stats.totalPopulation - stats.carryingCapacity) / stats.carryingCapacity;
      loops.push({
        type: 'negative',
        strength: Math.min(1, overpopulation),
        description: 'Overpopulation causing resource scarcity',
      });
    }

    // Negative Feedback: Too many predators → Prey depletion → Predator starvation
    const predatorPreyRatio = stats.herbivorePopulation > 0 ? stats.carnivorePopulation / stats.herbivorePopulation : 999;
    if (predatorPreyRatio > 0.5) {
      // More than 1 predator per 2 prey
      loops.push({
        type: 'negative',
        strength: Math.min(1, predatorPreyRatio - 0.5),
        description: 'Predator overpopulation depleting prey',
      });
    }

    // Positive Feedback: More plants → More O2 → More animals → More CO2 → More plants
    // (This would need atmospheric system integration)
    if (stats.resourceCount > 50 && stats.herbivorePopulation > 0) {
      loops.push({
        type: 'positive',
        strength: 0.3,
        description: 'Abundant resources supporting population growth',
      });
    }

    // Negative Feedback: Low resources → Slow growth
    if (stats.resourceCount < 20) {
      loops.push({
        type: 'negative',
        strength: Math.max(0, (20 - stats.resourceCount) / 20),
        description: 'Resource scarcity limiting growth',
      });
    }

    // Positive Feedback: Balanced ecosystem → Higher survival rates
    if (stats.equilibrium > 0.7) {
      loops.push({
        type: 'positive',
        strength: stats.equilibrium,
        description: 'Ecosystem balance increasing stability',
      });
    }

    return loops;
  }

  // Calculate spawn rate modifier based on feedback loops
  getSpawnRateModifier(stats: EcosystemStats): number {
    let modifier = 1.0;

    // Apply negative feedback for overpopulation
    if (stats.totalPopulation > stats.carryingCapacity) {
      const penalty = (stats.totalPopulation - stats.carryingCapacity) / stats.carryingCapacity;
      modifier *= Math.max(0.2, 1 - penalty); // Reduce spawn rate, minimum 20%
    }

    // Apply negative feedback for resource scarcity
    if (stats.resourceCount < stats.totalPopulation * 1.5) {
      const scarcity = 1 - (stats.resourceCount / (stats.totalPopulation * 1.5));
      modifier *= Math.max(0.3, 1 - scarcity * 0.5);
    }

    // Apply positive feedback for equilibrium
    if (stats.equilibrium > 0.7) {
      modifier *= 1 + (stats.equilibrium - 0.7) * 0.5; // Up to +15% at perfect equilibrium
    }

    return modifier;
  }

  // Detect predator-prey oscillations (Lotka-Volterra dynamics)
  detectOscillations(): { oscillating: boolean; period: number; amplitude: number } {
    if (this.herbivoreHistory.length < this.historyLength) {
      return { oscillating: false, period: 0, amplitude: 0 };
    }

    // Simple peak detection
    let herbPeaks = 0;
    let carnPeaks = 0;

    for (let i = 1; i < this.herbivoreHistory.length - 1; i++) {
      const herbCurrent = this.herbivoreHistory[i];
      const herbPrev = this.herbivoreHistory[i - 1];
      const herbNext = this.herbivoreHistory[i + 1];
      const carnCurrent = this.carnivoreHistory[i];
      const carnPrev = this.carnivoreHistory[i - 1];
      const carnNext = this.carnivoreHistory[i + 1];

      if (herbCurrent !== undefined && herbPrev !== undefined && herbNext !== undefined &&
          herbCurrent > herbPrev && herbCurrent > herbNext) {
        herbPeaks++;
      }
      if (carnCurrent !== undefined && carnPrev !== undefined && carnNext !== undefined &&
          carnCurrent > carnPrev && carnCurrent > carnNext) {
        carnPeaks++;
      }
    }

    // If we detect at least 2 peaks in both, we have oscillations
    const oscillating = herbPeaks >= 2 && carnPeaks >= 2;

    // Calculate amplitude (difference between max and min)
    const herbAmp = Math.max(...this.herbivoreHistory) - Math.min(...this.herbivoreHistory);
    const carnAmp = Math.max(...this.carnivoreHistory) - Math.min(...this.carnivoreHistory);
    const amplitude = (herbAmp + carnAmp) / 2;

    // Estimate period (time between peaks)
    const period = oscillating ? this.historyLength / Math.max(herbPeaks, carnPeaks) : 0;

    return { oscillating, period, amplitude };
  }

  // Get population pressure (affects mutation rates, aggression)
  getPopulationPressure(stats: EcosystemStats): number {
    // Pressure increases as population approaches carrying capacity
    if (stats.totalPopulation >= stats.carryingCapacity) {
      return 1.0; // Maximum pressure
    }

    return stats.totalPopulation / stats.carryingCapacity;
  }

  // Calculate ideal population adjustments for balance
  getPopulationAdjustments(stats: EcosystemStats): {
    herbivoreTarget: number;
    carnivoreTarget: number;
    omnivoreTarget: number;
  } {
    const total = stats.totalPopulation;

    return {
      herbivoreTarget: Math.round(total * 0.5), // 50%
      carnivoreTarget: Math.round(total * 0.2), // 20%
      omnivoreTarget: Math.round(total * 0.3), // 30%
    };
  }

  // Get equilibrium time (for Balancer faction)
  getEquilibriumTime(): number {
    return this.equilibriumTime;
  }

  // Reset tracker
  reset(): void {
    this.herbivoreHistory = [];
    this.carnivoreHistory = [];
    this.resourceHistory = [];
    this.equilibriumTime = 0;
    this.lastEquilibriumCheck = 0;
  }
}
