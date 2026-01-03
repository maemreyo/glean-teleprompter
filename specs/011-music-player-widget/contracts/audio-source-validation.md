# Audio Source Validation - Schemas & Contracts

**Feature**: 011-music-player-widget  
**Contract Type**: Validation Schemas  
**Status**: Draft  
**Created**: 2026-01-03  
**Implementation Location**: `lib/music/audioSourceValidation.ts`

---

## Overview

This contract defines validation schemas for music audio sources including YouTube URLs and uploaded audio files. It ensures data integrity and provides user-friendly error messages for invalid inputs.

---

## Constants & Limits

```typescript
/**
 * File size limits in bytes
 */
export const FILE_SIZE_LIMITS = {
  /** Maximum size per audio file (50MB) */
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 52,428,800 bytes

  /** Total quota per user (500MB) */
  TOTAL_QUOTA: 500 * 1024 * 1024, // 524,288,000 bytes
} as const;

/**
 * Supported audio file formats
 */
export const SUPPORTED_AUDIO_FORMATS = [
  'mp3',
  'wav',
  'm4a',
  'ogg',
  'aac',
  'flac',
] as const;

/**
 * Supported MIME types
 */
export const SUPPORTED_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/m4a',
  'audio/mp4',
  'audio/x-m4a',
  'audio/ogg',
  'audio/aac',
  'audio/x-aac',
  'audio/flac',
  'audio/x-flac',
] as const;

/**
 * YouTube URL patterns
 */
export const YOUTUBE_PATTERNS = {
  /** Standard watch URL */
  WATCH: /^https?:\/\/(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,

  /** Short URL */
  SHORT: /^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})/,

  /** Embed URL */
  EMBED: /^https?:\/\/(www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,

  /** All patterns combined */
  ANY: /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
} as const;
```

---

## YouTube URL Validation

```typescript
/**
 * YouTube URL validation result
 */
export interface YouTubeUrlValidationResult {
  isValid: boolean;
  videoId?: string;
  error?: YouTubeUrlError;
}

/**
 * YouTube URL error types
 */
export type YouTubeUrlError =
  | { type: 'invalid_format'; url: string }
  | { type: 'invalid_video_id'; url: string; videoId: string }
  | { type: 'empty_url' };

/**
 * Validate a YouTube URL
 */
export function validateYouTubeUrl(url: string): YouTubeUrlValidationResult {
  // Check for empty URL
  if (!url || url.trim().length === 0) {
    return {
      isValid: false,
      error: { type: 'empty_url' },
    };
  }

  // Trim whitespace
  const trimmedUrl = url.trim();

  // Try to match any YouTube URL pattern
  const match = trimmedUrl.match(YOUTUBE_PATTERNS.ANY);

  if (!match) {
    return {
      isValid: false,
      error: { type: 'invalid_format', url: trimmedUrl },
    };
  }

  // Extract video ID (it's in capture group 5 for the combined pattern)
  const videoId = match[5];

  if (!videoId || videoId.length !== 11) {
    return {
      isValid: false,
      error: { type: 'invalid_video_id', url: trimmedUrl, videoId: videoId || '' },
    };
  }

  return {
    isValid: true,
    videoId,
  };
}

/**
 * Extract video ID from YouTube URL
 * Returns null if URL is invalid
 */
export function extractYouTubeVideoId(url: string): string | null {
  const result = validateYouTubeUrl(url);
  return result.isValid ? (result.videoId ?? null) : null;
}

/**
 * Build YouTube embed URL from video ID
 */
export function buildYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Build YouTube watch URL from video ID
 */
export function buildYouTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
```

---

## Audio File Validation

