export type SceneType =
  | 'NORMAL'
  | 'VILLAIN_ENTRANCE'
  | 'SHOCK'
  | 'BETRAYAL'
  | 'SAD_REVELATION'
  | 'EMOTIONAL_CONFRONTATION'
  | 'ROMANTIC_TENSION'
  | 'SUSPICIOUS_ARRIVAL'
  | 'COMIC_RELIEF'
  | 'CLIFFHANGER'
  | 'CHARACTER_EXIT'
  | 'GENERAL_DRAMA';

export type AudioCategory =
  | 'NONE'
  | 'VILLAIN'
  | 'SUSPENSE'
  | 'SAD'
  | 'SHOCK'
  | 'ROMANTIC'
  | 'COMEDY'
  | 'CLIFFHANGER';

export interface DramaticScene {
  sceneType: SceneType;
  dramaticLevel: number; // 0 - 100
  headline: string; // E.g. "THE UNEXPECTED ARRIVAL"
  narration: string; // E.g. "A suspicious presence has entered the scene..."
  audioCategory: AudioCategory;
  audioIntensity: number; // 0 - 100
  durationSeconds: number; // 3 - 12
  shouldInterruptCurrentAudio: boolean;
  timestamp?: number;
  isFallback?: boolean;
}

export interface LLMInterpreterResponse {
  fallback: boolean;
  reason?: string;
  scene?: DramaticScene;
}

