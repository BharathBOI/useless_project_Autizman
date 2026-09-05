import { ExpressionType } from '../types/vision';

export interface ExpressionAnalysis {
  dominantExpression: ExpressionType;
  confidence: number;
  intensity: number;
  scores: Record<ExpressionType, number>;
}

export class ExpressionClassifier {
  /**
   * Evaluates blendshape map into normalized expression scores with advanced anger & sad tuning.
   */
  classify(blendshapes: Record<string, number>, angerMultiplier = 1.25): ExpressionAnalysis {
    const get = (name: string): number => blendshapes[name] || 0;

    // Helper for symmetrical features
    const avg = (...keys: string[]): number => {
      const sum = keys.reduce((acc, k) => acc + get(k), 0);
      return sum / keys.length;
    };

    // Shared facial metrics
    const smile = avg('mouthSmileLeft', 'mouthSmileRight');
    const dimple = avg('mouthDimpleLeft', 'mouthDimpleRight');
    const frown = avg('mouthFrownLeft', 'mouthFrownRight');
    const browInnerUp = get('browInnerUp');
    const browOuterUp = avg('browOuterUpLeft', 'browOuterUpRight');
    const browDown = avg('browDownLeft', 'browDownRight');
    const squint = avg('eyeSquintLeft', 'eyeSquintRight', 'cheekSquintLeft', 'cheekSquintRight');
    const noseSneer = avg('noseSneerLeft', 'noseSneerRight');
    const mouthPress = avg('mouthPressLeft', 'mouthPressRight') + get('jawForward') * 0.4 + get('mouthClose') * 0.2;

    // ==========================================
    // 1. HAPPY: High smile, cheek/dimple movement
    // ==========================================
    const happyScore = Math.max(0, smile * 0.85 + dimple * 0.25 - frown * 0.5);

    // ==========================================
    // 2. SAD SETCASE: Raised inner brows, downward mouth, lower lip depression
    // ==========================================
    const lowerDown = avg('mouthLowerDownLeft', 'mouthLowerDownRight');
    const mouthShrugLower = get('mouthShrugLower');
    const mouthRollLower = get('mouthRollLower');

    let sadScore = Math.max(
      0,
      frown * 0.7 + browInnerUp * 0.55 + lowerDown * 0.3 + (mouthShrugLower + mouthRollLower) * 0.25 - smile * 0.7
    );

    // Sad face booster: if inner brows are pulled up with frown and low smile
    if ((browInnerUp > 0.10 || frown > 0.07) && browDown < 0.12 && smile < 0.2) {
      sadScore = Math.min(1.0, 0.48 + browInnerUp * 1.5 + frown * 1.2);
    }

    // ==========================================
    // 3. ANGRY SETCASE (EXTENSIVELY FINE-TUNED)
    // ==========================================
    // In anger: Eyebrows are pulled DOWN (browDown), eyes are narrowed (squint),
    // nose is slightly wrinkled (sneer), lips/jaw are tense, and brows are NOT pulled up.
    let angryScore = Math.max(
      0,
      (browDown * 1.6 + squint * 0.75 + noseSneer * 0.55 + mouthPress * 0.4 + frown * 0.35 - smile * 0.9) * angerMultiplier
    );

    // Brow elevation check: in anger, inner & outer brows are NOT lifted
    const browElevation = Math.max(browInnerUp, browOuterUp);

    // Aggressive Anger Booster:
    // Any noticeable eyebrow furrowing (browDown > 0.04) or squinting with mouth tension:
    if ((browDown > 0.04 || (squint > 0.09 && mouthPress > 0.06) || (squint > 0.12 && frown > 0.06)) &&
        browElevation < 0.32 && 
        smile < 0.22) {
      // Strong anger activation that easily beats resting neutral
      angryScore = Math.max(angryScore, 0.48 + (browDown * 2.2) + (squint * 0.8) + (noseSneer * 0.5));
      angryScore = Math.min(1.0, angryScore);
    }

    // Disambiguation between Anger vs Sadness:
    // If eyebrows are pressed DOWN harder than inner brows are pulled UP, anger wins!
    if (browDown > browInnerUp + 0.02 && angryScore > 0.35) {
      sadScore = Math.min(sadScore, angryScore * 0.6);
    } else if (browInnerUp > browDown + 0.10 && sadScore > 0.35) {
      angryScore = Math.min(angryScore, sadScore * 0.6);
    }

    // ==========================================
    // 4. SURPRISED: Eye wide, jaw open, outer brows up
    // ==========================================
    const eyeWide = avg('eyeWideLeft', 'eyeWideRight');
    const jawOpen = get('jawOpen');
    let surprisedScore = Math.max(0, eyeWide * 0.45 + jawOpen * 0.4 + browOuterUp * 0.35);
    if ((eyeWide > 0.10 || jawOpen > 0.14) && smile < 0.25) {
      surprisedScore = Math.min(1.0, 0.50 + eyeWide * 1.8 + jawOpen * 1.2);
    }

    // ==========================================
    // 5. FEARFUL: Eye wide, brow inner up, mouth stretched
    // ==========================================
    const mouthStretch = avg('mouthStretchLeft', 'mouthStretchRight');
    const fearfulScore = Math.max(0, eyeWide * 0.35 + browInnerUp * 0.35 + mouthStretch * 0.3);

    // ==========================================
    // 6. DISGUSTED: Nose sneer, upper lip raised
    // ==========================================
    const upperUp = avg('mouthUpperUpLeft', 'mouthUpperUpRight');
    const disgustedScore = Math.max(0, noseSneer * 0.7 + upperUp * 0.4);

    // ==========================================
    // 7. NEUTRAL: Quickly yields whenever an active emotion triggers
    // ==========================================
    const maxActiveEmotion = Math.max(happyScore, sadScore, angryScore, surprisedScore, fearfulScore, disgustedScore);
    // Resting face has maxActiveEmotion < 0.15 -> neutralScore is ~0.55
    // Any real emotion has maxActiveEmotion > 0.25 -> neutralScore drops to ~0.05
    const neutralScore = Math.max(0.04, 0.72 - maxActiveEmotion * 2.1);

    const scores: Record<ExpressionType, number> = {
      neutral: neutralScore,
      happy: happyScore,
      sad: sadScore,
      angry: angryScore,
      surprised: surprisedScore,
      fearful: fearfulScore,
      disgusted: disgustedScore,
    };

    // Determine highest scoring expression
    let dominantExpression: ExpressionType = 'neutral';
    let maxScore = -1;

    for (const [expr, val] of Object.entries(scores) as [ExpressionType, number][]) {
      if (val > maxScore) {
        maxScore = val;
        dominantExpression = expr;
      }
    }

    // Calculate confidence normalized between 0.35 and 0.99
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const confidence = totalScore > 0 ? Math.min(0.99, Math.max(0.40, (maxScore / totalScore) * 1.55)) : 0.5;
    const intensity = Math.min(1.0, Math.max(0.15, maxScore * 1.35));

    return {
      dominantExpression,
      confidence,
      intensity,
      scores,
    };
  }
}
