import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Sparkles, Camera, ArrowDown, Music, Play, Layers } from 'lucide-react';
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
    <div className="min-h-screen bg-[#040408] text-zinc-100 flex flex-col items-center selection:bg-purple-600 selection:text-white">
      {/* Floating Modern Header / Navbar */}
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
        {/* HERO SECTION (Faithfully matching top of user's reference image) */}
        <section id="workbench" className="w-full max-w-5xl mx-auto px-4 pt-12 pb-10 sm:pt-20 sm:pb-16 text-center relative">
          {/* Subtle Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs font-mono font-medium mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Mega-Serial Operating System • v2.4</span>
          </div>

          {/* Bold Headline with Gradient Accent (Matching Reference Design) */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 font-sans leading-[1.15]">
            The Best Place To Build, Score, And Discover <br className="hidden sm:inline" />
            <span className="gradient-text-purple">Front-End Melodrama.</span>
          </h1>

          {/* Sub-headline */}
          <p className="text-sm sm:text-base md:text-lg text-zinc-400 max-w-2xl mx-auto mb-8 font-sans leading-relaxed">
            A cloud-orchestrated serial environment for human micro-expressions. Instant Malayalam TV scores, real-time emotion telemetry, and zero-latency triple zooms.
          </p>

          {/* Glowing Purple & Frosted Glass Action Buttons (Matching Reference Design) */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap mb-12 sm:mb-16">
            <button
              onClick={handleToggleCamera}
              className="btn-glow-purple px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide text-white uppercase flex items-center gap-2 cursor-pointer shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>{cameraState.isActive ? 'Cut Broadcast' : 'Commence Broadcast'}</span>
            </button>

            <button
              onClick={() => handleTriggerPreset('SHOCK_1')}
              className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-2"
            >
              <Music className="w-4 h-4 text-purple-400" />
              <span>Test Thunder Cue</span>
            </button>
          </div>

          {/* Centerpiece Interactive Hero Workbench (Matching central console mockup in image) */}
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

        {/* BENTO GRID SECTION ("All Of Your Deployments In One Place" Matching Reference Design) */}
        <BentoGrid
          onTriggerPreset={handleTriggerPreset}
          isAudioPlaying={isAudioPlaying}
        />

        {/* READY TO JOIN A NEW DIMENSION SECTION (Matching Bottom Right of Reference Design) */}
        <DimensionCta
          onStartCamera={handleToggleCamera}
          isCameraActive={cameraState.isActive}
        />
      </main>

      {/* Modern Developer Platform Footer */}
      <ModernFooter />
    </div>
  );
};
