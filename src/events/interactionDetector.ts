import { TrackedFace } from '../types/vision';
import {
  ExpressionChangeEvent,
  NewPersonCausedChangeEvent,
  MutualInteractionEvent,
  SimultaneousReactionEvent,
  SerialEvent,
} from '../types/events';

export class InteractionDetector {
  private lastMutualStareTimestamp = 0;
  private lastSimultaneousTimestamp = 0;

  detectInteractions(
    faces: TrackedFace[],
    recentExpressionEvents: ExpressionChangeEvent[],
    lastEnteredFaceId: string | null,
    lastEnterTimestamp: number,
    currentTimestamp: number
  ): SerialEvent[] {
    const events: SerialEvent[] = [];

    // 1. Check NEW_PERSON_CAUSED_EXPRESSION_CHANGE
    // If a new person entered within the last 2500ms, and an EXISTING person's expression just changed
    if (lastEnteredFaceId && currentTimestamp - lastEnterTimestamp <= 2500) {
      for (const exprEvent of recentExpressionEvents) {
        if (exprEvent.faceId !== lastEnteredFaceId) {
          // An existing character reacted to the new character's arrival!
          events.push({
            id: `react_${exprEvent.faceId}_to_${lastEnteredFaceId}_${currentTimestamp}`,
            type: 'NEW_PERSON_CAUSED_EXPRESSION_CHANGE',
            personAffected: exprEvent.faceId,
            newPerson: lastEnteredFaceId,
            previousExpression: exprEvent.previousExpression,
            newExpression: exprEvent.newExpression,
            timeDeltaMs: currentTimestamp - lastEnterTimestamp,
            timestamp: currentTimestamp,
            formattedTime: new Date(currentTimestamp).toLocaleTimeString(),
            description: `DRAMATIC REACTION: ${exprEvent.faceId} changed (${exprEvent.previousExpression} ➔ ${exprEvent.newExpression}) right after ${lastEnteredFaceId} entered!`,
          } as NewPersonCausedChangeEvent);
        }
      }
    }

    // 2. Check SIMULTANEOUS_REACTION (if >= 2 faces had expression changes in this immediate step)
    if (
      recentExpressionEvents.length >= 2 &&
      currentTimestamp - this.lastSimultaneousTimestamp >= 3000
    ) {
      const facesInvolved = recentExpressionEvents.map((e) => e.faceId);
      const expressions: Record<string, any> = {};
      recentExpressionEvents.forEach((e) => {
        expressions[e.faceId] = e.newExpression;
      });

      this.lastSimultaneousTimestamp = currentTimestamp;
      events.push({
        id: `simul_${currentTimestamp}`,
        type: 'SIMULTANEOUS_REACTION',
        facesInvolved,
        expressions,
        timestamp: currentTimestamp,
        formattedTime: new Date(currentTimestamp).toLocaleTimeString(),
        description: `SIMULTANEOUS REACTION: ${facesInvolved.join(' and ')} reacted at the exact same moment!`,
      } as SimultaneousReactionEvent);
    }

    // 3. Check MUTUAL_INTERACTION (two people facing toward each other)
    if (faces.length >= 2 && currentTimestamp - this.lastMutualStareTimestamp >= 4000) {
      // Find pairs
      for (let i = 0; i < faces.length; i++) {
        for (let j = i + 1; j < faces.length; j++) {
          const f1 = faces[i];
          const f2 = faces[j];

          // Determine who is on left vs right
          const leftPerson = f1.boundingBox.centerX < f2.boundingBox.centerX ? f1 : f2;
          const rightPerson = f1.boundingBox.centerX < f2.boundingBox.centerX ? f2 : f1;

          // If left person faces right and right person faces left, they are looking toward each other!
          if (leftPerson.facingDirection === 'right' && rightPerson.facingDirection === 'left') {
            this.lastMutualStareTimestamp = currentTimestamp;
            events.push({
              id: `mutual_${leftPerson.faceId}_${rightPerson.faceId}_${currentTimestamp}`,
              type: 'MUTUAL_INTERACTION',
              facesInvolved: [leftPerson.faceId, rightPerson.faceId],
              interactionType: 'FACING_EACH_OTHER',
              timestamp: currentTimestamp,
              formattedTime: new Date(currentTimestamp).toLocaleTimeString(),
              description: `TENSE CONFRONTATION: ${leftPerson.faceId} and ${rightPerson.faceId} are staring directly at each other!`,
            } as MutualInteractionEvent);
          }
        }
      }
    }

    return events;
  }
}
