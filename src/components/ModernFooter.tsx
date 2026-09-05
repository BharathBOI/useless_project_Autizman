import React from 'react';
import { ExternalLink } from 'lucide-react';

export const ModernFooter: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-black/60 mt-16 py-10 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Tagline */}
        <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold tracking-tight text-white font-mono uppercase">
              PARAMBARA<span className="text-[#84cc16]">HUB</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/10 text-zinc-400">
              BUILD 2026
            </span>
          </div>
          <span className="text-xs text-zinc-500 font-sans italic">
            "Your life deserves a background score."
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-xs text-zinc-400 font-mono">
          <a href="#workbench" className="hover:text-white transition-colors">SHOWCASES</a>
          <a href="#deployments" className="hover:text-white transition-colors">DEVELOPERS</a>
          <a href="#dimension" className="hover:text-white transition-colors">DIMENSION</a>
          <a
            href="https://www.tinkerhub.org"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 hover:text-[#84cc16] transition-colors"
          >
            <span>TINKERHUB</span>
            <ExternalLink className="w-3 h-3 text-zinc-500" />
          </a>
        </div>

        {/* Status & Credits */}
        <div className="flex flex-col items-center md:items-end gap-1 text-xs text-zinc-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#84cc16]" />
            <span className="text-zinc-400 font-medium">All Systems Melodramatic</span>
          </div>
          <span className="text-[11px] text-zinc-600">
            Crafted for TinkerHub Useless Projects 3.0
          </span>
        </div>
      </div>
    </footer>
  );
};
