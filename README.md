# 🧬 EvoLab - Evolution Simulator

**Play evolution in your browser.** Design species, watch them evolve through natural selection, and explore the science of life with detailed data visualizations.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![PixiJS](https://img.shields.io/badge/PixiJS-8.5-ff69b4)](https://pixijs.com/)

---

## ✨ Features

### Phase 1 - MVP Foundation ✅
- 🧬 **Cell Stage Gameplay** - Control a single-celled organism in a procedurally generated lake
- ⚡ **ATP Energy System** - Manage energy that drains based on size and metabolism
- 🍬 **Resource Collection** - Collect glucose particles to restore ATP and survive
- 🎮 **WASD Controls** - Smooth, responsive movement with velocity physics
- 📊 **Real-time HUD** - Track ATP, health, glucose collected, and position
- 🌊 **Lake Environment** - Explore a 2000x1500 pixel lake with boundary constraints

### Phase 2 - Genetics & Evolution ✅
- 🧬 **55+ Genetic Traits** - Comprehensive trait system across 7 categories
  - Energy & Metabolism, Physical Stats, Senses, Behavioral, Special Abilities, Resource Collection, Environmental Adaptation
- 🔬 **Reproduction System** - Meet requirements (70% ATP, compounds, maturity) to evolve
- 🎨 **Trait Editor UI** - Interactive React interface for directed evolution
  - Spend DNA points (earned from survival) to modify traits
  - Max ±2 points per generation per trait
  - Real-time cost calculation and visual feedback
- 🧪 **Genetic Mutations** - Automatic mutations with beneficial bias (15% rate, ±15% magnitude)
- 📈 **Generation Tracking** - Lineage history, mutation changelog, DNA point accumulation
- 🎯 **Trait Interconnections** - Size affects speed, armor reduces mobility, intelligence boosts senses
- 📊 **Generation Reports** - Post-reproduction summary with stats and mutations

### Phase 3 - AI & Environment ✅
- 🌍 **Procedural Biome Generation** - 7 distinct zones using Perlin noise
  - Shallow Warm, Shallow Cold, Deep Warm, Deep Cold, Toxic, Nutrient Rich, Barren
  - Dynamic properties: temperature, depth, nutrients, toxicity, light, pH, pressure
- 🤖 **3 AI Species** - Competing organisms with distinct behaviors
  - **Herbivores** (green): Small, fast, flee from predators, seek resources
  - **Carnivores** (red): Medium, aggressive, hunt smaller cells
  - **Omnivores** (orange): Balanced, opportunistic, attack weak prey or gather resources
- ⚔️ **Combat System** - Predator-prey interactions with damage, armor, toxins
- 👥 **Population Management** - Auto-spawning, lifecycle management, max population caps
  - 15 Herbivores, 8 Carnivores, 10 Omnivores (max populations)
- ☀️ **Day/Night Cycle** - 24-hour cycle with 4 time periods (dawn, day, dusk, night)
  - Dynamic lighting (0.3-1.0), ambient colors, 10x speed by default
- 🎨 **Visual Biome Rendering** - Tile-based rendering with dynamic visibility
  - Only renders visible tiles around camera for performance
  - Lighting effects based on day/night cycle

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or npm/pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/evolab.git
cd evolab

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open http://localhost:5173 and start evolving!

---

## 🎮 Controls

| Key | Action |
|-----|--------|
| `W` `A` `S` `D` | Move cell |
| `Space` | Pause game (coming soon) |

**Objective:** Collect yellow glucose particles to restore ATP. Don't let your ATP reach zero or your cell dies!

---

## 📁 Project Structure

```
evolab/
├── src/
│   ├── core/           # Core game systems
│   │   ├── Config.ts   # Game configuration
│   │   ├── GameLoop.ts # Main game loop
│   │   └── InputHandler.ts
│   ├── rendering/      # PixiJS rendering
│   │   └── PixiApp.ts
│   ├── entities/       # Game entities
│   │   ├── Cell.ts     # Cell entity
│   │   ├── Resource.ts # Resource particles
│   │   └── EntityManager.ts
│   ├── types/          # TypeScript definitions
│   └── main.ts         # Entry point
├── public/             # Static assets
├── Dev Docs/           # Comprehensive documentation
└── index.html          # HTML entry point
```

---

## 🛠️ Development

```bash
# Run dev server
npm run dev

# Type check
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview

# Format code
npm run format

# Lint code
npm run lint
```

---

## 📚 Documentation

See the [Dev Docs](Dev%20Docs/) directory for comprehensive documentation:

- **01-executive-summary.md** - Project overview and vision
- **02-technical-specification.md** - Complete technical guide
- **03-product-requirements.md** - Feature specifications
- **04-roadmap.md** - Development timeline (16-week MVP)
- **05-monetization-audit.md** - Revenue strategy (open core + SaaS)
- **06-launch-checklist.md** - Launch preparation guide

---

## 🔮 Roadmap

### Phase 1 - Foundation ✅
- ✅ Basic cell movement and controls
- ✅ ATP energy system
- ✅ Resource collection (glucose)
- ✅ Real-time HUD

### Phase 2 - Genetics & Evolution ✅
- ✅ 55+ trait system (speed, size, armor, metabolism, intelligence, etc.)
- ✅ Genetic algorithm with mutations (15% rate, beneficial bias)
- ✅ Reproduction system (ATP, compound, maturity requirements)
- ✅ Trait editor UI (React, interactive sliders, DNA point system)
- ✅ Generation tracking and lineage history
- ✅ Compound collection (glucose, amino acids, phosphates)

### Phase 3 - AI & Environment ✅
- ✅ AI-controlled competing species (Herbivore, Carnivore, Omnivore)
- ✅ Procedural biome generation (7 distinct zones with Perlin noise)
- ✅ Day/night cycle (configurable speed, lighting effects)
- ✅ Population dynamics (auto-spawning, max population limits)
- ✅ Combat system (predator-prey interactions, damage calculation)
- ✅ Biome-based environment (temperature, depth, nutrients, toxicity, pH)

### Phase 4 - Data Visualization & Polish
- 🔜 D3.js charts (population, evolution tree, trait radar)
- 🔜 Time controls (1x, 10x, 100x, 1000x speed)
- 🔜 Save/load system
- 🔜 Creature export/import (JSON)

---

## 🧪 Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | TypeScript 5.7 + Vite 6 | Type safety, fast HMR |
| Rendering | PixiJS v8 (WebGL) | GPU-accelerated 2D graphics |
| Physics | Matter.js (planned) | Realistic movement and collisions |
| Data Viz | D3.js (planned) | Evolution trees, population graphs |
| State | Zustand (planned) | Lightweight state management |
| Database | Dexie.js (planned) | Browser-native storage |

---

## 🎓 Educational Use

EvoLab is designed for biology education (ages 12+):

- Teaches natural selection, genetic inheritance, and adaptation
- Provides real-time data visualization of evolutionary principles
- Aligns with NGSS (Next Generation Science Standards)
- Free and open source - no installation or licenses required

Perfect for classrooms, homeschooling, and curious learners!

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines (coming soon).

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

Free for educational and commercial use.

---

## 🙏 Acknowledgments

- Inspired by [Spore](https://www.spore.com/) and [Thrive](https://revolutionarygamesstudio.com/)
- Built with [PixiJS](https://pixijs.com/), [TypeScript](https://www.typescriptlang.org/), and [Vite](https://vite.dev/)

---

**Made with ❤️ for science education and open source**

*Last Updated: November 15, 2025*
