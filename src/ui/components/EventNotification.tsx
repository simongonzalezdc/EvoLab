import React, { useState, useEffect } from 'react';
import type { GameEvent } from '../../events/EventManager';

interface EventNotificationProps {
  event: GameEvent | null;
  onClose: () => void;
}

export const EventNotification: React.FC<EventNotificationProps> = ({ event, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (event) {
      setVisible(true);
      // Auto-dismiss after duration
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 500); // Wait for fade-out animation
      }, Math.min(event.duration * 1000, 10000)); // Max 10 seconds display

      return () => clearTimeout(timer);
    }
  }, [event, onClose]);

  if (!event) return null;

  const getSeverityColor = (severity: number): string => {
    if (severity >= 0.7) return '#f44336'; // High severity - red
    if (severity >= 0.4) return '#ff9800'; // Medium severity - orange
    return '#4caf50'; // Low severity - green
  };

  const severityColor = getSeverityColor(event.severity);

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        left: '50%',
        transform: `translate(-50%, ${visible ? '0' : '-120%'})`,
        transition: 'transform 0.5s ease-out, opacity 0.5s',
        opacity: visible ? 1 : 0,
        zIndex: 2000,
        minWidth: '300px',
        maxWidth: '500px',
        background: '#1a1a1a',
        border: `3px solid ${severityColor}`,
        borderRadius: '12px',
        padding: '20px',
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.8), 0 0 20px ${severityColor}40`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, color: severityColor, fontSize: '20px', fontWeight: 'bold' }}>
          {event.name}
        </h3>
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 500);
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            fontSize: '20px',
            padding: 0,
            marginLeft: '10px',
          }}
        >
          ×
        </button>
      </div>

      <p style={{ color: '#fff', margin: '10px 0', fontSize: '14px', lineHeight: '1.5' }}>
        {event.description}
      </p>

      <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {event.effects.map((effect, index) => (
          <div
            key={index}
            style={{
              background: '#2a2a2a',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#aaa',
              border: '1px solid #444',
            }}
          >
            {effect.type === 'damage' && `💥 Damage: ${effect.value}`}
            {effect.type === 'heal' && `💚 Heal: ${effect.value}`}
            {effect.type === 'resource_spawn' && `🍬 Resources +${effect.value}`}
            {effect.type === 'resource_drain' && `📉 Resources -${effect.value}`}
            {effect.type === 'stat_boost' && `⬆️ ${effect.stat} +${effect.value}`}
            {effect.type === 'stat_debuff' && `⬇️ ${effect.stat} ${effect.value}`}
            {effect.type === 'temperature_change' && `🌡️ Temp ${effect.value > 0 ? '+' : ''}${effect.value}°`}
            {effect.type === 'oxygen_change' && `💨 O₂ ${effect.value > 0 ? '+' : ''}${effect.value}%`}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        Duration: {event.duration}s | Severity: {Math.round(event.severity * 100)}%
      </div>
    </div>
  );
};
