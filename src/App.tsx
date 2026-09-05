import React, { useState, useRef, useCallback, useEffect } from 'react';
import { BroadcastHeader } from './components/BroadcastHeader';
import { BroadcastViewport } from './components/BroadcastViewport';
import { StudioConsole } from './components/StudioConsole';
import { QuickActionDock } from './components/QuickActionDock';
import { CameraManager } from './vision/cameraManager';
import { FaceLandmarkerService } from './vision/faceLandmarker';
import { EventEngine } from './events/eventEngine';
import { SerialInterpreter } from './llm/serialInterpreter';
import { AudioEngine, DramaticPresetName } from './audio/audioEngine';
import { CameraState, TrackedFace } from './types/vision';
import { SerialEvent } from './types/events';
import { SerialSceneInterpretation } from './types/llm';

export const App: React.FC = () => {
  const [cameraState, setCameraState] = useState<CameraState>({
    isActive: false,
    isLoading: false,
    error: null,
    hasPermission: false,
  });

  const [trackedFaces, setTrackedFaces] = useState<TrackedFace[]>([]);
  const [events, setEvents] = useState<SerialEvent[]>([]);
  const [currentScene, setCurrentScene] = useState<SerialSceneInterpretation | null>(null);
  const [currentAudioPreset, setCurrentAudioPreset] = useState<DramaticPresetName | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeMode, setActiveMode] = useState<'broadcast' | 'studio'>('broadcast');
  const [modelStatus, setModelStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [modelError, setModelError] = useState<string | null>(null);

  const cameraManagerRef = useRef<CameraManager>(new CameraManager());
  const faceLandmarkerRef = useRef<FaceLandmarkerService>(new FaceLandmarkerService());
  const eventEngineRef = useRef<EventEngine>(new EventEngine());
  const serialInterpreterRef = useRef<SerialInterpreter>(new SerialInterpreter());
  const audioEngineRef = useRef<AudioEngine>(new AudioEngine());
  const animFrameIdRef = useRef<number | null>(null);
  const lastDetectTimeRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Pre-load MediaPipe FaceLandmarker in background
  useEffect(() => {
    let mounted = true;
    setModelStatus('loading');
    faceLandmarkerRef.current
      .init()
      .then(() => {
        if (mounted) setModelStatus('ready');
      })
      .catch((err) => {
        console.error(err);
        if (mounted) {
          setModelStatus('error');
          setModelError(err.message || 'Failed to load face detection model');
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Subscribe to audio engine state
  useEffect(() => {
    const unsub = audioEngineRef.current.onStateChange(() => {
      const preset = audioEngineRef.current.getCurrentPreset();
      setCurrentAudioPreset(preset);
      setIsAudioPlaying(audioEngineRef.current.isPlaying());
      setIsMuted(audioEngineRef.current.isMuted());
    });
    return () => unsub();
  }, []);

  // Subscribe to serial scene interpretation
  useEffect(() => {
    const unsubscribe = serialInterpreterRef.current.onSceneInterpreted((scene) => {
      setCurrentScene(scene);
      // Play dramatic serial music for this scene
      if (scene.audioCategory && scene.audioCategory !== 'NONE') {
        audioEngineRef.current.playCategory(scene.audioCategory, scene.audioIntensity);
      }
    });
    return () => unsubscribe();
  }, []);

  // Frame detection loop
  const runDetectionLoop = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.paused || video.ended || !cameraManagerRef.current.isStreaming()) {
      return;
    }

    const now = performance.now();
    // Throttle to ~20 FPS (50ms interval) to preserve CPU performance
    if (now - lastDetectTimeRef.current >= 50 && faceLandmarkerRef.current.isReady()) {
      lastDetectTimeRef.current = now;

      const result = faceLandmarkerRef.current.detectVideoFrame(video, now);
      if (result) {
        const rawLandmarks = result.faceLandmarks || [];
        const rawBlendshapes = result.faceBlendshapes || [];

        const { trackedFaces: currentFaces, emittedEvents } =
          eventEngineRef.current.processFrame(rawLandmarks, rawBlendshapes, Date.now());

        setTrackedFaces(currentFaces);

        if (emittedEvents.length > 0) {
          setEvents((prev) => [...emittedEvents, ...prev].slice(0, 80));

          // Immediate sound effects for obvious physical entrances/exits
          for (const ev of emittedEvents) {
            if (ev.type === 'PERSON_ENTERED') {
              audioEngineRef.current.playPreset('ENTRANCE_STING');
            } else if (ev.type === 'PERSON_LEFT' || ev.type === 'ALL_PEOPLE_LEFT') {
              audioEngineRef.current.playPreset('EXIT_STING');
            }
            // Enqueue for serial scene interpretation (batched & throttled)
            serialInterpreterRef.current.enqueueEvent(ev, currentFaces);
          }
        }
      }
    }

    animFrameIdRef.current = requestAnimationFrame(runDetectionLoop);
  }, []);

  const handleStartCamera = useCallback(async () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    setCameraState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await cameraManagerRef.current.startCamera(videoEl);

      setCameraState({
        isActive: true,
        isLoading: false,
        error: null,
        hasPermission: true,
      });

      // Start detection loop
      animFrameIdRef.current = requestAnimationFrame(runDetectionLoop);
    } catch (err: unknown) {
      const error = err as Error;
      setCameraState((prev) => ({
        ...prev,
        isLoading: false,
        isActive: false,
        error: error.message || 'Could not access front camera.',
      }));
    }
  }, [runDetectionLoop]);

  const handleStopCamera = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    cameraManagerRef.current.stopCamera();
    eventEngineRef.current.reset();
    serialInterpreterRef.current.reset();
    setTrackedFaces([]);
    setCameraState((prev) => ({ ...prev, isActive: false }));
  }, []);

  const handleToggleCamera = useCallback(() => {
    if (cameraState.isActive) {
      handleStopCamera();
    } else {
      handleStartCamera();
    }
  }, [cameraState.isActive, handleStartCamera, handleStopCamera]);

  const handleTriggerPreset = useCallback((preset: DramaticPresetName) => {
    audioEngineRef.current.playPreset(preset);
  }, []);

  const handleSilenceAudio = useCallback(() => {
    audioEngineRef.current.stop();
  }, []);

  const handleResetScene = useCallback(() => {
    setCurrentScene(null);
    audioEngineRef.current.stop();
  }, []);

  return (
    <div className="min-h-screen bg-[#08080d] text-gray-100 flex flex-col items-center p-3 sm:p-6 md:p-8 selection:bg-red-600 selection:text-white">
      {/* Abstracted Broadcast Master Header */}
      <BroadcastHeader
        isCameraActive={cameraState.isActive}
        isAudioPlaying={isAudioPlaying}
        isMuted={isMuted}
        activeMode={activeMode}
        onToggleMode={setActiveMode}
        onToggleMute={() => audioEngineRef.current.toggleMute()}
        onToggleCamera={handleToggleCamera}
      />

      {/* Main Broadcast Stage */}
      <main className="w-full max-w-6xl flex flex-col items-center gap-5">
        {/* Cinema-Grade Broadcast Viewport with Live Lower Third & VFX */}
        <BroadcastViewport
          videoRef={videoRef}
          cameraState={cameraState}
          trackedFaces={trackedFaces}
          currentScene={currentScene}
          onStartCamera={handleStartCamera}
          onStopCamera={handleStopCamera}
        />

        {/* Quick Action Dock for Instant Director Interventions */}
        {cameraState.isActive && (
          <QuickActionDock
            onTriggerCue={handleTriggerPreset}
            onSilence={handleSilenceAudio}
            onResetScene={handleResetScene}
          />
        )}

        {/* Modular Studio Console (Script, Soundtrack, Cast, Telemetry) */}
        {activeMode === 'studio' && (
          <StudioConsole
            events={events}
            trackedFaces={trackedFaces}
            currentScene={currentScene}
            audioEngine={audioEngineRef.current}
            currentPreset={currentAudioPreset}
            modelStatus={modelStatus}
            modelError={modelError}
            onClearEvents={() => setEvents([])}
            onPlayPreset={handleTriggerPreset}
            onStopAudio={handleSilenceAudio}
          />
        )}
      </main>

      {/* Minimalist Cinematic Footer */}
      <footer className="mt-8 text-center text-xs text-gray-600 font-mono">
        SERIALOS • THE MELODRAMA OF EVERYDAY LIFE • TINKERHUB
      </footer>
    </div>
  );
};
