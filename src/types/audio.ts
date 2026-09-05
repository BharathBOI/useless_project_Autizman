import { AudioCategory } from './llm';

export type DramaticAudioPreset =
  | 'VILLAIN_1'
  | 'VILLAIN_2'
  | 'VILLAIN_3'
  | 'SAD_1'
  | 'SAD_2'
  | 'SAD_3'
  | 'SUSPENSE_1'
  | 'SUSPENSE_2'
  | 'SHOCK_1'
  | 'SHOCK_2'
  | 'ROMANTIC_1'
  | 'COMEDY_1'
  | 'CLIFFHANGER_1'
  | 'ENTRANCE_STING'
  | 'EXIT_STING'
  | 'NONE';

export interface AudioEngineState {
  isMuted: boolean;
  masterVolume: number; // 0.0 to 1.0
  activePreset: DramaticAudioPreset;
  activeCategory: AudioCategory;
  isPlaying: boolean;
  intensity: number; // 0 to 100
}

