import React, { useState } from 'react';
import { ScrollText, Music, Users, Cpu, Play, Square, Volume2, Sparkles, Activity, Eye, Zap, UserCheck, UserMinus, BellRing } from 'lucide-react';
import { SerialEvent } from '../types/events';
import { TrackedFace, ExpressionType } from '../types/vision';
import { AudioEngine, DramaticPresetName, PRESET_CALIBRATION } from '../audio/audioEngine';
import { SerialSceneInterpretation } from '../types/llm';

interface StudioConsoleProps {
  events: SerialEvent[];
  trackedFaces: TrackedFace[];
  currentScene: SerialSceneInterpretation | null;
  audioEngine: AudioEngine;
  currentPreset: DramaticPresetName | null;
  modelStatus: 'idle' | 'loading' | 'ready' | 'error';
  modelError: string | null;
  onClearEvents: () => void;
  onPlayPreset: (preset: DramaticPresetName) => void;
  onStopAudio: () => void;
}

type StudioTab = 'script' | 'soundtrack' | 'cast' | 'diagnostics';

// Dynamic serial archetypes based on expression
function getArchetype(expression: ExpressionType): { title: string; desc: string; badgeColor: string } {
  switch (expression) {
    case 'angry':
      return { title: 'The Vengeful Antagonist', desc: 'Harboring generations of family secrets and vendettas.', badgeColor: 'bg-red-950 border-red-500 text-red-300' };
    case 'sad':
      return { title: 'The Tearful Protagonist', desc: 'Unjustly blamed for the disappearance of the ancestral jewels.', badgeColor: 'bg-blue-950 border-blue-500 text-blue-300' };
    case 'surprised':
      return { title: 'The Shocked Confidant', desc: 'Just overheard the conversation behind the bedroom curtains.', badgeColor: 'bg-amber-950 border-amber-500 text-amber-300' };
    case 'happy':
      return { title: 'The Scheming Relative', desc: 'Smiling knowing the inheritance deed is in their trunk.', badgeColor: 'bg-yellow-950 border-yellow-500 text-yellow-300' };
    default:
      return { title: 'The Stoic Tharavadu Elder', desc: 'Observing the household collapse in grim silence.', badgeColor: 'bg-gray-900 border-gray-700 text-gray-300' };
  }
}

const PRESET_GROUPS: Array<{
  category: string;
  icon: string;
  presets: Array<{ id: DramaticPresetName; label: string; serial: string }>;
}> = [
  {
    category: 'SHOCK STINGERS',
    icon: '⚡',
    presets: [
      { id: 'SHOCK_1', label: 'Classic Serial Thunder', serial: 'Chandanamazha / Chembarathi' },
      { id: 'SHOCK_2', label: 'Dramatic Realization', serial: 'Chembaneer Poovu' },
      { id: 'SHOCK_3', label: 'Fatal Revelation', serial: 'Mounaragam' },
    ],
  },
  {
    category: 'VILLAIN & REVENGE',
    icon: '🐍',
    presets: [
      { id: 'VILLAIN_1', label: 'The Mother-in-Law Glare', serial: 'Chembarathi' },
      { id: 'VILLAIN_2', label: 'Aleena Theme (Dark Strings)', serial: 'Mazha Thorum Munpe' },
      { id: 'VILLAIN_3', label: 'Elsamma Sinister Cello', serial: 'Mazha Thorum Munpe' },
    ],
  },
  {
    category: 'TRAGEDY & TEARS',
    icon: '💔',
    presets: [
      { id: 'SAD_1', label: 'Destitute Flute & Violin', serial: 'Patharamattu' },
      { id: 'SAD_2', label: 'Divine Lamentation', serial: 'Amme Mookambika' },
      { id: 'SAD_3', label: 'Tragic Heartbreak', serial: 'Mizhi Randilum' },
    ],
  },
  {
    category: 'SUSPENSE & TENSION',
    icon: '⏳',
    presets: [
      { id: 'SUSPENSE_1', label: 'Creeping Shadow Drone', serial: 'Chattambi Paaru' },
      { id: 'SUSPENSE_2', label: 'Ramadevi Ominous Climax', serial: 'Ramadevi BGM' },
    ],
  },
  {
    category: 'ENTRANCES & CLIFFHANGERS',
    icon: '🚪',
    presets: [
      { id: 'ENTRANCE_STING', label: 'Character Grand Entrance', serial: 'Amme Mookambike' },
      { id: 'EXIT_STING', label: 'Dramatic Storm Out', serial: 'Parasparam' },
      { id: 'CLIFFHANGER_1', label: 'Episode Freeze-Frame Stinger', serial: 'Patharamattu' },
      { id: 'HAPPY_1', label: 'Rare Moment of Family Peace', serial: 'Ponnambili' },
    ],
  },
];

