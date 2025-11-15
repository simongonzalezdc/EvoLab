// Entity manager for handling all game entities

import { Cell } from './Cell';
import { Resource } from './Resource';
import { PixiApp } from '../rendering/PixiApp';
import { Config } from '../core/Config';
import type { Traits } from '../types/entities';

export class EntityManager {
  private cells: Map<string, Cell> = new Map();
  private resources: Map<string, Resource> = new Map();
  private renderer: PixiApp;
  public playerCell: Cell | null = null;
  public glucoseCollected = 0;

  constructor(renderer: PixiApp) {
    this.renderer = renderer;
  }

  // Create player cell
  createPlayerCell(): Cell {
    const traits: Traits = {
      atp: Config.START_ATP,
      maxATP: Config.MAX_ATP,
      metabolismRate: 1.0,
      energyEfficiency: 1.0,
      size: 5,
      speed: Config.MOVE_SPEED,
      maxSpeed: Config.MAX_VELOCITY,
      health: 100,
      maxHealth: 100,
      color: Config.PLAYER_COLOR,
    };

    const sprite = this.renderer.createCircle(
      Config.PLAYER_START_X,
      Config.PLAYER_START_Y,
      Config.PLAYER_RADIUS,
      Config.PLAYER_COLOR
    );

    this.renderer.addToWorld(sprite);

    const cell = new Cell(
      'player',
      Config.PLAYER_START_X,
      Config.PLAYER_START_Y,
      traits,
      sprite,
      true
    );

    this.cells.set(cell.id, cell);
    this.playerCell = cell;

    return cell;
  }

  // Spawn resources (glucose)
  spawnResources(): void {
    const halfWidth = Config.LAKE_WIDTH / 2;
    const halfHeight = Config.LAKE_HEIGHT / 2;

    for (let i = 0; i < Config.GLUCOSE_COUNT; i++) {
      const x = Math.random() * Config.LAKE_WIDTH - halfWidth;
      const y = Math.random() * Config.LAKE_HEIGHT - halfHeight;

      const sprite = this.renderer.createCircle(x, y, Config.GLUCOSE_RADIUS, Config.GLUCOSE_COLOR);
      this.renderer.addToWorld(sprite);

      const resource = new Resource(`glucose-${i}`, x, y, 'glucose', sprite);
      this.resources.set(resource.id, resource);
    }

    console.log(`Spawned ${Config.GLUCOSE_COUNT} glucose particles`);
  }

  // Update all entities
  update(deltaTime: number): void {
    // Update cells
    this.cells.forEach(cell => {
      cell.update(deltaTime);
    });

    // Update resources
    this.resources.forEach(resource => {
      resource.update(deltaTime, Config.GLUCOSE_RESPAWN_TIME);
    });

    // Check for resource collection
    if (this.playerCell) {
      this.checkResourceCollection(this.playerCell);
    }
  }

  // Check if player is close enough to collect resources
  private checkResourceCollection(player: Cell): void {
    this.resources.forEach(resource => {
      if (!resource.isCollected) {
        const distance = player.distanceTo(resource.position);

        if (distance < Config.RESOURCE_COLLECTION_RANGE) {
          // Collect resource
          resource.collect();

          if (resource.type === 'glucose') {
            player.restoreATP(Config.ATP_FROM_GLUCOSE);
            this.glucoseCollected++;
            console.log(
              `Collected glucose! ATP: ${player.traits.atp.toFixed(1)}/${player.traits.maxATP}`
            );
          }
        }
      }
    });
  }

  // Get all cells
  getCells(): Cell[] {
    return Array.from(this.cells.values());
  }

  // Get all resources
  getResources(): Resource[] {
    return Array.from(this.resources.values());
  }

  dispose(): void {
    this.cells.forEach(cell => cell.dispose());
    this.resources.forEach(resource => resource.dispose());
    this.cells.clear();
    this.resources.clear();
  }
}
