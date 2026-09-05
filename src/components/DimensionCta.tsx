import React from 'react';
import { Sparkles, Camera, ArrowRight, Music, ShieldCheck } from 'lucide-react';

interface DimensionCtaProps {
  onStartCamera: () => void;
  isCameraActive: boolean;
}

export const DimensionCta: React.FC<DimensionCtaProps> = ({ onStartCamera, isCameraActive }) => {
  return (
    <section id="dimension" className="w-full max-w-5xl mx-auto px-4 py-20 sm:py-28 relative text-center">
      {/* Radiant ambient purple backlight halo */}
      <div className="ambient-glow-sphere" />

      {/* 3D Iridescent Holographic Sphere (Reproducing the orb in the reference screenshot) */}
      <div className="relative mx-auto w-36 h-36 sm:w-44 sm:h-44 mb-8 flex items-center justify-center pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-full h-full animate-spin-slow filter drop-shadow-[0_15px_35px_rgba(168,85,247,0.5)]">
          <defs>
            <radialGradient id="sphereBase" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="25%" stopColor="#c084fc" stopOpacity="0.85" />
              <stop offset="55%" stopColor="#7c3aed" stopOpacity="0.9" />
              <stop offset="85%" stopColor="#1e1b4b" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#05050f" stopOpacity="1" />
            </radialGradient>

            <linearGradient id="iridescentRing1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#f472b6" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="iridescentRing2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#ec4899" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.85" />
            </linearGradient>
          </defs>

          {/* Sphere Body */}
          <circle cx="100" cy="100" r="82" fill="url(#sphereBase)" />

          {/* Intersecting Holographic Latitude/Longitude Facet Ribbons */}
          <ellipse cx="100" cy="100" rx="80" ry="32" fill="none" stroke="url(#iridescentRing1)" strokeWidth="3" transform="rotate(-30 100 100)" opacity="0.85" />
          <ellipse cx="100" cy="100" rx="80" ry="32" fill="none" stroke="url(#iridescentRing2)" strokeWidth="3" transform="rotate(45 100 100)" opacity="0.85" />
          <ellipse cx="100" cy="100" rx="80" ry="40" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />

          {/* Core Specular Glint */}
          <circle cx="70" cy="70" r="16" fill="#ffffff" filter="blur(4px)" opacity="0.8" />
          <circle cx="70" cy="70" r="6" fill="#ffffff" opacity="0.9" />
        </svg>

        {/* Floating Sparkle Pins */}
        <div className="absolute top-2 left-6 text-purple-300 animate-pulse">✦</div>
        <div className="absolute bottom-4 right-6 text-pink-300 animate-pulse" style={{ animationDelay: '1s' }}>✦</div>
      </div>

      {/* Heading matching the reference screenshot */}
      <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-4 font-sans max-w-2xl mx-auto">
        Ready To Join A <br />
        <span className="gradient-text-purple">New Dimension?</span>
      </h2>

      <p className="text-sm sm:text-base text-zinc-400 max-w-lg mx-auto mb-8 leading-relaxed">
        Turn everyday conversation into unforgettable serial climaxes. Real-time facial telemetry, instant dramatic scoring, and zero video retention.
      </p>

      {/* Buttons */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
        <button
          onClick={onStartCamera}
          className="btn-glow-purple px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide text-white uppercase flex items-center gap-2 cursor-pointer shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          <Camera className="w-4 h-4" />
          <span>{isCameraActive ? 'Stream Is Active' : 'Launch SERIALOS Now'}</span>
          <ArrowRight className="w-4 h-4 text-purple-200" />
        </button>

        <a
          href="#workbench"
          className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-2"
        >
          <Music className="w-4 h-4 text-purple-400" />
          <span>Explore Soundtracks</span>
        </a>
      </div>

      {/* Trust & Privacy Badge */}
      <div className="flex items-center justify-center gap-2 mt-8 text-xs font-mono text-zinc-500">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>100% Client-Side Privacy • No Video Data Stored or Transmitted</span>
      </div>
    </section>
  );
};

