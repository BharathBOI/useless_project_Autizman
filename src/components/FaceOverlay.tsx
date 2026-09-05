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

const EXPRESSION_COLORS: Record<ExpressionType, { border: string; bg: string; text: string; glow: string }> = {
  neutral: { border: 'border-zinc-500/50', bg: 'bg-zinc-950/80', text: 'text-zinc-300', glow: 'rgba(113, 113, 122, 0.2)' },
  happy: { border: 'border-[#84cc16]/80', bg: 'bg-[#84cc16]/20', text: 'text-[#84cc16]', glow: 'rgba(132, 204, 22, 0.3)' },
  sad: { border: 'border-blue-500/80', bg: 'bg-blue-950/80', text: 'text-blue-300', glow: 'rgba(59, 130, 246, 0.3)' },
  angry: { border: 'border-red-500/90', bg: 'bg-red-950/90', text: 'text-red-300', glow: 'rgba(239, 68, 68, 0.4)' },
  surprised: { border: 'border-amber-400/90', bg: 'bg-amber-950/90', text: 'text-amber-200', glow: 'rgba(245, 158, 11, 0.4)' },
  fearful: { border: 'border-purple-500/80', bg: 'bg-purple-950/80', text: 'text-purple-300', glow: 'rgba(168, 85, 247, 0.3)' },
  disgusted: { border: 'border-pink-500/80', bg: 'bg-pink-950/80', text: 'text-pink-300', glow: 'rgba(236, 72, 153, 0.3)' },
};

export const FaceOverlay: React.FC<FaceOverlayProps> = ({ faces }) => {
  if (faces.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {faces.map((face) => {
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
            {/* Reticle */}
            <div
              className={`w-full h-full border-2 rounded-xl relative transition-all duration-300 ${color.border}`}
              style={{
                boxShadow: `0 0 15px ${color.glow}`,
              }}
            >
              {/* Top Tag: Face ID */}
              <div className="absolute -top-7 left-0 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/90 border border-white/20 text-[10px] font-mono font-bold text-white shadow">
                <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16]" />
                {face.faceId}
              </div>

              {/* Facing Direction indicator */}
              {face.facingDirection !== 'center' && (
                <div className="absolute -top-7 right-0 px-2 py-0.5 rounded bg-black/90 border border-white/20 text-[10px] font-mono text-zinc-300">
                  {face.facingDirection === 'left' ? '◀ Left' : 'Right ▶'}
                </div>
              )}

              {/* Bottom Tag: Expression & Confidence */}
              <div
                className={`absolute -bottom-8 left-0 right-0 mx-auto w-max max-w-full flex items-center gap-2 px-2.5 py-0.5 rounded backdrop-blur-md border shadow-xl ${color.bg} ${color.border} ${color.text}`}
              >
                <span className="text-xs leading-none">{emoji}</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider leading-tight">
                    {face.currentExpression}
                  </span>
                  <span className="text-[9px] font-mono opacity-80 leading-none">
                    {confPercent}% conf
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
