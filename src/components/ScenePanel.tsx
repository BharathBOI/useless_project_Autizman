import React from 'react';
import { SerialSceneInterpretation, SceneType } from '../types/llm';
import { Flame, Sparkles, Tv, Music2, Cpu, RotateCcw } from 'lucide-react';

interface ScenePanelProps {
  scene: SerialSceneInterpretation | null;
  onResetScene?: () => void;
}

const SCENE_COLORS: Record<SceneType, { badge: string; text: string; border: string }> = {
  NORMAL: { badge: 'bg-gray-800', text: 'text-gray-300', border: 'border-gray-700' },
  VILLAIN_ENTRANCE: { badge: 'bg-red-950', text: 'text-red-400', border: 'border-red-600' },
  SHOCK: { badge: 'bg-amber-950', text: 'text-amber-300', border: 'border-amber-500' },
  BETRAYAL: { badge: 'bg-rose-950', text: 'text-rose-400', border: 'border-rose-600' },
  SAD_REVELATION: { badge: 'bg-blue-950', text: 'text-blue-300', border: 'border-blue-500' },
  EMOTIONAL_CONFRONTATION: { badge: 'bg-purple-950', text: 'text-purple-300', border: 'border-purple-500' },
  ROMANTIC_TENSION: { badge: 'bg-pink-950', text: 'text-pink-300', border: 'border-pink-500' },
  SUSPICIOUS_ARRIVAL: { badge: 'bg-orange-950', text: 'text-orange-300', border: 'border-orange-500' },
  COMIC_RELIEF: { badge: 'bg-emerald-950', text: 'text-emerald-300', border: 'border-emerald-500' },
  CLIFFHANGER: { badge: 'bg-red-900', text: 'text-red-200', border: 'border-red-500' },
  CHARACTER_EXIT: { badge: 'bg-slate-900', text: 'text-slate-300', border: 'border-slate-600' },
  GENERAL_DRAMA: { badge: 'bg-indigo-950', text: 'text-indigo-300', border: 'border-indigo-500' },
};

export const ScenePanel: React.FC<ScenePanelProps> = ({ scene, onResetScene }) => {
  if (!scene) {
    return (
      <div className="glass-panel p-6 w-full border border-white/10 text-center flex flex-col items-center justify-center">
        <Tv className="w-8 h-8 text-gray-600 mb-2" />
        <h4 className="text-sm font-mono uppercase text-gray-400">Waiting for first scene interpretation...</h4>
        <p className="text-xs text-gray-600 mt-1">
          Perform actions in front of the camera (smile, frown, look shocked, enter/exit)
        </p>
      </div>
    );
  }

  const colors = SCENE_COLORS[scene.sceneType] || SCENE_COLORS.GENERAL_DRAMA;

  return (
    <div
      className={`glass-panel p-6 w-full relative overflow-hidden transition-all duration-500 border-2 ${colors.border}`}
      style={{
        boxShadow: `0 0 35px ${colors.border.replace('border-', '') === 'red-600' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(59, 130, 246, 0.2)'}`,
      }}
    >
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-white/10 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full uppercase tracking-wider font-bold text-[11px] border ${colors.badge} ${colors.text} ${colors.border}`}
          >
            {scene.sceneType.replace(/_/g, ' ')}
          </span>

          <span className="flex items-center gap-1 text-gray-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
            <Music2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Audio: <b className="text-white">{scene.audioCategory}</b></span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-gray-400 text-[11px]">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {scene.source === 'gemini' ? 'Gemini 2.5 Flash' : 'Local Fallback Classifier'}
            </span>
          </span>

          {onResetScene && (
            <button
              onClick={onResetScene}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-900/80 hover:bg-gray-800 border border-white/10 text-[11px] text-gray-300 hover:text-white transition-all cursor-pointer"
              title="Reset scene to waiting state"
            >
              <RotateCcw className="w-3 h-3 text-red-400" />
              <span>RESET SCENE</span>
            </button>
          )}
        </div>
      </div>

      {/* Dramatic Headline */}
      <h2
        className="text-xl md:text-2xl font-extrabold tracking-wide uppercase mb-3 text-white"
        style={{ fontFamily: 'var(--font-serif)', letterSpacing: '0.05em' }}
      >
        "{scene.headline}"
      </h2>

      {/* Dramatic Narration Ticker */}
      <p className="text-sm md:text-base text-gray-300 italic mb-5 leading-relaxed font-sans bg-black/40 p-4 rounded-xl border border-white/5">
        « {scene.narration} »
      </p>

      {/* Drama Level Gauge */}
      <div className="w-full bg-black/60 rounded-xl p-3 border border-white/10 flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="flex items-center gap-1 text-red-400 font-bold">
            <Flame className="w-3.5 h-3.5 animate-pulse" />
            SERIAL DRAMA LEVEL
          </span>
          <span className="text-white font-bold">{scene.dramaticLevel}%</span>
        </div>

        <div className="w-full h-3 bg-gray-900 rounded-full overflow-hidden p-0.5 border border-white/10">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.max(5, Math.min(100, scene.dramaticLevel))}%`,
              background: 'linear-gradient(90deg, #f59e0b 0%, #ef4444 60%, #991b1b 100%)',
              boxShadow: '0 0 15px rgba(239, 68, 68, 0.7)',
            }}
          />
        </div>
      </div>
    </div>
  );
};
