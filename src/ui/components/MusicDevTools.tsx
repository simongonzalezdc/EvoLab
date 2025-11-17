// Music Developer Tools Component - Live parameter controls for music system

import React, { useState, useEffect } from 'react';
import FocusLock from 'react-focus-lock';

interface MusicDevToolsProps {
  musicManager: any; // MusicManager instance
  onClose?: () => void;
}

export const MusicDevTools: React.FC<MusicDevToolsProps> = ({
  musicManager,
  onClose,
}) => {
  const [filterFreq, setFilterFreq] = useState(1000);
  const [reverbWet, setReverbWet] = useState(0.3);
  const [delayFeedback, setDelayFeedback] = useState(0.2);
  const [bpm, setBpm] = useState(120);
  const [muteAmbient, setMuteAmbient] = useState(false);
  const [muteBass, setMuteBass] = useState(false);
  const [muteMelody, setMuteMelody] = useState(false);
  const [muteRhythm, setMuteRhythm] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(0);

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    // Apply initial values
    if (musicManager) {
      musicManager.setFilterFrequency(filterFreq);
      musicManager.setReverbWet(reverbWet);
      musicManager.setDelayFeedback(delayFeedback);
      musicManager.setBPM(bpm);
      musicManager.setLayerMute('ambient', muteAmbient);
      musicManager.setLayerMute('bass', muteBass);
      musicManager.setLayerMute('melody', muteMelody);
      musicManager.setLayerMute('rhythm', muteRhythm);
    }
  }, []);

  const handleFilterChange = (value: number) => {
    setFilterFreq(value);
    musicManager?.setFilterFrequency(value);
  };

  const handleReverbChange = (value: number) => {
    setReverbWet(value);
    musicManager?.setReverbWet(value);
  };

  const handleDelayChange = (value: number) => {
    setDelayFeedback(value);
    musicManager?.setDelayFeedback(value);
  };

  const handleBPMChange = (value: number) => {
    setBpm(value);
    musicManager?.setBPM(value);
  };

  const handlePresetChange = (presetIndex: number) => {
    setSelectedPreset(presetIndex);
    musicManager?.applyPreset(presetIndex);
  };

  const presets = musicManager?.getPresets() || [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="musicdevtools-title"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        border: '2px solid #4caf50',
        borderRadius: '8px',
        padding: '20px',
        minWidth: '400px',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflowY: 'auto',
        zIndex: 1000,
        fontFamily: 'monospace',
        color: 'white',
      }}
    >
      <FocusLock returnFocus>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 id="musicdevtools-title" style={{ margin: 0, color: '#4caf50' }}>🎵 Music Dev Tools</h2>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid #4caf50',
              color: '#4caf50',
              borderRadius: '4px',
              padding: '5px 10px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Presets */}
      {presets.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#4caf50' }}>
            Presets (1-{presets.length} keys):
          </label>
          <select
            value={selectedPreset}
            onChange={(e) => handlePresetChange(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '8px',
              background: '#1a1a1a',
              color: 'white',
              border: '1px solid #4caf50',
              borderRadius: '4px',
            }}
          >
            {presets.map((preset: any, index: number) => (
              <option key={index} value={index}>
                {preset.name || `Preset ${index + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* BPM Control */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#4caf50' }}>
          BPM: {bpm}
        </label>
        <input
          type="range"
          min="60"
          max="180"
          value={bpm}
          onChange={(e) => handleBPMChange(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      {/* Filter Frequency */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#4caf50' }}>
          Filter Frequency: {filterFreq}Hz
        </label>
        <input
          type="range"
          min="200"
          max="5000"
          step="50"
          value={filterFreq}
          onChange={(e) => handleFilterChange(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      {/* Reverb Wet */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#4caf50' }}>
          Reverb Wet: {(reverbWet * 100).toFixed(0)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={reverbWet}
          onChange={(e) => handleReverbChange(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      {/* Delay Feedback */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#4caf50' }}>
          Delay Feedback: {(delayFeedback * 100).toFixed(0)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={delayFeedback}
          onChange={(e) => handleDelayChange(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      {/* Layer Mutes */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#4caf50' }}>
          Layer Mutes:
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={muteAmbient}
              onChange={(e) => {
                setMuteAmbient(e.target.checked);
                musicManager?.setLayerMute('ambient', e.target.checked);
              }}
            />
            <span>Ambient</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={muteBass}
              onChange={(e) => {
                setMuteBass(e.target.checked);
                musicManager?.setLayerMute('bass', e.target.checked);
              }}
            />
            <span>Bass</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={muteMelody}
              onChange={(e) => {
                setMuteMelody(e.target.checked);
                musicManager?.setLayerMute('melody', e.target.checked);
              }}
            />
            <span>Melody</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={muteRhythm}
              onChange={(e) => {
                setMuteRhythm(e.target.checked);
                musicManager?.setLayerMute('rhythm', e.target.checked);
              }}
            />
            <span>Rhythm</span>
          </label>
        </div>
      </div>
      </FocusLock>
    </div>
  );
};

