import React from 'react';
import FocusLock from 'react-focus-lock';
import type { SpeciesSetupOption } from '../../types/game';

interface GameSetupPanelProps {
  isOpen: boolean;
  species: SpeciesSetupOption[];
  onUpdateSpecies: (id: string, updates: Partial<SpeciesSetupOption>) => void;
  onAddSpecies: () => void;
  onRemoveSpecies: (id: string) => void;
  onStart: () => void;
  onCancel: () => void;
}

const SPECIES_TYPE_OPTIONS: Array<{ value: SpeciesSetupOption['type']; label: string; description: string }> = [
  { value: 'herbivore', label: 'Herbivore', description: 'Grazer that focuses on resources' },
  { value: 'carnivore', label: 'Carnivore', description: 'Aggressive predator' },
  { value: 'omnivore', label: 'Omnivore', description: 'Balanced opportunist' },
];

const MAX_SPECIES = 6;

export const GameSetupPanel: React.FC<GameSetupPanelProps> = ({
  isOpen,
  species,
  onUpdateSpecies,
  onAddSpecies,
  onRemoveSpecies,
  onStart,
  onCancel,
}) => {
  // Handle ESC key to close
  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gamesetup-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <FocusLock returnFocus>
        <div
          style={{
            width: 'min(720px, 100%)',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: '#0f172a',
            border: '2px solid #22d3ee',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.45)',
          }}
        >
          <h2 id="gamesetup-title" style={{ margin: 0, color: '#22d3ee' }}>Simulation Setup</h2>
        <p style={{ color: '#cbd5f5', marginTop: '8px', marginBottom: '16px', lineHeight: 1.4 }}>
          Choose how many rival species will appear and what ecological role they play. Starting a new
          simulation will reset your current progress.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {species.map((slot, index) => (
            <div
              key={slot.id}
              style={{
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '16px',
                background: 'rgba(15, 23, 42, 0.9)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#fff', fontWeight: 600 }}>Species {index + 1}</div>
                <button
                  onClick={() => onRemoveSpecies(slot.id)}
                  disabled={species.length <= 1}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: species.length <= 1 ? '#475569' : '#f87171',
                    cursor: species.length <= 1 ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                  }}
                >
                  Remove
                </button>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 220px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                    Archetype
                  </label>
                  <select
                    value={slot.type}
                    onChange={(e) => onUpdateSpecies(slot.id, { type: e.target.value as SpeciesSetupOption['type'] })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: '#020617',
                      color: '#f8fafc',
                    }}
                  >
                    {SPECIES_TYPE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <small style={{ color: '#94a3b8' }}>
                    {SPECIES_TYPE_OPTIONS.find(opt => opt.value === slot.type)?.description}
                  </small>
                </div>

                <div style={{ flex: '1 1 220px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                    Max Population: <strong style={{ color: '#f8fafc' }}>{slot.population}</strong>
                  </label>
                  <input
                    type="range"
                    min={3}
                    max={40}
                    step={1}
                    value={slot.population}
                    onChange={(e) => onUpdateSpecies(slot.id, { population: Number(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <button
            onClick={onAddSpecies}
            disabled={species.length >= MAX_SPECIES}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '2px dashed #22d3ee',
              background: 'transparent',
              color: '#22d3ee',
              cursor: species.length >= MAX_SPECIES ? 'not-allowed' : 'pointer',
            }}
          >
            + Add Species
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onCancel}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'transparent',
                color: '#fff',
              }}
            >
              Cancel
            </button>
            <button
              onClick={onStart}
              disabled={species.length === 0}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: 'none',
                background: species.length === 0 ? '#94a3b8' : '#22d3ee',
                color: '#0f172a',
                fontWeight: 600,
                cursor: species.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              Start Simulation
            </button>
          </div>
        </div>
        </div>
      </FocusLock>
    </div>
  );
};
