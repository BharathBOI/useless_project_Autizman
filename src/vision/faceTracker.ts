import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { CONFIG } from '../config/constants';
import { BoundingBox, TrackedFaceState } from '../types/vision';
import { classifyExpression } from './expressionClassifier';

export class FaceTrackerEngine {
  private landmarker: FaceLandmarker | null = null;
  private isInitializing: boolean = false;
  private trackedFaces: Map<string, TrackedFaceState> = new Map();
  private nextFaceIdCounter: number = 1;

  public async initialize(): Promise<void> {
    if (this.landmarker || this.isInitializing) return;

    this.isInitializing = true;
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
      );

      this.landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
          delegate: 'GPU'
        },
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true,
        runningMode: 'VIDEO',
        numFaces: CONFIG.MAX_FACES
      });

      console.log('✅ [SERIALOS FaceTracker] MediaPipe FaceLandmarker loaded successfully.');
    } catch (err) {
      console.warn('⚠️ [SERIALOS FaceTracker] GPU initialization failed. Falling back to CPU delegate.', err);
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
        );
        this.landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: 'CPU'
          },
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
          runningMode: 'VIDEO',
          numFaces: CONFIG.MAX_FACES
        });
        console.log('✅ [SERIALOS FaceTracker] MediaPipe FaceLandmarker loaded on CPU.');
      } catch (cpuErr) {
        console.error('❌ [SERIALOS FaceTracker] Failed to initialize MediaPipe FaceLandmarker:', cpuErr);
        throw cpuErr;
      }
    } finally {
      this.isInitializing = false;
    }
  }

  public detectFaces(videoElement: HTMLVideoElement, timestampMs: number): TrackedFaceState[] {
    if (!this.landmarker) return [];

    const result = this.landmarker.detectForVideo(videoElement, timestampMs);
    const currentDetectedFaces: {
      boundingBox: BoundingBox;
      blendshapes: Record<string, number>;
      headYaw: number;
    }[] = [];

    if (result.faceLandmarks && result.faceLandmarks.length > 0) {
      for (let i = 0; i < result.faceLandmarks.length; i++) {
        const landmarks = result.faceLandmarks[i];
        
        // Calculate normalized bounding box
        let xMin = 1, yMin = 1, xMax = 0, yMax = 0;
        landmarks.forEach(lm => {
          if (lm.x < xMin) xMin = lm.x;
          if (lm.x > xMax) xMax = lm.x;
          if (lm.y < yMin) yMin = lm.y;
          if (lm.y > yMax) yMax = lm.y;
        });

        const width = xMax - xMin;
        const height = yMax - yMin;
        const centerX = xMin + width / 2;
        const centerY = yMin + height / 2;

        const boundingBox: BoundingBox = {
          xMin, yMin, width, height, centerX, centerY
        };

        // Parse Blendshapes into a dictionary
        const blendshapesDict: Record<string, number> = {};
        if (result.faceBlendshapes && result.faceBlendshapes[i]) {
          result.faceBlendshapes[i].categories.forEach(cat => {
            blendshapesDict[cat.categoryName] = cat.score;
          });
        }

        // Estimate head yaw rotation using nose tip & cheek landmarks
        // Landmark 1 is nose tip, landmark 234 is left ear, landmark 454 is right ear
        let headYaw = 0;
        if (landmarks[1] && landmarks[234] && landmarks[454]) {
          const noseX = landmarks[1].x;
          const leftX = landmarks[234].x;
          const rightX = landmarks[454].x;
          const faceWidth = Math.max(0.001, rightX - leftX);
          const ratio = (noseX - leftX) / faceWidth; // ~0.5 when facing forward
          headYaw = Math.round((ratio - 0.5) * 180);
        }

        currentDetectedFaces.push({
          boundingBox,
          blendshapes: blendshapesDict,
          headYaw
        });
      }
    }

    // Match currently detected faces to existing tracked face IDs based on center distance
    const updatedTrackedFaces: TrackedFaceState[] = [];
    const matchedTrackedIds = new Set<string>();

    currentDetectedFaces.forEach(detected => {
      let bestMatchId: string | null = null;
      let minDistance = CONFIG.FACE_MATCH_DISTANCE_THRESHOLD;

      this.trackedFaces.forEach((tracked, faceId) => {
        if (matchedTrackedIds.has(faceId)) return;
        
        const dx = detected.boundingBox.centerX - tracked.boundingBox.centerX;
        const dy = detected.boundingBox.centerY - tracked.boundingBox.centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < minDistance) {
          minDistance = dist;
          bestMatchId = faceId;
        }
      });

      const classified = classifyExpression(detected.blendshapes);

      if (bestMatchId) {
        // Update existing tracked face
        matchedTrackedIds.add(bestMatchId);
        const existing = this.trackedFaces.get(bestMatchId)!;
        
        const isSameExpression = existing.stableExpression === classified.dominantExpression;
        const stableStartTime = isSameExpression 
          ? existing.stableExpressionStartTime 
          : timestampMs;

        const updated: TrackedFaceState = {
          ...existing,
          lastSeen: timestampMs,
          presenceDurationMs: timestampMs - existing.firstSeen,
          boundingBox: detected.boundingBox,
          headYaw: detected.headYaw,
          currentExpression: classified.dominantExpression,
          previousExpression: existing.currentExpression,
          stableExpression: classified.dominantExpression,
          stableExpressionStartTime: stableStartTime,
          expressionConfidence: classified.confidence,
          expressionIntensity: classified.intensity,
          expressionScores: classified.scores,
          blendshapes: detected.blendshapes
        };

        this.trackedFaces.set(bestMatchId, updated);
        updatedTrackedFaces.push(updated);
      } else {
        // Assign new Face ID
        const newFaceId = `Face ${this.nextFaceIdCounter++}`;
        matchedTrackedIds.add(newFaceId);

        const newFace: TrackedFaceState = {
          faceId: newFaceId,
          firstSeen: timestampMs,
          lastSeen: timestampMs,
          presenceDurationMs: 0,
          boundingBox: detected.boundingBox,
          headYaw: detected.headYaw,
          currentExpression: classified.dominantExpression,
          previousExpression: classified.dominantExpression,
          stableExpression: classified.dominantExpression,
          stableExpressionStartTime: timestampMs,
          expressionConfidence: classified.confidence,
          expressionIntensity: classified.intensity,
          expressionScores: classified.scores,
          lastEventTimestamp: 0,
          blendshapes: detected.blendshapes
        };

        this.trackedFaces.set(newFaceId, newFace);
        updatedTrackedFaces.push(newFace);
      }
    });

    // Remove face entries that have been missing for over 2.5 seconds
    this.trackedFaces.forEach((tracked, faceId) => {
      if (timestampMs - tracked.lastSeen > 2500) {
        this.trackedFaces.delete(faceId);
      }
    });

    return updatedTrackedFaces;
  }

  public reset(): void {
    this.trackedFaces.clear();
    this.nextFaceIdCounter = 1;
  }
}

export const faceTracker = new FaceTrackerEngine();

