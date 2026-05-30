// Sound effects manager using Tone.js
import * as Tone from 'tone';
import { Config } from '../core/Config';

export type SoundEffect =
  | 'collect'          // Resource collection
  | 'combo'            // Combo achievement
  | 'levelup'          // Evolution/level up
  | 'danger'           // Predator nearby
  | 'damage'           // Compatibility alias for damage/threat feedback
  | 'death'            // Cell death
  | 'pickup'           // Compatibility alias for resource pickup feedback
  | 'victory'          // Achievement unlocked
  | 'transition'       // Biome transition
  | 'warning';         // Low ATP warning

export class SoundManager {
  private isEnabled: boolean = true;
  private volume: number = 0.5;
  private synth: Tone.PolySynth;
  private noiseSynth: Tone.NoiseSynth;
  private metalSynth: Tone.MetalSynth;
  private membraneSynth: Tone.MembraneSynth;

  constructor() {
    // Create different synths for variety
    this.synth = new Tone.PolySynth(Tone.Synth, {
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 0.5,
      },
      volume: -10,
    }).toDestination();

    this.noiseSynth = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0,
      },
      volume: -20,
    }).toDestination();

    this.metalSynth = new Tone.MetalSynth({
      envelope: {
        attack: 0.001,
        decay: 0.1,
        release: 0.2,
      },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
      volume: -15,
    }).toDestination();

    this.membraneSynth = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 10,
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.4,
        sustain: 0.01,
        release: 1.4,
      },
      volume: -12,
    }).toDestination();
  }

  async initialize(): Promise<void> {
    await Tone.start();
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.synth.volume.value = Tone.gainToDb(this.volume * 0.3);
    this.noiseSynth.volume.value = Tone.gainToDb(this.volume * 0.1);
    this.metalSynth.volume.value = Tone.gainToDb(this.volume * 0.2);
    this.membraneSynth.volume.value = Tone.gainToDb(this.volume * 0.25);
  }

  play(effect: SoundEffect, intensity: number = 1): void {
    if (!this.isEnabled) return;

    const now = Tone.now();

    switch (effect) {
      case 'collect':
        // Pleasant "pop" sound for resource collection
        this.synth.triggerAttackRelease(['C5', 'E5'], '16n', now, intensity);
        this.noiseSynth.triggerAttackRelease('32n', now);
        break;

      case 'combo': {
        // Escalating sound for combos
        const comboNotes = ['C5', 'E5', 'G5', 'C6'];
        comboNotes.forEach((note, i) => {
          this.synth.triggerAttackRelease(note, '16n', now + i * 0.05, intensity * 1.2);
        });
        this.metalSynth.triggerAttackRelease('8n', now);
        break;
      }

      case 'levelup': {
        // Triumphant fanfare for evolution
        const fanfareNotes = ['C4', 'E4', 'G4', 'C5', 'E5'];
        fanfareNotes.forEach((note, i) => {
          this.synth.triggerAttackRelease(note, '8n', now + i * 0.1, intensity);
        });
        this.membraneSynth.triggerAttackRelease('C2', '4n', now);
        break;
      }

      case 'danger':
        // Low growl/rumble for danger
        this.synth.triggerAttackRelease(['C2', 'F2'], '4n', now, intensity * 0.8);
        this.noiseSynth.triggerAttackRelease('8n', now);
        break;

      case 'damage':
        this.play('danger', intensity);
        break;

      case 'pickup':
        this.play('collect', intensity);
        break;

      case 'death': {
        // Descending sound for death
        const deathNotes = ['E4', 'D4', 'C4', 'B3', 'A3'];
        deathNotes.forEach((note, i) => {
          this.synth.triggerAttackRelease(note, '8n', now + i * 0.08, intensity * 0.6);
        });
        break;
      }

      case 'victory': {
        // Achievement unlocked sound
        const victoryNotes = ['C5', 'E5', 'G5', 'E5', 'C6'];
        victoryNotes.forEach((note, i) => {
          this.synth.triggerAttackRelease(note, '8n', now + i * 0.06, intensity);
        });
        this.metalSynth.triggerAttackRelease('4n', now + 0.2);
        break;
      }

      case 'transition':
        // Ethereal shimmer for biome transitions
        this.synth.triggerAttackRelease(['G4', 'B4', 'D5'], '4n', now, intensity * 0.5);
        this.metalSynth.triggerAttackRelease('8n', now + 0.1);
        break;

      case 'warning':
        // Pulsing warning beep
        this.synth.triggerAttackRelease('A3', '32n', now, intensity * 0.7);
        this.synth.triggerAttackRelease('A3', '32n', now + 0.15, intensity * 0.7);
        break;
    }
  }

  // Play combo sound with escalating intensity based on combo size
  playCombo(comboSize: number): void {
    const intensity = Math.min(1, 0.5 + (comboSize * 0.1));
    this.play('combo', intensity);
  }

  // Play danger sound with intensity based on threat proximity
  playDanger(threatLevel: number): void {
    const intensity = Math.min(1, threatLevel);
    this.play('danger', intensity);
  }

  dispose(): void {
    this.synth.dispose();
    this.noiseSynth.dispose();
    this.metalSynth.dispose();
    this.membraneSynth.dispose();
  }
}
