import { TrackedFace } from '../types/vision';
import { SerialEvent } from '../types/events';
import { TemporalTracker } from '../vision/temporalTracker';
import { PersonTracker } from './personTracker';
import { InteractionDetector } from './interactionDetector';

export class EventEngine {
  private temporalTracker = new TemporalTracker();
  private personTracker = new PersonTracker();
  private interactionDetector = new InteractionDetector();

  private eventListeners: Array<(event: SerialEvent) => void> = [];

  onEvent(callback: (event: SerialEvent) => void): () => void {
    this.eventListeners.push(callback);
    return () => {
      this.eventListeners = this.eventListeners.filter((cb) => cb !== callback);
    };
  }

  processFrame(
    rawLandmarks: Array<Array<{ x: number; y: number; z: number }>>,
    rawBlendshapes: Array<{ categories: Array<{ categoryName: string; score: number }> }>,
    timestamp: number
  ): {
    trackedFaces: TrackedFace[];
    emittedEvents: SerialEvent[];
  } {
    // 1. Process temporal expression smoothing and face persistence
    const { trackedFaces, expressionEvents } = this.temporalTracker.processFrame(
      rawLandmarks,
      rawBlendshapes,
      timestamp
    );

    // 2. Process person enter / exit with 500ms/1000ms confirmation
    const { enterEvents, exitEvents, lastEnteredFaceId } = this.personTracker.update(
      trackedFaces,
      timestamp
    );

    // 3. Process multi-person interaction and correlation
    const lastEnterTime = lastEnteredFaceId 
      ? this.personTracker.getLastEnterTime(lastEnteredFaceId) || timestamp 
      : 0;

    const interactionEvents = this.interactionDetector.detectInteractions(
      trackedFaces,
      expressionEvents,
      lastEnteredFaceId,
      lastEnterTime,
      timestamp
    );

    // Combine all emitted events
    const emittedEvents: SerialEvent[] = [
      ...enterEvents,
      ...exitEvents,
      ...expressionEvents,
      ...interactionEvents,
    ];

    // Dispatch to listeners
    for (const ev of emittedEvents) {
      this.eventListeners.forEach((listener) => listener(ev));
    }

    return { trackedFaces, emittedEvents };
  }

  reset(): void {
    this.temporalTracker.reset();
    this.personTracker.reset();
  }
}
