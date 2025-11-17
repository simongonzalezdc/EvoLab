// Random Events System for EvoLab
// Adds unpredictable events like asteroids, diseases, algae blooms, etc.

import type { BiomeGenerator } from '../environment/BiomeGenerator';
import type { Cell } from '../entities/Cell';
import type { Resource } from '../entities/Resource';

export enum EventType {
  ASTEROID_STRIKE = 'asteroid_strike',
  DISEASE_OUTBREAK = 'disease_outbreak',
  ALGAE_BLOOM = 'algae_bloom',
  DROUGHT = 'drought',
  HEAT_WAVE = 'heat_wave',
  COLD_SNAP = 'cold_snap',
  MUTATION_SURGE = 'mutation_surge',
  PREDATOR_INVASION = 'predator_invasion',
  VOLCANIC_ERUPTION = 'volcanic_eruption',
  METEOR_SHOWER = 'meteor_shower',
  // Week 4 new events
  GENETIC_WINDFALL = 'genetic_windfall',
  ABUNDANCE = 'abundance',
  PREDATOR_FRENZY = 'predator_frenzy',
  GROWTH_SPURT = 'growth_spurt',
  PLAGUE = 'plague',
  CLARITY = 'clarity',
}

export interface GameEvent {
  type: EventType;
  name: string;
  description: string;
  duration: number; // seconds
  severity: number; // 0-1
  effects: EventEffect[];
}

export interface EventEffect {
  type: 'damage' | 'heal' | 'resource_spawn' | 'resource_drain' | 'stat_boost' | 'stat_debuff' | 'temperature_change' | 'oxygen_change';
  target: 'all' | 'player' | 'ai' | 'herbivore' | 'carnivore' | 'omnivore';
  value: number;
  stat?: string; // For stat_boost/debuff
}

export interface ActiveEvent {
  event: GameEvent;
  timeRemaining: number;
  active: boolean;
}

export class EventManager {
  private activeEvents: ActiveEvent[] = [];
  private eventCooldown: number = 0;
  private minEventInterval: number = 50; // Minimum 50 seconds between events
  private maxEventInterval: number = 200; // Maximum 200 seconds between events
  private nextEventTime: number;
  private biomeGenerator?: BiomeGenerator;
  private onEventTrigger?: (event: GameEvent) => void;
  private eventsEnabled: boolean = true;

  constructor() {
    this.nextEventTime = this.getRandomEventInterval();
  }

  setBiomeGenerator(generator: BiomeGenerator): void {
    this.biomeGenerator = generator;
  }

  setEventCallback(callback: (event: GameEvent) => void): void {
    this.onEventTrigger = callback;
  }

  setEventsEnabled(enabled: boolean): void {
    this.eventsEnabled = enabled;
  }

  getEventsEnabled(): boolean {
    return this.eventsEnabled;
  }

  private getRandomEventInterval(): number {
    return this.minEventInterval + Math.random() * (this.maxEventInterval - this.minEventInterval);
  }

  update(deltaTime: number, allCells: Cell[], resources: Resource[]): void {
    if (!this.eventsEnabled) return;

    // Update active events
    for (let i = this.activeEvents.length - 1; i >= 0; i--) {
      const activeEvent = this.activeEvents[i];
      if (activeEvent) {
        activeEvent.timeRemaining -= deltaTime;

        if (activeEvent.timeRemaining <= 0) {
          // Event finished
          this.activeEvents.splice(i, 1);
        }
      }
    }

    // Check for new event
    this.eventCooldown += deltaTime;
    if (this.eventCooldown >= this.nextEventTime) {
      this.triggerRandomEvent(allCells, resources);
      this.eventCooldown = 0;
      this.nextEventTime = this.getRandomEventInterval();
    }
  }

  private triggerRandomEvent(allCells: Cell[], resources: Resource[]): void {
    const eventTypes = Object.values(EventType);
    const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    if (!randomType) return;
    const event = this.createEvent(randomType);

    this.activeEvents.push({
      event,
      timeRemaining: event.duration,
      active: true,
    });

    // Notify UI
    if (this.onEventTrigger) {
      this.onEventTrigger(event);
    }

    // Apply immediate effects
    this.applyEventEffects(event, allCells, resources);
  }

