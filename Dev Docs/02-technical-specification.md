# EvoLab - Master Technical Specification

**FOR AI CODING AGENT:** This is your primary implementation guide.  
**Generated:** November 15, 2025  
**Version:** 1.0.0  
**Target Environment:** Modern browsers (Chrome 120+, Firefox 120+, Safari 17+)

---

## System Architecture

### High-Level Overview

EvoLab is a browser-based evolution simulator built as a single-page application (SPA) with no backend server required for core functionality. The architecture follows a game loop pattern with distinct systems for rendering, physics, genetics, AI, and data visualization.

**Core Architecture Principles:**
1. **Performance-first design** - Support 200+ entities at 60 FPS
2. **Modular systems** - Each system (physics, genetics, rendering) operates independently
3. **Data-driven gameplay** - All game mechanics defined by JSON configurations
4. **Web Workers for heavy computation** - Genetic algorithms run off main thread
5. **Progressive enhancement** - Graceful degradation on older browsers

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    EvoLab Browser App                        │
├─────────────────────────────────────────────────────────────┤
│  Main Thread                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   React UI   │  │  PixiJS      │  │   D3.js      │     │
│  │ (Menus/HUD)  │──│  Renderer    │──│  DataViz     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │              │
│         └────────┬─────────┴─────────────────┘              │
│                  │                                           │
│         ┌────────▼────────┐                                 │
│         │  Zustand Store  │ (Global State)                  │
│         └────────┬────────┘                                 │
│                  │                                           │
│     ┌────────────┼────────────┐                             │
│     │            │            │                              │
│ ┌───▼────┐  ┌───▼────┐  ┌───▼────┐                        │
│ │Physics │  │ Entity │  │  AI    │                          │
│ │System  │  │Manager │  │Behavior│                          │
│ └───┬────┘  └───┬────┘  └───┬────┘                        │
│     │           │           │                                │
│     └───────────┼───────────┘                                │
│                 │                                            │
│         ┌───────▼────────┐                                  │
│         │  Game Loop     │ (requestAnimationFrame)          │
│         │  Controller    │                                  │
│         └───────┬────────┘                                  │
│                 │                                            │
├─────────────────┼────────────────────────────────────────┤
│  Web Worker Thread                                          │
│         ┌───────▼────────┐                                  │
│         │    Genetic     │                                  │
│         │   Algorithm    │ (Evolution simulation)           │
│         │    Engine      │                                  │
│         └────────────────┘                                  │
├─────────────────────────────────────────────────────────────┤
│  IndexedDB (Dexie.js)                                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │  Creatures │  │  Evolution │  │   Saves    │           │
│  │   Library  │  │   History  │  │  & Config  │           │
│  └────────────┘  └────────────┘  └────────────┘           │
└─────────────────────────────────────────────────────────────┘
                      │
              ┌───────▼───────┐
              │   Browser     │
              │  localStorage │
              └───────────────┘
