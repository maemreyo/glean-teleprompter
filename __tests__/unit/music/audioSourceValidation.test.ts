/**
 * Unit tests for audio source validation
 * Tests YouTube URL validation and audio file validation
 * 
 * @feature 011-music-player-widget
 */

import {
  validateYouTubeUrl,
  extractYouTubeVideoId,
  buildYouTubeEmbedUrl,
  buildYouTubeWatchUrl,
  validateAudioFile,
  validateFileQuota,
  getExtensionFromMimeType,
  isAudioFile,
  getYouTubeErrorMessage,
  getAudioFileErrorMessage,
  formatBytes,
  FILE_SIZE_LIMITS,
  SUPPORTED_AUDIO_FORMATS,
} from '@/lib/music/audioSourceValidation';

describe('validateYouTubeUrl', () => {
  describe('valid YouTube URLs', () => {
    it('should validate standard watch URL', () => {
      const result = validateYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(result.isValid).toBe(true);
      expect(result.videoId).toBe('dQw4w9WgXcQ');
      expect(result.error).toBeUndefined();
    });

    it('should validate standard watch URL without www', () => {
      const result = validateYouTubeUrl('https://youtube.com/watch?v=dQw4w9WgXcQ');
      expect(result.isValid).toBe(true);
      expect(result.videoId).toBe('dQw4w9WgXcQ');
    });

    it('should validate short URL', () => {
      const result = validateYouTubeUrl('https://youtu.be/dQw4w9WgXcQ');
      expect(result.isValid).toBe(true);
      expect(result.videoId).toBe('dQw4w9WgXcQ');
    });

    it('should validate embed URL', () => {
      const result = validateYouTubeUrl('https://www.youtube.com/embed/dQw4w9WgXcQ');
      expect(result.isValid).toBe(true);
      expect(result.videoId).toBe('dQw4w9WgXcQ');
    });

    it('should validate URL with additional parameters', () => {
      const result = validateYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s');
      expect(result.isValid).toBe(true);
      expect(result.videoId).toBe('dQw4w9WgXcQ');
    });

    it('should handle URL with whitespace', () => {
      const result = validateYouTubeUrl('  https://www.youtube.com/watch?v=dQw4w9WgXcQ  ');
      expect(result.isValid).toBe(true);
      expect(result.videoId).toBe('dQw4w9WgXcQ');
    });

    it('should validate http URL', () => {
      const result = validateYouTubeUrl('http://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(result.isValid).toBe(true);
      expect(result.videoId).toBe('dQw4w9WgXcQ');
    });
  });

  describe('invalid YouTube URLs', () => {
    it('should reject empty URL', () => {
      const result = validateYouTubeUrl('');
      expect(result.isValid).toBe(false);
      expect(result.error).toEqual({ type: 'empty_url' });
    });

    it('should reject whitespace-only URL', () => {
      const result = validateYouTubeUrl('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toEqual({ type: 'empty_url' });
    });

    it('should reject non-YouTube URL', () => {
      const result = validateYouTubeUrl('https://vimeo.com/123456789');
      expect(result.isValid).toBe(false);
      expect(result.error).toEqual({
        type: 'invalid_format',
        url: 'https://vimeo.com/123456789',
      });
    });

    it('should reject URL with invalid video ID', () => {
      const result = validateYouTubeUrl('https://www.youtube.com/watch?v=invalid');
      expect(result.isValid).toBe(false);
      // The regex matches the URL format, so it returns invalid_format for non-11-char IDs
      expect(result.error).toEqual({
        type: 'invalid_format',
        url: 'https://www.youtube.com/watch?v=invalid',
      });
    });

    it('should reject URL without video ID', () => {
      const result = validateYouTubeUrl('https://www.youtube.com/watch');
      expect(result.isValid).toBe(false);
      expect(result.error).toEqual({
        type: 'invalid_format',
        url: 'https://www.youtube.com/watch',
      });
    });
  });
});

describe('extractYouTubeVideoId', () => {
  it('should extract video ID from valid URL', () => {
    const videoId = extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(videoId).toBe('dQw4w9WgXcQ');
  });

  it('should return null for invalid URL', () => {
    const videoId = extractYouTubeVideoId('https://vimeo.com/123456789');
    expect(videoId).toBeNull();
  });

  it('should return null for empty URL', () => {
    const videoId = extractYouTubeVideoId('');
    expect(videoId).toBeNull();
  });
});

describe('buildYouTubeEmbedUrl', () => {
  it('should build embed URL from video ID', () => {
    const url = buildYouTubeEmbedUrl('dQw4w9WgXcQ');
    expect(url).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
  });
});

describe('buildYouTubeWatchUrl', () => {
  it('should build watch URL from video ID', () => {
    const url = buildYouTubeWatchUrl('dQw4w9WgXcQ');
    expect(url).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  });
});

describe('validateAudioFile', () => {
  describe('valid audio files', () => {
    const createMockFile = (name: string, size: number, mimeType: string): File => {
      return {
        name,
        size,
        type: mimeType,
      } as unknown as File;
    };

    it('should validate MP3 file', () => {
      const file = createMockFile('test.mp3', 1024 * 1024, 'audio/mpeg');
      const result = validateAudioFile(file);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate WAV file', () => {
      const file = createMockFile('test.wav', 1024 * 1024, 'audio/wav');
      const result = validateAudioFile(file);
      expect(result.isValid).toBe(true);
    });

    it('should validate M4A file', () => {
      const file = createMockFile('test.m4a', 1024 * 1024, 'audio/m4a');
      const result = validateAudioFile(file);
      expect(result.isValid).toBe(true);
    });

    it('should validate OGG file', () => {
      const file = createMockFile('test.ogg', 1024 * 1024, 'audio/ogg');
      const result = validateAudioFile(file);
      expect(result.isValid).toBe(true);
    });

    it('should validate FLAC file', () => {
      const file = createMockFile('test.flac', 1024 * 1024, 'audio/flac');
      const result = validateAudioFile(file);
      expect(result.isValid).toBe(true);
    });

    it('should validate file at maximum size (50MB)', () => {
      const file = createMockFile('test.mp3', FILE_SIZE_LIMITS.MAX_FILE_SIZE, 'audio/mpeg');
      const result = validateAudioFile(file);
      expect(result.isValid).toBe(true);
    });
  });

  describe('invalid audio files', () => {
    const createMockFile = (name: string, size: number, mimeType: string): File => {
      return {
        name,
        size,
        type: mimeType,
      } as unknown as File;
    };

    it('should reject null file', () => {
      const result = validateAudioFile(null as unknown as File);
      expect(result.isValid).toBe(false);
      expect(result.error).toEqual({ type: 'no_file_selected' });
    });

    it('should reject undefined file', () => {
      const result = validateAudioFile(undefined as unknown as File);
      expect(result.isValid).toBe(false);
      expect(result.error).toEqual({ type: 'no_file_selected' });
    });

    it('should reject file exceeding maximum size', () => {
      const file = createMockFile('test.mp3', FILE_SIZE_LIMITS.MAX_FILE_SIZE + 1, 'audio/mpeg');
      const result = validateAudioFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toEqual({
        type: 'file_too_large',
        fileName: 'test.mp3',
        fileSize: FILE_SIZE_LIMITS.MAX_FILE_SIZE + 1,
        maxSize: FILE_SIZE_LIMITS.MAX_FILE_SIZE,
      });
    });

    it('should reject unsupported file format', () => {
      const file = createMockFile('test.mp4', 1024 * 1024, 'video/mp4');
      const result = validateAudioFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toEqual({
        type: 'unsupported_format',
        fileName: 'test.mp4',
        format: 'mp4',
      });
    });

    it('should reject file without extension', () => {
      const file = createMockFile('test', 1024 * 1024, 'audio/mpeg');
      const result = validateAudioFile(file);
      expect(result.isValid).toBe(false);
      // When there's no extension, it returns the filename as the format
      expect(result.error).toEqual({
        type: 'unsupported_format',
        fileName: 'test',
        format: 'test',
      });
    });

    it('should reject file with invalid MIME type', () => {
      const file = createMockFile('test.mp3', 1024 * 1024, 'application/json');
      const result = validateAudioFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toEqual({
        type: 'invalid_mime_type',
        fileName: 'test.mp3',
        mimeType: 'application/json',
      });
    });

    it('should reject file with empty MIME type', () => {
      const file = createMockFile('test.mp3', 1024 * 1024, '');
      const result = validateAudioFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toEqual({
        type: 'invalid_mime_type',
        fileName: 'test.mp3',
        mimeType: '',
      });
    });
  });
});

describe('validateFileQuota', () => {
  it('should validate file within quota', () => {
    const fileSize = 10 * 1024 * 1024; // 10MB
    const currentUsage = 100 * 1024 * 1024; // 100MB
    const result = validateFileQuota(fileSize, currentUsage);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should validate file exactly at quota limit', () => {
    const fileSize = 400 * 1024 * 1024; // 400MB
    const currentUsage = 100 * 1024 * 1024; // 100MB
    const result = validateFileQuota(fileSize, currentUsage);
    expect(result.isValid).toBe(true);
  });

  it('should reject file exceeding quota', () => {
    const fileSize = 450 * 1024 * 1024; // 450MB
    const currentUsage = 100 * 1024 * 1024; // 100MB
    const result = validateFileQuota(fileSize, currentUsage);
    expect(result.isValid).toBe(false);
    expect(result.error).toEqual({
      type: 'quota_exceeded',
      fileSize,
      currentUsage,
      quota: FILE_SIZE_LIMITS.TOTAL_QUOTA,
    });
  });

  it('should handle zero usage', () => {
    const fileSize = 100 * 1024 * 1024; // 100MB
    const currentUsage = 0;
    const result = validateFileQuota(fileSize, currentUsage);
    expect(result.isValid).toBe(true);
  });
});

describe('getExtensionFromMimeType', () => {
  it('should return mp3 for audio/mpeg', () => {
    const ext = getExtensionFromMimeType('audio/mpeg');
    expect(ext).toBe('mp3');
  });

  it('should return mp3 for audio/mp3', () => {
    const ext = getExtensionFromMimeType('audio/mp3');
    expect(ext).toBe('mp3');
  });

  it('should return wav for audio/wav', () => {
    const ext = getExtensionFromMimeType('audio/wav');
    expect(ext).toBe('wav');
  });

  it('should return m4a for audio/m4a', () => {
    const ext = getExtensionFromMimeType('audio/m4a');
    expect(ext).toBe('m4a');
  });

  it('should return ogg for audio/ogg', () => {
    const ext = getExtensionFromMimeType('audio/ogg');
    expect(ext).toBe('ogg');
  });

  it('should return aac for audio/aac', () => {
    const ext = getExtensionFromMimeType('audio/aac');
    expect(ext).toBe('aac');
  });

  it('should return flac for audio/flac', () => {
    const ext = getExtensionFromMimeType('audio/flac');
    expect(ext).toBe('flac');
  });

  it('should return null for unknown MIME type', () => {
    const ext = getExtensionFromMimeType('video/mp4');
    expect(ext).toBeNull();
  });

  it('should return null for empty string', () => {
    const ext = getExtensionFromMimeType('');
    expect(ext).toBeNull();
  });
});

describe('isAudioFile', () => {
  const createMockFile = (mimeType: string): File => {
    return {
      name: 'test',
      size: 1024,
      type: mimeType,
    } as unknown as File;
  };

  it('should return true for audio file', () => {
    const file = createMockFile('audio/mpeg');
    expect(isAudioFile(file)).toBe(true);
  });

  it('should return false for video file', () => {
    const file = createMockFile('video/mp4');
    expect(isAudioFile(file)).toBe(false);
  });

  it('should return false for image file', () => {
    const file = createMockFile('image/jpeg');
    expect(isAudioFile(file)).toBe(false);
  });

  it('should return false for application file', () => {
    const file = createMockFile('application/json');
    expect(isAudioFile(file)).toBe(false);
  });
});

describe('getYouTubeErrorMessage', () => {
  it('should return message for empty_url error', () => {
    const error = { type: 'empty_url' as const };
    const message = getYouTubeErrorMessage(error);
    expect(message.title).toBe('No URL provided');
    expect(message.description).toContain('YouTube URL');
    expect(message.suggestion).toBeDefined();
  });

  it('should return message for invalid_format error', () => {
    const error = { type: 'invalid_format' as const, url: 'https://example.com' };
    const message = getYouTubeErrorMessage(error);
    expect(message.title).toBe('Invalid YouTube URL');
    expect(message.description).toContain('https://example.com');
    expect(message.suggestion).toContain('youtube.com');
  });

  it('should return message for invalid_video_id error', () => {
    const error = { type: 'invalid_video_id' as const, url: 'https://youtube.com/watch?v=abc', videoId: 'abc' };
    const message = getYouTubeErrorMessage(error);
    expect(message.title).toBe('Invalid YouTube video');
    expect(message.description).toContain('abc');
    expect(message.suggestion).toContain('copied');
  });
});

describe('getAudioFileErrorMessage', () => {
  it('should return message for no_file_selected error', () => {
    const error = { type: 'no_file_selected' as const };
    const message = getAudioFileErrorMessage(error);
    expect(message.title).toBe('No file selected');
    expect(message.description).toContain('select an audio file');
    expect(message.suggestion).toContain('browse button');
  });

  it('should return message for file_too_large error', () => {
    const error = {
      type: 'file_too_large' as const,
      fileName: 'test.mp3',
      fileSize: 100 * 1024 * 1024,
      maxSize: 50 * 1024 * 1024,
    };
    const message = getAudioFileErrorMessage(error);
    expect(message.title).toBe('File too large');
    expect(message.description).toContain('100');
    expect(message.description).toContain('50');
    expect(message.suggestion).toContain('compressing');
  });

  it('should return message for unsupported_format error', () => {
    const error = { type: 'unsupported_format' as const, fileName: 'test.mp4', format: 'mp4' };
    const message = getAudioFileErrorMessage(error);
    expect(message.title).toBe('Unsupported file format');
    expect(message.description).toContain('mp4');
    expect(message.suggestion).toContain(SUPPORTED_AUDIO_FORMATS.join(', '));
  });

  it('should return message for invalid_mime_type error', () => {
    const error = { type: 'invalid_mime_type' as const, fileName: 'test.mp3', mimeType: 'application/json' };
    const message = getAudioFileErrorMessage(error);
    expect(message.title).toBe('Invalid file type');
    expect(message.description).toContain('application/json');
    expect(message.suggestion).toContain('audio file');
  });

  it('should return message for quota_exceeded error', () => {
    const error = {
      type: 'quota_exceeded' as const,
      fileSize: 100 * 1024 * 1024,
      currentUsage: 450 * 1024 * 1024,
      quota: 500 * 1024 * 1024,
    };
    const message = getAudioFileErrorMessage(error);
    expect(message.title).toBe('Storage quota exceeded');
    expect(message.description).toContain('100');
    expect(message.description).toContain('450');
    expect(message.description).toContain('500');
    expect(message.suggestion).toContain('Delete');
  });
});

describe('formatBytes', () => {
  it('should format 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
  });

  it('should format bytes', () => {
    expect(formatBytes(512)).toBe('512 Bytes');
  });

  it('should format kilobytes', () => {
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
  });

  it('should format megabytes', () => {
    expect(formatBytes(1024 * 1024)).toBe('1 MB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5 MB');
    expect(formatBytes(50 * 1024 * 1024)).toBe('50 MB');
  });

  it('should format gigabytes', () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
    expect(formatBytes(2.5 * 1024 * 1024 * 1024)).toBe('2.5 GB');
  });

  it('should handle large numbers', () => {
    expect(formatBytes(500 * 1024 * 1024)).toBe('500 MB');
  });
});
