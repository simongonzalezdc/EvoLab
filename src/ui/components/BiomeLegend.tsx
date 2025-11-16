// Biome Legend Component - Shows all biome types with colors and descriptions

import React, { useState } from 'react';
import { getAllBiomeInfos } from '../../environment/BiomeInfo';

interface BiomeLegendProps {
  onToggle?: () => void;
}

export const BiomeLegend: React.FC<BiomeLegendProps> = ({ onToggle }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const biomes = getAllBiomeInfos();

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    onToggle?.();
  };

  const colorToHex = (color: number): string => {
    return '#' + color.toString(16).padStart(6, '0');
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        border: '2px solid #4caf50',
        borderRadius: '8px',
        padding: isCollapsed ? '8px 12px' : '15px',
        minWidth: isCollapsed ? 'auto' : '280px',
        maxWidth: isCollapsed ? 'auto' : '320px',
        maxHeight: isCollapsed ? 'auto' : '70vh',
        overflowY: 'auto',
        color: 'white',
        fontFamily: 'monospace',
        fontSize: '13px',
        zIndex: 100,
        transition: 'all 0.3s ease',
        cursor: isCollapsed ? 'pointer' : 'default',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: isCollapsed ? '0' : '15px',
          cursor: 'pointer',
        }}
        onClick={handleToggle}
      >
        <h3 style={{ margin: '0', color: '#4caf50', fontSize: '16px' }}>
          {isCollapsed ? '🗺️' : '🗺️ Biome Legend'}
        </h3>
        <button
          style={{
            background: 'transparent',
            border: 'none',
            color: '#4caf50',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '0 5px',
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
        >
          {isCollapsed ? '▶' : '▼'}
        </button>
      </div>

      {!isCollapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {biomes.map((biome) => (
            <div
              key={biome.type}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '8px',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderRadius: '4px',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: colorToHex(biome.color),
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '3px',
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 'bold',
                    color: '#4caf50',
                    marginBottom: '4px',
                  }}
                >
                  {biome.name}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#ccc',
                    lineHeight: '1.4',
                  }}
                >
                  {biome.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

