import React, { useRef, useEffect, useState } from 'react';
import { Camera, Sparkles, Flame, Volume2, Maximize2, Minimize2, Radio, ScanLine } from 'lucide-react';
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
  const [vfxAnimation, setVfxAnimation] = useState<'triple-zoom' | 'shake' | 'flash-crimson' | 'flash-gold' | 'flash-purple' | null>(null);
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
        cameraState.isActive ? 'border-purple-500/40 shadow-[0_0_30px_rgba(147,51,234,0.2)]' : 'border-white/10'
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
          <div className="absolute inset-0 z-20 pointer-events-none animate-flash-purple" />
        )}

        {/* Face Bounding Box & Emotion Reticle HUD */}
        {cameraState.isActive && <FaceOverlay faces={trackedFaces} />}
      </div>

      {/* Broadcast Television HUD Overlay */}
      {cameraState.isActive && (
        <>
          {/* Top Bar HUD */}
          <div className="absolute top-3 left-3 right-3 z-20 flex justify-between items-center pointer-events-none select-none">
            {/* Left: Stream Info */}
            <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-dot shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              <span className="text-zinc-200 font-semibold tracking-wider">LIVE FEED</span>
              <span className="text-zinc-500">|</span>
              <span className="text-purple-300">EP. 404</span>
            </div>

            {/* Right: Controls & Toggles */}
            <div className="flex items-center gap-1.5 pointer-events-auto">
              <button
                onClick={() => setShowScanlines(!showScanlines)}
                className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                  showScanlines ? 'bg-purple-950/60 border-purple-500/40 text-purple-300' : 'bg-black/60 border-white/15 text-zinc-400'
                }`}
                title="Toggle Scanlines"
              >
                <ScanLine className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-full bg-black/60 hover:bg-black/90 border border-white/15 text-zinc-300 hover:text-white transition-all cursor-pointer"
                title={isFullscreen ? 'Exit Fullscreen' : 'Cinema Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* LOWER-THIRD STRIP: Encapsulated Serial Narrative */}
          <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none select-none p-3 sm:p-4 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col gap-2">
            {currentScene ? (
              <div className="flex flex-col gap-1.5 pointer-events-auto bg-black/60 backdrop-blur-xl p-3 rounded-xl border border-white/10 shadow-2xl">
                {/* Meta Header */}
                <div className="flex items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md uppercase font-bold text-[10px] tracking-wider bg-purple-950/80 border border-purple-500/40 text-purple-300">
                      {currentScene.sceneType.replace(/_/g, ' ')}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-amber-300 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/10">
                      <Volume2 className="w-3 h-3 text-amber-400" />
                      <span>{currentScene.audioCategory}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-purple-300 font-bold">
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
                      background: 'linear-gradient(90deg, #8b5cf6 0%, #ec4899 50%, #ef4444 100%)',
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
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
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-zinc-950/90 via-black to-zinc-950/95 z-10">
          <div className="relative mb-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-600/30 to-indigo-950/40 border border-purple-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.25)]">
              <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400 animate-pulse" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-black" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2 font-sans">
            Ready For Real-Time Melodrama
          </h3>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
            Turn your webcam into an authentic Malayalam TV mega-serial scene. Micro-expressions and accidental entrances trigger live serial scores, lower-thirds, and iconic triple-zooms.
          </p>

          <button
            onClick={onStartCamera}
            className="btn-glow-purple px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold tracking-wide text-white uppercase flex items-center gap-2 cursor-pointer transition-all"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>Commence Broadcast</span>
          </button>
        </div>
      )}

      {/* Loading State */}
      {cameraState.isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-30">
          <div className="w-10 h-10 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-3" />
          <p className="text-xs font-mono font-medium text-zinc-300 tracking-wider">
            INITIALIZING HIGH-DEFINITION CAMERA...
          </p>
        </div>
      )}
    </div>
  );
};
