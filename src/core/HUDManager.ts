/**
 * HUDManager - Manages all HUD (Heads-Up Display) updates
 * Extracted from GameLoop to improve modularity
 */

import type { EntityManager } from '../entities/EntityManager';
import type { DayNightCycle } from '../environment/DayNightCycle';
import type { UIController } from '../ui/UIController';
import type { Traits } from '../types/entities';
import { Config } from './Config';

export class HUDManager {
  private entityManager: EntityManager;
  private dayNightCycle: DayNightCycle;
  private uiController: UIController;
  private onReproduction: (() => void) | null = null;

  constructor(
    entityManager: EntityManager,
    dayNightCycle: DayNightCycle,
    uiController: UIController
  ) {
    this.entityManager = entityManager;
    this.dayNightCycle = dayNightCycle;
    this.uiController = uiController;
  }

  setReproductionCallback(callback: () => void): void {
    this.onReproduction = callback;
  }

  private setHudLabel(id: string, text: string): void {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    }
  }

  private setHudValue(id: string, value: string | number): void {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = typeof value === 'number' ? `${value}` : value;
    }
  }

  private setHudBarRatio(id: string, ratio: number): void {
    const bar = document.getElementById(id) as HTMLElement | null;
    if (bar) {
      const clamped = Math.max(0, Math.min(1, ratio));
      bar.style.width = `${clamped * 100}%`;
    }
  }

  /**
   * Update all HUD elements based on current game state
   * Supports both species-level and single-cell display modes
   */
  update(): void {
    // Species-level HUD (multi-cell mode)
    if (this.entityManager.playerSpecies) {
      this.updateSpeciesHUD();
      return;
    }

    // Legacy single-cell HUD
    this.updateSingleCellHUD();
  }

  private updateSpeciesHUD(): void {
    const species = this.entityManager.playerSpecies;
    if (!species) return;

    const stats = species.getStats();
    const avgTraits = stats.averageTraits as Traits;
    const averageAtp = avgTraits.atp ?? 0;
    const maxAtp = avgTraits.maxATP ?? Config.MAX_ATP;
    const averageHealth = avgTraits.health ?? 0;
    const maxHealth = avgTraits.maxHealth ?? 100;

    // Update averaged ATP/health bars and labels
    this.setHudLabel('atp-label', 'Avg ATP (Species):');
    this.setHudValue('atp-value', Math.round(averageAtp));
    this.setHudBarRatio('atp-bar', maxAtp > 0 ? averageAtp / maxAtp : 0);

    this.setHudLabel('health-label', 'Avg Health (Species):');
    this.setHudValue('health-value', Math.round(averageHealth));
    this.setHudBarRatio('health-bar', maxHealth > 0 ? averageHealth / maxHealth : 0);

    // Repurpose resource stats for species-wide metrics
    this.setHudLabel('glucose-label', 'Population:');
    this.setHudValue('glucose-value', stats.population);

    this.setHudLabel('aminoacid-label', 'Avg Survival (s):');
    this.setHudValue('aminoacid-value', Math.round(stats.averageSurvivalTime || 0));

    this.setHudLabel('phosphate-label', 'Diversity Index:');
    this.setHudValue('phosphate-value', stats.diversity ? stats.diversity.toFixed(1) : '0.0');

    // Update Generation
    const generationValue = document.getElementById('generation-value');
    if (generationValue) {
      generationValue.textContent = stats.generation.toString();
    }

    // Update DNA Points
    const dnaValue = document.getElementById('dna-value');
    if (dnaValue) {
      const baseGenome = species.getBaseGenome();
      dnaValue.textContent = Math.floor(baseGenome.dnaPoints).toString();
      // Update DNA progress bar
      this.uiController.updateDNAProgress(baseGenome.dnaPoints, 50);
    }

    // Evolution button - show when species is ready (based on average survival time)
    const reproduceBtn = document.getElementById('reproduce-btn') as HTMLButtonElement;
    if (reproduceBtn) {
      // Show evolution button periodically (every 30 seconds of average survival)
      const canEvolve = stats.averageSurvivalTime > 30 && stats.population > 0;
      reproduceBtn.style.display = canEvolve ? 'block' : 'none';
      reproduceBtn.textContent = '🧬 Evolve Species';

      // Add click handler if not already added
      if (canEvolve && !reproduceBtn.onclick) {
        reproduceBtn.onclick = () => this.onReproduction?.();
      }
    }
  }

  private updateSingleCellHUD(): void {
    const player = this.entityManager.playerCell;
    if (!player) return;

    this.setHudLabel('atp-label', 'ATP:');
    this.setHudLabel('health-label', 'Health:');
    this.setHudLabel('glucose-label', 'Glucose:');
    this.setHudLabel('aminoacid-label', 'Amino Acids:');
    this.setHudLabel('phosphate-label', 'Phosphates:');

    // Update ATP
    this.setHudValue('atp-value', Math.floor(player.traits.atp));
    this.setHudBarRatio('atp-bar', player.traits.maxATP > 0 ? player.traits.atp / player.traits.maxATP : 0);

    // Update Health
    this.setHudValue('health-value', Math.floor(player.traits.health));
    this.setHudBarRatio('health-bar', player.traits.maxHealth > 0 ? player.traits.health / player.traits.maxHealth : 0);

    // Update Compounds
    this.setHudValue('glucose-value', Math.floor(player.compounds.glucose));
    this.setHudValue('aminoacid-value', Math.floor(player.compounds.aminoAcids));
    this.setHudValue('phosphate-value', Math.floor(player.compounds.phosphates));

    // Update Generation
    const generationValue = document.getElementById('generation-value');
    if (generationValue) {
      generationValue.textContent = player.genome.lineage.generation.toString();
    }

    // Update DNA Points
    const dnaValue = document.getElementById('dna-value');
    if (dnaValue) {
      dnaValue.textContent = Math.floor(player.genome.dnaPoints).toString();
      // Update DNA progress bar
      this.uiController.updateDNAProgress(player.genome.dnaPoints, 50);
    }

    // Update Time of Day
    const timeValue = document.getElementById('time-value');
    if (timeValue) {
      const time = this.dayNightCycle.getTime();
      const hours = Math.floor(time);
      const minutes = Math.floor((time % 1) * 60);
      timeValue.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    // Update Population
    const populationValue = document.getElementById('population-value');
    if (populationValue) {
      const stats = this.entityManager.getPopulationStats();
      const total = Object.values(stats).reduce((a, b) => a + b, 0);
      populationValue.textContent = total.toString();
    }

    // Update Reproduction Button
    const reproduceBtn = document.getElementById('reproduce-btn') as HTMLButtonElement;
    if (reproduceBtn) {
      const canReproduce = player.canReproduce();
      reproduceBtn.style.display = canReproduce ? 'block' : 'none';

      // Add click handler if not already added
      if (canReproduce && !reproduceBtn.onclick) {
        reproduceBtn.onclick = () => this.onReproduction?.();
      }
    }
  }
}
