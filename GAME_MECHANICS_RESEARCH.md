# Game Mechanics Research
## Planetary Simulation & Evolution Games Analysis

**Research Date:** November 16, 2025
**Purpose:** Identify features and mechanics from similar games that could enhance EvoLab

---

## 🎮 Games Researched

1. **Gaia Maker** - Planet terraforming simulation (2024, Rust-based)
2. **TerraGenesis** - Mobile terraforming game with scientific accuracy
3. **SimEarth** - Classic planetary life simulation (1990, Maxis)
4. **Planetary Life** - Evolution sandbox from cells to civilizations (Early Access)

---

## 1. Gaia Maker

### Overview
A planet-wide terraforming simulation based on real physics and geology where players reshape barren planets into life-filled worlds.

### Core Mechanics

#### **Physics-Based Planetary Simulation**
- **Atmospheric Composition** - Dynamic simulation of gas mixtures and chemical reactions
- **Carbon Cycle** - Realistic carbon dioxide/oxygen balance modeling
- **Temperature Regulation** - Planet-wide thermal simulation based on insolation
- **Biomass Tracking** - Measures total organic matter across the planet
- **Insolation System** - Solar radiation modeling affects temperature and energy

#### **Advanced Technologies**
- **Dyson Swarm** - Construct megastructures to harvest stellar energy
- **Giant Mirrors** - Deploy massive orbital mirrors to regulate sunlight reaching the planet
- **Oxygen Generators** - Produce breathable atmosphere through industrial processes
- **Aerosol Injection** - Modify atmospheric properties through particle dispersal
- **Fusion Reactors** - Generate energy for terraforming operations

#### **Life Systems**
- **Animal Breeding** - Foster and manage wildlife populations
- **Habitat Expansion** - Grow ecosystems across different planetary zones
- **Civilization Simulation** - Watch civilizations evolve and impact the planet
- **Extinction Events** - Option to destroy or preserve civilizations

#### **Planetary Variety**
- Multiple distinct planet types to terraform
- Each planet has unique starting conditions and challenges

### Potential Integration with EvoLab

#### ✅ **Highly Applicable**
1. **Atmospheric Composition System**
   - Track oxygen, CO2, nitrogen levels in your lake/ocean environment
   - Affect organism respiration and photosynthesis
   - Add suffocation hazard in low-oxygen zones

2. **Carbon Cycle Mechanics**
   - Plants consume CO2, produce oxygen
   - Decomposition returns carbon to environment
   - Player's metabolism affects local gas composition

3. **Temperature/Insolation Modeling**
   - Already have day/night cycle - could add seasonal variations
   - Solar intensity affects plant growth rates
   - Temperature gradients create migration patterns

4. **Biomass Tracking**
   - Measure total organic matter in ecosystem
   - Track population health via biomass trends
   - Victory conditions based on biomass thresholds

#### 🟡 **Moderately Applicable**
5. **Energy Budget System**
   - Limited "evolution points" or "divine intervention" budget
   - Players must choose which environmental changes to make
   - Adds strategic resource management layer

6. **Habitat Expansion**
   - Unlock new biomes as player evolves
   - Creatures can terraform their environment (e.g., plants oxygenate water)
   - Ecosystem engineering as advanced gameplay

#### ❌ **Less Applicable**
- Dyson Swarms, Giant Mirrors (too macro-scale for cellular game)
- Civilization destruction (current scope is pre-sentient life)

---

## 2. TerraGenesis

### Overview
Mobile terraforming game with scientific accuracy, allowing players to transform planets into habitable worlds with detailed atmospheric controls.

### Core Mechanics

#### **Faction System**
- **United Nations Space Administration (UNSA)** - Goals: Independence + 500M population
- **Horizon Corporation** - Goals: Accumulate 1 billion credits (capitalist)
- **Daughters of Gaia** - Goals: Perfect terraforming into habitable worlds
- **Sons of Hephaestus** - Goals: Anti-terraforming, maintain ±5% of original stats
- **Far-Future Institute (FFI)** - Specializes in extreme environment terraforming

Each faction offers unique advantages:
- Tech speed bonuses
- Resource efficiency multipliers
- Biological growth specializations

