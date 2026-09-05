import React from 'react';
import { TrackedFace, ExpressionType } from '../types/vision';

interface FaceOverlayProps {
  faces: TrackedFace[];
}

const EXPRESSION_EMOJIS: Record<ExpressionType, string> = {
  neutral: '😐',
  happy: '😄',
  sad: '😢',
  angry: '😠',
  surprised: '😲',
  fearful: '😨',
  disgusted: '🤢',
};

const EXPRESSION_COLORS: Record<ExpressionType, { border: string; bg: string; text: string }> = {
  neutral: { border: 'border-gray-500/50', bg: 'bg-gray-900/80', text: 'text-gray-300' },
  happy: { border: 'border-emerald-500/80', bg: 'bg-emerald-950/80', text: 'text-emerald-300' },
  sad: { border: 'border-blue-500/80', bg: 'bg-blue-950/80', text: 'text-blue-300' },
  angry: { border: 'border-red-500/90', bg: 'bg-red-950/90', text: 'text-red-300' },
  surprised: { border: 'border-amber-400/90', bg: 'bg-amber-950/90', text: 'text-amber-200' },
  fearful: { border: 'border-purple-500/80', bg: 'bg-purple-950/80', text: 'text-purple-300' },
  disgusted: { border: 'border-lime-500/80', bg: 'bg-lime-950/80', text: 'text-lime-300' },
};

export const FaceOverlay: React.FC<FaceOverlayProps> = ({ faces }) => {
  if (faces.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {faces.map((face) => {
        // Because video is horizontally mirrored (scaleX(-1)),
        // mirror the X coordinate so text labels stay legible and bounding box aligns:
        const mirroredLeft = (1 - (face.boundingBox.xMin + face.boundingBox.width)) * 100;
        const top = face.boundingBox.yMin * 100;
        const width = face.boundingBox.width * 100;
        const height = face.boundingBox.height * 100;

        const color = EXPRESSION_COLORS[face.currentExpression] || EXPRESSION_COLORS.neutral;
        const emoji = EXPRESSION_EMOJIS[face.currentExpression] || '😐';
        const confPercent = Math.round(face.expressionConfidence * 100);

        return (
          <div
            key={face.faceId}
            className="absolute transition-all duration-100 ease-out"
            style={{
              left: `${Math.max(1, Math.min(95, mirroredLeft))}%`,
              top: `${Math.max(1, Math.min(95, top))}%`,
              width: `${Math.max(8, Math.min(90, width))}%`,
              height: `${Math.max(10, Math.min(90, height))}%`,
            }}
          >
            {/* Corner Bracket Frame (Cinematic Serial Target Reticle) */}
            <div
              className={`w-full h-full border-2 rounded-xl relative transition-all duration-300 ${color.border}`}
              style={{
                boxShadow: face.currentExpression !== 'neutral' 
                  ? '0 0 20px rgba(239, 68, 68, 0.4), inset 0 0 15px rgba(239, 68, 68, 0.2)' 
                  : '0 0 10px rgba(0,0,0,0.5)',
              }}
            >
              {/* Top Tag: Face ID */}
              <div className="absolute -top-7 left-0 flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/20 text-[11px] font-mono font-bold text-white shadow-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                {face.faceId}
              </div>

              {/* Facing Direction indicator */}
              {face.facingDirection !== 'center' && (
                <div className="absolute -top-7 right-0 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-cyan-500/40 text-[10px] font-mono text-cyan-300">
                  {face.facingDirection === 'left' ? '◀ Looking Left' : 'Looking Right ▶'}
                </div>
              )}

              {/* Bottom Tag: Expression & Confidence */}
              <div
                className={`absolute -bottom-9 left-0 right-0 mx-auto w-max max-w-full flex items-center gap-2 px-3 py-1 rounded-lg backdrop-blur-md border shadow-xl ${color.bg} ${color.border} ${color.text}`}
              >
                <span className="text-base leading-none">{emoji}</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider leading-tight">
                    {face.currentExpression}
                  </span>
                  <span className="text-[10px] font-mono opacity-80 leading-none">
                    Confidence: {confPercent}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