```

### Data Flow

**Game Loop (Main Thread - 60 FPS):**
1. User input → Input Handler
2. Update all entities (position, energy, health)
3. Physics system resolves collisions
4. AI behavior system makes decisions
5. Render frame to PixiJS canvas
6. Update UI components (React)
7. Update data visualizations (D3.js)

**Evolution Loop (Web Worker - triggered on reproduction):**
1. Parent creature genome sent to worker
2. Genetic algorithm applies mutations
3. Selection pressure calculated based on environment
4. Offspring genome generated
5. Return to main thread
6. New entity spawned with inherited/mutated traits

**Simulation Speed:**
- At 1x: Real-time, all animations, full visual quality
- At 10x: Skip some animation frames, reduce particle effects
- At 100x: Only update every 10th frame, minimal rendering
- At 1000x: Headless simulation, no rendering, results-only

---

## Tech Stack

### Frontend Core

**Framework:** None (Vanilla TypeScript with optional React for UI only)
- **Version:** TypeScript 5.7+
- **Why:** Maximum performance for game loop; React only for non-game UI (menus, settings, modals)

**Build Tool:** Vite 6.x
- **Why:** Fastest HMR (<100ms), native ESM, optimized production builds
- **Config:** `vite.config.ts` with code splitting for lazy loading

**Package Manager:** pnpm 9.x
- **Why:** 3x faster than npm, efficient disk space, strict dependency resolution

### Rendering Engine

**Library:** PixiJS v8.5+
- **Purpose:** 2D WebGL rendering for game world
- **Features used:**
  - Sprite batching for performance
  - Particle systems (cell trails, environment effects)
  - Custom shaders for glow effects
  - Graphics API for procedural shapes
  - Container hierarchy for scene management
- **Canvas size:** Dynamic (scales to viewport)
- **Render resolution:** Auto-detects device pixel ratio

### Physics Engine

**Library:** Matter.js v0.20+
- **Purpose:** 2D rigid body physics for cell/creature movement
- **Features used:**
  - Collision detection (AABB with spatial hashing)
  - Velocity/force simulation
  - Constraints for creature joints (Phase 2)
- **Performance:** Optimized with sleeping bodies for inactive entities

### Data Visualization

**Library:** D3.js v7.9+
- **Purpose:** Scientific data visualizations (evolution trees, population graphs, trait charts)
- **Charts needed:**
  - Line chart: Population over time
  - Tree diagram: Evolutionary lineage
  - Radar chart: Creature trait analysis
  - Bar chart: Resource levels (ATP, glucose, etc.)
  - Heatmap: Biome fitness analysis

### State Management

**Library:** Zustand v4.5+
- **Purpose:** Centralized game state management
- **Why:** Minimal API, no boilerplate, perfect for game loops
- **Store structure:**
```typescript
{
  gameState: 'menu' | 'playing' | 'paused' | 'editing',
  simulation: { speed: 1 | 10 | 100 | 1000, generation: number },
  playerSpecies: Species,
  aiSpecies: Species[],
  entities: Map<string, Entity>,
  environment: BiomeMap,
  ui: UIState,
  settings: GameSettings
}
```

### Database

**Type:** IndexedDB with Dexie.js v4.0+
- **Purpose:** Browser-native persistent storage
- **Why:** Fast, works offline, no server needed, 50MB+ storage per origin
- **Schema:**
  - `creatures` table: id, genome, stats, createdAt, generation
  - `evolutionHistory` table: id, speciesId, generation, population, traits
  - `saves` table: id, name, gameState, timestamp
  - `settings` table: key-value config

### Audio System

**Library:** Tone.js v15.1+
- **Purpose:** Adaptive procedural music generation
- **Features used:**
  - Synthesizers (PolySynth, Monosynth) for multi-layer audio
  - Effects chain (Reverb, Delay, Filter) for atmospheric soundscapes
  - Transport system for sequencing and tempo control
  - Real-time parameter modulation based on game state
- **Adaptive Elements:**
  - 7 biome-specific musical scales and soundscapes
  - Combat intensity modulation (melody frequency and filter cutoff)
  - Day/night cycle integration (tempo and brightness changes)
  - Smooth transitions between game states
- **Performance:** Uses Web Audio API (GPU-accelerated), negligible CPU impact

### Development Tools

**Linter:** ESLint v9.x with TypeScript plugin
**Formatter:** Prettier v3.x
**Type Checking:** TypeScript strict mode enabled
**Testing:** Vitest v2.x (unit tests), Playwright v1.x (E2E tests)

### Infrastructure

**Hosting:** Vercel (primary) / Netlify (backup)
- **Why:** Zero-config deployment, instant global CDN, automatic HTTPS, great DX
- **Build command:** `pnpm build`
- **Output directory:** `dist/`

**CI/CD:** GitHub Actions
- **Triggers:** Push to main, PR creation
- **Jobs:** Lint, type check, unit tests, build, deploy preview

**Analytics:** Umami (privacy-friendly, self-hosted optional)

---

## Project Structure

```
evolab/
├── public/                      # Static assets (served as-is)
│   ├── assets/                  # Images, fonts, sounds
│   │   ├── sprites/             # Cell/creature sprites
│   │   ├── icons/               # UI icons
│   │   └── audio/               # Sound effects (optional)
│   └── favicon.ico
│
├── src/
│   ├── main.ts                  # Application entry point
│   ├── app.ts                   # Main app initialization
│   │
│   ├── core/                    # Core game systems
│   │   ├── GameLoop.ts          # Main game loop (RAF)
│   │   ├── TimeController.ts    # Speed controls (1x, 10x, 100x, 1000x)
│   │   ├── InputHandler.ts      # Keyboard/mouse input
│   │   └── Config.ts            # Game configuration constants
│   │
│   ├── rendering/               # PixiJS rendering system
│   │   ├── PixiApp.ts           # PixiJS application wrapper
│   │   ├── CellRenderer.ts      # Cell sprite rendering
│   │   ├── EnvironmentRenderer.ts # Biome rendering
│   │   ├── ParticleSystem.ts    # Particles (trails, effects)
│   │   └── CameraController.ts  # Pan/zoom camera
│   │
│   ├── physics/                 # Matter.js physics system
│   │   ├── PhysicsWorld.ts      # Matter.js engine wrapper
│   │   ├── CollisionHandler.ts  # Collision detection
│   │   └── SpatialHash.ts       # Performance optimization
│   │
│   ├── entities/                # Game entities (cells, creatures)
│   │   ├── Entity.ts            # Base entity class
│   │   ├── Cell.ts              # Cell stage entity
│   │   ├── Creature.ts          # Creature stage entity (Phase 2)
│   │   ├── EntityManager.ts     # Entity lifecycle management
│   │   └── EntityFactory.ts     # Entity creation/spawning
│   │
│   ├── genetics/                # Genetic algorithm system
│   │   ├── Genome.ts            # Genome data structure
│   │   ├── GeneticAlgorithm.ts  # Evolution logic
│   │   ├── MutationEngine.ts    # Mutation operations
│   │   ├── SelectionPressure.ts # Environmental fitness
│   │   └── TraitSystem.ts       # Trait definitions + interactions
│   │
│   ├── audio/                   # Adaptive procedural music system
│   │   └── MusicManager.ts      # Tone.js music generation & adaptation
│   │
│   ├── ai/                      # AI species behavior
│   │   ├── AIBehavior.ts        # Base AI behavior class
│   │   ├── HerbivoreAI.ts       # Herbivore strategy
│   │   ├── CarnivoreAI.ts       # Carnivore strategy
│   │   ├── OmnivoreAI.ts        # Omnivore strategy
│   │   └── DecisionTree.ts      # AI decision making
│   │
│   ├── environment/             # World/biome system
│   │   ├── Biome.ts             # Biome definition
│   │   ├── BiomeGenerator.ts    # Procedural generation
│   │   ├── Resource.ts          # Resource nodes (food, nutrients)
│   │   ├── DayNightCycle.ts     # Time-of-day system
│   │   └── EnvironmentEffects.ts # Temperature, light, toxins
│   │
│   ├── ui/                      # React UI components
│   │   ├── components/
│   │   │   ├── MainMenu.tsx     # Start screen
│   │   │   ├── HUD.tsx          # In-game HUD
│   │   │   ├── TraitEditor.tsx  # Cell/creature editor
│   │   │   ├── SpeedControls.tsx # Time controls
│   │   │   └── SettingsPanel.tsx
│   │   ├── hooks/               # React hooks
│   │   └── App.tsx              # Root React component
│   │
│   ├── visualization/           # D3.js data viz
│   │   ├── PopulationChart.ts   # Population line chart
│   │   ├── EvolutionTree.ts     # Lineage tree diagram
│   │   ├── TraitRadar.ts        # Trait radar chart
│   │   ├── ResourceBars.ts      # Resource levels
│   │   └── BiomeHeatmap.ts      # Biome fitness
│   │
│   ├── data/                    # Data persistence
│   │   ├── Database.ts          # Dexie.js wrapper
│   │   ├── SaveManager.ts       # Save/load game state
│   │   ├── CreatureLibrary.ts   # Creature collection
│   │   └── ExportService.ts     # JSON/CSV export
│   │
│   ├── workers/                 # Web Workers
│   │   └── genetics.worker.ts   # Genetic algorithm worker
│   │
│   ├── utils/                   # Utility functions
│   │   ├── math.ts              # Math helpers
│   │   ├── random.ts            # Seeded random number generator
│   │   ├── color.ts             # Color manipulation
│   │   └── performance.ts       # Performance monitoring
│   │
│   ├── types/                   # TypeScript type definitions
│   │   ├── entities.ts
│   │   ├── genetics.ts
│   │   ├── environment.ts
│   │   └── ui.ts
│   │
│   ├── store/                   # Zustand store
│   │   └── gameStore.ts         # Global state management
│   │
│   └── assets/                  # Asset imports
│       └── spriteConfig.ts      # Sprite metadata
│
├── tests/
│   ├── unit/                    # Vitest unit tests
│   │   ├── genetics/
│   │   ├── physics/
│   │   └── entities/
│   └── e2e/                     # Playwright E2E tests
│       └── gameplay.spec.ts
│
├── docs/                        # Documentation
│   ├── ARCHITECTURE.md          # System architecture
│   ├── GENETICS.md              # Genetic algorithm details
│   ├── TRAITS.md                # Trait system documentation
│   ├── ASSETS.md                # Asset sources + licenses
│   └── CONTRIBUTING.md          # Contribution guide
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml               # CI pipeline
│   │   └── deploy.yml           # Deployment
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
│
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json                # TypeScript config (strict mode)
├── vite.config.ts               # Vite bundler config
├── .eslintrc.cjs                # ESLint config
├── .prettierrc                  # Prettier config
├── .gitignore
├── LICENSE                      # MIT License
└── README.md
```

### File Organization Principles

1. **Separation of concerns** - Each directory has single responsibility
2. **Co-location** - Related files stay together (e.g., all genetics code in `genetics/`)
3. **Flat when possible** - Avoid deep nesting; max 3 levels
4. **Explicit imports** - No index.ts barrel files (better tree-shaking)
5. **Naming convention:**
   - Files: PascalCase for classes (`GameLoop.ts`), camelCase for utilities (`math.ts`)
   - Directories: lowercase, singular nouns
   - React components: PascalCase with `.tsx` extension

---

## Core Systems Implementation

### 1. Trait System (40+ Interconnected Variables)

**File:** `src/genetics/TraitSystem.ts`

**Trait Categories:**

```typescript
interface Traits {
  // Energy & Metabolism (9 traits)
  atp: number;                    // Current energy (0-100)
  maxATP: number;                 // Energy storage capacity
  metabolismRate: number;         // ATP generation rate (0.5-2.0)
  energyEfficiency: number;       // ATP cost multiplier (0.5-1.5)
  photosynthesis: number;         // ATP from light (0-1.0)
  
