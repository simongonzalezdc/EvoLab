// Biome generation using Perlin noise

import { PerlinNoise } from './PerlinNoise';

export enum BiomeType {
  SHALLOW_WARM = 'shallow_warm',
  SHALLOW_COLD = 'shallow_cold',
  DEEP_WARM = 'deep_warm',
  DEEP_COLD = 'deep_cold',
  TOXIC = 'toxic',
  NUTRIENT_RICH = 'nutrient_rich',
  BARREN = 'barren',
}

export interface BiomeData {
  type: BiomeType;
  temperature: number; // 0-100
  depth: number; // 0-10
  nutrients: number; // 0-10
  toxicity: number; // 0-10
  light: number; // 0-100
  pH: number; // 0-14
  pressure: number; // 0-10
  color: number; // Hex color for rendering
}

export class BiomeGenerator {
  private tempNoise: PerlinNoise;
  private depthNoise: PerlinNoise;
  private nutrientNoise: PerlinNoise;
  private toxicNoise: PerlinNoise;
  private width: number;
  private height: number;

  constructor(width: number, height: number, seed = Date.now()) {
    this.width = width;
    this.height = height;
    this.tempNoise = new PerlinNoise(seed);
    this.depthNoise = new PerlinNoise(seed + 1);
    this.nutrientNoise = new PerlinNoise(seed + 2);
    this.toxicNoise = new PerlinNoise(seed + 3);
  }

  // Get biome data at world coordinates
  getBiomeAt(x: number, y: number): BiomeData {
    // Normalize coordinates to 0-1 range
    const nx = (x + this.width / 2) / this.width;
    const ny = (y + this.height / 2) / this.height;

    // Generate noise values
    const tempValue = this.tempNoise.octaveNoise(nx * 3, ny * 3, 4, 0.5);
    const depthValue = this.depthNoise.octaveNoise(nx * 2, ny * 2, 3, 0.6);
    const nutrientValue = this.nutrientNoise.octaveNoise(nx * 4, ny * 4, 3, 0.4);
    const toxicValue = this.toxicNoise.octaveNoise(nx * 5, ny * 5, 2, 0.3);

    // Map to ranges
    const temperature = this.mapRange(tempValue, -1, 1, 5, 35); // 5-35°C
    const depth = this.mapRange(depthValue, -1, 1, 0, 10);
    const nutrients = this.mapRange(nutrientValue, -1, 1, 0, 10);
    const toxicity = Math.max(0, this.mapRange(toxicValue, -1, 1, -2, 5)); // Mostly non-toxic

    // Determine biome type
    const type = this.determineBiomeType(temperature, depth, nutrients, toxicity);

    // Calculate derived properties
    const light = this.calculateLight(depth);
    const pH = this.calculatePH(toxicity, nutrients);
    const pressure = depth;
    const color = this.getBiomeColor(type);

    return {
      type,
      temperature,
      depth,
      nutrients,
      toxicity,
      light,
      pH,
      pressure,
      color,
    };
  }

  private determineBiomeType(
    temp: number,
    depth: number,
    nutrients: number,
    toxicity: number
  ): BiomeType {
    // High toxicity = toxic biome
    if (toxicity > 4) {
      return BiomeType.TOXIC;
    }

    // High nutrients = nutrient rich
    if (nutrients > 7) {
      return BiomeType.NUTRIENT_RICH;
    }

    // Low nutrients = barren
    if (nutrients < 3) {
      return BiomeType.BARREN;
    }

    // Determine by depth and temperature
    const isShallow = depth < 5;
    const isWarm = temp > 20;

    if (isShallow && isWarm) return BiomeType.SHALLOW_WARM;
    if (isShallow && !isWarm) return BiomeType.SHALLOW_COLD;
    if (!isShallow && isWarm) return BiomeType.DEEP_WARM;
    return BiomeType.DEEP_COLD;
  }

  private calculateLight(depth: number): number {
    // Light decreases with depth
    return Math.max(0, 100 - depth * 10);
  }

  private calculatePH(toxicity: number, nutrients: number): number {
    // pH range 5-9, affected by toxicity and nutrients
    let pH = 7; // Neutral
    pH -= toxicity * 0.3; // Toxicity makes acidic
    pH += nutrients * 0.1; // Nutrients slightly alkaline
    return Math.max(5, Math.min(9, pH));
  }

  private getBiomeColor(type: BiomeType): number {
    switch (type) {
      case BiomeType.SHALLOW_WARM:
        return 0x4dd0e1; // Light cyan
      case BiomeType.SHALLOW_COLD:
        return 0x81d4fa; // Light blue
      case BiomeType.DEEP_WARM:
        return 0x0277bd; // Dark cyan
      case BiomeType.DEEP_COLD:
        return 0x01579b; // Deep blue
      case BiomeType.TOXIC:
        return 0x7b1fa2; // Purple
      case BiomeType.NUTRIENT_RICH:
        return 0x66bb6a; // Green
      case BiomeType.BARREN:
        return 0x5d4037; // Brown
      default:
        return 0x0a0e27;
    }
  }

  private mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }
}
