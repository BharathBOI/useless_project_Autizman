import React, { useState } from 'react';
import { 
  Zap, 
  Skull, 
  HeartCrack, 
  Sparkles, 
  Square, 
  Code2, 
  Terminal, 
  Music, 
  Users, 
  Play, 
  Flame, 
  Film,
  RefreshCw
} from 'lucide-react';
import { BroadcastViewport } from './BroadcastViewport';
import { CameraState, TrackedFace } from '../types/vision';
import { SerialEvent } from '../types/events';
import { SerialSceneInterpretation } from '../types/llm';
import { AudioEngine, DramaticPresetName } from '../audio/audioEngine';

interface HeroWorkbenchProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraState: CameraState;
  trackedFaces: TrackedFace[];
  events: SerialEvent[];
  currentScene: SerialSceneInterpretation | null;
  audioEngine: AudioEngine;
  currentPreset: DramaticPresetName | null;
  isAudioPlaying: boolean;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onTriggerCue: (preset: DramaticPresetName) => void;
  onSilenceAudio: () => void;
  onResetScene: () => void;
}

const FEATURED_TRACKS: Array<{ id: DramaticPresetName; name: string; serial: string; category: string }> = [
  { id: 'SHOCK_1', name: 'Classic Thunder Cut', serial: 'Chandanamazha', category: 'SHOCK' },
  { id: 'VILLAIN_1', name: 'Mother-in-Law Glare', serial: 'Chembarathi', category: 'VILLAIN' },
  { id: 'SAD_1', name: 'Destitute Flute & Tears', serial: 'Patharamattu', category: 'TRAGEDY' },
  { id: 'VILLAIN_2', name: 'Aleena Dark Theme', serial: 'Mazha Thorum Munpe', category: 'VILLAIN' },
  { id: 'HAPPY_1', name: 'Rare Family Peace', serial: 'Ponnambili', category: 'MELODY' },
  { id: 'ENTRANCE_STING', name: 'Grand Matriarch Entrance', serial: 'Amme Mookambike', category: 'ENTRANCE' },
];

