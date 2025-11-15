import React from 'react';
import { PopulationGraph } from './PopulationGraph';
import { EvolutionTree } from './EvolutionTree';
import { TraitRadarChart } from './TraitRadarChart';
import type { PopulationDataPoint, LineageNode } from '../../data/HistoryTracker';
import type { Traits } from '../../types/entities';

interface StatsPanelProps {
  populationData: PopulationDataPoint[];
  lineageData: Map<string, LineageNode>;
  currentTraits: Traits;
  generation: number;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  populationData,
  lineageData,
  currentTraits,
  generation,
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        left: '20px',
        bottom: '100px',
        maxWidth: '900px',
        maxHeight: '70vh',
        overflowY: 'auto',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        pointerEvents: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.9)',
          padding: '15px',
          borderRadius: '8px',
          border: '2px solid #60a5fa',
        }}
      >
        <h2 style={{ margin: 0, color: '#60a5fa', fontSize: '20px' }}>
          📊 Statistics - Generation {generation}
        </h2>
      </div>

      {/* Population Graph */}
      {populationData.length > 1 && <PopulationGraph data={populationData} width={600} height={250} />}

      {/* Two Column Layout */}
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        {/* Trait Radar */}
        <TraitRadarChart traits={currentTraits} width={400} height={400} />

        {/* Evolution Tree (if we have lineage data) */}
        {lineageData.size > 0 && (
          <div style={{ flex: 1, minWidth: '400px' }}>
            <EvolutionTree lineageData={lineageData} width={400} height={400} />
          </div>
        )}
      </div>

      {/* Population Summary */}
      {populationData.length > 0 && (() => {
        const latest = populationData[populationData.length - 1];
        return latest && (
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              padding: '15px',
              borderRadius: '8px',
            }}
          >
            <h3 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '16px' }}>
              Current Population
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#4ade80', fontSize: '24px', fontWeight: 'bold' }}>
                  {latest.herbivores}
                </div>
                <div style={{ color: '#888', fontSize: '12px' }}>Herbivores</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#ef4444', fontSize: '24px', fontWeight: 'bold' }}>
                  {latest.carnivores}
                </div>
                <div style={{ color: '#888', fontSize: '12px' }}>Carnivores</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#fbbf24', fontSize: '24px', fontWeight: 'bold' }}>
                  {latest.omnivores}
                </div>
                <div style={{ color: '#888', fontSize: '12px' }}>Omnivores</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#60a5fa', fontSize: '24px', fontWeight: 'bold' }}>
                  {latest.total}
                </div>
                <div style={{ color: '#888', fontSize: '12px' }}>Total</div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
