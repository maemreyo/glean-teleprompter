/**
 * API response types and error structures for camera recording feature
 * @module types/api
 */

import type { Recording, RecordingCreate, RecordingUpdate, StorageQuota } from './recording';

/**
 * Standard API error response
 */
export interface ApiError {
  error: string;
  code: ErrorCode;
  details?: Record<string, unknown>;
}

/**
 * API error codes
 */
export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'QUOTA_EXCEEDED'
  | 'FILE_TOO_LARGE'
  | 'PERMISSION_DENIED'
  | 'RECORDING_FAILED'
  | 'UPLOAD_FAILED'
  | 'CONVERSION_FAILED'
  | 'INTERNAL_ERROR';

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  status: number;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Recording list query parameters
 */
export interface RecordingListParams extends PaginationParams {
  user_id?: string;
}

/**
 * Upload response
 */
export interface UploadResponse {
  url: string;
  converted_url?: string;
  size_mb: number;
}

/**
 * Upload parameters
 */
export interface UploadParams {
  video: Blob;
  convert_format?: boolean;
}

/**
 * Conversion trigger response
 */
export interface ConversionResponse {
  job_id: string;
  status: 'pending' | 'completed';
  converted_url?: string;
}

/**
 * Recording API endpoints
 */
export interface RecordingApiEndpoints {
  /**
   * GET /api/recordings
   * List user recordings with pagination
   */
  list: (params?: RecordingListParams) => Promise<ApiResponse<Recording[]>>;

  /**
   * POST /api/recordings
   * Create a new recording entry
   */
  create: (data: RecordingCreate) => Promise<ApiResponse<Recording>>;

  /**
   * GET /api/recordings/{id}
   * Get detailed information about a specific recording
   */
  get: (id: string) => Promise<ApiResponse<Recording>>;

  /**
   * PATCH /api/recordings/{id}
   * Update recording metadata
   */
  update: (id: string, data: RecordingUpdate) => Promise<ApiResponse<Recording>>;

  /**
   * DELETE /api/recordings/{id}
   * Delete a recording and its associated files
   */
  delete: (id: string) => Promise<ApiResponse<void>>;
}

/**
 * Storage API endpoints
 */
export interface StorageApiEndpoints {
  /**
   * GET /api/recordings/quota
   * Get user's current storage usage and limits
   */
  getQuota: () => Promise<ApiResponse<StorageQuota>>;

  /**
   * POST /api/recordings/upload
   * Upload a video file to storage with optional format conversion
   */
  upload: (params: UploadParams) => Promise<ApiResponse<UploadResponse>>;

  /**
   * POST /api/recordings/{id}/convert
   * Trigger asynchronous format conversion for a recording
   */
  convert: (id: string) => Promise<ApiResponse<ConversionResponse>>;
}

/**
 * HTTP status codes
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  PAYLOAD_TOO_LARGE = 413,
  INSUFFICIENT_STORAGE = 507,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * Error mapping for status codes
 */
export const STATUS_CODE_TO_ERROR: Record<number, ErrorCode> = {
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.BAD_REQUEST]: 'VALIDATION_ERROR',
  [HttpStatus.PAYLOAD_TOO_LARGE]: 'FILE_TOO_LARGE',
  [HttpStatus.INSUFFICIENT_STORAGE]: 'QUOTA_EXCEEDED',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_ERROR',
};

/**
 * Create an API error response
 */
export function createApiError(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>
): ApiError {
  return {
    error: message,
    code,
    details,
  };
}

/**
 * Create a successful API response
 */
export function createApiResponse<T>(data: T, status: number = HttpStatus.OK): ApiResponse<T> {
  return {
    data,
    status,
  };
}

/**
 * Create an error API response
 */
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  status: number = HttpStatus.BAD_REQUEST,
  details?: Record<string, unknown>
): ApiResponse<never> {
  return {
    error: createApiError(code, message, details),
    status,
  };
}

/**
 * Check if an API response is successful
 */
export function isApiResponseSuccess<T>(response: ApiResponse<T>): response is ApiResponse<T> & { data: T } {
  return response.status >= 200 && response.status < 300 && !!response.data;
}

/**
 * Check if an API response is an error
 */
export function isApiErrorResponse<T>(response: ApiResponse<T>): response is ApiResponse<never> & { error: ApiError } {
  return !!response.error;
}
