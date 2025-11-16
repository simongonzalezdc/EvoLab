# Implementation Plan

Guidance for the three requests (map legend, smarter auto mode, and quicker music iteration) so a coding agent can work through them methodically.

## 1. Clarify Map Colors with a Biome Legend

1. **Share biome metadata:** In `src/environment/BiomeGenerator.ts:169-195`, move the color/name mapping into an exported object (or create `src/environment/BiomeInfo.ts`) so UI components can import the same data used for rendering. Include short descriptive text derived from the logic in `determineBiomeType` (`src/environment/BiomeGenerator.ts:100-154`).
2. **Build a UI component:** Create `src/ui/components/BiomeLegend.tsx` that renders a list of biome rows, each showing a color swatch, the biome name, and its description. Style it to match other panels (light background, readable text) and keep it small enough to sit on top of the Pixi canvas.
3. **Mount it in the HUD:** Import the component into `src/ui/UIController.tsx` (or wherever overlays are composed) and render it near the tutorial panel or as a floating corner widget. Provide a hide/show toggle so players can collapse it once they learn the colors.
4. **Ensure layering works:** Wrap the legend in an absolutely positioned `<div>` with `pointer-events: auto` so it stays visible above the canvas and can be interacted with without affecting gameplay.
5. **Manual verification:** Run the game, traverse multiple biomes, and confirm each tile tint matches the legend entry. Adjust descriptions or opacity if needed.

## 3. Improve Auto Mode Foraging

1. **Expose tuning knobs:** Add new constants in `src/core/Config.ts` such as `AUTO_PILOT_HUNGER_THRESHOLD` (start at 0.9) and `AUTO_PILOT_STARVATION_WINDOW_SECONDS`. Import them in `src/core/AutoPilot.ts`.
2. **Rework hunger detection (`getMovementDirection`):** Compute `atpRatio = player.traits.atp / player.traits.maxATP`. Trigger the resource-seeking branch if `atpRatio < Config.AUTO_PILOT_HUNGER_THRESHOLD` or if projected ATP (current ATP minus drain rate * starvation window) drops below ~30%. This ensures cells search before they are nearly empty.
3. **Persist targets:** Replace the immediate `nearestResource` calculation with a per-cell target cache (map cell ID → resource ID). While hungry, keep moving toward the cached target until it is collected or disappears, then pick a new one. Use the existing `cellWanderState` map or add `cellTargets`.
4. **Refine reproduction behavior:** When `player.canReproduce()` is true, only slow movement (`direction * 0.5`) after the cell finds a nutrient-rich, low-hazard biome. You can pass biome context in from `GameLoop` (e.g., inject `BiomeGenerator` into `AutoPilot`) and evaluate `biome.nutrients` and `biome.hazards`.
5. **Dynamic wandering:** Make the wander cooldown depend on hunger (`wanderState.cooldown = 0.5 + Math.max(0.3, atpRatio) * 2`). Optionally bias direction toward unexplored space by nudging vectors outward from the lake center when hungry.
6. **Testing:** Log state transitions (behind a debug flag) and observe auto-play. Cells should start moving toward food shortly after dipping below 90% ATP, and they should no longer idle to starvation.

## Rapid Music Iteration Ideas

- Add developer sliders/toggles in the settings UI that tweak `MusicManager` parameters live (`filter.frequency`, `reverb.wet`, `delay.feedback`, layer mute buttons) so you can listen while adjusting.
- Create a `MusicPreset` list (oscillator type, envelope, scale set) and wire hotkeys or a dropdown to switch presets instantly without reloading the whole manager.
- Expose `Tone.Transport.bpm` control to the UI to evaluate different global tempi on the fly.
- Add a lightweight watcher script (e.g., `npm run dev:audio`) that rebuilds and hot-reloads when `src/audio/MusicManager.ts` changes, shortening the tweak–listen loop.
- Route each synth through its own `Tone.Channel` so you can swap in EQ/distortion/compression modules quickly while keeping the rest of the graph intact.
