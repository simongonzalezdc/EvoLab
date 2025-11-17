# EvoLab Accessibility Developer Guide

**Version:** 1.0
**Last Updated:** 2025-11-17
**Target Audience:** Developers contributing to EvoLab

---

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Core Accessibility Utilities](#core-accessibility-utilities)
4. [Implementation Patterns](#implementation-patterns)
5. [ARIA Best Practices](#aria-best-practices)
6. [Keyboard Navigation](#keyboard-navigation)
7. [Screen Reader Support](#screen-reader-support)
8. [Visual Accessibility](#visual-accessibility)
9. [Testing Guidelines](#testing-guidelines)
10. [Common Pitfalls](#common-pitfalls)
11. [Code Examples](#code-examples)

---

## Introduction

This guide documents the accessibility architecture and implementation patterns used in EvoLab. Following these guidelines ensures that new features maintain our WCAG 2.1 Level AA compliance.

### Design Principles

1. **Semantic HTML First** - Use native elements before ARIA
2. **Progressive Enhancement** - Core functionality works without JS
3. **User Control** - Respect user preferences
4. **Consistency** - Predictable patterns throughout
5. **Testing** - Verify with real assistive technologies

### Compliance Goals

- **WCAG 2.1 Level A:** 100% compliance (required)
- **WCAG 2.1 Level AA:** 90%+ compliance (target)
- **WCAG 2.1 Level AAA:** Best effort (enhanced features)

---

## Architecture Overview

### File Structure

```
src/
├── utils/
│   ├── AccessibilityManager.ts      # Central accessibility state manager
│   ├── ScreenReaderAnnouncer.ts     # ARIA live region controller
│   └── GameStateAnnouncer.ts        # Real-time game state announcements
├── ui/
│   ├── UIController.tsx             # Main UI coordinator
│   └── components/
│       ├── AccessibleGameStatePanel.tsx  # Text-based game state
│       ├── SettingsPanel.tsx        # Accessibility settings
│       └── [other components]
├── audio/
│   └── SpatialAudioCues.ts          # Spatial audio for navigation
└── core/
    └── GameLoop.ts                   # Integration point
```

### Key Components

| Component | Purpose | Location |
|-----------|---------|----------|
| **AccessibilityManager** | Apply settings to DOM | `src/utils/AccessibilityManager.ts` |
| **ScreenReaderAnnouncer** | ARIA live announcements | `src/utils/ScreenReaderAnnouncer.ts` |
| **GameStateAnnouncer** | Real-time game events | `src/utils/GameStateAnnouncer.ts` |
| **AccessibleGameStatePanel** | Canvas text alternative | `src/ui/components/AccessibleGameStatePanel.tsx` |
| **SpatialAudioCues** | Directional audio | `src/audio/SpatialAudioCues.ts` |

---

## Core Accessibility Utilities

### AccessibilityManager

**Purpose:** Central manager for applying accessibility settings to the DOM.

**Location:** `src/utils/AccessibilityManager.ts`

**Key Methods:**

```typescript
class AccessibilityManager {
  // Apply all settings at once
  applySettings(settings: GameSettings): void

  // Individual setting applicators
  applyHighContrast(enabled: boolean): void
  applyFontSize(size: 'small' | 'medium' | 'large' | 'xlarge'): void
  applyReduceMotion(enabled: boolean): void

  // State queries
  isHighContrastActive(): boolean
  isReduceMotionActive(): boolean
}
```

**Usage Example:**

```typescript
import { accessibilityManager } from '../utils/AccessibilityManager';

// Apply settings when loaded from database
const settings = await saveSystem.loadSettings();
accessibilityManager.applySettings(settings);

// Apply individual setting
accessibilityManager.applyHighContrast(true);
```

**Implementation Details:**

- Singleton pattern for global access
- Modifies `document.body` class names
- Checks both manual settings and system preferences
- No dependencies on React/UI layer

---

### ScreenReaderAnnouncer

**Purpose:** Manages ARIA live regions for screen reader announcements.

**Location:** `src/utils/ScreenReaderAnnouncer.ts`

**Key Methods:**

```typescript
class ScreenReaderAnnouncer {
  // Non-interrupting announcement
  announcePolite(message: string): void

  // Interrupting announcement (use sparingly!)
  announceAssertive(message: string): void

  // Enable/disable announcements
  setEnabled(enabled: boolean): void
}
```

**Live Region Setup (index.html):**

```html
<!-- Polite announcements -->
<div id="announcer-polite"
     class="sr-only"
     aria-live="polite"
     aria-atomic="true"></div>

<!-- Assertive announcements -->
<div id="announcer-assertive"
     class="sr-only"
     aria-live="assertive"
     aria-atomic="true"></div>
```

**Usage Guidelines:**

✅ **Use `announcePolite` for:**
- Generation completion
- Resource collection
- Achievement unlocks
- Trait editor opened
- Non-critical status changes

✅ **Use `announceAssertive` for:**
- Player death / extinction
- Critical health warnings
- Combat engagement
- Imminent threats

❌ **Don't:**
- Announce every frame
- Use for debugging
- Announce decorative content
- Override user's current reading

**Usage Example:**

```typescript
import { screenReaderAnnouncer } from '../utils/ScreenReaderAnnouncer';

// Non-critical event
screenReaderAnnouncer.announcePolite(
  `Generation ${gen} complete! Earned ${dna} DNA points.`
);

// Critical event
screenReaderAnnouncer.announceAssertive(
  `Warning! Health critical at ${healthPercent}%`
);
```

---

### GameStateAnnouncer

**Purpose:** Provides throttled, intelligent announcements of game state changes.

**Location:** `src/utils/GameStateAnnouncer.ts`

**Key Features:**

- Automatic throttling to prevent spam
- Significance detection (only announces meaningful changes)
- Integrated with ScreenReaderAnnouncer
- State tracking to detect changes

**Key Methods:**

```typescript
class GameStateAnnouncer {
  // Resource collection (throttled)
  announceResourceCollection(
    resourceType: string,
    amount: number,
    totalCollected: number
  ): void

  // Population changes (only significant changes)
  announcePopulationChange(newPopulation: number, oldPopulation?: number): void

  // Health/ATP warnings (critical levels only)
  announceHealthStatus(currentHealth: number, maxHealth: number): void
  announceATPStatus(currentATP: number, maxATP: number): void

  // Biome transitions
  announceBiomeChange(newBiome: string, biomeName: string): void

  // Combat events
  announceCombat(eventType: 'attacked' | 'killed' | 'escaped', targetSize?: number): void

  // Reset state (on new game)
  reset(): void
}
```

**Throttle Configuration:**

```typescript
private throttles = new Map([
  ['resource', { lastAnnouncement: 0, minInterval: 5000 }],   // 5s
  ['population', { lastAnnouncement: 0, minInterval: 10000 }], // 10s
  ['health', { lastAnnouncement: 0, minInterval: 3000 }],     // 3s
  ['atp', { lastAnnouncement: 0, minInterval: 3000 }],        // 3s
  ['biome', { lastAnnouncement: 0, minInterval: 5000 }],      // 5s
]);
```

**Significance Thresholds:**

- **Population:** ±5 cells OR ±20% change
- **Resources:** +50 units OR +10% increase
- **Health:** Crossing 25% or 50% thresholds
- **ATP:** Crossing 25% or 50% thresholds

**Integration (GameLoop.ts):**

```typescript
import { gameStateAnnouncer } from '../utils/GameStateAnnouncer';

// In update() method:
if (this.entityManager.playerSpecies) {
  const stats = this.entityManager.playerSpecies.getStats();
  const avgTraits = stats.averageTraits as Traits;

  // Announce state changes
  gameStateAnnouncer.announcePopulationChange(stats.population);
  gameStateAnnouncer.announceHealthStatus(avgTraits.health, avgTraits.maxHealth);
  gameStateAnnouncer.announceATPStatus(avgTraits.atp, avgTraits.maxATP);
  gameStateAnnouncer.announceBiomeChange(biome.type, biomeName);
}

// On game reset:
gameStateAnnouncer.reset();
```

---

## Implementation Patterns

### Pattern 1: Accessible Modal Dialogs

**Requirements:**
- Focus trap (Tab loops within modal)
- ESC key closes modal
- Focus restoration (return to trigger element)
- ARIA attributes
- Keyboard accessible controls

**Example (TraitEditor.tsx):**

```tsx
export const TraitEditor: React.FC<Props> = ({ onApply, currentTraits }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap
  useEffect(() => {
    if (!modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    modalRef.current.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => {
      modalRef.current?.removeEventListener('keydown', handleTab);
    };
  }, []);

  // ESC key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-labelledby="trait-editor-title"
      aria-describedby="trait-editor-desc"
      aria-modal="true"
      className="modal-overlay"
    >
      <div className="modal-content">
        <h2 id="trait-editor-title">Trait Editor</h2>
        <p id="trait-editor-desc">
          Allocate DNA points to improve your species traits
        </p>

        {/* Modal content */}

        <button
          onClick={onClose}
          aria-label="Close trait editor"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
```

**Key Points:**
- ✅ `role="dialog"` on modal container
- ✅ `aria-modal="true"` indicates modal behavior
- ✅ `aria-labelledby` points to title
- ✅ `aria-describedby` points to description
- ✅ Focus trap prevents Tab escaping modal
- ✅ ESC key closes modal
- ✅ Close button has accessible label

---

### Pattern 2: Accessible Form Controls

**Requirements:**
- Labels associated with inputs
- Error messages announced
- Clear instructions
- Keyboard navigable

**Example (SettingsPanel.tsx):**

```tsx
<div className="setting-group">
  <label htmlFor="font-size-select">
    Font Size
  </label>
  <select
    id="font-size-select"
    value={settings.fontSize}
    onChange={(e) => handleSettingChange('fontSize', e.target.value)}
    aria-describedby="font-size-help"
  >
    <option value="small">Small (12px)</option>
    <option value="medium">Medium (14px)</option>
    <option value="large">Large (16px)</option>
    <option value="xlarge">Extra Large (18px)</option>
  </select>
  <small id="font-size-help">
    Adjust text size for better readability
  </small>
</div>

<div className="setting-group">
  <label>
    <input
      type="checkbox"
      checked={settings.highContrastMode}
      onChange={(e) => handleSettingChange('highContrastMode', e.target.checked)}
      aria-describedby="high-contrast-help"
    />
    High Contrast Mode
  </label>
  <small id="high-contrast-help">
    Increases color contrast to 7:1+ ratios (WCAG AAA)
  </small>
</div>
```

**Key Points:**
- ✅ `<label htmlFor>` associates label with input
- ✅ `aria-describedby` provides help text
- ✅ Help text has unique ID
- ✅ Checkbox wrapped in label for click target
- ✅ Clear, descriptive text

---

### Pattern 3: Accessible Game State Display

**Requirements:**
- Semantic HTML structure
- ARIA live region for updates
- Proper heading hierarchy
- Descriptive labels

**Example (AccessibleGameStatePanel.tsx):**

```tsx
<aside
  className="accessible-game-state-panel"
  role="complementary"
  aria-label="Game state information"
  aria-live="polite"
  aria-atomic="false"
>
  <div className="panel-header">
    <h2 id="game-state-title">Game State</h2>
    <button
      className="panel-close-btn"
      onClick={onToggle}
      aria-label="Hide game state panel"
    >
      ✕
    </button>
  </div>

  <div className="panel-content">
    <section aria-labelledby="species-status-heading">
      <h3 id="species-status-heading">Species Status</h3>
      <dl>
        <div className="state-item">
          <dt>Generation:</dt>
          <dd>{gameState.generation}</dd>
        </div>
        <div className="state-item">
          <dt>Population:</dt>
          <dd>{gameState.population} cells</dd>
        </div>
      </dl>
    </section>
  </div>
</aside>
```

**Key Points:**
- ✅ `<aside role="complementary">` for landmark
- ✅ `aria-live="polite"` for automatic updates
- ✅ `aria-atomic="false"` for partial updates
- ✅ Proper heading hierarchy (h2 → h3)
- ✅ Definition lists (`<dl>`) for key-value pairs
- ✅ `aria-labelledby` for section labels

---

## ARIA Best Practices

### When to Use ARIA

**The First Rule of ARIA:**
> "If you can use a native HTML element or attribute with the semantics and behavior you require already built in, instead of re-purposing an element and adding an ARIA role, state or property to make it accessible, then do so."

**Use Native HTML First:**

```tsx
// ❌ Bad
<div role="button" tabIndex={0} onClick={handleClick}>
  Click me
</div>

// ✅ Good
<button onClick={handleClick}>
  Click me
</button>
```

**Use ARIA When Native Elements Insufficient:**

```tsx
// ✅ Good - ARIA required for custom widget
<div
  role="progressbar"
  aria-valuenow={currentDNA}
  aria-valuemin={0}
  aria-valuemax={targetDNA}
  aria-label="DNA collection progress"
>
  {/* Visual progress bar */}
</div>
```

---

### ARIA Roles

**Landmark Roles:**

```tsx
<nav aria-label="Main navigation">
  {/* Navigation */}
</nav>

<main>
  {/* Primary content */}
</main>

<aside aria-label="Game statistics">
  {/* Supplementary content */}
</aside>
```

**Widget Roles:**

```tsx
<div role="dialog" aria-modal="true">
  {/* Modal content */}
</div>

<div role="alert" aria-live="assertive">
  {/* Critical message */}
</div>
```

---

### ARIA Properties

**Labels and Descriptions:**

```tsx
// aria-label: Direct label
<button aria-label="Close dialog">
  ✕
</button>

// aria-labelledby: Reference to label element
<div role="dialog" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Settings</h2>
</div>

// aria-describedby: Additional description
<input
  type="text"
  aria-describedby="name-help"
/>
<span id="name-help">Enter your species name</span>
```

**States:**

```tsx
// aria-expanded: Expandable widgets
<button aria-expanded={isOpen} onClick={toggle}>
  Menu
</button>

// aria-checked: Checkboxes/radio buttons
<div role="checkbox" aria-checked={isChecked}>
  Option
</div>

// aria-disabled: Disabled state
<button aria-disabled="true">
  Submit (disabled)
</button>
```

---

### ARIA Live Regions

**Politeness Levels:**

```tsx
// Polite: Waits for pause in speech
<div aria-live="polite" aria-atomic="true">
  {nonCriticalUpdate}
</div>

// Assertive: Interrupts immediately
<div aria-live="assertive" aria-atomic="true">
  {criticalAlert}
</div>

// Off: No announcements (default)
<div aria-live="off">
  {decorativeContent}
</div>
```

**Atomic vs. Non-Atomic:**

```tsx
// aria-atomic="true": Announce entire region
<div aria-live="polite" aria-atomic="true">
  Score: {score}
</div>
// Announces: "Score: 150"

// aria-atomic="false": Announce only changes
<div aria-live="polite" aria-atomic="false">
  <span>Score:</span> <span>{score}</span>
</div>
// Announces: "150" (only the changed part)
```

---

## Keyboard Navigation

### Focus Management

**Focus Order:**

```tsx
// Logical tab order (top to bottom, left to right)
<form>
  <input tabIndex={0} /> {/* Natural order */}
  <input tabIndex={0} />
  <button tabIndex={0} />
</form>

// ❌ Don't use positive tabindex (breaks natural order)
<input tabIndex={3} /> {/* Bad! */}
```

**Focus Indicators (CSS):**

```css
/* Visible focus indicator */
button:focus,
input:focus,
select:focus {
  outline: 3px solid var(--accent-primary, #4CAF50);
  outline-offset: 2px;
}

/* High contrast mode */
body.high-contrast button:focus {
  outline-color: #00FF00;
  outline-width: 3px;
}
```

**Programmatic Focus:**

```tsx
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  // Focus input when modal opens
  inputRef.current?.focus();
}, []);

<input ref={inputRef} />
```

---

### Keyboard Event Handling

**Standard Patterns:**

```tsx
const handleKeyDown = (e: React.KeyboardEvent) => {
  switch (e.key) {
    case 'Enter':
    case ' ': // Space
      e.preventDefault();
      handleActivate();
      break;

    case 'Escape':
      e.preventDefault();
      handleClose();
      break;

    case 'ArrowUp':
      e.preventDefault();
      handleMoveUp();
      break;

    case 'ArrowDown':
      e.preventDefault();
      handleMoveDown();
      break;
  }
};
```

**Global Keyboard Shortcuts:**

```tsx
useEffect(() => {
  const handleGlobalKeyPress = (e: KeyboardEvent) => {
    // Shift+? for help
    if (e.shiftKey && e.key === '?') {
      e.preventDefault();
      showKeyboardShortcuts();
    }

    // ESC for menu
    if (e.key === 'Escape') {
      e.preventDefault();
      toggleMenu();
    }
  };

  window.addEventListener('keydown', handleGlobalKeyPress);
  return () => window.removeEventListener('keydown', handleGlobalKeyPress);
}, []);
```

---

## Visual Accessibility

### Color Contrast

**WCAG Requirements:**

- **Level AA:** 4.5:1 for normal text, 3:1 for large text
- **Level AAA:** 7:1 for normal text, 4.5:1 for large text

**CSS Variable System:**

```css
:root {
  /* Normal mode */
  --bg-primary: #0a0e27;
  --bg-secondary: rgba(0, 0, 0, 0.85);
  --text-primary: #ffffff;
  --text-secondary: #d0d0d0;
  --accent-primary: #4CAF50;
  --border-color: #4CAF50;
}

/* High contrast mode */
body.high-contrast {
  --bg-primary: #000000;
  --bg-secondary: #000000;
  --text-primary: #ffffff;
  --text-secondary: #ffffff;
  --accent-primary: #00ff00;
  --border-color: #ffffff;
}
```

**Usage:**

```css
.panel {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
}
```

---

### Font Sizing

**Responsive Font Sizes:**

```css
/* Base font sizes */
body { font-size: 14px; } /* Default: medium */

body.font-size-small { font-size: 12px; }
body.font-size-medium { font-size: 14px; }
body.font-size-large { font-size: 16px; }
body.font-size-xlarge { font-size: 18px; }

/* Use relative units */
.heading { font-size: 1.5em; } /* Scales with body font-size */
.button { padding: 0.5em 1em; } /* Scales with font-size */
```

---

### Reduce Motion

**CSS Implementation:**

```css
/* Respect system preference */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Manual override */
body.reduce-motion *,
body.reduce-motion *::before,
body.reduce-motion *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}
```

**JavaScript Detection:**

```typescript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (prefersReducedMotion || settings.reduceMotion) {
  document.body.classList.add('reduce-motion');
}
```

---

## Testing Guidelines

### Manual Testing Checklist

**Keyboard Navigation:**
- [ ] All interactive elements reachable via Tab
- [ ] Tab order is logical (top to bottom, left to right)
- [ ] Focus indicators visible on all elements
- [ ] No keyboard traps (can always escape with Tab/Shift+Tab/ESC)
- [ ] All functionality available without mouse

**Screen Reader (NVDA/JAWS/VoiceOver):**
- [ ] All text content readable
- [ ] Images have alt text (or aria-label if decorative)
- [ ] Form inputs have labels
- [ ] Headings properly nested (h1 → h2 → h3)
- [ ] ARIA live regions announce updates
- [ ] Modals announced when opened
- [ ] Buttons/links have descriptive text

**Visual:**
- [ ] Text contrast meets WCAG AA (4.5:1)
- [ ] High contrast mode meets WCAG AAA (7:1)
- [ ] UI usable at 200% zoom
- [ ] Focus indicators visible in all modes
- [ ] No color-only indicators (shape/text backup)

**Motion:**
- [ ] Reduce Motion disables animations
- [ ] System preference respected
- [ ] Functionality preserved without motion

---

### Automated Testing

**axe-core Integration:**

```bash
npm install --save-dev @axe-core/cli
```

**Run Automated Scan:**

```bash
# Full page scan
axe http://localhost:3000 --exit

# Save results
axe http://localhost:3000 --save results.json
```

**In-Browser Testing:**

```javascript
// Add axe-core to test page
import axe from 'axe-core';

axe.run(document, {
  rules: {
    'color-contrast': { enabled: true },
    'aria-allowed-attr': { enabled: true },
    'label': { enabled: true },
  }
}).then(results => {
  console.log('Violations:', results.violations);
  console.log('Passes:', results.passes);
});
```

---

### Screen Reader Testing

**NVDA (Windows - Free):**

```
1. Download from https://www.nvaccess.org/
2. Install and launch
3. Navigate to http://localhost:3000
4. Test with:
   - Tab: Next focusable element
   - Shift+Tab: Previous element
   - H: Next heading
   - D: Next landmark
   - Insert+Down: Read all from cursor
```

**VoiceOver (macOS):**

```
1. Enable: System Preferences → Accessibility → VoiceOver
2. Start: Cmd+F5
3. Test with:
   - VO+Right: Next item
   - VO+Left: Previous item
   - VO+U: Rotor (headings, links, forms)
   - VO+A: Read all
```

**Key Things to Listen For:**
- Are announcements clear and concise?
- Do live regions announce at appropriate times?
- Are form labels read before inputs?
- Do buttons describe their action?
- Are modal titles announced?

---

## Common Pitfalls

### ❌ Pitfall 1: Divs as Buttons

```tsx
// ❌ Bad
<div onClick={handleClick}>
  Submit
</div>

// ✅ Good
<button onClick={handleClick}>
  Submit
</button>
```

**Why:** Divs are not keyboard accessible, not announced as buttons, no built-in activation behavior.

---

### ❌ Pitfall 2: Missing Alt Text

```tsx
// ❌ Bad
<img src="species.png" />

// ✅ Good (informative image)
<img src="species.png" alt="Generation 5 species, size 12" />

// ✅ Good (decorative image)
<img src="decoration.png" alt="" role="presentation" />
```

---

### ❌ Pitfall 3: Color-Only Indicators

```tsx
// ❌ Bad (red/green only)
<span style={{ color: health > 50 ? 'green' : 'red' }}>
  {health}%
</span>

// ✅ Good (color + icon/text)
<span style={{ color: health > 50 ? 'green' : 'red' }}>
  {health > 50 ? '🟢' : '🔴'} {health}%
</span>
```

---

### ❌ Pitfall 4: Unlabeled Form Inputs

```tsx
// ❌ Bad
<input type="text" placeholder="Enter name" />

// ✅ Good
<label htmlFor="species-name">Species Name</label>
<input
  id="species-name"
  type="text"
  placeholder="Enter name"
/>
```

---

### ❌ Pitfall 5: Keyboard Trap

```tsx
// ❌ Bad (can't escape)
useEffect(() => {
  const handleTab = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault(); // Traps focus!
    }
  };
  window.addEventListener('keydown', handleTab);
}, []);

// ✅ Good (allows escape)
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose(); // Can always escape with ESC
    }
  };
  window.addEventListener('keydown', handleEscape);
}, [onClose]);
```

---

## Code Examples

### Example 1: Accessible Button with Icon

```tsx
// ❌ Bad (icon-only, no label)
<button onClick={handleClose}>
  ✕
</button>

// ✅ Good (accessible label)
<button
  onClick={handleClose}
  aria-label="Close settings panel"
  title="Close settings panel"
>
  ✕
</button>
```

---

### Example 2: Accessible Toggle Switch

```tsx
interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  helpText?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  checked,
  onChange,
  helpText,
}) => {
  const id = useId();
  const helpId = `${id}-help`;

  return (
    <div className="toggle-switch-container">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-checked={checked}
        aria-describedby={helpText ? helpId : undefined}
      />
      {helpText && (
        <small id={helpId}>{helpText}</small>
      )}
    </div>
  );
};
```

---

### Example 3: Accessible Slider

```tsx
interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}) => {
  const id = useId();

  return (
    <div className="slider-container">
      <label htmlFor={id}>
        {label}: {value}
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
      />
    </div>
  );
};
```

---

## Resources

### Official Documentation

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Tools

- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluator
- [Color Contrast Analyzer](https://www.tpgi.com/color-contrast-checker/)

### Testing

- [NVDA Screen Reader](https://www.nvaccess.org/) - Free (Windows)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) - Commercial (Windows)
- [VoiceOver](https://www.apple.com/accessibility/voiceover/) - Built-in (macOS/iOS)

---

**Document Version:** 1.0
**Last Updated:** 2025-11-17
**Maintainer:** EvoLab Development Team

For questions or contributions, please open an issue on GitHub.
