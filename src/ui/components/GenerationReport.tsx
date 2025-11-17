// Generation Report modal shown after reproduction

import React from 'react';
import FocusLock from 'react-focus-lock';

interface GenerationReportProps {
  generation: number;
  survivalTime: number;
  resourcesCollected: number;
  mutations: string[];
  dnaPointsEarned: number;
  onContinue: () => void;
}

export const GenerationReport: React.FC<GenerationReportProps> = ({
  generation,
  survivalTime,
  resourcesCollected,
  mutations,
  dnaPointsEarned,
  onContinue,
}) => {
  // Handle ESC key or Enter to continue
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        onContinue();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onContinue]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="generation-report-title"
    >
      <FocusLock returnFocus>
        <div className="generation-report">
        <h2 id="generation-report-title" className="report-title">
          🎉 Generation {generation - 1} Complete!
        </h2>

        <div className="report-content">
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Survival Time</div>
              <div className="stat-value">{formatTime(survivalTime)}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Resources Collected</div>
              <div className="stat-value">{resourcesCollected}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">DNA Points Earned</div>
              <div className="stat-value">+{dnaPointsEarned.toFixed(1)}</div>
            </div>
          </div>

          {mutations.length > 0 && (
            <div className="mutations-section">
              <h3>🧬 New Mutations</h3>
              <div className="mutations-list">
                {mutations.map((mutation, index) => (
                  <div key={index} className="mutation-item">
                    {mutation}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="generation-info">
            <p>You are now entering <strong>Generation {generation}</strong></p>
            <p>Use your DNA points to evolve and adapt to your environment!</p>
          </div>
        </div>

        <div className="report-footer">
          <button onClick={onContinue} className="btn btn-primary btn-large">
            Continue to Next Generation →
          </button>
        </div>
        </div>
      </FocusLock>

      <style>{`
        .modal-overlay {
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

        .generation-report {
          background: linear-gradient(135deg, #1a1e2e 0%, #2d3548 100%);
          border-radius: 16px;
          width: 90%;
          max-width: 600px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          border: 2px solid #4caf50;
        }

        .report-title {
          text-align: center;
          color: #4caf50;
          margin: 0 0 30px 0;
          font-size: 32px;
        }

        .report-content {
          margin-bottom: 30px;
        }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.05);
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }

        .stat-label {
          color: #aaa;
          font-size: 12px;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .stat-value {
          color: #4caf50;
          font-size: 24px;
          font-weight: bold;
          font-family: 'Courier New', monospace;
        }

        .mutations-section {
          background: rgba(76, 175, 80, 0.1);
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .mutations-section h3 {
          color: #4caf50;
          margin: 0 0 15px 0;
          font-size: 18px;
        }

        .mutations-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .mutation-item {
          background: rgba(76, 175, 80, 0.2);
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 13px;
          color: #fff;
          font-family: 'Courier New', monospace;
        }

        .generation-info {
          text-align: center;
          color: #ccc;
          font-size: 14px;
        }

        .generation-info p {
          margin: 8px 0;
        }

        .generation-info strong {
          color: #4caf50;
        }

        .report-footer {
          text-align: center;
        }

        .btn-large {
          padding: 16px 32px;
          font-size: 16px;
        }
      `}</style>
    </div>
  );
};
