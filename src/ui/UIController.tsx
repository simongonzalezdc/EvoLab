// UI Controller for managing React UI state

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { TraitEditor } from './components/TraitEditor';
import { GenerationReport } from './components/GenerationReport';
import { StatsPanel } from './components/StatsPanel';
import { TimeControlPanel } from './components/TimeControlPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { SaveLoadPanel } from './components/SaveLoadPanel';
import { TutorialPanel } from './components/TutorialPanel';
import { MainMenu } from './components/MainMenu';
import { DeathScreen } from './components/DeathScreen';
import { AchievementsPanel } from './components/AchievementsPanel';
import { AchievementNotification } from './components/AchievementNotification';
import { EvolutionControlPanel } from './components/EvolutionControlPanel';
import { PhylogeneticTreePanel } from './components/PhylogeneticTreePanel';
import type { Traits, Species } from '../types/entities';
import type { TimeControl } from '../core/TimeControl';
import type { SaveSystem, GameSettings, SavedSimulation, SavedCreature } from '../data/SaveSystem';
import type { PopulationDataPoint, LineageNode } from '../data/HistoryTracker';
import type { Achievement, Challenge } from '../achievements/AchievementSystem';

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
}

export class UIController {
  private root: ReturnType<typeof createRoot>;
  private setState: React.Dispatch<React.SetStateAction<UIState>> | null = null;
  private onApplyModifications: ((mods: Partial<Traits>) => void) | null = null;
  private onContinue: (() => void) | null = null;
  private onNewGame: (() => void) | null = null;
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
      const [state, setState] = useState<UIState>({
        showTraitEditor: false,
        showGenerationReport: false,
        showStats: false,
        showSettings: false,
        showSaveLoad: false,
        showTutorial: false,
        showDeathScreen: false,
        showAchievements: false,
        showPhylogeneticTree: false,
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
      });

      useEffect(() => {
        this.setState = setState;

        // Load settings from DB
        this.saveSystem.loadSettings().then(settings => {
          if (settings) {
            setState(s => ({ ...s, settings }));
          }
        });
      }, []);

      const handleApplyModifications = (mods: Partial<Traits>) => {
        setState(s => ({ ...s, showTraitEditor: false }));
        this.onApplyModifications?.(mods);
      };

      const handleCancel = () => {
        setState(s => ({ ...s, showTraitEditor: false }));
      };

      const handleContinue = () => {
        setState(s => ({ ...s, showGenerationReport: false }));
        this.onContinue?.();
      };

      const handleNewGame = () => {
        if (confirm('Start a new game? Current progress will be lost.')) {
          this.onNewGame?.();
        }
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
          <MainMenu
            onNewGame={handleNewGame}
            onLoadGame={() => setState(s => ({ ...s, showSaveLoad: true }))}
            onSettings={() => setState(s => ({ ...s, showSettings: true }))}
            onTutorial={() => setState(s => ({ ...s, showTutorial: true }))}
            onExportHistory={handleExportHistory}
            onToggleStats={() => setState(s => ({ ...s, showStats: !s.showStats }))}
            onAchievements={handleShowAchievements}
            showStats={state.showStats}
          />

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
            matingStats={state.matingStats}
          />

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
            <GenerationReport
              generation={state.generation}
              survivalTime={state.survivalTime}
              resourcesCollected={state.resourcesCollected}
              mutations={state.mutations}
              dnaPointsEarned={state.dnaPointsEarned}
              onContinue={handleContinue}
            />
          )}

          {/* Trait Editor Modal */}
          {state.showTraitEditor && state.currentTraits && (
            <TraitEditor
              currentTraits={state.currentTraits}
              availableDNA={state.availableDNA}
              generation={state.generation}
              onApply={handleApplyModifications}
              onCancel={handleCancel}
            />
          )}

          {/* Settings Modal */}
          {state.showSettings && (
            <SettingsPanel
              settings={state.settings}
              onSettingsChange={handleSettingsChange}
              onClose={() => setState(s => ({ ...s, showSettings: false }))}
            />
          )}

          {/* Save/Load Modal */}
          {state.showSaveLoad && (
            <SaveLoadPanel
              saveSystem={this.saveSystem}
              onLoad={handleLoadSimulation}
              onLoadCreature={handleLoadCreature}
              onClose={() => setState(s => ({ ...s, showSaveLoad: false }))}
            />
          )}

          {/* Tutorial Modal */}
          {state.showTutorial && (
            <TutorialPanel onClose={() => setState(s => ({ ...s, showTutorial: false }))} />
          )}

          {/* Death Screen Modal */}
          {state.showDeathScreen && (
            <DeathScreen
              generation={state.generation}
              survivalTime={state.survivalTime}
              resourcesCollected={state.resourcesCollected}
              cause={state.deathCause}
              onRestart={handleRestart}
            />
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

          {/* Achievement Notifications */}
          {state.achievementNotifications.map((achievement, index) => (
            <AchievementNotification
              key={achievement.id}
              achievement={achievement}
              onClose={() => handleCloseAchievementNotification(index)}
            />
          ))}
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

  setNewGameCallback(callback: () => void) {
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

  dispose() {
    this.root.unmount();
  }
}