  // Physical Stats (10 traits)
  size: number;                   // Body size (1-10)
  speed: number;                  // Movement speed (1-10)
  maxSpeed: number;               // Speed cap
  armor: number;                  // Damage reduction (0-10)
  health: number;                 // Current HP
  maxHealth: number;              // Max HP
  regeneration: number;           // HP regen per second (0-5)
  
  // Senses & Detection (8 traits)
  visionRange: number;            // See distance (50-500px)
  chemotaxis: number;             // Smell chemical trails (0-10)
  hearing: number;                // Detect vibrations (0-10)
  magnetoreception: number;       // Navigate (0-10)
  
  // Behavioral/Mental (7 traits)
  aggression: number;             // Attack likelihood (0-10)
  intelligence: number;           // Decision quality (0-10)
  socialBehavior: number;         // Pack tendency (0-10)
  fearResponse: number;           // Flee threshold (0-10)
  learningRate: number;           // Adaptation speed (0-1.0)
  
  // Special Abilities (8 traits)
  toxinStrength: number;          // Poison damage (0-10)
  speedBurstPower: number;        // Dash ability (0-10)
  camouflage: number;             // Stealth level (0-10)
  electricShock: number;          // Stun ability (0-10)
  
  // Resource Collection (5 traits)
  absorptionRate: number;         // Gather speed (0.5-2.0)
  digestionEfficiency: number;    // Food→ATP conversion (0.5-2.0)
  maxStorage: number;             // Compound storage
  scavengerBonus: number;         // Extra from corpses (0-2.0)
  
  // Environmental Adaptation (8 traits)
  temperatureTolerance: number;   // Hot/cold zones (0-10)
  pressureResistance: number;     // Deep water (0-10)
  toxinResistance: number;        // Polluted areas (0-10)
  pHTolerance: number;            // Acid/alkaline (0-10)
  oxygenNeed: number;             // O2 requirement (0-10)
}
```

**Trait Interconnections (Enforced in TraitSystem.ts):**

```typescript
// Size affects multiple stats
if (size > 5) {
  speed *= 0.7;               // Bigger = slower
  maxHealth *= 1.5;           // Bigger = more HP
  energyEfficiency *= 1.3;    // Bigger = more food needed
  visionRange *= 1.2;         // Bigger = see farther
}

// Armor reduces speed
speed *= (1 - armor * 0.05);  // Each armor point = -5% speed

// High metabolism = fast energy but high cost
atpGeneration = metabolismRate * 2;
energyDrain = metabolismRate * 1.5;

// Intelligence improves all senses
visionRange *= (1 + intelligence * 0.05);
chemotaxis *= (1 + intelligence * 0.05);

