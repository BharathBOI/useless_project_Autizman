import { CONFIG } from '../config/constants';
import { VisionEvent } from '../types/events';
import { TrackedFaceState } from '../types/vision';

interface PendingPresence {
  faceId: string;
  firstDetectedTime: number;
  lastDetectedTime: number;
  isConfirmed: boolean;
}

export class PersonTracker {
  private activeConfirmedFaces: Map<string, PendingPresence> = new Map();
  private pendingEnterFaces: Map<string, PendingPresence> = new Map();
  private pendingExitFaces: Map<string, PendingPresence> = new Map();
  
  // Track recent entrance timestamps to correlate with expression changes
  private recentEntrances: { faceId: string; timestamp: number }[] = [];

  public update(currentFaces: TrackedFaceState[], now: number): VisionEvent[] {
    const events: VisionEvent[] = [];
    const currentFaceIds = new Set(currentFaces.map(f => f.faceId));
    const timeStr = new Date(now).toLocaleTimeString('en-US', { hour12: false });

    // 1. Process Entrances with 500ms Temporal Confirmation
    currentFaces.forEach(face => {
      const faceId = face.faceId;

      if (this.activeConfirmedFaces.has(faceId)) {
        // Face is already confirmed active
        const entry = this.activeConfirmedFaces.get(faceId)!;
        entry.lastDetectedTime = now;
        // Cancel pending exit if present
        this.pendingExitFaces.delete(faceId);
      } else {
        // Face is not confirmed active yet
        if (!this.pendingEnterFaces.has(faceId)) {
          this.pendingEnterFaces.set(faceId, {
            faceId,
            firstDetectedTime: now,
            lastDetectedTime: now,
            isConfirmed: false
          });
        } else {
          const pending = this.pendingEnterFaces.get(faceId)!;
          pending.lastDetectedTime = now;

          // Check if candidate face has remained present for 500ms+
          if (now - pending.firstDetectedTime >= CONFIG.PERSON_ENTER_CONFIRM_MS) {
            pending.isConfirmed = true;
            this.activeConfirmedFaces.set(faceId, pending);
            this.pendingEnterFaces.delete(faceId);
            this.recentEntrances.push({ faceId, timestamp: now });

            events.push({
              id: `enter_${faceId}_${now}`,
              type: 'PERSON_ENTERED',
              timestamp: now,
              timeFormatted: timeStr,
              newPerson: faceId,
              description: `${faceId} entered camera frame`
            });
          }
        }
      }
    });

    // 2. Process Exits with 1000ms Temporal Confirmation
    this.activeConfirmedFaces.forEach((active, faceId) => {
      if (!currentFaceIds.has(faceId)) {
        if (!this.pendingExitFaces.has(faceId)) {
          this.pendingExitFaces.set(faceId, {
            ...active,
            lastDetectedTime: now
          });
        } else {
          const pendingExit = this.pendingExitFaces.get(faceId)!;
          if (now - pendingExit.lastDetectedTime >= CONFIG.PERSON_EXIT_CONFIRM_MS) {
            // Confirmed Left!
            this.activeConfirmedFaces.delete(faceId);
            this.pendingExitFaces.delete(faceId);

            events.push({
              id: `left_${faceId}_${now}`,
              type: 'PERSON_LEFT',
              timestamp: now,
              timeFormatted: timeStr,
              personAffected: faceId,
              description: `${faceId} left camera frame`
            });

            if (this.activeConfirmedFaces.size === 0) {
              events.push({
                id: `all_left_${now}`,
                type: 'ALL_PEOPLE_LEFT',
                timestamp: now,
                timeFormatted: timeStr,
                description: 'All characters have left the frame'
              });
            }
          }
        }
      }
    });

    // Prune old entrance logs
    this.recentEntrances = this.recentEntrances.filter(e => now - e.timestamp <= CONFIG.INTERACTION_WINDOW_MS);

    // 3. Multi-Person Interaction Tracking
    if (currentFaces.length >= 2) {
      // Check head facing direction (e.g. Face 1 facing right toward Face 2, Face 2 facing left toward Face 1)
      for (let i = 0; i < currentFaces.length; i++) {
        for (let j = i + 1; j < currentFaces.length; j++) {
          const f1 = currentFaces[i];
          const f2 = currentFaces[j];

          // Determine who is left / right spatially
          const leftFace = f1.boundingBox.centerX < f2.boundingBox.centerX ? f1 : f2;
          const rightFace = f1.boundingBox.centerX < f2.boundingBox.centerX ? f2 : f1;

          // If left face is turned right (positive yaw) and right face is turned left (negative yaw)
          const leftFacingRight = leftFace.headYaw > 15;
          const rightFacingLeft = rightFace.headYaw < -15;

          if (leftFacingRight && rightFacingLeft) {
            events.push({
              id: `mutual_${leftFace.faceId}_${rightFace.faceId}_${now}`,
              type: 'MUTUAL_INTERACTION',
              timestamp: now,
              timeFormatted: timeStr,
              personAffected: leftFace.faceId,
              newPerson: rightFace.faceId,
              description: `${leftFace.faceId} and ${rightFace.faceId} are looking directly toward each other`
            });
          }
        }
      }
    }

    return events;
  }

  /**
   * Check if a recent entrance caused a person's expression to change
   */
  public checkForEntranceCausedChange(expressionEvent: VisionEvent): VisionEvent | null {
    if (!expressionEvent.personAffected) return null;

    const affectedFace = expressionEvent.personAffected;
    const now = expressionEvent.timestamp;

    // Find any new person who entered within the last 1.5 seconds
    const causeEntrance = this.recentEntrances.find(
      e => e.faceId !== affectedFace && (now - e.timestamp) <= CONFIG.INTERACTION_WINDOW_MS
    );

    if (causeEntrance) {
      return {
        id: `caused_${affectedFace}_by_${causeEntrance.faceId}_${now}`,
        type: 'NEW_PERSON_CAUSED_EXPRESSION_CHANGE',
        timestamp: now,
        timeFormatted: expressionEvent.timeFormatted,
        personAffected: affectedFace,
        newPerson: causeEntrance.faceId,
        previousExpression: expressionEvent.previousExpression,
        newExpression: expressionEvent.newExpression,
        description: `${affectedFace} changed expression to ${expressionEvent.newExpression} right after ${causeEntrance.faceId} entered!`
      };
    }

    return null;
  }

  public reset(): void {
    this.activeConfirmedFaces.clear();
    this.pendingEnterFaces.clear();
    this.pendingExitFaces.clear();
    this.recentEntrances = [];
  }
}

export const personTracker = new PersonTracker();

