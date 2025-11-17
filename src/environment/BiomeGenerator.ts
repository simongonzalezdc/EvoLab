// Biome generation using Perlin noise

import { PerlinNoise } from './PerlinNoise';
import { getBiomeColorFromAttributes } from './BiomeColor';
import { Config } from '../core/Config';
import { logger } from '../utils/Logger';

export enum BiomeType {
  SHALLOW_WARM = 'shallow_warm',
  SHALLOW_COLD = 'shallow_cold',
  DEEP_WARM = 'deep_warm',
  DEEP_COLD = 'deep_cold',
  TOXIC = 'toxic',
  NUTRIENT_RICH = 'nutrient_rich',
  BARREN = 'barren',
  VOLCANIC = 'volcanic',
  FROZEN = 'frozen',
  SWAMP = 'swamp',
  CRYSTAL = 'crystal',
  ABYSS = 'abyss',
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
  hazards: BiomeHazard[];
}

export interface BiomeHazard {
  type: 'current' | 'temperature' | 'oxygen' | 'radiation' | 'pressure';
  intensity: number; // 0-1
  direction?: { x: number; y: number }; // For currents
}

export class BiomeGenerator {
  private tempNoise: PerlinNoise;
  private depthNoise: PerlinNoise;
  private nutrientNoise: PerlinNoise;
  private toxicNoise: PerlinNoise;
  private currentNoise: PerlinNoise;
  private width: number;
  private height: number;

  constructor(width: number, height: number, seed = Date.now()) {
    this.width = width;
    this.height = height;
    this.tempNoise = new PerlinNoise(seed);
    this.depthNoise = new PerlinNoise(seed + 1);
    this.nutrientNoise = new PerlinNoise(seed + 2);
    this.toxicNoise = new PerlinNoise(seed + 3);
    this.currentNoise = new PerlinNoise(seed + 4);
  }

