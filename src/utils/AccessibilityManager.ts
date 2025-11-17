/**
 * Accessibility Manager
 *
 * Manages accessibility settings and applies them to the DOM.
 */

import type { GameSettings } from '../data/SaveSystem';
import { screenReaderAnnouncer } from './ScreenReaderAnnouncer';

export class AccessibilityManager {
  private currentSettings: GameSettings | null = null;

  /**
   * Apply accessibility settings to the DOM
   */
  applySettings(settings: GameSettings): void {
    this.currentSettings = settings;

    // Apply high contrast mode
    this.applyHighContrast(settings.highContrastMode);

    // Apply font size
    this.applyFontSize(settings.fontSize);

    // Apply reduce motion (also respects system preference)
    this.applyReduceMotion(settings.reduceMotion);

    // Enable/disable screen reader announcements
    screenReaderAnnouncer.setEnabled(settings.screenReaderAnnouncements);
  }

  /**
   * Apply high contrast mode
   */
  private applyHighContrast(enabled: boolean): void {
    if (enabled) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }

  /**
   * Apply font size setting
   */
  private applyFontSize(size: 'small' | 'medium' | 'large' | 'xlarge'): void {
    // Remove all font size classes
    document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large', 'font-size-xlarge');

    // Add the selected font size class
    document.body.classList.add(`font-size-${size}`);
  }

  /**
   * Apply reduce motion setting
   * Note: CSS media query @media (prefers-reduced-motion: reduce) already handles system preference
   */
  private applyReduceMotion(enabled: boolean): void {
    if (enabled) {
      document.body.classList.add('reduce-motion');
      // Add CSS to body to override animations
      this.addReduceMotionStyles();
    } else {
      document.body.classList.remove('reduce-motion');
      this.removeReduceMotionStyles();
    }
  }

  /**
   * Add inline styles to reduce motion
   */
  private addReduceMotionStyles(): void {
    const styleId = 'reduce-motion-override';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      body.reduce-motion *,
      body.reduce-motion *::before,
      body.reduce-motion *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Remove reduce motion override styles
   */
  private removeReduceMotionStyles(): void {
    const styleId = 'reduce-motion-override';
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }
  }

  /**
   * Get current settings
   */
  getSettings(): GameSettings | null {
    return this.currentSettings;
  }

  /**
   * Check if high contrast mode is active (either from settings or system preference)
   */
  isHighContrastActive(): boolean {
    return document.body.classList.contains('high-contrast');
  }

  /**
   * Check if reduce motion is active (either from settings or system preference)
   */
  isReduceMotionActive(): boolean {
    const systemPreference = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const userSetting = document.body.classList.contains('reduce-motion');
    return systemPreference || userSetting;
  }
}

// Export a singleton instance
export const accessibilityManager = new AccessibilityManager();
