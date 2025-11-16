// Zoom Controls Component

import React from 'react';

interface ZoomControlsProps {
  currentZoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  currentZoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}) => {
  const zoomPercent = Math.round(currentZoom * 100);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '320px', // Moved right to give HUD more space
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        border: '2px solid #4caf50',
        borderRadius: '8px',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        alignItems: 'center',
        zIndex: 90,
        fontFamily: 'monospace',
        fontSize: '14px',
        color: 'white',
      }}
    >
      <div style={{ color: '#4caf50', fontWeight: 'bold', marginBottom: '4px' }}>
        Zoom: {zoomPercent}%
      </div>
      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
        <button
          onClick={onZoomOut}
          style={{
            padding: '6px 12px',
            background: '#333',
            color: '#fff',
            border: '1px solid #4caf50',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
          title="Zoom Out (-)"
        >
          −
        </button>
        <button
          onClick={onResetZoom}
          style={{
            padding: '6px 12px',
            background: '#333',
            color: '#fff',
            border: '1px solid #4caf50',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
          title="Reset Zoom (0)"
        >
          Reset
        </button>
        <button
          onClick={onZoomIn}
          style={{
            padding: '6px 12px',
            background: '#333',
            color: '#fff',
            border: '1px solid #4caf50',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
          title="Zoom In (+)"
        >
          +
        </button>
      </div>
      <div style={{ fontSize: '10px', color: '#aaa', marginTop: '4px' }}>
        Scroll wheel or +/- keys
      </div>
    </div>
  );
};