  private createEvent(type: EventType): GameEvent {
    switch (type) {
      case EventType.ASTEROID_STRIKE:
        return {
          type,
          name: '☄️ Asteroid Strike!',
          description: 'A small asteroid impacts the lake, causing widespread damage but also releasing nutrients.',
          duration: 10,
          severity: 0.7,
          effects: [
            { type: 'damage', target: 'all', value: 20 },
            { type: 'resource_spawn', target: 'all', value: 10 },
          ],
        };

      case EventType.DISEASE_OUTBREAK:
        return {
          type,
          name: '🦠 Disease Outbreak!',
          description: 'A contagious disease spreads through the population, affecting larger organisms more severely.',
          duration: 30,
          severity: 0.6,
          effects: [
            { type: 'damage', target: 'all', value: 0.5 }, // DoT effect
            { type: 'stat_debuff', target: 'all', value: -2, stat: 'speed' },
          ],
        };

      case EventType.ALGAE_BLOOM:
        return {
          type,
          name: '🌿 Algae Bloom!',
          description: 'Massive algae growth produces abundant food but depletes oxygen levels.',
          duration: 40,
          severity: 0.4,
          effects: [
            { type: 'resource_spawn', target: 'all', value: 20 },
            { type: 'oxygen_change', target: 'all', value: -15 },
          ],
        };

      case EventType.DROUGHT:
        return {
          type,
          name: '🏜️ Drought!',
          description: 'Water levels drop, concentrating organisms and increasing competition for space.',
          duration: 60,
          severity: 0.5,
          effects: [
            { type: 'resource_drain', target: 'all', value: 5 },
            { type: 'stat_debuff', target: 'all', value: -1, stat: 'maxATP' },
          ],
        };

      case EventType.HEAT_WAVE:
        return {
          type,
          name: '🌡️ Heat Wave!',
          description: 'Extreme temperatures increase metabolism and ATP consumption.',
          duration: 45,
          severity: 0.5,
          effects: [
            { type: 'temperature_change', target: 'all', value: 10 },
            { type: 'stat_debuff', target: 'all', value: 0.2, stat: 'metabolismRate' },
          ],
        };

      case EventType.COLD_SNAP:
        return {
          type,
          name: '❄️ Cold Snap!',
          description: 'Sudden temperature drop slows movement but reduces ATP drain.',
          duration: 50,
          severity: 0.4,
          effects: [
            { type: 'temperature_change', target: 'all', value: -10 },
            { type: 'stat_debuff', target: 'all', value: -2, stat: 'speed' },
            { type: 'stat_boost', target: 'all', value: -0.1, stat: 'metabolismRate' },
          ],
        };

      case EventType.MUTATION_SURGE:
        return {
          type,
          name: '🧬 Mutation Surge!',
          description: 'Cosmic radiation increases mutation rates, causing rapid evolution.',
          duration: 20,
          severity: 0.6,
          effects: [
            { type: 'stat_boost', target: 'all', value: 5, stat: 'dnaPoints' },
          ],
        };

      case EventType.PREDATOR_INVASION:
        return {
          type,
          name: '🦈 Predator Invasion!',
          description: 'A swarm of aggressive predators enters the area, threatening all life.',
          duration: 35,
          severity: 0.8,
          effects: [
            { type: 'damage', target: 'herbivore', value: 15 },
            { type: 'damage', target: 'player', value: 10 },
          ],
        };

      case EventType.VOLCANIC_ERUPTION:
        return {
          type,
          name: '🌋 Volcanic Eruption!',
          description: 'Underwater volcanic activity raises temperatures and adds toxins but also minerals.',
          duration: 55,
          severity: 0.7,
          effects: [
            { type: 'temperature_change', target: 'all', value: 15 },
            { type: 'damage', target: 'all', value: 10 },
            { type: 'resource_spawn', target: 'all', value: 15 },
          ],
        };

      case EventType.METEOR_SHOWER:
        return {
          type,
          name: '💫 Meteor Shower!',
          description: 'Multiple small meteors rain down, creating chaos and opportunity.',
          duration: 15,
          severity: 0.6,
          effects: [
            { type: 'damage', target: 'all', value: 8 },
            { type: 'resource_spawn', target: 'all', value: 12 },
          ],
        };

      case EventType.GENETIC_WINDFALL:
        return {
          type,
          name: '🧬 Genetic Windfall!',
          description: 'A surge of beneficial mutations grants everyone extra DNA points.',
          duration: 5,
          severity: 0.2,
          effects: [
            { type: 'stat_boost', target: 'all', value: 10, stat: 'dnaPoints' },
          ],
        };

      case EventType.ABUNDANCE:
        return {
          type,
          name: '🌸 Abundance!',
          description: 'The lake blooms with life - resources are plentiful and organisms thrive.',
          duration: 60,
          severity: 0.1,
          effects: [
            { type: 'resource_spawn', target: 'all', value: 30 },
            { type: 'heal', target: 'all', value: 10 },
            { type: 'stat_boost', target: 'all', value: 10, stat: 'maxATP' },
          ],
        };

      case EventType.PREDATOR_FRENZY:
        return {
          type,
          name: '🩸 Predator Frenzy!',
          description: 'Carnivores enter a feeding frenzy, becoming more aggressive and dangerous.',
          duration: 45,
          severity: 0.8,
          effects: [
            { type: 'stat_boost', target: 'carnivore', value: 3, stat: 'speed' },
            { type: 'stat_boost', target: 'carnivore', value: 2, stat: 'aggression' },
            { type: 'damage', target: 'herbivore', value: 20 },
          ],
        };

      case EventType.GROWTH_SPURT:
        return {
          type,
          name: '📈 Growth Spurt!',
          description: 'All organisms experience rapid growth and increased vitality.',
          duration: 30,
          severity: 0.3,
          effects: [
            { type: 'stat_boost', target: 'all', value: 1, stat: 'size' },
            { type: 'stat_boost', target: 'all', value: 15, stat: 'maxHealth' },
            { type: 'heal', target: 'all', value: 20 },
          ],
        };

      case EventType.PLAGUE:
        return {
          type,
          name: '☠️ Plague!',
          description: 'A deadly plague sweeps through the lake, weakening all life forms.',
          duration: 50,
          severity: 0.9,
          effects: [
            { type: 'damage', target: 'all', value: 1 }, // DoT effect
            { type: 'stat_debuff', target: 'all', value: -2, stat: 'maxHealth' },
            { type: 'stat_debuff', target: 'all', value: -1, stat: 'speed' },
            { type: 'stat_debuff', target: 'all', value: -1, stat: 'armor' },
          ],
        };

      case EventType.CLARITY:
        return {
          type,
          name: '✨ Clarity!',
          description: 'The water becomes crystal clear, enhancing vision and awareness for all.',
          duration: 40,
          severity: 0.2,
          effects: [
            { type: 'stat_boost', target: 'all', value: 200, stat: 'visionRange' },
            { type: 'stat_boost', target: 'all', value: 5, stat: 'dnaPoints' },
          ],
        };

      default:
        return this.createEvent(EventType.ALGAE_BLOOM);
    }
  }

