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

export interface MusicPreset {
  name: string;
  oscillatorType: 'sine' | 'square' | 'sawtooth' | 'triangle';
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
  scale: string[];
  filterFreq: number;
  reverbWet: number;
  delayFeedback: number;
  bpm: number;
}

interface ToneProfile {
  ambient: string[];
  scale: string[];
  mildTension?: string[];
}

const DEFAULT_TONE_PROFILE: ToneProfile = {
  ambient: ['C3', 'D3', 'E3', 'G3', 'A3', 'C4'],
  scale: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5'],
  mildTension: ['F4'],
};

const MIN_NOTE_OCTAVE = 2;

const clampNoteToMinOctave = (note: string, minOctave = MIN_NOTE_OCTAVE): string => {
  const match = note.match(/^([A-Ga-g])(#{1}|b)?(\d+)$/);
  if (!match) {
    return note;
  }

  const letter = match[1];
  const accidental = match[2] ?? '';
  const octaveStr = match[3];
  if (!letter || !octaveStr) {
    return note;
  }

  const octave = parseInt(octaveStr, 10);
  if (Number.isNaN(octave)) {
    return `${letter.toUpperCase()}${accidental}${octaveStr}`;
  }

  const clampedOctave = Math.max(octave, minOctave);
  return `${letter.toUpperCase()}${accidental}${clampedOctave}`;
};

const sanitizeNotes = (notes: string[]): string[] => notes.map(note => clampNoteToMinOctave(note));

const TONE_PROFILES: Record<BiomeType, ToneProfile> = {
  [BiomeType.SHALLOW_WARM]: {
    ambient: ['C3', 'D3', 'E3', 'G3', 'A3', 'C4'],
    scale: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5'],
    mildTension: ['F4'],
  },
  [BiomeType.SHALLOW_COLD]: {
    ambient: ['C3', 'Eb3', 'F3', 'G3', 'Bb3', 'C4'],
    scale: ['C4', 'Eb4', 'F4', 'G4', 'Bb4', 'C5'],
    mildTension: ['D4'],
  },
  [BiomeType.DEEP_WARM]: {
    ambient: ['C2', 'D2', 'E2', 'G2', 'A2', 'C3'],
    scale: ['C3', 'D3', 'E3', 'G3', 'A3', 'C4'],
    mildTension: ['B3'],
  },
  [BiomeType.DEEP_COLD]: {
    ambient: ['C2', 'Eb2', 'F2', 'G2', 'Bb2', 'C3'],
    scale: ['C3', 'Eb3', 'F3', 'G3', 'Bb3', 'C4'],
    mildTension: ['D3'],
  },
  [BiomeType.TOXIC]: {
    ambient: ['C#3', 'E3', 'F#3', 'G#3', 'B3', 'C#4'],
    scale: ['C#4', 'E4', 'F#4', 'G#4', 'B4', 'C#5'],
    mildTension: ['D4', 'A4'],
  },
  [BiomeType.NUTRIENT_RICH]: {
    ambient: ['C3', 'D3', 'E3', 'G3', 'A3', 'C4'],
    scale: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5'],
    mildTension: ['B4'],
  },
  [BiomeType.BARREN]: {
    ambient: ['C3', 'Eb3', 'G3', 'Bb3', 'C4'],
    scale: ['C4', 'Eb4', 'G4', 'Bb4', 'C5'],
    mildTension: ['F4'],
  },
  [BiomeType.VOLCANIC]: {
    ambient: ['D3', 'F3', 'A3', 'C4', 'D4', 'F4'],
    scale: ['D4', 'F4', 'A4', 'C5', 'D5'],
    mildTension: ['G4'],
  },
  [BiomeType.FROZEN]: {
    ambient: ['C3', 'D3', 'G3', 'A3', 'C4', 'D4'],
    scale: ['C4', 'D4', 'G4', 'A4', 'C5', 'D5'],
    mildTension: ['E4'],
  },
  [BiomeType.SWAMP]: {
    ambient: ['C3', 'Eb3', 'G3', 'Bb3', 'D4', 'F4'],
    scale: ['C4', 'Eb4', 'G4', 'Bb4', 'D5', 'F5'],
  },
  [BiomeType.CRYSTAL]: {
    ambient: ['C3', 'E3', 'G3', 'B3', 'D4', 'E4'],
    scale: ['C4', 'E4', 'G4', 'A4', 'B4', 'D5', 'E5'],
    mildTension: ['F#4'],
  },
  [BiomeType.ABYSS]: {
    ambient: ['C1', 'Eb1', 'G1', 'Bb1', 'C2', 'Eb2'],
    scale: ['C3', 'Eb3', 'F3', 'G3', 'Bb3', 'C4'],
    mildTension: ['Db3'],
  },
} as const;

export class MusicManager {
  private isEnabled = false;
  private isInitialized = false;
  private masterVolume: Tone.Volume;

  // Synth layers
  private ambientSynth: Tone.PolySynth;
  private bassDrone: Tone.Synth;
  private melodySynth: Tone.Synth;
  private padSynth: Tone.PolySynth;

  // Per-synth channels for effects
  private ambientChannel: Tone.Channel;
  private bassChannel: Tone.Channel;
  private melodyChannel: Tone.Channel;
  private padChannel: Tone.Channel;

  // Effects
  private reverb: Tone.Reverb;
  private filter: Tone.Filter;
  private delay: Tone.FeedbackDelay;

  // Presets
  private presets: MusicPreset[] = [];

  // Sequencers
  private ambientLoop: Tone.Loop | null = null;
  private melodyLoop: Tone.Loop | null = null;
  private bassLoop: Tone.Loop | null = null;
  private ambientChordSeed = 0;

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

    // Create per-synth channels
    this.ambientChannel = new Tone.Channel({ volume: 0 }).toDestination();
    this.bassChannel = new Tone.Channel({ volume: 0 }).toDestination();
    this.melodyChannel = new Tone.Channel({ volume: 0 }).toDestination();
    this.padChannel = new Tone.Channel({ volume: 0 }).toDestination();

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

    // Initialize presets
    this.initializePresets();

    // Connect audio graph
    this.setupAudioGraph();
  }

  private initializePresets(): void {
    this.presets = [
      {
        name: 'Default',
        oscillatorType: 'sine',
        envelope: { attack: 2, decay: 1, sustain: 0.8, release: 3 },
        scale: ['C3', 'E3', 'G3', 'B3', 'D4', 'F#4'],
        filterFreq: 2000,
        reverbWet: 0.4,
        delayFeedback: 0.3,
        bpm: 120,
      },
      {
        name: 'Bright & Energetic',
        oscillatorType: 'sawtooth',
        envelope: { attack: 0.1, decay: 0.5, sustain: 0.7, release: 1.5 },
        scale: ['C3', 'D3', 'E3', 'G3', 'A3', 'C4', 'D4'],
        filterFreq: 3000,
        reverbWet: 0.2,
        delayFeedback: 0.1,
        bpm: 140,
      },
      {
        name: 'Dark & Ambient',
        oscillatorType: 'triangle',
        envelope: { attack: 3, decay: 2, sustain: 0.6, release: 5 },
        scale: ['C3', 'Eb3', 'F3', 'Ab3', 'C4'],
        filterFreq: 1000,
        reverbWet: 0.7,
        delayFeedback: 0.5,
        bpm: 80,
      },
      {
        name: 'Crystalline',
        oscillatorType: 'sine',
        envelope: { attack: 1, decay: 0.8, sustain: 0.9, release: 2 },
        scale: ['C3', 'E3', 'F#3', 'G#3', 'B3', 'C4', 'E4'],
        filterFreq: 4000,
        reverbWet: 0.5,
        delayFeedback: 0.2,
        bpm: 100,
      },
      {
        name: 'Deep & Mysterious',
        oscillatorType: 'sine',
        envelope: { attack: 4, decay: 3, sustain: 0.5, release: 6 },
        scale: ['C2', 'Db2', 'Eb2', 'Gb2', 'Ab2', 'C3'],
        filterFreq: 800,
        reverbWet: 0.8,
        delayFeedback: 0.4,
        bpm: 60,
      },
    ];
  }

  private setupAudioGraph(): void {
    // Connect synths through channels for per-layer effects
    // Ambient synth -> channel -> reverb -> filter -> master
    this.ambientSynth.connect(this.ambientChannel);
    this.ambientChannel.connect(this.reverb);
    this.reverb.connect(this.filter);
    this.filter.connect(this.masterVolume);

    // Bass drone -> channel -> master (dry, deep)
    this.bassDrone.connect(this.bassChannel);
    this.bassChannel.connect(this.masterVolume);

    // Melody -> channel -> delay -> reverb -> master
    this.melodySynth.connect(this.melodyChannel);
    this.melodyChannel.connect(this.delay);
    this.delay.connect(this.reverb);

    // Pad -> channel -> reverb -> master
    this.padSynth.connect(this.padChannel);
    this.padChannel.connect(this.reverb);
    
    // Set initial channel volumes (not muted)
    this.ambientChannel.volume.value = 0;
    this.bassChannel.volume.value = 0;
    this.melodyChannel.volume.value = 0;
    this.padChannel.volume.value = 0;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Try to start audio context, but don't block if it fails
      // Modern browsers require user interaction for audio
      const startPromise = Tone.start();
      const reverbPromise = this.reverb.generate();
      
      // Set a timeout to avoid hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Audio initialization timeout')), 2000);
      });
      
      await Promise.race([startPromise, reverbPromise, timeoutPromise]);
      this.isInitialized = true;
      console.log('MusicManager: Audio initialized successfully');
    } catch (error) {
      console.warn('MusicManager: Audio initialization failed (will retry on user interaction):', error);
      // Don't throw - allow game to continue without audio
      this.isInitialized = false;
    }
  }

  async enable(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.isEnabled) return;

    this.isEnabled = true;
    
    // Try to start audio again on user interaction
    if (!this.isInitialized) {
      try {
        await Tone.start();
        await this.reverb.generate();
        this.isInitialized = true;
        console.log('MusicManager: Audio initialized on user interaction');
      } catch (error) {
        console.warn('MusicManager: Still failed to initialize audio:', error);
      }
    }
    
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

      const chord = this.buildAmbientChord(notes);
      if (chord.length > 0) {
        this.ambientSynth.triggerAttackRelease(chord, '2n', time);
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
    const profile = this.getToneProfile();
    return this.extendWithTension(profile.ambient, profile.mildTension, 0.2);
  }

  private getBiomeBassNote(): string {
    const isDeep = this.currentState.biome.includes('deep');

    const note = (() => {
      switch (this.currentState.biome) {
        case BiomeType.TOXIC:
          return isDeep ? 'C#1' : 'C#2';
        case BiomeType.VOLCANIC:
          return 'D1'; // Powerful, deep
        case BiomeType.FROZEN:
          return 'C1'; // Very low and cold
        case BiomeType.SWAMP:
          return 'C1'; // Deep murky drone
        case BiomeType.CRYSTAL:
          return 'C2'; // Higher, crystalline
        case BiomeType.ABYSS:
          return 'C0'; // Extremely deep
        default:
          return isDeep ? 'C1' : 'C2';
      }
    })();

    return clampNoteToMinOctave(note);
  }

  private getBiomeScale(): string[] {
    const profile = this.getToneProfile();
    return this.extendWithTension(profile.scale, profile.mildTension, 0.3);
  }

  private getToneProfile(): ToneProfile {
    const baseProfile = TONE_PROFILES[this.currentState.biome] || DEFAULT_TONE_PROFILE;
    return {
      ambient: sanitizeNotes(baseProfile.ambient),
      scale: sanitizeNotes(baseProfile.scale),
      mildTension: baseProfile.mildTension ? sanitizeNotes(baseProfile.mildTension) : undefined,
    };
  }

  private extendWithTension(base: string[], tension?: string[], chance = 0.2): string[] {
    const pool = [...base];
    if (tension && tension.length > 0 && Math.random() < chance) {
      pool.push(...tension);
    }
    return pool;
  }

  private buildAmbientChord(notes: string[]): string[] {
    if (notes.length === 0) {
      return [];
    }

    const uniqueNotes: string[] = Array.from(new Set<string>(notes));
    if (uniqueNotes.length === 0) {
      return [];
    }

    // Drift root gradually so the pad feels smooth
    const drift = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
    this.ambientChordSeed = (this.ambientChordSeed + drift + uniqueNotes.length) % uniqueNotes.length;
    const rootIndex = this.ambientChordSeed;

    const pickNote = (offset: number): string => {
      const index = (rootIndex + offset + uniqueNotes.length) % uniqueNotes.length;
      return uniqueNotes[index] ?? uniqueNotes[0]!;
    };

    const chord: string[] = [];
    const addNote = (offset: number) => {
      const note = pickNote(offset);
      if (!chord.includes(note)) {
        chord.push(note);
      }
    };

    addNote(0);
    addNote(2);
    addNote(4);

    return chord;
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

  // Dev tools methods
  setFilterFrequency(freq: number): void {
    this.filter.frequency.rampTo(freq, 0.1);
  }

  setReverbWet(wet: number): void {
    this.reverb.wet.rampTo(wet, 0.1);
  }

  setDelayFeedback(feedback: number): void {
    this.delay.feedback.rampTo(feedback, 0.1);
  }

  setBPM(bpm: number): void {
    Tone.Transport.bpm.rampTo(bpm, 0.5);
  }

  setLayerMute(layer: 'ambient' | 'bass' | 'melody' | 'pad', muted: boolean): void {
    const channel = this.getChannelForLayer(layer);
    if (channel) {
      channel.volume.rampTo(muted ? -Infinity : 0, 0.1);
    }
  }

  private getChannelForLayer(layer: 'ambient' | 'bass' | 'melody' | 'pad'): Tone.Channel | null {
    switch (layer) {
      case 'ambient':
        return this.ambientChannel;
      case 'bass':
        return this.bassChannel;
      case 'melody':
        return this.melodyChannel;
      case 'pad':
        return this.padChannel;
      default:
        return null;
    }
  }

  getPresets(): MusicPreset[] {
    return this.presets;
  }

  applyPreset(presetIndex: number): void {
    if (presetIndex < 0 || presetIndex >= this.presets.length) return;

    const preset = this.presets[presetIndex];
    if (!preset) return;
    
    // Apply preset settings
    this.setBPM(preset.bpm);
    this.setFilterFrequency(preset.filterFreq);
    this.setReverbWet(preset.reverbWet);
    this.setDelayFeedback(preset.delayFeedback);

    // Update synth oscillators (requires recreating synths)
    // For now, we'll just update the parameters we can change dynamically
    // Full oscillator type changes would require synth recreation
  }

  dispose(): void {
    this.stopMusic();

    // Dispose all audio nodes
    this.ambientSynth.dispose();
    this.bassDrone.dispose();
    this.melodySynth.dispose();
    this.padSynth.dispose();
    this.ambientChannel.dispose();
    this.bassChannel.dispose();
    this.melodyChannel.dispose();
    this.padChannel.dispose();
    this.reverb.dispose();
    this.filter.dispose();
    this.delay.dispose();
    this.masterVolume.dispose();
  }
}
