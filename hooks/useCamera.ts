/**
 * useCamera Hook
 * Custom hook for managing camera permissions, stream initialization, and video mirroring
 * @module hooks/useCamera
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  MediaError,
  MediaErrorCode,
  parseMediaError,
  createMediaError,
  checkBrowserSupport,
} from '@/lib/utils/media-errors';
import {
  getDefaultVideoConstraints,
  getDefaultAudioConstraints,
} from '@/lib/utils/video';

export interface UseCameraOptions {
  /** Whether to mirror the video (default: true) */
  mirrored?: boolean;
  /** Recording quality preset (default: 'standard') */
  quality?: 'standard' | 'reduced';
  /** Whether to request audio along with video (default: true) */
  includeAudio?: boolean;
  /** Callback when permission is granted */
  onPermissionGranted?: () => void;
  /** Callback when permission is denied */
  onPermissionDenied?: (error: MediaError) => void;
}

export interface UseCameraReturn {
  /** Current media stream */
  stream: MediaStream | null;
  /** Whether camera is currently active */
  isActive: boolean;
  /** Whether loading/requesting permissions */
  isLoading: boolean;
  /** Current error state */
  error: MediaError | null;
  /** Permission state: null = unknown, true = granted, false = denied */
  hasPermission: boolean | null;
  /** Video constraints being used */
  videoConstraints: MediaTrackConstraints;
  /** Request camera permissions and initialize stream */
  requestPermissions: () => Promise<boolean>;
  /** Start the camera with current stream */
  startCamera: () => Promise<void>;
  /** Stop the camera and release resources */
  stopCamera: () => void;
  /** Get the video track from the current stream */
  getVideoTrack: () => MediaStreamTrack | null;
  /** Get the audio track from the current stream */
  getAudioTrack: () => MediaStreamTrack | null;
  /** Clear the current error */
  clearError: () => void;
}

export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
  const {
    quality = 'standard',
    includeAudio = true,
    onPermissionGranted,
    onPermissionDenied,
  } = options;

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<MediaError | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 2;

  // Get constraints based on quality
  const videoConstraints = useRef(getDefaultVideoConstraints(quality));
  const audioConstraints = useRef(getDefaultAudioConstraints());

  // Cleanup function to stop all tracks
  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    setStream(null);
  }, []);

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get video track from current stream
  const getVideoTrack = useCallback((): MediaStreamTrack | null => {
    if (!streamRef.current) return null;
    return streamRef.current.getVideoTracks()[0] || null;
  }, []);

  // Get audio track from current stream
  const getAudioTrack = useCallback((): MediaStreamTrack | null => {
    if (!streamRef.current) return null;
    return streamRef.current.getAudioTracks()[0] || null;
  }, []);

  // Request permissions and initialize stream
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    // Check browser support first
    const supportCheck = checkBrowserSupport();
    if (!supportCheck.supported) {
      const err = supportCheck.error!;
      setError(err);
      onPermissionDenied?.(err);
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          ...videoConstraints.current,
          facingMode: 'user',
        },
        audio: includeAudio ? audioConstraints.current : false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setHasPermission(true);
      retryCountRef.current = 0;

      onPermissionGranted?.();
      return true;
    } catch (err) {
      const mediaError = parseMediaError(err);
      setError(mediaError);
      setHasPermission(false);
      onPermissionDenied?.(mediaError);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [includeAudio, onPermissionDenied, onPermissionGranted]);

  // Start camera with retry logic
  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // If we already have a stream, just verify it's still active
      if (streamRef.current) {
        const videoTrack = streamRef.current.getVideoTracks()[0];
        if (videoTrack?.enabled) {
          setStream(streamRef.current);
          return;
        }
      }

      // Request new stream
      const success = await requestPermissions();
      if (!success) {
        throw error || createMediaError(MediaErrorCode.RECORDING_START_FAILED);
      }
    } catch (err) {
      const mediaError = err instanceof MediaError ? err : parseMediaError(err);

      // Retry logic for recoverable errors
      if (mediaError.recoverable && retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current++;
        await new Promise(resolve => setTimeout(resolve, 1000));
        await startCamera();
        return;
      }

      setError(mediaError);
    } finally {
      setIsLoading(false);
    }
  }, [error, requestPermissions]);

  // Stop camera
  const stopCamera = useCallback(() => {
    cleanup();
    setHasPermission(null);
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    stream,
    isActive: !!stream,
    isLoading,
    error,
    hasPermission,
    videoConstraints: videoConstraints.current,
    requestPermissions,
    startCamera,
    stopCamera,
    getVideoTrack,
    getAudioTrack,
    clearError,
  };
}