```typescript
/**
 * Audio file validation result
 */
export interface AudioFileValidationResult {
  isValid: boolean;
  error?: AudioFileError;
}

/**
 * Audio file error types
 */
export type AudioFileError =
  | { type: 'file_too_large'; fileName: string; fileSize: number; maxSize: number }
  | { type: 'unsupported_format'; fileName: string; format: string }
  | { type: 'invalid_mime_type'; fileName: string; mimeType: string }
  | { type: 'quota_exceeded'; fileSize: number; currentUsage: number; quota: number }
  | { type: 'no_file_selected' };

/**
 * Validate an audio file
 */
export function validateAudioFile(file: File): AudioFileValidationResult {
  // Check if file exists
  if (!file) {
    return {
      isValid: false,
      error: { type: 'no_file_selected' },
    };
  }

  // Check file size
  if (file.size > FILE_SIZE_LIMITS.MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: {
        type: 'file_too_large',
        fileName: file.name,
        fileSize: file.size,
        maxSize: FILE_SIZE_LIMITS.MAX_FILE_SIZE,
      },
    };
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !SUPPORTED_AUDIO_FORMATS.includes(extension as any)) {
    return {
      isValid: false,
      error: {
        type: 'unsupported_format',
        fileName: file.name,
        format: extension || 'unknown',
      },
    };
  }

  // Check MIME type
  if (!SUPPORTED_MIME_TYPES.includes(file.type as any)) {
    return {
      isValid: false,
      error: {
        type: 'invalid_mime_type',
        fileName: file.name,
        mimeType: file.type,
      },
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Validate file against quota
 * Use this after checking current user storage usage
 */
export function validateFileQuota(
  fileSize: number,
  currentUsage: number
): AudioFileValidationResult {
  const newTotal = currentUsage + fileSize;

  if (newTotal > FILE_SIZE_LIMITS.TOTAL_QUOTA) {
    return {
      isValid: false,
      error: {
        type: 'quota_exceeded',
        fileSize,
        currentUsage,
        quota: FILE_SIZE_LIMITS.TOTAL_QUOTA,
      },
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Get file extension from MIME type
 * Returns null if MIME type is unknown
 */
export function getExtensionFromMimeType(mimeType: string): string | null {
  const mimeToExt: Record<string, string> = {
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/wav': 'wav',
    'audio/wave': 'wav',
    'audio/x-wav': 'wav',
    'audio/m4a': 'm4a',
    'audio/mp4': 'm4a',
    'audio/x-m4a': 'm4a',
    'audio/ogg': 'ogg',
    'audio/aac': 'aac',
    'audio/x-aac': 'aac',
    'audio/flac': 'flac',
    'audio/x-flac': 'flac',
  };

  return mimeToExt[mimeType] || null;
}

/**
 * Check if a file is an audio file
 */
export function isAudioFile(file: File): boolean {
  return file.type.startsWith('audio/');
}
```

---

## Error Messages

