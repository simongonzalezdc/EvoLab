# Phase 5 Features Integration Guide

This document provides step-by-step instructions for integrating the 5 new game mechanics into EvoLab.

## 📦 New Systems Implemented

1. **Random Events System** (`src/events/EventManager.ts`)
2. **Atmospheric Composition Tracking** (`src/environment/AtmosphericSystem.ts`)
3. **Faction/Playstyle System** (`src/core/FactionSystem.ts`)
4. **Ecosystem Regulator** (`src/ai/EcosystemRegulator.ts`)
5. **Customizable Mutation Settings** (Updated `SettingsPanel.tsx` and `SaveSystem.ts`)

## 🎨 New UI Components

1. **Event Notification** (`src/ui/components/EventNotification.tsx`)
2. **Faction Selection Panel** (`src/ui/components/FactionSelectionPanel.tsx`)

---

## 🔧 Integration Steps

### Step 1: Update GameLoop.ts

Add imports at the top of `src/core/GameLoop.ts`:

```typescript
import { EventManager } from '../events/EventManager';
import type { GameEvent } from '../events/EventManager';
import { AtmosphericSystem } from '../environment/AtmosphericSystem';
import { FactionSystem } from '../core/FactionSystem';
import { EcosystemRegulator } from '../ai/EcosystemRegulator';
```

Add class properties to `GameLoop`:

```typescript
export class GameLoop {
  // ... existing properties ...
  private eventManager: EventManager;
  private atmosphericSystem: AtmosphericSystem;
  private factionSystem: FactionSystem;
  private ecosystemRegulator: EcosystemRegulator;
  private currentEvent: GameEvent | null = null;
```

Initialize in constructor:

```typescript
constructor() {
  // ... existing initialization ...
  this.eventManager = new EventManager();
  this.atmosphericSystem = new AtmosphericSystem();
  this.factionSystem = new FactionSystem();
  this.ecosystemRegulator = new EcosystemRegulator();

  // Setup event callback
  this.eventManager.setEventCallback((event) => {
    this.currentEvent = event;
    // Notify UI (add method to UIController)
  });
}
```

Update the `update` method:

```typescript
private update(deltaTime: number): void {
  // ... existing update code ...

  // Update atmospheric system
  const allCells = this.entityManager.getAllCells();
  const resources = this.entityManager.getResources();

  // Count plants and animals for atmospheric simulation
  let plants = 0;
  let animals = 0;
  allCells.forEach(cell => {
    if (cell.traits.photosyntheticEfficiency > 0) plants++;
    else animals++;
  });

  if (this.entityManager.playerSpecies) {
    const center = this.entityManager.playerSpecies.getCenterPosition();
    this.atmosphericSystem.update(deltaTime, plants, animals, center.x, center.y);
  }

  // Update event manager
  this.eventManager.update(deltaTime, allCells, resources);

  // Update ecosystem regulator
  const ecosystemStats = this.ecosystemRegulator.calculateStats(allCells, resources);
  this.ecosystemRegulator.update(ecosystemStats, deltaTime);

  // Update faction progress
  if (this.entityManager.playerSpecies) {
    const stats = this.entityManager.playerSpecies.getStats();
    this.factionSystem.updateProgress('generation', stats.generation);
    this.factionSystem.updateProgress('population', stats.population);
    this.factionSystem.updateProgress('diversity', stats.diversity || 0);
    this.factionSystem.updateProgress('biomass', ecosystemStats.biomass);
    this.factionSystem.updateProgress('equilibrium_time', this.ecosystemRegulator.getEquilibriumTime());
  }

  // Check victory conditions
  const victory = this.factionSystem.checkVictory();
  if (victory.achieved && victory.condition) {
    // Show victory screen (implement in UI)
    console.log('Victory achieved:', victory.condition.description);
  }

  // ... rest of existing update code ...
}
```

### Step 2: Update UIController.tsx

Add methods to show new UI components:

