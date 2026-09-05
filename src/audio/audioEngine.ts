import { AudioCategory } from '../types/llm';
import { AudioEngineState, DramaticAudioPreset } from '../types/audio';
import { playPresetSynthesis } from './dramaticPresets';

// Priority ranks for audio categories (higher number = higher priority)
const CATEGORY_PRIORITY: Record<AudioCategory, number> = {
  SHOCK: 8,
  VILLAIN: 7,
  CLIFFHANGER: 6,
  SUSPENSE: 5,
  SAD: 4,
  ROMANTIC: 3,
  COMEDY: 2,
  NONE: 0
};

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentTrackStopFn: (() => void) | null = null;

  private state: AudioEngineState = {
    isMuted: false,
    masterVolume: 0.8,
    activePreset: 'NONE',
    activeCategory: 'NONE',
    isPlaying: false,
    intensity: 80
  };

  private listeners: ((state: AudioEngineState) => void)[] = [];

  /**
   * Must be invoked during a direct user gesture (e.g. clicking "Start Camera")
   */
  public async initAudioContext(): Promise<void> {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.state.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  public subscribe(listener: (state: AudioEngineState) => void): () => void {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(l => l(this.state));
  }

  /**
   * Play dramatic category audio using priority rules
   */
  public playCategory(
    category: AudioCategory,
    intensity: number = 80,
    durationSec: number = 5,
    forceInterrupt: boolean = false
  ): void {
    if (category === 'NONE') {
      return;
    }

    // Select preset based on category
    let preset: DramaticAudioPreset = 'NONE';
    switch (category) {
      case 'VILLAIN':
        preset = Math.random() > 0.5 ? 'VILLAIN_1' : 'VILLAIN_2';
        break;
      case 'SHOCK':
        preset = Math.random() > 0.5 ? 'SHOCK_1' : 'SHOCK_2';
        break;
      case 'SAD':
        preset = Math.random() > 0.5 ? 'SAD_1' : 'SAD_2';
        break;
      case 'SUSPENSE':
        preset = Math.random() > 0.5 ? 'SUSPENSE_1' : 'SUSPENSE_2';
        break;
      case 'ROMANTIC':
        preset = 'ROMANTIC_1';
        break;
      case 'COMEDY':
        preset = 'COMEDY_1';
        break;
      case 'CLIFFHANGER':
        preset = 'CLIFFHANGER_1';
        break;
    }

    this.playPreset(preset, category, intensity, durationSec, forceInterrupt);
  }

  /**
   * Play specific preset sound with priority check
   */
  public playPreset(
    preset: DramaticAudioPreset,
    category: AudioCategory,
    intensity: number = 80,
    durationSec: number = 5,
    forceInterrupt: boolean = false
  ): void {
    if (!this.ctx || !this.masterGain) {
      console.warn('⚠️ [SERIALOS AudioEngine] AudioContext not initialized yet.');
      return;
    }

    if (this.state.isMuted) {
      return;
    }

    const newPriority = CATEGORY_PRIORITY[category] || 1;
    const currentPriority = CATEGORY_PRIORITY[this.state.activeCategory] || 0;

    // Interrupt if new sound has higher priority OR forceInterrupt is set OR current sound stopped
    if (this.state.isPlaying && newPriority <= currentPriority && !forceInterrupt) {
      console.log(`[SERIALOS Audio] Ignored preset ${preset} (${category}) due to lower priority than active ${this.state.activeCategory}`);
      return;
    }

    // Stop current track cleanly
    if (this.currentTrackStopFn) {
      this.currentTrackStopFn();
      this.currentTrackStopFn = null;
    }

    // Synthesize & play preset
    const { stop } = playPresetSynthesis(
      this.ctx,
      this.masterGain,
      preset,
      intensity,
      durationSec
    );

    this.currentTrackStopFn = stop;

    this.state = {
      ...this.state,
      activePreset: preset,
      activeCategory: category,
      isPlaying: true,
      intensity
    };
    this.notify();

    // Auto-clear playing state when duration finishes
    setTimeout(() => {
      if (this.state.activePreset === preset) {
        this.state = {
          ...this.state,
          isPlaying: false
        };
        this.notify();
      }
    }, durationSec * 1000);
  }

  public setMute(muted: boolean): void {
    this.state.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        muted ? 0 : this.state.masterVolume,
        this.ctx.currentTime
      );
    }
    if (muted && this.currentTrackStopFn) {
      this.currentTrackStopFn();
      this.currentTrackStopFn = null;
    }
    this.notify();
  }

  public setMasterVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1.0, vol));
    this.state.masterVolume = clamped;
    if (this.masterGain && this.ctx && !this.state.isMuted) {
      this.masterGain.gain.setValueAtTime(clamped, this.ctx.currentTime);
    }
    this.notify();
  }

  public stop(): void {
    if (this.currentTrackStopFn) {
      this.currentTrackStopFn();
      this.currentTrackStopFn = null;
    }
    this.state = {
      ...this.state,
      activePreset: 'NONE',
      activeCategory: 'NONE',
      isPlaying: false
    };
    this.notify();
  }
}

export const audioEngine = new AudioEngine();

