/**
 * Video format detection and utility functions
 * @module lib/utils/video
 */

import type { RecordingFileFormat } from '@/types/recording';

/**
 * Supported MIME types for video recording
 */
const VIDEO_MIME_TYPES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
  'video/mp4;codecs=h264,aac',
  'video/mp4;codecs=avc1,mp4a',
  'video/mp4',
] as const;

/**
 * Detect the best supported MIME type for MediaRecorder
 * @returns The best supported MIME type or empty string if none supported
 */
export function getSupportedMimeType(): string {
  if (typeof MediaRecorder === 'undefined') {
    return '';
  }

  for (const mimeType of VIDEO_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }

  return '';
}

/**
 * Get the file format from a MIME type
 * @param mimeType - The MIME type string
 * @returns The file format (webm or mp4)
 */
export function getFormatFromMimeType(mimeType: string): RecordingFileFormat {
  if (mimeType.includes('mp4')) {
    return 'mp4';
  }
  return 'webm';
}

/**
 * Get the file extension for a given format
 * @param format - The recording file format
 * @returns The file extension including the dot
 */
export function getFileExtension(format: RecordingFileFormat): string {
  return format === 'mp4' ? '.mp4' : '.webm';
}

/**
 * Check if a file is a valid video format
 * @param file - The file to check
 * @returns True if the file is a valid video format
 */
export function isValidVideoFile(file: File): boolean {
  const validTypes = ['video/webm', 'video/mp4', 'video/quicktime'];
  return validTypes.some(type => file.type.startsWith(type.split('/')[0]));
}

/**
 * Get video metadata from a file
 * @param file - The video file
 * @returns Promise with video metadata
 */
export async function getVideoMetadata(file: File): Promise<{
  duration: number;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video metadata'));
    };

    video.src = URL.createObjectURL(file);
  });
}

/**
 * Calculate estimated file size based on duration and quality
 * @param durationSeconds - Recording duration in seconds
 * @param quality - Recording quality preset
 * @returns Estimated file size in megabytes
 */
export function estimateFileSize(durationSeconds: number, quality: 'standard' | 'reduced'): number {
  const bytesPerSecond = quality === 'standard' ? 250_000 : 130_000; // ~250KB/s for standard, ~130KB/s for reduced
  const totalBytes = durationSeconds * bytesPerSecond;
  return totalBytes / (1024 * 1024); // Convert to MB
}

/**
 * Format duration in seconds to human-readable string
 * @param seconds - Duration in seconds
 * @returns Formatted duration string (e.g., "5:30" or "1:05:30")
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format file size in bytes to human-readable string
 * @param bytes - File size in bytes
 * @returns Formatted size string (e.g., "15.5 MB")
 */
export function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) {
    return `${mb.toFixed(1)} MB`;
  }
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
}

/**
 * Check if the browser supports video recording
 * @returns True if MediaRecorder API is supported
 */
export function isVideoRecordingSupported(): boolean {
  return (
    typeof MediaRecorder !== 'undefined' &&
    typeof navigator.mediaDevices !== 'undefined' &&
    typeof navigator.mediaDevices.getUserMedia === 'function'
  );
}

/**
 * Get the default video constraints for recording
 * @param quality - Recording quality preset
 * @returns MediaTrackConstraints for video
 */
export function getDefaultVideoConstraints(quality: 'standard' | 'reduced'): MediaTrackConstraints {
  if (quality === 'standard') {
    return {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 30 },
    };
  }
  return {
    width: { ideal: 640 },
    height: { ideal: 480 },
    frameRate: { ideal: 24 },
  };
}

/**
 * Get the default audio constraints for recording
 * @returns MediaTrackConstraints for audio
 */
export function getDefaultAudioConstraints(): MediaTrackConstraints {
  return {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: { ideal: 48000 },
  };
}

/**
 * Generate a unique job ID for video conversion
 * @param recordingId - The recording ID
 * @param targetFormat - Target format for conversion
 * @returns Unique job ID
 */
export function generateJobId(recordingId: string, targetFormat: RecordingFileFormat): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `conv_${recordingId.substring(0, 8)}_${targetFormat}_${timestamp}_${random}`;
}
