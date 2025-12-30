/**
 * Error handling utilities for media operations
 * @module lib/utils/media-errors
 */

/**
 * Media error types for categorization and user messaging
 */
export enum MediaErrorCode {
  // Permission errors
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  PERMISSION_DISMISSED = 'PERMISSION_DISMISSED',
  PERMISSION_BLOCKED = 'PERMISSION_BLOCKED',

  // Hardware errors
  NO_CAMERA_FOUND = 'NO_CAMERA_FOUND',
  NO_MICROPHONE_FOUND = 'NO_MICROPHONE_FOUND',
  HARDWARE_UNAVAILABLE = 'HARDWARE_UNAVAILABLE',

  // Recording errors
  RECORDING_START_FAILED = 'RECORDING_START_FAILED',
  RECORDING_STOP_FAILED = 'RECORDING_STOP_FAILED',
  RECORDING_INTERRUPTED = 'RECORDING_INTERRUPTED',
  MAX_DURATION_EXCEEDED = 'MAX_DURATION_EXCEEDED',

  // Storage errors
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_FORMAT = 'INVALID_FILE_FORMAT',

  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONNECTION_TIMEOUT = 'CONNECTION_TIMEOUT',

  // Browser errors
  BROWSER_NOT_SUPPORTED = 'BROWSER_NOT_SUPPORTED',
  API_NOT_AVAILABLE = 'API_NOT_AVAILABLE',

  // Unknown errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Custom error class for media operations
 */
export class MediaError extends Error {
  public readonly code: MediaErrorCode;
  public readonly originalError?: Error;
  public readonly userMessage: string;
  public readonly recoverable: boolean;

  constructor(
    code: MediaErrorCode,
    userMessage: string,
    originalError?: Error,
    recoverable: boolean = true
  ) {
    super(userMessage);
    this.name = 'MediaError';
    this.code = code;
    this.userMessage = userMessage;
    this.originalError = originalError;
    this.recoverable = recoverable;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MediaError);
    }
  }

  /**
   * Convert the error to a plain object for serialization
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      recoverable: this.recoverable,
      originalError: this.originalError?.message,
    };
  }
}

/**
 * Error messages mapped to error codes
 */
const ERROR_MESSAGES: Record<MediaErrorCode, { title: string; message: string; recoverable: boolean }> = {
  [MediaErrorCode.PERMISSION_DENIED]: {
    title: 'Camera/Microphone Access Required',
    message: 'Please allow camera and microphone access to use this feature. You can enable permissions in your browser settings.',
    recoverable: true,
  },
  [MediaErrorCode.PERMISSION_DISMISSED]: {
    title: 'Permission Request Dismissed',
    message: 'The permission request was dismissed. Please try again and allow access when prompted.',
    recoverable: true,
  },
  [MediaErrorCode.PERMISSION_BLOCKED]: {
    title: 'Permission Blocked',
    message: 'Camera or microphone access has been blocked. Please unblock it in your browser settings and refresh the page.',
    recoverable: false,
  },
  [MediaErrorCode.NO_CAMERA_FOUND]: {
    title: 'No Camera Found',
    message: 'No camera device was detected on your system. Please connect a camera and try again.',
    recoverable: true,
  },
  [MediaErrorCode.NO_MICROPHONE_FOUND]: {
    title: 'No Microphone Found',
    message: 'No microphone device was detected on your system. Please connect a microphone and try again.',
    recoverable: true,
  },
  [MediaErrorCode.HARDWARE_UNAVAILABLE]: {
    title: 'Hardware Unavailable',
    message: 'The camera or microphone is currently unavailable. It may be in use by another application.',
    recoverable: true,
  },
  [MediaErrorCode.RECORDING_START_FAILED]: {
    title: 'Recording Failed to Start',
    message: 'Unable to start recording. Please check your camera and microphone connections and try again.',
    recoverable: true,
  },
  [MediaErrorCode.RECORDING_STOP_FAILED]: {
    title: 'Recording Failed to Stop',
    message: 'There was an issue stopping the recording. Your recording may still be available.',
    recoverable: true,
  },
  [MediaErrorCode.RECORDING_INTERRUPTED]: {
    title: 'Recording Interrupted',
    message: 'The recording was interrupted. Partial recording may be available.',
    recoverable: true,
  },
  [MediaErrorCode.MAX_DURATION_EXCEEDED]: {
    title: 'Maximum Duration Exceeded',
    message: 'Recording stopped after reaching the maximum duration of 5 minutes.',
    recoverable: false,
  },
  [MediaErrorCode.UPLOAD_FAILED]: {
    title: 'Upload Failed',
    message: 'Failed to upload the recording. Please check your internet connection and try again.',
    recoverable: true,
  },
  [MediaErrorCode.QUOTA_EXCEEDED]: {
    title: 'Storage Limit Reached',
    message: 'You have reached your storage limit. Please delete some recordings or upgrade your plan.',
    recoverable: false,
  },
  [MediaErrorCode.FILE_TOO_LARGE]: {
    title: 'File Too Large',
    message: 'The recording file is too large. Try recording for a shorter duration.',
    recoverable: false,
  },
  [MediaErrorCode.INVALID_FILE_FORMAT]: {
    title: 'Invalid File Format',
    message: 'The video format is not supported. Please try a different browser or format.',
    recoverable: false,
  },
  [MediaErrorCode.NETWORK_ERROR]: {
    title: 'Network Error',
    message: 'A network error occurred. Please check your internet connection and try again.',
    recoverable: true,
  },
  [MediaErrorCode.CONNECTION_TIMEOUT]: {
    title: 'Connection Timeout',
    message: 'The connection timed out. Please check your internet connection and try again.',
    recoverable: true,
  },
  [MediaErrorCode.BROWSER_NOT_SUPPORTED]: {
    title: 'Browser Not Supported',
    message: 'Your browser does not support video recording. Please try using Chrome, Firefox, Safari 14+, or Edge.',
    recoverable: false,
  },
  [MediaErrorCode.API_NOT_AVAILABLE]: {
    title: 'Feature Not Available',
    message: 'The media recording API is not available in your browser. Please update your browser or try a different one.',
    recoverable: false,
  },
  [MediaErrorCode.UNKNOWN_ERROR]: {
    title: 'Unknown Error',
    message: 'An unexpected error occurred. Please try again.',
    recoverable: true,
  },
};

