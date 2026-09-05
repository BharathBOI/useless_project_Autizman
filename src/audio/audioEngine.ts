import { SerialSynthesizer } from './serialSynthesizer';
import { AudioCategory } from '../types/llm';

export type DramaticPresetName =
  | 'SHOCK_1'
  | 'SHOCK_2'
  | 'SHOCK_3'
  | 'VILLAIN_1'
  | 'VILLAIN_2'
  | 'VILLAIN_3'
  | 'SAD_1'
  | 'SAD_2'
  | 'SAD_3'
  | 'SUSPENSE_1'
  | 'SUSPENSE_2'
  | 'CLIFFHANGER_1'
  | 'ENTRANCE_STING'
  | 'EXIT_STING'
  | 'HAPPY_1';

export interface PresetMeta {
  id: DramaticPresetName;
  category: AudioCategory;
  label: string;
  sourceSerial: string;
  maxDuration: number;
  gainTrim: number;
}

export const PRESET_CALIBRATION: Record<DramaticPresetName, PresetMeta> = {
  SHOCK_1: {
    id: 'SHOCK_1',
    category: 'SHOCK',
    label: 'Shock 1 (Audio 30)',
    sourceSerial: 'Chandanamazha / Chembarathi',
    maxDuration: 8.0,
    gainTrim: 0.95,
  },
  SHOCK_2: {
    id: 'SHOCK_2',
    category: 'SHOCK',
    label: 'Shock 2 (Audio 26)',
    sourceSerial: 'Chembaneer Poovu / Sthreedhanam',
    maxDuration: 8.0,
    gainTrim: 0.90,
  },
  SHOCK_3: {
    id: 'SHOCK_3',
    category: 'SHOCK',
    label: 'Shock 3 (Audio 23)',
    sourceSerial: 'Chandanamazha / Mounaragam',
    maxDuration: 8.0,
    gainTrim: 0.95,
  },
  VILLAIN_1: {
    id: 'VILLAIN_1',
    category: 'VILLAIN',
    label: 'Villain 1 (Audio 29)',
    sourceSerial: 'Chembarathi / Mounaragam',
    maxDuration: 8.0,
    gainTrim: 0.88,
  },
  VILLAIN_2: {
    id: 'VILLAIN_2',
    category: 'VILLAIN',
    label: 'Villain 2 (Aleena BGM)',
    sourceSerial: 'Mazha Thorum Munpe (Aleena)',
    maxDuration: 8.0,
    gainTrim: 0.85,
  },
  VILLAIN_3: {
    id: 'VILLAIN_3',
    category: 'VILLAIN',
    label: 'Villain 3 (Elsamma BGM)',
    sourceSerial: 'Mazha Thorum Munpe (Elsamma)',
    maxDuration: 8.0,
    gainTrim: 0.85,
  },
  SAD_1: {
    id: 'SAD_1',
    category: 'SAD',
    label: 'Sad 1 (Audio 33)',
    sourceSerial: 'Patharamattu / Mounaragam',
    maxDuration: 8.0,
    gainTrim: 0.95,
  },
  SAD_2: {
    id: 'SAD_2',
    category: 'SAD',
    label: 'Sad 2 (Audio 32)',
    sourceSerial: 'Amme Mookambika / Kudumbasree',
    maxDuration: 8.0,
    gainTrim: 0.90,
  },
  SAD_3: {
    id: 'SAD_3',
    category: 'SAD',
    label: 'Sad 3 (Mizhi Randilum)',
    sourceSerial: 'Mizhi Randilum / Thirumangalyam',
    maxDuration: 8.0,
    gainTrim: 0.88,
  },
  SUSPENSE_1: {
    id: 'SUSPENSE_1',
    category: 'SUSPENSE',
    label: 'Suspense 1 (Audio 36)',
    sourceSerial: 'Chattambi Paaru / Patharamattu',
    maxDuration: 8.0,
    gainTrim: 0.85,
  },
  SUSPENSE_2: {
    id: 'SUSPENSE_2',
    category: 'SUSPENSE',
    label: 'Suspense 2 (Audio 21)',
    sourceSerial: 'Ramadevi / Chembarathi',
    maxDuration: 8.0,
    gainTrim: 0.85,
  },
  CLIFFHANGER_1: {
    id: 'CLIFFHANGER_1',
    category: 'CLIFFHANGER',
    label: 'Cliffhanger (Audio 38)',
    sourceSerial: 'Patharamattu / Krishnagadha',
    maxDuration: 8.0,
    gainTrim: 0.95,
  },
  ENTRANCE_STING: {
    id: 'ENTRANCE_STING',
    category: 'VILLAIN',
    label: 'Entrance (Audio 35)',
    sourceSerial: 'Amme Mookambike (Divine Arrival)',
    maxDuration: 8.0,
    gainTrim: 0.85,
  },
  EXIT_STING: {
    id: 'EXIT_STING',
    category: 'SAD',
    label: 'Exit (Audio 34)',
    sourceSerial: 'Parasparam / Swayamvara Panthal',
    maxDuration: 8.0,
    gainTrim: 0.85,
  },
  HAPPY_1: {
    id: 'HAPPY_1',
    category: 'ROMANTIC',
    label: 'Happy (Audio 20)',
    sourceSerial: 'Happy Vibe / Ponnambili',
    maxDuration: 8.0,
    gainTrim: 0.80,
  },
};

