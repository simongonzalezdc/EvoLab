// UI Controller for managing React UI state

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from './components/ErrorBoundary';

// Core components - load immediately (used frequently)
import { StatsPanel } from './components/StatsPanel';
import { TimeControlPanel } from './components/TimeControlPanel';
import { MainMenu } from './components/MainMenu';
import { AchievementNotification } from './components/AchievementNotification';
import { EventNotification } from './components/EventNotification';
import { BiomeLegend } from './components/BiomeLegend';
import { ZoomControls } from './components/ZoomControls';
import { EvolutionControlPanel } from './components/EvolutionControlPanel';
import { AccessibleGameStatePanel, type GameStateData } from './components/AccessibleGameStatePanel';

// Heavy components - lazy load (only when needed)
const TraitEditor = lazy(() => import('./components/TraitEditor').then(m => ({ default: m.TraitEditor })));
const GenerationReport = lazy(() => import('./components/GenerationReport').then(m => ({ default: m.GenerationReport })));
const SettingsPanel = lazy(() => import('./components/SettingsPanel').then(m => ({ default: m.SettingsPanel })));
const SaveLoadPanel = lazy(() => import('./components/SaveLoadPanel').then(m => ({ default: m.SaveLoadPanel })));
const TutorialPanel = lazy(() => import('./components/TutorialPanel').then(m => ({ default: m.TutorialPanel })));
const DeathScreen = lazy(() => import('./components/DeathScreen').then(m => ({ default: m.DeathScreen })));
const AchievementsPanel = lazy(() => import('./components/AchievementsPanel').then(m => ({ default: m.AchievementsPanel })));
const PhylogeneticTreePanel = lazy(() => import('./components/PhylogeneticTreePanel').then(m => ({ default: m.PhylogeneticTreePanel })));
const MusicDevTools = lazy(() => import('./components/MusicDevTools').then(m => ({ default: m.MusicDevTools })));
const GameSetupPanel = lazy(() => import('./components/GameSetupPanel').then(m => ({ default: m.GameSetupPanel })));
const KeyboardShortcutsPanel = lazy(() => import('./components/KeyboardShortcutsPanel').then(m => ({ default: m.KeyboardShortcutsPanel })));
import type { Traits, Species } from '../types/entities';
import type { GameEvent } from '../events/EventManager';
import type { TimeControl } from '../core/TimeControl';
import type { SaveSystem, GameSettings, SavedSimulation, SavedCreature } from '../data/SaveSystem';
import type { PopulationDataPoint, LineageNode } from '../data/HistoryTracker';
import type { Achievement, Challenge } from '../achievements/AchievementSystem';
import { Config } from '../core/Config';
import type { GameSetupOptions, SpeciesSetupOption } from '../types/game';
import { accessibilityManager } from '../utils/AccessibilityManager';
import { screenReaderAnnouncer } from '../utils/ScreenReaderAnnouncer';

// Loading fallback for lazy components
const LoadingFallback: React.FC = () => (
  <div style={{
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#4caf50',
    fontSize: '18px',
    textAlign: 'center',
  }}>
    <div>Loading...</div>
  </div>
);

// Helper to wrap lazy components with Suspense and ErrorBoundary
const LazyComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

const createSpeciesSetup = (type: SpeciesSetupOption['type'], population: number): SpeciesSetupOption => ({
  id: `${type}-${Math.random().toString(36).slice(2)}`,
  type,
  population,
});

const getDefaultSpeciesSetup = (): SpeciesSetupOption[] => [
  createSpeciesSetup('herbivore', Config.HERBIVORE_POPULATION),
  createSpeciesSetup('carnivore', Config.CARNIVORE_POPULATION),
  createSpeciesSetup('omnivore', Config.OMNIVORE_POPULATION),
];

const SETUP_SEEN_KEY = 'evolab_setup_seen';

const hasSeenSetup = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(SETUP_SEEN_KEY) === 'true';
  } catch {
    return false;
  }
};

const markSetupSeen = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETUP_SEEN_KEY, 'true');
  } catch {
    // ignore
  }
};

interface PhylogeneticNode {
  speciesId: string;
  parentSpeciesId: string | null;
  divergenceTime: number;
  children: PhylogeneticNode[];
  isExtinct: boolean;
}

