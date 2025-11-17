# EvoLab Accessibility Testing Guide

**Version:** 1.0
**Last Updated:** 2025-11-17
**Testing Goal:** WCAG 2.1 Level AA compliance verification

---

## Table of Contents

1. [Introduction](#introduction)
2. [Testing Tools Setup](#testing-tools-setup)
3. [Automated Testing](#automated-testing)
4. [Manual Testing Procedures](#manual-testing-procedures)
5. [Screen Reader Testing](#screen-reader-testing)
6. [Keyboard Navigation Testing](#keyboard-navigation-testing)
7. [Visual Accessibility Testing](#visual-accessibility-testing)
8. [Mobile Accessibility Testing](#mobile-accessibility-testing)
9. [Test Report Template](#test-report-template)
10. [Known Issues & Mitigations](#known-issues--mitigations)

---

## Introduction

This guide provides comprehensive testing procedures for verifying EvoLab's accessibility compliance. Follow these steps before releasing new features or updates.

### Testing Priorities

1. **Critical (Must Pass):**
   - Keyboard navigation
   - Screen reader basic functionality
   - Color contrast (WCAG AA)
   - No keyboard traps

2. **High (Should Pass):**
   - ARIA live regions
   - Focus management
   - Form accessibility
   - Reduce motion

3. **Medium (Nice to Have):**
   - Enhanced screen reader experience
   - Spatial audio cues
   - Advanced keyboard shortcuts

---

## Testing Tools Setup

### Required Tools

#### 1. Browser Extensions

**axe DevTools (Chrome/Firefox/Edge)**
```
Install: https://www.deque.com/axe/devtools/
Purpose: Automated accessibility scanning
Cost: Free (basic), Paid (pro)
```

**WAVE (Chrome/Firefox)**
```
Install: https://wave.webaim.org/extension/
Purpose: Visual accessibility feedback
Cost: Free
```

**Color Contrast Analyzer**
```
Install: https://www.tpgi.com/color-contrast-checker/
Purpose: Manual contrast checking
Cost: Free
```

#### 2. Screen Readers

**NVDA (Windows - Required)**
```
Download: https://www.nvaccess.org/download/
Cost: Free (donations welcome)
Platform: Windows
```

**JAWS (Windows - Optional)**
```
Download: https://www.freedomscientific.com/products/software/jaws/
Cost: Paid ($95/year)
Platform: Windows
```

**VoiceOver (macOS - Built-in)**
```
Enable: System Preferences → Accessibility → VoiceOver
Shortcut: Cmd+F5
Platform: macOS/iOS
```

#### 3. Command Line Tools

**axe-core CLI**
```bash
npm install -g @axe-core/cli
```

**Pa11y**
```bash
npm install -g pa11y
```

---

### Browser Setup

**Recommended Browsers:**
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+ (macOS)

**Disable Browser Extensions:**
- Ad blockers may interfere with tests
- Disable all extensions except accessibility tools

---

## Automated Testing

### 1. axe DevTools Browser Extension

**Steps:**
1. Open EvoLab in browser
2. Open DevTools (F12)
3. Navigate to "axe DevTools" tab
4. Click "Scan All of My Page"
5. Review results

**What to Check:**
- **Violations:** Critical issues (must fix)
- **Incomplete:** Needs manual verification
- **Passes:** Working correctly

**Common Violations to Look For:**
- Missing alt text
- Insufficient color contrast
- Missing form labels
- Incorrect ARIA usage
- Missing landmarks

**Example Output:**
```
✅ Passes: 45
⚠️ Incomplete: 3 (need manual review)
❌ Violations: 2 (must fix)

Violations:
1. color-contrast: Element has insufficient color contrast (3.2:1)
   Element: <span class="warning-text">
   Fix: Increase contrast to at least 4.5:1

2. label: Form element does not have a label
   Element: <input id="species-name">
   Fix: Add associated <label> element
```

---

### 2. axe-core CLI

**Command:**
```bash
axe http://localhost:3000 --exit
```

**Save Results:**
```bash
axe http://localhost:3000 --save accessibility-report.json
```

**Custom Configuration:**
```bash
axe http://localhost:3000 \
  --rules color-contrast,label,aria-allowed-attr \
  --exit \
  --save report.json
```

**Interpreting Results:**
```json
{
  "violations": [],
  "passes": [],
  "incomplete": [],
  "inapplicable": []
}
```

---

### 3. WAVE Browser Extension

**Steps:**
1. Open EvoLab in browser
2. Click WAVE extension icon
3. Review visual indicators on page

**Legend:**
- 🟢 Green: Good practices
- 🔴 Red: Errors (must fix)
- 🟡 Yellow: Alerts (review)
- 🔵 Blue: Features (informational)

**Key Checks:**
- Missing alt text (red icon on images)
- Contrast errors (red contrast icon)
- Missing labels (red icon on form fields)
- Proper heading structure (ordered 1→2→3)

---

### 4. Pa11y CLI

**Basic Scan:**
```bash
pa11y http://localhost:3000
```

**With Options:**
```bash
pa11y http://localhost:3000 \
  --standard WCAG2AA \
  --reporter json \
  > pa11y-report.json
```

**Multiple Pages:**
```bash
pa11y-ci --sitemap http://localhost:3000/sitemap.xml
```

---

## Manual Testing Procedures

### Test Checklist

#### ✅ Keyboard Navigation

- [ ] All interactive elements reachable via Tab
- [ ] Tab order follows visual layout (top→bottom, left→right)
- [ ] Shift+Tab moves backwards correctly
- [ ] Focus indicators visible on all elements
- [ ] No keyboard traps (can always escape)
- [ ] Enter activates buttons/links
- [ ] Space activates buttons, checks checkboxes
- [ ] ESC closes modals/menus
- [ ] Arrow keys navigate within components (dropdowns, sliders)

**How to Test:**
1. Plug in keyboard (or use built-in keyboard)
2. Reload page
3. Press Tab continuously
4. Verify each element receives visible focus
5. Verify logical tab order
6. Test Shift+Tab backwards navigation
7. Test activation keys (Enter, Space, ESC)

**Expected Result:**
- Every interactive element has visible focus ring
- Tab order matches visual layout
- No elements skipped
- No infinite loops

---

#### ✅ Screen Reader Compatibility

- [ ] All text content announced
- [ ] Images have alt text or aria-label
- [ ] Form inputs have labels
- [ ] Buttons/links have descriptive names
- [ ] Headings properly nested (h1→h2→h3)
- [ ] ARIA live regions announce updates
- [ ] Modals announced when opened
- [ ] Skip links functional

**How to Test with NVDA (Windows):**

1. Launch NVDA (Insert+Ctrl+N)
2. Open EvoLab in browser
3. Navigate using:
   - **Insert+Down** - Start reading from current position
   - **H** - Next heading
   - **D** - Next landmark (nav, main, aside)
   - **Tab** - Next focusable element
   - **B** - Next button
   - **F** - Next form field

4. Listen for:
   - Clear, descriptive text
   - Proper role announcements ("button", "link", "checkbox")
   - Form labels read before inputs
   - Heading levels announced

**Expected Announcements:**

```
Page Load:
"EvoLab - Evolution Simulation Game, document"
"Skip to main content, link"
"Main navigation, navigation landmark"

Trait Editor Opened:
"Trait editor opened. Generation 5. You have 150 DNA points available."
"Dialog, Trait Editor"
"Allocate DNA points to improve your species traits"

Generation Complete:
"Generation 4 complete! Earned 150 DNA points. 3 mutations discovered."
```

---

#### ✅ Color Contrast

- [ ] All text meets 4.5:1 contrast (WCAG AA)
- [ ] Large text meets 3:1 contrast
- [ ] High contrast mode meets 7:1 (WCAG AAA)
- [ ] UI elements meet 3:1 contrast
- [ ] Focus indicators have sufficient contrast

**How to Test:**

1. **Automated (axe DevTools):**
   - Scan page with axe
   - Review "color-contrast" results
   - Check highlighted elements

2. **Manual (Color Contrast Analyzer):**
   - Download tool from https://www.tpgi.com/color-contrast-checker/
   - Use eyedropper to select foreground color
   - Use eyedropper to select background color
   - Verify ratio meets requirements

**Minimum Ratios:**
| Element Type | Normal Mode (AA) | High Contrast (AAA) |
|--------------|------------------|---------------------|
| Normal text (<18px) | 4.5:1 | 7:1 |
| Large text (≥18px) | 3:1 | 4.5:1 |
| UI components | 3:1 | 3:1 |

**Test Cases:**
- Main text on background
- Button text on button background
- Link text on background
- High contrast mode text
- Focus indicator on background

---

#### ✅ Focus Management

- [ ] Focus visible on all interactive elements
- [ ] Focus order logical
- [ ] Modal focus traps working
- [ ] Focus restored after modal closes
- [ ] Skip links work correctly

**How to Test:**

1. **Visual Focus Indicators:**
   - Tab through all elements
   - Verify 3px colored outline visible
   - Check in normal and high contrast modes

2. **Focus Traps (Modals):**
   - Open modal (e.g., Trait Editor)
   - Press Tab repeatedly
   - Verify focus stays within modal
   - Press Shift+Tab repeatedly
   - Verify backwards navigation works
   - Press ESC
   - Verify modal closes and focus returns

3. **Skip Links:**
   - Reload page
   - Press Tab once
   - Verify "Skip to main content" appears
   - Press Enter
   - Verify focus moves to main canvas area

---

#### ✅ Form Accessibility

- [ ] All inputs have visible labels
- [ ] Labels associated with inputs (htmlFor)
- [ ] Help text linked with aria-describedby
- [ ] Error messages announced
- [ ] Required fields indicated
- [ ] Fieldsets group related inputs

**How to Test:**

1. Navigate to Settings Panel
2. Tab to each form field
3. Verify:
   - Label announced before input
   - Help text announced after input
   - Checkbox labels clickable
   - Dropdown options navigable with arrows

**Example Test (Font Size Setting):**
```
Expected Announcement (NVDA):
"Font Size, combo box, Medium (14px)"
"Adjust text size for better readability"
```

---

#### ✅ ARIA Live Regions

- [ ] Polite announcements don't interrupt
- [ ] Assertive announcements interrupt
- [ ] Announcements clear and concise
- [ ] No announcement spam
- [ ] Announcements triggered correctly

**How to Test:**

1. Enable screen reader
2. Start playing game
3. Listen for announcements:

**Expected Polite Announcements:**
- Generation completion
- Resource collection (throttled)
- Achievement unlocked
- Trait editor opened
- Population changes

**Expected Assertive Announcements:**
- Player death / extinction
- Critical health warnings
- Critical energy warnings

**Test Throttling:**
- Play game for 1 minute
- Count announcements
- Verify not overwhelming (< 1 per second on average)

---

## Screen Reader Testing

### NVDA Testing (Windows)

#### Setup

1. Download NVDA from https://www.nvaccess.org/
2. Install and launch
3. Configure:
   - Insert+Q → Open NVDA menu
   - Preferences → Settings
   - Speech → Rate: Medium
   - Speech → Punctuation Level: Some

#### Essential Commands

| Action | Command |
|--------|---------|
| Start/Stop Reading | Insert+Down Arrow |
| Next Heading | H |
| Next Landmark | D |
| Next Link | K |
| Next Button | B |
| Next Form Field | F |
| Next List | L |
| Next Table | T |
| Read Current Line | Insert+Up Arrow |
| Read Current Word | Insert+NumPad5 |
| Stop Speech | Ctrl |

#### Test Scenarios

**Scenario 1: Page Load**
1. Navigate to http://localhost:3000
2. Wait for page load
3. Listen for:
   - Page title announcement
   - Skip link announcement
   - Landmark structure

**Expected:**
```
"EvoLab - Evolution Simulation Game, document"
"Skip to main content, link"
"Main navigation, navigation landmark"
```

---

**Scenario 2: Main Menu Navigation**
1. Press D to navigate to navigation landmark
2. Press Tab to move through menu items
3. Verify each item announced with role

**Expected:**
```
"Main navigation, navigation landmark"
"New Game, button"
"Load Game, button"
"Settings, button"
```

---

**Scenario 3: Settings Panel**
1. Press S to open settings
2. Navigate through accessibility options
3. Toggle high contrast mode
4. Verify announcement

**Expected:**
```
"Dialog, Settings"
"Accessibility, heading level 3"
"High Contrast Mode, checkbox, not checked"
(Toggle on)
"High Contrast Mode, checkbox, checked"
```

---

**Scenario 4: Gameplay Announcements**
1. Start game
2. Listen for periodic announcements
3. Verify:
   - Population changes announced
   - Health warnings when low
   - Generation completion announced

**Expected:**
```
(After 10 seconds)
"Population increased to 8 cells"

(When health < 50%)
"Health low at 45%"

(Generation complete)
"Generation 2 complete! Earned 120 DNA points. 2 mutations discovered."
```

---

### VoiceOver Testing (macOS)

#### Setup

1. System Preferences → Accessibility → VoiceOver
2. Enable VoiceOver
3. Or press: Cmd+F5

#### Essential Commands

| Action | Command |
|--------|---------|
| Start/Stop VoiceOver | Cmd+F5 |
| Next Item | VO+Right Arrow |
| Previous Item | VO+Left Arrow |
| Activate Item | VO+Space |
| Read All | VO+A |
| Rotor (Navigation) | VO+U |
| Next Heading | (Rotor) Up/Down Arrows |
| Stop Speech | Control |

*(VO = Ctrl+Option)*

#### Test Scenarios

**Scenario 1: Rotor Navigation**
1. Press VO+U to open Rotor
2. Select "Headings" from list
3. Navigate through headings
4. Verify hierarchy (h1 → h2 → h3)

**Expected:**
```
"Headings menu"
"EvoLab, heading level 1"
"Game State, heading level 2"
"Species Status, heading level 3"
```

---

**Scenario 2: Form Navigation**
1. Open Settings Panel
2. Press VO+U → Forms
3. Navigate through form fields
4. Verify labels and values

**Expected:**
```
"Font Size, popup button, Medium (14px)"
"High Contrast Mode, checkbox, unchecked"
"Reduce Motion, checkbox, unchecked"
```

---

## Keyboard Navigation Testing

### Comprehensive Keyboard Test

#### Test 1: Global Navigation

**Steps:**
1. Load page
2. Press Tab from address bar
3. Continue pressing Tab through entire page
4. Document focus order

**Checklist:**
- [ ] Skip link appears first
- [ ] Main menu next
- [ ] Game canvas area
- [ ] Side panels (if visible)
- [ ] Footer/credits
- [ ] Tab loops back to start

**Focus Order Should Be:**
```
1. Skip to main content (link)
2. ☰ Menu button
3. ⚙️ Settings button
4. 📊 Stats toggle button
5. Game canvas (canvas element)
6. Time control buttons (-, pause, +)
7. Zoom controls (Z, X, R)
8. (etc.)
```

---

#### Test 2: Modal Dialog Navigation

**Steps:**
1. Press S to open Settings
2. Verify focus trapped in modal
3. Tab through all controls
4. Verify Tab loops within modal
5. Press ESC to close
6. Verify focus restored

**Checklist:**
- [ ] Focus moves to modal on open
- [ ] First focusable element focused
- [ ] Tab navigates forward through controls
- [ ] Shift+Tab navigates backward
- [ ] Tab at end loops to beginning
- [ ] ESC closes modal
- [ ] Focus returns to trigger button

---

#### Test 3: Form Controls

**Steps:**
1. Open Settings → Accessibility
2. Test each control type

**Checkboxes:**
- [ ] Tab to focus
- [ ] Space toggles checked state
- [ ] State announced to screen reader

**Dropdowns:**
- [ ] Tab to focus
- [ ] Arrow keys change selection
- [ ] Enter/Space opens dropdown
- [ ] ESC closes dropdown without changes

**Sliders:**
- [ ] Tab to focus
- [ ] Arrow keys adjust value
- [ ] Home/End go to min/max
- [ ] Page Up/Down larger adjustments

---

#### Test 4: Keyboard Shortcuts

**Test All Global Shortcuts:**

| Shortcut | Expected Action | Pass/Fail |
|----------|----------------|-----------|
| `Space` | Pause/Resume | [ ] |
| `Esc` | Open/Close Menu | [ ] |
| `S` | Open Settings | [ ] |
| `T` | Toggle Stats Panel | [ ] |
| `+` / `=` | Speed Up | [ ] |
| `-` / `_` | Slow Down | [ ] |
| `0` | Normal Speed | [ ] |
| `Z` | Zoom In | [ ] |
| `X` | Zoom Out | [ ] |
| `R` | Reset Zoom | [ ] |
| `Shift+?` | Show Shortcuts | [ ] |

**Test While Modal Open:**
- [ ] ESC closes modal
- [ ] Tab stays within modal
- [ ] Other shortcuts disabled

---

## Visual Accessibility Testing

### Color Contrast Testing

**Method 1: Automated (axe DevTools)**
1. Open axe DevTools
2. Run scan
3. Filter by "color-contrast"
4. Review all failures
5. Fix issues

**Method 2: Manual (CCA Tool)**
1. Download Color Contrast Analyzer
2. Use eyedropper tool:
   - Select foreground (text) color
   - Select background color
3. Verify ratio meets requirements
4. Document results

**Test Matrix:**

| Element | FG Color | BG Color | Ratio | Min Required | Pass? |
|---------|----------|----------|-------|--------------|-------|
| Body text | #ffffff | #0a0e27 | 12.5:1 | 4.5:1 | ✅ |
| Button text | #ffffff | #4CAF50 | 5.2:1 | 4.5:1 | ✅ |
| Link text | #4CAF50 | #0a0e27 | 7.8:1 | 4.5:1 | ✅ |
| HC mode text | #ffffff | #000000 | 21:1 | 7:1 | ✅ |

---

### High Contrast Mode Testing

**Steps:**
1. Enable High Contrast Mode in Settings
2. Verify all UI elements visible
3. Check contrast ratios
4. Test focus indicators
5. Verify no information lost

**Checklist:**
- [ ] All text readable
- [ ] Buttons clearly visible
- [ ] Borders distinguishable
- [ ] Focus indicators strong (3px)
- [ ] No color-only indicators
- [ ] Icons/symbols visible

**Visual Comparison:**

```
Normal Mode:
- Background: Dark blue (#0a0e27)
- Text: White (#ffffff)
- Accent: Green (#4CAF50)
- Contrast: 4.5:1+ (AA)

High Contrast Mode:
- Background: Pure black (#000000)
- Text: Pure white (#ffffff)
- Accent: Bright green (#00ff00)
- Contrast: 21:1 (AAA)
```

---

### Font Size Testing

**Steps:**
1. Test each font size setting:
   - Small (12px)
   - Medium (14px) - Default
   - Large (16px)
   - Extra Large (18px)

2. For each size, verify:
   - [ ] Text readable
   - [ ] UI elements scale
   - [ ] No overlapping text
   - [ ] Buttons still clickable
   - [ ] Layout doesn't break

**Browser Zoom Test:**
1. Set font size to Medium
2. Zoom browser to 200% (Ctrl+Plus)
3. Verify:
   - [ ] All text visible
   - [ ] No horizontal scrolling (or minimal)
   - [ ] Functionality preserved
   - [ ] Layout responsive

---

### Reduce Motion Testing

**Steps:**
1. Enable Reduce Motion in Settings
2. Navigate through all screens
3. Verify animations disabled
4. Check functionality preserved

**Checklist:**
- [ ] Modal transitions instant
- [ ] Button hover no animation
- [ ] Particle effects minimal/disabled
- [ ] Smooth scrolling disabled
- [ ] Fade effects instant
- [ ] Gameplay still functional

**System Preference Test:**
1. Disable manual Reduce Motion
2. Enable OS-level reduce motion:
   - **Windows:** Settings → Ease of Access → Display → Show animations (Off)
   - **macOS:** System Preferences → Accessibility → Display → Reduce motion (On)
3. Reload page
4. Verify animations disabled automatically

---

## Mobile Accessibility Testing

### iOS Testing (VoiceOver)

**Setup:**
1. Settings → Accessibility → VoiceOver → On
2. Or triple-click home button (if configured)

**Gestures:**
- Swipe right: Next element
- Swipe left: Previous element
- Double-tap: Activate element
- Three-finger swipe: Scroll
- Two-finger Z: Go back

**Test Cases:**
- [ ] All interactive elements announced
- [ ] Swipe navigation logical
- [ ] Buttons activatable via double-tap
- [ ] Forms usable with VoiceOver
- [ ] Game state panel accessible

---

### Android Testing (TalkBack)

**Setup:**
1. Settings → Accessibility → TalkBack → On
2. Or volume up+down for 3 seconds

**Gestures:**
- Swipe right: Next element
- Swipe left: Previous element
- Double-tap: Activate
- Two-finger swipe: Scroll

**Test Cases:**
- [ ] Navigation with swipes works
- [ ] Form inputs accessible
- [ ] Buttons activatable
- [ ] Content readable

---

## Test Report Template

### Accessibility Test Report

**Date:** YYYY-MM-DD
**Tester:** [Your Name]
**Version:** [App Version]
**Environment:** [Browser, OS, Screen Reader]

---

#### Summary

- **Overall Pass Rate:** X%
- **Critical Issues:** X
- **High Priority Issues:** X
- **Medium Priority Issues:** X
- **Low Priority Issues:** X

---

#### Automated Test Results

**axe DevTools:**
- Violations: X
- Incomplete: X
- Passes: X

**WAVE:**
- Errors: X
- Alerts: X
- Features: X

---

#### Manual Test Results

**Keyboard Navigation:** ✅ / ❌
- All elements reachable: ✅ / ❌
- Focus indicators visible: ✅ / ❌
- No keyboard traps: ✅ / ❌
- Logical tab order: ✅ / ❌

**Screen Reader (NVDA):** ✅ / ❌
- Content readable: ✅ / ❌
- ARIA live regions working: ✅ / ❌
- Forms accessible: ✅ / ❌
- Landmarks navigable: ✅ / ❌

**Visual Accessibility:** ✅ / ❌
- Color contrast AA: ✅ / ❌
- Color contrast AAA (HC mode): ✅ / ❌
- Font sizing works: ✅ / ❌
- Reduce motion works: ✅ / ❌

---

#### Issues Found

**Issue #1: [Title]**
- **Severity:** Critical / High / Medium / Low
- **WCAG Criterion:** X.X.X
- **Description:** [Detailed description]
- **Steps to Reproduce:**
  1. Step 1
  2. Step 2
  3. Step 3
- **Expected Behavior:** [What should happen]
- **Actual Behavior:** [What actually happens]
- **Recommendation:** [How to fix]
- **Screenshot:** [If applicable]

---

#### Recommendations

1. [Priority 1 recommendation]
2. [Priority 2 recommendation]
3. [Priority 3 recommendation]

---

#### Tested Features

- [x] Main menu navigation
- [x] Settings panel
- [x] Trait editor
- [x] Game state panel
- [ ] [Feature not yet tested]

---

## Known Issues & Mitigations

### Issue: Canvas Not Fully Accessible to Screen Readers

**Status:** Known limitation
**WCAG Impact:** 1.1.1 (Level A) - Partial compliance
**Mitigation:**
- Accessible Game State Panel provides text alternative
- Real-time announcements for key events
- Keyboard shortcuts for all actions

### Issue: Real-time Announcements May Overwhelm

**Status:** Mitigated via throttling
**WCAG Impact:** N/A (enhancement)
**Mitigation:**
- Throttled announcements (max 1 per 3-5 seconds per type)
- Significance detection (only announce meaningful changes)
- User can disable announcements in settings

### Issue: Mobile Support Partial

**Status:** In progress
**WCAG Impact:** Various (mobile-specific)
**Mitigation:**
- Touch targets sized appropriately
- Basic VoiceOver/TalkBack support
- Responsive layout

---

## Continuous Testing

### Pre-Release Checklist

Before each release, complete:

- [ ] Run axe DevTools scan (0 violations)
- [ ] Run axe-core CLI (0 violations)
- [ ] Manual keyboard navigation test
- [ ] NVDA screen reader test
- [ ] High contrast mode verification
- [ ] Reduce motion verification
- [ ] Color contrast spot check
- [ ] Test all new features for accessibility

### Regression Testing

After bug fixes or updates, re-test:

- [ ] Affected feature with screen reader
- [ ] Affected feature with keyboard only
- [ ] Full axe scan
- [ ] Visual regression (contrast, sizing)

---

**Document Version:** 1.0
**Last Updated:** 2025-11-17
**Next Review:** Monthly

For questions about accessibility testing, please open an issue on GitHub.