  private applyEventEffects(event: GameEvent, allCells: Cell[], resources: Resource[]): void {
    for (const effect of event.effects) {
      switch (effect.type) {
        case 'damage':
          this.applyDamageEffect(effect, allCells);
          break;
        case 'heal':
          this.applyHealEffect(effect, allCells);
          break;
        case 'stat_boost':
        case 'stat_debuff':
          this.applyStatEffect(effect, allCells);
          break;
        case 'resource_spawn':
          // Resource spawning would be handled by EntityManager
          // Just note the effect for now
          break;
        case 'resource_drain':
          // Resource draining would be handled by EntityManager
          break;
        case 'temperature_change':
        case 'oxygen_change':
          // These affect biomes and would be handled by BiomeGenerator
          break;
      }
    }
  }

  private applyDamageEffect(effect: EventEffect, allCells: Cell[]): void {
    const targetCells = this.filterCellsByTarget(effect.target, allCells);
    for (const cell of targetCells) {
      cell.traits.health = Math.max(0, cell.traits.health - effect.value);
    }
  }

  private applyHealEffect(effect: EventEffect, allCells: Cell[]): void {
    const targetCells = this.filterCellsByTarget(effect.target, allCells);
    for (const cell of targetCells) {
      cell.traits.health = Math.min(cell.traits.maxHealth, cell.traits.health + effect.value);
    }
  }

  private applyStatEffect(effect: EventEffect, allCells: Cell[]): void {
    if (!effect.stat) return;

    const targetCells = this.filterCellsByTarget(effect.target, allCells);
    for (const cell of targetCells) {
      const stat = effect.stat as keyof typeof cell.traits;
      if (typeof cell.traits[stat] === 'number') {
        const currentValue = cell.traits[stat] as number;
        (cell.traits[stat] as number) = Math.max(0, currentValue + effect.value);
      }
    }
  }

  private filterCellsByTarget(target: string, allCells: Cell[]): Cell[] {
    switch (target) {
      case 'all':
        return allCells;
      case 'player':
        return allCells.filter(c => c.isPlayer);
      case 'ai':
        return allCells.filter(c => !c.isPlayer);
      case 'herbivore':
        return allCells.filter(c => !c.isPlayer && c.traits.aggression < 4);
      case 'carnivore':
        return allCells.filter(c => !c.isPlayer && c.traits.aggression > 7);
      case 'omnivore':
        return allCells.filter(c => !c.isPlayer && c.traits.aggression >= 4 && c.traits.aggression <= 7);
      default:
        return [];
    }
  }

  getActiveEvents(): ActiveEvent[] {
    return [...this.activeEvents];
  }

  clearEvents(): void {
    this.activeEvents = [];
  }

  triggerSpecificEvent(type: EventType, allCells: Cell[], resources: Resource[]): void {
    const event = this.createEvent(type);
    this.activeEvents.push({
      event,
      timeRemaining: event.duration,
      active: true,
    });

    if (this.onEventTrigger) {
      this.onEventTrigger(event);
    }

    this.applyEventEffects(event, allCells, resources);
  }
}
