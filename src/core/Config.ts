// Game configuration constants

export const Config = {
  // Canvas settings - will be set to viewport size
  CANVAS_WIDTH: typeof window !== 'undefined' ? window.innerWidth : 1200,
  CANVAS_HEIGHT: typeof window !== 'undefined' ? window.innerHeight : 800,
  BACKGROUND_COLOR: 0x0a0e27,

  // Player cell settings
  PLAYER_START_X: 600,
  PLAYER_START_Y: 400,
  PLAYER_RADIUS: 15,
  PLAYER_COLOR: 0x4caf50,

  // Movement settings
  MOVE_SPEED: 3,
  ACCELERATION: 2.0, // Increased from 0.5 for more responsive movement
  FRICTION: 0.88, // Reduced from 0.95 for less sluggish feel
  MAX_VELOCITY: 8, // Increased from 5 for faster movement

  // ATP / Energy settings
  START_ATP: 100,
  MAX_ATP: 100,
  ATP_DRAIN_RATE: 0.025, // Reduced from 0.05 - cells last twice as long
  ATP_DRAIN_MULTIPLIER_SIZE: 0.005, // Reduced from 0.01 - size penalty halved
  ATP_FROM_GLUCOSE: 40, // Increased from 25 - more rewarding to collect glucose

  // Auto-pilot settings
  AUTO_PILOT_HUNGER_THRESHOLD: 0.9, // Start seeking food at 90% ATP
  AUTO_PILOT_STARVATION_WINDOW_SECONDS: 5, // Project ATP 5 seconds ahead

  // Debug settings - set to true to enable detailed logging
  DEBUG_AUTO_PILOT: false, // Enable debug logging for auto-pilot
  DEBUG_GAME_LOOP: false, // Enable debug logging for game loop initialization
  DEBUG_RENDERER: false, // Enable debug logging for PixiApp renderer
  DEBUG_PLAYER_SPECIES: false, // Enable debug logging for player species creation
  DEBUG_EVOLUTION: false, // Enable debug logging for evolution events
  DEBUG_AUDIO: false, // Enable debug logging for audio/music system

  // Resource settings
  GLUCOSE_COUNT: 60, // Increased from 40 to match larger map size
  GLUCOSE_RADIUS: 8,
  GLUCOSE_COLOR: 0xffd700,
  GLUCOSE_RESPAWN_TIME: 8000, // Reduced from 10000 - faster respawn
  RESOURCE_COLLECTION_RANGE: 30, // Increased from 25 - easier to collect

  // Lake environment settings
  LAKE_WIDTH: 3000, // Increased from 2000 for more exploration space
  LAKE_HEIGHT: 2250, // Increased from 1500 to maintain 4:3 aspect ratio

  // Biome generation settings
  RARE_BIOME_WEIGHT: 0.15, // 15% chance for rare biomes (CRYSTAL, SWAMP)
  BIOME_TRANSITION_SMOOTHNESS: 0.3, // Lower = smoother transitions (0-1)
  BIOME_TILE_SIZE: 25, // World units per biome tile (smaller = more detail)
  BIOME_RENDER_PADDING: 400, // Extra world units rendered beyond the viewport
  DEBUG_BIOME_RENDERER: false, // Extra logging for biome renderer

  // Game loop settings
  TARGET_FPS: 60,
  FIXED_TIMESTEP: 1000 / 60, // 16.67ms per frame

  // Evolution & DNA settings
  DNA_COST_PER_TRAIT_CHANGE: 2, // DNA points per unit change in traits
  DNA_FROM_SURVIVAL_TIME: 0.1, // DNA points per second of survival
  DNA_FROM_GLUCOSE: 0.05, // DNA points per glucose collected
  SUPER_MUTATION_CHANCE: 0.10, // 10% chance for 2x mutation magnitude (dopamine boost)
  SUPER_MUTATION_MULTIPLIER: 2.0, // Multiplier for super mutations

  // Day/Night cycle settings
  DAY_NIGHT_START_TIME: 12, // Start at noon (hour 0-24)
  DAY_NIGHT_SPEED_MULTIPLIER: 10, // 10x real-time speed

  // Combat settings
  TOXIN_DAMAGE_MULTIPLIER: 0.5, // Multiplier for toxin damage
  ARMOR_REDUCTION_PER_POINT: 0.1, // 10% damage reduction per armor point
  MINIMUM_DAMAGE: 1, // Minimum damage dealt per attack
  ENERGY_GAIN_FROM_KILL_MULTIPLIER: 10, // ATP = defender size * this value
  ATP_COST_OF_ATTACKING_MULTIPLIER: 0.2, // ATP cost = damage * this value

  // Combat power calculation
  COMBAT_POWER_SIZE_MULTIPLIER: 2,
  COMBAT_POWER_ARMOR_MULTIPLIER: 1.5,
  COMBAT_POWER_TOXIN_MULTIPLIER: 1,

  // AI Species settings
  HERBIVORE_SIZE: 4,
  HERBIVORE_COLOR: 0x66bb6a,
  HERBIVORE_POPULATION: 15,
  CARNIVORE_SIZE: 6,
  CARNIVORE_COLOR: 0xef5350,
  CARNIVORE_POPULATION: 8,
  OMNIVORE_SIZE: 5,
  OMNIVORE_COLOR: 0xffa726,
  OMNIVORE_POPULATION: 10,

  // Save system settings
  AUTO_SAVE_INTERVAL_MINUTES: 5, // Auto-save every 5 minutes

  // Sound effects settings
  SOUND_EFFECTS_ENABLED: true, // Enable sound effects by default
  SOUND_EFFECTS_VOLUME: 0.5, // Volume 0-1
  DANGER_SOUND_THRESHOLD: 150, // Distance threshold for danger sounds
  LOW_ATP_WARNING_THRESHOLD: 0.2, // Play warning at 20% ATP

  // Reproduction requirements
  REPRODUCTION_ATP_THRESHOLD: 70, // % of max ATP required
  REPRODUCTION_GLUCOSE_REQUIRED: 50,
  REPRODUCTION_AMINO_ACIDS_REQUIRED: 30,
  REPRODUCTION_PHOSPHATES_REQUIRED: 20,
  REPRODUCTION_COOLDOWN_SECONDS: 60, // Time between reproductions
} as const;
