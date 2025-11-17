/**
 * Screen Reader Announcer Utility
 *
 * Provides functions to announce messages to screen readers using ARIA live regions.
 */

export class ScreenReaderAnnouncer {
  private politeElement: HTMLElement | null;
  private assertiveElement: HTMLElement | null;
  private enabled: boolean = true;

  constructor() {
    // Get the ARIA live region elements
    this.politeElement = document.getElementById('announcer-polite');
    this.assertiveElement = document.getElementById('announcer-assertive');
  }

  /**
   * Announce a message with polite priority (waits for screen reader to finish current message)
   * Use for non-critical updates like stats changes, generation progress, etc.
   */
  announcePolite(message: string): void {
    if (!this.enabled || !this.politeElement) return;

    // Clear and set message after a brief delay to ensure it's announced
    this.politeElement.textContent = '';
    setTimeout(() => {
      if (this.politeElement) {
        this.politeElement.textContent = message;
      }
    }, 100);
  }

  /**
   * Announce a message with assertive priority (interrupts screen reader)
   * Use for critical messages like death, achievements, errors, etc.
   */
  announceAssertive(message: string): void {
    if (!this.enabled || !this.assertiveElement) return;

    // Clear and set message after a brief delay to ensure it's announced
    this.assertiveElement.textContent = '';
    setTimeout(() => {
      if (this.assertiveElement) {
        this.assertiveElement.textContent = message;
      }
    }, 100);
  }

  /**
   * Enable or disable screen reader announcements
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;

    // Clear any pending announcements when disabling
    if (!enabled) {
      if (this.politeElement) this.politeElement.textContent = '';
      if (this.assertiveElement) this.assertiveElement.textContent = '';
    }
  }

  /**
   * Check if announcer is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Export a singleton instance
export const screenReaderAnnouncer = new ScreenReaderAnnouncer();