#### **Precise Environmental Parameters**

**Temperature Control**
- Measured in microkelvins (1/1000th of a degree Kelvin)
- Plants require: 200,000 - 374,000 µK
- Animals/Humans require: 237,000 - 337,000 µK
- Narrower range for higher life forms

**Atmospheric Pressure**
- Measured in Pascals (Pa)
- Microbes/Plants habitable: 10,000 - 190,000 Pa
- Animals/Humans habitable: 50,000 - 150,000 Pa
- Temperature increases by 0.046 mK per pascal (interconnected systems!)
- Minimum 600 Pa required to build water supply

**Water Management**
- Can only accumulate water above 600 Pa pressure threshold
- Essential for biomass growth
- Limited by planetary conditions

**Biomass Growth**
- Requires balance of temperature, pressure, oxygen, water
- Necessary before reaching full habitability
- Acts as victory condition indicator

#### **Idle Progression System**
- Game progresses while player is offline
- Rewards checking in regularly
- Long-term optimization encouraged
- Balances active and passive gameplay

#### **Random Events**
- Asteroid strikes
- Plague outbreaks
- Environmental collapses
- Crisis decision-making tests preparedness
- Choices have lasting consequences

#### **Planetary Variety**
- Mars, Venus, icy moons, dwarf planets
- Imaginative alien worlds
- Each with unique challenges

### Potential Integration with EvoLab

#### ✅ **Highly Applicable**

1. **Faction/Playstyle System**
   - **"Natural Selection" Faction** - Let evolution run wild, minimal intervention
   - **"Intelligent Design" Faction** - Actively guide evolution with trait editing
   - **"Destroyer" Faction** - Create hostile environment, survival challenge
   - **"Balancer" Faction** - Maintain ecosystem equilibrium
   - Each unlocks unique achievements and bonuses

2. **Precise Environmental Parameters**
   - Add numerical ranges to your existing biome properties
   - Temperature: Cold (<10°C), Temperate (10-30°C), Hot (>30°C) with exact values
   - Pressure: Could simulate depth pressure in deep water zones
   - Create "sweet spots" where life thrives vs struggles

3. **Interconnected Environmental Systems**
   - Already have toxicity, temperature, depth, pH
   - Add formula: "Pressure affects oxygen solubility"
   - "Temperature affects metabolism rate" (already partially implemented)
   - "pH affects nutrient availability"
   - Create cascading effects from single changes

4. **Water/Resource Management**
   - Threshold-based resource availability
   - "Nutrients only spawn above certain biomass levels"
   - "Glucose concentration depends on plant population"
   - Dynamic resource systems rather than static spawning

5. **Random Events System**
   - Asteroid impacts that create new biomes or destroy areas
   - Disease outbreaks that target specific traits (high-speed creatures tire faster)
   - Algae blooms that temporarily increase food but decrease oxygen
   - Volcanic activity that warms water but adds toxicity
   - Player must adapt or perish

#### 🟡 **Moderately Applicable**

6. **Idle Progression**
   - Already have simulation speed controls (1x, 10x, 100x, 1000x)
   - Could add "evolution continues while game closed" option
   - Offline rewards for long-term players
   - Daily login bonuses (DNA points, unique mutations)

#### ❌ **Less Applicable**
- Credit-based economy (no currency in EvoLab)
- Building cities (pre-civilization scope)
- Space colonization (single-planet focus)

---

## 3. SimEarth: The Living Planet

### Overview
Classic 1990 Maxis game designed by Will Wright. Incorporates James Lovelock's Gaia hypothesis - the planet as a self-regulating living system. Players control planetary development from formation to space-faring civilizations.

### Core Mechanics

#### **Gaia Hypothesis Integration**
- **Self-Regulating Systems** - Biology and geology are interconnected
- **Stable Perturbation Resistance** - Systems naturally return to equilibrium
- **Holistic Modeling** - Can't treat biology or geology in isolation
- Lovelock advised: "Simple models are oversensitive to initial conditions, but Gaia models linking biology and geology create stability"