interface UIState {
  showTraitEditor: boolean;
  showGenerationReport: boolean;
  showStats: boolean;
  showSettings: boolean;
  showSaveLoad: boolean;
  showTutorial: boolean;
  showDeathScreen: boolean;
  showAchievements: boolean;
  showPhylogeneticTree: boolean;
  showBiomeLegend: boolean;
  showMusicDevTools: boolean;
  showGameSetup: boolean;
  showKeyboardShortcuts: boolean;
  showAccessibleGameState: boolean;
  gameStateData: GameStateData | null;
  deathCause: 'atp' | 'health';
  currentTraits: Traits | null;
  physicsEnabled: boolean;
  reproductionMode: 'asexual' | 'sexual';
  speciationEnabled: boolean;
  speciesCount: number;
  matingStats: { cellsSeekingMate: number; cellsDisplaying: number } | null;
  phylogeneticTree: PhylogeneticNode[];
  species: Species[];
  generation: number;
  availableDNA: number;
  targetDNA: number;
  currentDNA: number;
  survivalTime: number;
  resourcesCollected: number;
  mutations: string[];
  dnaPointsEarned: number;
  populationData: PopulationDataPoint[];
  lineageData: Map<string, LineageNode>;
  settings: GameSettings;
  achievements: Achievement[];
  challenges: Challenge[];
  achievementNotifications: Achievement[];
  gameSetupSpecies: SpeciesSetupOption[];
  currentEvent: GameEvent | null;
}

export class UIController {
  private root: ReturnType<typeof createRoot>;
  private setState: React.Dispatch<React.SetStateAction<UIState>> | null = null;
  private onApplyModifications: ((mods: Partial<Traits>) => void) | null = null;
  private onContinue: (() => void) | null = null;
  private onNewGame: ((options?: GameSetupOptions) => void) | null = null;
  private onRestart: (() => void) | null = null;
  private onLoadSimulation: ((sim: SavedSimulation) => void) | null = null;
  private onLoadCreature: ((creature: SavedCreature) => void) | null = null;
  private onSettingsChange: ((settings: GameSettings) => void) | null = null;
  private onExportHistory: (() => void) | null = null;
  private onShowAchievements: (() => void) | null = null;
  private onTogglePhysics: (() => void) | null = null;
  private onToggleReproductionMode: (() => void) | null = null;
  private onToggleSpeciation: (() => void) | null = null;
  private onShowPhylogeneticTree: (() => void) | null = null;
  private onToggleAutoMode: (() => void) | null = null;
  private getAutoModeState: (() => boolean) | null = null;
  private getZoomLevel: (() => number) | null = null;
  private onZoomIn: (() => void) | null = null;
  private onZoomOut: (() => void) | null = null;
  private onResetZoom: (() => void) | null = null;
  private getMusicManager: (() => any) | null = null;
  private timeControl: TimeControl;
  private saveSystem: SaveSystem;

  constructor(timeControl: TimeControl, saveSystem: SaveSystem) {
    this.timeControl = timeControl;
    this.saveSystem = saveSystem;

    const container = document.createElement('div');
    container.id = 'ui-root';
    document.body.appendChild(container);
    this.root = createRoot(container);
    this.render();
  }

