// Advanced cell rendering with trait-based visual indicators

import { Graphics, Container } from 'pixi.js';
import type { Traits } from '../types/entities';

export class CellRenderer {
  private container: Container;
  private baseShape: Graphics;
  private healthHalo: Graphics;
  private sizeRing: Graphics;
  private atpGlow: Graphics;
  private trailContainer: Container;
  private trailPoints: { x: number; y: number }[] = [];
  private maxTrailLength = 10;

  constructor(container: Container) {
    this.container = container;
    this.baseShape = new Graphics();
    this.healthHalo = new Graphics();
    this.sizeRing = new Graphics();
    this.atpGlow = new Graphics();
    this.trailContainer = new Container();

    // Add layers in order (back to front)
    container.addChild(this.trailContainer);
    container.addChild(this.atpGlow);
    container.addChild(this.sizeRing);
    container.addChild(this.healthHalo);
    container.addChild(this.baseShape);
  }

  // Create cell visual based on type
  createCellVisual(
    x: number,
    y: number,
    radius: number,
    color: number,
    traits: Traits,
    cellType: 'herbivore' | 'carnivore' | 'omnivore' | 'player' = 'player'
  ): Graphics {
    const mainGraphic = new Graphics();
    mainGraphic.x = x;
    mainGraphic.y = y;

    // Draw base shape based on cell type
    this.drawBaseShape(mainGraphic, radius, color, cellType, traits);

    return mainGraphic;
  }

  // Draw base shape with different styles for different types
  private drawBaseShape(
    graphic: Graphics,
    radius: number,
    color: number,
    cellType: string,
    traits: Traits
  ): void {
    graphic.clear();

    switch (cellType) {
      case 'herbivore':
        // Herbivores: soft rounded shape with leaf-like protrusions
        this.drawHerbivoreShape(graphic, radius, color);
        break;

      case 'carnivore':
        // Carnivores: angular shape with sharp edges
        this.drawCarnivoreShape(graphic, radius, color, traits.aggression);
        break;

      case 'omnivore':
        // Omnivores: hybrid shape
        this.drawOmnivoreShape(graphic, radius, color);
        break;

      case 'player':
      default:
        // Player/default: enhanced circle with trait-based variations
        this.drawPlayerShape(graphic, radius, color, traits);
        break;
    }
  }

  private drawHerbivoreShape(graphic: Graphics, radius: number, color: number): void {
    // Draw soft circle with small protrusions (leaf-like)
    const protrusions = 6;
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i <= protrusions * 2; i++) {
      const angle = (Math.PI * 2 * i) / (protrusions * 2);
      const isProtrusion = i % 2 === 0;
      const r = isProtrusion ? radius * 1.15 : radius * 0.95;
      points.push({
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
      });
    }

    // Draw filled shape
    if (points[0]) {
      graphic.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        const point = points[i];
        if (point) {
          graphic.lineTo(point.x, point.y);
        }
      }
      graphic.fill(color);

