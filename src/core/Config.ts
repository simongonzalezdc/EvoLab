// Game configuration constants

export const Config = {
  // Canvas settings
  CANVAS_WIDTH: 1200,
  CANVAS_HEIGHT: 800,
  BACKGROUND_COLOR: 0x0a0e27,

  // Player cell settings
  PLAYER_START_X: 600,
  PLAYER_START_Y: 400,
  PLAYER_RADIUS: 15,
  PLAYER_COLOR: 0x4caf50,

  // Movement settings
  MOVE_SPEED: 3,
  ACCELERATION: 0.5,
  FRICTION: 0.95,
  MAX_VELOCITY: 5,

  // ATP / Energy settings
  START_ATP: 100,
  MAX_ATP: 100,
  ATP_DRAIN_RATE: 0.05, // ATP drained per frame at 60 FPS
  ATP_DRAIN_MULTIPLIER_SIZE: 0.01, // Extra drain per size unit
  ATP_FROM_GLUCOSE: 25, // ATP restored when collecting glucose

  // Resource settings
  GLUCOSE_COUNT: 30,
  GLUCOSE_RADIUS: 8,
  GLUCOSE_COLOR: 0xffd700,
  GLUCOSE_RESPAWN_TIME: 10000, // milliseconds
  RESOURCE_COLLECTION_RANGE: 25, // Distance to auto-collect

  // Lake environment settings
  LAKE_WIDTH: 2000,
  LAKE_HEIGHT: 1500,

  // Game loop settings
  TARGET_FPS: 60,
  FIXED_TIMESTEP: 1000 / 60, // 16.67ms per frame
} as const;
