import { audioEngine } from '../audio/audioEngine';
import { CONFIG } from '../config/constants';
import { serialInterpreter } from '../llm/serialInterpreter';
import { VisionEvent } from '../types/events';
import { DramaticScene } from '../types/llm';
import { TrackedFaceState } from '../types/vision';

export class EventEngine {
  private eventQueue: VisionEvent[] = [];
  private eventLog: VisionEvent[] = [];
  private currentScene: DramaticScene = {
    sceneType: 'NORMAL',
    dramaticLevel: 10,
    headline: 'WAITING FOR DRAMA...',
    narration: 'Position yourself in front of the camera to begin your serial story.',
    audioCategory: 'NONE',
    audioIntensity: 0,
    durationSeconds: 5,
    shouldInterruptCurrentAudio: false,
    timestamp: Date.now()
  };

  private lastLLMCallTimestamp: number = 0;
  private isProcessingLLM: boolean = false;
  private listeners: ((scene: DramaticScene, logs: VisionEvent[]) => void)[] = [];

  public subscribe(listener: (scene: DramaticScene, logs: VisionEvent[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.currentScene, this.eventLog);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(l => l(this.currentScene, [...this.eventLog]));
  }

  /**
   * Process raw incoming events from vision trackers
   */
  public pushEvents(events: VisionEvent[], activeFaces: TrackedFaceState[]): void {
    if (events.length === 0) return;

    events.forEach(evt => {
      // Add to event queue & persistent log
      this.eventQueue.push(evt);
      this.eventLog.unshift(evt); // Newest first

      // Keep log length manageable
      if (this.eventLog.length > 50) {
        this.eventLog.pop();
      }

      // Low-Level Instant Audio Stings (No LLM wait required)
      if (evt.type === 'PERSON_ENTERED') {
        audioEngine.playPreset('ENTRANCE_STING', 'SUSPENSE', 70, 1.0, false);
      } else if (evt.type === 'PERSON_LEFT') {
        audioEngine.playPreset('EXIT_STING', 'SAD', 60, 1.0, false);
      }
    });

    this.notify();

    // Check throttled batch dispatch to LLM
    const now = Date.now();
    if (
      !this.isProcessingLLM &&
      now - this.lastLLMCallTimestamp >= CONFIG.LLM_THROTTLE_MS &&
      this.eventQueue.length > 0
    ) {
      this.dispatchBatchToLLM(activeFaces);
    }
  }

  /**
   * Batch pending events and request LLM dramatic interpretation
   */
  private async dispatchBatchToLLM(activeFaces: TrackedFaceState[]): Promise<void> {
    this.isProcessingLLM = true;
    const batchToProcess = [...this.eventQueue];
    this.eventQueue = []; // Clear queue
    this.lastLLMCallTimestamp = Date.now();

    try {
      const dramaticScene = await serialInterpreter.interpretEvents(batchToProcess, activeFaces);
      this.currentScene = dramaticScene;
      this.notify();

      // Trigger audio engine based on LLM response
      if (dramaticScene.audioCategory && dramaticScene.audioCategory !== 'NONE') {
        audioEngine.playCategory(
          dramaticScene.audioCategory,
          dramaticScene.audioIntensity,
          dramaticScene.durationSeconds,
          dramaticScene.shouldInterruptCurrentAudio
        );
      }
    } catch (err) {
      console.error('❌ [SERIALOS EventEngine] Failed to process scene interpretation:', err);
    } finally {
      this.isProcessingLLM = false;
    }
  }

  public reset(): void {
    this.eventQueue = [];
    this.eventLog = [];
    this.currentScene = {
      sceneType: 'NORMAL',
      dramaticLevel: 10,
      headline: 'SCENE RESET',
      narration: 'The stage is cleared. Waiting for new drama...',
      audioCategory: 'NONE',
      audioIntensity: 0,
      durationSeconds: 4,
      shouldInterruptCurrentAudio: true,
      timestamp: Date.now()
    };
    audioEngine.stop();
    this.notify();
  }
}

export const eventEngine = new EventEngine();

