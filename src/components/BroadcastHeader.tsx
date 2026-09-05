import React from 'react';
import { Sparkles, Tv, Volume2, VolumeX, Camera, CameraOff, Download, Radio, ShieldCheck } from 'lucide-react';

interface BroadcastHeaderProps {
  isCameraActive: boolean;
  isAudioPlaying: boolean;
  isMuted: boolean;
  activeTab: string;
  onNavigate: (sectionId: string) => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
}

export const BroadcastHeader: React.FC<BroadcastHeaderProps> = ({
  isCameraActive,
  isAudioPlaying,
  isMuted,
  activeTab,
  onNavigate,
  onToggleMute,
  onToggleCamera,
}) => {
  return (
    <header className="sticky top-4 z-50 w-full max-w-6xl mx-auto px-4 sm:px-6">
      <div className="glass-card flex items-center justify-between gap-3 px-4 py-2.5 sm:px-5 sm:py-3 border border-white/10 bg-black/60 backdrop-blur-2xl">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-800 shadow-md shadow-purple-950/60 border border-purple-400/30">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-black" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-bold tracking-tight text-white font-sans">
              SERIAL<span className="text-purple-400 font-extrabold">OS</span>
            </span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-purple-950/60 border border-purple-500/30 text-purple-300">
              v2.4
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-full p-1 text-xs font-medium text-zinc-400">
          <button
            onClick={() => onNavigate('workbench')}
            className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
              activeTab === 'workbench' ? 'text-white bg-white/10 font-semibold' : 'hover:text-zinc-200'
            }`}
          >
            Workbench
          </button>
          <button
            onClick={() => onNavigate('deployments')}
            className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
              activeTab === 'deployments' ? 'text-white bg-white/10 font-semibold' : 'hover:text-zinc-200'
            }`}
          >
            Deployments
          </button>
          <button
            onClick={() => onNavigate('soundtracks')}
            className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
              activeTab === 'soundtracks' ? 'text-white bg-white/10 font-semibold' : 'hover:text-zinc-200'
            }`}
          >
            Soundtracks
          </button>
          <button
            onClick={() => onNavigate('dimension')}
            className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
              activeTab === 'dimension' ? 'text-white bg-white/10 font-semibold' : 'hover:text-zinc-200'
            }`}
          >
            Dimension
          </button>
        </nav>

        {/* Right Actions & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Indicator Pill */}
          <div className="flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-white/[0.04] border border-white/10 font-mono text-[11px]">
            <span
              className={`w-2 h-2 rounded-full ${
                isCameraActive
                  ? 'bg-red-500 animate-pulse-dot shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                  : 'bg-emerald-500'
              }`}
            />
            <span className={isCameraActive ? 'text-red-400 font-bold' : 'text-zinc-400 font-medium'}>
              {isCameraActive ? 'LIVE' : 'STANDBY'}
            </span>
          </div>

          {/* Audio Mute / Waveform Toggle */}
          <button
            onClick={onToggleMute}
            className={`flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border font-mono text-xs transition-all cursor-pointer ${
              isMuted
                ? 'bg-red-950/40 border-red-500/40 text-red-300'
                : 'bg-white/[0.04] border-white/10 text-zinc-300 hover:border-white/20'
            }`}
            title={isMuted ? 'Unmute Audio Score' : 'Mute Audio Score'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-purple-400" />
            )}

            {isAudioPlaying && !isMuted && (
              <div className="flex items-center gap-0.5 h-3.5 px-0.5">
                <span className="w-0.5 bg-purple-400 rounded-full audio-bar-1" />
                <span className="w-0.5 bg-indigo-400 rounded-full audio-bar-2" />
                <span className="w-0.5 bg-purple-300 rounded-full audio-bar-3" />
                <span className="w-0.5 bg-pink-400 rounded-full audio-bar-4" />
              </div>
            )}
          </button>

          {/* Camera Launch Button */}
          <button
            onClick={onToggleCamera}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              isCameraActive
                ? 'bg-red-950/70 border border-red-500/60 text-red-200 hover:bg-red-900/80 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                : 'btn-glow-purple text-white'
            }`}
          >
            {isCameraActive ? <CameraOff className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isCameraActive ? 'Cut Cam' : 'Launch Cam'}</span>
          </button>

          {/* Project Source Archive */}
          <a
            href="/serialos_complete_with_modules.zip"
            download="serialos_complete_with_modules.zip"
            className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-zinc-400 hover:text-white transition-all"
            title="Download full project source archive"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>Zip</span>
          </a>
        </div>
      </div>
    </header>
  );
};
