import React, { useEffect, useState } from 'react';
import type { Achievement } from '../../achievements/AchievementSystem';

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  onClose,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fade in animation
    setTimeout(() => setVisible(true), 100);

    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common':
        return '#9ca3af';
      case 'uncommon':
        return '#10b981';
      case 'rare':
        return '#3b82f6';
      case 'epic':
        return '#8b5cf6';
      case 'legendary':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: visible ? '20px' : '-400px',
        transition: 'right 0.3s ease',
        zIndex: 2000,
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        border: `2px solid ${getRarityColor(achievement.rarity)}`,
        borderRadius: '12px',
        padding: '16px 20px',
        minWidth: '320px',
        maxWidth: '400px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
      }}
      onClick={() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '40px' }}>{achievement.icon}</div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              color: '#fff',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              marginBottom: '4px',
              opacity: 0.8,
            }}
          >
            Achievement Unlocked!
          </div>
          <div
            style={{
              color: '#fff',
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '4px',
            }}
          >
            {achievement.name}
          </div>
          <div style={{ color: '#9ca3af', fontSize: '13px' }}>{achievement.description}</div>
          <div
            style={{
              marginTop: '6px',
              display: 'inline-block',
              padding: '2px 8px',
              background: getRarityColor(achievement.rarity),
              color: '#fff',
              borderRadius: '4px',
              fontSize: '10px',
              textTransform: 'uppercase',
              fontWeight: 'bold',
            }}
          >
            {achievement.rarity}
          </div>
        </div>
      </div>
    </div>
  );
};