// Special abilities drain ATP
if (toxinStrength > 0) atpDrainRate += toxinStrength * 0.5;
if (camouflage > 0) atpDrainRate += camouflage * 0.3;
```

### 2. Reproduction System

**File:** `src/genetics/GeneticAlgorithm.ts`

**Reproduction Requirements (ALL must be met):**

```typescript
interface ReproductionRequirements {
  atpThreshold: number;           // 70%+ of maxATP
  compoundReserve: {
    glucose: number;              // 50+ units
    aminoAcids: number;           // 30+ units
    phosphates: number;           // 20+ units
  };
  maturityTimer: number;          // 60 seconds since last reproduction
  populationPressure: number;     // < 80% of biome capacity
  environmentalFitness: number;   // Survived 30+ seconds in current biome
}
```

**When reproduction triggered:**
1. Current entity pauses
2. Generation report modal opens
3. Player sees:
   - Survival time this generation
   - Food eaten
   - Threats avoided (successful escapes)
   - Population rank vs AI species
   - Environmental changes detected
4. Trait editor opens
5. Player can spend DNA points on modifications
6. Genetic algorithm applies mutations
7. New entity spawns with combined traits
8. Old entity remains alive (or dies based on settings)

### 3. Cell → Creature Transition

**File:** `src/entities/TransitionManager.ts`

**Unlock Conditions (progressive):**

```typescript
interface TransitionProgress {
  nucleusUnlocked: boolean;          // Spent 25+ DNA points
  specializedOrganelles: number;     // Need 3+ different types
  multicellularState: boolean;       // Unlocked cell clustering
  complexityThreshold: {
    minParts: 15;                    // Body parts total
    minDNASpent: 100;                // Total DNA invested
    generationsSurvived: 10;         // Lived 10+ generations
    populationRank: 3;               // Top 3 species in environment
  };
}
```

**Transition Animation:**
- Dramatic zoom out
- Cell clusters together (5-10 cells merge)
- Forms basic body plan (head + simple limbs)
- Fade to land environment
- Creature editor opens

**Genetic Legacy Mapping:**
```typescript
// Cell traits → Creature traits
if (cellTraits.aggression > 7) {
  creatureTraits.teeth = 'sharp';
  creatureTraits.huntingInstinct = 'high';
} else if (cellTraits.herbivore) {
  creatureTraits.teeth = 'flat';
  creatureTraits.temperament = 'calm';
}
```

---

## Environment & Biome System

### Procedural Lake Generation

**File:** `src/environment/BiomeGenerator.ts`

**Lake Specs:**
- Size: 4000x3000 pixels (medium)
- Shape: Irregular organic shape using Perlin noise
- Biomes: 5-7 distinct zones

**Biome Types:**

| Biome | Temperature | Light | Nutrients | Depth | Hazards |
|-------|-------------|-------|-----------|-------|---------|
| **Shallow Warm** | 20-25°C | High | Medium | 0-50px | None |
| **Deep Cold** | 5-10°C | Low | Low | 200-300px | Pressure |
| **Nutrient Rich** | 15-20°C | Medium | Very High | 50-100px | Competition |
| **Toxic Zone** | 15-20°C | Medium | High | 50-150px | Toxins |
| **Surface Sunlit** | 22-28°C | Very High | High | 0-20px | UV exposure |
| **Hydrothermal Vent** | 60-80°C | None | Very High | 250-300px | Extreme heat |
| **Twilight Zone** | 10-15°C | Very Low | Medium | 150-250px | Darkness |

**Generation Algorithm:**
1. Create irregular boundary using Perlin noise
2. Generate depth map (darker = deeper)
3. Place biomes using Voronoi cells
4. Add gradients between biomes (smooth transitions)
5. Spawn resources based on biome type
6. Add decorative elements (rocks, plants)

**Day/Night Cycle:**
- Duration: 5 minutes real-time (1x speed)
- Effects:
  - Light level changes (affects photosynthesis)
  - Some species become more/less active
  - Temperature fluctuates by ±3°C
  - Different predators spawn at night

### Resource System

**Resource Types:**
```typescript
interface Resource {
  type: 'glucose' | 'aminoAcid' | 'phosphate' | 'corpse';
  position: Vector2D;
  amount: number;
  respawnTimer: number;
}
```

**Spawn Rules:**
- Glucose: Evenly distributed, respawn every 10s
- Amino acids: Clumped near nutrient-rich zones, respawn every 20s
- Phosphates: Deep zones, respawn every 30s
- Corpses: Where entities die, decay after 60s

---

## AI Species System

**File:** `src/ai/AIBehavior.ts`

**AI Personalities (user selects 0-5 at game start):**

1. **Herbivore** - Avoid conflict, efficient energy, high population
2. **Carnivore** - Aggressive hunter, low population, high fitness
3. **Omnivore** - Balanced, adaptive, moderate everything
4. **Parasite** - Steals ATP from others, weak alone, strong in groups
5. **Photosynthetic** - Plant-like, stationary or slow, sunlight-dependent

**AI Decision Tree:**
```typescript
// Every frame, AI evaluates:
1. Health < 30%? → Flee to safe zone
2. ATP < 20%? → Find nearest food
3. Enemy spotted & aggressive? → Attack
4. Mating ready? → Find mate
5. Default → Wander + collect resources
```

**Population Dynamics:**
- Each AI species has target population (20-50 individuals)
- Reproduction rate scales with resource availability
- Competition for resources with player species
- Extinction possible if environment becomes hostile

---

## Data Visualization

### Required Charts

**1. Population Graph (D3.js Line Chart)**
- **File:** `src/visualization/PopulationChart.ts`
- **X-axis:** Time (generations or real-time)
- **Y-axis:** Population count
- **Lines:** One per species (player + AI)
- **Interactions:** Hover to see exact numbers, click to focus species
- **Update frequency:** Every 5 seconds or every generation

**2. Evolution Tree (D3.js Tree Diagram)**
- **File:** `src/visualization/EvolutionTree.ts`
- **Structure:** Hierarchical tree showing lineage
- **Nodes:** Generations with key mutations
- **Colors:** Trait-based (carnivore=red, herbivore=green)
- **Interactions:** Click node to view full trait snapshot

**3. Trait Radar Chart (D3.js)**
- **File:** `src/visualization/TraitRadar.ts`
- **Axes:** 8 primary traits (Speed, Armor, Senses, Intelligence, etc.)
- **Overlay:** Player species vs average of AI species
- **Use case:** Quickly see strengths/weaknesses

**4. Resource Bars (D3.js)**
- **File:** `src/visualization/ResourceBars.ts`
- **Bars:** ATP, Glucose, Amino Acids, Phosphates
- **Colors:** Energy=yellow, Glucose=orange, Amino=blue, Phosphate=purple
- **Threshold indicators:** Red zone when low

**5. Biome Fitness Heatmap (D3.js)**
- **File:** `src/visualization/BiomeHeatmap.ts`
- **Grid:** Lake divided into cells
- **Color:** Green=high fitness, Red=low fitness for current traits
- **Purpose:** Show where player species thrives

---

## Performance Optimization

### Spatial Hashing

**File:** `src/physics/SpatialHash.ts`

**Purpose:** Reduce collision checks from O(n²) to O(n)

**Implementation:**
```typescript
class SpatialHash {
  cellSize: number = 100; // 100px grid cells
  grid: Map<string, Entity[]>;
  
