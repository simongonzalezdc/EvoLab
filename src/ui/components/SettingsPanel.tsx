import React, { useState } from 'react';
import type { GameSettings } from '../../data/SaveSystem';

interface SettingsPanelProps {
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange,
  onClose,
}) => {
  const [localSettings, setLocalSettings] = useState<GameSettings>(settings);

  const handleChange = <K extends keyof GameSettings>(
    key: K,
    value: GameSettings[K]
  ) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
  };

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
      onClick={handleCancel}
    >
      <div
        style={{
          background: '#1a1a1a',
          border: '2px solid #333',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ margin: '0 0 20px 0', color: '#fff', fontSize: '24px' }}>Settings</h2>

        {/* Graphics Quality */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#fff', marginBottom: '8px', fontWeight: 'bold' }}>
            Graphics Quality
          </label>
          <select
            value={localSettings.graphicsQuality}
            onChange={e => handleChange('graphicsQuality', e.target.value as any)}
            style={{
              width: '100%',
              padding: '8px',
              background: '#333',
              color: '#fff',
              border: '1px solid #555',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Display Options */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '10px' }}>Display</h3>

          <label style={{ display: 'flex', alignItems: 'center', color: '#fff', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={localSettings.showBiomes}
              onChange={e => handleChange('showBiomes', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Show Biomes
          </label>

          <label style={{ display: 'flex', alignItems: 'center', color: '#fff', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={localSettings.showGrid}
              onChange={e => handleChange('showGrid', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Show Grid
          </label>

          <label style={{ display: 'flex', alignItems: 'center', color: '#fff', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={localSettings.showStats}
              onChange={e => handleChange('showStats', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Show Statistics
          </label>
        </div>

        {/* Audio Options */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '10px' }}>Audio</h3>

          <label style={{ display: 'flex', alignItems: 'center', color: '#fff', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={localSettings.soundEnabled}
              onChange={e => handleChange('soundEnabled', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Sound Effects
          </label>

          <label style={{ display: 'flex', alignItems: 'center', color: '#fff', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={localSettings.musicEnabled}
              onChange={e => handleChange('musicEnabled', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Background Music
          </label>
        </div>

        {/* Auto-Save Options */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '10px' }}>Auto-Save</h3>

          <label style={{ display: 'flex', alignItems: 'center', color: '#fff', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={localSettings.autoSave}
              onChange={e => handleChange('autoSave', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Enable Auto-Save
          </label>

          {localSettings.autoSave && (
            <div style={{ marginLeft: '24px' }}>
              <label style={{ display: 'block', color: '#fff', marginBottom: '8px' }}>
                Interval (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={localSettings.autoSaveInterval}
                onChange={e => handleChange('autoSaveInterval', parseInt(e.target.value) || 5)}
                style={{
                  width: '100px',
                  padding: '8px',
                  background: '#333',
                  color: '#fff',
                  border: '1px solid #555',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              />
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={handleCancel}
            style={{
              padding: '10px 20px',
              background: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              background: '#60a5fa',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