const PRIORITY_MAP: Record<string, number> = {
  SHOCK: 100,
  VILLAIN: 85,
  CLIFFHANGER: 80,
  SUSPENSE: 70,
  SAD: 60,
  ROMANTIC: 50,
  COMEDY: 40,
  NONE: 0,
};

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private synthesizer: SerialSynthesizer | null = null;
  private masterGain: GainNode | null = null;
  private currentPriority = 0;
  private currentTrackTimeout: number | null = null;
  private volume = 0.85;
  private muted = false;
  private currentPlayingPreset: DramaticPresetName | null = null;
  private onStateChangeListeners: Array<() => void> = [];
  private bufferCache: Map<string, AudioBuffer | null> = new Map();
  private currentBufferSource: AudioBufferSourceNode | null = null;
  private currentGainNode: GainNode | null = null;

  private ensureContext(): { ctx: AudioContext; synth: SerialSynthesizer; masterGain: GainNode } {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.synthesizer = new SerialSynthesizer(this.ctx);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    return {
      ctx: this.ctx,
      synth: this.synthesizer!,
      masterGain: this.masterGain!,
    };
  }

  /**
   * Loads and decodes custom Malayalam serial MP3/WAV files from /audio_samples/
   */
  private async loadAudioBuffer(baseName: string, ctx: AudioContext): Promise<AudioBuffer | null> {
    if (this.bufferCache.has(baseName)) {
      return this.bufferCache.get(baseName) || null;
    }

    const urls = [`/audio_samples/${baseName}.mp3`, `/audio_samples/${baseName}.wav`];
    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
          this.bufferCache.set(baseName, audioBuffer);
          return audioBuffer;
        }
      } catch (e) {
        // Fallback to next candidate
      }
    }

    this.bufferCache.set(baseName, null);
    return null;
  }

  onStateChange(cb: () => void): () => void {
    this.onStateChangeListeners.push(cb);
    return () => {
      this.onStateChangeListeners = this.onStateChangeListeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.onStateChangeListeners.forEach((cb) => cb());
  }

  async playPreset(name: DramaticPresetName, customVolume?: number): Promise<void> {
    const { ctx, synth, masterGain } = this.ensureContext();
    const config = PRESET_CALIBRATION[name];
    const category = config?.category || 'NONE';
    const priority = PRIORITY_MAP[category] || 50;

    // Strict priority hierarchy: Low priority sounds cannot override high priority sounds
    if (this.currentPlayingPreset && priority < this.currentPriority && category !== 'SHOCK') {
      return;
    }

    // Stop and crossfade previous audio (rapid 80ms fade if shock, else 150ms)
    const fadeOutTime = category === 'SHOCK' ? 80 : 150;
    this.stop(fadeOutTime);

    this.currentPriority = priority;
    this.currentPlayingPreset = name;
    this.notify();

    const baseName = name.toLowerCase();
    const baseVol = customVolume !== undefined ? customVolume : 1.0;
    const finalVol = Math.max(0.1, Math.min(1.0, baseVol * (config?.gainTrim || 1.0)));

    let duration = config?.maxDuration || 5.0;

    // Check if custom audio file is present in /audio_samples/
    const customBuffer = await this.loadAudioBuffer(baseName, ctx);

    if (customBuffer) {
      const source = ctx.createBufferSource();
      source.buffer = customBuffer;

      const pGain = ctx.createGain();
      const now = ctx.currentTime;
      // Smooth 50ms fade-in to prevent digital click
      pGain.gain.setValueAtTime(0.001, now);
      pGain.gain.linearRampToValueAtTime(finalVol, now + 0.05);

      // Strictly cap all audio playback to 8.0 seconds max with smooth 500ms fade-out
      const playDuration = Math.min(8.0, customBuffer.duration);
      const fadeStartTime = Math.max(0.2, playDuration - 0.5);
      pGain.gain.setValueAtTime(finalVol, now + fadeStartTime);
      pGain.gain.linearRampToValueAtTime(0.001, now + playDuration);

      source.connect(pGain);
      pGain.connect(masterGain);
      source.start(0);
      source.stop(now + playDuration + 0.05);

      this.currentBufferSource = source;
      this.currentGainNode = pGain;
      duration = playDuration;
    } else {
      // Synthesizer fallback if file is somehow missing
      switch (name) {
        case 'SHOCK_1':
        case 'SHOCK_3':
          duration = synth.playShock1(finalVol, masterGain);
          break;
        case 'SHOCK_2':
          duration = synth.playShock2(finalVol, masterGain);
          break;
        case 'VILLAIN_1':
          duration = synth.playVillain1(finalVol, masterGain);
          break;
        case 'VILLAIN_2':
          duration = synth.playVillain2(finalVol, masterGain);
          break;
        case 'VILLAIN_3':
          duration = synth.playVillain3(finalVol, masterGain);
          break;
        case 'SAD_1':
          duration = synth.playSad1(finalVol, masterGain);
          break;
        case 'SAD_2':
          duration = synth.playSad2(finalVol, masterGain);
          break;
        case 'SAD_3':
          duration = synth.playSad3(finalVol, masterGain);
          break;
        case 'SUSPENSE_1':
          duration = synth.playSuspense1(finalVol, masterGain);
          break;
        case 'SUSPENSE_2':
          duration = synth.playSuspense2(finalVol, masterGain);
          break;
        case 'CLIFFHANGER_1':
          duration = synth.playCliffhanger1(finalVol, masterGain);
          break;
        case 'ENTRANCE_STING':
          duration = synth.playEntranceSting(finalVol, masterGain);
          break;
        case 'EXIT_STING':
          duration = synth.playExitSting(finalVol, masterGain);
          break;
        case 'HAPPY_1':
          duration = synth.playRomantic1(finalVol, masterGain);
          break;
      }
    }

    this.currentTrackTimeout = window.setTimeout(() => {
      this.currentPlayingPreset = null;
      this.currentPriority = 0;
      this.notify();
    }, duration * 1000);
  }

  playCategory(category: AudioCategory, intensity = 80): void {
    if (category === 'NONE') return;
    const vol = Math.min(1.0, Math.max(0.3, intensity / 100));

    switch (category) {
      case 'SHOCK': {
        const presets: DramaticPresetName[] = ['SHOCK_1', 'SHOCK_2', 'SHOCK_3'];
        this.playPreset(presets[Math.floor(Math.random() * presets.length)], vol);
        break;
      }
      case 'VILLAIN': {
        const presets: DramaticPresetName[] = ['VILLAIN_1', 'VILLAIN_2', 'VILLAIN_3'];
        this.playPreset(presets[Math.floor(Math.random() * presets.length)], vol);
        break;
      }
      case 'SAD': {
        const presets: DramaticPresetName[] = ['SAD_1', 'SAD_2', 'SAD_3'];
        this.playPreset(presets[Math.floor(Math.random() * presets.length)], vol);
        break;
      }
      case 'SUSPENSE': {
        const presets: DramaticPresetName[] = ['SUSPENSE_1', 'SUSPENSE_2'];
        this.playPreset(presets[Math.floor(Math.random() * presets.length)], vol);
        break;
      }
      case 'CLIFFHANGER':
        this.playPreset('CLIFFHANGER_1', vol);
        break;
      case 'ROMANTIC':
      case 'COMEDY':
        this.playPreset('HAPPY_1', vol);
        break;
    }
  }

  stop(fadeMs = 150): void {
    if (this.currentTrackTimeout) {
      clearTimeout(this.currentTrackTimeout);
      this.currentTrackTimeout = null;
    }

    const fadeSec = fadeMs / 1000;
    if (this.ctx && this.currentGainNode) {
      this.currentGainNode.gain.setTargetAtTime(0, this.ctx.currentTime, fadeSec);
    }

    if (this.currentBufferSource) {
      try {
        this.currentBufferSource.stop(this.ctx ? this.ctx.currentTime + fadeSec : 0);
      } catch (e) {}
      this.currentBufferSource = null;
      this.currentGainNode = null;
    }

    if (this.synthesizer) {
      this.synthesizer.stopAll(fadeMs);
    }

    this.currentPlayingPreset = null;
    this.currentPriority = 0;
    this.notify();
  }

  setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.muted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        this.muted ? 0 : this.volume,
        this.ctx.currentTime,
        0.05
      );
    }
    this.notify();
    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  getCurrentPreset(): DramaticPresetName | null {
    return this.currentPlayingPreset;
  }

  isPlaying(): boolean {
    return this.currentPlayingPreset !== null;
  }
}