  insert(entity: Entity): void {
    const cellKey = this.getCellKey(entity.position);
    this.grid.get(cellKey)?.push(entity);
  }
  
  getNearby(position: Vector2D): Entity[] {
    // Check only 9 cells (3x3 around position)
    const nearby = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const cellKey = this.getCellKey({
          x: position.x + dx * this.cellSize,
          y: position.y + dy * this.cellSize
        });
        nearby.push(...this.grid.get(cellKey) || []);
      }
    }
    return nearby;
  }
}
```

### Web Worker for Genetics

**File:** `src/workers/genetics.worker.ts`

**Why:** Genetic algorithm is CPU-intensive; offload to worker thread

**Communication:**
```typescript
// Main thread sends:
postMessage({
  type: 'evolve',
  parentGenome: Genome,
  environment: BiomeSnapshot
});

// Worker responds:
postMessage({
  type: 'offspring',
  childGenome: Genome,
  mutations: Mutation[]
});
```

### Adaptive Quality Scaling

**File:** `src/core/PerformanceMonitor.ts`

**Auto-adjust based on FPS:**
```typescript
if (fps < 50) {
  // Reduce quality
  particleSystem.density *= 0.5;
  shadowsEnabled = false;
  renderDistance *= 0.8;
}

if (fps > 58 && qualityReduced) {
  // Restore quality gradually
  particleSystem.density *= 1.1;
}
```

### Entity Pooling

**File:** `src/entities/EntityPool.ts`

**Why:** Avoid garbage collection spikes

**Pattern:**
```typescript
class EntityPool {
  inactive: Entity[] = [];
  
  acquire(): Entity {
    return this.inactive.pop() || new Entity();
  }
  
  release(entity: Entity): void {
    entity.reset();
    this.inactive.push(entity);
  }
}
```

---

## Testing Strategy

### Test Coverage Goals
- **Unit tests:** 80%+ coverage
- **Integration tests:** Core game loops (physics, genetics, rendering)
- **E2E tests:** Critical user flows (start game, evolve, save/load)

### Testing Frameworks
- **Unit:** Vitest (fast, ESM-native, great DX)
- **Integration:** Vitest with mocked PixiJS
- **E2E:** Playwright (cross-browser, auto-waits)

### Required Tests

**For every feature:**
1. Happy path test
2. Error handling test
3. Edge case tests (boundary values, null/undefined)
4. Performance test (if CPU-intensive)

**Priority test areas:**
- Genetic algorithm (mutations, selection, fitness)
- Trait system (interconnections, constraints)
- Reproduction requirements (all conditions)
- Save/load (data integrity)
- Export/import (format validation)

**Test file naming:** `*.test.ts` (e.g., `GeneticAlgorithm.test.ts`)

**Example test structure:**
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { GeneticAlgorithm } from '../genetics/GeneticAlgorithm';

describe('GeneticAlgorithm', () => {
  let ga: GeneticAlgorithm;
  
  beforeEach(() => {
    ga = new GeneticAlgorithm();
  });
  
  it('applies mutation within bounds', () => {
    const parent = createTestGenome({ speed: 5 });
    const child = ga.mutate(parent);
    expect(child.speed).toBeGreaterThan(1);
    expect(child.speed).toBeLessThan(10);
  });
  
  it('preserves core traits with low mutation rate', () => {
    const parent = createTestGenome({ carnivore: true });
    ga.mutationRate = 0.1;
    const children = Array.from({ length: 100 }, () => ga.mutate(parent));
    const carnivores = children.filter(c => c.carnivore === true).length;
    expect(carnivores).toBeGreaterThan(85); // 85%+ should stay carnivore
  });
});
```

### Running Tests
```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific test
pnpm test GeneticAlgorithm

# Run E2E tests
pnpm test:e2e
```

---

## Code Style & Standards

### Formatting
- **Tool:** Prettier v3.x
- **Config:** `.prettierrc`
- **Run:** `pnpm format`

**Settings:**
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
```

### Linting
- **Tool:** ESLint v9.x with TypeScript plugin
- **Config:** `.eslintrc.cjs`
- **Run:** `pnpm lint`

**Key rules:**
- `no-any`: Error (no `any` types allowed)
- `no-explicit-any`: Error
- `no-unused-vars`: Error
- `no-console`: Warning in production

### Naming Conventions
- **Variables:** camelCase (`entityManager`, `currentGeneration`)
- **Functions:** camelCase (`calculateFitness`, `spawnEntity`)
- **Classes:** PascalCase (`GameLoop`, `GeneticAlgorithm`)
- **Interfaces:** PascalCase (`Traits`, `Genome`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_POPULATION`, `DEFAULT_MUTATION_RATE`)
- **Files:** PascalCase for classes, camelCase for utilities
- **Directories:** lowercase, singular nouns

### Code Patterns

**Preferred:**
```typescript
// Use explicit types
function calculateSpeed(size: number, armor: number): number {
  return BASE_SPEED * (1 - size * 0.1) * (1 - armor * 0.05);
}

// Use const for immutability
const MAX_SPEED = 10;

// Use early returns
function canReproduce(entity: Entity): boolean {
  if (entity.atp < entity.maxATP * 0.7) return false;
  if (entity.maturityTimer < 60) return false;
  return true;
}

// Use object destructuring
const { position, velocity, mass } = entity;
```

**Avoid:**
```typescript
// Don't use any
function process(data: any) { ... }  // ❌

// Don't mutate parameters
function updateEntity(entity: Entity) {
  entity.position.x += 10;  // ❌ Mutates original
}

// Don't use var
var count = 0;  // ❌ Use const or let

// Don't ignore errors
fetch('/api').then(res => res.json());  // ❌ No error handling
```

### Comments & Documentation

**JSDoc for public APIs:**
```typescript
/**
 * Calculates fitness score for an entity based on environmental conditions.
 * @param entity - The entity to evaluate
 * @param biome - Current biome conditions
 * @returns Fitness score (0-100)
 */
function calculateFitness(entity: Entity, biome: Biome): number {
  // Implementation
}
```

