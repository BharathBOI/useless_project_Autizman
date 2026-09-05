import { ExpressionState } from '../config/constants';
import { ExpressionScores } from '../types/vision';

/**
 * Expression Classifier using MediaPipe blendshape coefficients.
 * Derives weighted scores for 7 expressions: neutral, happy, sad, angry, surprised, fearful, disgusted.
 */
export function classifyExpression(blendshapes: Record<string, number>): {
  dominantExpression: ExpressionState;
  confidence: number;
  intensity: number;
  scores: ExpressionScores;
} {
  const getVal = (...keys: string[]): number => {
    for (const key of keys) {
      if (typeof blendshapes[key] === 'number') {
        return blendshapes[key];
      }
    }
    return 0;
  };

  // Extract relevant blendshapes
  const smileLeft = getVal('smileLeft', 'mouthSmileLeft');
  const smileRight = getVal('smileRight', 'mouthSmileRight');
  const mouthFrownLeft = getVal('mouthFrownLeft', 'frownLeft');
  const mouthFrownRight = getVal('mouthFrownRight', 'frownRight');
  const mouthPressLeft = getVal('mouthPressLeft');
  const mouthPressRight = getVal('mouthPressRight');
  
  const browDownLeft = getVal('browDownLeft');
  const browDownRight = getVal('browDownRight');
  const browInnerUp = getVal('browInnerUp');
  const browOuterUpLeft = getVal('browOuterUpLeft');
  const browOuterUpRight = getVal('browOuterUpRight');
  
  const eyeWideLeft = getVal('eyeWideLeft');
  const eyeWideRight = getVal('eyeWideRight');
  const eyeSquintLeft = getVal('eyeSquintLeft');
  const eyeSquintRight = getVal('eyeSquintRight');
  
  const jawOpen = getVal('jawOpen');
  const noseSneerLeft = getVal('noseSneerLeft');
  const noseSneerRight = getVal('noseSneerRight');
  const mouthUpperUpLeft = getVal('mouthUpperUpLeft');
  const mouthUpperUpRight = getVal('mouthUpperUpRight');

  // Compute Expression Weighted Scores
  
  // HAPPY: High smile + cheek raiser
  const happyScore = Math.min(1.0, (smileLeft + smileRight) * 0.7 + (1.0 - (browDownLeft + browDownRight) * 0.5) * 0.3);

  // SAD: Mouth frown + brow inner raise + reduced smile
  const sadScore = Math.min(
    1.0,
    (mouthFrownLeft + mouthFrownRight) * 0.8 +
    browInnerUp * 0.6 -
    (smileLeft + smileRight) * 0.5
  );

  // ANGRY: Brow lowering + eye narrowing/squint + mouth tension
  const angryScore = Math.min(
    1.0,
    (browDownLeft + browDownRight) * 0.85 +
    (eyeSquintLeft + eyeSquintRight) * 0.35 +
    (mouthPressLeft + mouthPressRight) * 0.3 -
    (smileLeft + smileRight) * 0.6
  );

  // SURPRISED: Eyebrow raise + eye widening + jaw open
  const surprisedScore = Math.min(
    1.0,
    (browOuterUpLeft + browOuterUpRight + browInnerUp) * 0.45 +
    (eyeWideLeft + eyeWideRight) * 0.55 +
    jawOpen * 0.5
  );

  // FEARFUL: Brow inner up + brow down + eye wide + jaw open slightly
  const fearfulScore = Math.min(
    1.0,
    browInnerUp * 0.5 +
    (eyeWideLeft + eyeWideRight) * 0.4 +
    (mouthFrownLeft + mouthFrownRight) * 0.3 +
    jawOpen * 0.25 -
    (smileLeft + smileRight) * 0.5
  );

  // DISGUSTED: Nose sneer + upper lip raise + brow down
  const disgustedScore = Math.min(
    1.0,
    (noseSneerLeft + noseSneerRight) * 0.7 +
    (mouthUpperUpLeft + mouthUpperUpRight) * 0.5 +
    (browDownLeft + browDownRight) * 0.3
  );

  // NEUTRAL: Baseline when no strong expression is active
  const maxOtherScore = Math.max(happyScore, sadScore, angryScore, surprisedScore, fearfulScore, disgustedScore);
  const neutralScore = Math.max(0.0, 1.0 - maxOtherScore * 1.2);

  const rawScores: ExpressionScores = {
    neutral: Math.max(0, neutralScore),
    happy: Math.max(0, happyScore),
    sad: Math.max(0, sadScore),
    angry: Math.max(0, angryScore),
    surprised: Math.max(0, surprisedScore),
    fearful: Math.max(0, fearfulScore),
    disgusted: Math.max(0, disgustedScore),
  };

  // Determine dominant expression state
  let dominantExpression: ExpressionState = 'neutral';
  let maxVal = rawScores.neutral;

  (Object.keys(rawScores) as ExpressionState[]).forEach((expr) => {
    if (rawScores[expr] > maxVal) {
      maxVal = rawScores[expr];
      dominantExpression = expr;
    }
  });

  // Calculate overall confidence and intensity
  const sumScores = Object.values(rawScores).reduce((a, b) => a + b, 0) || 1;
  const confidence = Math.min(1.0, maxVal / (sumScores * 0.6 || 1));
  const intensity = dominantExpression === 'neutral' ? 0.2 : Math.min(1.0, maxVal);

  return {
    dominantExpression,
    confidence: Number(confidence.toFixed(2)),
    intensity: Number(intensity.toFixed(2)),
    scores: rawScores,
  };
}