#### **Biome System**
Biome type determined by temperature + humidity:
- Boreal (cold, wet)
- Desert (hot, dry)
- Grassland (temperate, moderate)
- Forest (temperate, wet)
- Jungle (hot, wet)
- Swamp (warm, very wet)
- Ocean, Ice, Tundra variants

Each organism type has biome preferences - e.g., Carniferns can live in boreal, desert, grassland, forest, jungle, swamp.

#### **Energy Budget System**
- **Game Mode** - Limited energy budget, must manage resources carefully
- **Experimental Mode** - Unlimited energy for pure creativity
- Energy constrains what actions player can take
- More advanced civilizations use energy more efficiently

#### **Civilization Development**
7 Technology Stages:
1. **Stone Age** - Basic tools, hunter-gatherers
2. **Bronze Age** - Early metallurgy
3. **Iron Age** - Advanced tools
4. **Industrial Age** - Machines, pollution begins
5. **Atomic Age** - Nuclear power, radiation risk
6. **Information Age** - Computers, efficiency improvements
7. **Nanotech Age** - Peak technology

**Exodus Event** - When civilization reaches peak Nanotech Age, entire population launches into space, removing species from planet and allowing others to evolve sentience.

#### **Unique Life Forms**

**Carniferns** (Carnivorous Plants)
- Mutated plants that eat meat
- Only appear naturally when there's an abundance of insects
- Can develop intelligence like animals
- Live in diverse biomes (boreal, desert, grassland, forest, jungle, swamp)

**Machine Life (Robots)**
- Appear when Nanotech Age city is destroyed by nuclear explosion
- Can live in ANY biome (immune to environmental conditions)
- Reproduce very quickly
- Start at Industrial Age instead of Stone Age (huge advantage)
- Generally out-compete all biological life
- Can also achieve sentience and build civilizations

#### **Sentience Development**
Any multicellular organism can become intelligent. Likelihood ranking:
1. **Most Likely** - Mammals, Dinosaurs, Birds, Reptiles
2. **Moderate** - Cetaceans, Insects, Amphibians, Carniferns
3. **Least Likely** - Fish, Arthropods, Mollusks, Radiates

#### **Scenarios**
- **Mars Terraforming** - Make the red planet habitable
- **Modern Earth** - Solve climate change and pollution
- **Daisyworld** - Test Lovelock's hypothesis with simple ecosystem
- **Cambrian Era** - Watch explosion of life
- **Ice Age** - Survive climate extremes

#### **Game Modes**
- **Game Mode** - Resource management, achieve goals
- **Experimental Mode** - Sandbox, unlimited power

### Potential Integration with EvoLab

#### ✅ **Highly Applicable**

1. **Gaia Hypothesis - Self-Regulating Ecosystems**
   - **Negative Feedback Loops**:
     - Too many herbivores → resources depleted → herbivore die-off → resources recover
     - Predator overpopulation → prey scarcity → predator starvation → balance restored
   - **Positive Feedback Loops**:
     - Plants increase oxygen → more animals supported → more CO2 produced → more plants grow
   - **Equilibrium Seeking**: Ecosystem trends toward stable states
   - **Resilience**: System recovers from player interference

2. **Temperature + Humidity Biome Determination**
   - Currently have static biomes (Shallow Warm, Deep Cold, etc.)
   - **Dynamic Biomes**: Change based on environmental parameters
   - Formula: `biome = f(temperature, depth, nutrients, light)`
   - Biomes shift as conditions change (melting frozen zones, expanding swamps)

3. **Sentience Development System**
   - **Long-term goal**: Creatures evolve intelligence stat
   - **Sentience Threshold**: At intelligence > 80, creature develops sapience
   - **Tool Use**: Sentient creatures start modifying environment
   - **Civilization Stage**: Build simple structures, communicate
   - **Technology Tree**: Progress from Stone Age → Bronze → Iron → Industrial
   - **Victory Condition**: Guide creature to sentience and space travel

4. **Energy Budget Game Mode**
   - **"God Points" System**: Limited intervention currency
   - **Earn Points**: By letting simulation run, achieving milestones
   - **Spend Points**: Environmental changes, mutations, disasters
   - **Game Mode vs Sandbox Mode**:
     - Game Mode: Strategic resource management
     - Sandbox Mode: Unlimited DNA points, no restrictions (already have this)