**Inline comments for complex logic:**
```typescript
// Use spatial hashing to reduce collision checks from O(n²) to O(n)
const nearby = spatialHash.getNearby(entity.position);
for (const other of nearby) {
  // Check collision only if in same cell or adjacent cells
  if (checkCollision(entity, other)) {
    resolveCollision(entity, other);
  }
}
```

---

## Implementation Order

### Phase 1: Foundation (Weeks 1-3)
**Priority:** CRITICAL  
**Goal:** Playable cell stage with basic mechanics

**Week 1: Core Setup**
1. **Initialize project** - Set up Vite + TypeScript, install dependencies
   - Files: `package.json`, `vite.config.ts`, `tsconfig.json`
   - Tests: None yet
   
2. **PixiJS rendering** - Create canvas, render single cell
   - Files: `src/rendering/PixiApp.ts`, `src/rendering/CellRenderer.ts`
   - Tests: Visual inspection
   
3. **Input handling** - WASD movement, mouse controls
   - Files: `src/core/InputHandler.ts`
   - Tests: `InputHandler.test.ts`

**Week 2: Core Mechanics**
4. **Entity system** - Base entity class with properties
   - Files: `src/entities/Entity.ts`, `src/entities/Cell.ts`, `src/entities/EntityManager.ts`
   - Tests: `Entity.test.ts`, `EntityManager.test.ts`
   
5. **ATP energy system** - Energy drains over time, collect glucose to restore
   - Files: `src/entities/EnergySystem.ts`, `src/environment/Resource.ts`
   - Tests: `EnergySystem.test.ts`
   
6. **Basic trait system** - 10 core traits (size, speed, armor, health, ATP, metabolism)
   - Files: `src/genetics/TraitSystem.ts`, `src/genetics/Genome.ts`
   - Tests: `TraitSystem.test.ts`, `Genome.test.ts`

**Week 3: Environment**
7. **Lake generation** - Procedural biomes using Perlin noise
   - Files: `src/environment/BiomeGenerator.ts`, `src/environment/Biome.ts`
   - Tests: `BiomeGenerator.test.ts`
   
8. **Resource spawning** - Glucose, amino acids, phosphates
   - Files: `src/environment/ResourceSpawner.ts`
   - Tests: `ResourceSpawner.test.ts`
   
9. **Day/night cycle** - Time progression, light levels
   - Files: `src/environment/DayNightCycle.ts`
   - Tests: `DayNightCycle.test.ts`

### Phase 2: Genetics & Evolution (Weeks 4-6)
**Priority:** HIGH  
**Goal:** Fully functional genetic algorithm with reproduction

**Week 4: Genetic Algorithm**
10. **Genome structure** - Complete 40+ trait definitions
    - Files: Update `src/genetics/Genome.ts`, `src/genetics/TraitSystem.ts`
    - Tests: Add comprehensive trait tests
    
11. **Mutation engine** - Mutation operations (point, deletion, duplication)
    - Files: `src/genetics/MutationEngine.ts`
    - Tests: `MutationEngine.test.ts`
    
12. **Trait interconnections** - Implement all trait relationships
    - Files: Update `src/genetics/TraitSystem.ts`
    - Tests: `TraitInterconnections.test.ts`

**Week 5: Reproduction**
13. **Reproduction system** - Reproduction requirements, triggers
    - Files: `src/genetics/ReproductionSystem.ts`
    - Tests: `ReproductionSystem.test.ts`
    
14. **Selection pressure** - Environmental fitness calculation
    - Files: `src/genetics/SelectionPressure.ts`
    - Tests: `SelectionPressure.test.ts`
    
15. **Genetic algorithm worker** - Offload evolution to Web Worker
    - Files: `src/workers/genetics.worker.ts`
    - Tests: Integration test

**Week 6: UI for Genetics**
16. **Trait editor UI** - React component for modifying traits
    - Files: `src/ui/components/TraitEditor.tsx`
    - Tests: Visual/manual testing
    
17. **Generation report** - Display stats after reproduction
    - Files: `src/ui/components/GenerationReport.tsx`
    - Tests: Visual/manual testing

### Phase 3: AI & Competition (Weeks 7-9)
**Priority:** HIGH  
**Goal:** Multiple AI species competing with player

**Week 7: AI Foundation**
18. **AI behavior system** - Base decision tree
    - Files: `src/ai/AIBehavior.ts`, `src/ai/DecisionTree.ts`
    - Tests: `AIBehavior.test.ts`
    
19. **Herbivore AI** - Peaceful, efficient resource collection
    - Files: `src/ai/HerbivoreAI.ts`
    - Tests: `HerbivoreAI.test.ts`
    
20. **Carnivore AI** - Aggressive, hunting behavior
    - Files: `src/ai/CarnivoreAI.ts`
    - Tests: `CarnivoreAI.test.ts`

**Week 8: Population Dynamics**
21. **Population manager** - Track all species populations
    - Files: `src/entities/PopulationManager.ts`
    - Tests: `PopulationManager.test.ts`
    
22. **Competition system** - Resource competition, territorial behavior
    - Files: `src/entities/CompetitionSystem.ts`
    - Tests: `CompetitionSystem.test.ts`
    
23. **Species configuration UI** - Let user select AI species count
    - Files: `src/ui/components/SpeciesSelector.tsx`
    - Tests: Visual

**Week 9: Polish AI**
24. **Omnivore & other AI types** - Additional personalities
    - Files: `src/ai/OmnivoreAI.ts`, `src/ai/ParasiteAI.ts`, etc.
    - Tests: Per-type tests
    
25. **AI tuning** - Balance aggression, efficiency, survival rates
    - Tests: Playtesting, simulation runs

### Phase 4: Data Visualization (Weeks 10-12)
**Priority:** MEDIUM  
**Goal:** Rich data visualization for player insights

**Week 10: Core Visualizations**
26. **Population chart** - D3.js line chart of species populations over time
    - Files: `src/visualization/PopulationChart.ts`
    - Tests: Visual
    
27. **Evolution tree** - Hierarchical tree showing lineage
    - Files: `src/visualization/EvolutionTree.ts`
    - Tests: Visual
    
28. **Trait radar** - Radar chart comparing player to AI
    - Files: `src/visualization/TraitRadar.ts`
    - Tests: Visual

