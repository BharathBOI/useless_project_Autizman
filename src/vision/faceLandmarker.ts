import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export class FaceLandmarkerService {
  private landmarker: FaceLandmarker | null = null;
  private isLoading = false;
  private lastVideoTime = -1;

  async init(): Promise<void> {
    if (this.landmarker || this.isLoading) return;
    this.isLoading = true;

    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      // Attempt initialization with GPU first, fall back to CPU if WebGL fails
      try {
        this.landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
          runningMode: 'VIDEO',
          numFaces: 5,
        });
      } catch (gpuError) {
        console.warn('FaceLandmarker GPU initialization failed, falling back to CPU:', gpuError);
        this.landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'CPU',
          },
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
          runningMode: 'VIDEO',
          numFaces: 5,
        });
      }
    } catch (err) {
      console.error('Failed to initialize FaceLandmarker:', err);
      throw new Error('Could not load facial tracking model. Please ensure an active internet connection.');
    } finally {
      this.isLoading = false;
    }
  }

  detectVideoFrame(video: HTMLVideoElement, timestampMs: number) {
    if (!this.landmarker) return null;
    if (video.currentTime === this.lastVideoTime || video.paused || video.ended) {
      return null;
    }
    this.lastVideoTime = video.currentTime;

    try {
      return this.landmarker.detectForVideo(video, timestampMs);
    } catch (e) {
      console.warn('Frame detection skipped:', e);
      return null;
    }
  }

  isReady(): boolean {
    return !!this.landmarker;
  }
}