```typescript
// In UIController
export class UIController {
  private currentEvent: GameEvent | null = null;
  private showingFactionSelection = false;

  showEventNotification(event: GameEvent): void {
    this.currentEvent = event;
    this.forceUpdate();
  }

  showFactionSelection(onSelect: (factionType: FactionType) => void, onSkip: () => void): void {
    this.showingFactionSelection = true;
    this.onFactionSelect = onSelect;
    this.onFactionSkip = onSkip;
    this.forceUpdate();
  }

  render() {
    return (
      <>
        {/* Existing UI */}

        {/* Event Notification */}
        {this.currentEvent && (
          <EventNotification
            event={this.currentEvent}
            onClose={() => {
              this.currentEvent = null;
              this.forceUpdate();
            }}
          />
        )}

        {/* Faction Selection */}
        {this.showingFactionSelection && (
          <FactionSelectionPanel
            factions={new FactionSystem().getAllFactions()}
            onSelect={this.onFactionSelect}
            onSkip={this.onFactionSkip}
          />
        )}
      </>
    );
  }
}
```

### Step 3: Update MutationEngine Integration

In `GameLoop.applySettings()`, update mutation engine config:

```typescript
private applySettings(settings: GameSettings): void {
  this.currentSettings = settings;
  this.autoSaveInterval = settings.autoSaveInterval * 60 * 1000;

  // Apply music settings
  if (settings.musicEnabled) {
    this.musicManager.enable();
  } else {
    this.musicManager.disable();
  }

  // Apply mutation settings to evolution systems
  this.evolutionSystems.getMutationEngine().setConfig({
    mutationRate: settings.mutationRate,
    mutationMagnitude: settings.mutationMagnitude,
    beneficialBias: settings.beneficialBias,
  });

  // Apply event settings
  this.eventManager.setEventsEnabled(settings.randomEventsEnabled);

  // Save settings
  this.saveSystem.saveSettings(settings).catch(err => {
    console.error('Failed to save settings:', err);
  });
}
```

### Step 4: Add Faction Selection to New Game Flow

In `GameLoop.resetGame()` or `initialize()`, show faction selection:

```typescript
async initialize(): Promise<void> {
  // ... existing initialization ...

  // Show faction selection on first start (or new game)
  const hasChosenFaction = localStorage.getItem('evolab_faction_chosen');
  if (!hasChosenFaction) {
    this.uiController.showFactionSelection(
      (factionType) => {
        this.factionSystem.setFaction(factionType);
        localStorage.setItem('evolab_faction_chosen', 'true');
        localStorage.setItem('evolab_faction_type', factionType);
      },
      () => {
        // User skipped faction selection
        localStorage.setItem('evolab_faction_chosen', 'true');
      }
    );
  } else {
    // Load saved faction
    const savedFaction = localStorage.getItem('evolab_faction_type');
    if (savedFaction) {
      this.factionSystem.setFaction(savedFaction as FactionType);
    }
  }

  // ... rest of initialization ...
}
```

### Step 5: Integrate AtmosphericSystem with Environmental Hazards

Update `applyHazardsToCell` in `GameLoop`:

```typescript
private applyHazardsToCell(cell: Cell, biome: any, deltaTime: number): void {
  // Get atmospheric composition at cell position
  const atmosphere = this.atmosphericSystem.getCompositionAt(cell.position.x, cell.position.y);

  // Apply oxygen suffocation if O2 is too low
  const oxygenSufficiency = this.atmosphericSystem.getOxygenSufficiency(cell.position.x, cell.position.y);
  if (oxygenSufficiency < 0.5) {
    const suffocationDamage = (0.5 - oxygenSufficiency) * 2 * deltaTime;
    cell.traits.atp = Math.max(0, cell.traits.atp - suffocationDamage);
  }

  // ... existing hazard code ...
}
```

### Step 6: Integrate EcosystemRegulator with PopulationManager

Update `PopulationManager.update()`:

```typescript
// In PopulationManager (or create enhanced version)
update(deltaTime: number, allCells: Cell[], resources: Resource[]): void {
  // Get ecosystem stats and feedback loops
  const ecosystemStats = ecosystemRegulator.calculateStats(allCells, resources);
  const spawnModifier = ecosystemRegulator.getSpawnRateModifier(ecosystemStats);

  this.spawnCooldown -= deltaTime;

  // Spawn new cells with ecosystem feedback
  if (this.spawnCooldown <= 0) {
    this.spawnCooldown = 10 / spawnModifier; // Adjusted by feedback
    this.trySpawnCells();
  }

  // ... rest of update ...
}
```

