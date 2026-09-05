import { SerialEvent } from '../types/events';
import { TrackedFace } from '../types/vision';
import { SerialSceneInterpretation, InterpretScenePayload } from '../types/llm';
import { FallbackSerialEngine } from './fallbackEngine';
import { SERIAL_CONFIG } from '../config';

export class SerialInterpreter {
  private fallbackEngine = new FallbackSerialEngine();
  private pendingEvents: SerialEvent[] = [];
  private lastRequestTime = 0;
  private throttleTimer: number | null = null;
  private onSceneCallbacks: Array<(scene: SerialSceneInterpretation) => void> = [];

  onSceneInterpreted(callback: (scene: SerialSceneInterpretation) => void): () => void {
    this.onSceneCallbacks.push(callback);
    return () => {
      this.onSceneCallbacks = this.onSceneCallbacks.filter((cb) => cb !== callback);
    };
  }

  enqueueEvent(
    event: SerialEvent,
    currentFaces: TrackedFace[]
  ): void {
    this.pendingEvents.push(event);

    const now = Date.now();
    const timeSinceLast = now - this.lastRequestTime;

    if (timeSinceLast >= SERIAL_CONFIG.LLM_THROTTLE_MS) {
      this.flushQueue(currentFaces);
    } else if (!this.throttleTimer) {
      // Schedule to flush after remaining throttle time
      const delay = SERIAL_CONFIG.LLM_THROTTLE_MS - timeSinceLast;
      this.throttleTimer = window.setTimeout(() => {
        this.throttleTimer = null;
        this.flushQueue(currentFaces);
      }, delay);
    }
  }

  private async flushQueue(currentFaces: TrackedFace[]): Promise<void> {
    if (this.pendingEvents.length === 0) return;

    const eventsToProcess = [...this.pendingEvents];
    this.pendingEvents = [];
    this.lastRequestTime = Date.now();

    const activeExpressions: Record<string, string> = {};
    for (const f of currentFaces) {
      activeExpressions[f.faceId] = f.currentExpression;
    }

    const payload: InterpretScenePayload = {
      events: eventsToProcess.map((e) => {
        const details: Record<string, any> = {};
        if ('previousExpression' in e) details.previousExpression = e.previousExpression;
        if ('newExpression' in e) details.newExpression = e.newExpression;
        if ('newPerson' in e) details.newPerson = e.newPerson;
        if ('personAffected' in e) details.personAffected = e.personAffected;
        return {
          type: e.type,
          description: e.description,
          timestamp: e.timestamp,
          details,
        };
      }),
      charactersPresent: currentFaces.length,
      activeExpressions,
    };

    let interpretation: SerialSceneInterpretation;

    try {
      const response = await fetch('/api/interpret-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.useFallback || !data.sceneType) {
        // Smoothly use local fallback without jarring error
        interpretation = this.fallbackEngine.interpret(payload);
      } else {
        interpretation = {
          ...data,
          source: 'gemini',
        };
      }
    } catch (err) {
      console.warn('Backend LLM fetch failed, using local fallback:', err);
      interpretation = this.fallbackEngine.interpret(payload);
    }

    // Broadcast result
    for (const cb of this.onSceneCallbacks) {
      cb(interpretation);
    }
  }

  reset(): void {
    this.pendingEvents = [];
    if (this.throttleTimer) {
      clearTimeout(this.throttleTimer);
      this.throttleTimer = null;
    }
  }
}
