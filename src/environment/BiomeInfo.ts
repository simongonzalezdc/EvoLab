// Biome information for UI display (colors, names, descriptions)

import { BiomeType } from './BiomeGenerator';
import { getBiomeColorFromAttributes } from './BiomeColor';

export interface BiomeInfo {
  type: BiomeType;
  name: string;
  color: number; // Hex color value
  description: string;
  // Normalized attributes (0-1)
  temperature: number; // 0 = coldest, 1 = hottest
  depth: number; // 0 = shallowest, 1 = deepest
  nutrients: number; // 0 = barren, 1 = nutrient-rich
  toxicity: number; // 0 = safe, 1 = highly toxic
  hazardFlags: string[]; // List of hazard types
  isVariant?: boolean; // True if this is a variant biome (CRYSTAL, SWAMP)
  parentType?: BiomeType; // Parent biome type for variants
}

// Helper to calculate color from attributes for a biome type
function getColorForBiomeType(type: BiomeType): number {
  // Use representative attributes for each biome type to generate color
  switch (type) {
    case BiomeType.SHALLOW_WARM:
      return getBiomeColorFromAttributes(0.7, 0.2, 'none', 0.5);
    case BiomeType.SHALLOW_COLD:
      return getBiomeColorFromAttributes(0.2, 0.2, 'none', 0.4);
    case BiomeType.DEEP_WARM:
      return getBiomeColorFromAttributes(0.7, 0.7, 'none', 0.5);
    case BiomeType.DEEP_COLD:
      return getBiomeColorFromAttributes(0.2, 0.7, 'none', 0.4);
    case BiomeType.TOXIC:
      return getBiomeColorFromAttributes(0.5, 0.5, 'toxic', 0.3);
    case BiomeType.NUTRIENT_RICH:
      return getBiomeColorFromAttributes(0.6, 0.5, 'none', 0.9);
    case BiomeType.BARREN:
      return getBiomeColorFromAttributes(0.5, 0.5, 'none', 0.1);
    case BiomeType.VOLCANIC:
      return getBiomeColorFromAttributes(1.0, 0.4, 'volcanic', 0.3);
    case BiomeType.FROZEN:
      return getBiomeColorFromAttributes(0.1, 0.2, 'frozen', 0.3);
    case BiomeType.SWAMP:
      return getBiomeColorFromAttributes(0.5, 0.4, 'toxic', 0.8); // Variant of TOXIC
    case BiomeType.CRYSTAL:
      return getBiomeColorFromAttributes(0.6, 0.6, 'none', 0.85); // Variant of NUTRIENT_RICH
    case BiomeType.ABYSS:
      return getBiomeColorFromAttributes(0.2, 1.0, 'pressure', 0.2);
    default:
      return 0x0a0e27;
  }
}

