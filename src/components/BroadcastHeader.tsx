import React from 'react';
import { Clapperboard, Tv, Sliders, Volume2, VolumeX, Download, Camera, CameraOff } from 'lucide-react';

interface BroadcastHeaderProps {
  isCameraActive: boolean;
  isAudioPlaying: boolean;
  isMuted: boolean;
  activeMode: 'broadcast' | 'studio';
  onToggleMode: (mode: 'broadcast' | 'studio') => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
}

export const BroadcastHeader: React.FC<BroadcastHeaderProps> = ({
  isCameraActive,
  isAudioPlaying,
  isMuted,
  activeMode,
  onToggleMode,
  onToggleMute,
  onToggleCamera,
}) => {
  return (
    <header className="w-full max-w-6xl flex flex-wrap items-center justify-between gap-4 py-3 px-4 md:px-6 rounded-2xl glass-panel border border-white/10 mb-5">
      {/* Brand & Broadcast Status */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-950 flex items-center justify-center border border-red-500/40 shadow-lg shadow-red-950/60">
          <Clapperboard className="w-5 h-5 text-white animate-pulse" />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xl md:text-2xl font-extrabold tracking-widest serial-title">
              SERIALOS
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border border-red-500/30 bg-red-950/40 text-red-300">
              MALAYALAM MEGA-SERIAL ENGINE
            </span>
          </div>
          <span className="text-xs text-gray-400 font-serif italic">
            "Your life deserves a background score."
          </span>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center flex-wrap gap-2 sm:gap-3">
        {/* On Air Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 font-mono text-xs">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isCameraActive ? 'bg-red-500 animate-pulse-dot shadow-red-500 shadow-md' : 'bg-gray-600'
            }`}
          />
          <span className={isCameraActive ? 'text-red-400 font-bold' : 'text-gray-400'}>
            {isCameraActive ? 'ON AIR' : 'STANDBY'}
          </span>
        </div>

        {/* Audio Visualizer & Mute Toggle */}
        <button
          onClick={onToggleMute}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-xs font-semibold transition-all cursor-pointer ${
            isMuted
              ? 'bg-red-950/70 border-red-500/60 text-red-300'
              : 'bg-black/50 border-white/15 text-gray-200 hover:border-white/35'
          }`}
          title={isMuted ? 'Unmute Audio Score' : 'Mute Audio Score'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-red-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          )}

          {/* Mini dynamic audio waveform bars when music is playing */}
          {isAudioPlaying && !isMuted && (
            <div className="flex items-center gap-0.5 h-4 px-1">
              <span className="w-1 bg-amber-400 rounded-full audio-bar-1" />
              <span className="w-1 bg-red-500 rounded-full audio-bar-2" />
              <span className="w-1 bg-amber-300 rounded-full audio-bar-3" />
              <span className="w-1 bg-red-400 rounded-full audio-bar-4" />
            </div>
          )}

          <span className="hidden sm:inline">{isMuted ? 'MUTED' : 'AUDIO ON'}</span>
        </button>

        {/* Mode Switcher: Broadcast (Cinema TV) vs Studio (Director Console) */}
        <div className="flex items-center p-1 rounded-xl bg-black/70 border border-white/10">
          <button
            onClick={() => onToggleMode('broadcast')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
              activeMode === 'broadcast'
                ? 'bg-red-700 text-white font-bold shadow-md shadow-red-900/50'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>CINEMA</span>
          </button>
          <button
            onClick={() => onToggleMode('studio')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
              activeMode === 'studio'
                ? 'bg-red-700 text-white font-bold shadow-md shadow-red-900/50'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>STUDIO</span>
          </button>
        </div>

        {/* Camera Toggle Button */}
        <button
          onClick={onToggleCamera}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer ${
            isCameraActive
              ? 'bg-red-950/80 border-red-500 text-red-200 hover:bg-red-900'
              : 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200 hover:bg-emerald-900/80'
          }`}
        >
          {isCameraActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
          <span>{isCameraActive ? 'CUT CAM' : 'START CAM'}</span>
        </button>

        {/* Download Project Zip */}
        <a
          href="/serialos_v1.zip"
          download="serialos_v1.zip"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-gray-300 hover:text-white transition-all shadow-sm"
          title="Download complete project source archive"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>ZIP</span>
        </a>
      </div>
    </header>
  );
};
