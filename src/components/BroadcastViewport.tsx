import React, { useRef, useEffect, useState } from 'react';
import { Camera, Flame, Volume2, Maximize2, Minimize2, Radio, ScanLine } from 'lucide-react';
import { CameraState, TrackedFace } from '../types/vision';
import { SerialSceneInterpretation } from '../types/llm';
import { FaceOverlay } from './FaceOverlay';

interface BroadcastViewportProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraState: CameraState;
  trackedFaces: TrackedFace[];
  currentScene: SerialSceneInterpretation | null;
  onStartCamera: () => void;
  onStopCamera: () => void;
}

export const BroadcastViewport: React.FC<BroadcastViewportProps> = ({
  videoRef,
  cameraState,
  trackedFaces,
  currentScene,
  onStartCamera,
}) => {
  const [vfxAnimation, setVfxAnimation] = useState<'triple-zoom' | 'shake' | 'flash-crimson' | 'flash-gold' | 'flash-lime' | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showScanlines, setShowScanlines] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Trigger dramatic VFX whenever the scene changes dramatically
  useEffect(() => {
    if (!currentScene) return;

    if (currentScene.sceneType === 'SHOCK' || currentScene.audioCategory === 'SHOCK') {
      setVfxAnimation('triple-zoom');
      const timer = setTimeout(() => setVfxAnimation(null), 950);
      return () => clearTimeout(timer);
    } else if (currentScene.sceneType === 'VILLAIN_ENTRANCE' || currentScene.audioCategory === 'VILLAIN') {
      setVfxAnimation('flash-crimson');
      const timer = setTimeout(() => setVfxAnimation(null), 750);
      return () => clearTimeout(timer);
    } else if (currentScene.dramaticLevel >= 80) {
      setVfxAnimation('shake');
      const timer = setTimeout(() => setVfxAnimation(null), 500);
      return () => clearTimeout(timer);
    }
  }, [currentScene]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-xl overflow-hidden bg-black transition-all duration-300 border ${
        cameraState.isActive ? 'border-[#84cc16]/50 shadow-[0_0_20px_rgba(132,204,22,0.15)]' : 'border-white/10'
      } ${isFullscreen ? 'h-screen w-screen rounded-none' : 'aspect-video min-h-[300px] sm:min-h-[380px]'}`}
    >
      {/* Video stream with conditional dramatic animations */}
      <div
        className={`w-full h-full relative overflow-hidden ${
          vfxAnimation === 'triple-zoom'
            ? 'animate-triple-zoom'
            : vfxAnimation === 'shake'
            ? 'animate-shake'
            : ''
        }`}
      >
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`w-full h-full object-cover camera-mirror transition-opacity duration-300 ${
            cameraState.isActive ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'
          }`}
        />

        {/* Scanlines & Cinematic Vignette */}
        {cameraState.isActive && (
          <>
            {showScanlines && <div className="scanline-overlay" />}
            <div className="cinematic-vignette" />
          </>
        )}

        {/* Dramatic VFX Lightning Flash Overlay */}
        {vfxAnimation === 'flash-crimson' && (
          <div className="absolute inset-0 z-20 pointer-events-none animate-flash-crimson" />
        )}
        {vfxAnimation === 'triple-zoom' && (
          <div className="absolute inset-0 z-20 pointer-events-none animate-flash-lime" />
        )}

        {/* Face Bounding Box & Emotion Reticle HUD */}
        {cameraState.isActive && <FaceOverlay faces={trackedFaces} />}
      </div>

      {/* Broadcast HUD Overlay */}
      {cameraState.isActive && (
        <>
          {/* Top Bar HUD */}
          <div className="absolute top-3 left-3 right-3 z-20 flex justify-between items-center pointer-events-none select-none">
            {/* Left: Stream Info */}
            <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/10 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-dot shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              <span className="text-zinc-200 font-bold tracking-wider">PARAMBARAHUB LIVE</span>
              <span className="text-zinc-500">|</span>
              <span className="text-[#84cc16]">EP. 404</span>
            </div>

            {/* Right: Controls & Toggles */}
            <div className="flex items-center gap-1.5 pointer-events-auto">
              <button
                onClick={() => setShowScanlines(!showScanlines)}
                className={`p-1.5 rounded-md border transition-all cursor-pointer ${
                  showScanlines ? 'bg-[#84cc16]/20 border-[#84cc16]/50 text-[#84cc16]' : 'bg-black/60 border-white/15 text-zinc-400'
                }`}
                title="Toggle Scanlines"
              >
                <ScanLine className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-md bg-black/60 hover:bg-black/90 border border-white/15 text-zinc-300 hover:text-white transition-all cursor-pointer"
                title={isFullscreen ? 'Exit Fullscreen' : 'Cinema Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* LOWER-THIRD STRIP: Encapsulated Serial Narrative */}
          <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none select-none p-3 sm:p-4 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col gap-2">
            {currentScene ? (
              <div className="flex flex-col gap-1.5 pointer-events-auto bg-black/75 backdrop-blur-xl p-3 rounded-lg border border-white/10 shadow-2xl">
                {/* Meta Header */}
                <div className="flex items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded uppercase font-bold text-[10px] tracking-wider bg-white/[0.06] border border-white/10 text-[#84cc16]">
                      {currentScene.sceneType.replace(/_/g, ' ')}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-zinc-300 bg-white/[0.04] px-2 py-0.5 rounded border border-white/10">
                      <Volume2 className="w-3 h-3 text-[#84cc16]" />
                      <span>{currentScene.audioCategory}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-[#84cc16] font-bold font-mono">
                    <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                    <span>DRAMA {currentScene.dramaticLevel}%</span>
                  </div>
                </div>

                {/* Headline */}
                <h2 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-white line-clamp-1">
                  "{currentScene.headline}"
                </h2>

                {/* Narration */}
                <p className="text-xs text-zinc-300 italic font-sans line-clamp-2">
                  « {currentScene.narration} »
                </p>

                {/* Drama Intensity Bar */}
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-0.5">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.max(5, Math.min(100, currentScene.dramaticLevel))}%`,
                      background: 'linear-gradient(90deg, #84cc16 0%, #f59e0b 60%, #ef4444 100%)',
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 bg-black/75 backdrop-blur-md px-3.5 py-2 rounded-lg border border-white/10">
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-[#84cc16] animate-pulse" />
                  <span>Tracking character expressions & dramatic glances...</span>
                </div>
                <span className="text-[11px] text-zinc-500">
                  {trackedFaces.length === 0 ? 'No characters in frame' : `${trackedFaces.length} active`}
                </span>
              </div>
            )}
          </div>
        </>
      )}

      {/* STANDBY HERO STATE (Camera Off) */}
      {!cameraState.isActive && !cameraState.isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#09090b]/95 z-10">
          <div className="w-14 h-14 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-4">
            <Camera className="w-7 h-7 text-[#84cc16]" />
          </div>

          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white mb-2 font-sans">
            Ready for Parambara Drama
          </h3>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
            Turn your webcam into an authentic Malayalam TV mega-serial scene. Expressions and accidental glances trigger live serial scores, lower-thirds, and triple-zooms.
          </p>

          <button
            onClick={onStartCamera}
            className="btn-lime px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Launch Stream</span>
          </button>
        </div>
      )}

      {/* Loading State */}
      {cameraState.isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-30">
          <div className="w-8 h-8 border-2 border-[#84cc16]/20 border-t-[#84cc16] rounded-full animate-spin mb-3" />
          <p className="text-xs font-mono font-medium text-zinc-300 tracking-wider">
            INITIALIZING HIGH-DEFINITION CAMERA...
          </p>
        </div>
      )}
    </div>
  );
};