  // Get biome data at world coordinates
  getBiomeAt(x: number, y: number): BiomeData {
    // Normalize coordinates to 0-1 range
    const nx = (x + this.width / 2) / this.width;
    const ny = (y + this.height / 2) / this.height;

    // Generate noise values with smoother transitions
    const smoothness = Config.BIOME_TRANSITION_SMOOTHNESS;
    const tempValue = this.tempNoise.octaveNoise(nx * 3 * (1 - smoothness), ny * 3 * (1 - smoothness), 4, 0.5);
    const depthValue = this.depthNoise.octaveNoise(nx * 2 * (1 - smoothness), ny * 2 * (1 - smoothness), 3, 0.6);
    const nutrientValue = this.nutrientNoise.octaveNoise(nx * 4 * (1 - smoothness), ny * 4 * (1 - smoothness), 3, 0.4);
    const toxicValue = this.toxicNoise.octaveNoise(nx * 5 * (1 - smoothness), ny * 5 * (1 - smoothness), 2, 0.3);

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
    
    // Use semantic color system
    const normalizedTemp = (temperature - 5) / 30; // 5-35°C -> 0-1
    const normalizedDepth = depth / 10; // 0-10 -> 0-1
    const normalizedNutrients = nutrients / 10; // 0-10 -> 0-1
    
    // Determine hazard type
    let hazardType: 'toxic' | 'volcanic' | 'frozen' | 'pressure' | 'none' = 'none';
    if (type === BiomeType.VOLCANIC) hazardType = 'volcanic';
    else if (type === BiomeType.FROZEN) hazardType = 'frozen';
    else if (type === BiomeType.TOXIC || type === BiomeType.SWAMP) hazardType = 'toxic';
    else if (depth > 7) hazardType = 'pressure';
    
    const color = getBiomeColorFromAttributes(normalizedTemp, normalizedDepth, hazardType, normalizedNutrients);
    const hazards = this.calculateHazards(type, temperature, depth, nx, ny);

    // Debug logging
    if (Config.DEBUG_AUTO_PILOT) {
      logger.log(`[BiomeGenerator] Biome at (${x},${y}): ${type}, temp=${temperature.toFixed(1)}, depth=${depth.toFixed(1)}, color=0x${color.toString(16).padStart(6, '0')}`);
    }

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
      hazards,
    };
  }

  private determineBiomeType(
    temp: number,
    depth: number,
    nutrients: number,
    toxicity: number
  ): BiomeType {
    // Very deep = abyss
    if (depth > 8) {
      return BiomeType.ABYSS;
    }

    // Very hot = volcanic
    if (temp > 32) {
      return BiomeType.VOLCANIC;
    }

    // Very cold and shallow = frozen
    if (temp < 8 && depth < 4) {
      return BiomeType.FROZEN;
    }

    // High toxicity = toxic biome (SWAMP is now a variant of TOXIC)
    if (toxicity > 4) {
      // Check if it's a swamp variant (high nutrients + high toxicity)
      if (nutrients > 6 && toxicity > 3 && Math.random() < Config.RARE_BIOME_WEIGHT) {
        return BiomeType.SWAMP; // Rare variant
      }
      return BiomeType.TOXIC;
    }

    // High nutrients = nutrient rich (CRYSTAL is now a variant of NUTRIENT_RICH)
    if (nutrients > 7) {
      // Check if it's a crystal variant (moderate temp, low toxicity, moderate depth)
      if (temp > 18 && temp < 24 && toxicity < 2 && depth > 4 && depth < 7 && Math.random() < Config.RARE_BIOME_WEIGHT) {
        return BiomeType.CRYSTAL; // Rare variant
      }
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

  // Deprecated: Use getBiomeColorFromAttributes instead
  // Kept for backward compatibility but should not be used
  private getBiomeColor(_type: BiomeType): number {
    // This method is deprecated - colors are now calculated semantically
    // Return a default color as fallback
    return 0x0a0e27;
  }

  private calculateHazards(
    type: BiomeType,
    temperature: number,
    depth: number,
    nx: number,
    ny: number
  ): BiomeHazard[] {
    const hazards: BiomeHazard[] = [];

    // Ocean currents (all biomes have some current)
    const currentValue = this.currentNoise.octaveNoise(nx * 2, ny * 2, 2, 0.5);
    const currentAngle = currentValue * Math.PI * 2;
    const currentIntensity = Math.abs(currentValue) * 0.5;

    hazards.push({
      type: 'current',
      intensity: currentIntensity,
      direction: {
        x: Math.cos(currentAngle),
        y: Math.sin(currentAngle),
      },
    });

    // Biome-specific hazards
    switch (type) {
      case BiomeType.VOLCANIC:
        // Extreme temperature damage
        hazards.push({
          type: 'temperature',
          intensity: 0.8,
        });
        // Radiation from volcanic activity
        hazards.push({
          type: 'radiation',
          intensity: 0.6,
        });
        break;

      case BiomeType.FROZEN:
        // Cold temperature damage
        hazards.push({
          type: 'temperature',
          intensity: 0.5,
        });
        break;

      case BiomeType.ABYSS:
        // Extreme pressure
        hazards.push({
          type: 'pressure',
          intensity: 0.9,
        });
        // Low oxygen
        hazards.push({
          type: 'oxygen',
          intensity: 0.7,
        });
        break;

      case BiomeType.SWAMP:
        // Low oxygen
        hazards.push({
          type: 'oxygen',
          intensity: 0.5,
        });
        break;

      case BiomeType.TOXIC:
        // Radiation from toxins
        hazards.push({
          type: 'radiation',
          intensity: 0.4,
        });
        break;

      case BiomeType.DEEP_COLD:
      case BiomeType.DEEP_WARM:
        // Pressure increases with depth
        if (depth > 7) {
          hazards.push({
            type: 'pressure',
            intensity: (depth - 7) / 3,
          });
        }
        break;
    }

    return hazards;
  }

  private mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }
}
