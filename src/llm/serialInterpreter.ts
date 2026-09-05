import { VisionEvent } from '../types/events';
import { DramaticScene, LLMInterpreterResponse } from '../types/llm';
import { TrackedFaceState } from '../types/vision';

export class SerialInterpreterEngine {
  /**
   * Main method to interpret events. Calls backend API or uses local rule-based fallback.
   */
  public async interpretEvents(
    events: VisionEvent[],
    activeFaces: TrackedFaceState[]
  ): Promise<DramaticScene> {
    try {
      const response = await fetch('/api/interpret-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events,
          activeFaces: activeFaces.map(f => ({
            faceId: f.faceId,
            expression: f.currentExpression,
            confidence: f.expressionConfidence,
            durationSeconds: Math.round(f.presenceDurationMs / 1000)
          }))
        })
      });

      if (response.ok) {
        const data: LLMInterpreterResponse = await response.json();
        if (!data.fallback && data.scene) {
          return {
            ...data.scene,
            timestamp: Date.now(),
            isFallback: false
          };
        }
      }
    } catch (err) {
      console.warn('⚠️ [SERIALOS LLM] API call failed or unavailable. Falling back to local dramatic classifier:', err);
    }

    // Local Rule-Based Fallback Classifier
    return this.generateFallbackScene(events, activeFaces);
  }

  /**
   * Local Fallback Classifier generating exaggerated Indian serial drama JSON when LLM API is unavailable.
   */
  public generateFallbackScene(events: VisionEvent[], activeFaces: TrackedFaceState[]): DramaticScene {
    const primaryEvent = events[events.length - 1]; // Latest event
    const now = Date.now();

    if (!primaryEvent) {
      return {
        sceneType: 'NORMAL',
        dramaticLevel: 10,
        headline: 'CALM BEFORE THE STORM',
        narration: 'The silence thickens as fate prepares its next cruel turn...',
        audioCategory: 'NONE',
        audioIntensity: 10,
        durationSeconds: 4,
        shouldInterruptCurrentAudio: false,
        timestamp: now,
        isFallback: true
      };
    }

    // 1. Interaction caused by new person entrance
    if (primaryEvent.type === 'NEW_PERSON_CAUSED_EXPRESSION_CHANGE') {
      if (primaryEvent.newExpression === 'surprised' || primaryEvent.newExpression === 'angry') {
        return {
          sceneType: 'VILLAIN_ENTRANCE',
          dramaticLevel: 92,
          headline: 'THE SHOCKING ARRIVAL!',
          narration: `The arrival of ${primaryEvent.newPerson || 'a stranger'} sends immediate shockwaves through ${primaryEvent.personAffected || 'the room'}! Secret motives begin to unravel...`,
          audioCategory: 'VILLAIN',
          audioIntensity: 90,
          durationSeconds: 6,
          shouldInterruptCurrentAudio: true,
          timestamp: now,
          isFallback: true
        };
      } else if (primaryEvent.newExpression === 'sad') {
        return {
          sceneType: 'SAD_REVELATION',
          dramaticLevel: 85,
          headline: 'OLD WOUNDS REOPENED',
          narration: `The sight of ${primaryEvent.newPerson || 'this visitor'} reopens a painful betrayal that ${primaryEvent.personAffected || 'they'} swore never to speak of again.`,
          audioCategory: 'SAD',
          audioIntensity: 80,
          durationSeconds: 7,
          shouldInterruptCurrentAudio: true,
          timestamp: now,
          isFallback: true
        };
      }
    }

    // 2. Person Entered
    if (primaryEvent.type === 'PERSON_ENTERED') {
      return {
        sceneType: 'SUSPICIOUS_ARRIVAL',
        dramaticLevel: 75,
        headline: 'AN UNEXPECTED CHARACTER ENTERS',
        narration: `${primaryEvent.newPerson || 'A figure'} steps into the frame. Is this a long-lost heir... or the mastermind behind the family intrigue?`,
        audioCategory: 'SUSPENSE',
        audioIntensity: 75,
        durationSeconds: 5,
        shouldInterruptCurrentAudio: true,
        timestamp: now,
        isFallback: true
      };
    }

    // 3. Sudden Expression Change / Specific Expressions
    if (primaryEvent.type === 'SUDDEN_EXPRESSION_CHANGE' || primaryEvent.type === 'EXPRESSION_CHANGED') {
      const expr = primaryEvent.newExpression;

      if (expr === 'surprised') {
        return {
          sceneType: 'SHOCK',
          dramaticLevel: 95,
          headline: 'THE DEVASTATING TRUTH!',
          narration: `${primaryEvent.personAffected || 'The character'} gasps as a terrible secret is suddenly brought to light!`,
          audioCategory: 'SHOCK',
          audioIntensity: 95,
          durationSeconds: 5,
          shouldInterruptCurrentAudio: true,
          timestamp: now,
          isFallback: true
        };
      }

      if (expr === 'angry') {
        return {
          sceneType: 'BETRAYAL',
          dramaticLevel: 90,
          headline: 'DECLARATION OF WAR',
          narration: `Pure fury consumes ${primaryEvent.personAffected || 'the character'}. Promises mean nothing when vengeance takes command!`,
          audioCategory: 'VILLAIN',
          audioIntensity: 85,
          durationSeconds: 6,
          shouldInterruptCurrentAudio: true,
          timestamp: now,
          isFallback: true
        };
      }

      if (expr === 'sad') {
        return {
          sceneType: 'SAD_REVELATION',
          dramaticLevel: 80,
          headline: 'TEARS OF DESTINY',
          narration: `Tears well up in ${primaryEvent.personAffected || 'the character'}'s eyes as the heavy weight of tragic destiny presses down.`,
          audioCategory: 'SAD',
          audioIntensity: 85,
          durationSeconds: 6,
          shouldInterruptCurrentAudio: true,
          timestamp: now,
          isFallback: true
        };
      }

      if (expr === 'happy') {
        return {
          sceneType: activeFaces.length >= 2 ? 'ROMANTIC_TENSION' : 'COMIC_RELIEF',
          dramaticLevel: 65,
          headline: activeFaces.length >= 2 ? 'A DEEPENING BOND' : 'SCHEMING SMILE',
          narration: activeFaces.length >= 2
            ? `A subtle smile passes between them. But is it genuine affection or part of a grand deception?`
            : `A suspicious smile flickers across their face. Something sinister is being plotted...`,
          audioCategory: activeFaces.length >= 2 ? 'ROMANTIC' : 'COMEDY',
          audioIntensity: 65,
          durationSeconds: 5,
          shouldInterruptCurrentAudio: false,
          timestamp: now,
          isFallback: true
        };
      }
    }

    // 4. Mutual Stare / Facing each other
    if (primaryEvent.type === 'MUTUAL_INTERACTION') {
      return {
        sceneType: 'EMOTIONAL_CONFRONTATION',
        dramaticLevel: 88,
        headline: 'THE SILENT CONFRONTATION',
        narration: `Their eyes lock in intense silence. No words are spoken, yet an agonizing duel of wills has already begun.`,
        audioCategory: 'SUSPENSE',
        audioIntensity: 85,
        durationSeconds: 6,
        shouldInterruptCurrentAudio: true,
        timestamp: now,
        isFallback: true
      };
    }

    // 5. Person Left
    if (primaryEvent.type === 'PERSON_LEFT' || primaryEvent.type === 'ALL_PEOPLE_LEFT') {
      return {
        sceneType: 'CHARACTER_EXIT',
        dramaticLevel: 70,
        headline: 'A DRAMATIC DEPARTURE',
        narration: `${primaryEvent.personAffected || 'The character'} turns away and vanishes, leaving behind unresolved questions and lingering sorrow.`,
        audioCategory: 'SAD',
        audioIntensity: 65,
        durationSeconds: 5,
        shouldInterruptCurrentAudio: true,
        timestamp: now,
        isFallback: true
      };
    }

    // Default Fallback
    return {
      sceneType: 'GENERAL_DRAMA',
      dramaticLevel: 60,
      headline: 'SUSPENSE CONTINUES...',
      narration: 'Every shadow conceals a secret in this unending family drama.',
      audioCategory: 'SUSPENSE',
      audioIntensity: 60,
      durationSeconds: 5,
      shouldInterruptCurrentAudio: false,
      timestamp: now,
      isFallback: true
    };
  }
}

export const serialInterpreter = new SerialInterpreterEngine();