      // Add outline
      graphic.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        const point = points[i];
        if (point) {
          graphic.lineTo(point.x, point.y);
        }
      }
      graphic.stroke({ width: 2, color: 0xffffff, alpha: 0.4 });
    }
  }

  private drawCarnivoreShape(
    graphic: Graphics,
    radius: number,
    color: number,
    aggression: number
  ): void {
    // Draw angular shape with spikes (more spikes = higher aggression)
    const spikes = Math.min(8, Math.floor(3 + aggression / 2));
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i <= spikes * 2; i++) {
      const angle = (Math.PI * 2 * i) / (spikes * 2);
      const isSpike = i % 2 === 0;
      const r = isSpike ? radius * 1.3 : radius * 0.7;
      points.push({
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
      });
    }

    // Draw filled shape
    if (points[0]) {
      graphic.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        const point = points[i];
        if (point) {
          graphic.lineTo(point.x, point.y);
        }
      }
      graphic.fill(color);

      // Add sharp outline
      graphic.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        const point = points[i];
        if (point) {
          graphic.lineTo(point.x, point.y);
        }
      }
    }
    graphic.stroke({ width: 2, color: 0xff0000, alpha: 0.6 });
  }

  private drawOmnivoreShape(graphic: Graphics, radius: number, color: number): void {
    // Hybrid: hexagonal base with slight variations
    const sides = 6;
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i <= sides; i++) {
      const angle = (Math.PI * 2 * i) / sides;
      const r = radius * (0.95 + Math.random() * 0.1);
      points.push({
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
      });
    }

    // Draw filled shape
    if (points[0]) {
      graphic.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        const point = points[i];
        if (point) {
          graphic.lineTo(point.x, point.y);
        }
      }
      graphic.fill(color);

      // Add outline
      graphic.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        const point = points[i];
        if (point) {
          graphic.lineTo(point.x, point.y);
        }
      }
      graphic.stroke({ width: 2, color: 0xffffff, alpha: 0.5 });
    }
  }

  private drawPlayerShape(
    graphic: Graphics,
    radius: number,
    color: number,
    traits: Traits
  ): void {
    // Shape variations based on dominant traits
    const dominantTrait = this.getDominantTrait(traits);

    switch (dominantTrait) {
      case 'armor':
        // High armor = hexagonal/geometric shape (defensive)
        this.drawHexagonalShape(graphic, radius, color, traits.armor);
        break;

      case 'speed':
        // High speed = streamlined/elongated shape (aerodynamic)
        this.drawStreamlinedShape(graphic, radius, color, traits.speed);
        break;

      case 'photosynthesis':
        // High photosynthesis = star/plant-like shape
        this.drawStarShape(graphic, radius, color, traits.photosynthesis);
        break;

      case 'camouflage':
        // High camouflage = soft organic shape with irregular edges
        this.drawCamouflageShape(graphic, radius, color, traits.camouflage);
        break;

      default: {
        // Balanced traits = standard circle
        graphic.circle(0, 0, radius);
        graphic.fill(color);

        // Outline color based on speed
        const outlineColor = traits.speed > 7 ? 0x00ffff : 0xffffff;
        const outlineWidth = 1 + traits.armor * 0.3;

        graphic.circle(0, 0, radius);
        graphic.stroke({ width: outlineWidth, color: outlineColor, alpha: 0.5 });
        break;
      }
    }
  }

  // Determine dominant trait for shape selection
  private getDominantTrait(traits: Traits): string {
    // Threshold for considering a trait "dominant"
    const HIGH_THRESHOLD = 7;

    if (traits.armor >= HIGH_THRESHOLD) return 'armor';
    if (traits.speed >= HIGH_THRESHOLD) return 'speed';
    if (traits.photosynthesis >= HIGH_THRESHOLD) return 'photosynthesis';
    if (traits.camouflage >= HIGH_THRESHOLD) return 'camouflage';

    return 'balanced';
  }

  // Hexagonal shape for armored cells
  private drawHexagonalShape(graphic: Graphics, radius: number, color: number, armor: number): void {
    const sides = 6;
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i <= sides; i++) {
      const angle = (Math.PI * 2 * i) / sides - Math.PI / 2; // Rotate to point up
      points.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      });
    }

    // Draw filled shape
    if (points[0]) {
      graphic.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        const point = points[i];
        if (point) {
          graphic.lineTo(point.x, point.y);
        }
      }
      graphic.fill(color);

      // Thick armor outline
      const armorThickness = 1 + armor * 0.4;
      graphic.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        const point = points[i];
        if (point) {
          graphic.lineTo(point.x, point.y);
        }
      }
      graphic.stroke({ width: armorThickness, color: 0x888888, alpha: 0.7 });
    }
  }

  // Streamlined shape for fast cells
  private drawStreamlinedShape(graphic: Graphics, radius: number, color: number, speed: number): void {
    // Ellipse elongated in direction of movement
    const elongation = 1 + (speed / 20); // 1.35 at speed 7
    const width = radius;
    const height = radius * elongation;

    // Draw ellipse
    graphic.ellipse(0, 0, width, height);
    graphic.fill(color);

    // Streamline outline (cyan for speed)
    graphic.ellipse(0, 0, width, height);
    graphic.stroke({ width: 1.5, color: 0x00ffff, alpha: 0.6 });

    // Add trailing edge markers (small fins)
    const finSize = radius * 0.3;
    graphic.moveTo(-finSize, height * 0.7);
    graphic.lineTo(0, height);
    graphic.lineTo(finSize, height * 0.7);
    graphic.stroke({ width: 1, color: 0x00ffff, alpha: 0.5 });
  }

  // Star shape for photosynthetic cells
  private drawStarShape(graphic: Graphics, radius: number, color: number, photosynthesis: number): void {
    const points = Math.min(8, Math.floor(4 + photosynthesis / 2)); // 4-8 points
    const outerRadius = radius;
    const innerRadius = radius * 0.6;
    const coords: { x: number; y: number }[] = [];

    for (let i = 0; i < points * 2; i++) {
      const angle = (Math.PI * 2 * i) / (points * 2) - Math.PI / 2;
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      coords.push({
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
      });
    }

    // Draw star
    if (coords[0]) {
      graphic.moveTo(coords[0].x, coords[0].y);
      for (let i = 1; i < coords.length; i++) {
        const coord = coords[i];
        if (coord) {
          graphic.lineTo(coord.x, coord.y);
        }
      }
      graphic.lineTo(coords[0].x, coords[0].y);
      graphic.fill(color);

      // Green outline for photosynthesis
      graphic.moveTo(coords[0].x, coords[0].y);
      for (let i = 1; i < coords.length; i++) {
        const coord = coords[i];
        if (coord) {
          graphic.lineTo(coord.x, coord.y);
        }
      }
      graphic.lineTo(coords[0].x, coords[0].y);
      graphic.stroke({ width: 1.5, color: 0x00ff00, alpha: 0.6 });
    }
  }

  // Irregular soft shape for camouflaged cells
  private drawCamouflageShape(graphic: Graphics, radius: number, color: number, camouflage: number): void {
    const points = 12; // More points = smoother shape
    const coords: { x: number; y: number }[] = [];
    const irregularity = 0.15 + (camouflage / 100); // 0.15-0.25

    // Use color as seed for deterministic "randomness" (prevents flickering)
    // Simple seeded random function based on cell color
    const seed = color;
    const seededRandom = (index: number) => {
      const x = Math.sin(seed * (index + 1) * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };

    for (let i = 0; i <= points; i++) {
      const angle = (Math.PI * 2 * i) / points;
      const randomness = 1 + (seededRandom(i) - 0.5) * irregularity;
      const r = radius * randomness;
      coords.push({
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
      });
    }

    // Draw organic shape
    if (coords[0]) {
      graphic.moveTo(coords[0].x, coords[0].y);
      for (let i = 1; i < coords.length; i++) {
        const coord = coords[i];
        if (coord) {
          graphic.lineTo(coord.x, coord.y);
        }
      }
      graphic.fill(color);

      // Soft faded outline
      graphic.moveTo(coords[0].x, coords[0].y);
      for (let i = 1; i < coords.length; i++) {
        const coord = coords[i];
        if (coord) {
          graphic.lineTo(coord.x, coord.y);
        }
      }
      graphic.stroke({ width: 1, color: 0xffffff, alpha: 0.3 });
    }
  }

  // Update visual indicators based on current traits
  updateIndicators(
    x: number,
    y: number,
    radius: number,
    traits: Traits,
    showTrail: boolean = false
  ): void {
    // Update health halo
    this.updateHealthHalo(x, y, radius, traits);

    // Update size ring
    this.updateSizeRing(x, y, radius, traits);

    // Update ATP glow
    this.updateAtpGlow(x, y, radius, traits);

    // Update trail if enabled
    if (showTrail) {
      this.updateTrail(x, y);
    }
  }

  private updateHealthHalo(x: number, y: number, radius: number, traits: Traits): void {
    this.healthHalo.clear();
    this.healthHalo.x = x;
    this.healthHalo.y = y;

    const healthPercent = traits.health / traits.maxHealth;

    // Only show halo when health is low or damaged
    if (healthPercent < 0.7) {
      let haloColor = 0x00ff00; // Green
      if (healthPercent < 0.3) {
        haloColor = 0xff0000; // Red
      } else if (healthPercent < 0.6) {
        haloColor = 0xffff00; // Yellow
      }

      // Pulsing halo effect
      const pulseScale = 1 + Math.sin(Date.now() / 200) * 0.1;
      const haloRadius = radius * 1.2 * pulseScale;

      this.healthHalo.circle(0, 0, haloRadius);
      this.healthHalo.stroke({ width: 2, color: haloColor, alpha: 0.4 * healthPercent });
    }
  }

  private updateSizeRing(x: number, y: number, radius: number, traits: Traits): void {
    this.sizeRing.clear();
    this.sizeRing.x = x;
    this.sizeRing.y = y;

    // Show size ring for larger cells
    if (traits.size > 5) {
      const ringRadius = radius * 1.4;
      const sizeIntensity = Math.min(1, traits.size / 10);

      this.sizeRing.circle(0, 0, ringRadius);
      this.sizeRing.stroke({
        width: 1,
        color: 0x9999ff,
        alpha: 0.2 * sizeIntensity,
      });
    }
  }

  private updateAtpGlow(x: number, y: number, radius: number, traits: Traits): void {
    this.atpGlow.clear();
    this.atpGlow.x = x;
    this.atpGlow.y = y;

    const atpPercent = traits.atp / traits.maxATP;

    // Glow intensity based on ATP level
    if (atpPercent > 0.7) {
      const glowRadius = radius * 1.6;
      const glowIntensity = (atpPercent - 0.7) / 0.3; // 0 to 1 range

      this.atpGlow.circle(0, 0, glowRadius);
      this.atpGlow.fill({ color: 0xffff00, alpha: 0.1 * glowIntensity });
    } else if (atpPercent < 0.3) {
      // Low ATP: dim pulsing red warning
      const pulseScale = 1 + Math.sin(Date.now() / 300) * 0.15;
      const warningRadius = radius * 1.3 * pulseScale;

      this.atpGlow.circle(0, 0, warningRadius);
      this.atpGlow.stroke({ width: 2, color: 0xff0000, alpha: 0.3 * (1 - atpPercent) });
    }
  }

  private updateTrail(x: number, y: number): void {
    // Add current position to trail
    this.trailPoints.push({ x, y });

    // Limit trail length
    if (this.trailPoints.length > this.maxTrailLength) {
      this.trailPoints.shift();
    }

    // Redraw trail
    this.trailContainer.removeChildren();

    for (let i = 0; i < this.trailPoints.length - 1; i++) {
      const point = this.trailPoints[i];
      if (!point) continue;
      const alpha = (i / this.trailPoints.length) * 0.3;
      const width = (i / this.trailPoints.length) * 3;

      const trail = new Graphics();
      trail.circle(point.x, point.y, width);
      trail.fill({ color: 0xffffff, alpha });

      this.trailContainer.addChild(trail);
    }
  }

  // Clear trail
  clearTrail(): void {
    this.trailPoints = [];
    this.trailContainer.removeChildren();
  }

  dispose(): void {
    this.baseShape.destroy();
    this.healthHalo.destroy();
    this.sizeRing.destroy();
    this.atpGlow.destroy();
    this.trailContainer.destroy();
  }
}