### Step 7: Apply Faction Bonuses

When calculating DNA points, resource spawning, etc., apply faction bonuses:

```typescript
// Example: DNA point calculation with faction bonus
const baseDnaPoints = stats.averageSurvivalTime * Config.DNA_FROM_SURVIVAL_TIME;
const bonusedDnaPoints = this.factionSystem.applyBonus('dna_multiplier', baseDnaPoints);
baseGenome.dnaPoints += bonusedDnaPoints;

// Example: Combat damage with faction bonus
const baseDamage = attacker.traits.size * 2;
const bonusedDamage = this.factionSystem.applyBonus('combat_bonus', baseDamage);
```

---

## 🧪 Testing Checklist

- [ ] Events trigger periodically (check console or UI)
- [ ] Event notification appears with correct styling
- [ ] Mutation sliders in Settings Panel work (0-100%)
- [ ] Faction selection appears on first game start
- [ ] Faction bonuses apply correctly (check DNA points, etc.)
- [ ] Atmospheric O2/CO2 updates based on population
- [ ] Low oxygen zones cause suffocation damage
- [ ] Ecosystem feedback loops affect spawn rates
- [ ] Victory conditions tracked and checked
- [ ] Settings persist across sessions

---

## 📝 Optional Enhancements

### Display Atmospheric Data in HUD

Add to HUD display:

```typescript
// In updateHUD()
const composition = this.atmosphericSystem.getCompositionAt(player.position.x, player.position.y);
this.setHudValue('oxygen-value', `${Math.round(composition.oxygen)}%`);
this.setHudValue('co2-value', `${Math.round(composition.carbonDioxide)}%`);
```

### Show Faction Victory Progress

Add a progress bar to UI:

```typescript
const victoryProgress = this.factionSystem.getVictoryProgress();
// Render progress bars for each victory condition
```

### Event History Log

Track recent events:

```typescript
private eventHistory: GameEvent[] = [];

// In event callback
this.eventHistory.push(event);
if (this.eventHistory.length > 10) {
  this.eventHistory.shift();
}

// Show in UI panel
```

### Biome Atmospheric Visualization

Color-code biomes based on O2 levels:

```typescript
// In BiomeRenderer
const atmosphere = atmosphericSystem.getCompositionAt(x, y);
const oxygenTint = atmosphere.oxygen > 70 ? 0x00ff0040 : 0xff000040;
// Apply tint to biome tiles
```

---

## 🐛 Common Issues & Solutions

### Issue: Events not triggering
**Solution**: Check `randomEventsEnabled` in settings. Verify `eventManager.update()` is called in game loop.

### Issue: Mutation settings not applying
**Solution**: Ensure `applySettings()` is called after loading settings. Check `MutationEngine.setConfig()` is receiving correct values.

### Issue: Faction bonuses not working
**Solution**: Verify `factionSystem.setFaction()` was called. Check `applyBonus()` is called at the right calculation points.

### Issue: Atmospheric system causing lag
**Solution**: Increase zone size in `AtmosphericSystem` constructor. Call `cleanup()` periodically to remove old zones.

### Issue: UI components not showing
**Solution**: Check z-index values. Verify UIController is rendering the components. Check component visibility state.

---

## 📊 Performance Considerations

1. **Atmospheric System**: Uses spatial zones to limit calculations. Adjust `zoneSize` for performance vs. accuracy.

2. **Event Manager**: Events trigger on intervals. Adjust `minEventInterval` and `maxEventInterval` for desired frequency.

3. **Ecosystem Regulator**: Tracks limited history (20 snapshots). Increase for more accurate oscillation detection.

4. **Faction System**: Minimal overhead - only updates progress values each frame.

---

## 🎯 Next Steps

After integration:

1. **Balance Testing**: Adjust event severity, faction bonuses, atmospheric effects
2. **UI Polish**: Add animations, improve styling, add tooltips
3. **Sound Effects**: Add audio for events, victories
4. **Achievements**: Link faction victories to achievement system
5. **Multiplayer Prep**: Consider faction choices in multiplayer context

---

**Created:** November 16, 2025
**Version:** 1.0
**Status:** Ready for Integration