```typescript
/**
 * User-friendly error messages
 */
export interface ErrorMessage {
  title: string;
  description: string;
  suggestion?: string;
}

/**
 * Get error message for YouTube URL error
 */
export function getYouTubeErrorMessage(
  error: YouTubeUrlError
): ErrorMessage {
  switch (error.type) {
    case 'empty_url':
      return {
        title: 'No URL provided',
        description: 'Please enter a YouTube URL to use as background music.',
        suggestion: 'Find a video on YouTube and paste the URL here.',
      };

    case 'invalid_format':
      return {
        title: 'Invalid YouTube URL',
        description: `"${error.url}" is not a valid YouTube URL.`,
        suggestion: 'Make sure the URL starts with https://youtube.com/watch?v= or https://youtu.be/',
      };

    case 'invalid_video_id':
      return {
        title: 'Invalid YouTube video',
        description: `The video ID "${error.videoId}" is not valid.`,
        suggestion: 'Make sure you copied the complete URL from YouTube.',
      };
  }
}

/**
 * Get error message for audio file error
 */
export function getAudioFileErrorMessage(
  error: AudioFileError
): ErrorMessage {
  switch (error.type) {
    case 'no_file_selected':
      return {
        title: 'No file selected',
        description: 'Please select an audio file to upload.',
        suggestion: 'Click the browse button to choose a file from your device.',
      };

    case 'file_too_large':
      return {
        title: 'File too large',
        description: `"${error.fileName}" is ${formatBytes(error.fileSize)} but the maximum size is ${formatBytes(error.maxSize)}.`,
        suggestion: 'Try compressing the audio file or choosing a shorter track.',
      };

    case 'unsupported_format':
      return {
        title: 'Unsupported file format',
        description: `"${error.fileName}" has the format ".${error.format}" which is not supported.`,
        suggestion: `Supported formats: ${SUPPORTED_AUDIO_FORMATS.join(', ')}.`,
      };

    case 'invalid_mime_type':
      return {
        title: 'Invalid file type',
        description: `"${error.fileName}" has type "${error.mimeType}" which is not a supported audio file.`,
        suggestion: 'Make sure you are uploading an audio file, not a video or other file type.',
      };

    case 'quota_exceeded':
      return {
        title: 'Storage quota exceeded',
        description: `This file is ${formatBytes(error.fileSize)} and you have ${formatBytes(error.currentUsage)} of ${formatBytes(error.quota)} used.`,
        suggestion: 'Delete existing audio files or upgrade your storage plan.',
      };
  }
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
```

---

## Validation Schema Interface

```typescript
/**
 * Complete validation schema interface
 */
export interface AudioSourceValidationSchema {
  // YouTube validation
  validateYouTubeUrl: (url: string) => YouTubeUrlValidationResult;
  extractYouTubeVideoId: (url: string) => string | null;
  buildYouTubeEmbedUrl: (videoId: string) => string;

  // File validation
  validateAudioFile: (file: File) => AudioFileValidationResult;
  validateFileQuota: (fileSize: number, currentUsage: number) => AudioFileValidationResult;
  isAudioFile: (file: File) => boolean;

  // Error messages
  getYouTubeErrorMessage: (error: YouTubeUrlError) => ErrorMessage;
  getAudioFileErrorMessage: (error: AudioFileError) => ErrorMessage;
  formatBytes: (bytes: number) => string;

  // Constants
  FILE_SIZE_LIMITS: typeof FILE_SIZE_LIMITS;
  SUPPORTED_AUDIO_FORMATS: typeof SUPPORTED_AUDIO_FORMATS;
  SUPPORTED_MIME_TYPES: typeof SUPPORTED_MIME_TYPES;
}
```

---

## Implementation Template

```typescript
/**
 * Audio Source Validation Implementation
 * 
 * This template shows the expected structure when implementing
 * the actual validation in lib/music/audioSourceValidation.ts
 */

import {
  FILE_SIZE_LIMITS,
  SUPPORTED_AUDIO_FORMATS,
  SUPPORTED_MIME_TYPES,
  YOUTUBE_PATTERNS,
} from '@/specs/011-music-player-widget/contracts/audio-source-validation';

// Export all validation functions and types
export {
  validateYouTubeUrl,
  extractYouTubeVideoId,
  buildYouTubeEmbedUrl,
  validateAudioFile,
  validateFileQuota,
  isAudioFile,
  getYouTubeErrorMessage,
  getAudioFileErrorMessage,
  formatBytes,
  getExtensionFromMimeType,
};

// Re-export types and constants
export type {
  YouTubeUrlValidationResult,
  YouTubeUrlError,
  AudioFileValidationResult,
  AudioFileError,
  ErrorMessage,
};

export { FILE_SIZE_LIMITS, SUPPORTED_AUDIO_FORMATS, SUPPORTED_MIME_TYPES, YOUTUBE_PATTERNS };

// ... Implement all functions from above sections
```

---

## Usage Example

