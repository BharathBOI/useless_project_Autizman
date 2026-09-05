// SERIALOS Configuration & Thresholds

export const CONFIG = {
  // Vision & Face Tracking
  MAX_FACES: 5,
  FACE_MATCH_DISTANCE_THRESHOLD: 0.25, // Spatial distance to maintain faceId persistence (normalized 0-1)
  
  // Expression Detection & Temporal Thresholds
  EXPRESSION_CONFIDENCE_THRESHOLD: 0.55,
  STABLE_EXPRESSION_DURATION_MS: 500,
  EXPRESSION_CHANGE_THRESHOLD: 0.30,
  EVENT_COOLDOWN_MS: 2500,
  
  // Person Entrance / Exit Temporal Confirmation
  PERSON_ENTER_CONFIRM_MS: 500,
  PERSON_EXIT_CONFIRM_MS: 1000,
  
  // Multi-person Interaction Windows
  INTERACTION_WINDOW_MS: 1500, // E.g. expression change within 1.5s of new face entry
  FACING_ANGLE_THRESHOLD: 45, // Head yaw difference estimation
  
  // LLM Throttle & Debounce
  LLM_THROTTLE_MS: 1500,
  
  // Detection Frame Rate (FPS)
  TARGET_FPS: 15,
};

// Expression State Enums
export type ExpressionState = 
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'angry'
  | 'surprised'
  | 'fearful'
  | 'disgusted';

export const EXPRESSION_STATES: ExpressionState[] = [
  'neutral',
  'happy',
  'sad',
  'angry',
  'surprised',
  'fearful',
  'disgusted'
];

