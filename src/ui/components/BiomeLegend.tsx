// Biome Legend Component - Shows all biome types with colors and descriptions

import React, { useState } from 'react';
import { getAllBiomeInfos, BiomeInfo } from '../../environment/BiomeInfo';
import { BiomeType } from '../../environment/BiomeGenerator';

interface BiomeLegendProps {
  onToggle?: () => void;
  onBiomeHover?: (biomeType: BiomeType | null) => void;
}

export const BiomeLegend: React.FC<BiomeLegendProps> = ({ onToggle, onBiomeHover }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredBiome, setHoveredBiome] = useState<BiomeType | null>(null);
  const allBiomes = getAllBiomeInfos();

  // Group and sort biomes: Shallow → Deep, Warm → Cold, Specials
  const shallowBiomes = allBiomes.filter(b => b.depth < 0.5 && !b.isVariant && b.type !== BiomeType.FROZEN);
  const deepBiomes = allBiomes.filter(b => b.depth >= 0.5 && !b.isVariant && b.type !== BiomeType.ABYSS);
  const specialBiomes = allBiomes.filter(b => 
    b.type === BiomeType.VOLCANIC || 
    b.type === BiomeType.FROZEN || 
    b.type === BiomeType.ABYSS ||
    b.type === BiomeType.TOXIC ||
    b.type === BiomeType.NUTRIENT_RICH ||
    b.type === BiomeType.BARREN
  );
  const variantBiomes = allBiomes.filter(b => b.isVariant);

  // Sort within groups: warm to cold
  const sortByTemperature = (a: BiomeInfo, b: BiomeInfo) => b.temperature - a.temperature;
  shallowBiomes.sort(sortByTemperature);
  deepBiomes.sort(sortByTemperature);
  specialBiomes.sort(sortByTemperature);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    onToggle?.();
  };

  const colorToHex = (color: number): string => {
    return '#' + color.toString(16).padStart(6, '0');
  };

  const handleBiomeHover = (biome: BiomeType | null) => {
    setHoveredBiome(biome);
    onBiomeHover?.(biome);
  };

  const renderBiomeRow = (biome: BiomeInfo) => {
    const isHovered = hoveredBiome === biome.type;
    
    return (
      <div
        key={biome.type}
        onMouseEnter={() => handleBiomeHover(biome.type)}
        onMouseLeave={() => handleBiomeHover(null)}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          padding: '8px',
          backgroundColor: isHovered ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.1)',
          borderRadius: '4px',
          border: isHovered ? '1px solid #4caf50' : '1px solid transparent',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div
              style={{
                fontWeight: 'bold',
                color: '#4caf50',
              }}
            >
              {biome.name}
            </div>
            {biome.isVariant && (
              <span style={{ fontSize: '10px', color: '#ffa726' }}>✨</span>
            )}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: '#ccc',
              lineHeight: '1.4',
              marginBottom: '6px',
            }}
          >
            {biome.description}
          </div>
          
          {/* Attribute badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
            {/* Temperature badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px' }}>
                {biome.temperature > 0.6 ? '🔥' : biome.temperature < 0.4 ? '❄️' : '🌡️'}
              </span>
              <div style={{ width: '40px', height: '4px', backgroundColor: '#333', borderRadius: '2px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${biome.temperature * 100}%`,
                    height: '100%',
                    backgroundColor: biome.temperature > 0.6 ? '#ff6d00' : '#4dd0e1',
                  }}
                />
              </div>
            </div>

            {/* Depth badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px' }}>🌊</span>
              <div style={{ width: '40px', height: '4px', backgroundColor: '#333', borderRadius: '2px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${biome.depth * 100}%`,
                    height: '100%',
                    backgroundColor: '#0277bd',
                  }}
                />
              </div>
            </div>

            {/* Nutrients badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px' }}>🌱</span>
              <div style={{ width: '40px', height: '4px', backgroundColor: '#333', borderRadius: '2px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${biome.nutrients * 100}%`,
                    height: '100%',
                    backgroundColor: '#66bb6a',
                  }}
                />
              </div>
            </div>

            {/* Toxicity badge */}
            {biome.toxicity > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '10px' }}>☢️</span>
                <div style={{ width: '40px', height: '4px', backgroundColor: '#333', borderRadius: '2px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${biome.toxicity * 100}%`,
                      height: '100%',
                      backgroundColor: '#7b1fa2',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Hazard flags */}
            {biome.hazardFlags.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {biome.hazardFlags.map((hazard, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '9px',
                      padding: '2px 4px',
                      backgroundColor: 'rgba(255, 152, 0, 0.3)',
                      borderRadius: '3px',
                      color: '#ffa726',
                    }}
                  >
                    {hazard}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
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
        pointerEvents: 'auto',
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* Shallow Biomes */}
          {shallowBiomes.length > 0 && (
            <div>
              <div style={{ color: '#4caf50', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
                🌊 Shallow Waters
              </div>
              {shallowBiomes.map((biome) => renderBiomeRow(biome))}
            </div>
          )}

          {/* Deep Biomes */}
          {deepBiomes.length > 0 && (
            <div>
              <div style={{ color: '#4caf50', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
                🌑 Deep Waters
              </div>
              {deepBiomes.map((biome) => renderBiomeRow(biome))}
            </div>
          )}

          {/* Special Biomes */}
          {specialBiomes.length > 0 && (
            <div>
              <div style={{ color: '#4caf50', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
                ⚡ Special Biomes
              </div>
              {specialBiomes.map((biome) => renderBiomeRow(biome))}
            </div>
          )}

          {/* Variant Biomes */}
          {variantBiomes.length > 0 && (
            <div>
              <div style={{ color: '#ffa726', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
                ✨ Rare Variants
              </div>
              {variantBiomes.map((biome) => renderBiomeRow(biome))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
