/**
 * Screen Reader Announcer Utility
 *
 * Provides functions to announce messages to screen readers using ARIA live regions.
 */

export class ScreenReaderAnnouncer {
  private politeElement: HTMLElement | null = null;
  private assertiveElement: HTMLElement | null = null;
  private enabled: boolean = true;
  private politeTimeout: number | null = null;
  private assertiveTimeout: number | null = null;

  constructor() {
    // Try to get the ARIA live region elements
    this.initializeElements();
  }

  /**
   * Initialize or re-initialize the ARIA live region elements
   * Useful if elements aren't available at construction time
   */
  private initializeElements(): void {
    if (typeof document !== 'undefined') {
      this.politeElement = document.getElementById('announcer-polite');
      this.assertiveElement = document.getElementById('announcer-assertive');
    }
  }

  /**
   * Announce a message with polite priority (waits for screen reader to finish current message)
   * Use for non-critical updates like stats changes, generation progress, etc.
   */
  announcePolite(message: string): void {
    if (!this.enabled) return;

    // Lazy initialize if elements weren't available at construction
    if (!this.politeElement) {
      this.initializeElements();
      if (!this.politeElement) return;
    }

    // Clear any pending timeout
    if (this.politeTimeout !== null) {
      clearTimeout(this.politeTimeout);
    }

    // Clear and set message after a brief delay to ensure it's announced
    this.politeElement.textContent = '';
    this.politeTimeout = window.setTimeout(() => {
      if (this.politeElement) {
        this.politeElement.textContent = message;
      }
      this.politeTimeout = null;
    }, 100);
  }

  /**
   * Announce a message with assertive priority (interrupts screen reader)
   * Use for critical messages like death, achievements, errors, etc.
   */
  announceAssertive(message: string): void {
    if (!this.enabled) return;

    // Lazy initialize if elements weren't available at construction
    if (!this.assertiveElement) {
      this.initializeElements();
      if (!this.assertiveElement) return;
    }

    // Clear any pending timeout
    if (this.assertiveTimeout !== null) {
      clearTimeout(this.assertiveTimeout);
    }

    // Clear and set message after a brief delay to ensure it's announced
    this.assertiveElement.textContent = '';
    this.assertiveTimeout = window.setTimeout(() => {
      if (this.assertiveElement) {
        this.assertiveElement.textContent = message;
      }
      this.assertiveTimeout = null;
    }, 100);
  }

  /**
   * Enable or disable screen reader announcements
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;

    // Clear any pending announcements and timeouts when disabling
    if (!enabled) {
      // Clear timeouts to prevent memory leaks
      if (this.politeTimeout !== null) {
        clearTimeout(this.politeTimeout);
        this.politeTimeout = null;
      }
      if (this.assertiveTimeout !== null) {
        clearTimeout(this.assertiveTimeout);
        this.assertiveTimeout = null;
      }

      // Clear any visible announcements
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