**Week 11: Additional Visualizations**
29. **Resource bars** - ATP, glucose, amino acids, phosphates
    - Files: `src/visualization/ResourceBars.ts`
    - Tests: Visual
    
30. **Biome heatmap** - Fitness visualization across lake
    - Files: `src/visualization/BiomeHeatmap.ts`
    - Tests: Visual

**Week 12: Visualization UI Integration**
31. **Dashboard layout** - Integrate all charts into HUD
    - Files: `src/ui/components/Dashboard.tsx`
    - Tests: Visual
    
32. **Export charts** - Export as PNG or SVG
    - Files: `src/visualization/ChartExporter.ts`
    - Tests: `ChartExporter.test.ts`

### Phase 5: Polish & Features (Weeks 13-16)
**Priority:** MEDIUM  
**Goal:** MVP-complete with all core features polished

**Week 13: Time Controls**
33. **Speed controls** - 1x, 10x, 100x, 1000x with UI
    - Files: `src/core/TimeController.ts`, `src/ui/components/SpeedControls.tsx`
    - Tests: `TimeController.test.ts`
    
34. **Pause/resume** - Pause game, open menus
    - Files: Update `src/core/GameLoop.ts`
    - Tests: Manual

**Week 14: Save/Load System**
35. **Save manager** - Save game state to IndexedDB
    - Files: `src/data/SaveManager.ts`, `src/data/Database.ts`
    - Tests: `SaveManager.test.ts`
    
36. **Load game** - Restore saved state
    - Tests: `SaveManager.test.ts` (continued)
    
37. **Autosave** - Save every 5 minutes
    - Files: Update `src/data/SaveManager.ts`
    - Tests: Integration test

**Week 15: Export/Import**
38. **Creature export** - Export as JSON
    - Files: `src/data/ExportService.ts`
    - Tests: `ExportService.test.ts`
    
39. **Evolution history export** - Export as CSV
    - Files: Update `src/data/ExportService.ts`
    - Tests: `ExportService.test.ts` (continued)
    
40. **Import creatures** - Load shared creatures
    - Files: Update `src/data/ExportService.ts`
    - Tests: Validation tests

**Week 16: Final Polish**
41. **Performance optimization** - Profile, fix bottlenecks
    - Files: Multiple optimizations
    - Tests: Performance benchmarks
    
42. **Tutorial system** - First-time user onboarding
    - Files: `src/ui/components/Tutorial.tsx`
    - Tests: Manual
    
43. **Settings panel** - Graphics quality, volume, controls
    - Files: `src/ui/components/SettingsPanel.tsx`
    - Tests: Visual

---

## AI Agent Instructions

### Setup Commands
```bash
# Initial setup (run once)
git clone <repo-url>
cd evolab
pnpm install

# Run development server
pnpm dev

# Open browser to http://localhost:5173
```

### Development Workflow

**For each new feature:**
1. **Create feature branch:** `git checkout -b feature/genetic-algorithm`
2. **Implement in this order:**
   - Data models / types (if needed)
   - Core business logic
   - Tests (REQUIRED - do NOT skip)
   - UI components (if needed)
   - Integration with existing systems
3. **Run tests:** `pnpm test`
4. **Run linter:** `pnpm lint`
5. **Format code:** `pnpm format`
6. **Commit:** `git commit -m "feat: add genetic algorithm with mutations"`
7. **Push:** `git push origin feature/genetic-algorithm`

### File Creation Rules

**ALWAYS:**
- Create tests alongside implementation (same directory or `tests/` folder)
- Follow project structure exactly (see "Project Structure" section)
- Use established patterns from existing code
- Add proper error handling with try/catch
- Include validation for user inputs
- Document complex logic with comments
- Use TypeScript strict mode (no `any` types)

**NEVER:**
- Skip tests (100% coverage goal for critical systems)
- Hardcode secrets or credentials (use environment variables)
- Create files outside project structure
- Use deprecated dependencies
- Ignore linting errors (fix them before committing)
- Mutate function parameters
- Use `any` type

### Critical Files (Do NOT modify without asking)
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Build configuration
- `.github/workflows/*` - CI/CD pipelines

### Security Requirements
- No secrets in code or git history
- Validate all user inputs (especially imported creatures)
- Sanitize exported data (no executable code in JSON)
- Use Content Security Policy headers
- Implement rate limiting for exports (prevent abuse)

### Performance Requirements
- 60 FPS at 1x speed with 200 entities
- 30 FPS at 100x speed with 200 entities
- < 3 second load time on 3G connection
- < 100MB memory usage (sustained)
- No memory leaks (use Chrome DevTools profiler)

### Error Handling Pattern
```typescript
// Synchronous functions
function processGenome(genome: Genome): ProcessedGenome {
  if (!genome || !genome.traits) {
    throw new Error('Invalid genome: missing traits');
  }
  
  try {
    const processed = applyMutations(genome);
    return validateGenome(processed);
  } catch (error) {
    console.error('Failed to process genome:', error);
    throw new Error(`Genome processing failed: ${error.message}`);
  }
}

// Asynchronous functions
async function saveCreature(creature: Creature): Promise<void> {
  try {
    await db.creatures.add(creature);
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Please delete old saves.');
    }
    console.error('Failed to save creature:', error);
    throw error;
  }
}
```

---

## Environment Configuration

### Required Environment Variables
```bash
# None required for core game (runs entirely in browser)

# Optional for analytics (production only)
VITE_ANALYTICS_ID=<umami-website-id>
VITE_ANALYTICS_URL=<umami-server-url>

# Optional for error tracking
VITE_SENTRY_DSN=<sentry-dsn>
```

### Local Development Setup
```bash
# No .env file needed for development
# Game works offline with no external services

# If using analytics:
cp .env.example .env
# Edit .env and fill in values
```

### Environment-Specific Settings

**Development:**
- Debug mode enabled
- Verbose logging
- Hot module replacement
- No minification

**Production:**
- Debug mode disabled
- Error logging only
- Minified + tree-shaken
- Code splitting

---

## Deployment

### Build Process
```bash
# Production build
pnpm build

# Output: dist/ directory
# Contains: index.html, assets/, fonts/, etc.
```

