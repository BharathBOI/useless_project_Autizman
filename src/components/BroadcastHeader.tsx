import React from 'react';
import { Volume2, VolumeX, Camera, CameraOff, Download, Github } from 'lucide-react';

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
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#09090b]/90 backdrop-blur-md px-4 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Watermelon UI-styled Logo */}
        <div className="flex items-center gap-3">
          {/* Neon lime logo icon matching Watermelon UI reference */}
          <div className="flex items-center gap-1">
            <svg viewBox="0 0 32 32" className="w-7 h-7 text-[#84cc16] fill-current">
              <path d="M6 10a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V10zm5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-5 6a5 5 0 0 1-4.9-4h9.8A5 5 0 0 1 16 19z" />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-white font-mono uppercase">
              PARAMBARA<span className="text-[#84cc16]">HUB</span>
            </span>
          </div>
        </div>

        {/* Center Navigation Links matching Watermelon UI */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono font-medium text-zinc-400 tracking-wider">
          <button
            onClick={() => onNavigate('workbench')}
            className={`transition-colors cursor-pointer uppercase ${
              activeTab === 'workbench' ? 'text-white font-bold' : 'hover:text-zinc-200'
            }`}
          >
            Showcases
          </button>
          <button
            onClick={() => onNavigate('soundtracks')}
            className={`transition-colors cursor-pointer uppercase ${
              activeTab === 'soundtracks' ? 'text-white font-bold' : 'hover:text-zinc-200'
            }`}
          >
            Soundtracks
          </button>
          <button
            onClick={() => onNavigate('deployments')}
            className={`transition-colors cursor-pointer uppercase ${
              activeTab === 'deployments' ? 'text-white font-bold' : 'hover:text-zinc-200'
            }`}
          >
            Developers
          </button>
        </nav>

        {/* Right Actions matching Watermelon UI */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Status Indicator Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/10 font-mono text-[11px]">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isCameraActive
                  ? 'bg-red-500 animate-pulse-dot shadow-[0_0_6px_rgba(239,68,68,0.8)]'
                  : 'bg-[#84cc16]'
              }`}
            />
            <span className={isCameraActive ? 'text-red-400 font-bold' : 'text-zinc-400'}>
              {isCameraActive ? 'LIVE' : 'STANDBY'}
            </span>
          </div>

          {/* Audio Mute Toggle */}
          <button
            onClick={onToggleMute}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border font-mono text-xs transition-all cursor-pointer ${
              isMuted
                ? 'bg-red-950/40 border-red-500/40 text-red-300'
                : 'bg-white/[0.03] border-white/10 text-zinc-300 hover:border-white/20'
            }`}
            title={isMuted ? 'Unmute Audio Score' : 'Mute Audio Score'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-[#84cc16]" />
            )}

            {isAudioPlaying && !isMuted && (
              <div className="flex items-center gap-0.5 h-3 px-0.5">
                <span className="w-0.5 bg-[#84cc16] rounded-full audio-bar-1" />
                <span className="w-0.5 bg-[#a3e635] rounded-full audio-bar-2" />
                <span className="w-0.5 bg-[#84cc16] rounded-full audio-bar-3" />
                <span className="w-0.5 bg-[#65a30d] rounded-full audio-bar-4" />
              </div>
            )}
          </button>

          {/* GitHub Icon Link */}
          <a
            href="https://github.com/tinkerhub"
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-md border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white transition-colors"
            title="GitHub Repository"
          >
            <Github className="w-3.5 h-3.5" />
          </a>

          {/* Primary Watermelon-style Solid Lime Button */}
          <button
            onClick={onToggleCamera}
            className={`btn-lime px-4 py-1.5 rounded-md text-xs tracking-wider flex items-center gap-1.5 cursor-pointer ${
              isCameraActive ? 'bg-red-600 hover:bg-red-500 text-white' : ''
            }`}
          >
            {isCameraActive ? <CameraOff className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
            <span>{isCameraActive ? 'CUT CAM' : 'GET STARTED'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