  private render() {
    const UIComponent = () => {
      const [state, setState] = useState<UIState>(() => ({
        showTraitEditor: false,
        showGenerationReport: false,
        showStats: false,
        showSettings: false,
        showSaveLoad: false,
        showTutorial: false,
        showDeathScreen: false,
        showAchievements: false,
        showPhylogeneticTree: false,
        showBiomeLegend: true, // Default: visible
        showMusicDevTools: false,
        showGameSetup: !hasSeenSetup(),
        showKeyboardShortcuts: false,
        showAccessibleGameState: false,
        gameStateData: null,
        deathCause: 'atp',
        currentTraits: null,
        physicsEnabled: false,
        reproductionMode: 'asexual' as const,
        speciationEnabled: false,
        speciesCount: 1,
        matingStats: null,
        phylogeneticTree: [],
        species: [],
        generation: 1,
        availableDNA: 0,
        targetDNA: 50,
        currentDNA: 0,
        survivalTime: 0,
        resourcesCollected: 0,
        mutations: [],
        dnaPointsEarned: 0,
        populationData: [],
        lineageData: new Map(),
        settings: this.saveSystem.getDefaultSettings(),
        achievements: [],
        challenges: [],
        achievementNotifications: [],
        gameSetupSpecies: getDefaultSpeciesSetup(),
        currentEvent: null,
      }));

      useEffect(() => {
        this.setState = setState;

        // Load settings from DB
        this.saveSystem.loadSettings().then(settings => {
          if (settings) {
            setState(s => ({ ...s, settings }));
            // Apply accessibility settings
            accessibilityManager.applySettings(settings);
          } else {
            // Apply default accessibility settings
            const defaultSettings = this.saveSystem.getDefaultSettings();
            accessibilityManager.applySettings(defaultSettings);
          }
        });

        // Global keyboard handler for Shift+?
        const handleGlobalKeyPress = (e: KeyboardEvent) => {
          if (e.shiftKey && e.key === '?') {
            e.preventDefault();
            setState(s => ({ ...s, showKeyboardShortcuts: !s.showKeyboardShortcuts }));
          }
        };

        document.addEventListener('keydown', handleGlobalKeyPress);
        return () => document.removeEventListener('keydown', handleGlobalKeyPress);
      }, []);

      const handleApplyModifications = (mods: Partial<Traits>) => {
        setState(s => ({ ...s, showTraitEditor: false }));
        this.onApplyModifications?.(mods);
      };


      const handleContinue = () => {
        setState(s => ({ ...s, showGenerationReport: false }));
        this.onContinue?.();
      };

      const handleSpeciesSlotUpdate = (id: string, updates: Partial<SpeciesSetupOption>) => {
        setState(s => ({
          ...s,
          gameSetupSpecies: s.gameSetupSpecies.map(spec =>
            spec.id === id ? { ...spec, ...updates } : spec
          ),
        }));
      };

      const handleAddSpeciesSlot = () => {
        setState(s => {
          if (s.gameSetupSpecies.length >= 6) return s;
          return {
            ...s,
            gameSetupSpecies: [...s.gameSetupSpecies, createSpeciesSetup('herbivore', 12)],
          };
        });
      };

      const handleRemoveSpeciesSlot = (id: string) => {
        setState(s => {
          if (s.gameSetupSpecies.length <= 1) return s;
          return {
            ...s,
            gameSetupSpecies: s.gameSetupSpecies.filter(spec => spec.id !== id),
          };
        });
      };

      const handleNewGame = () => {
        setState(s => ({ ...s, showGameSetup: true }));
      };

      const handleCancelGameSetup = () => {
        setState(s => ({ ...s, showGameSetup: false }));
        markSetupSeen();
      };

      const handleStartGame = () => {
        if (state.gameSetupSpecies.length === 0) return;
        const options: GameSetupOptions = {
          species: state.gameSetupSpecies.map(spec => ({ ...spec })),
        };
        setState(s => ({ ...s, showGameSetup: false }));
        markSetupSeen();
        this.onNewGame?.(options);
      };

      const handleLoadSimulation = (sim: SavedSimulation) => {
        setState(s => ({ ...s, showSaveLoad: false }));
        this.onLoadSimulation?.(sim);
      };

      const handleLoadCreature = (creature: SavedCreature) => {
        setState(s => ({ ...s, showSaveLoad: false }));
        this.onLoadCreature?.(creature);
      };

      const handleSettingsChange = (settings: GameSettings) => {
        setState(s => ({ ...s, settings }));
        this.saveSystem.saveSettings(settings);
        this.onSettingsChange?.(settings);
        // Apply accessibility settings immediately
        accessibilityManager.applySettings(settings);
      };

      const handleExportHistory = () => {
        this.onExportHistory?.();
      };

      const handleRestart = () => {
        setState(s => ({ ...s, showDeathScreen: false }));
        this.onRestart?.();
      };

      const handleShowAchievements = () => {
        this.onShowAchievements?.();
      };

      const handleCloseAchievementNotification = (index: number) => {
        setState(s => ({
          ...s,
          achievementNotifications: s.achievementNotifications.filter((_, i) => i !== index),
        }));
      };

      const handleCloseEventNotification = () => {
        setState(s => ({
          ...s,
          currentEvent: null,
        }));
      };

      const handleTogglePhysics = () => {
        this.onTogglePhysics?.();
      };

      const handleToggleReproductionMode = () => {
        this.onToggleReproductionMode?.();
      };

      const handleToggleSpeciation = () => {
        this.onToggleSpeciation?.();
      };

      const handleShowPhylogeneticTree = () => {
        this.onShowPhylogeneticTree?.();
      };

      return (
        <>
          {/* Main Menu */}
          <nav id="main-menu" aria-label="Main navigation">
            <MainMenu
            onNewGame={handleNewGame}
            onLoadGame={() => setState(s => ({ ...s, showSaveLoad: true }))}
            onSettings={() => setState(s => ({ ...s, showSettings: true }))}
            onTutorial={() => setState(s => ({ ...s, showTutorial: true }))}
            onExportHistory={handleExportHistory}
            onToggleStats={() => setState(s => ({ ...s, showStats: !s.showStats }))}
            onAchievements={handleShowAchievements}
            onToggleAutoMode={() => {
              this.onToggleAutoMode?.();
              // Force re-render to update button state
              setState(s => ({ ...s }));
            }}
            onShowGameSetup={() => setState(s => ({ ...s, showGameSetup: true }))}
            autoMode={this.getAutoModeState?.() || false}
            showStats={state.showStats}
          />
          </nav>

          {/* Time Control Panel */}
          <TimeControlPanel timeControl={this.timeControl} />

          {/* Evolution Control Panel */}
          <EvolutionControlPanel
            physicsEnabled={state.physicsEnabled}
            reproductionMode={state.reproductionMode}
            speciationEnabled={state.speciationEnabled}
            onTogglePhysics={handleTogglePhysics}
            onToggleReproductionMode={handleToggleReproductionMode}
            onToggleSpeciation={handleToggleSpeciation}
            onShowPhylogeneticTree={handleShowPhylogeneticTree}
            speciesCount={state.speciesCount}
            matingStats={state.matingStats || undefined}
          />

          {/* Biome Legend */}
          {state.showBiomeLegend && (
            <BiomeLegend
              onToggle={() => setState(s => ({ ...s, showBiomeLegend: !s.showBiomeLegend }))}
              onBiomeHover={(biomeType) => {
                // Dispatch event for biome highlighting
                window.dispatchEvent(new CustomEvent('biomeHighlight', { detail: biomeType }));
              }}
            />
          )}

          {/* Zoom Controls */}
          {this.getZoomLevel && (
            <ZoomControls
              currentZoom={this.getZoomLevel()}
              onZoomIn={() => this.onZoomIn?.()}
              onZoomOut={() => this.onZoomOut?.()}
              onResetZoom={() => this.onResetZoom?.()}
            />
          )}

          {/* Accessible Game State Panel */}
          {state.gameStateData && (
            <AccessibleGameStatePanel
              gameState={state.gameStateData}
              isVisible={state.showAccessibleGameState}
              onToggle={() => setState(s => ({ ...s, showAccessibleGameState: !s.showAccessibleGameState }))}
            />
          )}

          {/* Music Dev Tools */}
          {state.showMusicDevTools && this.getMusicManager && (
            <LazyComponent>
              <MusicDevTools
                musicManager={this.getMusicManager()}
                onClose={() => setState(s => ({ ...s, showMusicDevTools: false }))}
              />
            </LazyComponent>
          )}

          {/* Stats Panel */}
          {state.showStats && state.currentTraits && (
            <StatsPanel
              populationData={state.populationData}
              lineageData={state.lineageData}
              currentTraits={state.currentTraits}
              generation={state.generation}
            />
          )}

          {/* Generation Report Modal */}
          {state.showGenerationReport && (
            <LazyComponent>
              <GenerationReport
                generation={state.generation}
                survivalTime={state.survivalTime}
                resourcesCollected={state.resourcesCollected}
                mutations={state.mutations}
                dnaPointsEarned={state.dnaPointsEarned}
                onContinue={handleContinue}
              />
            </LazyComponent>
          )}

          {/* Trait Editor Modal */}
          {state.showTraitEditor && state.currentTraits && (
            <LazyComponent>
              <TraitEditor
                currentTraits={state.currentTraits}
                availableDNA={state.availableDNA}
                generation={state.generation}
                onApply={handleApplyModifications}
              />
            </LazyComponent>
          )}

          {/* Game Setup Modal */}
          <LazyComponent>
            <GameSetupPanel
              isOpen={state.showGameSetup}
              species={state.gameSetupSpecies}
              onUpdateSpecies={handleSpeciesSlotUpdate}
              onAddSpecies={handleAddSpeciesSlot}
              onRemoveSpecies={handleRemoveSpeciesSlot}
              onStart={handleStartGame}
              onCancel={handleCancelGameSetup}
            />
          </LazyComponent>

          {/* Settings Modal */}
          {state.showSettings && (
            <LazyComponent>
              <SettingsPanel
                settings={state.settings}
                onSettingsChange={handleSettingsChange}
                onClose={() => setState(s => ({ ...s, showSettings: false }))}
                onShowMusicDevTools={() => setState(s => ({ ...s, showMusicDevTools: true, showSettings: false }))}
              />
            </LazyComponent>
          )}

          {/* Save/Load Modal */}
          {state.showSaveLoad && (
            <LazyComponent>
              <SaveLoadPanel
                saveSystem={this.saveSystem}
                onLoad={handleLoadSimulation}
                onLoadCreature={handleLoadCreature}
                onClose={() => setState(s => ({ ...s, showSaveLoad: false }))}
              />
            </LazyComponent>
          )}

          {/* Tutorial Modal */}
          {state.showTutorial && (
            <LazyComponent>
              <TutorialPanel onClose={() => setState(s => ({ ...s, showTutorial: false }))} />
            </LazyComponent>
          )}

          {/* Death Screen Modal */}
          {state.showDeathScreen && (
            <LazyComponent>
              <DeathScreen
                generation={state.generation}
                survivalTime={state.survivalTime}
                resourcesCollected={state.resourcesCollected}
                cause={state.deathCause}
                onRestart={handleRestart}
              />
            </LazyComponent>
          )}

          {/* Achievements Panel */}
          {state.showAchievements && (
            <AchievementsPanel
              achievements={state.achievements}
              challenges={state.challenges}
              onClose={() => setState(s => ({ ...s, showAchievements: false }))}
            />
          )}

          {/* Phylogenetic Tree Panel */}
          {state.showPhylogeneticTree && (
            <PhylogeneticTreePanel
              phylogeneticTree={state.phylogeneticTree}
              species={state.species}
              onClose={() => setState(s => ({ ...s, showPhylogeneticTree: false }))}
            />
          )}

          {/* Keyboard Shortcuts Panel */}
          {state.showKeyboardShortcuts && (
            <KeyboardShortcutsPanel
              onClose={() => setState(s => ({ ...s, showKeyboardShortcuts: false }))}
            />
          )}

          {/* Achievement Notifications */}
          {state.achievementNotifications.map((achievement, index) => (
            <AchievementNotification
              key={achievement.id}
              achievement={achievement}
              onClose={() => handleCloseAchievementNotification(index)}
            />
          ))}

          {/* Event Notification */}
          <EventNotification
            event={state.currentEvent}
            onClose={handleCloseEventNotification}
          />
        </>
      );
    };

    this.root.render(<UIComponent />);
  }

