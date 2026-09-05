import React, { useEffect, useRef, useState } from 'react';
import { Camera, AlertCircle, RefreshCw, Sparkles, UserCheck } from 'lucide-react';
import { audioEngine } from '../audio/audioEngine';
import { eventEngine } from '../events/eventEngine';
import { faceTracker } from '../vision/faceTracker';
import { personTracker } from '../vision/personTracker';
import { temporalTracker } from '../vision/temporalTracker';
import { TrackedFaceState } from '../types/vision';

interface CameraViewProps {
  onActiveFacesUpdate: (faces: TrackedFaceState[]) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onActiveFacesUpdate }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isCameraStarted, setIsCameraStarted] = useState<boolean>(false);
  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detectedFaces, setDetectedFaces] = useState<TrackedFaceState[]>([]);

  const animFrameIdRef = useRef<number | null>(null);

  const startCamera = async () => {
    setErrorMessage(null);
    setIsLoadingModel(true);

    try {
      // 1. Initialize Web Audio Context from direct user click
      await audioEngine.initAudioContext();

      // 2. Initialize MediaPipe FaceLandmarker
      await faceTracker.initialize();
      setIsLoadingModel(false);

      // 3. Request webcam stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraStarted(true);
      }
    } catch (err: unknown) {
      console.error('❌ [SERIALOS CameraView] Error starting camera or model:', err);
      setIsLoadingModel(false);

      if (err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
        setErrorMessage('Camera access was denied. Please allow camera permissions in your browser settings.');
      } else {
        setErrorMessage(`Failed to initialize camera/vision model: ${(err as Error).message || err}`);
      }
    }
  };

  useEffect(() => {
    if (!isCameraStarted) return;

    let lastTime = 0;

    const processFrame = () => {
      const now = performance.now();
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && video.readyState >= 2 && canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Sync canvas resolution with video dimensions
          if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
          }

          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Detect faces via faceTracker
          const faces = faceTracker.detectFaces(video, now);
          setDetectedFaces(faces);
          onActiveFacesUpdate(faces);

          // Process person entrance/exit & interaction events
          const personEvents = personTracker.update(faces, Date.now());

          // Process temporal expression events per face
          const expressionEvents = faces
            .map(f => temporalTracker.processFace(f, Date.now()))
            .filter((e): e is NonNullable<typeof e> => e !== null);

          // Check if entrance caused an expression change
          const combinedVisionEvents = [...personEvents];
          expressionEvents.forEach(exprEvt => {
            combinedVisionEvents.push(exprEvt);
            const causedEvt = personTracker.checkForEntranceCausedChange(exprEvt);
            if (causedEvt) {
              combinedVisionEvents.push(causedEvt);
            }
          });

          // Dispatch to Central Event Engine
          if (combinedVisionEvents.length > 0) {
            eventEngine.pushEvents(combinedVisionEvents, faces);
          }

          // Draw face overlay boxes and labels on Canvas
          faces.forEach(face => {
            const { xMin, yMin, width, height } = face.boundingBox;
            const x = xMin * canvas.width;
            const y = yMin * canvas.height;
            const w = width * canvas.width;
            const h = height * canvas.height;

            // Draw bounding box (gold / red serial theme)
            ctx.strokeStyle = face.currentExpression === 'surprised' || face.currentExpression === 'angry' ? '#ef4444' : '#f59e0b';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, w, h);

            // Draw Label pill background
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            const labelHeight = 44;
            const labelY = Math.max(0, y - labelHeight - 6);
            ctx.fillRect(x, labelY, Math.max(w, 180), labelHeight);
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, labelY, Math.max(w, 180), labelHeight);

            // Draw Text
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Inter, sans-serif';
            ctx.fillText(`${face.faceId}`, x + 8, labelY + 18);

            ctx.fillStyle = '#cbd5e1';
            ctx.font = '12px Inter, sans-serif';
            ctx.fillText(
              `Expression: ${face.currentExpression.toUpperCase()} (${Math.round(face.expressionConfidence * 100)}%)`,
              x + 8,
              labelY + 36
            );
          });
        }
      }

      animFrameIdRef.current = requestAnimationFrame(processFrame);
    };

    animFrameIdRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isCameraStarted, onActiveFacesUpdate]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex flex-col items-center justify-center min-h-[380px] lg:min-h-[440px]">
      {!isCameraStarted ? (
        <div className="flex flex-col items-center justify-center p-8 text-center max-w-md z-10">
          <div className="w-20 h-20 rounded-full bg-red-950/80 border-2 border-red-500/50 flex items-center justify-center mb-6 shadow-lg shadow-red-950/50">
            <Camera className="w-10 h-10 text-red-500" />
          </div>

          <h2 className="text-2xl font-bold font-serif text-slate-100 mb-2 tracking-wide">
            ENTER THE DRAMA
          </h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Allow camera access to enable real-time face tracking, temporal expression change analysis, and dramatic audio synthesis.
          </p>

          {errorMessage && (
            <div className="w-full mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-sm flex items-start space-x-3 text-left">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            onClick={startCamera}
            disabled={isLoadingModel}
            className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-bold text-lg tracking-wider uppercase shadow-xl hover:shadow-red-900/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex items-center space-x-3 cursor-pointer"
          >
            {isLoadingModel ? (
              <>
                <RefreshCw className="w-6 h-6 animate-spin text-amber-300" />
                <span>LOADING VISION MODEL...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 text-amber-300 group-hover:rotate-12 transition-transform" />
                <span>START CAMERA</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="relative w-full h-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          {/* Live Video Feed (Mirrored for user natural feel) */}
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />

          {/* Face Overlay Canvas (Not mirrored so canvas matches coordinate system) */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none transform -scale-x-100"
          />

          {/* Active Detected Faces Status Bar */}
          <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 text-xs font-semibold text-slate-200">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {detectedFaces.length === 0
                ? 'No characters detected'
                : `${detectedFaces.length} Character${detectedFaces.length > 1 ? 's' : ''} in Frame`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

