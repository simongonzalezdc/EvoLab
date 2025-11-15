// Control panel for new evolution features (physics, reproduction mode, speciation)

import React from 'react';

interface Props {
  physicsEnabled: boolean;
  reproductionMode: 'asexual' | 'sexual';
  speciationEnabled: boolean;
  onTogglePhysics: () => void;
  onToggleReproductionMode: () => void;
  onToggleSpeciation: () => void;
  onShowPhylogeneticTree: () => void;
  speciesCount: number;
  matingStats?: {
    cellsSeekingMate: number;
    cellsDisplaying: number;
  };
}

export const EvolutionControlPanel: React.FC<Props> = ({
  physicsEnabled,
  reproductionMode,
  speciationEnabled,
  onTogglePhysics,
  onToggleReproductionMode,
  onToggleSpeciation,
  onShowPhylogeneticTree,
  speciesCount,
  matingStats,
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '120px',
        right: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        border: '2px solid #4caf50',
        borderRadius: '8px',
        padding: '15px',
        minWidth: '250px',
        color: 'white',
        fontFamily: 'monospace',
        fontSize: '13px',
        zIndex: 100,
      }}
    >
      <h3 style={{ margin: '0 0 15px 0', color: '#4caf50', fontSize: '16px' }}>
        Evolution Controls
      </h3>

      {/* Physics Toggle */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={physicsEnabled}
            onChange={onTogglePhysics}
            style={{ marginRight: '8px' }}
          />
          <span>Matter.js Physics</span>
        </label>
        <div style={{ fontSize: '11px', color: '#aaa', marginLeft: '24px', marginTop: '4px' }}>
          Realistic collisions and forces
        </div>
      </div>

      {/* Reproduction Mode Toggle */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px', color: '#4caf50' }}>
          Reproduction Mode:
        </label>
        <button
          onClick={onToggleReproductionMode}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: reproductionMode === 'sexual' ? '#2196f3' : '#9c27b0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'monospace',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          {reproductionMode === 'sexual' ? '♂♀ Sexual' : '⚪ Asexual'}
        </button>
        <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
          {reproductionMode === 'sexual'
            ? 'Two-parent genetic crossover'
            : 'Single-parent cloning'}
        </div>
      </div>

      {/* Sexual Reproduction Stats */}
      {reproductionMode === 'sexual' && matingStats && (
        <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: 'rgba(33, 150, 243, 0.2)', borderRadius: '4px' }}>
          <div style={{ fontSize: '11px', color: '#aaa' }}>
            🔍 Seeking mate: {matingStats.cellsSeekingMate}
          </div>
          <div style={{ fontSize: '11px', color: '#aaa' }}>
            💃 Displaying: {matingStats.cellsDisplaying}
          </div>
        </div>
      )}

      {/* Speciation Toggle */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={speciationEnabled}
            onChange={onToggleSpeciation}
            style={{ marginRight: '8px' }}
          />
          <span>Speciation Tracking</span>
        </label>
        <div style={{ fontSize: '11px', color: '#aaa', marginLeft: '24px', marginTop: '4px' }}>
          Track species divergence
        </div>
      </div>

      {/* Species Count */}
      {speciationEnabled && (
        <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: 'rgba(76, 175, 80, 0.2)', borderRadius: '4px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#4caf50' }}>
            🧬 Species: {speciesCount}
          </div>
          <button
            onClick={onShowPhylogeneticTree}
            style={{
              marginTop: '8px',
              width: '100%',
              padding: '6px',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '11px',
            }}
          >
            View Phylogenetic Tree
          </button>
        </div>
      )}

      {/* Info */}
      <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #444', fontSize: '10px', color: '#888' }}>
        <div>💡 Tip: Enable physics for realistic interactions!</div>
        {reproductionMode === 'sexual' && (
          <div style={{ marginTop: '4px' }}>
            💡 Sexual reproduction enables speciation
          </div>
        )}
      </div>
    </div>
  );
};