  showGenerationReport(data: {
    generation: number;
    survivalTime: number;
    resourcesCollected: number;
    mutations: string[];
    dnaPointsEarned: number;
  }) {
    this.setState?.(s => ({
      ...s,
      showGenerationReport: true,
      showTraitEditor: false,
      ...data,
    }));

    // Announce to screen readers
    screenReaderAnnouncer.announcePolite(
      `Generation ${data.generation - 1} complete! Earned ${data.dnaPointsEarned} DNA points. ${data.mutations.length} mutations discovered.`
    );
  }

  showTraitEditor(traits: Traits, generation: number, availableDNA: number) {
    this.setState?.(s => ({
      ...s,
      showTraitEditor: true,
      showGenerationReport: false,
      currentTraits: traits,
      generation,
      availableDNA,
    }));

    // Announce to screen readers
    screenReaderAnnouncer.announcePolite(
      `Trait editor opened. Generation ${generation}. You have ${availableDNA} DNA points available.`
    );
  }

  hideTraitEditor() {
    this.setState?.(s => ({
      ...s,
      showTraitEditor: false,
    }));
  }

  updateStats(
    traits: Traits,
    generation: number,
    populationData: PopulationDataPoint[],
    lineageData: Map<string, LineageNode>
  ) {
    this.setState?.(s => ({
      ...s,
      currentTraits: traits,
      generation,
      populationData,
      lineageData,
    }));
  }

