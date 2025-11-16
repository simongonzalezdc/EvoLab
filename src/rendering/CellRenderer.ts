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
    graphic.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphic.lineTo(points[i].x, points[i].y);
    }
    graphic.fill(color);

    // Add outline
    graphic.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphic.lineTo(points[i].x, points[i].y);
    }
    graphic.stroke({ width: 2, color: 0xffffff, alpha: 0.4 });
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
    graphic.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphic.lineTo(points[i].x, points[i].y);
    }
    graphic.fill(color);

    // Add sharp outline
    graphic.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphic.lineTo(points[i].x, points[i].y);
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
    graphic.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphic.lineTo(points[i].x, points[i].y);
    }
    graphic.fill(color);

    // Add outline
    graphic.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphic.lineTo(points[i].x, points[i].y);
    }
    graphic.stroke({ width: 2, color: 0xffffff, alpha: 0.5 });
  }

  private drawPlayerShape(
    graphic: Graphics,
    radius: number,
    color: number,
    traits: Traits
  ): void {
    // Enhanced circle with trait-based variations
    // Base circle
    graphic.circle(0, 0, radius);
    graphic.fill(color);

    // Outline color based on speed
    const outlineColor = traits.speed > 7 ? 0x00ffff : 0xffffff;
    const outlineWidth = 1 + traits.armor * 0.3; // Thicker outline for armored cells

    graphic.circle(0, 0, radius);
    graphic.stroke({ width: outlineWidth, color: outlineColor, alpha: 0.5 });
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
