import { SerialSceneInterpretation, InterpretScenePayload } from '../types/llm';

export class FallbackSerialEngine {
  interpret(payload: InterpretScenePayload): SerialSceneInterpretation {
    const { events, activeExpressions, charactersPresent } = payload;
    const latestEvent = events[0];

    // Check if any visible person currently has a sad expression or if a sad event occurred
    const hasSadExpression = Object.values(activeExpressions || {}).includes('sad');

    // 1. SPECIFIC SETCASES FOR SAD FACES & GRIEF
    if (latestEvent) {
      // Setcase A: New Person Entered Caused Sadness
      if (
        latestEvent.type === 'NEW_PERSON_CAUSED_EXPRESSION_CHANGE' &&
        latestEvent.details?.newExpression === 'sad'
      ) {
        return {
          sceneType: 'EMOTIONAL_CONFRONTATION',
          dramaticLevel: 93,
          headline: 'THE GHOST OF PAST SINS HAS RETURNED',
          narration: `Seeing ${latestEvent.details?.newPerson || 'this person'} instantly drained all color from their face. An unhealed wound from twenty years ago has reopened in devastating silence...`,
          audioCategory: 'SAD',
          audioIntensity: 90,
          durationSeconds: 8,
          shouldInterruptCurrentAudio: true,
          source: 'fallback',
        };
      }

      // Setcase A2: New Person Entered Caused Anger (Vengeance)
      if (
        latestEvent.type === 'NEW_PERSON_CAUSED_EXPRESSION_CHANGE' &&
        latestEvent.details?.newExpression === 'angry'
      ) {
        return {
          sceneType: 'EMOTIONAL_CONFRONTATION',
          dramaticLevel: 96,
          headline: 'THE WRATH OF THE MASTER ERUPTS',
          narration: `Seeing ${latestEvent.details?.newPerson || 'this person'} step inside has ignited a raging fury! An ancient blood feud between rival families has awakened!`,
          audioCategory: 'VILLAIN',
          audioIntensity: 95,
          durationSeconds: 8,
          shouldInterruptCurrentAudio: true,
          source: 'fallback',
        };
      }

      // Setcase B: Happy -> Sad (Betrayal)
      if (
        (latestEvent.type === 'EXPRESSION_CHANGED' || latestEvent.type === 'SUDDEN_EXPRESSION_CHANGE') &&
        latestEvent.details?.previousExpression === 'happy' &&
        latestEvent.details?.newExpression === 'sad'
      ) {
        return {
          sceneType: 'BETRAYAL',
          dramaticLevel: 95,
          headline: 'SUDDEN BETRAYAL & CRUSHED DREAMS',
          narration: 'The smile vanished in an instant. A dagger of betrayal plunged into their heart as the illusion crumbled!',
          audioCategory: 'SAD',
          audioIntensity: 95,
          durationSeconds: 8,
          shouldInterruptCurrentAudio: true,
          source: 'fallback',
        };
      }

      // Setcase C: Any Transition to Sad
      if (
        (latestEvent.type === 'EXPRESSION_CHANGED' || latestEvent.type === 'SUDDEN_EXPRESSION_CHANGE') &&
        latestEvent.details?.newExpression === 'sad'
      ) {
        return {
          sceneType: 'SAD_REVELATION',
          dramaticLevel: 88,
          headline: 'A HEARTBREAKING TRUTH UNVEILED',
          narration: 'A wave of devastating grief sweeps across their face. A secret family sorrow too unbearable to utter aloud...',
          audioCategory: 'SAD',
          audioIntensity: 85,
          durationSeconds: 7,
          shouldInterruptCurrentAudio: true,
          source: 'fallback',
        };
      }

      // 2. SHOCK / SURPRISE SETCASES
      if (
        (latestEvent.type === 'EXPRESSION_CHANGED' || latestEvent.type === 'SUDDEN_EXPRESSION_CHANGE') &&
        latestEvent.details?.newExpression === 'surprised'
      ) {
        return {
          sceneType: 'SHOCK',
          dramaticLevel: 92,
          headline: 'THE SHOCKING REVELATION',
          narration: 'Their eyes widened in total disbelief! The truth hidden behind the ancestral altar has been exposed!',
          audioCategory: 'SHOCK',
          audioIntensity: 95,
          durationSeconds: 6,
          shouldInterruptCurrentAudio: true,
          source: 'fallback',
        };
      }

      // 3. ANGRY / VILLAIN SETCASE
      if (
        (latestEvent.type === 'EXPRESSION_CHANGED' || latestEvent.type === 'SUDDEN_EXPRESSION_CHANGE') &&
        latestEvent.details?.newExpression === 'angry'
      ) {
        return {
          sceneType: 'VILLAIN_ENTRANCE',
          dramaticLevel: 90,
          headline: 'VENGEANCE OF THE RIVAL HEIR',
          narration: 'A venomous fury darkens their brow. The vow of revenge will consume everything in its path!',
          audioCategory: 'VILLAIN',
          audioIntensity: 90,
          durationSeconds: 7,
          shouldInterruptCurrentAudio: true,
          source: 'fallback',
        };
      }

      // 4. SMILE / HAPPY VIBE SETCASE (Audio 20)
      if (
        (latestEvent.type === 'EXPRESSION_CHANGED' || latestEvent.type === 'SUDDEN_EXPRESSION_CHANGE') &&
        latestEvent.details?.newExpression === 'happy'
      ) {
        return {
          sceneType: 'ROMANTIC_TENSION',
          dramaticLevel: 75,
          headline: 'A MOMENT OF PURE BLISS',
          narration: 'A radiant smile warms the entire household! But in a serial, joy is always the calm before the storm...',
          audioCategory: 'ROMANTIC',
          audioIntensity: 80,
          durationSeconds: 7,
          shouldInterruptCurrentAudio: false,
          source: 'fallback',
        };
      }

      // 5. PERSON ENTERED SETCASE
      if (latestEvent.type === 'PERSON_ENTERED') {
        return {
          sceneType: 'SUSPICIOUS_ARRIVAL',
          dramaticLevel: 84,
          headline: 'THE UNEXPECTED ARRIVAL',
          narration: `A sudden presence enters unannounced. The peaceful quiet of the household is shattered forever.`,
          audioCategory: 'SUSPENSE',
          audioIntensity: 80,
          durationSeconds: 6,
          shouldInterruptCurrentAudio: true,
          source: 'fallback',
        };
      }

      // 6. PERSON LEFT SETCASE
      if (latestEvent.type === 'PERSON_LEFT' || latestEvent.type === 'ALL_PEOPLE_LEFT') {
        return {
          sceneType: 'CHARACTER_EXIT',
          dramaticLevel: 72,
          headline: 'STORMING OUT INTO THE NIGHT',
          narration: 'They turned their back and walked away, slamming the door on generations of family honor...',
          audioCategory: 'SAD',
          audioIntensity: 70,
          durationSeconds: 6,
          shouldInterruptCurrentAudio: false,
          source: 'fallback',
        };
      }

      // 7. MULTI-PERSON STAREDOWN
      if (latestEvent.type === 'MUTUAL_INTERACTION') {
        return {
          sceneType: 'EMOTIONAL_CONFRONTATION',
          dramaticLevel: 89,
          headline: 'DEADLY EYE CONTACT',
          narration: 'Neither person blinks. The silent tension in the hallway is thicker than monsoon clouds.',
          audioCategory: 'SUSPENSE',
          audioIntensity: 85,
          durationSeconds: 7,
          shouldInterruptCurrentAudio: true,
          source: 'fallback',
        };
      }

      // 8. SIMULTANEOUS REACTION
      if (latestEvent.type === 'SIMULTANEOUS_REACTION') {
        return {
          sceneType: 'CLIFFHANGER',
          dramaticLevel: 98,
          headline: 'THE THREE-WAY DRAMATIC FREEZE',
          narration: 'Multiple gasps ring out at once! Lightning flashes outside as destiny freezes in place!',
          audioCategory: 'CLIFFHANGER',
          audioIntensity: 100,
          durationSeconds: 8,
          shouldInterruptCurrentAudio: true,
          source: 'fallback',
        };
      }
    }

    // Check persistent active expressions
    const hasAngryExpression = Object.values(activeExpressions || {}).includes('angry');
    if (hasAngryExpression) {
      return {
        sceneType: 'VILLAIN_ENTRANCE',
        dramaticLevel: 89,
        headline: 'A VENOMOUS GLARE OF VENGEANCE',
        narration: 'A burning fury smolders in their eyes. The master of the house is planning merciless retribution!',
        audioCategory: 'VILLAIN',
        audioIntensity: 90,
        durationSeconds: 8,
        shouldInterruptCurrentAudio: false,
        source: 'fallback',
      };
    }

    // Default if someone is sad but no recent transition
    if (hasSadExpression) {
      return {
        sceneType: 'SAD_REVELATION',
        dramaticLevel: 78,
        headline: 'THE SILENT BURDEN OF GRIEF',
        narration: 'A quiet, heavy sadness hangs over the room. Some tragedies cannot be forgiven or forgotten.',
        audioCategory: 'SAD',
        audioIntensity: 75,
        durationSeconds: 8,
        shouldInterruptCurrentAudio: false,
        source: 'fallback',
      };
    }

    // Default Normal Scene
    return {
      sceneType: 'NORMAL',
      dramaticLevel: 25,
      headline: 'A MOMENTARY CALM',
      narration: 'The household appears peaceful for now, but in a serial, the calm only precedes the storm...',
      audioCategory: 'NONE',
      audioIntensity: 20,
      durationSeconds: 4,
      shouldInterruptCurrentAudio: false,
      source: 'fallback',
    };
  }
}