  showTutorial() {
    this.setState?.(s => ({ ...s, showTutorial: true }));
  }

  onApply(callback: (mods: Partial<Traits>) => void) {
    this.onApplyModifications = callback;
  }

  onReportContinue(callback: () => void) {
    this.onContinue = callback;
  }

  setNewGameCallback(callback: (options?: GameSetupOptions) => void) {
    this.onNewGame = callback;
  }

  setLoadSimulationCallback(callback: (sim: SavedSimulation) => void) {
    this.onLoadSimulation = callback;
  }

  setLoadCreatureCallback(callback: (creature: SavedCreature) => void) {
    this.onLoadCreature = callback;
  }

  setSettingsChangeCallback(callback: (settings: GameSettings) => void) {
    this.onSettingsChange = callback;
  }

  setExportHistoryCallback(callback: () => void) {
    this.onExportHistory = callback;
  }

  showDeathScreen(generation: number, survivalTime: number, resourcesCollected: number, cause: 'atp' | 'health') {
    this.setState?.(s => ({
      ...s,
      showDeathScreen: true,
      generation,
      survivalTime,
      resourcesCollected,
      deathCause: cause,
    }));

    // Announce to screen readers (assertive for critical event)
    const causeText = cause === 'atp' ? 'energy depletion' : 'health loss';
    screenReaderAnnouncer.announceAssertive(
      `Extinction! Your species died from ${causeText}. Generation ${generation} reached. Survival time: ${survivalTime} seconds.`
    );
  }

