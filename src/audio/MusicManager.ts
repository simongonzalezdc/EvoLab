// Adaptive Procedural Music System using Tone.js

import * as Tone from 'tone';
import { BiomeType } from '../environment/BiomeGenerator';

export interface MusicState {
  biome: BiomeType;
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  lightLevel: number; // 0-1
  combatIntensity: number; // 0-1
  generation: number;
}

export class MusicManager {
  private isEnabled = false;
  private isInitialized = false;
  private masterVolume: Tone.Volume;

  // Synth layers
  private ambientSynth: Tone.PolySynth;
  private bassDrone: Tone.Synth;
  private melodySynth: Tone.Synth;
  private padSynth: Tone.PolySynth;

  // Effects
  private reverb: Tone.Reverb;
  private filter: Tone.Filter;
  private delay: Tone.FeedbackDelay;

  // Sequencers
  private ambientLoop: Tone.Loop | null = null;
  private melodyLoop: Tone.Loop | null = null;
  private bassLoop: Tone.Loop | null = null;

  // State
  private currentState: MusicState = {
    biome: BiomeType.SHALLOW_WARM,
    timeOfDay: 'day',
    lightLevel: 1.0,
    combatIntensity: 0,
    generation: 1,
  };

  constructor() {
    // Create master volume control
    this.masterVolume = new Tone.Volume(-12).toDestination();

    // Create effects chain
    this.reverb = new Tone.Reverb({
      decay: 4,
      wet: 0.4,
    });

    this.filter = new Tone.Filter({
      frequency: 2000,
      type: 'lowpass',
      rolloff: -24,
    });

    this.delay = new Tone.FeedbackDelay({
      delayTime: '8n',
      feedback: 0.3,
      wet: 0.2,
    });

    // Create synths
    this.ambientSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 2,
        decay: 1,
        sustain: 0.8,
        release: 3,
      },
    });

    this.bassDrone = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.5,
        decay: 0.2,
        sustain: 0.9,
        release: 1,
      },
    });

    this.melodySynth = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.1,
        decay: 0.3,
        sustain: 0.4,
        release: 0.8,
      },
    });

    this.padSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: {
        attack: 3,
        decay: 2,
        sustain: 0.7,
        release: 4,
      },
    });

    // Connect audio graph
    this.setupAudioGraph();
  }

  private setupAudioGraph(): void {
    // Ambient synth -> reverb -> filter -> master
    this.ambientSynth.connect(this.reverb);
    this.reverb.connect(this.filter);
    this.filter.connect(this.masterVolume);

    // Bass drone -> master (dry, deep)
    this.bassDrone.connect(this.masterVolume);

    // Melody -> delay -> reverb -> master
    this.melodySynth.connect(this.delay);
    this.delay.connect(this.reverb);

    // Pad -> reverb -> master
    this.padSynth.connect(this.reverb);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await Tone.start();
      await this.reverb.generate();
      this.isInitialized = true;
      console.log('MusicManager initialized');
    } catch (error) {
      console.error('Failed to initialize MusicManager:', error);
    }
  }

  async enable(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.isEnabled) return;

    this.isEnabled = true;
    await Tone.start();
    this.startMusic();
  }

  disable(): void {
    if (!this.isEnabled) return;

    this.isEnabled = false;
    this.stopMusic();
  }

  setVolume(volume: number): void {
    // volume: 0-1
    const db = Tone.gainToDb(Math.max(0.01, volume));
    this.masterVolume.volume.rampTo(db, 0.5);
  }

  updateState(newState: Partial<MusicState>): void {
    const oldBiome = this.currentState.biome;
    this.currentState = { ...this.currentState, ...newState };

    // If biome changed, restart music with new parameters
    if (newState.biome && newState.biome !== oldBiome) {
      this.restartMusic();
    } else {
      // Otherwise just update parameters smoothly
      this.updateMusicParameters();
    }
  }

  private startMusic(): void {
    if (!this.isEnabled) return;

    // Start Transport
    Tone.Transport.start();

    // Create loops based on current state
    this.createAmbientLoop();
    this.createBassLoop();
    this.createMelodyLoop();
  }

  private stopMusic(): void {
    // Stop all loops
    this.ambientLoop?.stop();
    this.melodyLoop?.stop();
    this.bassLoop?.stop();

    // Release all notes
    this.ambientSynth.releaseAll();
    this.melodySynth.triggerRelease();
    this.bassDrone.triggerRelease();
    this.padSynth.releaseAll();

    // Stop transport
    Tone.Transport.stop();
  }

  private restartMusic(): void {
    this.stopMusic();
    if (this.isEnabled) {
      this.startMusic();
    }
  }

  private createAmbientLoop(): void {
    const notes = this.getBiomeAmbientNotes();
    const interval = this.getAmbientInterval();

    this.ambientLoop?.stop();
    this.ambientLoop = new Tone.Loop((time) => {
      if (!this.isEnabled) return;

      // Play 2-3 notes at once for richness
      const numNotes = Math.random() > 0.5 ? 2 : 3;
      const selectedNotes: string[] = [];

      for (let i = 0; i < numNotes; i++) {
        const note = notes[Math.floor(Math.random() * notes.length)];
        if (note) {
          selectedNotes.push(note);
        }
      }

      if (selectedNotes.length > 0) {
        this.ambientSynth.triggerAttackRelease(selectedNotes, '2n', time);
      }
    }, interval);

    this.ambientLoop.start(0);
  }

  private createBassLoop(): void {
    const bassNote = this.getBiomeBassNote();

    this.bassLoop?.stop();
    this.bassLoop = new Tone.Loop((time) => {
      if (!this.isEnabled || !bassNote) return;

      // Continuous bass drone
      this.bassDrone.triggerAttack(bassNote, time);
    }, '1m'); // Every measure

    this.bassLoop.start(0);
  }

  private createMelodyLoop(): void {
    const scale = this.getBiomeScale();
    const tempo = this.getMelodyTempo();

    this.melodyLoop?.stop();
    this.melodyLoop = new Tone.Loop((time) => {
      if (!this.isEnabled) return;

      // Combat intensity affects melody activity
      const shouldPlay = Math.random() < (0.3 + this.currentState.combatIntensity * 0.5);

      if (shouldPlay) {
        const note = scale[Math.floor(Math.random() * scale.length)];
        if (note) {
          const duration = Math.random() > 0.5 ? '8n' : '4n';
          this.melodySynth.triggerAttackRelease(note, duration, time);
        }
      }
    }, tempo);

    this.melodyLoop.start(0);
  }

  private updateMusicParameters(): void {
    // Update filter based on light level (darker = more filtered)
    const filterFreq = 500 + this.currentState.lightLevel * 1500;
    this.filter.frequency.rampTo(filterFreq, 2);

    // Update reverb based on biome (deeper biomes = more reverb)
    const isDeep = this.currentState.biome.includes('deep');
    this.reverb.wet.rampTo(isDeep ? 0.6 : 0.3, 2);

    // Update delay feedback based on combat intensity
    this.delay.feedback.rampTo(0.2 + this.currentState.combatIntensity * 0.3, 1);
  }

  private getBiomeAmbientNotes(): string[] {
    // Different note sets for different biomes
    switch (this.currentState.biome) {
      case BiomeType.SHALLOW_WARM:
        return ['C3', 'E3', 'G3', 'B3', 'D4', 'F#4']; // Major 6th, bright

      case BiomeType.SHALLOW_COLD:
        return ['C3', 'Eb3', 'G3', 'Bb3', 'D4', 'F4']; // Minor, cooler

      case BiomeType.DEEP_WARM:
        return ['C2', 'E2', 'G2', 'A2', 'C3', 'E3']; // Lower, warm

      case BiomeType.DEEP_COLD:
        return ['C2', 'Eb2', 'F2', 'Ab2', 'C3', 'Eb3']; // Low, mysterious

      case BiomeType.TOXIC:
        return ['C#3', 'E3', 'F#3', 'A3', 'C4', 'D#4']; // Dissonant, eerie

      case BiomeType.NUTRIENT_RICH:
        return ['C3', 'D3', 'E3', 'G3', 'A3', 'C4', 'D4']; // Major scale, lively

      case BiomeType.BARREN:
        return ['C3', 'Eb3', 'F3', 'Ab3', 'C4']; // Sparse, minor

      default:
        return ['C3', 'E3', 'G3', 'B3'];
    }
  }

  private getBiomeBassNote(): string {
    const isDeep = this.currentState.biome.includes('deep');

    switch (this.currentState.biome) {
      case BiomeType.TOXIC:
        return isDeep ? 'C#1' : 'C#2';
      default:
        return isDeep ? 'C1' : 'C2';
    }
  }

  private getBiomeScale(): string[] {
    // Melody scales based on biome mood
    switch (this.currentState.biome) {
      case BiomeType.SHALLOW_WARM:
      case BiomeType.NUTRIENT_RICH:
        return ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']; // C Major

      case BiomeType.SHALLOW_COLD:
      case BiomeType.BARREN:
        return ['C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5']; // C Minor

      case BiomeType.DEEP_WARM:
        return ['C4', 'D4', 'E4', 'F#4', 'G4', 'A4', 'B4']; // C Lydian (ethereal)

      case BiomeType.DEEP_COLD:
        return ['C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4']; // C Dorian (mysterious)

      case BiomeType.TOXIC:
        return ['C4', 'Db4', 'E4', 'F4', 'G4', 'Ab4', 'B4']; // C Altered (tense)

      default:
        return ['C4', 'D4', 'E4', 'G4', 'A4', 'C5']; // Pentatonic
    }
  }

  private getAmbientInterval(): Tone.Unit.Time {
    // Slower ambient in calm situations, faster in combat
    const baseInterval = 4; // quarter notes
    const combatMod = 1 - (this.currentState.combatIntensity * 0.5);
    return `${baseInterval * combatMod}n` as Tone.Unit.Time;
  }

  private getMelodyTempo(): Tone.Unit.Time {
    // Melody plays faster during day, slower at night
    const dayMod = this.currentState.timeOfDay === 'day' ? 1 : 1.5;
    const combatMod = 1 - (this.currentState.combatIntensity * 0.3);
    return `${4 * dayMod * combatMod}n` as Tone.Unit.Time;
  }

  dispose(): void {
    this.stopMusic();

    // Dispose all audio nodes
    this.ambientSynth.dispose();
    this.bassDrone.dispose();
    this.melodySynth.dispose();
    this.padSynth.dispose();
    this.reverb.dispose();
    this.filter.dispose();
    this.delay.dispose();
    this.masterVolume.dispose();
  }
}
