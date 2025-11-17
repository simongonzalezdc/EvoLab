// Keyboard Shortcuts Help Panel - Shows all available keyboard shortcuts

import React from 'react';
import FocusLock from 'react-focus-lock';

interface KeyboardShortcutsPanelProps {
  onClose: () => void;
}

interface Shortcut {
  category: string;
  items: Array<{
    keys: string[];
    description: string;
  }>;
}

const SHORTCUTS: Shortcut[] = [
  {
    category: 'Game Controls',
    items: [
      { keys: ['W', 'A', 'S', 'D'], description: 'Move cell' },
      { keys: ['Arrow Keys'], description: 'Alternative movement' },
      { keys: ['Space'], description: 'Pause/Resume game' },
    ],
  },
  {
    category: 'UI Navigation',
    items: [
      { keys: ['Tab'], description: 'Navigate through interactive elements' },
      { keys: ['ESC'], description: 'Close open modals/panels' },
      { keys: ['Enter'], description: 'Activate focused button' },
      { keys: ['Shift', '?'], description: 'Show this keyboard shortcuts panel' },
    ],
  },
  {
    category: 'Zoom Controls',
    items: [
      { keys: ['+', '='], description: 'Zoom in' },
      { keys: ['-'], description: 'Zoom out' },
      { keys: ['0'], description: 'Reset zoom to 100%' },
      { keys: ['Mouse Wheel'], description: 'Zoom in/out' },
    ],
  },
  {
    category: 'Music Presets',
    items: [
      { keys: ['1'], description: 'Apply music preset 1' },
      { keys: ['2'], description: 'Apply music preset 2' },
      { keys: ['3'], description: 'Apply music preset 3' },
      { keys: ['4'], description: 'Apply music preset 4' },
      { keys: ['5'], description: 'Apply music preset 5' },
    ],
  },
];

export const KeyboardShortcutsPanel: React.FC<KeyboardShortcutsPanelProps> = ({ onClose }) => {
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <FocusLock returnFocus>
        <div
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            border: '2px solid #4caf50',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '700px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ marginBottom: '25px' }}>
            <h2 id="shortcuts-title" style={{ margin: '0 0 10px 0', color: '#4caf50', fontSize: '28px' }}>
              ⌨️ Keyboard Shortcuts
            </h2>
            <p style={{ margin: 0, color: '#aaa', fontSize: '14px' }}>
              Learn the keyboard shortcuts to enhance your gameplay experience
            </p>
          </div>

          {/* Shortcuts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {SHORTCUTS.map((section) => (
              <div key={section.category}>
                <h3
                  style={{
                    margin: '0 0 12px 0',
                    color: '#60a5fa',
                    fontSize: '18px',
                    borderBottom: '1px solid rgba(96, 165, 250, 0.3)',
                    paddingBottom: '6px',
                  }}
                >
                  {section.category}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {section.items.map((shortcut, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '6px',
                      }}
                    >
                      <span style={{ color: '#ddd', fontSize: '14px' }}>{shortcut.description}</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {shortcut.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            <kbd
                              style={{
                                background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
                                color: '#4caf50',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                fontSize: '13px',
                                fontFamily: 'monospace',
                                fontWeight: 'bold',
                                border: '1px solid #4caf50',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                                minWidth: '30px',
                                textAlign: 'center',
                              }}
                            >
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span style={{ color: '#666', fontSize: '12px', alignSelf: 'center' }}>
                                {shortcut.keys.length === 2 ? '+' : 'or'}
                              </span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Close Button */}
          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <button
              onClick={onClose}
              style={{
                padding: '12px 32px',
                background: '#4caf50',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
              }}
            >
              Close
            </button>
          </div>

          {/* Footer Tip */}
          <p
            style={{
              marginTop: '20px',
              textAlign: 'center',
              color: '#666',
              fontSize: '12px',
              fontStyle: 'italic',
            }}
          >
            Press <kbd style={{ background: '#333', padding: '2px 6px', borderRadius: '3px' }}>?</kbd> anytime to view
            this panel
          </p>
        </div>
      </FocusLock>
    </div>
  );
};
