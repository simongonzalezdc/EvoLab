// Entity manager for handling all game entities

import { Cell } from './Cell';
import { Resource } from './Resource';
import { PixiApp } from '../rendering/PixiApp';
import { Config } from '../core/Config';
import { Genome } from '../genetics/Genome';
import { ReproductionSystem } from '../genetics/ReproductionSystem';
import { TraitSystem } from '../genetics/TraitSystem';

export class EntityManager {
  private cells: Map<string, Cell> = new Map();
  private resources: Map<string, Resource> = new Map();
  private renderer: PixiApp;
  public playerCell: Cell | null = null;
  public glucoseCollected = 0;
  public reproductionSystem: ReproductionSystem;

  constructor(renderer: PixiApp) {
    this.renderer = renderer;
    this.reproductionSystem = new ReproductionSystem();
  }

  // Create player cell from genome
  createPlayerCell(genome?: Genome): Cell {
    const playerGenome = genome || Genome.createDefault();

    const sprite = this.renderer.createCircle(
      Config.PLAYER_START_X,
      Config.PLAYER_START_Y,
      Config.PLAYER_RADIUS,
      playerGenome.traits.color
    );

    this.renderer.addToWorld(sprite);

    const cell = new Cell(
      'player',
      Config.PLAYER_START_X,
      Config.PLAYER_START_Y,
      playerGenome,
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
            player.collectCompound('glucose', 5);
            this.glucoseCollected++;
          } else if (resource.type === 'aminoAcid') {
            player.collectCompound('aminoAcid', 3);
          } else if (resource.type === 'phosphate') {
            player.collectCompound('phosphate', 2);
          }
        }
      }
    });
  }

  // Handle player reproduction
  reproducePlayer(modifications: Partial<typeof this.playerCell.traits> = {}): Cell | null {
    if (!this.playerCell) return null;

    // Calculate DNA points earned
    const dnaPoints = TraitSystem.calculateDNAPoints(
      this.playerCell.survivalTime,
      this.glucoseCollected
    );
    this.playerCell.genome.dnaPoints += dnaPoints;

    // Perform reproduction
    const offspringGenome = this.reproductionSystem.reproduce(
      this.playerCell.genome,
      modifications
    );

    // Remove old player cell
    this.renderer.removeFromWorld(this.playerCell.sprite);
    this.cells.delete('player');

    // Create new player cell with offspring genome
    const newCell = this.createPlayerCell(offspringGenome);

    // Mark reproduction
    newCell.markReproduction();

    // Reset glucose counter
    this.glucoseCollected = 0;

    return newCell;
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
