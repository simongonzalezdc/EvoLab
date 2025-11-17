import React, { useState, useEffect } from 'react';
import FocusLock from 'react-focus-lock';
import type { SaveSystem, SavedSimulation, SavedCreature } from '../../data/SaveSystem';

interface SaveLoadPanelProps {
  saveSystem: SaveSystem;
  onLoad: (save: SavedSimulation) => void;
  onLoadCreature: (creature: SavedCreature) => void;
  onClose: () => void;
}

export const SaveLoadPanel: React.FC<SaveLoadPanelProps> = ({
  saveSystem,
  onLoad,
  onLoadCreature,
  onClose,
}) => {
  const [tab, setTab] = useState<'simulations' | 'creatures'>('simulations');
  const [simulations, setSimulations] = useState<SavedSimulation[]>([]);
  const [creatures, setCreatures] = useState<SavedCreature[]>([]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const sims = await saveSystem.getAllSimulations();
    const crts = await saveSystem.getAllCreatures();
    setSimulations(sims);
    setCreatures(crts);
  };

  const handleDeleteSimulation = async (id: number) => {
    if (confirm('Are you sure you want to delete this simulation?')) {
      await saveSystem.deleteSimulation(id);
      await loadData();
    }
  };

  const handleDeleteCreature = async (id: number) => {
    if (confirm('Are you sure you want to delete this creature?')) {
      await saveSystem.deleteCreature(id);
      await loadData();
    }
  };

  const handleExportSimulation = async (id: number) => {
    const sim = await saveSystem.loadSimulation(id);
    if (sim) {
      const dataStr = JSON.stringify(sim, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `evolab-save-${sim.name}-${Date.now()}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  const handleExportCreature = async (id: number) => {
    const creature = await saveSystem.loadCreature(id);
    if (creature) {
      const json = saveSystem.exportCreatureToJSON(creature.genome, creature.name);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(json);
      const exportFileDefaultName = `evolab-creature-${creature.name}-${Date.now()}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  const handleImportCreature = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        const imported = saveSystem.importCreatureFromJSON(text);
        if (imported) {
          await saveSystem.saveCreature(imported.name, imported.genome);
          await loadData();
          alert('Creature imported successfully!');
        } else {
          alert('Failed to import creature. Invalid file format.');
        }
      }
    };
    input.click();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="saveload-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <FocusLock returnFocus>
        <div
          style={{
            background: '#1a1a1a',
            border: '2px solid #333',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
          onClick={e => e.stopPropagation()}
        >
          <h2 id="saveload-title" style={{ margin: '0 0 20px 0', color: '#fff', fontSize: '24px' }}>Load Save</h2>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => setTab('simulations')}
            style={{
              padding: '10px 20px',
              background: tab === 'simulations' ? '#60a5fa' : '#333',
              color: tab === 'simulations' ? '#000' : '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: tab === 'simulations' ? 'bold' : 'normal',
            }}
          >
            Simulations ({simulations.length})
          </button>
          <button
            onClick={() => setTab('creatures')}
            style={{
              padding: '10px 20px',
              background: tab === 'creatures' ? '#60a5fa' : '#333',
              color: tab === 'creatures' ? '#000' : '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: tab === 'creatures' ? 'bold' : 'normal',
            }}
          >
            Creatures ({creatures.length})
          </button>
        </div>

        {/* Simulations Tab */}
        {tab === 'simulations' && (
          <div>
            {simulations.length === 0 ? (
              <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
                No saved simulations found
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {simulations.map(sim => (
                  <div
                    key={sim.id}
                    style={{
                      background: '#222',
                      padding: '15px',
                      borderRadius: '8px',
                      border: '1px solid #333',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', color: '#fff' }}>{sim.name}</h4>
                        <p style={{ margin: '0', color: '#888', fontSize: '12px' }}>
                          Generation {sim.generation} • {formatDate(sim.timestamp)}
                        </p>
                        <p style={{ margin: '5px 0 0 0', color: '#888', fontSize: '12px' }}>
                          Population: H:{sim.populationData.herbivores} C:{sim.populationData.carnivores} O:
                          {sim.populationData.omnivores}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          onClick={() => sim.id && onLoad(sim)}
                          style={{
                            padding: '8px 12px',
                            background: '#4ade80',
                            color: '#000',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold',
                          }}
                        >
                          Load
                        </button>
                        <button
                          onClick={() => sim.id && handleExportSimulation(sim.id)}
                          style={{
                            padding: '8px 12px',
                            background: '#60a5fa',
                            color: '#000',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                          }}
                        >
                          Export
                        </button>
                        <button
                          onClick={() => sim.id && handleDeleteSimulation(sim.id)}
                          style={{
                            padding: '8px 12px',
                            background: '#ef4444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Creatures Tab */}
        {tab === 'creatures' && (
          <div>
            <div style={{ marginBottom: '15px' }}>
              <button
                onClick={handleImportCreature}
                style={{
                  padding: '10px 20px',
                  background: '#60a5fa',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Import Creature
              </button>
            </div>

            {creatures.length === 0 ? (
              <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
                No saved creatures found
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {creatures.map(creature => (
                  <div
                    key={creature.id}
                    style={{
                      background: '#222',
                      padding: '15px',
                      borderRadius: '8px',
                      border: '1px solid #333',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', color: '#fff' }}>{creature.name}</h4>
                        <p style={{ margin: '0', color: '#888', fontSize: '12px' }}>
                          {formatDate(creature.timestamp)}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          onClick={() => onLoadCreature(creature)}
                          style={{
                            padding: '8px 12px',
                            background: '#4ade80',
                            color: '#000',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold',
                          }}
                        >
                          Load
                        </button>
                        <button
                          onClick={() => creature.id && handleExportCreature(creature.id)}
                          style={{
                            padding: '8px 12px',
                            background: '#60a5fa',
                            color: '#000',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                          }}
                        >
                          Export
                        </button>
                        <button
                          onClick={() => creature.id && handleDeleteCreature(creature.id)}
                          style={{
                            padding: '8px 12px',
                            background: '#ef4444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Close Button */}
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
        </div>
      </FocusLock>
    </div>
  );
};
