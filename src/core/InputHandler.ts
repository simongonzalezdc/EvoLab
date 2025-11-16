// Input handling for keyboard and mouse controls

export class InputHandler {
  private keys: Map<string, boolean> = new Map();
  private mousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private zoomCallbacks: Array<(delta: number) => void> = [];
  private zoomInCallbacks: Array<() => void> = [];
  private zoomOutCallbacks: Array<() => void> = [];
  private resetZoomCallbacks: Array<() => void> = [];

  constructor() {
    this.setupKeyboardListeners();
    this.setupMouseListeners();
  }

  private setupKeyboardListeners(): void {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      this.keys.set(e.key.toLowerCase(), true);

      // Zoom controls: +/= for zoom in, -/_ for zoom out, 0 for reset
      const key = e.key.toLowerCase();
      if (key === '+' || key === '=') {
        e.preventDefault();
        this.zoomInCallbacks.forEach(callback => callback());
      } else if (key === '-' || key === '_') {
        e.preventDefault();
        this.zoomOutCallbacks.forEach(callback => callback());
      } else if (key === '0' && !e.shiftKey) {
        // Only reset on 0, not on ) which is shift+0
        e.preventDefault();
        this.resetZoomCallbacks.forEach(callback => callback());
      }

      // Music preset hotkeys: 1-5 (only when not holding modifiers)
      if (key >= '1' && key <= '5' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const presetIndex = parseInt(key) - 1;
        // Dispatch custom event for preset switching
        window.dispatchEvent(new CustomEvent('musicPresetChange', { detail: presetIndex }));
      }

      // Prevent default behavior for game keys
      if (['w', 'a', 's', 'd', ' '].includes(key)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e: KeyboardEvent) => {
      this.keys.set(e.key.toLowerCase(), false);
    });
  }

  private setupMouseListeners(): void {
    window.addEventListener('mousemove', (e: MouseEvent) => {
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
    });

    // Mouse wheel for zoom
    window.addEventListener('wheel', (e: WheelEvent) => {
      // Only handle zoom when not over UI elements
      const target = e.target as HTMLElement;
      if (target && (target.closest('#hud') || target.closest('.modal-overlay') || target.closest('button'))) {
        return; // Don't zoom when over UI
      }

      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1; // Scroll down = zoom out, scroll up = zoom in
      this.zoomCallbacks.forEach(callback => callback(delta));
    }, { passive: false });
  }

  isKeyPressed(key: string): boolean {
    return this.keys.get(key.toLowerCase()) || false;
  }

  getMousePosition(): { x: number; y: number } {
    return this.mousePosition;
  }

  // Get movement direction from WASD keys
  getMovementDirection(): { x: number; y: number } {
    const direction = { x: 0, y: 0 };

    if (this.isKeyPressed('w')) direction.y -= 1;
    if (this.isKeyPressed('s')) direction.y += 1;
    if (this.isKeyPressed('a')) direction.x -= 1;
    if (this.isKeyPressed('d')) direction.x += 1;

    // Normalize diagonal movement
    const magnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2);
    if (magnitude > 0) {
      direction.x /= magnitude;
      direction.y /= magnitude;
    }

    return direction;
  }

  // Register zoom callbacks
  onZoom(callback: (delta: number) => void): void {
    this.zoomCallbacks.push(callback);
  }

  onZoomIn(callback: () => void): void {
    this.zoomInCallbacks.push(callback);
  }

  onZoomOut(callback: () => void): void {
    this.zoomOutCallbacks.push(callback);
  }

  onResetZoom(callback: () => void): void {
    this.resetZoomCallbacks.push(callback);
  }

  dispose(): void {
    this.keys.clear();
    this.zoomCallbacks = [];
    this.zoomInCallbacks = [];
    this.zoomOutCallbacks = [];
    this.resetZoomCallbacks = [];
  }
}
