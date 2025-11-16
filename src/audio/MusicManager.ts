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
const MIN_BASS_OCTAVE = 2; // Bass notes should be at least C2 (65.41 Hz)
const MIN_MELODY_OCTAVE = 3; // Melodies should be at least C3 for clarity

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
    ambient: ['C3', 'D3', 'E3', 'G3', 'A3', 'C4'],
    scale: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5'],
    mildTension: ['B4'],
  },
  [BiomeType.DEEP_COLD]: {
    ambient: ['C3', 'Eb3', 'F3', 'G3', 'Bb3', 'C4'],
    scale: ['C4', 'Eb4', 'F4', 'G4', 'Bb4', 'C5'],
    mildTension: ['D4'],
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
    ambient: ['C2', 'Eb2', 'G2', 'Bb2', 'C3', 'Eb3'],
    scale: ['C3', 'Eb3', 'F3', 'G3', 'Bb3', 'C4'],
    mildTension: ['Db4'],
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
  private rhythmSynth: Tone.NoiseSynth;

  // Per-synth channels for effects
  private ambientChannel: Tone.Channel;
  private bassChannel: Tone.Channel;
  private melodyChannel: Tone.Channel;
  private padChannel: Tone.Channel;
  private rhythmChannel: Tone.Channel;

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
  private padLoop: Tone.Loop | null = null;
  private rhythmLoop: Tone.Loop | null = null;
  private ambientChordSeed = 0;
  private lastMelodyIndex = 0; // Track last melody note for stepwise motion

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

    // Create effects chain with reduced reverb
    this.reverb = new Tone.Reverb({
      decay: 3,
      wet: 0.25,
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

    // Create per-synth channels with balanced volumes
    this.ambientChannel = new Tone.Channel({ volume: -6 }).toDestination();
    this.bassChannel = new Tone.Channel({ volume: -8 }).toDestination();
    this.melodyChannel = new Tone.Channel({ volume: -10 }).toDestination();
    this.padChannel = new Tone.Channel({ volume: -15 }).toDestination();
    this.rhythmChannel = new Tone.Channel({ volume: -18 }).toDestination();

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

    this.rhythmSynth = new Tone.NoiseSynth({
      noise: {
        type: 'white', // White noise for crisp, typing-like sound
      },
      envelope: {
        attack: 0.001, // Very fast attack for percussive hit
        decay: 0.05,   // Short decay
        sustain: 0,    // No sustain - quick hits only
        release: 0.02, // Very short release
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

    // Rhythm -> channel -> filter -> master (dry, percussive)
    this.rhythmSynth.connect(this.rhythmChannel);
    this.rhythmChannel.connect(this.filter);
    this.filter.connect(this.masterVolume);

    // Volumes are already set in channel creation
    // Ambient: -6dB, Bass: -8dB, Melody: -10dB, Pad: -15dB, Rhythm: -18dB
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

    // Set Transport BPM for consistent timing across all layers
    // All loops use relative timing (1m, 4n, etc.) which sync to this BPM
    Tone.Transport.bpm.value = 80; // Slower, ambient tempo

    // Start Transport at quantized time
    Tone.Transport.start('+0.1'); // Small delay to ensure all loops are ready

    // Create loops based on current state
    // QUANTIZATION: All loops use Tone.Loop with time parameter, ensuring
    // every note is triggered exactly on the Transport timeline.
    // Loop start times use quantization markers (@1m, @2m, etc.)
    this.createAmbientLoop();  // Starts at 0 (immediately)
    this.createBassLoop();     // First note at @1m, loop at @4m
    this.createMelodyLoop();   // Starts at @2m
    this.createPadLoop();      // Starts at 0 (immediately)
    this.createRhythmLoop();   // Starts at 0 (16th note grid)
  }

  private stopMusic(): void {
    // Stop all loops
    this.ambientLoop?.stop();
    this.melodyLoop?.stop();
    this.bassLoop?.stop();
    this.padLoop?.stop();
    this.rhythmLoop?.stop();

    // Release all notes
    this.ambientSynth.releaseAll();
    this.melodySynth.triggerRelease();
    this.bassDrone.triggerRelease();
    this.padSynth.releaseAll();

    // Clear all scheduled events from Transport
    Tone.Transport.cancel();

    // Stop transport
    Tone.Transport.stop();

    // Reset transport position for clean restart
    Tone.Transport.position = 0;
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
    this.ambientLoop = new Tone.Loop((time: number) => {
      if (!this.isEnabled) return;

      const chord = this.buildAmbientChord(notes);
      if (chord.length > 0) {
        // Longer note duration for more sustained ambience
        this.ambientSynth.triggerAttackRelease(chord, '1n', time);
      }
    }, interval);

    // Start quantized to measure boundary
    this.ambientLoop.start(0);
  }

  private createBassLoop(): void {
    const bassNote = this.getBiomeBassNote();

    this.bassLoop?.stop();

    // Release any existing bass note first
    this.bassDrone.triggerRelease();

    // Schedule the initial bass note quantized to the grid
    if (this.isEnabled && bassNote) {
      // Schedule at the start of the next measure
      Tone.Transport.scheduleOnce((time) => {
        this.bassDrone.triggerAttack(bassNote, time);
      }, '@1m');
    }

    // Create a loop to refresh the bass periodically (every 4 measures)
    // This prevents audio context issues with very long notes
    this.bassLoop = new Tone.Loop((time: number) => {
      if (!this.isEnabled || !bassNote) return;

      // Release and retrigger every 4 measures for freshness
      this.bassDrone.triggerRelease(time);
      this.bassDrone.triggerAttack(bassNote, time + 0.05); // Small offset to avoid clicks
    }, '4m');

    // Start bass loop at measure boundary, after 4 measures
    this.bassLoop.start('@4m');
  }

  private createMelodyLoop(): void {
    const scale = this.getBiomeScale();
    const tempo = this.getMelodyTempo();

    this.melodyLoop?.stop();
    this.melodyLoop = new Tone.Loop((time: number) => {
      if (!this.isEnabled) return;

      // Reduced melody activity - only 20% base chance, up to 40% in combat
      const shouldPlay = Math.random() < (0.2 + this.currentState.combatIntensity * 0.2);

      if (shouldPlay && scale.length > 0) {
        // Stepwise motion: prefer moving to adjacent scale degrees
        const stepDirection = Math.random() < 0.5 ? -1 : 1; // Go up or down
        const stepSize = Math.random() < 0.7 ? 1 : 2; // Mostly small steps, occasionally jump

        // Calculate new index with stepwise motion
        let newIndex = this.lastMelodyIndex + (stepDirection * stepSize);

        // Wrap around the scale
        newIndex = ((newIndex % scale.length) + scale.length) % scale.length;

        const note = scale[newIndex];
        if (note) {
          // Ensure melody is in audible range (octave 3+)
          const clampedNote = clampNoteToMinOctave(note, MIN_MELODY_OCTAVE);

          // Varied note durations - all quantized
          const durations: Tone.Unit.Time[] = ['8n', '4n', '4n.'];
          const duration = durations[Math.floor(Math.random() * durations.length)] ?? '4n';

          // Trigger at the exact scheduled time for quantization
          this.melodySynth.triggerAttackRelease(clampedNote, duration, time);
          this.lastMelodyIndex = newIndex;
        }
      }
    }, tempo);

    // Start melody at measure 2 to let ambient establish first
    this.melodyLoop.start('@2m');
  }

  private createPadLoop(): void {
    const notes = this.getBiomeAmbientNotes();

    this.padLoop?.stop();
    this.padLoop = new Tone.Loop((time: number) => {
      if (!this.isEnabled) return;

      // Pad plays very slow, sustained power chords for atmosphere
      // Power chord: root + fifth (2 notes only for clarity)
      if (notes.length >= 2) {
        const root = notes[0];
        const fifth = notes[Math.min(4, notes.length - 1)]; // Fifth, or closest available

        const chord = [root, fifth].filter((n): n is string => n !== undefined && n !== root || n === root);

        // Ensure we have exactly 2 distinct notes
        const uniqueChord = Array.from(new Set(chord));
        if (uniqueChord.length >= 1) {
          // Pad with root if only 1 note available
          const finalChord = uniqueChord.length === 1 ? [uniqueChord[0]!, uniqueChord[0]!] : uniqueChord.slice(0, 2);

          // Very long sustained notes (2 measures) - triggered at exact scheduled time
          this.padSynth.triggerAttackRelease(finalChord, '2m', time);
        }
      }
    }, '2m'); // Every 2 measures

    // Start pad immediately, quantized to transport grid
    this.padLoop.start(0);
  }

  private createRhythmLoop(): void {
    this.rhythmLoop?.stop();

    // Track beat position for pattern-based triggering
    let beatCount = 0;

    this.rhythmLoop = new Tone.Loop((time: number) => {
      if (!this.isEnabled) return;

      // Create a microbeat pattern - typing/shuffling card sound
      // Beat position determines probability (emphasize downbeats)
      const beatInMeasure = beatCount % 16; // 16 sixteenth notes per measure (4/4)

      // Downbeats (1, 5, 9, 13) have higher probability
      const isDownbeat = beatInMeasure % 4 === 0;
      const isOffbeat = beatInMeasure % 2 === 1;

      // Base activity increases with combat intensity
      let activity = 0.2; // Base 20%

      if (isDownbeat) {
        activity = 0.5 + (this.currentState.combatIntensity * 0.3); // 50-80% on downbeats
      } else if (isOffbeat) {
        activity = 0.15 + (this.currentState.combatIntensity * 0.25); // 15-40% on offbeats
      } else {
        activity = 0.1 + (this.currentState.combatIntensity * 0.2); // 10-30% elsewhere
      }

      // Trigger based on probability, but always quantized to the grid
      if (Math.random() < activity) {
        // Very short noise burst for typing/shuffling sound, triggered at exact time
        this.rhythmSynth.triggerAttackRelease('32n', time);
      }

      beatCount++;
    }, '16n'); // 16th note grid for microbeat feel

    // Start rhythm quantized to beat 1
    this.rhythmLoop.start(0);
  }

  private updateMusicParameters(): void {
    // Update filter based on light level (darker = more filtered)
    const filterFreq = 500 + this.currentState.lightLevel * 1500;
    this.filter.frequency.rampTo(filterFreq, 2);

    // Update reverb based on biome (deeper biomes = slightly more reverb)
    const isDeep = this.currentState.biome.includes('deep');
    this.reverb.wet.rampTo(isDeep ? 0.35 : 0.25, 2);

    // Update delay feedback based on combat intensity (more subtle)
    this.delay.feedback.rampTo(0.15 + this.currentState.combatIntensity * 0.2, 1);
  }

  private getBiomeAmbientNotes(): string[] {
    const profile = this.getToneProfile();
    // Reduced tension note probability from 20% to 5%
    return this.extendWithTension(profile.ambient, profile.mildTension, 0.05);
  }

  private getBiomeBassNote(): string {
    const isDeep = this.currentState.biome.includes('deep');

    const note = (() => {
      switch (this.currentState.biome) {
        case BiomeType.TOXIC:
          return isDeep ? 'C#2' : 'C#3';
        case BiomeType.VOLCANIC:
          return 'D2'; // Powerful, warm bass
        case BiomeType.FROZEN:
          return 'C2'; // Low and cold
        case BiomeType.SWAMP:
          return 'C2'; // Deep murky drone
        case BiomeType.CRYSTAL:
          return 'C3'; // Higher, crystalline
        case BiomeType.ABYSS:
          return 'C2'; // Deep but audible
        default:
          return isDeep ? 'C2' : 'C3';
      }
    })();

    return clampNoteToMinOctave(note, MIN_BASS_OCTAVE);
  }

  private getBiomeScale(): string[] {
    const profile = this.getToneProfile();
    // Reduced tension note probability from 30% to 10%
    return this.extendWithTension(profile.scale, profile.mildTension, 0.1);
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

    // Use chord progression instead of random selection
    // Cycle through I - V - vi - IV progression (common, pleasant)
    const progressionSteps = [0, 4, 5, 3]; // Scale degrees
    const progressionIndex = Math.floor((Date.now() / 4000) % progressionSteps.length); // Change every 4 seconds
    const rootOffset = progressionSteps[progressionIndex] ?? 0;

    const rootIndex = rootOffset % uniqueNotes.length;

    // Build a power chord: root + fifth (2 notes only)
    // Power chords are more stable and less muddy than triads
    const chord: string[] = [];

    const root = uniqueNotes[rootIndex];
    const fifth = uniqueNotes[(rootIndex + 4) % uniqueNotes.length]; // Fifth is 4 scale degrees up

    if (root) chord.push(root);
    if (fifth && fifth !== root) chord.push(fifth);

    return chord;
  }

  private getAmbientInterval(): Tone.Unit.Time {
    // Much slower ambient chords - every 1-2 measures instead of every beat
    // Base interval: 1 measure = 1m (4 quarter notes)
    const baseInterval = this.currentState.combatIntensity > 0.5 ? '1m' : '2m';
    return baseInterval as Tone.Unit.Time;
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

  setLayerMute(layer: 'ambient' | 'bass' | 'melody' | 'pad' | 'rhythm', muted: boolean): void {
    const channel = this.getChannelForLayer(layer);
    if (channel) {
      channel.volume.rampTo(muted ? -Infinity : 0, 0.1);
    }
  }

  private getChannelForLayer(layer: 'ambient' | 'bass' | 'melody' | 'pad' | 'rhythm'): Tone.Channel | null {
    switch (layer) {
      case 'ambient':
        return this.ambientChannel;
      case 'bass':
        return this.bassChannel;
      case 'melody':
        return this.melodyChannel;
      case 'pad':
        return this.padChannel;
      case 'rhythm':
        return this.rhythmChannel;
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
    this.rhythmSynth.dispose();
    this.ambientChannel.dispose();
    this.bassChannel.dispose();
    this.melodyChannel.dispose();
    this.padChannel.dispose();
    this.rhythmChannel.dispose();
    this.reverb.dispose();
    this.filter.dispose();
    this.delay.dispose();
    this.masterVolume.dispose();
  }
}
