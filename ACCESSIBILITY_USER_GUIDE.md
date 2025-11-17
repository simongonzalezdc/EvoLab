# EvoLab Accessibility User Guide

**Version:** 1.0
**Last Updated:** 2025-11-17
**WCAG Compliance:** 2.1 Level AA (90% compliant)

---

## Table of Contents

1. [Introduction](#introduction)
2. [Quick Start](#quick-start)
3. [Accessibility Features Overview](#accessibility-features-overview)
4. [Visual Accessibility](#visual-accessibility)
5. [Keyboard Navigation](#keyboard-navigation)
6. [Screen Reader Support](#screen-reader-support)
7. [Motion & Animation](#motion--animation)
8. [Audio Accessibility](#audio-accessibility)
9. [Game State Information](#game-state-information)
10. [Troubleshooting](#troubleshooting)
11. [Feedback & Support](#feedback--support)

---

## Introduction

EvoLab is an evolution simulation game designed to be accessible to players of all abilities. This guide explains the accessibility features available and how to use them effectively.

### Who This Guide Is For

- Players with visual impairments
- Players with motor disabilities
- Players with vestibular disorders (motion sensitivity)
- Players using assistive technologies (screen readers, switch controls, etc.)
- Anyone who prefers customizable interfaces

### Accessibility Philosophy

EvoLab follows the principles of universal design, ensuring that:
- All functionality is available through multiple interaction methods
- Visual information has text alternatives
- User preferences are respected and persist across sessions
- The interface is customizable to individual needs

---

## Quick Start

### Accessing Accessibility Settings

1. Press **`Esc`** or click the **☰ Menu** button in the top-left corner
2. Select **⚙️ Settings**
3. Scroll to the **♿ Accessibility** section

### Essential Settings

For the best accessible experience, consider enabling:

- **High Contrast Mode** - For low vision users
- **Reduce Motion** - For vestibular disorder sensitivity
- **Screen Reader Announcements** - For blind/low vision users
- **Font Size: Large or Extra Large** - For readability

All settings are automatically saved and will be restored when you return to the game.

---

## Accessibility Features Overview

### Visual Features

| Feature | Purpose | WCAG Criteria |
|---------|---------|---------------|
| High Contrast Mode | Enhanced color differentiation (7:1+ contrast) | 1.4.6 (AAA) |
| Font Size Controls | 4 size options (12px - 18px) | 1.4.4 (AA) |
| Focus Indicators | 3px thick visible focus rings | 2.4.7 (AA) |
| Skip Links | Bypass repetitive content | 2.4.1 (A) |

### Navigation Features

| Feature | Purpose | WCAG Criteria |
|---------|---------|---------------|
| Keyboard Navigation | Complete UI access via keyboard | 2.1.1 (A) |
| Keyboard Shortcuts | Quick actions (Shift+? to view all) | 2.1.1 (A) |
| No Keyboard Traps | Focus can always escape | 2.1.2 (A) |
| Logical Tab Order | Predictable navigation flow | 2.4.3 (A) |

### Screen Reader Features

| Feature | Purpose | WCAG Criteria |
|---------|---------|---------------|
| ARIA Live Regions | Real-time game updates | 4.1.3 (AA) |
| Semantic Landmarks | Page structure navigation | 1.3.1 (A) |
| Accessible Names | All controls properly labeled | 4.1.2 (A) |
| Game State Panel | Text-based canvas alternative | N/A (Enhancement) |

### Motion & Sensory

| Feature | Purpose | WCAG Criteria |
|---------|---------|---------------|
| Reduce Motion | Disable animations | 2.2.2 (A), 2.3.3 (AAA) |
| Pauseable Game | Stop action at any time | 2.2.2 (A) |
| No Flashing Content | Seizure safety | 2.3.1 (A) |

---

## Visual Accessibility

### High Contrast Mode

**Purpose:** Provides maximum color differentiation for low vision users.

**How to Enable:**
1. Go to **Settings** → **Accessibility**
2. Check **✓ High Contrast Mode**
3. Click **Save Settings**

**What Changes:**
- Background: Pure black (#000000)
- Text: Pure white (#FFFFFF)
- Accents: Bright green (#00FF00)
- Borders: White (#FFFFFF)
- Contrast ratios exceed **7:1** (WCAG AAA standard)

**Recommended For:**
- Low vision users
- Users with color blindness
- High ambient light conditions

---

### Font Size Controls

**Purpose:** Scale text for better readability.

**Available Sizes:**
- **Small** (12px) - Compact view
- **Medium** (14px) - Default
- **Large** (16px) - Recommended for low vision
- **Extra Large** (18px) - Maximum readability

**How to Change:**
1. Go to **Settings** → **Accessibility**
2. Select desired size from **Font Size** dropdown
3. Click **Save Settings**

**Note:** Font size scales proportionally across all UI elements.

---

### Focus Indicators

**What They Are:** Visible outlines that show which element has keyboard focus.

**Appearance:**
- **3px thick** colored border
- High contrast against background
- Follows standard focus order

**Navigation:**
- Press **Tab** to move forward
- Press **Shift+Tab** to move backward
- Press **Enter** or **Space** to activate
- Press **Esc** to close modals/panels

---

## Keyboard Navigation

### Essential Keyboard Shortcuts

| Action | Shortcut | Description |
|--------|----------|-------------|
| **View All Shortcuts** | `Shift+?` | Opens keyboard shortcuts panel |
| **Open Menu** | `Esc` | Opens main menu |
| **Open Settings** | `S` | Opens settings panel |
| **Toggle Stats** | `T` | Show/hide statistics panel |
| **Pause/Play** | `Space` | Pause or resume game |
| **Speed Up** | `+` / `=` | Increase game speed |
| **Slow Down** | `-` / `_` | Decrease game speed |
| **Normal Speed** | `0` | Reset to normal speed |
| **Zoom In** | `Z` | Zoom camera in |
| **Zoom Out** | `X` | Zoom camera out |
| **Reset Zoom** | `R` | Reset zoom to default |

### Modal Navigation

All modals (trait editor, settings, etc.) support:
- **Tab** / **Shift+Tab** - Navigate between controls
- **Enter** - Activate buttons
- **Esc** - Close modal
- **Arrow Keys** - Navigate within dropdowns/sliders

### Skip Links

Skip links allow you to bypass repetitive content:

1. Press **Tab** immediately after page loads
2. A "Skip to main content" link will appear
3. Press **Enter** to jump to game canvas area

---

## Screen Reader Support

### Supported Screen Readers

EvoLab has been designed for compatibility with:
- **NVDA** (Windows) - Free, recommended
- **JAWS** (Windows) - Industry standard
- **VoiceOver** (macOS/iOS) - Built-in
- **TalkBack** (Android) - Built-in
- **ChromeVox** (Chrome extension) - Cross-platform

### Enabling Screen Reader Announcements

1. Go to **Settings** → **Accessibility**
2. Check **✓ Screen Reader Announcements**
3. Click **Save Settings**

**What Gets Announced:**
- **Polite (non-interrupting):**
  - Generation completion
  - Trait editor opened
  - Achievement unlocked
  - Resource collection (throttled)
  - Population changes (significant)
  - Biome transitions
  - Health/energy warnings

- **Assertive (interrupting):**
  - Extinction/death
  - Critical health warnings
  - Combat events

### ARIA Live Regions

Two invisible regions provide real-time updates:
- **Polite region** - Waits for pause in speech
- **Assertive region** - Interrupts for critical alerts

Located in `index.html` with `aria-live` attributes.

---

### Game State Panel (Canvas Alternative)

**Purpose:** Provides text-based representation of visual game state.

**How to Enable:**
1. Look for **"📊 Show Game State"** button (top-right corner)
2. Click to expand panel
3. Panel updates every **2 seconds** automatically

**Information Provided:**
- **Species Status:** Generation, population, survival time, diversity
- **Health & Energy:** Current values and status indicators
- **Location:** Current biome, description, time of day, temperature
- **Threats:** Nearby predators, combat intensity
- **Resources:** Total collected, DNA points

**Accessibility Features:**
- Proper heading hierarchy (h2, h3)
- Definition lists (`<dl>`) for structured data
- ARIA live region (`aria-live="polite"`)
- Keyboard accessible
- High contrast compatible

**Example Announcement:**
```
Species Status
Generation: 5
Population: 12 cells
Survival Time: 2m 34s
Diversity Index: 0.75

Health & Energy (Average)
Health: 85 / 100 🟢 Good
Energy (ATP): 92 / 150 🟢 Good
```

---

## Keyboard Navigation

### Complete Keyboard Map

#### Global Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Next focusable element |
| `Shift+Tab` | Previous focusable element |
| `Enter` | Activate button/link |
| `Space` | Pause/Play game |
| `Esc` | Close modal or open menu |
| `Shift+?` | Show keyboard shortcuts help |

#### Game Controls

| Key | Action |
|-----|--------|
| `W` or `↑` | Move up (if manual control) |
| `S` or `↓` | Move down |
| `A` or `←` | Move left |
| `D` or `→` | Move right |
| `Space` | Pause/Resume |

#### Time Control

| Key | Action |
|-----|--------|
| `+` or `=` | Speed up (2x, 3x) |
| `-` or `_` | Slow down |
| `0` | Normal speed |

#### Camera Control

| Key | Action |
|-----|--------|
| `Z` | Zoom in |
| `X` | Zoom out |
| `R` | Reset zoom |

#### Menu Shortcuts

| Key | Action |
|-----|--------|
| `S` | Open settings |
| `T` | Toggle stats panel |
| `N` | New game |
| `L` | Load game |

---

## Motion & Animation

### Reduce Motion

**Purpose:** Minimizes animations for users with vestibular disorders.

**How to Enable:**
1. Go to **Settings** → **Accessibility**
2. Check **✓ Reduce Motion**
3. Click **Save Settings**

**What Changes:**
- All CSS animations reduced to **0.01ms**
- Transitions disabled
- Scroll behavior: instant (no smooth scrolling)
- Particles still visible but minimal motion
- Canvas continues to update (game mechanics preserved)

**Also Respects System Preference:**
- Windows: Settings → Ease of Access → Display → Show animations
- macOS: System Preferences → Accessibility → Display → Reduce motion
- CSS media query: `@media (prefers-reduced-motion: reduce)`

---

## Audio Accessibility

### Sound Effects Control

**How to Configure:**
1. Go to **Settings** → **Audio**
2. Adjust **Sound Effects Volume** slider (0-100%)
3. Mute entirely by setting to 0%

### Music Control

**How to Configure:**
1. Go to **Settings** → **Audio**
2. Toggle **✓ Music Enabled** checkbox
3. Adjust **Music Volume** slider (0-100%)

### Spatial Audio Cues (Experimental)

**Purpose:** Directional sound feedback for navigation.

**Status:** Currently in development for Phase 4.

**When Enabled:**
- Threat proximity warnings
- Resource location hints
- Boundary alerts
- Biome transition cues

---

## Game State Information

### Accessible Game State Panel

The **Accessible Game State Panel** provides a text-based, screen-reader-friendly view of all important game information.

#### Opening the Panel

1. Click **"📊 Show Game State"** button (top-right corner)
2. Or use keyboard: `Tab` until focused, press `Enter`

#### Panel Contents

**1. Species Status**
- Generation number
- Current population count
- Total survival time
- Diversity index (genetic variety)

**2. Health & Energy**
- Average health (current / maximum)
- Status indicator (Good, Fair, Low, Critical)
- Average ATP energy (current / maximum)
- Status indicator

**3. Location**
- Current biome name
- Biome description
- Time of day
- Temperature conditions

**4. Threats & Hazards**
- Number of nearby predators
- Combat intensity level (None, Low, Moderate, High)
- Active environmental hazards

**5. Resources**
- Total resources collected this run
- Available DNA points for evolution

#### Update Frequency

- Panel updates every **2 seconds**
- Updates announced to screen readers (`aria-live="polite"`)
- Critical changes announced immediately

#### Closing the Panel

- Click **✕** button in panel header
- Press **Esc** key
- Click **"📊 Hide Game State"** button

---

## Troubleshooting

### Screen Reader Not Announcing Updates

**Problem:** ARIA live regions not working.

**Solutions:**
1. Ensure **Screen Reader Announcements** are enabled in Settings
2. Refresh the page after enabling
3. Try a different screen reader (NVDA recommended for Windows)
4. Check browser compatibility (Chrome, Firefox, Edge recommended)

### Keyboard Navigation Not Working

**Problem:** Tab key doesn't move focus.

**Solutions:**
1. Click once on the game area to ensure focus is in the window
2. Check for browser extensions that might intercept keys
3. Refresh the page
4. Try a different browser

### High Contrast Mode Not Applying

**Problem:** Colors remain unchanged after enabling.

**Solutions:**
1. Click **Save Settings** button after enabling
2. Refresh the page
3. Check browser console for errors (F12)
4. Try clearing browser cache

### Focus Indicators Not Visible

**Problem:** Can't see which element has focus.

**Solutions:**
1. Enable **High Contrast Mode** for stronger indicators
2. Increase **Font Size** (may help indicator visibility)
3. Check browser zoom level (Ctrl+0 to reset)
4. Try a different browser

### Reduce Motion Not Working

**Problem:** Animations still playing.

**Solutions:**
1. Ensure **Reduce Motion** is checked in Settings
2. Click **Save Settings**
3. Refresh the page
4. Check OS-level "reduce motion" setting

---

## Feedback & Support

### Reporting Accessibility Issues

If you encounter accessibility barriers, please report them:

**GitHub Issues:**
- Repository: `https://github.com/Pastorsimon1798/EvoLab`
- Use label: `accessibility`

**Information to Include:**
1. Your assistive technology (screen reader, browser, OS)
2. Steps to reproduce the issue
3. Expected behavior vs. actual behavior
4. Screenshots (if applicable)

### Feature Requests

We welcome suggestions for accessibility improvements:

**Priority Areas:**
- Screen reader experience
- Keyboard navigation
- Alternative input methods
- Color contrast
- Text alternatives

### Testing Participation

Want to help test accessibility features?

**We're Looking For:**
- Screen reader users
- Keyboard-only users
- Users with low vision
- Users with color blindness
- Users with motor disabilities

---

## Best Practices for Accessible Gameplay

### For Screen Reader Users

1. **Enable Announcements First**
   - Go to Settings → Accessibility → Screen Reader Announcements

2. **Use the Game State Panel**
   - Provides structured, navigable game information
   - Updates every 2 seconds with latest stats

3. **Listen for Critical Alerts**
   - Health warnings (assertive announcements)
   - Extinction events
   - Combat notifications

4. **Navigate by Landmarks**
   - Use screen reader landmark navigation (e.g., NVDA: `D` key)
   - Jump between Main, Navigation, and Aside regions

### For Keyboard-Only Users

1. **Learn Essential Shortcuts**
   - Press `Shift+?` to view all keyboard shortcuts
   - Print or memorize common actions

2. **Use Skip Links**
   - Tab immediately after page load
   - Skip to main content

3. **Pause When Needed**
   - Press `Space` to pause game
   - Explore UI without time pressure

### For Low Vision Users

1. **Optimize Visual Settings**
   - Enable High Contrast Mode
   - Set Font Size to Large or Extra Large
   - Adjust browser zoom (Ctrl+Plus)

2. **Use Game State Panel**
   - Text-based information is easier to read
   - Higher contrast than canvas

3. **Maximize Focus Indicators**
   - High Contrast Mode strengthens indicators
   - Larger fonts make UI elements bigger

---

## Supported Technologies

### Browsers (Recommended)

- ✅ **Chrome** 90+ (Best compatibility)
- ✅ **Firefox** 88+
- ✅ **Edge** 90+
- ✅ **Safari** 14+ (macOS/iOS)

### Operating Systems

- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Linux (Ubuntu, Fedora)
- ⚠️ Mobile (partial support)

### Screen Readers

- ✅ **NVDA** 2020.1+ (Windows)
- ✅ **JAWS** 2019+ (Windows)
- ✅ **VoiceOver** (macOS/iOS)
- ⚠️ **TalkBack** (Android - limited)

---

## Accessibility Compliance Statement

EvoLab strives to meet **WCAG 2.1 Level AA** standards.

### Current Compliance

- **Level A:** 100% compliant (all criteria met)
- **Level AA:** ~90% compliant
- **Level AAA:** ~40% compliant (enhanced features)

### Known Limitations

1. **Canvas Content:** Main game canvas is primarily visual
   - Mitigation: Text-based Game State Panel provided
2. **Real-time Gameplay:** Fast-paced action may challenge some users
   - Mitigation: Pauseable, adjustable speed
3. **Complex Visuals:** Particle effects, multiple moving elements
   - Mitigation: Reduce Motion option

### Ongoing Improvements

We are committed to continuous accessibility enhancement:
- Regular audits
- User testing with assistive technology users
- WCAG compliance monitoring
- Community feedback integration

---

## Additional Resources

### WCAG Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)

### Screen Reader Tutorials

- [NVDA User Guide](https://www.nvaccess.org/files/nvda/documentation/userGuide.html)
- [JAWS Keyboard Shortcuts](https://www.freedomscientific.com/training/jaws/hotkeys/)
- [VoiceOver Tutorial](https://support.apple.com/guide/voiceover/welcome/mac)

---

**Document Version:** 1.0
**Last Review:** 2025-11-17
**Next Review:** 2025-12-17

For questions or feedback, please open an issue on GitHub.

**Thank you for playing EvoLab!** 🧬
