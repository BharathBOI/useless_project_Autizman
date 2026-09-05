export class CameraManager {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;

  async startCamera(videoElement: HTMLVideoElement): Promise<MediaStream> {
    this.videoElement = videoElement;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera access (getUserMedia) is not supported in this browser.');
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      this.videoElement.srcObject = this.stream;

      // Return a promise that resolves once metadata has loaded and video starts playing
      return new Promise<MediaStream>((resolve, reject) => {
        if (!this.videoElement) {
          return reject(new Error('Video element unmounted'));
        }

        this.videoElement.onloadedmetadata = () => {
          this.videoElement?.play()
            .then(() => resolve(this.stream!))
            .catch(reject);
        };
      });
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        throw new Error('Camera permission denied. Please allow camera access in your browser to proceed.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        throw new Error('No camera found on your laptop/device.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        throw new Error('Camera is currently in use by another application.');
      }
      throw new Error(`Failed to initialize camera: ${error.message}`);
    }
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  getVideoElement(): HTMLVideoElement | null {
    return this.videoElement;
  }

  getStream(): MediaStream | null {
    return this.stream;
  }

  isStreaming(): boolean {
    return !!(this.stream && this.stream.active);
  }
}
