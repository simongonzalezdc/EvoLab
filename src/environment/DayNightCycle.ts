// Day/Night cycle system

export class DayNightCycle {
  private time = 0; // 0-24 hours
  private speed = 1; // 1 = real-time, higher = faster
  private cycleLength = 120; // seconds for full day (2 minutes default)

  constructor(startTime = 12, speed = 10) {
    // Start at noon by default
    this.time = startTime;
    this.speed = speed;
  }

  update(deltaTime: number): void {
    // Update time based on cycle length and speed
    const timeIncrement = (24 / this.cycleLength) * deltaTime * this.speed;
    this.time = (this.time + timeIncrement) % 24;
  }

  getTime(): number {
    return this.time;
  }

  getTimeOfDay(): 'dawn' | 'day' | 'dusk' | 'night' {
    if (this.time >= 5 && this.time < 7) return 'dawn';
    if (this.time >= 7 && this.time < 17) return 'day';
    if (this.time >= 17 && this.time < 19) return 'dusk';
    return 'night';
  }

  getLightLevel(): number {
    // Light level 0-1 based on time of day
    if (this.time >= 7 && this.time < 17) {
      return 1.0; // Full daylight
    } else if (this.time >= 5 && this.time < 7) {
      // Dawn: 0.3 → 1.0
      return 0.3 + ((this.time - 5) / 2) * 0.7;
    } else if (this.time >= 17 && this.time < 19) {
      // Dusk: 1.0 → 0.3
      return 1.0 - ((this.time - 17) / 2) * 0.7;
    } else {
      return 0.3; // Night
    }
  }

  getAmbientColor(): number {
    const timeOfDay = this.getTimeOfDay();
    switch (timeOfDay) {
      case 'dawn':
        return 0xffa726; // Orange
      case 'day':
        return 0xffffff; // White
      case 'dusk':
        return 0xff7043; // Deep orange
      case 'night':
        return 0x1a237e; // Deep blue
    }
  }

  setSpeed(speed: number): void {
    this.speed = Math.max(0, speed);
  }

  setTime(time: number): void {
    this.time = Math.max(0, Math.min(24, time));
  }
}