export const BIOME_INFO: Record<BiomeType, BiomeInfo> = {
  [BiomeType.SHALLOW_WARM]: {
    type: BiomeType.SHALLOW_WARM,
    name: 'Shallow Warm',
    color: getColorForBiomeType(BiomeType.SHALLOW_WARM),
    description: 'Warm shallow waters with moderate nutrients. Ideal for early life forms.',
    temperature: 0.7,
    depth: 0.2,
    nutrients: 0.5,
    toxicity: 0.0,
    hazardFlags: [],
  },
  [BiomeType.SHALLOW_COLD]: {
    type: BiomeType.SHALLOW_COLD,
    name: 'Shallow Cold',
    color: getColorForBiomeType(BiomeType.SHALLOW_COLD),
    description: 'Cold shallow waters. Lower temperatures slow metabolism but reduce competition.',
    temperature: 0.2,
    depth: 0.2,
    nutrients: 0.4,
    toxicity: 0.0,
    hazardFlags: [],
  },
  [BiomeType.DEEP_WARM]: {
    type: BiomeType.DEEP_WARM,
    name: 'Deep Warm',
    color: getColorForBiomeType(BiomeType.DEEP_WARM),
    description: 'Warm deep waters. Moderate pressure and temperature create stable conditions.',
    temperature: 0.7,
    depth: 0.7,
    nutrients: 0.5,
    toxicity: 0.0,
    hazardFlags: ['pressure'],
  },
  [BiomeType.DEEP_COLD]: {
    type: BiomeType.DEEP_COLD,
    name: 'Deep Cold',
    color: getColorForBiomeType(BiomeType.DEEP_COLD),
    description: 'Cold deep waters. High pressure and low temperature challenge survival.',
    temperature: 0.2,
    depth: 0.7,
    nutrients: 0.4,
    toxicity: 0.0,
    hazardFlags: ['pressure'],
  },
  [BiomeType.TOXIC]: {
    type: BiomeType.TOXIC,
    name: 'Toxic',
    color: getColorForBiomeType(BiomeType.TOXIC),
    description: 'Highly toxic environment with radiation hazards. Only the hardiest survive.',
    temperature: 0.5,
    depth: 0.5,
    nutrients: 0.3,
    toxicity: 0.8,
    hazardFlags: ['toxic', 'radiation'],
  },
  [BiomeType.NUTRIENT_RICH]: {
    type: BiomeType.NUTRIENT_RICH,
    name: 'Nutrient Rich',
    color: getColorForBiomeType(BiomeType.NUTRIENT_RICH),
    description: 'Abundant nutrients support rapid growth and reproduction. Highly competitive.',
    temperature: 0.6,
    depth: 0.5,
    nutrients: 0.9,
    toxicity: 0.0,
    hazardFlags: [],
  },
  [BiomeType.BARREN]: {
    type: BiomeType.BARREN,
    name: 'Barren',
    color: getColorForBiomeType(BiomeType.BARREN),
    description: 'Low nutrient levels make survival difficult. Requires efficient metabolism.',
    temperature: 0.5,
    depth: 0.5,
    nutrients: 0.1,
    toxicity: 0.0,
    hazardFlags: [],
  },
  [BiomeType.VOLCANIC]: {
    type: BiomeType.VOLCANIC,
    name: 'Volcanic',
    color: getColorForBiomeType(BiomeType.VOLCANIC),
    description: 'Extreme heat and radiation from volcanic activity. Extreme conditions.',
    temperature: 1.0,
    depth: 0.4,
    nutrients: 0.3,
    toxicity: 0.6,
    hazardFlags: ['volcanic', 'temperature', 'radiation'],
  },
  [BiomeType.FROZEN]: {
    type: BiomeType.FROZEN,
    name: 'Frozen',
    color: getColorForBiomeType(BiomeType.FROZEN),
    description: 'Near-freezing shallow waters. Cold damage requires thermal resistance.',
    temperature: 0.1,
    depth: 0.2,
    nutrients: 0.3,
    toxicity: 0.0,
    hazardFlags: ['frozen', 'temperature'],
  },
  [BiomeType.SWAMP]: {
    type: BiomeType.SWAMP,
    name: 'Swamp',
    color: getColorForBiomeType(BiomeType.SWAMP),
    description: 'High nutrients but low oxygen. Rich but challenging environment. (Variant of Toxic)',
    temperature: 0.5,
    depth: 0.4,
    nutrients: 0.8,
    toxicity: 0.6,
    hazardFlags: ['toxic', 'oxygen'],
    isVariant: true,
    parentType: BiomeType.TOXIC,
  },
  [BiomeType.CRYSTAL]: {
    type: BiomeType.CRYSTAL,
    name: 'Crystal',
    color: getColorForBiomeType(BiomeType.CRYSTAL),
    description: 'Moderate temperature, low toxicity, moderate depth. Balanced conditions. (Variant of Nutrient Rich)',
    temperature: 0.6,
    depth: 0.6,
    nutrients: 0.85,
    toxicity: 0.1,
    hazardFlags: [],
    isVariant: true,
    parentType: BiomeType.NUTRIENT_RICH,
  },
  [BiomeType.ABYSS]: {
    type: BiomeType.ABYSS,
    name: 'Abyss',
    color: getColorForBiomeType(BiomeType.ABYSS),
    description: 'Extreme depth with crushing pressure and low oxygen. Ultimate challenge.',
    temperature: 0.2,
    depth: 1.0,
    nutrients: 0.2,
    toxicity: 0.0,
    hazardFlags: ['pressure', 'oxygen'],
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

