import React from 'react';

interface DNAProgressBarProps {
  currentDNA: number;
  targetDNA: number;
  generation: number;
}

export const DNAProgressBar: React.FC<DNAProgressBarProps> = ({
  currentDNA,
  targetDNA,
  generation,
}) => {
  const progress = Math.min((currentDNA / targetDNA) * 100, 100);
  const isReady = currentDNA >= targetDNA;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.85)',
        padding: '15px 20px',
        borderRadius: '12px',
        border: `2px solid ${isReady ? '#10b981' : '#3b82f6'}`,
        minWidth: '250px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        fontFamily: 'monospace',
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#60a5fa', fontSize: '14px', fontWeight: 'bold' }}>
          🧬 Generation {generation}
        </span>
        <span style={{ color: isReady ? '#10b981' : '#94a3b8', fontSize: '12px' }}>
          {isReady ? '✅ Ready to evolve!' : `${currentDNA.toFixed(1)}/${targetDNA} DNA`}
        </span>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '24px',
          background: 'rgba(30, 41, 59, 0.8)',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid rgba(100, 116, 139, 0.3)',
        }}
      >
        {/* Progress Fill */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${progress}%`,
            background: isReady
              ? 'linear-gradient(90deg, #10b981, #34d399)'
              : 'linear-gradient(90deg, #3b82f6, #60a5fa)',
            transition: 'width 0.3s ease-out',
            boxShadow: isReady
              ? '0 0 10px rgba(16, 185, 129, 0.5)'
              : '0 0 10px rgba(59, 130, 246, 0.5)',
          }}
        />

        {/* Progress Percentage Text */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 'bold',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            zIndex: 1,
          }}
        >
          {progress.toFixed(0)}%
        </div>
      </div>

      {/* Help Text */}
      {!isReady && (
        <div style={{ marginTop: '8px', fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
          Collect resources and survive to earn DNA points
        </div>
      )}
      {isReady && (
        <div style={{ marginTop: '8px', fontSize: '11px', color: '#10b981', textAlign: 'center', fontWeight: 'bold' }}>
          Press space or use menu to evolve your species!
        </div>
      )}
    </div>
  );
};
