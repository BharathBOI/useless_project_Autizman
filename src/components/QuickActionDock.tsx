import React from 'react';
import { Zap, Skull, HeartCrack, VolumeX, RotateCcw } from 'lucide-react';
import { DramaticPresetName } from '../audio/audioEngine';

interface QuickActionDockProps {
  onTriggerCue: (preset: DramaticPresetName) => void;
  onSilence: () => void;
  onResetScene: () => void;
}

export const QuickActionDock: React.FC<QuickActionDockProps> = ({
  onTriggerCue,
  onSilence,
  onResetScene,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-2 px-4 py-2.5 rounded-2xl bg-black/65 backdrop-blur-xl border border-white/10 shadow-xl">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-bold px-2 py-0.5 rounded bg-red-950/60 border border-red-500/30">
          DIRECTOR QUICK CUES
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onTriggerCue('SHOCK_1')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 text-amber-200 text-xs font-mono font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Manually trigger dramatic shock cue & triple zoom"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>SHOCK CUT</span>
        </button>

        <button
          onClick={() => onTriggerCue('VILLAIN_1')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-200 text-xs font-mono font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Manually trigger villain entrance stinger"
        >
          <Skull className="w-3.5 h-3.5 text-red-400" />
          <span>VILLAIN STING</span>
        </button>

        <button
          onClick={() => onTriggerCue('SAD_1')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/40 text-blue-200 text-xs font-mono font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Manually trigger tragic violin melodrama"
        >
          <HeartCrack className="w-3.5 h-3.5 text-blue-400" />
          <span>TRAGEDY</span>
        </button>

        <button
          onClick={onSilence}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900/70 hover:bg-gray-800 border border-white/10 text-gray-300 text-xs font-mono font-semibold transition-all cursor-pointer"
          title="Stop any active background score"
        >
          <VolumeX className="w-3.5 h-3.5 text-gray-400" />
          <span>SILENCE</span>
        </button>

        <button
          onClick={onResetScene}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900/70 hover:bg-gray-800 border border-white/10 text-gray-300 text-xs font-mono font-semibold transition-all cursor-pointer"
          title="Reset drama scene"
        >
          <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
          <span>RESET</span>
        </button>
      </div>
    </div>
  );
};
