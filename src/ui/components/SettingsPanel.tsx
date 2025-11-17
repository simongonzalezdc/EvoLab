import React, { useState } from 'react';
import FocusLock from 'react-focus-lock';
import type { GameSettings } from '../../data/SaveSystem';

interface SettingsPanelProps {
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  onClose: () => void;
  onShowMusicDevTools?: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange,
  onClose,
  onShowMusicDevTools,
}) => {
  const [localSettings, setLocalSettings] = useState<GameSettings>(settings);

  // Handle ESC key to close
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

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
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
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
      <FocusLock returnFocus>
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
          <h2 id="settings-title" style={{ margin: '0 0 20px 0', color: '#fff', fontSize: '24px' }}>Settings</h2>

        {/* Graphics Quality */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#fff', marginBottom: '8px', fontWeight: 'bold' }}>
            Graphics Quality
          </label>
          <select
            value={localSettings.graphicsQuality}
            onChange={e => handleChange('graphicsQuality', e.target.value as 'low' | 'medium' | 'high')}
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

        {/* Mutation Settings */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '10px' }}>🧬 Evolution</h3>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', color: '#fff', marginBottom: '4px' }}>
              Mutation Rate: {Math.round((localSettings.mutationRate ?? 0.15) * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={localSettings.mutationRate ?? 0.15}
              onChange={e => handleChange('mutationRate', parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
            <p style={{ color: '#888', fontSize: '12px', margin: '4px 0 0 0' }}>
              How often traits mutate (0% = no mutations, 100% = all traits mutate)
            </p>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', color: '#fff', marginBottom: '4px' }}>
              Mutation Magnitude: {Math.round((localSettings.mutationMagnitude ?? 0.15) * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.05"
              value={localSettings.mutationMagnitude ?? 0.15}
              onChange={e => handleChange('mutationMagnitude', parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
            <p style={{ color: '#888', fontSize: '12px', margin: '4px 0 0 0' }}>
              How much traits change when they mutate (±0% to ±50%)
            </p>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', color: '#fff', marginBottom: '4px' }}>
              Beneficial Bias: {Math.round((localSettings.beneficialBias ?? 0.1) * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={localSettings.beneficialBias ?? 0.1}
              onChange={e => handleChange('beneficialBias', parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
            <p style={{ color: '#888', fontSize: '12px', margin: '4px 0 0 0' }}>
              Tendency toward beneficial mutations (0% = pure random, 100% = always beneficial)
            </p>
          </div>
        </div>

        {/* Event Settings */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '10px' }}>⚡ Events</h3>

          <label style={{ display: 'flex', alignItems: 'center', color: '#fff', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={localSettings.randomEventsEnabled ?? true}
              onChange={e => handleChange('randomEventsEnabled', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Enable Random Events
          </label>
          <p style={{ color: '#888', fontSize: '12px', margin: '4px 0 0 24px' }}>
            Asteroids, diseases, algae blooms, and other unpredictable events
          </p>
        </div>

        {/* Accessibility Settings */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '10px' }}>♿ Accessibility</h3>

          <label style={{ display: 'flex', alignItems: 'center', color: '#fff', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={localSettings.highContrastMode ?? false}
              onChange={e => handleChange('highContrastMode', e.target.checked)}
              style={{ marginRight: '8px' }}
              aria-describedby="high-contrast-desc"
            />
            High Contrast Mode
          </label>
          <p id="high-contrast-desc" style={{ color: '#888', fontSize: '12px', margin: '4px 0 0 24px' }}>
            Increases color contrast for better visibility
          </p>

          <label style={{ display: 'flex', alignItems: 'center', color: '#fff', marginBottom: '8px', marginTop: '12px' }}>
            <input
              type="checkbox"
              checked={localSettings.reduceMotion ?? false}
              onChange={e => handleChange('reduceMotion', e.target.checked)}
              style={{ marginRight: '8px' }}
              aria-describedby="reduce-motion-desc"
            />
            Reduce Motion
          </label>
          <p id="reduce-motion-desc" style={{ color: '#888', fontSize: '12px', margin: '4px 0 0 24px' }}>
            Minimizes animations and transitions
          </p>

          <div style={{ marginTop: '12px' }}>
            <label htmlFor="font-size-select" style={{ display: 'block', color: '#fff', marginBottom: '8px' }}>
              Font Size
            </label>
            <select
              id="font-size-select"
              value={localSettings.fontSize ?? 'medium'}
              onChange={e => handleChange('fontSize', e.target.value as 'small' | 'medium' | 'large' | 'xlarge')}
              style={{
                width: '100%',
                padding: '8px',
                background: '#333',
                color: '#fff',
                border: '1px solid #555',
                borderRadius: '6px',
                fontSize: '14px',
              }}
              aria-describedby="font-size-desc"
            >
              <option value="small">Small</option>
              <option value="medium">Medium (Default)</option>
              <option value="large">Large</option>
              <option value="xlarge">Extra Large</option>
            </select>
            <p id="font-size-desc" style={{ color: '#888', fontSize: '12px', margin: '4px 0 0 0' }}>
              Adjusts text size throughout the game
            </p>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', color: '#fff', marginBottom: '8px', marginTop: '12px' }}>
            <input
              type="checkbox"
              checked={localSettings.screenReaderAnnouncements ?? true}
              onChange={e => handleChange('screenReaderAnnouncements', e.target.checked)}
              style={{ marginRight: '8px' }}
              aria-describedby="sr-announcements-desc"
            />
            Screen Reader Announcements
          </label>
          <p id="sr-announcements-desc" style={{ color: '#888', fontSize: '12px', margin: '4px 0 0 24px' }}>
            Announces important game events for screen readers
          </p>

          <label style={{ display: 'flex', alignItems: 'center', color: '#fff', marginBottom: '8px', marginTop: '12px' }}>
            <input
              type="checkbox"
              checked={localSettings.dyslexiaFriendlyFont ?? false}
              onChange={e => handleChange('dyslexiaFriendlyFont', e.target.checked)}
              style={{ marginRight: '8px' }}
              aria-describedby="dyslexia-font-desc"
            />
            Dyslexia-Friendly Font
          </label>
          <p id="dyslexia-font-desc" style={{ color: '#888', fontSize: '12px', margin: '4px 0 0 24px' }}>
            Uses OpenDyslexic font designed for improved readability
          </p>
        </div>

        {/* Developer Tools */}
        {onShowMusicDevTools && (
          <div style={{ marginBottom: '20px', padding: '15px', background: '#2a2a2a', borderRadius: '6px' }}>
            <h3 style={{ color: '#4caf50', fontSize: '16px', marginBottom: '10px' }}>Developer Tools</h3>
            <button
              onClick={() => {
                onShowMusicDevTools();
                onClose();
              }}
              style={{
                padding: '8px 16px',
                background: '#4caf50',
                color: '#000',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              🎵 Music Dev Tools
            </button>
          </div>
        )}

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
      </FocusLock>
    </div>
  );
};