5. **Unique Life Forms**
   - **Photosynthetic Animals** - Like carniferns but opposite
   - **Parasitic Organisms** - Live inside other creatures
   - **Colonial Organisms** - Operate as swarms
   - **Extremophiles** - Thrive in toxic/extreme biomes
   - Each with unique traits and behaviors

6. **Scenario-Based Challenges**
   - **"Toxic Cleanup"** - Reduce toxicity to safe levels
   - **"Ice Age Survival"** - Survive 100 generations in frozen biome
   - **"Diversity Challenge"** - Have 5 different species coexist
   - **"Speed Run"** - Reach generation 50 in under 10 minutes
   - **"Extinction Recovery"** - Repopulate after 90% die-off

#### 🟡 **Moderately Applicable**

7. **Biome Transition Mechanics**
   - Currently biomes are static tiles
   - **Gradual Transitions**: Biomes blend at borders
   - **Seasonal Changes**: Temporary biome shifts
   - **Player-Driven Changes**: Creatures can terraform (e.g., plants cooling hot zones)

8. **Multiple Sentient Species Competition**
   - If multiple AI species evolve sentience
   - Territorial conflicts over resources
   - Technology race
   - Diplomatic or warlike interactions

#### ❌ **Less Applicable**
- Nuclear weapons and radiation (too advanced for cellular stage)
- Space travel and exodus (beyond current scope)
- Continental drift and tectonic plates (too macro-scale)

---

## 4. Planetary Life

### Overview
Early Access sandbox evolution game combining SimEarth and Spore mechanics. Players design life from single cells to civilizations through a detailed cell creator and evolution system.

### Core Mechanics

#### **Cell Creator System**
- **Combine Cell Types** - Build organisms by mixing different cellular components
- **Single-Cell Life** - Start with basic prokaryotes/eukaryotes
- **Multicellular Progression** - Combine cells into specialized tissues
- **Macroscopic Transition** - Bridge from microscopic to visible creatures
- **Plant Evolution** - Separate track for photosynthetic organisms

#### **Evolution Stages**

**Stage 1: Cell Stage**
- Create organisms by combining different cell types
- Design internal cellular structure
- Choose metabolic pathways (aerobic, anaerobic, photosynthetic)

**Stage 2: Creature Stage**
- Design body plans with various parts
- Limbs, armor, weapons, sensory organs
- **Direct Upgrade Problem**: Some body parts are strictly better than others
  - Horns and shells give damage/defense with no downsides
  - Linear progression rather than trade-offs
  - Criticized for lack of meaningful choices

**Stage 3: Tribal Stage**
- Intelligent creatures organize into tribes
- Basic social structures
- Resource gathering as groups

**Stage 4: Civilization Stage**
- Manage technological progress
- Battle for planetary dominance
- Build cities and infrastructure

#### **Mutation System**
- **Random Mutations** - Automatic evolutionary changes
- **Customizable Frequency** - Adjust how often mutations occur
- **Mutation Disable Option** - Turn off randomness for pure design
- **Player Control** - Balance between design and emergence

#### **Planet Manipulation**
- **Terrain Sculpting** - Shape mountains and seas
- **Climate Control** - Modify temperature, precipitation
- **Tectonic Activity** - Control volcanic eruptions, earthquakes
- **Atmospheric Editing** - Change gas composition
- **Core Heat Adjustment** - Affects geological activity

#### **Ecosystem Balance**
- Track relationships between species
- Food webs and energy flow
- Extinction cascades if balance breaks
- Goal: Create sustainable ecosystems

### Criticisms & Design Lessons

**Linear Evolution Problem**
- Current implementation: certain traits are strictly optimal
- Everything evolves horns + shells because they're pure upgrades
- Lacks meaningful trade-offs (speed vs armor, size vs metabolism)

**Lack of Environmental Pressure**
- Mutations don't respond to environment
- Best traits are always best regardless of context
- Missing: cold-adapted creatures differ from hot-adapted

