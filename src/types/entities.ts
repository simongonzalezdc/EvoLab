// Entity type definitions for EvoLab

export interface Vector2D {
  x: number;
  y: number;
}

export interface Traits {
  // Energy & Metabolism (9 traits)
  atp: number; // Current energy (0-100)
  maxATP: number; // Energy storage capacity (50-200)
  metabolismRate: number; // ATP generation rate (0.5-2.0)
  energyEfficiency: number; // ATP cost multiplier (0.5-1.5)
  photosynthesis: number; // ATP from light (0-1.0)

  // Physical Stats (10 traits)
  size: number; // Body size (1-10)
  speed: number; // Movement speed (1-10)
  maxSpeed: number; // Speed cap (3-15)
  armor: number; // Damage reduction (0-10)
  health: number; // Current HP (0-100)
  maxHealth: number; // Max HP (50-200)
  regeneration: number; // HP regen per second (0-5)

  // Senses & Detection (8 traits)
  visionRange: number; // See distance (50-500px)
  chemotaxis: number; // Smell chemical trails (0-10)
  hearing: number; // Detect vibrations (0-10)
  magnetoreception: number; // Navigate (0-10)

  // Behavioral/Mental (7 traits)
  aggression: number; // Attack likelihood (0-10)
  intelligence: number; // Decision quality (0-10)
  socialBehavior: number; // Pack tendency (0-10)
  fearResponse: number; // Flee threshold (0-10)
  learningRate: number; // Adaptation speed (0-1.0)

  // Special Abilities (8 traits)
  toxinStrength: number; // Poison damage (0-10)
  speedBurstPower: number; // Dash ability (0-10)
  camouflage: number; // Stealth level (0-10)
  electricShock: number; // Stun ability (0-10)

  // Resource Collection (5 traits)
  absorptionRate: number; // Gather speed (0.5-2.0)
  digestionEfficiency: number; // Food→ATP conversion (0.5-2.0)
  maxStorage: number; // Compound storage (50-500)
  scavengerBonus: number; // Extra from corpses (0-2.0)

  // Environmental Adaptation (8 traits)
  temperatureTolerance: number; // Hot/cold zones (0-10)
  pressureResistance: number; // Deep water (0-10)
  toxinResistance: number; // Polluted areas (0-10)
  pHTolerance: number; // Acid/alkaline (0-10)
  oxygenNeed: number; // O2 requirement (0-10)

  // Visual
  color: number; // Hex color

  // Reproduction
  gender?: 'male' | 'female'; // Gender for sexual reproduction
  fertilityRate?: number; // Reproduction success rate (0-1.0)
  matingDisplayStrength?: number; // Attractiveness for mating (0-10)
}

export interface CompoundStorage {
  glucose: number;
  aminoAcids: number;
  phosphates: number;
}

export interface ReproductionRequirements {
  atpThreshold: number; // Percentage of maxATP (default: 70%)
  compoundReserve: CompoundStorage;
  maturityTimer: number; // Seconds since last reproduction
  populationPressure: number; // Max percentage of biome capacity
}

export interface LineageInfo {
  generation: number;
  lineageId: string;
  parentId: string | null;
  birthTime: number;
  mutations: string[];
  motherLineageId?: string; // For sexual reproduction
  fatherLineageId?: string; // For sexual reproduction
  speciesId?: string; // For speciation tracking
}

export interface EntityData {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  traits: Traits;
  type: 'cell' | 'resource';
}

export interface ResourceData {
  id: string;
  position: Vector2D;
  type: 'glucose' | 'aminoAcid' | 'phosphate';
  amount: number;
  radius: number;
}

export interface Species {
  id: string;
  name: string;
  commonAncestorLineageId: string;
  divergenceTime: number;
  population: number;
  averageTraits: Partial<Traits>;
  isExtinct: boolean;
  extinctionTime?: number;
  color: number; // Visual identifier
}

export interface MatingAttempt {
  maleId: string;
  femaleId: string;
  compatibilityScore: number;
  success: boolean;
  timestamp: number;
}
