import React, { useState, useEffect } from 'react';
import type { TimeControl, SpeedMultiplier } from '../../core/TimeControl';

interface TimeControlPanelProps {
  timeControl: TimeControl;
}

export const TimeControlPanel: React.FC<TimeControlPanelProps> = ({ timeControl }) => {
  const [speed, setSpeed] = useState<SpeedMultiplier>(timeControl.getSpeedMultiplier());
  const [isPaused, setIsPaused] = useState(timeControl.isPausedState());

  useEffect(() => {
    const listener = (newSpeed: SpeedMultiplier, paused: boolean) => {
      setSpeed(newSpeed);
      setIsPaused(paused);
    };

    timeControl.addListener(listener);
    return () => timeControl.removeListener(listener);
  }, [timeControl]);

  const handleSpeedChange = (newSpeed: SpeedMultiplier) => {
    timeControl.setSpeedMultiplier(newSpeed);
  };

  const handlePauseToggle = () => {
    timeControl.togglePause();
  };

  const handleStep = () => {
    timeControl.step();
  };

  const speeds: SpeedMultiplier[] = [1, 10, 100, 1000];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.9)',
        padding: '15px 20px',
        borderRadius: '12px',
        border: '2px solid #333',
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        zIndex: 100,
      }}
    >
      {/* Pause/Resume Button */}
      <button
        onClick={handlePauseToggle}
        style={{
          padding: '8px 16px',
          background: isPaused ? '#4ade80' : '#ef4444',
          color: '#000',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '14px',
        }}
      >
        {isPaused ? '▶ Resume' : '⏸ Pause'}
      </button>

      {/* Step Button */}
      <button
        onClick={handleStep}
        disabled={!isPaused}
        style={{
          padding: '8px 16px',
          background: isPaused ? '#60a5fa' : '#333',
          color: isPaused ? '#000' : '#666',
          border: 'none',
          borderRadius: '6px',
          cursor: isPaused ? 'pointer' : 'not-allowed',
          fontWeight: 'bold',
          fontSize: '14px',
        }}
      >
        ⏭ Step
      </button>

      {/* Speed Divider */}
      <div style={{ width: '2px', height: '30px', background: '#444' }} />

      {/* Speed Label */}
      <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>Speed:</span>

      {/* Speed Buttons */}
      {speeds.map(s => (
        <button
          key={s}
          onClick={() => handleSpeedChange(s)}
          style={{
            padding: '8px 16px',
            background: speed === s ? '#60a5fa' : '#333',
            color: speed === s ? '#000' : '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: speed === s ? 'bold' : 'normal',
            fontSize: '14px',
            minWidth: '60px',
          }}
        >
          {s}x
        </button>
      ))}

      {/* Current Status */}
      <div
        style={{
          marginLeft: '10px',
          padding: '8px 12px',
          background: '#1a1a1a',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#888',
        }}
      >
        {isPaused ? '⏸ PAUSED' : `▶ ${speed}x`}
      </div>
    </div>
  );
};
