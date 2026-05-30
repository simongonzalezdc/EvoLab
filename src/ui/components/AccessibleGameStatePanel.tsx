/**
 * AccessibleGameStatePanel - Provides a text-based representation of the game state
 * for users who cannot see the canvas or prefer textual information
 */

import React, { useState, useEffect } from 'react';

export interface GameStateData {
  // Species info
  population: number;
  generation: number;
  averageHealth: number;
  averageHealthPercent: number;
  averageATP: number;
  averageATPPercent: number;

  // Resources
  totalResourcesCollected: number;
  dnaPoints: number;

  // Location
  currentBiome: string;
  biomeName: string;
  biomeDescription: string;

  // Threats
  nearbyThreats: number;
  combatIntensity: 'none' | 'low' | 'moderate' | 'high';

  // Environment
  timeOfDay: string;
  temperature: 'cold' | 'normal' | 'hot';
  hazards: string[];

  // Performance
  survivalTime: number;
  diversity: number;
}

interface AccessibleGameStatePanelProps {
  gameState: GameStateData;
  updateInterval?: number; // milliseconds
  isVisible: boolean;
  onToggle: () => void;
}

export const AccessibleGameStatePanel: React.FC<AccessibleGameStatePanelProps> = ({
  gameState,
  updateInterval = 2000,
  isVisible,
  onToggle,
}) => {
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdate(Date.now());
    }, updateInterval);

    return () => clearInterval(timer);
  }, [updateInterval]);

  if (!isVisible) {
    return (
      <button
        className="accessible-state-toggle"
        onClick={onToggle}
        aria-label="Show accessible game state panel"
        aria-expanded="false"
      >
        📊 Show Game State
      </button>
    );
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const getStatusIndicator = (percent: number): string => {
    if (percent > 75) return '🟢 Good';
    if (percent > 50) return '🟡 Fair';
    if (percent > 25) return '🟠 Low';
    return '🔴 Critical';
  };

  return (
    <aside
      className="accessible-game-state-panel"
      role="complementary"
      aria-label="Game state information"
      aria-live="polite"
      aria-atomic="false"
    >
      <div className="panel-header">
        <h2 id="game-state-title">Game State</h2>
        <button
          className="panel-close-btn"
          onClick={onToggle}
          aria-label="Hide game state panel"
        >
          ✕
        </button>
      </div>

      <div className="panel-content">
        {/* Species Status Section */}
        <section aria-labelledby="species-status-heading">
          <h3 id="species-status-heading">Species Status</h3>
          <dl>
            <div className="state-item">
              <dt>Generation:</dt>
              <dd>{gameState.generation}</dd>
            </div>
            <div className="state-item">
              <dt>Population:</dt>
              <dd>{gameState.population} cells</dd>
            </div>
            <div className="state-item">
              <dt>Survival Time:</dt>
              <dd>{formatTime(gameState.survivalTime)}</dd>
            </div>
            <div className="state-item">
              <dt>Diversity Index:</dt>
              <dd>{gameState.diversity.toFixed(2)}</dd>
            </div>
          </dl>
        </section>

        {/* Health & Energy Section */}
        <section aria-labelledby="vitals-heading">
          <h3 id="vitals-heading">Health & Energy (Average)</h3>
          <dl>
            <div className="state-item">
              <dt>Health:</dt>
              <dd>
                {Math.round(gameState.averageHealth)} / {Math.round(gameState.averageHealth / (gameState.averageHealthPercent / 100))}
                <span className="status-indicator" aria-label={`Status: ${getStatusIndicator(gameState.averageHealthPercent)}`}>
                  {' '}{getStatusIndicator(gameState.averageHealthPercent)}
                </span>
              </dd>
            </div>
            <div className="state-item">
              <dt>Energy (ATP):</dt>
              <dd>
                {Math.round(gameState.averageATP)} / {Math.round(gameState.averageATP / (gameState.averageATPPercent / 100))}
                <span className="status-indicator" aria-label={`Status: ${getStatusIndicator(gameState.averageATPPercent)}`}>
                  {' '}{getStatusIndicator(gameState.averageATPPercent)}
                </span>
              </dd>
            </div>
          </dl>
        </section>

        {/* Location Section */}
        <section aria-labelledby="location-heading">
          <h3 id="location-heading">Location</h3>
          <dl>
            <div className="state-item">
              <dt>Current Biome:</dt>
              <dd>{gameState.biomeName}</dd>
            </div>
            <div className="state-item">
              <dt>Description:</dt>
              <dd>{gameState.biomeDescription}</dd>
            </div>
            <div className="state-item">
              <dt>Time of Day:</dt>
              <dd>{gameState.timeOfDay}</dd>
            </div>
            <div className="state-item">
              <dt>Temperature:</dt>
              <dd>{gameState.temperature}</dd>
            </div>
          </dl>
        </section>

        {/* Threats Section */}
        <section aria-labelledby="threats-heading">
          <h3 id="threats-heading">Threats & Hazards</h3>
          <dl>
            <div className="state-item">
              <dt>Nearby Threats:</dt>
              <dd>{gameState.nearbyThreats} predators detected</dd>
            </div>
            <div className="state-item">
              <dt>Combat Intensity:</dt>
              <dd className={`combat-${gameState.combatIntensity}`}>
                {gameState.combatIntensity.toUpperCase()}
              </dd>
            </div>
            {gameState.hazards.length > 0 && (
              <div className="state-item">
                <dt>Environmental Hazards:</dt>
                <dd>
                  <ul>
                    {gameState.hazards.map((hazard, index) => (
                      <li key={index}>{hazard}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
          </dl>
        </section>

        {/* Resources Section */}
        <section aria-labelledby="resources-heading">
          <h3 id="resources-heading">Resources</h3>
          <dl>
            <div className="state-item">
              <dt>Total Collected:</dt>
              <dd>{gameState.totalResourcesCollected}</dd>
            </div>
            <div className="state-item">
              <dt>DNA Points:</dt>
              <dd>{Math.floor(gameState.dnaPoints)}</dd>
            </div>
          </dl>
        </section>

        <div className="panel-footer">
          <small>
            Updates every {updateInterval / 1000} seconds
          </small>
        </div>
      </div>

      <style>{`
        .accessible-game-state-panel {
          position: fixed;
          top: 60px;
          right: 20px;
          width: 320px;
          max-height: calc(100vh - 80px);
          background: var(--bg-secondary, rgba(0, 0, 0, 0.9));
          border: 2px solid var(--border-color, #4CAF50);
          border-radius: 8px;
          padding: 16px;
          font-family: 'Courier New', monospace;
          font-size: var(--font-size, 14px);
          color: var(--text-primary, #fff);
          overflow-y: auto;
          z-index: 900;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }

        .accessible-state-toggle {
          position: fixed;
          top: 60px;
          right: 20px;
          padding: 8px 16px;
          background: var(--accent-primary, #4CAF50);
          color: var(--text-primary, #fff);
          border: 2px solid var(--border-color, #4CAF50);
          border-radius: 4px;
          cursor: pointer;
          font-size: var(--font-size, 14px);
          font-weight: bold;
          z-index: 900;
          transition: background 0.2s;
        }

        .accessible-state-toggle:hover,
        .accessible-state-toggle:focus {
          background: var(--accent-secondary, #2E7D32);
          outline: 3px solid var(--accent-primary, #4CAF50);
          outline-offset: 2px;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 2px solid var(--border-color, #4CAF50);
        }

        .panel-header h2 {
          margin: 0;
          font-size: 1.2em;
          color: var(--accent-primary, #4CAF50);
        }

        .panel-close-btn {
          background: transparent;
          border: none;
          color: var(--text-primary, #fff);
          font-size: 1.5em;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          line-height: 1;
        }

        .panel-close-btn:hover,
        .panel-close-btn:focus {
          color: var(--accent-primary, #4CAF50);
          outline: 2px solid var(--accent-primary, #4CAF50);
          outline-offset: 2px;
        }

        .panel-content section {
          margin-bottom: 20px;
        }

        .panel-content h3 {
          font-size: 1em;
          margin: 0 0 8px 0;
          color: var(--accent-primary, #4CAF50);
          border-bottom: 1px solid var(--border-color, #4CAF50);
          padding-bottom: 4px;
        }

        .panel-content dl {
          margin: 0;
        }

        .state-item {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          gap: 8px;
        }

        .state-item dt {
          font-weight: bold;
          color: var(--text-secondary, #d0d0d0);
        }

        .state-item dd {
          margin: 0;
          text-align: right;
          flex: 1;
        }

        .status-indicator {
          margin-left: 8px;
        }

        .combat-none { color: #4CAF50; }
        .combat-low { color: #FFD700; }
        .combat-moderate { color: #FF9800; }
        .combat-high { color: #F44336; }

        .panel-footer {
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid var(--border-color, #4CAF50);
          text-align: center;
          color: var(--text-secondary, #d0d0d0);
        }

        .state-item ul {
          margin: 0;
          padding-left: 20px;
          list-style-type: disc;
        }

        .state-item li {
          color: var(--text-primary, #fff);
        }

        /* High contrast mode support */
        body.high-contrast .accessible-game-state-panel {
          background: var(--bg-secondary, #000);
          border-color: var(--border-color, #fff);
        }

        /* Reduce motion support */
        @media (prefers-reduced-motion: reduce) {
          .accessible-state-toggle,
          .panel-close-btn {
            transition: none;
          }
        }

        body.reduce-motion .accessible-state-toggle,
        body.reduce-motion .panel-close-btn {
          transition: none;
        }
      `}</style>
    </aside>
  );
};
