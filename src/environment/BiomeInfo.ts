// Biome information for UI display (colors, names, descriptions)

import { BiomeType } from './BiomeGenerator';

export interface BiomeInfo {
  type: BiomeType;
  name: string;
  color: number; // Hex color value
  description: string;
}

export const BIOME_INFO: Record<BiomeType, BiomeInfo> = {
  [BiomeType.SHALLOW_WARM]: {
    type: BiomeType.SHALLOW_WARM,
    name: 'Shallow Warm',
    color: 0x4dd0e1, // Light cyan
    description: 'Warm shallow waters with moderate nutrients. Ideal for early life forms.',
  },
  [BiomeType.SHALLOW_COLD]: {
    type: BiomeType.SHALLOW_COLD,
    name: 'Shallow Cold',
    color: 0x81d4fa, // Light blue
    description: 'Cold shallow waters. Lower temperatures slow metabolism but reduce competition.',
  },
  [BiomeType.DEEP_WARM]: {
    type: BiomeType.DEEP_WARM,
    name: 'Deep Warm',
    color: 0x0277bd, // Dark cyan
    description: 'Warm deep waters. Moderate pressure and temperature create stable conditions.',
  },
  [BiomeType.DEEP_COLD]: {
    type: BiomeType.DEEP_COLD,
    name: 'Deep Cold',
    color: 0x01579b, // Deep blue
    description: 'Cold deep waters. High pressure and low temperature challenge survival.',
  },
  [BiomeType.TOXIC]: {
    type: BiomeType.TOXIC,
    name: 'Toxic',
    color: 0x7b1fa2, // Purple
    description: 'Highly toxic environment with radiation hazards. Only the hardiest survive.',
  },
  [BiomeType.NUTRIENT_RICH]: {
    type: BiomeType.NUTRIENT_RICH,
    name: 'Nutrient Rich',
    color: 0x66bb6a, // Green
    description: 'Abundant nutrients support rapid growth and reproduction. Highly competitive.',
  },
  [BiomeType.BARREN]: {
    type: BiomeType.BARREN,
    name: 'Barren',
    color: 0x5d4037, // Brown
    description: 'Low nutrient levels make survival difficult. Requires efficient metabolism.',
  },
  [BiomeType.VOLCANIC]: {
    type: BiomeType.VOLCANIC,
    name: 'Volcanic',
    color: 0xff6d00, // Orange-red
    description: 'Extreme heat and radiation from volcanic activity. Extreme conditions.',
  },
  [BiomeType.FROZEN]: {
    type: BiomeType.FROZEN,
    name: 'Frozen',
    color: 0xb3e5fc, // Ice blue
    description: 'Near-freezing shallow waters. Cold damage requires thermal resistance.',
  },
  [BiomeType.SWAMP]: {
    type: BiomeType.SWAMP,
    name: 'Swamp',
    color: 0x558b2f, // Dark green
    description: 'High nutrients but low oxygen. Rich but challenging environment.',
  },
  [BiomeType.CRYSTAL]: {
    type: BiomeType.CRYSTAL,
    name: 'Crystal',
    color: 0x9c27b0, // Bright purple
    description: 'Moderate temperature, low toxicity, moderate depth. Balanced conditions.',
  },
  [BiomeType.ABYSS]: {
    type: BiomeType.ABYSS,
    name: 'Abyss',
    color: 0x1a237e, // Very dark blue
    description: 'Extreme depth with crushing pressure and low oxygen. Ultimate challenge.',
  },
};

// Helper function to get biome info by type
export function getBiomeInfo(type: BiomeType): BiomeInfo {
  return BIOME_INFO[type];
}

// Get all biome infos as array
export function getAllBiomeInfos(): BiomeInfo[] {
  return Object.values(BIOME_INFO);
}

