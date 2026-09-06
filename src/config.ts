/**
 * SERIALOS Configuration Constants
 * Fine-tuned for exaggerated Indian/Malayalam TV serial drama detection.
 */

export const SERIAL_CONFIG = {
  // Detection rates
  VISION_FPS: 20, // Approximately 15-20 FPS for smooth face tracking
  TEMPORAL_ROLLING_WINDOW_MS: 1500, // 1.5s history buffer for smoothing

  // Face persistence & presence
  PERSON_ENTER_CONFIRMATION_MS: 500, // Face must remain detected for 500ms to be classified as ENTERED
  PERSON_EXIT_CONFIRMATION_MS: 1000, // Missing face must remain missing for 1000ms before classified as LEFT
  MAX_TRACKED_FACES: 5,

  // Expression thresholds
  EXPRESSION_CONFIDENCE_THRESHOLD: 0.48, // Calibrated for responsive emotion detection
  STABLE_EXPRESSION_DURATION_MS: 400, // 400ms stable hold required to trigger transition
  EXPRESSION_CHANGE_THRESHOLD: 0.28, // Change magnitude required to trigger transition
  EVENT_COOLDOWN_MS: 2400, // Prevent spamming same event

  // LLM Request throttling
  LLM_THROTTLE_MS: 1800, // At most one LLM request every 1.8 seconds

  // Blendshape scoring weights
  BLENDSHAPES: {
    HAPPY: {
      mouthSmileLeft: 0.5,
      mouthSmileRight: 0.5,
      mouthDimpleLeft: 0.2,
      mouthDimpleRight: 0.2,
    },
    SAD: {
      mouthFrownLeft: 0.5,
      mouthFrownRight: 0.5,
      browInnerUp: 0.4,
      mouthLowerDownLeft: 0.2,
      mouthLowerDownRight: 0.2,
    },
    ANGRY: {
      browDownLeft: 0.5,
      browDownRight: 0.5,
      eyeSquintLeft: 0.3,
      eyeSquintRight: 0.3,
      jawForward: 0.2,
      mouthPressLeft: 0.2,
    },
    SURPRISED: {
      eyeWideLeft: 0.45,
      eyeWideRight: 0.45,
      browOuterUpLeft: 0.3,
      browOuterUpRight: 0.3,
      jawOpen: 0.4,
      mouthFunnel: 0.2,
    },
    FEARFUL: {
      eyeWideLeft: 0.4,
      eyeWideRight: 0.4,
      browInnerUp: 0.4,
      mouthStretchLeft: 0.3,
      mouthStretchRight: 0.3,
    },
    DISGUSTED: {
      noseSneerLeft: 0.5,
      noseSneerRight: 0.5,
      mouthUpperUpLeft: 0.3,
      mouthUpperUpRight: 0.3,
    },
  },
};
