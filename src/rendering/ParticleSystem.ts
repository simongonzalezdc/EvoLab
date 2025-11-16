// Particle system for visual effects

import { Graphics, Container } from 'pixi.js';

export interface Particle {
  graphic: Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  fadeOut: boolean;
  shrink: boolean;
  gravity?: number;
}

export class ParticleSystem {
  private container: Container;
  private particles: Particle[] = [];

  constructor(container: Container) {
    this.container = container;
  }

  // Update all particles
  update(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      if (!particle) continue;

      // Update position
      particle.graphic.x += particle.vx * deltaTime;
      particle.graphic.y += particle.vy * deltaTime;

      // Apply gravity if specified
      if (particle.gravity) {
        particle.vy += particle.gravity * deltaTime;
      }

      // Update lifetime
      particle.life -= deltaTime;

      // Update visual effects
      if (particle.fadeOut) {
        const lifeFraction = particle.life / particle.maxLife;
        particle.graphic.alpha = lifeFraction;
      }

      if (particle.shrink) {
        const lifeFraction = particle.life / particle.maxLife;
        particle.graphic.scale.set(lifeFraction);
      }

      // Remove dead particles
      if (particle.life <= 0) {
        this.container.removeChild(particle.graphic);
        particle.graphic.destroy();
        this.particles.splice(i, 1);
      }
    }
  }

  // Create death burst effect
  createDeathBurst(x: number, y: number, color: number, count: number = 12): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 50 + Math.random() * 100;

      const graphic = new Graphics();
      graphic.circle(0, 0, 3 + Math.random() * 3);
      graphic.fill(color);
      graphic.x = x;
      graphic.y = y;

      this.container.addChild(graphic);

      this.particles.push({
        graphic,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 1,
        fadeOut: true,
        shrink: true,
      });
    }
  }

  // Create eating effect (sparkles)
  createEatingEffect(x: number, y: number, color: number): void {
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 40;

      const graphic = new Graphics();
      graphic.circle(0, 0, 2 + Math.random() * 2);
      graphic.fill(color);
      graphic.x = x;
      graphic.y = y;

      this.container.addChild(graphic);

      this.particles.push({
        graphic,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.3 + Math.random() * 0.3,
        maxLife: 0.6,
        fadeOut: true,
        shrink: false,
      });
    }
  }

  // Create attack effect (impact particles)
  createAttackEffect(x: number, y: number, angle: number, color: number): void {
    for (let i = 0; i < 8; i++) {
      const spread = 0.5;
      const particleAngle = angle + (Math.random() - 0.5) * spread;
      const speed = 80 + Math.random() * 80;

      const graphic = new Graphics();
      graphic.circle(0, 0, 2 + Math.random() * 3);
      graphic.fill(color);
      graphic.x = x;
      graphic.y = y;

      this.container.addChild(graphic);

      this.particles.push({
        graphic,
        vx: Math.cos(particleAngle) * speed,
        vy: Math.sin(particleAngle) * speed,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        fadeOut: true,
        shrink: true,
      });
    }
  }

  // Create reproduction glow effect (hearts/sparkles)
  createReproductionEffect(x: number, y: number, color: number): void {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 15 + Math.random() * 25;

      const graphic = new Graphics();
      // Create a small heart-like shape or star
      graphic.circle(0, 0, 3);
      graphic.fill(color);
      graphic.x = x;
      graphic.y = y;

      this.container.addChild(graphic);

      this.particles.push({
        graphic,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20, // Float upward
        life: 1.0 + Math.random() * 0.5,
        maxLife: 1.5,
        fadeOut: true,
        shrink: false,
        gravity: -10, // Negative gravity for floating effect
      });
    }
  }

  // Create environmental particles (continuous effect)
  createEnvironmentalParticle(
    x: number,
    y: number,
    vx: number,
    vy: number,
    color: number,
    size: number,
    life: number
  ): void {
    const graphic = new Graphics();
    graphic.circle(0, 0, size);
    graphic.fill(color);
    graphic.x = x;
    graphic.y = y;
    graphic.alpha = 0.6;

    this.container.addChild(graphic);

    this.particles.push({
      graphic,
      vx,
      vy,
      life,
      maxLife: life,
      fadeOut: true,
      shrink: false,
    });
  }

  // Create spawn effect (expanding ring)
  createSpawnEffect(x: number, y: number, color: number): void {
    const graphic = new Graphics();
    graphic.circle(0, 0, 5);
    graphic.stroke({ width: 2, color: color, alpha: 0.8 });
    graphic.x = x;
    graphic.y = y;

    this.container.addChild(graphic);

    // Create expanding ring effect manually
    const expandSpeed = 100;
    const life = 0.5;
    let currentRadius = 5;

    const expandInterval = setInterval(() => {
      currentRadius += expandSpeed * 0.016; // Approximate deltaTime
      graphic.clear();
      graphic.circle(0, 0, currentRadius);
      graphic.stroke({ width: 2, color: color, alpha: graphic.alpha });
    }, 16);

    this.particles.push({
      graphic,
      vx: 0,
      vy: 0,
      life,
      maxLife: life,
      fadeOut: true,
      shrink: false,
    });

    setTimeout(() => clearInterval(expandInterval), life * 1000);
  }

  // Create combo effect (burst of colorful particles with scaling text)
  createComboEffect(x: number, y: number, comboSize: number): void {
    // Create burst of golden particles for combo
    const particleCount = 15 + comboSize * 2;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 60 + Math.random() * 80;

      const graphic = new Graphics();
      graphic.star(0, 0, 5, 4 + Math.random() * 3, 2);
      graphic.fill(0xffd700); // Golden color for combo
      graphic.x = x;
      graphic.y = y;

      this.container.addChild(graphic);

      this.particles.push({
        graphic,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30, // Slight upward bias
        life: 0.8 + Math.random() * 0.4,
        maxLife: 1.2,
        fadeOut: true,
        shrink: true,
        gravity: 20, // Gravity pulls particles down
      });
    }

    // Add some extra sparkle particles
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 50;

      const graphic = new Graphics();
      graphic.circle(0, 0, 3 + Math.random() * 2);
      graphic.fill(0xffff00); // Bright yellow sparkles
      graphic.x = x;
      graphic.y = y;

      this.container.addChild(graphic);

      this.particles.push({
        graphic,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50, // Float upward
        life: 1.0 + Math.random() * 0.5,
        maxLife: 1.5,
        fadeOut: true,
        shrink: false,
        gravity: -15, // Negative gravity for floating effect
      });
    }
  }

  // Clear all particles
  clear(): void {
    for (const particle of this.particles) {
      this.container.removeChild(particle.graphic);
      particle.graphic.destroy();
    }
    this.particles = [];
  }

  dispose(): void {
    this.clear();
  }
}
