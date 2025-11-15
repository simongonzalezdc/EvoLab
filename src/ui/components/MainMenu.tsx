import React from 'react';

interface MainMenuProps {
  onNewGame: () => void;
  onLoadGame: () => void;
  onSettings: () => void;
  onTutorial: () => void;
  onExportHistory: () => void;
  onToggleStats: () => void;
  onAchievements: () => void;
  showStats: boolean;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onNewGame,
  onLoadGame,
  onSettings,
  onTutorial,
  onExportHistory,
  onToggleStats,
  onAchievements,
  showStats,
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 100,
      }}
    >
      {/* Menu Toggle Button */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
        {/* Stats Toggle */}
        <button
          onClick={onToggleStats}
          style={{
            padding: '10px 15px',
            background: showStats ? '#60a5fa' : '#333',
            color: showStats ? '#000' : '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            minWidth: '150px',
          }}
        >
          {showStats ? '📊 Hide Stats' : '📊 Show Stats'}
        </button>

        {/* Quick Actions */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.9)',
            padding: '15px',
            borderRadius: '8px',
            border: '2px solid #333',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            minWidth: '150px',
          }}
        >
          <button
            onClick={onNewGame}
            style={{
              padding: '10px 15px',
              background: '#4ade80',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          >
            🎮 New Game
          </button>

          <button
            onClick={onLoadGame}
            style={{
              padding: '10px 15px',
              background: '#60a5fa',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          >
            💾 Load/Save
          </button>

          <button
            onClick={onAchievements}
            style={{
              padding: '10px 15px',
              background: '#f59e0b',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          >
            🏆 Achievements
          </button>

          <button
            onClick={onExportHistory}
            style={{
              padding: '10px 15px',
              background: '#fbbf24',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          >
            📥 Export Data
          </button>

          <div style={{ height: '1px', background: '#444', margin: '5px 0' }} />

          <button
            onClick={onSettings}
            style={{
              padding: '10px 15px',
              background: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            ⚙️ Settings
          </button>

          <button
            onClick={onTutorial}
            style={{
              padding: '10px 15px',
              background: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            ❓ Tutorial
          </button>
        </div>
      </div>
    </div>
  );
};
