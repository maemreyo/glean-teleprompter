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
  /** Toggle audio track enabled state */
  toggleAudio: () => void;
  /** Toggle video track enabled state */
  toggleVideo: () => void;
  /** Current state of audio track */
  isAudioEnabled: boolean;
  /** Current state of video track */
  isVideoEnabled: boolean;
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
  const [isAudioEnabled, setIsAudioEnabled] = useState(includeAudio);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const streamRef = useRef<MediaStream | null>(null);
  const isMounted = useRef(false);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 2;

  // Get constraints based on quality
  const videoConstraints = useRef(getDefaultVideoConstraints(quality));
  const audioConstraints = useRef(getDefaultAudioConstraints());

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Cleanup function to stop all tracks
  const cleanup = useCallback(() => {
    console.log('[useCamera] cleanup called', {
      hasStream: !!streamRef.current,
      streamId: streamRef.current?.id,
      tracks: streamRef.current?.getTracks().length
    });
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('[useCamera] Stopping track', {
          kind: track.kind,
          id: track.id,
          enabled: track.enabled
        });
        track.stop();
      });
      streamRef.current = null;
    }
    
    // Only update state if mounted
    if (isMounted.current) {
      setStream(null);
    }
  }, []);

  // Clear error helper
  const clearError = useCallback(() => {
    if (isMounted.current) setError(null);
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

  // Toggle audio track
  const toggleAudio = useCallback(() => {
    const track = getAudioTrack();
    if (track) {
      track.enabled = !track.enabled;
      setIsAudioEnabled(track.enabled);
      console.log('[useCamera] Toggled audio', { enabled: track.enabled });
    }
  }, [getAudioTrack]);

  // Toggle video track
  const toggleVideo = useCallback(() => {
    const track = getVideoTrack();
    if (track) {
      track.enabled = !track.enabled;
      setIsVideoEnabled(track.enabled);
      console.log('[useCamera] Toggled video', { enabled: track.enabled });
    }
  }, [getVideoTrack]);

  // Request permissions and initialize stream
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    console.log('[useCamera] Requesting permissions', {
      includeAudio,
      quality,
      hasExistingStream: !!streamRef.current,
      existingStreamId: streamRef.current?.id
    });

    // Check if we already have an active stream - reuse it
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack && videoTrack.enabled) {
        console.log('[useCamera] Reusing existing active stream', {
          streamId: streamRef.current.id
        });
        if (isMounted.current) {
            setStream(streamRef.current);
            setHasPermission(true);
            setIsVideoEnabled(true);
            const audioTrack = streamRef.current.getAudioTracks()[0];
            setIsAudioEnabled(!!audioTrack?.enabled);
        }
        return true;
      }
    }

    // Check browser support first
    const supportCheck = checkBrowserSupport();
    if (!supportCheck.supported) {
      const err = supportCheck.error!;
      if (isMounted.current) {
        setError(err);
        onPermissionDenied?.(err);
      }
      return false;
    }

    if (isMounted.current) {
        setIsLoading(true);
        setError(null);
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          ...videoConstraints.current,
          facingMode: 'user',
        },
        audio: includeAudio ? audioConstraints.current : false,
      };

      console.log('[useCamera] Calling getUserMedia with constraints', constraints);
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (!isMounted.current) {
          console.log('[useCamera] Component unmounted during getUserMedia, stopping stream');
          mediaStream.getTracks().forEach(t => t.stop());
          return false;
      }

      console.log('[useCamera] Stream obtained', {
        streamId: mediaStream.id,
        videoTracks: mediaStream.getVideoTracks().length,
        audioTracks: mediaStream.getAudioTracks().length
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setHasPermission(true);
      setIsVideoEnabled(true);
      setIsAudioEnabled(includeAudio);
      retryCountRef.current = 0;

      onPermissionGranted?.();
      return true;
    } catch (err) {
      console.error('[useCamera] getUserMedia failed', err);
      if (!isMounted.current) return false;

      const mediaError = parseMediaError(err);
      setError(mediaError);
      setHasPermission(false);
      onPermissionDenied?.(mediaError);
      return false;
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, [includeAudio, onPermissionDenied, onPermissionGranted, quality]);

  // Start camera with retry logic
  const startCamera = useCallback(async () => {
    if (isMounted.current) {
        setIsLoading(true);
        setError(null);
    }

    try {
      // If we already have a stream, just verify it's still active
      if (streamRef.current) {
        const videoTrack = streamRef.current.getVideoTracks()[0];
        if (videoTrack?.enabled) {
          if (isMounted.current) {
             setStream(streamRef.current);
             setIsVideoEnabled(true);
          }
          return;
        }
      }

      // Request new stream
      const success = await requestPermissions();
      if (!success) {
        throw error || createMediaError(MediaErrorCode.RECORDING_START_FAILED);
      }
    } catch (err) {
       if (!isMounted.current) return;

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
      if (isMounted.current) setIsLoading(false);
    }
  }, [error, requestPermissions]);

  // Stop camera
  const stopCamera = useCallback(() => {
    console.log('[useCamera] stopCamera called', {
      hasStream: !!streamRef.current,
      streamId: streamRef.current?.id
    });
    cleanup();
    if (isMounted.current) setHasPermission(null);
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
    toggleAudio,
    toggleVideo,
    isAudioEnabled,
    isVideoEnabled,
  };
}
