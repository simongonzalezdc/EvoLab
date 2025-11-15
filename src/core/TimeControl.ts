export type SpeedMultiplier = 1 | 10 | 100 | 1000;

export class TimeControl {
  private speedMultiplier: SpeedMultiplier = 1;
  private isPaused = false;
  private stepMode = false;
  private listeners: Array<(speed: SpeedMultiplier, paused: boolean) => void> = [];

  getSpeedMultiplier(): SpeedMultiplier {
    return this.speedMultiplier;
  }

  setSpeedMultiplier(speed: SpeedMultiplier): void {
    this.speedMultiplier = speed;
    this.notifyListeners();
  }

  pause(): void {
    this.isPaused = true;
    this.notifyListeners();
  }

  resume(): void {
    this.isPaused = false;
    this.stepMode = false;
    this.notifyListeners();
  }

  togglePause(): void {
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  step(): void {
    if (this.isPaused) {
      this.stepMode = true;
    }
  }

  shouldUpdate(): boolean {
    if (this.stepMode) {
      this.stepMode = false;
      return true;
    }
    return !this.isPaused;
  }

  getEffectiveDeltaTime(baseDelta: number): number {
    if (!this.shouldUpdate()) {
      return 0;
    }
    return baseDelta * this.speedMultiplier;
  }

  isPausedState(): boolean {
    return this.isPaused;
  }

  addListener(callback: (speed: SpeedMultiplier, paused: boolean) => void): void {
    this.listeners.push(callback);
  }

  removeListener(callback: (speed: SpeedMultiplier, paused: boolean) => void): void {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      callback(this.speedMultiplier, this.isPaused);
    });
  }

  reset(): void {
    this.speedMultiplier = 1;
    this.isPaused = false;
    this.stepMode = false;
    this.notifyListeners();
  }
}