  setRestartCallback(callback: () => void) {
    this.onRestart = callback;
  }

  setAchievementsCallback(callback: () => void) {
    this.onShowAchievements = callback;
  }

  showAchievements(achievements: Achievement[], challenges: Challenge[]) {
    this.setState?.(s => ({
      ...s,
      showAchievements: true,
      achievements,
      challenges,
    }));
  }

  showAchievementNotification(achievement: Achievement) {
    this.setState?.(s => ({
      ...s,
      achievementNotifications: [...s.achievementNotifications, achievement],
    }));

    // Announce to screen readers
    screenReaderAnnouncer.announcePolite(
      `Achievement unlocked: ${achievement.name}! ${achievement.description}`
    );
  }

  showEventNotification(event: GameEvent) {
    this.setState?.(s => ({
      ...s,
      currentEvent: event,
    }));

    // Announce to screen readers
    screenReaderAnnouncer.announceAssertive(
      `Event triggered: ${event.name}! ${event.description}`
    );
  }

  // Evolution systems callbacks
  setTogglePhysicsCallback(callback: () => void) {
    this.onTogglePhysics = callback;
  }

  setToggleReproductionModeCallback(callback: () => void) {
    this.onToggleReproductionMode = callback;
  }

  setToggleSpeciationCallback(callback: () => void) {
    this.onToggleSpeciation = callback;
  }

  setShowPhylogeneticTreeCallback(callback: () => void) {
    this.onShowPhylogeneticTree = callback;
  }

  setToggleAutoModeCallback(callback: () => void) {
    this.onToggleAutoMode = callback;
  }

  setAutoModeStateCallback(callback: () => boolean) {
    this.getAutoModeState = callback;
  }

  setZoomCallbacks(
    getZoom: () => number,
    onZoomIn: () => void,
    onZoomOut: () => void,
    onResetZoom: () => void
  ) {
    this.getZoomLevel = getZoom;
    this.onZoomIn = onZoomIn;
    this.onZoomOut = onZoomOut;
    this.onResetZoom = onResetZoom;
  }

  setMusicManagerCallback(getMusicManager: () => any): void {
    this.getMusicManager = getMusicManager;
  }

  showMusicDevTools(): void {
    this.setState?.(s => ({ ...s, showMusicDevTools: true }));
  }

  updateEvolutionControls(
    physicsEnabled: boolean,
    reproductionMode: 'asexual' | 'sexual',
    speciationEnabled: boolean,
    speciesCount: number,
    matingStats: { cellsSeekingMate: number; cellsDisplaying: number } | null
  ) {
    this.setState?.(s => ({
      ...s,
      physicsEnabled,
      reproductionMode,
      speciationEnabled,
      speciesCount,
      matingStats,
    }));
  }

  showPhylogeneticTree(tree: PhylogeneticNode[], species: Species[]) {
    this.setState?.(s => ({
      ...s,
      showPhylogeneticTree: true,
      phylogeneticTree: tree,
      species,
    }));
  }

  updateDNAProgress(currentDNA: number, targetDNA: number = 50) {
    this.setState?.(s => ({
      ...s,
      currentDNA,
      targetDNA,
    }));
  }

  updateGameStateData(gameState: GameStateData) {
    this.setState?.(s => ({
      ...s,
      gameStateData: gameState,
    }));
  }

  dispose() {
    this.root.unmount();
  }
}
