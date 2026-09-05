import React from 'react';
import { AudioEngine, DramaticPresetName, PRESET_CALIBRATION } from '../audio/audioEngine';
import { Volume2, VolumeX, Square, Play, Music } from 'lucide-react';

interface AudioControlsProps {
  audioEngine: AudioEngine;
  currentPreset: DramaticPresetName | null;
  isMuted: boolean;
  onToggleMute: () => void;
  onStopAudio: () => void;
  onPlayPreset: (preset: DramaticPresetName) => void;
}

const PRESET_GROUPS: Array<{
  category: string;
  color: string;
  presets: Array<{ id: DramaticPresetName; label: string; serial: string }>;
}> = [
  {
    category: '⚡ SHOCK (Audio 30, 26, 23)',
    color: 'border-amber-500/50 text-amber-400 bg-amber-950/25',
    presets: [
      { id: 'SHOCK_1', label: 'SHOCK 1', serial: 'Audio 30 • Chandanamazha' },
      { id: 'SHOCK_2', label: 'SHOCK 2', serial: 'Audio 26 • Chembaneer Poovu' },
      { id: 'SHOCK_3', label: 'SHOCK 3', serial: 'Audio 23 • Chandana Mazha' },
    ],
  },
  {
    category: '🐍 VILLAIN (Audio 29, Aleena, Elsamma)',
    color: 'border-red-500/50 text-red-400 bg-red-950/25',
    presets: [
      { id: 'VILLAIN_1', label: 'VILLAIN 1', serial: 'Audio 29 • Chembarathi' },
      { id: 'VILLAIN_2', label: 'VILLAIN 2', serial: 'Mazha Thorum Munpe (Aleena)' },
      { id: 'VILLAIN_3', label: 'VILLAIN 3', serial: 'Mazha Thorum Munpe (Elsamma)' },
    ],
  },
  {
    category: '💔 SAD & TRAGEDY (Audio 33, 32)',
    color: 'border-blue-500/50 text-blue-300 bg-blue-950/25',
    presets: [
      { id: 'SAD_1', label: 'SAD 1', serial: 'Audio 33 • Patharamattu' },
      { id: 'SAD_2', label: 'SAD 2', serial: 'Audio 32 • Amme Mookambika' },
      { id: 'SAD_3', label: 'SAD 3', serial: 'Mizhi Randilum' },
    ],
  },
  {
    category: '⏳ SUSPENSE (Audio 36, 21)',
    color: 'border-purple-500/50 text-purple-300 bg-purple-950/25',
    presets: [
      { id: 'SUSPENSE_1', label: 'SUSPENSE 1', serial: 'Audio 36 • Chattambi Paaru' },
      { id: 'SUSPENSE_2', label: 'SUSPENSE 2', serial: 'Audio 21 • Ramadevi BGM' },
    ],
  },
  {
    category: '🏔️ CLIFFHANGER (Audio 38)',
    color: 'border-rose-500/50 text-rose-300 bg-rose-950/25',
    presets: [
      { id: 'CLIFFHANGER_1', label: 'CLIFFHANGER', serial: 'Audio 38 • Patharamattu' },
    ],
  },
  {
    category: '🚪 ENTRANCE & EXIT (Audio 35, 34)',
    color: 'border-emerald-500/50 text-emerald-300 bg-emerald-950/25',
    presets: [
      { id: 'ENTRANCE_STING', label: 'ENTRANCE', serial: 'Audio 35 • Amme Mookambike' },
      { id: 'EXIT_STING', label: 'EXIT', serial: 'Audio 34 • Parasparam' },
    ],
  },
  {
    category: '🌟 HAPPY VIBE (Audio 20)',
    color: 'border-yellow-500/50 text-yellow-300 bg-yellow-950/25',
    presets: [
      { id: 'HAPPY_1', label: 'HAPPY 1', serial: 'Audio 20 • Ponnambili Happy' },
    ],
  },
];

export const AudioControls: React.FC<AudioControlsProps> = ({
  currentPreset,
  isMuted,
  onToggleMute,
  onStopAudio,
  onPlayPreset,
}) => {
  return (
    <div className="glass-panel p-6 w-full border border-white/10 flex flex-col gap-5">
      {/* Top Header & Master Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-red-400 animate-pulse" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
            SERIAL BGM SOUNDBOARD (CALIBRATED)
          </h3>
          {currentPreset && (
            <span className="px-3 py-0.5 rounded-full bg-red-900/60 border border-red-500/40 text-[10px] font-mono text-red-200 animate-pulse">
              ▶ PLAYING: {PRESET_CALIBRATION[currentPreset]?.label || currentPreset}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMute}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all cursor-pointer ${
              isMuted
                ? 'bg-red-950/80 border-red-500 text-red-200'
                : 'bg-black/50 border-white/20 text-gray-300 hover:border-white/40'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? 'UNMUTE' : 'MUTE'}</span>
          </button>

          {currentPreset && (
            <button
              onClick={onStopAudio}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono text-gray-300 bg-gray-800/80 hover:bg-gray-700 border border-white/10 cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 text-red-400" />
              <span>STOP</span>
            </button>
          )}
        </div>
      </div>

      {/* Preset Audition Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PRESET_GROUPS.map((group) => (
          <div
            key={group.category}
            className={`p-3.5 rounded-xl border flex flex-col gap-2 ${group.color}`}
          >
            <span className="text-[11px] font-mono font-bold tracking-wider opacity-90">
              {group.category}
            </span>

            <div className="flex flex-col gap-1.5">
              {group.presets.map((preset) => {
                const isPlaying = currentPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => onPlayPreset(preset.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-all text-left cursor-pointer border ${
                      isPlaying
                        ? 'bg-red-600 text-white font-bold border-red-400 shadow-lg shadow-red-600/40 scale-[1.02]'
                        : 'bg-black/40 hover:bg-black/70 text-gray-200 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">{preset.label}</span>
                      <span className="text-[10px] text-gray-400 truncate max-w-[200px]">
                        {preset.serial}
                      </span>
                    </div>
                    <Play
                      className={`w-3.5 h-3.5 flex-shrink-0 ${
                        isPlaying ? 'fill-white' : 'text-gray-400'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
