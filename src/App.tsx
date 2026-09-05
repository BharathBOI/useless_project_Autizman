import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Music } from 'lucide-react';
import { BroadcastHeader } from './components/BroadcastHeader';
import { HeroWorkbench } from './components/HeroWorkbench';
import { BentoGrid } from './components/BentoGrid';
import { DimensionCta } from './components/DimensionCta';
import { ModernFooter } from './components/ModernFooter';
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
  const [activeNav, setActiveNav] = useState('workbench');
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

  const scrollToSection = (id: string) => {
    setActiveNav(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center selection:bg-[#84cc16] selection:text-black">
      {/* Watermelon UI styled Navigation Header */}
      <BroadcastHeader
        isCameraActive={cameraState.isActive}
        isAudioPlaying={isAudioPlaying}
        isMuted={isMuted}
        activeTab={activeNav}
        onNavigate={scrollToSection}
        onToggleMute={() => audioEngineRef.current.toggleMute()}
        onToggleCamera={handleToggleCamera}
      />

      {/* Main Content Flow */}
      <main className="w-full flex flex-col items-center">
        {/* HERO SECTION (Faithfully matching Watermelon UI layout & typography) */}
        <section id="workbench" className="w-full max-w-5xl mx-auto px-4 pt-16 pb-12 sm:pt-24 sm:pb-20 text-center relative crosshair-corner">
          {/* Watermelon UI Monospace Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md pill-badge mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16]" />
            <span>OPEN SOURCE — FREE SERIAL DRAMA</span>
          </div>

          {/* Bold Headline matching Watermelon UI ('Beautiful Components Built for designers') */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 font-sans leading-[1.1]">
            Beautiful Melodrama <br />
            Built for <span className="text-[#84cc16]">dramatists</span>
          </h1>

          {/* Sub-headline matching Watermelon UI typography */}
          <p className="text-sm sm:text-base md:text-lg text-zinc-400 max-w-2xl mx-auto mb-10 font-sans leading-relaxed">
            600+ dramatic cues and authentic Malayalam TV serial stingers crafted for everyday human reactions. Open your mouth, glare at relatives, and trigger instant climaxes — no strings attached.
          </p>

          {/* Action Buttons matching Watermelon UI */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap mb-14 sm:mb-20">
            <button
              onClick={handleToggleCamera}
              className="btn-lime px-6 sm:px-8 py-3 rounded-md text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Camera className="w-4 h-4 text-black" />
              <span>{cameraState.isActive ? 'Cut Stream' : 'Get Started'}</span>
            </button>

            <button
              onClick={() => handleTriggerPreset('SHOCK_1')}
              className="btn-dark px-5 sm:px-6 py-3 rounded-md text-xs sm:text-sm font-mono font-medium transition-all cursor-pointer flex items-center gap-2"
            >
              <Music className="w-4 h-4 text-[#84cc16]" />
              <span>Test Thunder Cue</span>
            </button>
          </div>

          {/* Centerpiece Hero Workbench */}
          <HeroWorkbench
            videoRef={videoRef}
            cameraState={cameraState}
            trackedFaces={trackedFaces}
            events={events}
            currentScene={currentScene}
            audioEngine={audioEngineRef.current}
            currentPreset={currentAudioPreset}
            isAudioPlaying={isAudioPlaying}
            onStartCamera={handleStartCamera}
            onStopCamera={handleStopCamera}
            onTriggerCue={handleTriggerPreset}
            onSilenceAudio={handleSilenceAudio}
            onResetScene={handleResetScene}
          />
        </section>

        {/* BENTO GRID SECTION */}
        <BentoGrid
          onTriggerPreset={handleTriggerPreset}
          isAudioPlaying={isAudioPlaying}
        />

        {/* READY TO JOIN A NEW DIMENSION SECTION */}
        <DimensionCta
          onStartCamera={handleToggleCamera}
          isCameraActive={cameraState.isActive}
        />
      </main>

      {/* Watermelon UI Footer */}
      <ModernFooter />
    </div>
  );
};
