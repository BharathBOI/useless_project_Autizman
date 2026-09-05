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

export interface SerialSceneInterpretation {
  sceneType: SceneType;
  dramaticLevel: number; // 0 - 100
  headline: string;
  narration: string;
  audioCategory: AudioCategory;
  audioIntensity: number; // 0 - 100
  durationSeconds: number; // 3 - 12
  shouldInterruptCurrentAudio: boolean;
  source: 'gemini' | 'fallback';
}

export interface InterpretScenePayload {
  events: Array<{
    type: string;
    description: string;
    timestamp: number;
    details?: Record<string, any>;
  }>;
  charactersPresent: number;
  activeExpressions: Record<string, string>;
  recentContext?: string;
}
