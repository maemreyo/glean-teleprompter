/**
 * useCameraRecorder Hook
 * Custom hook for managing video recording with MediaRecorder API
 * @module hooks/useCameraRecorder
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import type { RecordingQuality } from '@/types/recording';
import { RECORDING_LIMITS } from '@/types/recording';
import { MediaError, MediaErrorCode, createMediaError } from '@/lib/utils/media-errors';
import { getSupportedMimeType } from '@/lib/utils/video';
import { getStorageQuota } from '@/lib/supabase/recordings';

export interface UseCameraRecorderOptions {
  /** Recording quality preset */
  quality?: RecordingQuality;
  /** Maximum recording duration in seconds (default: 300) */
  maxDuration?: number;
  /** Callback when recording state changes */
  onStateChange?: (state: RecordingState) => void;
  /** Callback when recording is stopped with data */
  onRecordingComplete?: (blob: Blob, duration: number) => void;
  /** Callback when error occurs */
  onError?: (error: MediaError) => void;
}

export interface RecordingState {
  /** Recording status */
  status: 'idle' | 'recording' | 'paused' | 'stopped';
  /** Current recording duration in seconds */
  duration: number;
  /** Media stream being recorded */
  stream: MediaStream | null;
  /** Recorded blob (available after stopping) */
  recordedBlob: Blob | null;
  /** Current error state */
  error: MediaError | null;
}

export interface UseCameraRecorderReturn extends RecordingState {
  /** Start recording */
  startRecording: (stream: MediaStream) => Promise<boolean>;
  /** Stop recording */
  stopRecording: () => void;
  /** Pause recording */
  pauseRecording: () => void;
  /** Resume recording */
  resumeRecording: () => void;
  /** Clear the current recording blob */
  clearRecording: () => void;
  /** Get recording MIME type */
  mimeType: string;
  /** Check if recording is currently paused */
  isPaused: boolean;
  /** Current effective quality (may be adjusted for quota) */
  effectiveQuality: RecordingQuality;
}

export function useCameraRecorder(options: UseCameraRecorderOptions = {}): UseCameraRecorderReturn {
  const {
    quality = 'standard',
    maxDuration = RECORDING_LIMITS.MAX_DURATION_SECONDS,
    onStateChange,
    onRecordingComplete,
    onError,
  } = options;

  const [state, setState] = useState<RecordingState>({
    status: 'idle',
    duration: 0,
    stream: null,
    recordedBlob: null,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 2;
  const [effectiveQuality, setEffectiveQuality] = useState<RecordingQuality>(quality);

  // Get supported MIME type
  const mimeType = getSupportedMimeType();

  // Check quota and adjust quality if needed
  const adjustQualityForQuota = useCallback(async (): Promise<RecordingQuality> => {
    try {
      const quota = await getStorageQuota();
      // If usage is above 80%, switch to reduced quality
      if (quota.usage_percentage >= 80) {
        return 'reduced';
      }
      return quality;
    } catch {
      // If quota check fails, use the configured quality
      return quality;
    }
  }, [quality]);

  // Update recording state
  const updateState = useCallback((updates: Partial<RecordingState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      onStateChange?.(newState);
      return newState;
    });
  }, [onStateChange]);

  // Duration tracking
  const startDurationTracking = useCallback(() => {
    durationIntervalRef.current = window.setInterval(() => {
      setState(prev => {
        const newDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);

        // Auto-stop at max duration
        if (newDuration >= maxDuration) {
          stopRecording();
          return { ...prev, duration: maxDuration };
        }

        return { ...prev, duration: newDuration };
      });
    }, 1000);
  }, [maxDuration]);

  const stopDurationTracking = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  // Start recording
  const startRecording = useCallback(async (stream: MediaStream): Promise<boolean> => {
    // Clear previous state
    chunksRef.current = [];
    retryCountRef.current = 0;

    // Validate stream has video track
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) {
      const error = createMediaError(MediaErrorCode.NO_CAMERA_FOUND);
      updateState({ error });
      onError?.(error);
      return false;
    }

    // Validate MIME type support
    if (!mimeType) {
      const error = createMediaError(MediaErrorCode.BROWSER_NOT_SUPPORTED);
      updateState({ error });
      onError?.(error);
      return false;
    }

    // Adjust quality based on quota
    const adjustedQuality = await adjustQualityForQuota();
    setEffectiveQuality(adjustedQuality);

    // Notify user if quality was reduced
    if (adjustedQuality === 'reduced' && quality === 'standard') {
      console.warn('Recording quality reduced due to storage limits');
    }

    try {
      // Create MediaRecorder with options
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: adjustedQuality === 'standard' ? 2500000 : 1200000,
      });

      mediaRecorderRef.current = mediaRecorder;

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        stopDurationTracking();

        const blob = new Blob(chunksRef.current, { type: mimeType });
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);

        updateState({
          status: 'stopped',
          duration,
          recordedBlob: blob,
        });

        onRecordingComplete?.(blob, duration);
      };

      // Handle errors
      mediaRecorder.onerror = (event) => {
        const error = createMediaError(
          MediaErrorCode.RECORDING_INTERRUPTED,
          event instanceof Error ? event : undefined
        );
        updateState({ error, status: 'stopped' });
        onError?.(error);
        stopDurationTracking();
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      startTimeRef.current = Date.now();

      updateState({
        status: 'recording',
        stream,
        duration: 0,
        recordedBlob: null,
        error: null,
      });

      startDurationTracking();
      return true;
    } catch (err) {
      const error = err instanceof MediaError ? err : createMediaError(
        MediaErrorCode.RECORDING_START_FAILED,
        err instanceof Error ? err : undefined
      );

      // Retry logic for recoverable errors
      if (error.recoverable && retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current++;
        setTimeout(() => startRecording(stream), 500);
        return false;
      }

      updateState({ error });
      onError?.(error);
      return false;
    }
  }, [mimeType, quality, updateState, onError, onRecordingComplete, startDurationTracking, stopDurationTracking]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        const error = createMediaError(
          MediaErrorCode.RECORDING_STOP_FAILED,
          err instanceof Error ? err : undefined
        );
        updateState({ error });
        onError?.(error);
      }
    }
    stopDurationTracking();
  }, [updateState, onError, stopDurationTracking]);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.pause();
      updateState({ status: 'paused' });
      stopDurationTracking();
    }
  }, [updateState, stopDurationTracking]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'paused'
    ) {
      mediaRecorderRef.current.resume();
      updateState({ status: 'recording' });
      // Adjust start time to account for pause duration
      startDurationTracking();
    }
  }, [updateState, startDurationTracking]);

  // Clear recording blob
  const clearRecording = useCallback(() => {
    chunksRef.current = [];
    updateState({
      status: 'idle',
      duration: 0,
      recordedBlob: null,
      error: null,
    });
  }, [updateState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDurationTracking();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [stopDurationTracking]);

  return {
    ...state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
    mimeType,
    isPaused: state.status === 'paused',
    effectiveQuality,
  };
}