**Designer Fatigue**
- Player must manually design every species
- Auto-evolution produces samey results
- Needs better procedural generation

### Potential Integration with EvoLab

#### ✅ **Highly Applicable**

1. **Multi-Stage Evolution Progression**
   - EvoLab currently focuses on single-cell stage
   - **Future Expansion Path**:
     - Stage 1: Microbe (current game)
     - Stage 2: Multicellular creature (add body plan designer)
     - Stage 3: Tribal (social behaviors)
     - Stage 4: Civilization (technology)
   - Each stage unlocks after achieving milestones

2. **Customizable Mutation Frequency**
   - Currently mutations are fixed 15% rate, ±15% magnitude
   - **Settings Panel Addition**:
     - Mutation Rate: 0-50% slider
     - Mutation Magnitude: ±5% to ±30%
     - Beneficial Bias: 0-100% (currently ~60%)
     - Lethal Mutation Chance: 0-10%
   - Player can dial up/down randomness vs control

3. **Environment-Responsive Mutations**
   - **Avoid Planetary Life's mistake** of context-free evolution
   - **EvoLab Advantage**: Already have biomes affecting survival
   - **Enhancement**: Mutations favor traits suited to current biome
     - In cold biomes: +metabolism, +insulation traits more common
     - In toxic biomes: +toxin resistance, +armor mutations more frequent
     - In nutrient-rich: +size, +reproduction rate more likely
   - Creates divergent evolution in different zones

4. **Auto-Evolution vs Manual Design Toggle**
   - **Current**: Player manually edits traits in Trait Editor
   - **Enhancement**: Add "Auto-Evolve" button
     - AI suggests optimal trait changes for current environment
     - Player can accept, reject, or modify
     - Learns from player's past choices
   - Reduces designer fatigue while maintaining player agency

5. **Planet Manipulation Tools** (God Mode)
   - Currently biomes are procedurally generated once
   - **Add Divine Intervention Tools**:
     - Raise/Lower Depth: Create new shallow or deep zones
     - Warm/Cool Water: Shift temperature gradients
     - Add/Remove Toxins: Cleanup or pollute areas
     - Nutrient Injection: Trigger blooms in barren zones
     - Create Currents: Set water flow direction
   - Cost "God Points" in Game Mode, free in Sandbox

#### 🟡 **Moderately Applicable**

