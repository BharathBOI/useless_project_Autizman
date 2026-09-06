import React from 'react';
import { Camera, ArrowRight, Music, ShieldCheck } from 'lucide-react';

interface DimensionCtaProps {
  onStartCamera: () => void;
  isCameraActive: boolean;
}

export const DimensionCta: React.FC<DimensionCtaProps> = ({ onStartCamera, isCameraActive }) => {
  return (
    <section id="dimension" className="w-full max-w-5xl mx-auto px-4 py-20 sm:py-28 relative text-center">
      {/* Monospace Badge */}
      <div className="inline-block px-3 py-1 rounded-md bg-white/[0.04] border border-white/10 font-mono text-[11px] text-[#84cc16] uppercase tracking-wider mb-6">
        [ OPEN SOURCE — FREE FOREVER ]
      </div>

      {/* Heading matching Watermelon UI reference typography */}
      <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-4 font-sans max-w-2xl mx-auto">
        Ready To Step Into <br />
        <span className="text-[#84cc16]">The Parambara Dimension?</span>
      </h2>

      <p className="text-sm sm:text-base text-zinc-400 max-w-lg mx-auto mb-8 leading-relaxed">
        Turn everyday conversation into unforgettable serial climaxes. Real-time facial telemetry, instant dramatic scoring, and zero video retention.
      </p>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
        <button
          onClick={onStartCamera}
          className="btn-lime px-6 sm:px-8 py-3 rounded-md text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <Camera className="w-4 h-4 text-black" />
          <span>{isCameraActive ? 'Stream Is Active' : 'Launch ParambaraHub'}</span>
          <ArrowRight className="w-4 h-4 text-black" />
        </button>

        <a
          href="#workbench"
          className="btn-dark px-5 sm:px-6 py-3 rounded-md text-xs sm:text-sm font-mono font-medium transition-all cursor-pointer flex items-center gap-2"
        >
          <Music className="w-4 h-4 text-[#84cc16]" />
          <span>Explore Soundtracks</span>
        </a>
      </div>

      {/* Trust & Privacy Badge */}
      <div className="flex items-center justify-center gap-2 mt-8 text-xs font-mono text-zinc-500">
        <ShieldCheck className="w-4 h-4 text-[#84cc16]" />
        <span>100% Client-Side Privacy • No Video Data Stored or Transmitted</span>
      </div>
    </section>
  );
};
