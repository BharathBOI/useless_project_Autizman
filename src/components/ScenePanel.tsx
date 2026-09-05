import React from 'react';
import { Film, Flame, Volume2, ShieldAlert, Sparkles } from 'lucide-react';
import { DramaticScene } from '../types/llm';

interface ScenePanelProps {
  scene: DramaticScene;
}

export const ScenePanel: React.FC<ScenePanelProps> = ({ scene }) => {
  const getAudioBadgeColor = (category: string) => {
    switch (category) {
      case 'VILLAIN':
        return 'bg-red-950/90 text-red-400 border-red-800';
      case 'SHOCK':
        return 'bg-amber-950/90 text-amber-300 border-amber-700 animate-pulse';
      case 'SAD':
        return 'bg-blue-950/90 text-blue-400 border-blue-800';
      case 'SUSPENSE':
        return 'bg-purple-950/90 text-purple-300 border-purple-800';
      case 'ROMANTIC':
        return 'bg-rose-950/90 text-rose-300 border-rose-800';
      case 'COMEDY':
        return 'bg-emerald-950/90 text-emerald-300 border-emerald-800';
      case 'CLIFFHANGER':
        return 'bg-orange-950/90 text-orange-400 border-orange-700';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-2xl flex flex-col justify-between space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-800/60 text-red-500">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-500 font-serif">
              CURRENT SCENE
            </span>
            <h3 className="text-xl font-black font-serif text-amber-400 tracking-wide">
              {scene.headline || 'NORMAL INTERACTIONS'}
            </h3>
          </div>
        </div>

        {scene.isFallback && (
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-800/50 text-amber-400 text-xs font-semibold" title="Running local offline dramatic engine">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>FALLBACK ENGINE</span>
          </div>
        )}
      </div>

      {/* Dramatic Narration Box */}
      <div className="relative p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 italic text-slate-200 text-base leading-relaxed font-serif">
        <Sparkles className="w-4 h-4 text-amber-500 absolute top-3 right-3 opacity-60" />
        "{scene.narration || 'The camera is observing your world...'}"
      </div>

      {/* Meter Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Drama Level Gauge */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <div className="flex items-center space-x-1.5 text-amber-500">
              <Flame className="w-4 h-4" />
              <span>DRAMA LEVEL</span>
            </div>
            <span className="text-slate-100 font-mono text-sm">{scene.dramaticLevel}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 transition-all duration-500"
              style={{ width: `${Math.max(5, Math.min(100, scene.dramaticLevel))}%` }}
            />
          </div>
        </div>

        {/* Audio Status */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <div className="flex items-center space-x-1.5 text-red-400">
              <Volume2 className="w-4 h-4" />
              <span>AUDIO SCORE</span>
            </div>
            <span className="text-slate-100 font-mono text-xs">{scene.audioIntensity}% INTENSITY</span>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold tracking-wider uppercase ${getAudioBadgeColor(
                scene.audioCategory
              )}`}
            >
              {scene.audioCategory === 'NONE' ? 'NO AUDIO' : `${scene.audioCategory} MOTIF`}
            </span>
            <span className="text-xs text-slate-500">
              ({scene.sceneType})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