### Pre-Deployment Checklist
- [ ] All tests passing (`pnpm test`)
- [ ] No linting errors (`pnpm lint`)
- [ ] No TypeScript errors (`pnpm type-check`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Manual smoke test (play game for 5 minutes)
- [ ] Check bundle size (should be < 2MB)
- [ ] Verify no console errors in production build

### Deployment Command (Vercel)
```bash
# Deploy to production
vercel --prod

# Deploy preview (for PRs)
vercel
```

**Alternative: Netlify**
```bash
# Install Netlify CLI
pnpm add -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Rollback Procedure
**Vercel:**
1. Go to Vercel dashboard
2. Select project "evolab"
3. Go to "Deployments" tab
4. Find previous successful deployment
5. Click "..." menu → "Promote to Production"

**Netlify:**
1. Go to Netlify dashboard
2. Select site "evolab"
3. Go to "Deploys" tab
4. Find previous successful deploy
5. Click "Publish deploy"

---

## Troubleshooting

### Common Issues

**Issue:** PixiJS not rendering anything (blank canvas)  
**Solution:** 
- Check browser console for WebGL errors
- Verify canvas is added to DOM: `document.body.appendChild(app.view)`
- Check canvas size is not 0x0
- Try disabling browser extensions (some block WebGL)

**Issue:** Performance drops below 30 FPS  
**Solution:**
- Open Chrome DevTools → Performance tab → Record profile
- Look for long frames (> 33ms)
- Check if too many entities (reduce population)
- Verify spatial hashing is enabled
- Disable particle effects temporarily

**Issue:** IndexedDB quota exceeded  
**Solution:**
- Check storage usage: `navigator.storage.estimate()`
- Implement save rotation (keep only last 10 saves)
- Compress data before saving (use LZ-string)
- Prompt user to delete old saves

**Issue:** Genetic algorithm worker not responding  
**Solution:**
- Check worker file is being built: `ls dist/assets/ | grep worker`
- Verify worker is imported correctly: `new Worker('/genetics.worker.js')`
- Check browser console for worker errors
- Add timeout to worker messages (5 seconds)

**Issue:** TypeScript errors in production build  
**Solution:**
- Run `pnpm type-check` locally
- Fix all type errors before committing
- Verify `tsconfig.json` has `"strict": true`
- Check for implicit `any` types

### Debugging Commands
```bash
# Check TypeScript types
pnpm type-check

# Run tests with verbose output
pnpm test -- --reporter=verbose

# Build with source maps
pnpm build -- --sourcemap

# Analyze bundle size
pnpm build -- --mode=analyze

# Run specific test file
pnpm test src/genetics/GeneticAlgorithm.test.ts
```

---

## Dependencies

### Production Dependencies
```json
{
  "pixi.js": "^8.5.0",
  "matter-js": "^0.20.0",
  "d3": "^7.9.0",
  "zustand": "^4.5.0",
  "dexie": "^4.0.0",
  "react": "^18.3.0",
  "react-dom": "^18.3.0"
}
```

### Development Dependencies
```json
{
  "typescript": "^5.7.0",
  "vite": "^6.0.0",
  "@vitejs/plugin-react": "^4.3.0",
  "vitest": "^2.0.0",
  "playwright": "^1.40.0",
  "@types/react": "^18.3.0",
  "@types/react-dom": "^18.3.0",
  "@types/d3": "^7.4.0",
  "eslint": "^9.0.0",
  "prettier": "^3.0.0"
}
```

### Dependency Update Policy
- **Security updates:** Apply immediately
- **Minor updates:** Review changelog, test locally, update monthly
- **Major updates:** Evaluate breaking changes, plan migration, update quarterly
- **Pinned versions:** Yes (use exact versions in package.json)
- **Lockfile:** Committed to git (pnpm-lock.yaml)

**Update commands:**
```bash
# Check for updates
pnpm outdated

# Update to latest (respecting semver)
pnpm update

# Update specific package
pnpm update pixi.js --latest
```

---

## Additional Resources

**Documentation:**
- PixiJS v8: https://pixijs.com/docs
- Matter.js: https://brm.io/matter-js/docs/
- D3.js v7: https://d3js.org/
- Zustand: https://zustand-demo.pmnd.rs/
- Dexie.js: https://dexie.org/
- TypeScript 5.7: https://www.typescriptlang.org/docs/

**Tutorials:**
- PixiJS game loop: https://pixijs.com/tutorials/
- D3.js visualizations: https://observablehq.com/@d3/gallery
- Web Workers: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API

**Community:**
- GitHub Discussions: (to be created after repo setup)
- Discord: (to be created if community grows)
- Reddit: r/gamedev, r/proceduralgeneration

**Reference Projects (Open Source):**
- Thrive (evolution simulator): https://github.com/Revolutionary-Games/Thrive
- agar.io clone: https://github.com/huytd/agar.io-clone
- Genetic algorithms in JS: https://github.com/subprotocol/genetic-js

---

## AI Agent Checklist

Before marking any feature as "complete," verify:

- [ ] **Code quality:**
  - [ ] No TypeScript errors (`pnpm type-check`)
  - [ ] No linting errors (`pnpm lint`)
  - [ ] Code is formatted (`pnpm format`)
  - [ ] No `any` types
  - [ ] No unused variables
  
- [ ] **Tests:**
  - [ ] Unit tests written and passing
  - [ ] Coverage target met (80%+)
  - [ ] Edge cases tested
  - [ ] Error handling tested
  
- [ ] **Documentation:**
  - [ ] Complex logic has comments
  - [ ] Public functions have JSDoc
  - [ ] README updated (if needed)
  - [ ] CHANGELOG updated
  
- [ ] **Performance:**
  - [ ] No performance regressions
  - [ ] Memory leaks checked
  - [ ] Frame rate acceptable (60 FPS target)
  
- [ ] **Integration:**
  - [ ] Feature integrates with existing systems
  - [ ] No breaking changes to public APIs
  - [ ] UI components render correctly
  
- [ ] **Security:**
  - [ ] No hardcoded secrets
  - [ ] User input validated
  - [ ] No XSS vulnerabilities

---

**This document is the single source of truth for implementation.**  
**All technical decisions, patterns, and requirements are defined here.**

**Last Updated:** November 15, 2025
