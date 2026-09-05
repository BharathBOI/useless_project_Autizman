import React, { useState } from 'react';
import { 
  Code2, 
  Flame, 
  Layers, 
  CheckCircle2, 
  Zap,
  ChevronRight,
  Disc,
  Cpu
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
        <div className="inline-block px-3 py-1 rounded-md bg-white/[0.04] border border-white/10 font-mono text-[11px] text-[#84cc16] uppercase tracking-wider mb-4">
          [ MODULAR DRAMA SUITE ]
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4 font-sans">
          All Of Your Melodrama <br />
          <span className="text-[#84cc16]">In One Place</span>
        </h2>
        <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
          A unified broadcast suite for every micro-expression, suspicious glance, and living room confrontation.
        </p>
      </div>

      {/* 4-Card Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
        {/* Card 1: Remain In Flow While Overreacting (Span 7) */}
        <div className="md:col-span-7 glass-card p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-[#84cc16]/40 transition-all duration-300">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#84cc16] mb-3 font-semibold uppercase tracking-wider">
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
          <div className="rounded-xl bg-[#09090c] border border-white/10 p-4 font-mono text-xs text-zinc-300 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08] text-[11px] text-zinc-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#84cc16]" />
                <span className="text-zinc-400">parambara-listener.ts</span>
              </div>
              <span className="text-[#84cc16] font-bold">2.4 ms avg</span>
            </div>

            <pre className="overflow-x-auto text-[11px] leading-relaxed text-zinc-300">
              <code>
                <span className="text-[#84cc16]">const</span> &#123; expression, confidence &#125; = <span className="text-zinc-200">useActorTelemetry</span>();{'\n'}
                <span className="text-[#84cc16]">if</span> (expression === <span className="text-amber-400">'shock'</span> && confidence &gt; <span className="text-[#a3e635]">0.82</span>) &#123;{'\n'}
                {'  '}<span className="text-[#84cc16]">triggerTripleZoom</span>(&#123;{'\n'}
                {'    '}steps: <span className="text-[#a3e635]">3</span>,{'\n'}
                {'    '}bgm: <span className="text-amber-400">'CHANDANAMAZHA_THUNDER'</span>,{'\n'}
                {'    '}vfx: <span className="text-[#84cc16]">'LIME_LIGHTNING_FLASH'</span>{'\n'}
                {'  '}&#125;);{'\n'}
                &#125;
              </code>
            </pre>
          </div>
        </div>

        {/* Card 2: Roll Out Melodrama To Your Entire Family (Span 5) */}
        <div className="md:col-span-5 glass-card p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-[#84cc16]/40 transition-all duration-300">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xs font-mono text-[#84cc16] mb-3 font-semibold uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Multi-Actor Orchestration</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 font-sans">
              Roll Out Melodrama To Your Entire Family
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mb-6 leading-relaxed">
              Multi-person tracking detects when relatives cross paths in the living room, calculating tension levels for explosive kitchen confrontations.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#09090c] border border-white/10 flex flex-col gap-2 relative z-10">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">ACTOR MATRIX</span>
              <span className="text-[#84cc16] font-bold">UP TO 4 FACES</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono pt-1 border-t border-white/[0.08]">
              <span className="w-2 h-2 rounded-full bg-[#84cc16]" />
              <span>Autonomous Stinger Engine Ready</span>
            </div>
          </div>
        </div>

        {/* Card 3: Become A Leader In Daily Soaps (Span 7) */}
        <div className="md:col-span-7 glass-card p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-[#84cc16]/40 transition-all duration-300">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#84cc16] mb-3 font-semibold uppercase tracking-wider">
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

          {/* Tactile Audio Deck & Controller */}
          <div className="p-4 rounded-xl bg-[#09090c] border border-white/10 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              {/* Lime Audio Dial */}
              <div className="relative w-12 h-12 rounded-full bg-zinc-900 border-2 border-[#84cc16]/50 flex items-center justify-center shadow-[0_0_15px_rgba(132,204,22,0.25)]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#84cc16]" />
                <div className="absolute top-1 w-0.5 h-1.5 rounded-full bg-[#84cc16]" />
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
                className="px-3 py-1.5 rounded-md bg-white/[0.04] hover:bg-[#84cc16]/20 border border-white/10 hover:border-[#84cc16]/50 text-zinc-200 text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Zap className="w-3 h-3 text-[#84cc16]" />
                <span>Test Thunder</span>
              </button>

              <button
                onClick={() => handlePlayDemo('VILLAIN_1')}
                className="px-3 py-1.5 rounded-md bg-white/[0.04] hover:bg-red-950/40 border border-white/10 hover:border-red-500/50 text-zinc-200 text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Flame className="w-3 h-3 text-red-400" />
                <span>Test Villain</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 4: Accelerate Melodrama (Span 5) */}
        <div className="md:col-span-5 glass-card p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-[#84cc16]/40 transition-all duration-300">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#84cc16] mb-3 font-semibold uppercase tracking-wider">
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

          {/* Deployment Card */}
          <div className="p-4 rounded-xl bg-[#09090c] border border-white/10 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">INFERENCE LATENCY</span>
              <span className="text-[#84cc16] font-bold">&lt; 18ms</span>
            </div>

            {/* Solid Lime Deployment Button */}
            <div className="btn-lime px-4 py-2 rounded-md flex items-center justify-between text-xs font-bold cursor-pointer">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>MELODRAMA DEPLOYED</span>
              </span>
              <ChevronRight className="w-4 h-4 text-black" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