```typescript
import { 
  validateYouTubeUrl, 
  validateAudioFile,
  getYouTubeErrorMessage,
  getAudioFileErrorMessage,
} from '@/lib/music/audioSourceValidation';
import { toast } from 'sonner';

function MusicSettings() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleYouTubeUrlChange = (url: string) => {
    setYoutubeUrl(url);

    // Validate URL
    const result = validateYouTubeUrl(url);

    if (!result.isValid && result.error) {
      const error = getYouTubeErrorMessage(result.error);
      toast.error(error.title, {
        description: error.description,
      });
    }
  };

  const handleFileSelect = async (file: File) => {
    // Validate file
    const result = validateAudioFile(file);

    if (!result.isValid && result.error) {
      const error = getAudioFileErrorMessage(result.error);
      toast.error(error.title, {
        description: error.description,
        action: error.suggestion ? {
          label: 'Learn More',
          onClick: () => console.log(error.suggestion),
        } : undefined,
      });
      return;
    }

    // Check quota (would need to fetch current usage from server)
    const currentUsage = await fetchCurrentAudioStorageUsage();
    const quotaResult = validateFileQuota(file.size, currentUsage);

    if (!quotaResult.isValid && quotaResult.error) {
      const error = getAudioFileErrorMessage(quotaResult.error);
      toast.error(error.title, {
        description: error.description,
      });
      return;
    }

    // File is valid, proceed with upload
    setSelectedFile(file);
    uploadAudioFile(file);
  };

  return (
    <div>
      <input
        type="text"
        value={youtubeUrl}
        onChange={(e) => handleYouTubeUrlChange(e.target.value)}
        placeholder="Paste YouTube URL here"
      />
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />
    </div>
  );
}
```

---

## Testing

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { validateYouTubeUrl, validateAudioFile } from '@/lib/music/audioSourceValidation';

describe('Audio Source Validation', () => {
  describe('YouTube URL Validation', () => {
    it('should accept valid YouTube watch URLs', () => {
      const result = validateYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(result.isValid).toBe(true);
      expect(result.videoId).toBe('dQw4w9WgXcQ');
    });

    it('should accept valid YouTube short URLs', () => {
      const result = validateYouTubeUrl('https://youtu.be/dQw4w9WgXcQ');
      expect(result.isValid).toBe(true);
      expect(result.videoId).toBe('dQw4w9WgXcQ');
    });

    it('should reject non-YouTube URLs', () => {
      const result = validateYouTubeUrl('https://example.com/video');
      expect(result.isValid).toBe(false);
      expect(result.error?.type).toBe('invalid_format');
    });

    it('should reject empty URLs', () => {
      const result = validateYouTubeUrl('');
      expect(result.isValid).toBe(false);
      expect(result.error?.type).toBe('empty_url');
    });
  });

  describe('Audio File Validation', () => {
    it('should accept valid MP3 files under size limit', () => {
      const file = new File(['audio data'], 'song.mp3', {
        type: 'audio/mpeg',
      });
      Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 }); // 10MB

      const result = validateAudioFile(file);
      expect(result.isValid).toBe(true);
    });

    it('should reject files exceeding size limit', () => {
      const file = new File(['audio data'], 'large.mp3', {
        type: 'audio/mpeg',
      });
      Object.defineProperty(file, 'size', { value: 60 * 1024 * 1024 }); // 60MB

      const result = validateAudioFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error?.type).toBe('file_too_large');
    });

    it('should reject unsupported formats', () => {
      const file = new File(['video data'], 'video.mp4', {
        type: 'video/mp4',
      });

      const result = validateAudioFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error?.type).toBe('invalid_mime_type');
    });
  });
});
```

---

## Related Documents

- **Data Model**: [`specs/011-music-player-widget/data-model.md`](../data-model.md)
- **Store Contract**: [`specs/011-music-player-widget/contracts/music-player-store.md`](./music-player-store.md)
- **Technical Research**: [`specs/011-music-player-widget/research.md`](../research.md)

---

**Document Status**: ✅ Complete  
**Next Step**: Implement in `lib/music/audioSourceValidation.ts`
