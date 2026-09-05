import { TrackedFace, ExpressionType, FaceBoundingBox } from '../types/vision';
import { SERIAL_CONFIG } from '../config';
import { ExpressionClassifier } from './expressionClassifier';
import { ExpressionChangeEvent } from '../types/events';

interface ExpressionSample {
  timestamp: number;
  expression: ExpressionType;
  confidence: number;
  intensity: number;
}

interface InternalTrackedFace {
  faceId: string;
  rawIndex: number;
  boundingBox: FaceBoundingBox;
  facingDirection: 'center' | 'left' | 'right';
  firstSeen: number;
  lastSeen: number;
  currentExpression: ExpressionType;
  previousStableExpression: ExpressionType;
  stableSince: number;
  expressionConfidence: number;
  expressionIntensity: number;
  blendshapes: Record<string, number>;
  expressionScores: Record<ExpressionType, number>;
  lastEventTimestamp: number;
  history: ExpressionSample[];
}

export class TemporalTracker {
  private faces: Map<string, InternalTrackedFace> = new Map();
  private nextId = 1;
  private classifier = new ExpressionClassifier();

  /**
   * Process raw MediaPipe detection results for a frame.
   */
  processFrame(
    rawFacesLandmarks: Array<Array<{ x: number; y: number; z: number }>>,
    rawBlendshapes: Array<{ categories: Array<{ categoryName: string; score: number }> }>,
    timestamp: number
  ): {
    trackedFaces: TrackedFace[];
    expressionEvents: ExpressionChangeEvent[];
  } {
    const detectedCount = rawFacesLandmarks.length;
    const matchedFaceIds = new Set<string>();
    const expressionEvents: ExpressionChangeEvent[] = [];

    // Parse each raw face from MediaPipe
    const currentFrameDetections = rawFacesLandmarks.map((landmarks, index) => {
      // 1. Calculate Bounding Box
      let xMin = 1, yMin = 1, xMax = 0, yMax = 0;
      for (const pt of landmarks) {
        if (pt.x < xMin) xMin = pt.x;
        if (pt.x > xMax) xMax = pt.x;
        if (pt.y < yMin) yMin = pt.y;
        if (pt.y > yMax) yMax = pt.y;
      }
      const width = Math.max(0.05, xMax - xMin);
      const height = Math.max(0.05, yMax - yMin);
      const centerX = xMin + width / 2;
      const centerY = yMin + height / 2;

      // 2. Head Facing Direction (Nose tip relative to eye corners)
      // Landmark 1: Nose tip, 33: Left eye outer, 263: Right eye outer
      const nose = landmarks[1];
      const leftEye = landmarks[33];
      const rightEye = landmarks[263];
      let facingDirection: 'center' | 'left' | 'right' = 'center';
      if (nose && leftEye && rightEye) {
        const eyeSpan = Math.abs(rightEye.x - leftEye.x);
        const noseRelative = (nose.x - Math.min(leftEye.x, rightEye.x)) / (eyeSpan || 0.01);
        if (noseRelative < 0.35) facingDirection = 'left';
        else if (noseRelative > 0.65) facingDirection = 'right';
      }

      // 3. Blendshapes Map
      const blendshapeMap: Record<string, number> = {};
      if (rawBlendshapes[index]?.categories) {
        for (const cat of rawBlendshapes[index].categories) {
          blendshapeMap[cat.categoryName] = cat.score;
        }
      }

      // 4. Expression Classification
      const analysis = this.classifier.classify(blendshapeMap);

      return {
        boundingBox: { xMin, yMin, width, height, centerX, centerY },
        facingDirection,
        blendshapeMap,
        analysis,
      };
    });

    // Match detections with existing tracked faces
    for (const detection of currentFrameDetections) {
      let bestMatchId: string | null = null;
      let minDistance = 0.28; // Max normalized distance threshold

      for (const [id, face] of this.faces.entries()) {
        if (matchedFaceIds.has(id)) continue;
        const dx = face.boundingBox.centerX - detection.boundingBox.centerX;
        const dy = face.boundingBox.centerY - detection.boundingBox.centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < minDistance) {
          minDistance = dist;
          bestMatchId = id;
        }
      }

      let faceId: string;
      let internalFace: InternalTrackedFace;

      if (bestMatchId) {
        faceId = bestMatchId;
        internalFace = this.faces.get(faceId)!;
        matchedFaceIds.add(faceId);

        // Update spatial values
        internalFace.boundingBox = detection.boundingBox;
        internalFace.facingDirection = detection.facingDirection;
        internalFace.blendshapes = detection.blendshapeMap;
        internalFace.expressionScores = detection.analysis.scores;
        internalFace.lastSeen = timestamp;
      } else {
        // New face detected
        faceId = `Face ${this.nextId++}`;
        matchedFaceIds.add(faceId);

        internalFace = {
          faceId,
          rawIndex: this.faces.size,
          boundingBox: detection.boundingBox,
          facingDirection: detection.facingDirection,
          firstSeen: timestamp,
          lastSeen: timestamp,
          currentExpression: detection.analysis.dominantExpression,
          previousStableExpression: detection.analysis.dominantExpression,
          stableSince: timestamp,
          expressionConfidence: detection.analysis.confidence,
          expressionIntensity: detection.analysis.intensity,
          blendshapes: detection.blendshapeMap,
          expressionScores: detection.analysis.scores,
          lastEventTimestamp: 0,
          history: [],
        };
        this.faces.set(faceId, internalFace);
      }

      // Append to rolling history
      internalFace.history.push({
        timestamp,
        expression: detection.analysis.dominantExpression,
        confidence: detection.analysis.confidence,
        intensity: detection.analysis.intensity,
      });

      // Prune history older than TEMPORAL_ROLLING_WINDOW_MS
      const cutoff = timestamp - SERIAL_CONFIG.TEMPORAL_ROLLING_WINDOW_MS;
      internalFace.history = internalFace.history.filter((s) => s.timestamp >= cutoff);

      // Update current instantaneous expression values
      internalFace.expressionConfidence = detection.analysis.confidence;
      internalFace.expressionIntensity = detection.analysis.intensity;

      // Temporal stability analysis
      const recentSamples = internalFace.history.filter(
        (s) => s.timestamp >= timestamp - SERIAL_CONFIG.STABLE_EXPRESSION_DURATION_MS
      );

      // Check if candidate expression is consistently maintained
      const expressionCounts = new Map<ExpressionType, number>();
      for (const sample of recentSamples) {
        if (sample.confidence >= SERIAL_CONFIG.EXPRESSION_CONFIDENCE_THRESHOLD) {
          expressionCounts.set(sample.expression, (expressionCounts.get(sample.expression) || 0) + 1);
        }
      }

      let candidateStable: ExpressionType | null = null;
      let maxCount = 0;
      const totalSamples = recentSamples.length || 1;

      for (const [expr, count] of expressionCounts.entries()) {
        if (count / totalSamples >= 0.50 && count > maxCount) {
          maxCount = count;
          candidateStable = expr;
        }
      }

      // Check if expression transitioned
      if (candidateStable && candidateStable !== internalFace.currentExpression) {
        const oldExpression = internalFace.currentExpression;
        const changeMagnitude = Math.abs(
          detection.analysis.intensity - (internalFace.expressionIntensity || 0.5)
        ) + 0.35;

        // Check if cooldown has elapsed
        const timeSinceLastEvent = timestamp - internalFace.lastEventTimestamp;
        if (
          timeSinceLastEvent >= SERIAL_CONFIG.EVENT_COOLDOWN_MS &&
          changeMagnitude >= SERIAL_CONFIG.EXPRESSION_CHANGE_THRESHOLD
        ) {
          const isSudden = recentSamples.length > 0 && 
            recentSamples[0].expression !== candidateStable;

          const event: ExpressionChangeEvent = {
            id: `expr_${faceId}_${timestamp}`,
            type: isSudden ? 'SUDDEN_EXPRESSION_CHANGE' : 'EXPRESSION_CHANGED',
            faceId,
            timestamp,
            formattedTime: new Date(timestamp).toLocaleTimeString(),
            previousExpression: oldExpression,
            newExpression: candidateStable,
            confidence: detection.analysis.confidence,
            intensity: detection.analysis.intensity,
            changeMagnitude,
            description: `${faceId}: ${oldExpression} ➔ ${candidateStable} (${Math.round(
              detection.analysis.confidence * 100
            )}% confidence)`,
          };

          expressionEvents.push(event);
          internalFace.lastEventTimestamp = timestamp;
        }

        internalFace.previousStableExpression = oldExpression;
        internalFace.currentExpression = candidateStable;
        internalFace.stableSince = timestamp;
      }
    }

    // Convert internal tracked faces to public TrackedFace array
    const trackedFaces: TrackedFace[] = [];
    for (const face of this.faces.values()) {
      // If detected in the current frame or within 1000ms
      if (timestamp - face.lastSeen <= SERIAL_CONFIG.PERSON_EXIT_CONFIRMATION_MS) {
        trackedFaces.push({
          faceId: face.faceId,
          rawIndex: face.rawIndex,
          boundingBox: face.boundingBox,
          facingDirection: face.facingDirection,
          firstSeen: face.firstSeen,
          lastSeen: face.lastSeen,
          presenceDuration: timestamp - face.firstSeen,
          currentExpression: face.currentExpression,
          previousStableExpression: face.previousStableExpression,
          expressionConfidence: face.expressionConfidence,
          expressionIntensity: face.expressionIntensity,
          changeMagnitude: 0,
          blendshapes: face.blendshapes,
          expressionScores: face.expressionScores,
          lastEventTimestamp: face.lastEventTimestamp,
        });
      }
    }

    return { trackedFaces, expressionEvents };
  }

  removeFace(faceId: string): void {
    this.faces.delete(faceId);
  }

  reset(): void {
    this.faces.clear();
    this.nextId = 1;
  }
}