/**
 * Create a MediaError from an error code
 */
export function createMediaError(code: MediaErrorCode, originalError?: Error): MediaError {
  const errorInfo = ERROR_MESSAGES[code];
  return new MediaError(
    code,
    errorInfo.message,
    originalError,
    errorInfo.recoverable
  );
}

/**
 * Parse a DOMException or Error into a MediaError
 */
export function parseMediaError(error: unknown): MediaError {
  if (error instanceof MediaError) {
    return error;
  }

  if (error instanceof DOMException) {
    switch (error.name) {
      case 'NotAllowedError':
        return createMediaError(MediaErrorCode.PERMISSION_DENIED, error);
      case 'NotFoundError':
        return createMediaError(MediaErrorCode.NO_CAMERA_FOUND, error);
      case 'NotReadableError':
        return createMediaError(MediaErrorCode.HARDWARE_UNAVAILABLE, error);
      case 'SecurityError':
        return createMediaError(MediaErrorCode.PERMISSION_BLOCKED, error);
      default:
        return createMediaError(MediaErrorCode.UNKNOWN_ERROR, error);
    }
  }

  if (error instanceof Error) {
    // Check error message for common patterns
    const message = error.message.toLowerCase();

    if (message.includes('permission')) {
      return createMediaError(MediaErrorCode.PERMISSION_DENIED, error);
    }
    if (message.includes('network') || message.includes('fetch')) {
      return createMediaError(MediaErrorCode.NETWORK_ERROR, error);
    }
    if (message.includes('quota') || message.includes('storage')) {
      return createMediaError(MediaErrorCode.QUOTA_EXCEEDED, error);
    }
    if (message.includes('timeout')) {
      return createMediaError(MediaErrorCode.CONNECTION_TIMEOUT, error);
    }

    return createMediaError(MediaErrorCode.UNKNOWN_ERROR, error);
  }

  return createMediaError(MediaErrorCode.UNKNOWN_ERROR);
}

/**
 * Get user-friendly error information for display
 */
export function getErrorDisplayInfo(error: MediaError): {
  title: string;
  message: string;
  canRetry: boolean;
  icon: 'alert' | 'warning' | 'info';
} {
  const info = ERROR_MESSAGES[error.code];
  const icon = error.recoverable ? 'warning' : 'alert';

  return {
    title: info.title,
    message: error.userMessage,
    canRetry: error.recoverable,
    icon,
  };
}

/**
 * Check if an error is recoverable (can be retried)
 */
export function isRecoverableError(error: unknown): boolean {
  if (error instanceof MediaError) {
    return error.recoverable;
  }
  const parsed = parseMediaError(error);
  return parsed.recoverable;
}

/**
 * Check if the browser supports media recording
 */
export function checkBrowserSupport(): { supported: boolean; error?: MediaError } {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') {
    return {
      supported: false,
      error: createMediaError(MediaErrorCode.API_NOT_AVAILABLE),
    };
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return {
      supported: false,
      error: createMediaError(MediaErrorCode.API_NOT_AVAILABLE),
    };
  }

  if (typeof MediaRecorder === 'undefined') {
    return {
      supported: false,
      error: createMediaError(MediaErrorCode.BROWSER_NOT_SUPPORTED),
    };
  }

  return { supported: true };
}

/**
 * Handle permission denial with specific error messages
 */
export function handlePermissionDenied(error: unknown): MediaError {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError') {
      return createMediaError(MediaErrorCode.PERMISSION_DENIED, error);
    }
  }
  return createMediaError(MediaErrorCode.PERMISSION_BLOCKED, error as Error);
}

/**
 * Wrap an async function with error handling and retry logic
 */
export async function withMediaErrorHandling<T>(
  fn: () => Promise<T>,
  retries: number = 1,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const mediaError = parseMediaError(error);

      if (!mediaError.recoverable || attempt === retries) {
        throw mediaError;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw parseMediaError(lastError);
}