6. **Trait Trade-Off System** (Learn from Planetary Life's flaw)
   - **Problem in Planetary Life**: Horns = pure damage upgrade, no downside
   - **EvoLab Already Does Better**:
     - Armor reduces speed
     - Size increases damage but drains ATP faster
     - Intelligence boosts senses but costs energy
   - **Keep This Design Philosophy**: Every buff has a cost
   - **Add More Trade-Offs**:
     - Toxin production: damage enemies but drain ATP
     - Bioluminescence: attract food but also predators
     - Thick membrane: resist pressure but slower nutrient absorption

7. **Cell Designer (Future Feature)**
   - Currently creatures are colored circles with stats
   - **Phase 5 Addition**: Visual creature designer
     - Add organelles: chloroplasts, flagella, cilia
     - Shape: spherical, elongated, irregular
     - Membrane types: smooth, spiny, thick
   - Appearance affects gameplay (spiny = armor, flagella = speed)

#### ❌ **Less Applicable**
- Civilization stage technology trees (too far from current scope)
- Manual creature design replacing procedural generation (EvoLab's strength is emergence)

---

## 🎯 Summary: Top Mechanics for EvoLab Integration

### Tier 1: Implement Soon (High Impact, Low Complexity)

1. **Random Events System** (TerraGenesis)
   - Asteroid strikes, disease outbreaks, algae blooms
   - Adds unpredictability and replayability
   - Easy to implement as periodic event checks

2. **Atmospheric Composition Tracking** (Gaia Maker)
   - O2, CO2, nitrogen levels
   - Affects respiration and photosynthesis
   - Enhances biome depth

3. **Faction/Playstyle System** (TerraGenesis)
   - Natural Selection, Intelligent Design, Destroyer, Balancer
   - Different victory conditions
   - Adds strategic variety

4. **Customizable Mutation Settings** (Planetary Life)
   - Sliders for rate, magnitude, bias
   - Player control over randomness
   - Already have mutation system, just expose controls

5. **Gaia Self-Regulating Ecosystems** (SimEarth)
   - Negative feedback loops (overpopulation → die-off)
   - Positive feedback loops (more plants → more O2 → more animals)
   - Equilibrium-seeking behavior
   - Enhances AI population dynamics (already partially implemented)

### Tier 2: Medium-Term Goals (High Impact, Medium Complexity)

6. **Energy Budget Game Mode** (SimEarth)
   - "God Points" limit player interventions
   - Game Mode vs Sandbox Mode
   - Strategic resource management layer

7. **Precise Environmental Parameters** (TerraGenesis)
   - Exact numerical ranges for habitability
   - Interconnected systems (pressure affects oxygen solubility)
   - Sweet spots for optimal survival

8. **Dynamic Biomes** (SimEarth)
   - Biomes change based on temperature + humidity + nutrients
   - Player actions cause biome shifts
   - Adds long-term consequences

9. **Environment-Responsive Mutations** (Planetary Life lesson)
   - Mutations favor locally-adaptive traits
   - Cold biome → insulation traits more common
   - Drives divergent evolution across zones

10. **Scenario-Based Challenges** (SimEarth)
    - Toxic Cleanup, Ice Age Survival, Diversity Challenge
    - Structured goals for players who want direction
    - Complements sandbox mode

### Tier 3: Long-Term Vision (High Impact, High Complexity)

11. **Sentience Development** (SimEarth)
    - Intelligence stat progression → sapience threshold
    - Tool use, civilization building
    - Massive scope expansion

12. **Multi-Stage Evolution** (Planetary Life)
    - Microbe → Creature → Tribal → Civilization
    - Each stage is a full game mode
    - Requires Phase 5, 6, 7+ development

13. **Planet Manipulation Tools** (Planetary Life)
    - God Mode terrain editing
    - Raise/lower depth, temperature, toxins
    - Divine intervention gameplay

14. **Advanced Life Forms** (SimEarth)
    - Photosynthetic animals, parasites, colonial organisms
    - Each with unique mechanics
    - Requires significant AI and behavior work

15. **Cell Visual Designer** (Planetary Life)
    - Organelle placement (chloroplasts, flagella)
    - Membrane customization
    - Visual appearance affects stats

---

## 🔬 Cross-Cutting Design Principles

### From All Four Games

1. **Interconnected Systems** - No parameter exists in isolation
   - Temperature affects metabolism (EvoLab already does this)
   - Pressure affects oxygen solubility (TerraGenesis)
   - Biomass affects resource availability (Gaia Maker)
   - Population affects mutations (SimEarth)

2. **Meaningful Trade-Offs** - Avoid Planetary Life's "pure upgrade" mistake
   - Every benefit must have a cost
   - Context matters (best trait varies by environment)
   - No dominant strategy

3. **Player Agency vs Emergence** - Balance control and chaos
   - Sandbox Mode: Player is god (unlimited control)
   - Game Mode: Player has limits (energy budget)
   - Auto-evolution option (reduce micro-management)
   - Mutations keep things unpredictable

4. **Scientific Grounding** - Educational value through accuracy
   - Real physics (Gaia Maker)
   - Real biology (SimEarth's Gaia hypothesis)
   - Real chemistry (TerraGenesis atmospheric modeling)
   - Simplified but not wrong

5. **Multiple Victory Conditions** - Not just "survive longest"
   - Population milestones (TerraGenesis)
   - Technology achievement (SimEarth)
   - Ecosystem diversity (Planetary Life)
   - Terraforming success (Gaia Maker)

6. **Accessibility Layers** - Easy to learn, hard to master
   - Tutorial for beginners (EvoLab has this)
   - Scenarios for intermediate (structure)
   - Sandbox for experts (freedom)
   - Challenges for completionists (achievements)

---

## 📊 Implementation Priority Matrix

| Mechanic | Impact | Complexity | Priority | EvoLab Phase |
|----------|--------|------------|----------|--------------|
| Random Events | High | Low | **HIGHEST** | Phase 5 |
| Atmospheric Composition | High | Low | **HIGHEST** | Phase 5 |
| Faction System | High | Medium | **HIGH** | Phase 5 |
| Mutation Settings | Medium | Low | **HIGH** | Phase 5 |
| Self-Regulating Ecosystems | High | Medium | **HIGH** | Phase 5 |
| Energy Budget Mode | Medium | Medium | MEDIUM | Phase 6 |
| Precise Parameters | Medium | Medium | MEDIUM | Phase 6 |
| Dynamic Biomes | High | High | MEDIUM | Phase 6 |
| Environment-Responsive Mutations | High | Medium | MEDIUM | Phase 6 |
| Scenario Challenges | Medium | Medium | MEDIUM | Phase 5-6 |
| Sentience Development | Very High | Very High | LOW (future) | Phase 7+ |
| Multi-Stage Evolution | Very High | Very High | LOW (future) | Phase 7+ |
| Planet Manipulation | Medium | High | LOW (future) | Phase 6-7 |
| Advanced Life Forms | Medium | High | LOW (future) | Phase 7+ |
| Cell Visual Designer | Low | Very High | LOW (future) | Phase 8+ |

---

## 🚀 Recommended Next Steps

### Phase 5 - Enhanced Simulation (Immediate)

Based on this research, here's what to prioritize:

1. **Random Events System**
   - Create `EventManager.ts`
   - 8-10 event types: asteroid, disease, bloom, drought, heatwave, freeze, mutation surge, predator invasion
   - Trigger every 50-200 seconds
   - Popup notification with choice (or auto-resolve)

2. **Atmospheric System**
   - Add O2, CO2, N2 levels to each biome
   - Plants increase O2, animals consume it
   - Low O2 zones cause suffocation damage
   - Displayed in HUD and biome tooltips

3. **Faction Selection at Game Start**
   - Modal before starting new game
   - 4 factions with unique goals and bonuses
   - Affects available achievements and victory conditions

4. **Mutation Customization in Settings**
   - Add sliders to Settings panel
   - Mutation Rate, Magnitude, Beneficial Bias
   - Save to localStorage

5. **Ecosystem Feedback Loops**
   - Enhance existing population manager
   - Add predator-prey oscillations
   - Resource depletion effects
   - Automatic rebalancing

### Phase 6 - Strategic Depth (3-6 months out)

6. **Energy Budget Game Mode**
   - God Points currency
   - Earn by simulation time and achievements
   - Spend on environmental changes
   - New Game option: "Sandbox" vs "Challenge Mode"

7. **Dynamic Biomes**
   - Biomes recalculate based on current parameters
   - Temperature + depth + nutrients → biome type
   - Slow transitions (not instant flips)

8. **Scenario System**
   - 5-10 pre-made challenges
   - Custom win conditions
   - Leaderboards for best times/scores

### Phase 7+ - Massive Scope Expansion (1+ years)

9. **Multi-Stage Evolution**
   - Microbe → Creature → Tribal → Civilization
   - Each is a full game mode
   - Requires complete redesign

10. **Sentience & Civilization**
    - Intelligence progression
    - Tool use, structures
    - Technology tree

---

## 📚 Additional Resources

### Gaia Maker
- GitHub: https://github.com/garkimasera/gaia-maker
- Steam: https://store.steampowered.com/app/3662040/Gaia_Maker/
- Itch.io: https://garkimasera.itch.io/gaia-maker

### TerraGenesis
- Mobile: iOS/Android app stores
- Wiki: https://terragenesis.fandom.com/wiki/TerraGenesis_Wiki

### SimEarth
- Wikipedia: https://en.wikipedia.org/wiki/SimEarth
- Archive.org: Playable DOS version
- TV Tropes: https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/SimEarth

### Planetary Life
- Steam: https://store.steampowered.com/app/2471970/Planetary_Life/
- Status: Early Access (2024)

---

**End of Research Document**

*This research was compiled to guide EvoLab's development roadmap and identify high-value mechanics from successful planetary simulation games.*
