// UI Controller for managing React UI state

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { TraitEditor } from './components/TraitEditor';
import { GenerationReport } from './components/GenerationReport';
import type { Traits } from '../types/entities';

interface UIState {
  showTraitEditor: boolean;
  showGenerationReport: boolean;
  currentTraits: Traits | null;
  generation: number;
  availableDNA: number;
  survivalTime: number;
  resourcesCollected: number;
  mutations: string[];
  dnaPointsEarned: number;
}

export class UIController {
  private root: ReturnType<typeof createRoot>;
  private setState: React.Dispatch<React.SetStateAction<UIState>> | null = null;
  private onApplyModifications: ((mods: Partial<Traits>) => void) | null = null;
  private onContinue: (() => void) | null = null;

  constructor() {
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
        currentTraits: null,
        generation: 1,
        availableDNA: 0,
        survivalTime: 0,
        resourcesCollected: 0,
        mutations: [],
        dnaPointsEarned: 0,
      });

      useEffect(() => {
        this.setState = setState;
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

      return (
        <>
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

          {state.showTraitEditor && state.currentTraits && (
            <TraitEditor
              currentTraits={state.currentTraits}
              availableDNA={state.availableDNA}
              generation={state.generation}
              onApply={handleApplyModifications}
              onCancel={handleCancel}
            />
          )}
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
    this.setState?.({
      showGenerationReport: true,
      showTraitEditor: false,
      currentTraits: null,
      ...data,
      availableDNA: 0,
    });
  }

  showTraitEditor(traits: Traits, generation: number, availableDNA: number) {
    this.setState?.({
      showTraitEditor: true,
      showGenerationReport: false,
      currentTraits: traits,
      generation,
      availableDNA,
      survivalTime: 0,
      resourcesCollected: 0,
      mutations: [],
      dnaPointsEarned: 0,
    });
  }

  onApply(callback: (mods: Partial<Traits>) => void) {
    this.onApplyModifications = callback;
  }

  onReportContinue(callback: () => void) {
    this.onContinue = callback;
  }

  dispose() {
    this.root.unmount();
  }
}
