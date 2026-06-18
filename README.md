# 🧬 EvoLab — Browser-Based Evolution Simulator

**An open-source, browser-based evolution simulator built with TypeScript, React, and PixiJS.** Design species, watch them evolve through natural selection, and explore the science of life with real-time data visualizations.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue)](https://www.typescriptlang.org/)
[![PixiJS](https://img.shields.io/badge/PixiJS-8.5-ff69b4)](https://pixijs.com/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/tests-Vitest-yellow)](https://vitest.dev/)

---

## What Is This?

EvoLab is an **artificial-life game and evolution simulator** that runs entirely in your browser. You control a single-celled organism in a procedurally generated lake, collect resources, reproduce, and watch your species adapt over generations. Compete against AI-driven herbivores, carnivores, and omnivores across 12 distinct biomes — all rendered with PixiJS and backed by a 55+ trait genetics system.

**Who it's for:** biology students, educators, game designers, simulation enthusiasts, and anyone curious about how evolution works.

**Core loop:** move → collect glucose → manage ATP → reproduce → edit traits → watch generations diverge → inspect data.

**Tech stack:** React 19 · TypeScript 6 · Vite 8 · PixiJS 8.5 · D3 7 · Matter.js 0.20 · Tone.js 15 · Dexie 4 · Vitest 4

---

## Features

### 🌱 Phase 1 — MVP Foundation

- **Cell Stage Gameplay** — Control a single-celled organism in a 2000×1500 pixel lake
- **ATP Energy System** — Energy drains based on size and metabolism; collect glucose to survive
- **WASD Controls** — Smooth, velocity-based movement with physics
- **Real-time HUD** — Track ATP, health, glucose collected, and position
- **Boundary Constraints** — Lake edges prevent organisms from escaping

### 🧬 Phase 2 — Genetics & Evolution

- **55+ Genetic Traits** across 7 categories: Energy & Metabolism, Physical Stats, Senses, Behavioral, Special Abilities, Resource Collection, Environmental Adaptation
- **Reproduction System** — Meet requirements (70% ATP, compounds, maturity) to spawn offspring
- **Trait Editor UI** — Spend DNA points earned from survival to modify traits (max ±2 points per generation)
- **Genetic Mutations** — Automatic mutations with a 15% rate and ±15% magnitude (beneficial bias)
- **Trait Interconnections** — Size affects speed, armor reduces mobility, intelligence boosts senses
- **Generation Tracking** — Lineage history, mutation changelog, DNA point accumulation, post-reproduction reports

### 🌍 Phase 3 — AI & Environment

- **12 Procedural Biomes** via Perlin noise — Shallow Warm, Shallow Cold, Deep Warm, Deep Cold, Toxic, Nutrient Rich, Barren, Volcanic, Frozen, Swamp, Crystal, Abyss
- **Dynamic Environment** — Temperature, depth, nutrients, toxicity, light, pH, pressure, ocean currents
- **3 AI Species** with distinct behaviors:
  - **Herbivores** (green) — small, fast, flee from predators
  - **Carnivores** (red) — aggressive, hunt in packs with coordinated attacks
  - **Omnivores** (orange) — opportunistic, attack weak prey or gather resources
- **Learning AI** — Adapts to player strategies, tracks successful tactics
- **Combat System** — Predator-prey interactions with damage, armor, and toxins
- **Day/Night Cycle** — 24-hour cycle with 4 time periods and dynamic lighting
- **Population Management** — Auto-spawning, lifecycle management, configurable caps

### 📊 Phase 4 — Data Visualization & Polish

- **D3.js Visualizations** — Population graph (100+ generations), phylogenetic evolution tree, trait radar chart
- **Time Control** — 1×, 10×, 100×, 1000× speed; pause; step mode for frame-by-frame analysis
- **Save/Load System** — IndexedDB persistence, auto-save every 5 minutes, JSON export/import
- **Creature Export/Import** — Share evolved organisms as JSON with full genome data
- **CSV Data Export** — Generation statistics, population trends (Excel/Sheets compatible)
- **Settings Panel** — Graphics quality, display toggles, audio controls, auto-save configuration
- **Tutorial System** — 11-step interactive guide covering mechanics, controls, and strategies
- **Adaptive Music** — 12 biome-specific soundscapes, combat intensity response, day/night integration
- **Achievements** — 23 achievements across 6 categories with rarity tiers and secret unlocks
- **Timed Challenges** — 4 challenges with DNA point rewards

---

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) v26 or later
- [npm](https://www.npmjs.com/) (included with Node.js)

### Clone and Install

```bash
git clone https://github.com/simon/EvoLab.git
cd EvoLab
npm install
```

---

## Quick Start

Start the development server:

```bash
npm run dev
```

Open your browser to the URL shown in the terminal (typically `http://localhost:5173`). You'll see the main menu — select **New Game** to begin.

### Other Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run tests with Vitest |
| `npm run lint` | Lint TypeScript with ESLint |
| `npm run format` | Format source with Prettier |
| `npm run type-check` | Run TypeScript compiler without emitting |

---

## Usage

### Controls

| Key | Action |
|-----|--------|
| **W / A / S / D** | Move your organism |
| **Space** | Reproduce (when requirements are met) |
| **T** | Open Trait Editor |
| **Escape** | Pause / Open Menu |
| **1 / 2 / 3 / 4** | Set simulation speed (1× / 10× / 100× / 1000×) |

### Playing the Game

1. **Survive** — Move around the lake and collect glowing glucose particles to maintain ATP.
2. **Grow** — As you collect resources, your organism gains mass and earns DNA points.
3. **Reproduce** — Once you meet reproduction requirements (70% ATP, required compounds, sufficient maturity), press Space to spawn offspring.
4. **Evolve** — Use the Trait Editor to spend DNA points on traits before reproducing. Traits carry over to the next generation with possible mutations.
5. **Compete** — AI species share the lake. Carnivores will hunt you; herbivores compete for resources.
6. **Analyze** — Open the Statistics Dashboard to view population graphs, evolution trees, and trait radar charts. Export data to CSV for deeper analysis.

### Saving Your Progress

- Saves are stored automatically in your browser via IndexedDB (every 5 minutes by default).
- Access **Save/Load** from the main menu to manage save slots.
- **Export** a simulation as JSON to share or back up.

---

## Project Structure

```
EvoLab/
├── src/
│   ├── main.ts              # Entry point
│   ├── core/                # Simulation engine, game loop, state management
│   ├── entities/            # Organism, AI species, resources
│   ├── genetics/            # Trait system, mutations, reproduction
│   ├── physics/             # Matter.js integration, collision detection
│   ├── rendering/           # PixiJS rendering, biome tiles, effects
│   ├── environment/         # Biome generation, day/night cycle, hazards
│   ├── ai/                  # AI behaviors, pack mechanics, learning
│   ├── ui/                  # React components (HUD, menus, trait editor)
│   ├── audio/               # Tone.js procedural music system
│   ├── achievements/        # Achievement tracking and notifications
│   ├── data/                # Constants, biome definitions, trait configs
│   ├── events/              # Event system for decoupled communication
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Shared utilities
├── tests/                   # Vitest test suites
├── docs/                    # Agent law and additional documentation
├── Dev Docs/                # Product specs, roadmap, technical docs
├── vite.config.ts           # Vite configuration
├── vitest.config.ts         # Test configuration
├── tsconfig.json            # TypeScript configuration
└── eslint.config.js         # ESLint configuration
```

---

## FAQ

### Does EvoLab work on mobile?

EvoLab is designed for desktop browsers with keyboard controls. Mobile support is not currently implemented.

### Which browsers are supported?

Any modern browser with WebGL2 support: Chrome, Firefox, Safari, and Edge (latest versions).

### How do I reset the simulation?

From the main menu, select **New Game** to start fresh. Existing saves are preserved unless you overwrite them.

### Can I contribute a new biome or trait?

Yes. Biome definitions live in `src/data/` and traits are configured in `src/genetics/`. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Where is my save data stored?

Saves are stored in your browser's IndexedDB database. Clearing browser data will remove saves. Use the export feature to back up simulations as JSON files.

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Install dependencies: `npm install`
4. Make your changes and add tests
5. Run checks: `npm run lint && npm test && npm run type-check`
6. Commit with a descriptive message
7. Open a pull request against `main`

### Development Guidelines

- Write TypeScript with strict mode
- Add tests for new features in the `tests/` directory
- Follow the existing code style (enforced by ESLint and Prettier)
- Keep pull requests focused — one feature or fix per PR

---

## License

EvoLab is released under the [MIT License](LICENSE).

```
MIT License

Copyright (c) 2025 Simon

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

Built with 🧬 by the EvoLab community.