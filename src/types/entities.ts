// Entity type definitions for EvoLab

export interface Vector2D {
  x: number;
  y: number;
}

export interface Traits {
  // Energy & Metabolism
  atp: number; // Current energy (0-100)
  maxATP: number; // Energy storage capacity
  metabolismRate: number; // ATP generation rate (0.5-2.0)
  energyEfficiency: number; // ATP cost multiplier (0.5-1.5)

  // Physical Stats
  size: number; // Body size (1-10)
  speed: number; // Movement speed (1-10)
  maxSpeed: number; // Speed cap
  health: number; // Current HP
  maxHealth: number; // Max HP

  // Visual
  color: number; // Hex color
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
