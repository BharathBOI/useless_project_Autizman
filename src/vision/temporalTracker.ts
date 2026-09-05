import { CONFIG, ExpressionState } from '../config/constants';
import { VisionEvent } from '../types/events';
import { TrackedFaceState } from '../types/vision';

interface ExpressionHistorySample {
  timestamp: number;
  expression: ExpressionState;
  confidence: number;
  intensity: number;
}

export class TemporalTracker {
  // Rolling 2-second history per faceId
  private history: Map<string, ExpressionHistorySample[]> = new Map();
  // Active stable expression per faceId
  private activeStableExpression: Map<string, ExpressionState> = new Map();
  // Cooldown tracker per faceId
  private lastTriggeredTimestamp: Map<string, number> = new Map();

  public processFace(face: TrackedFaceState, now: number): VisionEvent | null {
    const faceId = face.faceId;

    if (!this.history.has(faceId)) {
      this.history.set(faceId, []);
      this.activeStableExpression.set(faceId, face.currentExpression);
      this.lastTriggeredTimestamp.set(faceId, 0);
      return null;
    }

    const faceHistory = this.history.get(faceId)!;
    
    // Push new sample
    faceHistory.push({
      timestamp: now,
      expression: face.currentExpression,
      confidence: face.expressionConfidence,
      intensity: face.expressionIntensity,
    });

    // Prune samples older than 2000 ms
    const prunedHistory = faceHistory.filter(s => now - s.timestamp <= 2000);
    this.history.set(faceId, prunedHistory);

    const prevStable = this.activeStableExpression.get(faceId) || 'neutral';
    const lastTriggered = this.lastTriggeredTimestamp.get(faceId) || 0;

    // Check Cooldown
    if (now - lastTriggered < CONFIG.EVENT_COOLDOWN_MS) {
      return null;
    }

    // Check if new expression has been stable for STABLE_EXPRESSION_DURATION_MS (500 ms)
    const recentSamples = prunedHistory.filter(s => now - s.timestamp <= CONFIG.STABLE_EXPRESSION_DURATION_MS);
    if (recentSamples.length < 3) return null; // Need minimum samples to confirm stability

    // Verify all recent samples consistently share the new expression with high confidence
    const candidateExpression = face.currentExpression;
    const isConsistentlyNew = recentSamples.every(
      s => s.expression === candidateExpression && s.confidence >= CONFIG.EXPRESSION_CONFIDENCE_THRESHOLD
    );

    if (!isConsistentlyNew) return null;

    // Trigger check: if expression changed from prevStable -> candidateExpression
    if (candidateExpression !== prevStable) {
      // Meaningful change confirmed!
      this.activeStableExpression.set(faceId, candidateExpression);
      this.lastTriggeredTimestamp.set(faceId, now);

      const isSudden = face.expressionIntensity >= 0.75 || candidateExpression === 'surprised' || candidateExpression === 'angry';
      const eventType = isSudden ? 'SUDDEN_EXPRESSION_CHANGE' : 'EXPRESSION_CHANGED';

      const timeStr = new Date(now).toLocaleTimeString('en-US', { hour12: false });

      return {
        id: `expr_${faceId}_${now}`,
        type: eventType,
        timestamp: now,
        timeFormatted: timeStr,
        personAffected: faceId,
        previousExpression: prevStable,
        newExpression: candidateExpression,
        intensity: face.expressionIntensity,
        description: `${faceId}: ${prevStable} → ${candidateExpression} (confidence: ${Math.round(face.expressionConfidence * 100)}%)`
      };
    }

    return null;
  }

  public clearFace(faceId: string): void {
    this.history.delete(faceId);
    this.activeStableExpression.delete(faceId);
    this.lastTriggeredTimestamp.delete(faceId);
  }

  public reset(): void {
    this.history.clear();
    this.activeStableExpression.clear();
    this.lastTriggeredTimestamp.clear();
  }
}

export const temporalTracker = new TemporalTracker();

