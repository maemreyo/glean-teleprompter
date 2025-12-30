/**
 * Recording entity types for camera recording feature
 * @module types/recording
 */

/**
 * Recording entity stored in database
 */
export interface Recording {
  id: string;
  user_id: string;
  video_url: string;
  script_snapshot?: string | null;
  duration: number;
  size_mb: number;
  file_format: RecordingFileFormat;
  converted_url?: string | null;
  recording_quality?: RecordingQuality | null;
  created_at: string;
  updated_at: string;
}

/**
 * Supported video file formats
 */
export type RecordingFileFormat = 'webm' | 'mp4';

/**
 * Recording quality settings
 */
export type RecordingQuality = 'standard' | 'reduced';

/**
 * Input for creating a new recording
 */
export interface RecordingCreate {
  video_url: string;
  script_snapshot?: string;
  duration: number;
  size_mb: number;
  file_format?: RecordingFileFormat;
  recording_quality?: RecordingQuality;
}

/**
 * Input for updating recording metadata
 */
export interface RecordingUpdate {
  script_snapshot?: string;
  converted_url?: string;
}

/**
 * User recording settings
 */
export interface UserRecordingSettings {
  user_id: string;
  storage_used_mb: number;
  storage_limit_mb: number;
  default_quality: RecordingQuality;
  auto_convert: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Storage quota information
 */
export interface StorageQuota {
  used_mb: number;
  limit_mb: number;
  usage_percentage: number;
  can_record: boolean;
}

/**
 * Recording list response with pagination
 */
export interface RecordingListResponse {
  recordings: Recording[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Upload response with file URLs
 */
export interface RecordingUploadResponse {
  url: string;
  converted_url?: string;
  size_mb: number;
}

/**
 * Conversion job status
 */
export interface ConversionJob {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  converted_url?: string;
  error?: string;
}

/**
 * Recording quality presets
 */
export interface RecordingQualityPreset {
  name: string;
  videoConstraints: MediaTrackConstraints;
  audioConstraints: MediaTrackConstraints;
  estimatedSizePerMinute: number; // in MB
}

/**
 * Supported recording quality presets
 */
export const RECORDING_QUALITY_PRESETS: Record<RecordingQuality, RecordingQualityPreset> = {
  standard: {
    name: 'Standard (720p)',
    videoConstraints: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 30 },
    },
    audioConstraints: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 48000,
    },
    estimatedSizePerMinute: 15,
  },
  reduced: {
    name: 'Reduced (480p)',
    videoConstraints: {
      width: { ideal: 640 },
      height: { ideal: 480 },
      frameRate: { ideal: 24 },
    },
    audioConstraints: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 44100,
    },
    estimatedSizePerMinute: 8,
  },
};

/**
 * Maximum recording constraints
 */
export const RECORDING_LIMITS = {
  MAX_DURATION_SECONDS: 300, // 5 minutes
  MAX_SIZE_MB: 50, // 50MB per recording
  DEFAULT_STORAGE_LIMIT_MB: 100, // 100MB per user
} as const;
