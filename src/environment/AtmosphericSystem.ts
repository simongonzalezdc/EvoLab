// Atmospheric Composition System
// Tracks O2, CO2, N2 levels and simulates gas exchange

export interface AtmosphericComposition {
  oxygen: number; // O2 percentage (0-100)
  carbonDioxide: number; // CO2 percentage (0-100)
  nitrogen: number; // N2 percentage (0-100)
}

export interface AtmosphericZone {
  x: number;
  y: number;
  radius: number;
  composition: AtmosphericComposition;
  lastUpdate: number;
}

export class AtmosphericSystem {
  private zones: Map<string, AtmosphericZone> = new Map();
  private globalComposition: AtmosphericComposition;
  private zoneSize: number = 100; // Size of atmospheric zones in world units

  constructor() {
    // Default atmospheric composition (similar to Earth's ocean dissolved gases)
    this.globalComposition = {
      oxygen: 65, // Dissolved oxygen in water
      carbonDioxide: 25, // CO2 dissolved in water
      nitrogen: 10, // N2 dissolved in water
    };
  }

  // Get atmospheric composition at a specific world position
  getCompositionAt(x: number, y: number): AtmosphericComposition {
    const zoneKey = this.getZoneKey(x, y);
    const zone = this.zones.get(zoneKey);

    if (zone) {
      return { ...zone.composition };
    }

    // Return global composition if no local zone exists
    return { ...this.globalComposition };
  }

  // Update atmospheric composition based on biotic activity
  update(deltaTime: number, plants: number, animals: number, x: number, y: number): void {
    const zoneKey = this.getZoneKey(x, y);
    let zone = this.zones.get(zoneKey);

    if (!zone) {
      zone = {
        x: Math.floor(x / this.zoneSize) * this.zoneSize,
        y: Math.floor(y / this.zoneSize) * this.zoneSize,
        radius: this.zoneSize,
        composition: { ...this.globalComposition },
        lastUpdate: Date.now(),
      };
      this.zones.set(zoneKey, zone);
    }

    // Plants produce O2 and consume CO2 (photosynthesis)
    const plantEffect = plants * 0.1 * deltaTime;
    zone.composition.oxygen = Math.min(100, zone.composition.oxygen + plantEffect);
    zone.composition.carbonDioxide = Math.max(0, zone.composition.carbonDioxide - plantEffect);

    // Animals consume O2 and produce CO2 (respiration)
    const animalEffect = animals * 0.05 * deltaTime;
    zone.composition.oxygen = Math.max(0, zone.composition.oxygen - animalEffect);
    zone.composition.carbonDioxide = Math.min(100, zone.composition.carbonDioxide + animalEffect);

    // Gas exchange with surrounding zones (diffusion)
    this.diffuseGases(zone, deltaTime);

    // Normalize to 100% total (O2 + CO2 + N2 = 100)
    this.normalizeComposition(zone.composition);

    zone.lastUpdate = Date.now();
  }

  // Diffuse gases between adjacent zones
  private diffuseGases(zone: AtmosphericZone, deltaTime: number): void {
    const diffusionRate = 0.02 * deltaTime; // 2% exchange per second

    // Get adjacent zones
    const adjacentKeys = [
      this.getZoneKey(zone.x + this.zoneSize, zone.y),
      this.getZoneKey(zone.x - this.zoneSize, zone.y),
      this.getZoneKey(zone.x, zone.y + this.zoneSize),
      this.getZoneKey(zone.x, zone.y - this.zoneSize),
    ];

    let avgOxygen = zone.composition.oxygen;
    let avgCO2 = zone.composition.carbonDioxide;
    let count = 1;

    for (const key of adjacentKeys) {
      const adjacent = this.zones.get(key);
      if (adjacent) {
        avgOxygen += adjacent.composition.oxygen;
        avgCO2 += adjacent.composition.carbonDioxide;
        count++;
      } else {
        // Use global composition for non-existent zones
        avgOxygen += this.globalComposition.oxygen;
        avgCO2 += this.globalComposition.carbonDioxide;
        count++;
      }
    }

    avgOxygen /= count;
    avgCO2 /= count;

    // Apply diffusion (gradual equilibration)
    zone.composition.oxygen += (avgOxygen - zone.composition.oxygen) * diffusionRate;
    zone.composition.carbonDioxide += (avgCO2 - zone.composition.carbonDioxide) * diffusionRate;
  }

  // Normalize gas percentages to 100%
  private normalizeComposition(composition: AtmosphericComposition): void {
    const total = composition.oxygen + composition.carbonDioxide + composition.nitrogen;
    if (total > 0) {
      composition.oxygen = (composition.oxygen / total) * 100;
      composition.carbonDioxide = (composition.carbonDioxide / total) * 100;
      composition.nitrogen = (composition.nitrogen / total) * 100;
    }
  }

  // Get zone key from world coordinates
  private getZoneKey(x: number, y: number): string {
    const zoneX = Math.floor(x / this.zoneSize);
    const zoneY = Math.floor(y / this.zoneSize);
    return `${zoneX},${zoneY}`;
  }

  // Manually adjust atmospheric composition (for events)
  adjustComposition(x: number, y: number, oxygenDelta: number, co2Delta: number): void {
    const zoneKey = this.getZoneKey(x, y);
    let zone = this.zones.get(zoneKey);

    if (!zone) {
      zone = {
        x: Math.floor(x / this.zoneSize) * this.zoneSize,
        y: Math.floor(y / this.zoneSize) * this.zoneSize,
        radius: this.zoneSize,
        composition: { ...this.globalComposition },
        lastUpdate: Date.now(),
      };
      this.zones.set(zoneKey, zone);
    }

    zone.composition.oxygen = Math.max(0, Math.min(100, zone.composition.oxygen + oxygenDelta));
    zone.composition.carbonDioxide = Math.max(0, Math.min(100, zone.composition.carbonDioxide + co2Delta));

    this.normalizeComposition(zone.composition);
  }

  // Get oxygen sufficiency (0-1, where 1 is ideal)
  getOxygenSufficiency(x: number, y: number): number {
    const composition = this.getCompositionAt(x, y);
    // Ideal oxygen is around 60-70%
    const ideal = 65;
    const deviation = Math.abs(composition.oxygen - ideal);
    return Math.max(0, 1 - (deviation / 50)); // 0 if deviation > 50%
  }

  // Clear old zones to save memory
  cleanup(currentTime: number, maxAge: number = 300000): void {
    for (const [key, zone] of this.zones.entries()) {
      if (currentTime - zone.lastUpdate > maxAge) {
        this.zones.delete(key);
      }
    }
  }

  // Get all active zones (for debugging/visualization)
  getAllZones(): AtmosphericZone[] {
    return Array.from(this.zones.values());
  }

  // Reset system
  reset(): void {
    this.zones.clear();
  }

  // Set global baseline composition
  setGlobalComposition(composition: Partial<AtmosphericComposition>): void {
    this.globalComposition = {
      oxygen: composition.oxygen ?? this.globalComposition.oxygen,
      carbonDioxide: composition.carbonDioxide ?? this.globalComposition.carbonDioxide,
      nitrogen: composition.nitrogen ?? this.globalComposition.nitrogen,
    };
    this.normalizeComposition(this.globalComposition);
  }

  getGlobalComposition(): AtmosphericComposition {
    return { ...this.globalComposition };
  }
}
