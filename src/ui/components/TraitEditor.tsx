// Trait Editor UI for modifying cell traits

import React, { useState } from 'react';
import type { Traits } from '../../types/entities';
import { TraitSystem } from '../../genetics/TraitSystem';
import { Config } from '../../core/Config';

interface TraitEditorProps {
  currentTraits: Traits;
  availableDNA: number;
  generation: number;
  onApply: (modifications: Partial<Traits>) => void;
}

export const TraitEditor: React.FC<TraitEditorProps> = ({
  currentTraits,
  availableDNA,
  generation,
  onApply,
}) => {
  const [modifications, setModifications] = useState<Partial<Traits>>({});
  const [dnaSpent, setDNASpent] = useState(0);

  const handleTraitChange = (traitKey: keyof Traits, newValue: number) => {
    const oldValue = currentTraits[traitKey] as number;
    const diff = Math.abs(newValue - oldValue);

    // Check if change exceeds ±2 limit
    if (diff > 2) {
      alert('Maximum change per generation is ±2 points');
      return;
    }

    const newModifications = { ...modifications, [traitKey]: newValue };
    const totalCost = calculateTotalCost(newModifications);

    if (totalCost > availableDNA) {
      alert('Insufficient DNA points!');
      return;
    }

    setModifications(newModifications);
    setDNASpent(totalCost);
  };

  const calculateTotalCost = (mods: Partial<Traits>): number => {
    let cost = 0;
    for (const [key, value] of Object.entries(mods)) {
      if (value !== undefined) {
        const oldValue = currentTraits[key as keyof Traits] as number;
        const diff = Math.abs((value as number) - oldValue);
        cost += diff * Config.DNA_COST_PER_TRAIT_CHANGE;
      }
    }
    return cost;
  };

  const handleApply = () => {
    onApply(modifications);
  };

  const handleCancel = () => {
    // Apply with no modifications to continue the game
    onApply({});
  };

  const handleReset = () => {
    setModifications({});
    setDNASpent(0);
  };

  const renderTraitSlider = (
    label: string,
    key: keyof Traits,
    min: number,
    max: number,
    step: number = 0.1
  ) => {
    const currentValue = currentTraits[key] as number;
    const modifiedValue = (modifications[key] as number) ?? currentValue;
    const hasChanged = modifiedValue !== currentValue;

    return (
      <div className="trait-row" key={key}>
        <label className="trait-label">
          {label}
          {hasChanged && <span className="changed-indicator">*</span>}
        </label>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={modifiedValue}
          onChange={e => handleTraitChange(key, parseFloat(e.target.value))}
          className="trait-slider"
        />
        <span className="trait-value">
          {modifiedValue.toFixed(1)}
          {hasChanged && (
            <span className="trait-diff">
              ({modifiedValue > currentValue ? '+' : ''}
              {(modifiedValue - currentValue).toFixed(1)})
            </span>
          )}
        </span>
      </div>
    );
  };

  return (
    <div className="trait-editor-overlay">
      <div className="trait-editor">
        <div className="editor-header">
          <h2>🧬 Trait Editor - Generation {generation}</h2>
          <div className="dna-display">
            DNA Points: {availableDNA - dnaSpent} / {availableDNA}
            {dnaSpent > 0 && <span className="dna-spent"> (-{dnaSpent})</span>}
          </div>
        </div>

        <div className="editor-content">
          <div className="trait-section">
            <h3>⚡ Energy & Metabolism</h3>
            {renderTraitSlider('Metabolism Rate', 'metabolismRate', 0.5, 2.0)}
            {renderTraitSlider('Energy Efficiency', 'energyEfficiency', 0.5, 1.5)}
            {renderTraitSlider('Photosynthesis', 'photosynthesis', 0, 1.0)}
          </div>

          <div className="trait-section">
            <h3>💪 Physical Stats</h3>
            {renderTraitSlider('Size', 'size', 1, 10, 0.5)}
            {renderTraitSlider('Speed', 'speed', 1, 10, 0.5)}
            {renderTraitSlider('Armor', 'armor', 0, 10, 0.5)}
            {renderTraitSlider('Regeneration', 'regeneration', 0, 5, 0.5)}
          </div>

          <div className="trait-section">
            <h3>👁️ Senses</h3>
            {renderTraitSlider('Vision Range', 'visionRange', 50, 500, 10)}
            {renderTraitSlider('Chemotaxis', 'chemotaxis', 0, 10, 0.5)}
            {renderTraitSlider('Hearing', 'hearing', 0, 10, 0.5)}
          </div>

          <div className="trait-section">
            <h3>🧠 Behavioral</h3>
            {renderTraitSlider('Aggression', 'aggression', 0, 10, 0.5)}
            {renderTraitSlider('Intelligence', 'intelligence', 0, 10, 0.5)}
            {renderTraitSlider('Fear Response', 'fearResponse', 0, 10, 0.5)}
          </div>

          <div className="trait-section">
            <h3>✨ Special Abilities</h3>
            {renderTraitSlider('Toxin Strength', 'toxinStrength', 0, 10, 0.5)}
            {renderTraitSlider('Speed Burst', 'speedBurstPower', 0, 10, 0.5)}
            {renderTraitSlider('Camouflage', 'camouflage', 0, 10, 0.5)}
          </div>

          <div className="trait-section">
            <h3>🌍 Environmental</h3>
            {renderTraitSlider('Temperature Tolerance', 'temperatureTolerance', 0, 10, 0.5)}
            {renderTraitSlider('Pressure Resistance', 'pressureResistance', 0, 10, 0.5)}
            {renderTraitSlider('Toxin Resistance', 'toxinResistance', 0, 10, 0.5)}
          </div>
        </div>

        <div className="editor-footer">
          <div className="button-group">
            <button onClick={handleReset} className="btn btn-secondary">
              Reset Changes
            </button>
            <button onClick={handleCancel} className="btn btn-secondary">
              Skip (No Changes)
            </button>
            <button onClick={handleApply} className="btn btn-primary">
              {Object.keys(modifications).length === 0 ? 'Continue (No Changes)' : 'Apply Modifications'}
            </button>
          </div>
          <div className="info-text">
            Maximum change per trait: ±2 points • Cost: 2 DNA points per unit
          </div>
        </div>
      </div>

      <style>{`
        .trait-editor-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .trait-editor {
          background: #1a1e2e;
          border-radius: 12px;
          width: 90%;
          max-width: 900px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }

        .editor-header {
          padding: 20px;
          background: linear-gradient(135deg, #2d3548 0%, #1a1e2e 100%);
          border-bottom: 2px solid #4caf50;
        }

        .editor-header h2 {
          margin: 0 0 10px 0;
          color: #4caf50;
          font-size: 24px;
        }

        .dna-display {
          font-size: 18px;
          color: #fff;
          font-family: 'Courier New', monospace;
        }

        .dna-spent {
          color: #ff9800;
        }

        .editor-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .trait-section {
          margin-bottom: 30px;
        }

        .trait-section h3 {
          color: #4caf50;
          margin-bottom: 15px;
          font-size: 18px;
        }

        .trait-row {
          display: grid;
          grid-template-columns: 200px 1fr 100px;
          gap: 15px;
          align-items: center;
          margin-bottom: 12px;
        }

        .trait-label {
          color: #aaa;
          font-size: 14px;
        }

        .changed-indicator {
          color: #ff9800;
          margin-left: 5px;
        }

        .trait-slider {
          width: 100%;
        }

        .trait-value {
          text-align: right;
          color: #fff;
          font-family: 'Courier New', monospace;
          font-size: 14px;
        }

        .trait-diff {
          color: #4caf50;
          margin-left: 5px;
        }

        .editor-footer {
          padding: 20px;
          background: #0f1219;
          border-top: 1px solid #333;
        }

        .button-group {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }

        .btn-primary {
          background: #4caf50;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #45a049;
        }

        .btn-primary:disabled {
          background: #555;
          cursor: not-allowed;
          opacity: 0.5;
        }

        .btn-secondary {
          background: #555;
          color: white;
        }

        .btn-secondary:hover {
          background: #666;
        }

        .info-text {
          color: #888;
          font-size: 12px;
          text-align: center;
        }
      `}</style>
    </div>
  );
};
