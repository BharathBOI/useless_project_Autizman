import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, RotateCcw, Play } from 'lucide-react';
import { audioEngine } from '../audio/audioEngine';
import { eventEngine } from '../events/eventEngine';
import { faceTracker } from '../vision/faceTracker';
import { personTracker } from '../vision/personTracker';
import { temporalTracker } from '../vision/temporalTracker';
import { AudioEngineState } from '../types/audio';

export const AudioControls: React.FC = () => {
  const [audioState, setAudioState] = useState<AudioEngineState>({
    isMuted: false,
    masterVolume: 0.8,
    activePreset: 'NONE',
    activeCategory: 'NONE',
    isPlaying: false,
    intensity: 80
  });

  useEffect(() => {
    const unsubscribe = audioEngine.subscribe(setAudioState);
    return () => unsubscribe();
  }, []);

  const handleMuteToggle = () => {
    audioEngine.setMute(!audioState.isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    audioEngine.setMasterVolume(val);
  };

  const handleResetScene = () => {
    faceTracker.reset();
    temporalTracker.reset();
    personTracker.reset();
    eventEngine.reset();
  };

  const playTestPreset = (category: 'VILLAIN' | 'SHOCK' | 'SAD' | 'SUSPENSE') => {
    audioEngine.playCategory(category, 85, 4, true);
  };

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
      {/* Volume & Mute Controls */}
      <div className="flex items-center space-x-4 w-full md:w-auto">
        <button
          onClick={handleMuteToggle}
          className={`p-3 rounded-xl border font-bold text-sm flex items-center space-x-2 transition-all cursor-pointer ${
            audioState.isMuted
              ? 'bg-rose-950/80 border-rose-800 text-rose-400 hover:bg-rose-900'
              : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
          }`}
        >
          {audioState.isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-amber-400" />}
          <span>{audioState.isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO'}</span>
        </button>

        <div className="flex items-center space-x-3 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 flex-1 md:w-48">
          <Volume2 className="w-4 h-4 text-slate-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={audioState.masterVolume}
            onChange={handleVolumeChange}
            disabled={audioState.isMuted}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <span className="text-xs font-mono text-slate-400 w-8">
            {Math.round(audioState.masterVolume * 100)}%
          </span>
        </div>
      </div>

      {/* Preset Sound Test Triggers */}
      <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:inline">
          TEST SOUNDS:
        </span>
        <button
          onClick={() => playTestPreset('VILLAIN')}
          className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 border border-red-800/80 text-red-300 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
        >
          <Play className="w-3 h-3" />
          <span>VILLAIN</span>
        </button>
        <button
          onClick={() => playTestPreset('SHOCK')}
          className="px-3 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800/80 text-amber-300 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
        >
          <Play className="w-3 h-3" />
          <span>SHOCK</span>
        </button>
        <button
          onClick={() => playTestPreset('SAD')}
          className="px-3 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/80 border border-blue-800/80 text-blue-300 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
        >
          <Play className="w-3 h-3" />
          <span>SAD</span>
        </button>
        <button
          onClick={() => playTestPreset('SUSPENSE')}
          className="px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/80 text-purple-300 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
        >
          <Play className="w-3 h-3" />
          <span>SUSPENSE</span>
        </button>
      </div>

      {/* Reset Scene Button */}
      <button
        onClick={handleResetScene}
        className="w-full md:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
      >
        <RotateCcw className="w-4 h-4 text-amber-400" />
        <span>RESET SCENE</span>
      </button>
    </div>
  );
};

