/**
 * CameraController - Manages camera positioning and following logic
 * Extracted from GameLoop to improve modularity
 */

import type { PixiApp } from '../rendering/PixiApp';
import type { EntityManager } from '../entities/EntityManager';

export class CameraController {
  private renderer: PixiApp;
  private entityManager: EntityManager;
  private currentZoom = 1.0;

  constructor(renderer: PixiApp, entityManager: EntityManager) {
    this.renderer = renderer;
    this.entityManager = entityManager;
  }

  /**
   * Update camera to follow the player or species center
   * Handles both single-cell and species-level modes
   */
  update(): void {
    // Species-level camera (follows species center)
    if (this.entityManager.playerSpecies) {
      const species = this.entityManager.playerSpecies;
      const speciesCenter = species.getCenterPosition();

      // Only update camera if we have valid coordinates and cells exist
      if (
        speciesCenter &&
        !isNaN(speciesCenter.x) &&
        !isNaN(speciesCenter.y) &&
        speciesCenter.x !== 0 &&
        speciesCenter.y !== 0
      ) {
        // Update camera to species center
        this.renderer.updateCamera(speciesCenter.x, speciesCenter.y);
      }
      return;
    }

    // Single-cell camera (follows individual cell)
    const player = this.entityManager.playerCell;
    if (player) {
      this.renderer.updateCamera(player.position.x, player.position.y);
    }
  }

  /**
   * Initialize camera position
   * Called when starting or resetting the game
   */
  initialize(): void {
    if (this.entityManager.playerSpecies) {
      const speciesCenter = this.entityManager.playerSpecies.getCenterPosition();
      this.renderer.updateCamera(speciesCenter.x, speciesCenter.y);
    } else if (this.entityManager.playerCell) {
      const player = this.entityManager.playerCell;
      this.renderer.updateCamera(player.position.x, player.position.y);
    }
  }

  /**
   * Get current zoom level
   */
  getZoom(): number {
    return this.currentZoom;
  }

  /**
   * Zoom in
   */
  zoomIn(): void {
    this.currentZoom = Math.min(3.0, this.currentZoom + 0.1);
    this.renderer.setZoom(this.currentZoom);
  }

  /**
   * Zoom out
   */
  zoomOut(): void {
    this.currentZoom = Math.max(0.3, this.currentZoom - 0.1);
    this.renderer.setZoom(this.currentZoom);
  }

  /**
   * Reset zoom to default
   */
  resetZoom(): void {
    this.currentZoom = 1.0;
    this.renderer.setZoom(this.currentZoom);
  }

  /**
   * Set zoom level directly
   */
  setZoom(zoom: number): void {
    this.currentZoom = Math.max(0.3, Math.min(3.0, zoom));
    this.renderer.setZoom(this.currentZoom);
  }
}
