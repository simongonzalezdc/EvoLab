import React, { useState } from 'react';
import { FactionType, type Faction } from '../../core/FactionSystem';

interface FactionSelectionPanelProps {
  factions: Faction[];
  onSelect: (factionType: FactionType) => void;
  onSkip: () => void;
}

export const FactionSelectionPanel: React.FC<FactionSelectionPanelProps> = ({
  factions,
  onSelect,
  onSkip,
}) => {
  const [selectedFaction, setSelectedFaction] = useState<FactionType | null>(null);

  const handleConfirm = () => {
    if (selectedFaction) {
      onSelect(selectedFaction);
    }
  };

  return (
    <div
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
        zIndex: 3000,
      }}
    >
      <div
        style={{
          background: '#1a1a1a',
          border: '2px solid #444',
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '900px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '32px' }}>
            Choose Your Path
          </h1>
          <p style={{ color: '#888', fontSize: '16px', margin: 0 }}>
            Select a faction to guide your evolutionary journey
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '30px',
          }}
        >
          {factions.map(faction => (
            <div
              key={faction.type}
              onClick={() => setSelectedFaction(faction.type)}
              style={{
                background: selectedFaction === faction.type ? '#2a2a2a' : '#1a1a1a',
                border: `2px solid ${selectedFaction === faction.type ? `#${faction.color.toString(16).padStart(6, '0')}` : '#333'}`,
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                transform: selectedFaction === faction.type ? 'scale(1.05)' : 'scale(1)',
                boxShadow: selectedFaction === faction.type ? `0 0 20px rgba(${(faction.color >> 16) & 255}, ${(faction.color >> 8) & 255}, ${faction.color & 255}, 0.5)` : 'none',
              }}
            >
              <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '10px' }}>
                {faction.icon}
              </div>
              <h3
                style={{
                  margin: '0 0 8px 0',
                  color: selectedFaction === faction.type ? `#${faction.color.toString(16).padStart(6, '0')}` : '#fff',
                  fontSize: '18px',
                  textAlign: 'center',
                }}
              >
                {faction.name}
              </h3>
              <p style={{ color: '#888', fontSize: '13px', margin: '0 0 10px 0', textAlign: 'center' }}>
                {faction.description}
              </p>
            </div>
          ))}
        </div>

        {/* Selected Faction Details */}
        {selectedFaction && (
          <div
            style={{
              background: '#2a2a2a',
              border: '2px solid #444',
              borderRadius: '12px',
              padding: '25px',
              marginBottom: '20px',
            }}
          >
            {(() => {
              const faction = factions.find(f => f.type === selectedFaction)!;
              return (
                <>
                  <h3 style={{ margin: '0 0 10px 0', color: `#${faction.color.toString(16).padStart(6, '0')}`, fontSize: '20px' }}>
                    {faction.icon} {faction.name}
                  </h3>
                  <p style={{ color: '#ccc', fontSize: '14px', fontStyle: 'italic', margin: '0 0 20px 0', lineHeight: '1.6' }}>
                    "{faction.philosophy}"
                  </p>

                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ color: '#fff', fontSize: '16px', margin: '0 0 10px 0' }}>💪 Bonuses</h4>
                    {faction.bonuses.map((bonus, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'start', marginBottom: '6px' }}>
                        <span style={{ color: '#4caf50', marginRight: '8px' }}>•</span>
                        <span style={{ color: '#aaa', fontSize: '14px' }}>{bonus.description}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h4 style={{ color: '#fff', fontSize: '16px', margin: '0 0 10px 0' }}>🏆 Victory Conditions</h4>
                    {faction.victoryConditions.map((condition, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'start', marginBottom: '6px' }}>
                        <span style={{ color: '#ff9800', marginRight: '8px' }}>•</span>
                        <span style={{ color: '#aaa', fontSize: '14px' }}>{condition.description}</span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onSkip}
            style={{
              padding: '12px 24px',
              background: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Skip (No Faction)
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedFaction}
            style={{
              padding: '12px 32px',
              background: selectedFaction ? '#4caf50' : '#444',
              color: selectedFaction ? '#000' : '#666',
              border: 'none',
              borderRadius: '8px',
              cursor: selectedFaction ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
              fontSize: '14px',
              opacity: selectedFaction ? 1 : 0.5,
            }}
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
};