export const HeroWorkbench: React.FC<HeroWorkbenchProps> = ({
  videoRef,
  cameraState,
  trackedFaces,
  events,
  currentScene,
  audioEngine,
  currentPreset,
  isAudioPlaying,
  onStartCamera,
  onStopCamera,
  onTriggerCue,
  onSilenceAudio,
  onResetScene,
}) => {
  const [activeTab, setActiveTab] = useState<'script' | 'audio' | 'logs'>('script');

  const tensionPercent = currentScene ? currentScene.dramaticLevel : trackedFaces.length > 0 ? 35 : 10;

  return (
    <div className="relative w-full max-w-6xl mx-auto px-2 sm:px-4">
      {/* Workbench Card with Watermelon UI clean dark border */}
      <div className="relative z-10 rounded-xl border border-white/10 overflow-hidden bg-[#0d0d12] shadow-2xl">
        {/* Top Window Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.08] bg-black/50 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#84cc16]/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            </div>
            <span className="hidden sm:inline text-zinc-600 ml-2">|</span>
            <span className="text-zinc-400 font-medium tracking-wider flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-[#84cc16]" />
              <span>parambara_stage.tsx</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-zinc-500 font-mono">PARAMBARAHUB • LIVE RUNTIME</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
              cameraState.isActive ? 'bg-[#84cc16]/20 text-[#84cc16] border border-[#84cc16]/40' : 'bg-zinc-800 text-zinc-400'
            }`}>
              {cameraState.isActive ? 'ACTIVE' : 'STANDBY'}
            </span>
          </div>
        </div>

        {/* 3-Column Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Column: Telemetry & Director Cues */}
          <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-white/[0.08] p-3.5 sm:p-4 flex flex-col gap-4 bg-[#09090c]">
            {/* Active Cast Telemetry */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1.5 text-zinc-300 font-semibold uppercase tracking-wider">
                  <Users className="w-3.5 h-3.5 text-[#84cc16]" />
                  <span>Active Cast</span>
                </span>
                <span className="text-[11px] text-[#84cc16] px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/10 font-bold">
                  {trackedFaces.length} Detected
                </span>
              </div>

              {trackedFaces.length > 0 ? (
                <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
                  {trackedFaces.map((face) => (
                    <div
                      key={face.faceId}
                      className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-[#84cc16]/20 border border-[#84cc16]/40 flex items-center justify-center font-mono font-bold text-[10px] text-[#84cc16]">
                          {face.faceId.slice(-2)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-zinc-200 capitalize">
                            {face.currentExpression}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {face.facingDirection} glance
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-[#84cc16] font-bold">
                        {Math.round(face.expressionConfidence * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-white/[0.02] border border-dashed border-white/10 text-center text-xs text-zinc-500 font-mono">
                  {cameraState.isActive ? 'No characters in frame' : 'Launch stream to detect actors'}
                </div>
              )}
            </div>

            {/* Dramatic Tension Meter */}
            <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-1 text-zinc-300 font-medium">
                  <Flame className="w-3.5 h-3.5 text-[#84cc16]" />
                  <span>Dramatic Tension</span>
                </span>
                <span className="text-[#84cc16] font-bold font-mono">{tensionPercent}%</span>
              </div>

              <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${Math.max(8, Math.min(100, tensionPercent))}%`,
                    background: 'linear-gradient(90deg, #84cc16 0%, #eab308 60%, #ef4444 100%)',
                  }}
                />
              </div>
            </div>

            {/* Director Quick Action Cues */}
            <div className="flex flex-col gap-2 mt-auto">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                Director Quick Cues
              </span>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onTriggerCue('SHOCK_1')}
                  className="flex items-center gap-1.5 p-2 rounded-md bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-[#84cc16]/50 text-zinc-200 hover:text-[#84cc16] text-xs font-mono font-medium transition-all cursor-pointer"
                  title="Trigger dramatic shock & triple zoom"
                >
                  <Zap className="w-3 h-3 text-[#84cc16]" />
                  <span>Shock Cut</span>
                </button>

                <button
                  onClick={() => onTriggerCue('VILLAIN_1')}
                  className="flex items-center gap-1.5 p-2 rounded-md bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-red-500/50 text-zinc-200 hover:text-red-300 text-xs font-mono font-medium transition-all cursor-pointer"
                  title="Trigger villain revenge stinger"
                >
                  <Skull className="w-3 h-3 text-red-400" />
                  <span>Villain</span>
                </button>

                <button
                  onClick={() => onTriggerCue('SAD_1')}
                  className="flex items-center gap-1.5 p-2 rounded-md bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-blue-500/50 text-zinc-200 hover:text-blue-300 text-xs font-mono font-medium transition-all cursor-pointer"
                  title="Trigger tragic violin melodrama"
                >
                  <HeartCrack className="w-3 h-3 text-blue-400" />
                  <span>Tragedy</span>
                </button>

                <button
                  onClick={() => onTriggerCue('HAPPY_1')}
                  className="flex items-center gap-1.5 p-2 rounded-md bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-[#84cc16]/50 text-zinc-200 hover:text-[#84cc16] text-xs font-mono font-medium transition-all cursor-pointer"
                  title="Trigger rare moment of family peace"
                >
                  <Sparkles className="w-3 h-3 text-[#84cc16]" />
                  <span>Harmony</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 mt-1">
                <button
                  onClick={onSilenceAudio}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-zinc-400 hover:text-white text-xs font-mono transition-all cursor-pointer"
                  title="Silence active audio score"
                >
                  <Square className="w-3 h-3" />
                  <span>Silence</span>
                </button>

                <button
                  onClick={onResetScene}
                  className="p-1.5 rounded-md bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
                  title="Reset dramatic scene state"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Center Column: Live Broadcast Viewport */}
          <div className="lg:col-span-6 p-3 sm:p-4 flex flex-col justify-center bg-black/40">
            <BroadcastViewport
              videoRef={videoRef}
              cameraState={cameraState}
              trackedFaces={trackedFaces}
              currentScene={currentScene}
              onStartCamera={onStartCamera}
              onStopCamera={onStopCamera}
            />
          </div>

          {/* Right Column: Code & Audio Tabs */}
          <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-white/[0.08] p-3.5 sm:p-4 flex flex-col bg-[#09090c]">
            {/* Editor Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-md bg-black/60 border border-white/10 mb-3 text-xs font-mono">
              <button
                onClick={() => setActiveTab('script')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded transition-all cursor-pointer ${
                  activeTab === 'script'
                    ? 'bg-white/[0.08] text-[#84cc16] font-bold border border-white/10'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Code2 className="w-3 h-3" />
                <span>Script</span>
              </button>

              <button
                onClick={() => setActiveTab('audio')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded transition-all cursor-pointer ${
                  activeTab === 'audio'
                    ? 'bg-white/[0.08] text-[#84cc16] font-bold border border-white/10'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Music className="w-3 h-3" />
                <span>Stems</span>
              </button>

              <button
                onClick={() => setActiveTab('logs')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded transition-all cursor-pointer ${
                  activeTab === 'logs'
                    ? 'bg-white/[0.08] text-[#84cc16] font-bold border border-white/10'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Terminal className="w-3 h-3" />
                <span>Logs</span>
              </button>
            </div>

            {/* Tab 1: Script Screenplay (Syntax Highlighted) */}
            {activeTab === 'script' && (
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                <div className="p-3 rounded-lg bg-black/60 border border-white/[0.08] font-mono text-xs overflow-y-auto max-h-[310px]">
                  <div className="text-zinc-600 mb-2">// PARAMBARAHUB SCENE INTERPRETER</div>
                  <div className="text-zinc-300 font-bold">
                    <span className="text-[#84cc16]">const</span> activeScene = &#123;
                  </div>

                  <div className="pl-3 py-1 flex flex-col gap-1 text-[11px]">
                    <div>
                      <span className="text-zinc-500">headline: </span>
                      <span className="text-zinc-200 font-serif">
                        "{currentScene?.headline || 'The Calm Before The Storm'}"
                      </span>,
                    </div>
                    <div>
                      <span className="text-zinc-500">sceneType: </span>
                      <span className="text-[#84cc16] font-semibold">
                        "{currentScene?.sceneType || 'SUSPENSE'}"
                      </span>,
                    </div>
                    <div>
                      <span className="text-zinc-500">scoreBgm: </span>
                      <span className="text-amber-400">
                        "{currentScene?.audioCategory || 'WAITING'}"
                      </span>,
                    </div>
                    <div>
                      <span className="text-zinc-500">tension: </span>
                      <span className="text-[#84cc16]">{tensionPercent}%</span>,
                    </div>
                    <div>
                      <span className="text-zinc-500">narration: </span>
                      <span className="text-zinc-300 italic">
                        "{currentScene?.narration || 'A tense silence blankets the ancestral family home...'}"
                      </span>
                    </div>
                  </div>

                  <div className="text-zinc-300 font-bold">&#125;;</div>

                  {currentScene && (
                    <div className="mt-3 pt-2 border-t border-white/[0.08]">
                      <div className="text-zinc-600 text-[10px] mb-1">// SERIAL NARRATION CLIMAX</div>
                      <div className="text-[11px] text-zinc-300 py-0.5">
                        <span className="text-[#84cc16] font-bold">Stinger Cue: </span>
                        <span>« {currentScene.narration} »</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-zinc-500 px-1">
                  <span>Engine: Gemini 2.0 Flash</span>
                  <span className="text-[#84cc16]">● Synced</span>
                </div>
              </div>
            )}

            {/* Tab 2: Audio Stems & Tracklist */}
            {activeTab === 'audio' && (
              <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-[320px] pr-1">
                <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-between mb-1">
                  <span>PARAMBARA TRACK VAULT</span>
                  <span className="text-[#84cc16] font-bold">
                    {currentPreset ? currentPreset : 'IDLE'}
                  </span>
                </div>

                {FEATURED_TRACKS.map((track) => {
                  const isCurrent = currentPreset === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => onTriggerCue(track.id)}
                      className={`p-2 rounded-md border flex items-center justify-between transition-all cursor-pointer text-xs ${
                        isCurrent
                          ? 'bg-white/[0.08] border-[#84cc16] text-white'
                          : 'bg-white/[0.02] border-white/[0.06] text-zinc-300 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <button
                          className={`w-5 h-5 rounded flex items-center justify-center ${
                            isCurrent ? 'bg-[#84cc16] text-black' : 'bg-white/10 text-zinc-300'
                          }`}
                        >
                          <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                        </button>
                        <div className="flex flex-col">
                          <span className="font-medium leading-tight">{track.name}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">{track.serial}</span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/10 text-zinc-400">
                        {track.category}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab 3: Telemetry Logs */}
            {activeTab === 'logs' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-2.5 rounded-lg bg-black/60 border border-white/[0.08] font-mono text-xs overflow-y-auto max-h-[310px] flex flex-col gap-1.5">
                  {events.length > 0 ? (
                    events.slice(0, 15).map((ev, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] text-zinc-300 py-0.5">
                        <span className="text-zinc-600">[{new Date(ev.timestamp).toLocaleTimeString().slice(3, 8)}]</span>
                        <span className="text-[#84cc16] font-semibold">{ev.type}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-zinc-600 py-8 text-xs font-mono">
                      No events registered yet. Face expressions will populate this log in real time.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
