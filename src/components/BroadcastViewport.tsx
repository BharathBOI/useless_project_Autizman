import React, { useRef, useEffect, useState } from 'react';
import { Camera, ShieldCheck, Film, Sparkles, Flame, Volume2, Maximize2, Minimize2 } from 'lucide-react';
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
  onStopCamera,
}) => {
  const [vfxAnimation, setVfxAnimation] = useState<'triple-zoom' | 'shake' | 'flash-crimson' | 'flash-gold' | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
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

  const handleStart = () => {
    onStartCamera();
  };

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
      className={`relative w-full max-w-5xl mx-auto rounded-2xl overflow-hidden bg-black shadow-2xl transition-all duration-500 border-2 ${
        cameraState.isActive ? 'border-red-600/60 shadow-red-950/50' : 'border-white/10'
      } ${isFullscreen ? 'h-screen max-w-none rounded-none' : 'aspect-video'}`}
    >
      {/* Video element with conditional dramatic triple-zoom */}
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
            <div className="scanline-overlay" />
            <div className="cinematic-vignette" />
          </>
        )}

        {/* Dramatic VFX Lightning Flash Overlay */}
        {vfxAnimation === 'flash-crimson' && (
          <div className="absolute inset-0 z-20 pointer-events-none animate-flash-crimson" />
        )}
        {vfxAnimation === 'triple-zoom' && (
          <div className="absolute inset-0 z-20 pointer-events-none animate-flash-gold" />
        )}

        {/* Face Bounding Box & Emotion Reticle HUD */}
        {cameraState.isActive && <FaceOverlay faces={trackedFaces} />}
      </div>

      {/* BROADCAST TELEVISION HUD (Active State) */}
      {cameraState.isActive && (
        <>
          {/* Top Header Bug & Watermark */}
          <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none select-none">
            {/* Left: Live Channel Brand & Recording Indicator */}
            <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-red-500/40 shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse-dot shadow-red-500 shadow-sm" />
              <span className="text-xs font-mono font-bold tracking-widest text-red-400">
                SERIAL TV • EPISODE 404
              </span>
            </div>

            {/* Right: Watermark & Fullscreen toggle */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full border border-amber-500/30 text-[11px] font-serif font-bold text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                <span>GOLDEN DRAMA</span>
              </div>

              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-gray-300 hover:text-white transition-all cursor-pointer"
                title={isFullscreen ? 'Exit Fullscreen' : 'Cinema Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* LOWER-THIRD BROADCAST STRIP: Encapsulated Serial Narrative */}
          <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none select-none lower-third-glow p-4 md:p-6 flex flex-col gap-2">
            {currentScene ? (
              <div className="flex flex-col gap-2 pointer-events-auto">
                {/* Scene Meta Line */}
                <div className="flex items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full uppercase font-bold text-[10px] tracking-wider badge-crimson">
                      {currentScene.sceneType.replace(/_/g, ' ')}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-amber-300 bg-black/60 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                      <Volume2 className="w-3 h-3 text-amber-400" />
                      <span>BGM: {currentScene.audioCategory}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-red-400 font-bold">
                    <Flame className="w-3.5 h-3.5 animate-pulse" />
                    <span>DRAMA {currentScene.dramaticLevel}%</span>
                  </div>
                </div>

                {/* Dramatic Serial Episode Headline */}
                <h2
                  className="text-lg md:text-2xl font-black tracking-wide text-white uppercase serial-title drop-shadow-lg leading-tight"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  "{currentScene.headline}"
                </h2>

                {/* Dramatic Serial Narration Ticker */}
                <p className="text-xs md:text-sm text-gray-200 italic font-sans bg-black/65 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 shadow-md">
                  « {currentScene.narration} »
                </p>

                {/* Drama Intensity Bar */}
                <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.max(5, Math.min(100, currentScene.dramaticLevel))}%`,
                      background: 'linear-gradient(90deg, #f59e0b 0%, #ef4444 60%, #991b1b 100%)',
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs font-mono text-gray-400 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-red-400 animate-pulse" />
                  <span>Awaiting character expressions & dramatic events...</span>
                </div>
                <span className="text-[11px] text-gray-500">
                  {trackedFaces.length === 0 ? 'No faces in frame' : `${trackedFaces.length} character(s) detected`}
                </span>
              </div>
            )}
          </div>
        </>
      )}

      {/* STANDBY HERO STATE (Camera Off) */}
      {!cameraState.isActive && !cameraState.isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-gray-950/80 via-black to-gray-950/95 z-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600/30 to-black border border-red-500/40 flex items-center justify-center mb-5 shadow-2xl shadow-red-950">
            <Camera className="w-10 h-10 text-red-500 animate-pulse" />
          </div>

          <h3
            className="text-2xl md:text-3xl font-black tracking-widest text-white mb-2 uppercase"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            READY FOR SERIAL DRAMA
          </h3>

          <p className="text-xs md:text-sm text-gray-400 max-w-md mb-6 leading-relaxed">
            Turn your webcam into an authentic Malayalam TV mega-serial. Micro-expressions, angry glances, and accidental entrances trigger live dramatic soundtracks, serial lower-thirds, and iconic triple-zooms.
          </p>

          <button
            onClick={handleStart}
            className="group relative inline-flex items-center gap-3 px-8 py-3.5 text-sm md:text-base font-bold text-white uppercase tracking-widest rounded-xl overflow-hidden transition-all duration-300 cursor-pointer shadow-xl hover:scale-105 active:scale-95 border border-red-500/50"
            style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)',
              boxShadow: '0 0 30px rgba(220, 38, 38, 0.45)',
            }}
          >
            <Camera className="w-5 h-5 transition-transform group-hover:rotate-12 text-white" />
            <span>COMMENCE BROADCAST</span>
          </button>

          <div className="flex items-center gap-2 mt-5 text-[11px] text-gray-500 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>100% Private & Client-Side. No video is ever stored or transmitted.</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {cameraState.isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-30">
          <div className="w-12 h-12 border-4 border-red-600/20 border-t-red-500 rounded-full animate-spin mb-4" />
          <p className="text-xs font-mono font-medium text-gray-300 tracking-widest">
            INITIALIZING HIGH-DEFINITION CAMERA...
          </p>
        </div>
      )}
    </div>
  );
};
