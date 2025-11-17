import React from 'react';
import FocusLock from 'react-focus-lock';

interface DeathScreenProps {
  generation: number;
  survivalTime: number;
  resourcesCollected: number;
  cause: 'atp' | 'health';
  onRestart: () => void;
}

export const DeathScreen: React.FC<DeathScreenProps> = ({
  generation,
  survivalTime,
  resourcesCollected,
  cause,
  onRestart,
}) => {
  // Handle ESC key to restart (or could disable for death screen)
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onRestart();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onRestart]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const causeMessage = cause === 'atp'
    ? 'Your cell ran out of ATP energy!'
    : 'Your cell took too much damage!';

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="death-screen-title"
      aria-describedby="death-screen-cause"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
      }}
    >
      <FocusLock returnFocus>
        <div
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2a0a0a 100%)',
          border: '3px solid #ef4444',
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '500px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 0 40px rgba(239, 68, 68, 0.5)',
        }}
      >
        {/* Skull Icon */}
        <div style={{ fontSize: '72px', marginBottom: '20px' }}>💀</div>

        {/* Title */}
        <h1 id="death-screen-title" style={{
          margin: '0 0 10px 0',
          color: '#ef4444',
          fontSize: '36px',
          textShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
        }}>
          EXTINCTION
        </h1>

        {/* Cause */}
        <p id="death-screen-cause" style={{ margin: '0 0 30px 0', color: '#ff9999', fontSize: '18px' }}>
          {causeMessage}
        </p>

        {/* Stats */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '30px',
          }}
        >
          <h3 style={{ margin: '0 0 15px 0', color: '#fff', fontSize: '20px' }}>
            Final Statistics
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <div style={{ color: '#888', fontSize: '14px', marginBottom: '5px' }}>
                Generation Reached
              </div>
              <div style={{ color: '#60a5fa', fontSize: '24px', fontWeight: 'bold' }}>
                {generation}
              </div>
            </div>

            <div>
              <div style={{ color: '#888', fontSize: '14px', marginBottom: '5px' }}>
                Survival Time
              </div>
              <div style={{ color: '#4ade80', fontSize: '24px', fontWeight: 'bold' }}>
                {formatTime(survivalTime)}
              </div>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ color: '#888', fontSize: '14px', marginBottom: '5px' }}>
                Resources Collected
              </div>
              <div style={{ color: '#fbbf24', fontSize: '24px', fontWeight: 'bold' }}>
                {resourcesCollected}
              </div>
            </div>
          </div>
        </div>

        {/* Restart Button */}
        <button
          onClick={onRestart}
          style={{
            padding: '15px 40px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '18px',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 30px rgba(239, 68, 68, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(239, 68, 68, 0.4)';
          }}
        >
          🔄 Restart Evolution
        </button>

        {/* Tip */}
        <p style={{
          margin: '20px 0 0 0',
          color: '#666',
          fontSize: '14px',
          fontStyle: 'italic',
        }}>
          Try evolving different traits for better survival!
        </p>
        </div>
      </FocusLock>
    </div>
  );
};
