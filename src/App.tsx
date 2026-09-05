import React, { useEffect, useState } from 'react';
import { Clapperboard, Sparkles } from 'lucide-react';
import { AudioControls } from './components/AudioControls';
import { CameraView } from './components/CameraView';
import { EventLog } from './components/EventLog';
import { ScenePanel } from './components/ScenePanel';
import { eventEngine } from './events/eventEngine';
import { VisionEvent } from './types/events';
import { DramaticScene } from './types/llm';
import { TrackedFaceState } from './types/vision';

export const App: React.FC = () => {
  const [currentScene, setCurrentScene] = useState<DramaticScene>({
    sceneType: 'NORMAL',
    dramaticLevel: 10,
    headline: 'WAITING FOR DRAMA...',
    narration: 'Position yourself in front of the camera to begin your serial story.',
    audioCategory: 'NONE',
    audioIntensity: 0,
    durationSeconds: 5,
    shouldInterruptCurrentAudio: false,
    timestamp: Date.now()
  });

  const [eventLogs, setEventLogs] = useState<VisionEvent[]>([]);
  const [, setActiveFaces] = useState<TrackedFaceState[]>([]);

  useEffect(() => {
    const unsubscribe = eventEngine.subscribe((scene, logs) => {
      setCurrentScene(scene);
      setEventLogs(logs);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white pb-12">
      {/* Dramatic Top Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-600 via-red-700 to-amber-600 shadow-lg shadow-red-950/60 border border-red-500/40">
              <Clapperboard className="w-7 h-7 text-amber-200" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-widest font-serif text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-amber-200">
                SERIALOS
              </h1>
              <p className="text-xs font-serif italic text-slate-400">
                "Your life deserves a background score."
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-red-950/40 border border-red-800/50 text-red-400 text-xs font-bold tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>INDIAN/MALAYALAM TV SERIAL ENGINE</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 flex-1 w-full space-y-6">
        {/* Top Split Row: Camera View & Current Scene Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 flex flex-col">
            <CameraView onActiveFacesUpdate={setActiveFaces} />
          </div>
          <div className="lg:col-span-5 flex flex-col justify-between">
            <ScenePanel scene={currentScene} />
          </div>
        </div>

        {/* Audio Engine Controls Row */}
        <div className="w-full">
          <AudioControls />
        </div>

        {/* Real-time Event Log */}
        <div className="w-full">
          <EventLog logs={eventLogs} />
        </div>
      </main>
    </div>
  );
};

export default App;

