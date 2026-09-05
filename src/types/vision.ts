import { ExpressionState } from '../config/constants';

export interface BoundingBox {
  xMin: number;
  yMin: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export interface ExpressionScores {
  neutral: number;
  happy: number;
  sad: number;
  angry: number;
  surprised: number;
  fearful: number;
  disgusted: number;
}

export interface TrackedFaceState {
  faceId: string; // e.g. "Face 1", "Face 2"
  firstSeen: number; // Timestamp ms
  lastSeen: number; // Timestamp ms
  presenceDurationMs: number;
  
  // Spatial
  boundingBox: BoundingBox;
  headYaw: number; // Head rotation estimate (-90 to +90 degrees)
  
  // Expression
  currentExpression: ExpressionState;
  previousExpression: ExpressionState;
  stableExpression: ExpressionState;
  stableExpressionStartTime: number;
  expressionConfidence: number; // 0.0 to 1.0
  expressionIntensity: number; // 0.0 to 1.0
  expressionScores: ExpressionScores;
  
  // Cooldown / Timing
  lastEventTimestamp: number;
  blendshapes: Record<string, number>;
}

export interface FaceInteractionState {
  facingEachOther: boolean;
  simultaneousReaction: boolean;
  recentEntranceTriggeredChange: boolean;
}

