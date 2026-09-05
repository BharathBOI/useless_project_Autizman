import React, { useRef, useEffect } from 'react';
import { Camera, CameraOff, AlertTriangle, ShieldCheck, Film } from 'lucide-react';
import { CameraState } from '../types/vision';

interface CameraViewProps {
  cameraState: CameraState;
  onStartCamera: (videoEl: HTMLVideoElement) => void;
  onStopCamera: () => void;
  children?: React.ReactNode;
}

export const CameraView: React.FC<CameraViewProps> = ({
  cameraState,
  onStartCamera,
  onStopCamera,
  children,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleStart = () => {
    if (videoRef.current) {
      onStartCamera(videoRef.current);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      onStopCamera();
    };
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Cinematic Viewport Container */}
      <div 
        className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/90 shadow-2xl border-2 transition-all duration-500"
        style={{
          borderColor: cameraState.isActive ? 'rgba(220, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.1)',
          boxShadow: cameraState.isActive 
            ? '0 0 35px rgba(220, 38, 38, 0.25), inset 0 0 20px rgba(0,0,0,0.8)' 
            : '0 8px 30px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Video Element (mirrored so looking into camera is natural) */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`w-full h-full object-cover camera-mirror transition-opacity duration-300 ${
            cameraState.isActive ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'
          }`}
        />

        {/* Cinematic Scanlines & Vignette */}
        {cameraState.isActive && (
          <>
            <div className="scanline-overlay" />
            <div className="cinematic-vignette" />
          </>
        )}

        {/* Live HUD Header inside Video */}
        {cameraState.isActive && (
          <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-red-500/30">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse-dot" />
              <span className="text-xs font-semibold tracking-wider text-red-400 font-mono">
                LIVE SERIAL BROADCAST
              </span>
            </div>
            
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs text-gray-300 font-mono">
              <Film className="w-3.5 h-3.5 text-red-500" />
              <span>FRONT CAM • 720P</span>
            </div>
          </div>
        )}

        {/* Overlays / Face Landmarks slot for Step 2 */}
        {cameraState.isActive && children}

        {/* Placeholder Screen when Camera is Off */}
        {!cameraState.isActive && !cameraState.isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-gray-950/80 via-black to-gray-950/95">
            <div className="w-20 h-20 rounded-full bg-red-950/40 border border-red-500/30 flex items-center justify-center mb-6 shadow-lg shadow-red-900/20">
              <Camera className="w-10 h-10 text-red-500 animate-pulse" />
            </div>

            <h3 className="text-2xl font-bold tracking-wide text-white mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
              CAMERA READY FOR DRAMA
            </h3>
            <p className="text-sm text-gray-400 max-w-md mb-8 leading-relaxed">
              Step into the frame. SERIALOS will turn your subtle glances, accidental entrances, and shocked expressions into an overdramatic Indian TV serial episode.
            </p>

            <button
              onClick={handleStart}
              className="group relative inline-flex items-center gap-3 px-8 py-4 text-base font-bold text-white uppercase tracking-widest rounded-xl overflow-hidden transition-all duration-300 cursor-pointer shadow-xl hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                boxShadow: '0 0 25px rgba(220, 38, 38, 0.4)'
              }}
            >
              <Camera className="w-5 h-5 transition-transform group-hover:rotate-12" />
              <span>START CAMERA</span>
            </button>

            <div className="flex items-center gap-2 mt-6 text-xs text-gray-400 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>100% Client-side. No raw video is ever recorded or uploaded.</span>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {cameraState.isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-30">
            <div className="w-12 h-12 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-gray-300 tracking-wider">INITIALIZING LAPTOP FRONT CAMERA...</p>
          </div>
        )}

        {/* Error Notification */}
        {cameraState.error && (
          <div className="absolute bottom-6 left-6 right-6 z-30 bg-red-950/90 border border-red-500/60 rounded-xl p-4 flex items-center gap-3 text-red-200 backdrop-blur-md shadow-2xl">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-bold">Camera Alert: </span>
              {cameraState.error}
            </div>
          </div>
        )}
      </div>

      {/* Control Strip Below Camera */}
      {cameraState.isActive && (
        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={onStopCamera}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold tracking-wider text-red-300 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 hover:border-red-500/60 transition-all cursor-pointer"
          >
            <CameraOff className="w-4 h-4" />
            STOP CAMERA
          </button>
        </div>
      )}
    </div>
  );
};