export const StudioConsole: React.FC<StudioConsoleProps> = ({
  events,
  trackedFaces,
  currentScene,
  currentPreset,
  modelStatus,
  modelError,
  onClearEvents,
  onPlayPreset,
  onStopAudio,
}) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('script');

  return (
    <div className="w-full max-w-5xl mx-auto rounded-2xl glass-panel border border-white/10 overflow-hidden shadow-2xl flex flex-col">
      {/* Studio Tab Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-black/60 border-b border-white/10 flex-wrap gap-2">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('script')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'script'
                ? 'bg-red-600/30 border border-red-500/50 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ScrollText className="w-4 h-4 text-amber-400" />
            <span>EPISODE SCRIPT</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/10 text-gray-300">
              {events.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('soundtrack')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'soundtrack'
                ? 'bg-red-600/30 border border-red-500/50 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Music className="w-4 h-4 text-red-400" />
            <span>SOUNDTRACK RACK</span>
            {currentPreset && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-dot" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('cast')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'cast'
                ? 'bg-red-600/30 border border-red-500/50 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>CAST DOSSIER</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/10 text-gray-300">
              {trackedFaces.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'diagnostics'
                ? 'bg-red-600/30 border border-red-500/50 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>TELEMETRY</span>
          </button>
        </div>

        {/* Global Tab Subtitle */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-gray-500">
          <span>SERIAL PRODUCTION CONSOLE</span>
        </div>
      </div>

      {/* TAB 1: EPISODE SCRIPT */}
      {activeTab === 'script' && (
        <div className="p-5 flex flex-col h-72">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-gray-300 tracking-wider">
                LIVE TELEPLAY NARRATIVE
              </span>
              <span className="text-[11px] text-gray-500">
                (Transcribing real-time actions into Malayalam drama screenplay)
              </span>
            </div>
            {events.length > 0 && (
              <button
                onClick={onClearEvents}
                className="text-[11px] font-mono text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
              >
                Clear Script
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 font-sans text-xs">
            {events.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 italic text-center">
                <ScrollText className="w-8 h-8 text-gray-600 mb-2 opacity-50" />
                <p>No actions recorded yet. Step in front of the camera or change expressions!</p>
              </div>
            ) : (
              events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-red-500/30 transition-all flex items-start gap-3"
                >
                  <div className="p-1.5 rounded-lg bg-white/5 mt-0.5 text-red-400">
                    {ev.type === 'PERSON_ENTERED' ? (
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                    ) : ev.type === 'PERSON_LEFT' ? (
                      <UserMinus className="w-4 h-4 text-gray-400" />
                    ) : ev.type === 'NEW_PERSON_CAUSED_EXPRESSION_CHANGE' ? (
                      <Zap className="w-4 h-4 text-amber-400" />
                    ) : (
                      <BellRing className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-white tracking-wide text-xs">
                        [CUE] {ev.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500">{ev.formattedTime}</span>
                    </div>
                    <p className="text-gray-300 text-xs leading-relaxed italic">
                      "{ev.description}"
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SOUNDTRACK RACK */}
      {activeTab === 'soundtrack' && (
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-gray-300 tracking-wider">
                ORCHESTRAL SOUNDBOARD & CUES
              </span>
              {currentPreset && (
                <span className="px-2.5 py-0.5 rounded-full bg-red-950 border border-red-500/50 text-[10px] font-mono text-red-200 animate-pulse">
                  PLAYING: {PRESET_CALIBRATION[currentPreset]?.label || currentPreset}
                </span>
              )}
            </div>

            {currentPreset && (
              <button
                onClick={onStopAudio}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono text-gray-200 bg-gray-800 hover:bg-gray-700 border border-white/10 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 text-red-400" />
                <span>STOP ALL AUDIO</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {PRESET_GROUPS.map((group) => (
              <div
                key={group.category}
                className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-2"
              >
                <span className="text-[11px] font-mono font-bold tracking-wider text-gray-300 flex items-center gap-1.5">
                  <span>{group.icon}</span>
                  <span>{group.category}</span>
                </span>

                <div className="flex flex-col gap-1.5">
                  {group.presets.map((preset) => {
                    const isPlaying = currentPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => onPlayPreset(preset.id)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-all text-left cursor-pointer border ${
                          isPlaying
                            ? 'bg-red-600 text-white font-bold border-red-400 shadow-md shadow-red-950'
                            : 'bg-black/50 hover:bg-black/80 text-gray-300 border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs">{preset.label}</span>
                          <span className="text-[10px] text-gray-500 truncate max-w-[200px]">
                            {preset.serial}
                          </span>
                        </div>
                        <Play
                          className={`w-3.5 h-3.5 flex-shrink-0 ${
                            isPlaying ? 'fill-white text-white' : 'text-gray-500'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CAST DOSSIER */}
      {activeTab === 'cast' && (
        <div className="p-5 flex flex-col gap-4">
          <div className="pb-3 border-b border-white/10">
            <span className="text-xs font-mono font-bold text-gray-300 tracking-wider">
              DRAMATIS PERSONAE (DETECTED ACTORS)
            </span>
          </div>

          {trackedFaces.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-500 italic text-center">
              <Users className="w-8 h-8 text-gray-600 mb-2 opacity-50" />
              <p>No characters currently detected on set. Bring 1 or 2 actors into the camera frame!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trackedFaces.map((face) => {
                const archetype = getArchetype(face.currentExpression);
                return (
                  <div
                    key={face.faceId}
                    className="p-4 rounded-xl bg-black/50 border border-white/10 flex flex-col gap-3 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                        <span className="font-serif font-black text-base text-white">
                          {face.faceId}
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${archetype.badgeColor}`}>
                        {face.currentExpression.toUpperCase()} ({Math.round(face.expressionConfidence * 100)}%)
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-serif font-bold text-amber-300">
                        {archetype.title}
                      </span>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {archetype.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-gray-500 pt-2 border-t border-white/5">
                      <span>Facing: <b className="text-gray-300 capitalize">{face.facingDirection}</b></span>
                      <span>Persistence: Active</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: TELEMETRY & DIAGNOSTICS */}
      {activeTab === 'diagnostics' && (
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-black/50 border border-white/10 flex flex-col gap-2">
            <span className="text-red-400 font-bold flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              VISION PIPELINE STATUS
            </span>
            <div className="space-y-1.5 text-gray-300 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-500">Framework:</span>
                <span>@mediapipe/tasks-vision (WASM)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Model Status:</span>
                <span className={modelStatus === 'ready' ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                  {modelStatus.toUpperCase()} {modelError ? `(${modelError})` : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Target Framerate:</span>
                <span>~20 FPS (Throttled for efficiency)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Smoothing Buffer:</span>
                <span>1,500ms Temporal Rolling Window</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black/50 border border-white/10 flex flex-col gap-2">
            <span className="text-amber-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              LLM & NARRATIVE STATUS
            </span>
            <div className="space-y-1.5 text-gray-300 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-500">Primary Engine:</span>
                <span>Gemini 2.5 Flash API</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Active Source:</span>
                <span className="text-cyan-300 font-bold">
                  {currentScene?.source === 'gemini' ? 'Gemini 2.5 Flash' : 'Local Fallback Classifier'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Request Throttle:</span>
                <span>1,800ms Cooldown</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Audio Tracks:</span>
                <span>15 Custom Malayalam Serial MP3s</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
