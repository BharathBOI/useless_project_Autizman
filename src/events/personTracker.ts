import { TrackedFace } from '../types/vision';
import { PersonEnterEvent, PersonLeftEvent } from '../types/events';
import { SERIAL_CONFIG } from '../config';

interface CandidatePresence {
  faceId: string;
  firstDetectedTime: number;
  isConfirmedEntered: boolean;
  lastDetectedTime: number;
}

export class PersonTracker {
  private candidates: Map<string, CandidatePresence> = new Map();
  private confirmedFaces: Set<string> = new Set();
  private lastEnterTime: Map<string, number> = new Map();

  update(
    currentTrackedFaces: TrackedFace[],
    timestamp: number
  ): {
    enterEvents: PersonEnterEvent[];
    exitEvents: PersonLeftEvent[];
    confirmedCount: number;
    lastEnteredFaceId: string | null;
  } {
    const enterEvents: PersonEnterEvent[] = [];
    const exitEvents: PersonLeftEvent[] = [];
    let lastEnteredFaceId: string | null = null;

    const currentFaceIdSet = new Set(currentTrackedFaces.map((f) => f.faceId));

    // 1. Process active faces
    for (const face of currentTrackedFaces) {
      const candidate = this.candidates.get(face.faceId);
      if (!candidate) {
        // Newly observed face candidate
        this.candidates.set(face.faceId, {
          faceId: face.faceId,
          firstDetectedTime: timestamp,
          isConfirmedEntered: false,
          lastDetectedTime: timestamp,
        });
      } else {
        candidate.lastDetectedTime = timestamp;

        // Check if candidate has persisted long enough (500ms) to be confirmed ENTERED
        if (
          !candidate.isConfirmedEntered &&
          timestamp - candidate.firstDetectedTime >= SERIAL_CONFIG.PERSON_ENTER_CONFIRMATION_MS
        ) {
          candidate.isConfirmedEntered = true;
          this.confirmedFaces.add(face.faceId);
          this.lastEnterTime.set(face.faceId, timestamp);
          lastEnteredFaceId = face.faceId;

          enterEvents.push({
            id: `enter_${face.faceId}_${timestamp}`,
            type: 'PERSON_ENTERED',
            faceId: face.faceId,
            timestamp,
            formattedTime: new Date(timestamp).toLocaleTimeString(),
            totalFaces: this.confirmedFaces.size,
            description: `${face.faceId} entered the scene (${this.confirmedFaces.size} character${
              this.confirmedFaces.size > 1 ? 's' : ''
            } now present)`,
          });
        }
      }
    }

    // 2. Check for missing faces (must be missing for >= 1000ms)
    for (const [faceId, candidate] of Array.from(this.candidates.entries())) {
      if (!currentFaceIdSet.has(faceId)) {
        const timeMissing = timestamp - candidate.lastDetectedTime;
        if (timeMissing >= SERIAL_CONFIG.PERSON_EXIT_CONFIRMATION_MS) {
          if (candidate.isConfirmedEntered) {
            this.confirmedFaces.delete(faceId);

            const isAllGone = this.confirmedFaces.size === 0;
            exitEvents.push({
              id: `exit_${faceId}_${timestamp}`,
              type: isAllGone ? 'ALL_PEOPLE_LEFT' : 'PERSON_LEFT',
              faceId,
              timestamp,
              formattedTime: new Date(timestamp).toLocaleTimeString(),
              totalFaces: this.confirmedFaces.size,
              description: isAllGone
                ? `All characters have left the scene`
                : `${faceId} exited the scene (${this.confirmedFaces.size} remaining)`,
            });
          }

          this.candidates.delete(faceId);
          this.lastEnterTime.delete(faceId);
        }
      }
    }

    return {
      enterEvents,
      exitEvents,
      confirmedCount: this.confirmedFaces.size,
      lastEnteredFaceId,
    };
  }

  getLastEnterTime(faceId: string): number | undefined {
    return this.lastEnterTime.get(faceId);
  }

  reset(): void {
    this.candidates.clear();
    this.confirmedFaces.clear();
    this.lastEnterTime.clear();
  }
}
