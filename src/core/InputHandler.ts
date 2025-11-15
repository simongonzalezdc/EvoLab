// Input handling for keyboard and mouse controls

export class InputHandler {
  private keys: Map<string, boolean> = new Map();
  private mousePosition: { x: number; y: number } = { x: 0, y: 0 };

  constructor() {
    this.setupKeyboardListeners();
    this.setupMouseListeners();
  }

  private setupKeyboardListeners(): void {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      this.keys.set(e.key.toLowerCase(), true);

      // Prevent default behavior for game keys
      if (['w', 'a', 's', 'd', ' '].includes(e.key.toLowerCase())) {
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

  dispose(): void {
    this.keys.clear();
  }
}
