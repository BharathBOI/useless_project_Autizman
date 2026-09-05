import React, { useState } from 'react';
import { 
  Code2, 
  Sparkles, 
  Flame, 
  Volume2, 
  Play, 
  Pause, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  Zap,
  Sliders,
  ChevronRight,
  Disc
} from 'lucide-react';
import { DramaticPresetName } from '../audio/audioEngine';

interface BentoGridProps {
  onTriggerPreset?: (preset: DramaticPresetName) => void;
  isAudioPlaying?: boolean;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ onTriggerPreset, isAudioPlaying }) => {
  const [selectedDemoTrack, setSelectedDemoTrack] = useState<DramaticPresetName>('SHOCK_1');
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  const handlePlayDemo = (trackId: DramaticPresetName) => {
    setSelectedDemoTrack(trackId);
    setIsPlayingDemo(!isPlayingDemo);
    if (onTriggerPreset) {
      onTriggerPreset(trackId);
    }
  };

  return (
    <section id="deployments" className="w-full max-w-6xl mx-auto px-4 py-16 sm:py-24">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4 font-sans">
          All Of Your Melodrama <br />
          <span className="gradient-text-purple">In One Place</span>
        </h2>
        <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
          A unified broadcast runtime for every micro-expression, suspicious glance, and living room confrontation.
        </p>
      </div>

      {/* 4-Card Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
        {/* Card 1: Remain In Flow While Overreacting (Span 7) */}
        <div className="md:col-span-7 glass-card p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-white/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full filter blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400 mb-3 font-semibold uppercase tracking-wider">
              <Code2 className="w-4 h-4" />
              <span>Reactive Telemetry Pipeline</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 font-sans">
              Remain In Flow While Overreacting
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
              Zero-latency facial telemetry maps MediaPipe blendshapes directly into classic television tropes. When an eyebrow raises, the violin shrieks automatically.
            </p>
          </div>

          {/* Code Editor Preview */}
          <div className="rounded-xl bg-[#07070f] border border-white/10 p-4 font-mono text-xs text-zinc-300 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08] text-[11px] text-zinc-500">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-zinc-400">serial-listener.ts</span>
              </div>
              <span className="text-purple-400 font-bold">2.4 ms avg</span>
            </div>

            <pre className="overflow-x-auto text-[11px] leading-relaxed text-zinc-300">
              <code>
                <span className="text-purple-400">const</span> &#123; expression, confidence &#125; = <span className="text-indigo-300">useActorTelemetry</span>();{'\n'}
                <span className="text-purple-400">if</span> (expression === <span className="text-amber-300">'shock'</span> && confidence &gt; <span className="text-cyan-300">0.82</span>) &#123;{'\n'}
                {'  '}<span className="text-pink-400">triggerTripleZoom</span>(&#123;{'\n'}
                {'    '}steps: <span className="text-cyan-300">3</span>,{'\n'}
                {'    '}bgm: <span className="text-amber-300">'CHANDANAMAZHA_THUNDER'</span>,{'\n'}
                {'    '}vfx: <span className="text-amber-300">'GOLDEN_LIGHTNING_FLASH'</span>{'\n'}
                {'  '}&#125;);{'\n'}
                &#125;
              </code>
            </pre>
          </div>
        </div>

        {/* Card 2: Roll Out Melodrama To Your Entire Family (Span 5) */}
        <div className="md:col-span-5 glass-card p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-white/20 transition-all duration-300">
          {/* Iridescent 3D Crystal Gem Visual in Top Right (reproducing the screenshot graphic) */}
          <div className="absolute top-4 right-4 w-32 h-32 sm:w-40 sm:h-40 pointer-events-none flex items-center justify-center">
            {/* SVG 3D Faceted Iridescent Crystal */}
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full animate-float filter drop-shadow-[0_10px_25px_rgba(168,85,247,0.4)]"
            >
              <defs>
                <linearGradient id="crystalFacet1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#c084fc" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.85" />
                </linearGradient>
                <linearGradient id="crystalFacet2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                  <stop offset="60%" stopColor="#818cf8" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="crystalFacet3" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity="0.75" />
                  <stop offset="70%" stopColor="#c084fc" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
                </linearGradient>
                <linearGradient id="crystalFacet4" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.95" />
                </linearGradient>
              </defs>

              {/* Crystal Facets */}
              <polygon points="100,20 160,85 100,120 40,85" fill="url(#crystalFacet1)" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
              <polygon points="100,120 160,85 100,180" fill="url(#crystalFacet2)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <polygon points="100,120 40,85 100,180" fill="url(#crystalFacet3)" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
              <polygon points="100,20 40,85 100,120" fill="url(#crystalFacet4)" opacity="0.85" />
              {/* Highlight Glint */}
              <circle cx="100" cy="50" r="4" fill="#ffffff" filter="blur(1px)" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-3 font-semibold uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Multi-Actor Orchestration</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 font-sans max-w-[240px]">
              Roll Out Melodrama To Your Entire Family
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xs mb-6 leading-relaxed">
              Multi-person tracking detects when relatives cross paths in the living room, calculating tension levels for explosive kitchen dialogues.
            </p>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Actor Matrix: Up to 4 Faces</span>
            <span className="text-emerald-400 font-bold">● Active</span>
          </div>
        </div>

        {/* Card 3: Become A Leader In Daily Soaps (Span 7) */}
        <div className="md:col-span-7 glass-card p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-white/20 transition-all duration-300">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-pink-400 mb-3 font-semibold uppercase tracking-wider">
              <Disc className="w-4 h-4" />
              <span>Authentic Serial Soundtracks</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 font-sans">
              Become A Leader In Daily Soaps
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
              Equipped with high-fidelity stingers from Chandanamazha, Parasparam, Chembarathi, and Mazha Thorum Munpe. Synthesizer fallback guarantees offline melodramatic scores.
            </p>
          </div>

          {/* Tactile Audio Deck & Knob Controller */}
          <div className="p-4 rounded-xl bg-[#07070f] border border-white/10 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              {/* Glowing Purple Audio Dial */}
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-purple-950 via-zinc-900 to-indigo-950 border-2 border-purple-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                <div className="w-3 h-3 rounded-full bg-purple-400 animate-pulse shadow-[0_0_10px_rgba(192,132,252,0.8)]" />
                <div className="absolute top-1 w-1 h-2 rounded-full bg-purple-300" />
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-mono font-bold text-white uppercase">
                  {selectedDemoTrack.replace(/_/g, ' ')}
                </span>
                <span className="text-[11px] text-zinc-400 font-sans">
                  Asianet & Zee Keralam Master Archive
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePlayDemo('SHOCK_1')}
                className="px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Test Thunder</span>
              </button>

              <button
                onClick={() => handlePlayDemo('VILLAIN_1')}
                className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-200 text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Flame className="w-3 h-3 text-red-400" />
                <span>Test Villain</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 4: Accelerate Melodrama (Span 5) */}
        <div className="md:col-span-5 glass-card p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-white/20 transition-all duration-300">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-3 font-semibold uppercase tracking-wider">
              <Cpu className="w-4 h-4" />
              <span>Edge AI Acceleration</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 font-sans">
              Accelerate Melodrama
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mb-6 leading-relaxed">
              Client-side MediaPipe inference runs at a silky 60 FPS. Zero video frames are transmitted to external servers.
            </p>
          </div>

          {/* Deployment Pill Card */}
          <div className="p-4 rounded-xl bg-[#07070f] border border-white/10 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">INFERENCE LATENCY</span>
              <span className="text-emerald-400 font-bold">&lt; 18ms</span>
            </div>

            {/* Glowing Deployment Pill Button */}
            <div className="btn-glow-purple px-4 py-2 rounded-xl flex items-center justify-between text-xs font-bold text-white shadow-lg cursor-pointer">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>MELODRAMA DEPLOYED</span>
              </span>
              <ChevronRight className="w-4 h-4 text-purple-200" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

