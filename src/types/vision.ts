export type ExpressionType = 
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'angry'
  | 'surprised'
  | 'fearful'
  | 'disgusted';

export interface FaceBoundingBox {
  xMin: number; // Normalized 0-1
  yMin: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export interface TrackedFace {
  faceId: string; // e.g. "Face 1"
  rawIndex: number;
  boundingBox: FaceBoundingBox;
  facingDirection: 'center' | 'left' | 'right';
  firstSeen: number;
  lastSeen: number;
  presenceDuration: number;
  currentExpression: ExpressionType;
  previousStableExpression: ExpressionType;
  expressionConfidence: number;
  expressionIntensity: number;
  changeMagnitude: number;
  blendshapes: Record<string, number>;
  expressionScores: Record<ExpressionType, number>;
  lastEventTimestamp: number;
}

export interface CameraState {
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  deviceId?: string;
  hasPermission: boolean;
}
