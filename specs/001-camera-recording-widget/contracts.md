# API Contracts: Camera Recording Feature

**Feature**: Floating Camera Widget & Recording
**Specification**: specs/1-camera-recording-widget/spec.md

## Overview

This document defines the API contracts for the camera recording functionality. All endpoints require authentication via Supabase Auth JWT tokens.

## Core API Endpoints

### 1. Recording Management

#### GET /api/recordings
**Purpose**: List user recordings with pagination

**Authentication**: Required (Bearer token)

**Query Parameters**:
- `page` (integer, default: 1): Page number for pagination
- `limit` (integer, default: 20, max: 50): Items per page
- `sort` (string, default: "created_at"): Sort field (created_at, duration, size_mb)
- `order` (string, default: "desc"): Sort order (asc, desc)

**Response** (200):
```json
{
  "recordings": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "video_url": "string",
      "script_snapshot": "string",
      "duration": 300,
      "size_mb": 45.2,
      "file_format": "webm",
      "converted_url": "string",
      "recording_quality": "standard",
      "created_at": "2025-12-30T14:00:00Z",
      "updated_at": "2025-12-30T14:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

**Error Responses**:
- 401: Unauthorized - Invalid or missing authentication

---

#### POST /api/recordings
**Purpose**: Create a new recording entry

**Authentication**: Required

**Request Body**:
```json
{
  "video_url": "string (required)",
  "script_snapshot": "string (optional)",
  "duration": "integer (required, 1-300)",
  "size_mb": "number (required)",
  "file_format": "string (optional, default: 'webm')",
  "recording_quality": "string (optional, default: 'standard')"
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "video_url": "string",
  "script_snapshot": "string",
  "duration": 300,
  "size_mb": 45.2,
  "file_format": "webm",
  "recording_quality": "standard",
  "created_at": "2025-12-30T14:00:00Z",
  "updated_at": "2025-12-30T14:00:00Z"
}
```

**Error Responses**:
- 400: Invalid request data
- 413: File too large (exceeds individual file limits)

---

#### GET /api/recordings/{id}
**Purpose**: Get detailed information about a specific recording

**Authentication**: Required

**Path Parameters**:
- `id`: Recording UUID

**Response** (200): Recording object (same as list endpoint)

**Error Responses**:
- 404: Recording not found or access denied

---

#### PATCH /api/recordings/{id}
**Purpose**: Update recording metadata

**Authentication**: Required

**Path Parameters**:
- `id`: Recording UUID

**Request Body**:
```json
{
  "script_snapshot": "string (optional)"
}
```

**Response** (200): Updated recording object

**Error Responses**:
- 404: Recording not found

---

#### DELETE /api/recordings/{id}
**Purpose**: Delete a recording and its associated files

**Authentication**: Required

**Path Parameters**:
- `id`: Recording UUID

**Response** (204): No content

**Error Responses**:
- 404: Recording not found

---

### 2. Storage & Quota Management

#### GET /api/recordings/quota
**Purpose**: Get user's current storage usage and limits

**Authentication**: Required

**Response** (200):
```json
{
  "used_mb": 45.2,
  "limit_mb": 100,
  "usage_percentage": 45.2,
  "can_record": true
}
```

**Error Responses**:
- 401: Unauthorized

---

#### POST /api/recordings/upload
**Purpose**: Upload a video file to storage with optional format conversion

**Authentication**: Required

**Content-Type**: multipart/form-data

**Form Fields**:
- `video`: File (required) - Video file to upload
- `convert_format`: boolean (optional, default: true) - Whether to convert format for compatibility

**Response** (201):
```json
{
  "url": "https://storage.supabase.co/user_recordings/user123/2025-12-30T14:00:00Z_original.webm",
  "converted_url": "https://storage.supabase.co/user_recordings/user123/2025-12-30T14:00:00Z_converted.mp4",
  "size_mb": 45.2
}
```

**Error Responses**:
- 400: Invalid file format or corrupted file
- 413: File too large for quota
- 507: Insufficient storage (quota exceeded)

---

#### POST /api/recordings/{id}/convert
**Purpose**: Trigger asynchronous format conversion for a recording

**Authentication**: Required

**Path Parameters**:
- `id`: Recording UUID

**Response** (202):
```json
{
  "job_id": "conv_123456",
  "status": "pending"
}
```

**Response** (200 - if already converted):
```json
{
  "converted_url": "https://storage.supabase.co/...",
  "status": "completed"
}
```

**Error Responses**:
- 404: Recording not found

---

## Data Types

### Recording Object
```typescript
interface Recording {
  id: string; // UUID
  user_id: string; // UUID
  video_url: string; // Storage URL
  script_snapshot?: string; // Teleprompter text
  duration: number; // Seconds (1-300)
  size_mb: number; // File size
  file_format: 'webm' | 'mp4';
  converted_url?: string; // Converted file URL
  recording_quality: 'standard' | 'reduced';
  created_at: string; // ISO date
  updated_at: string; // ISO date
}
```

### Storage Quota Object
```typescript
interface StorageQuota {
  used_mb: number; // Current usage
  limit_mb: number; // Quota limit
  usage_percentage: number; // 0-100
  can_record: boolean; // Whether new recordings allowed
}
```

## Authentication & Authorization

All endpoints require:
- **Authentication**: Supabase JWT token in Authorization header
- **Authorization**: Users can only access their own recordings
- **Rate Limiting**: 100 requests per minute per user

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": { /* optional additional context */ }
}
```

**Common Error Codes**:
- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Access denied to resource
- `NOT_FOUND`: Recording does not exist
- `VALIDATION_ERROR`: Invalid request data
- `QUOTA_EXCEEDED`: Storage limit reached
- `FILE_TOO_LARGE`: Individual file size limit exceeded

## Performance Requirements

- **Response Time**: All endpoints <500ms P95
- **Concurrent Users**: Support 1000+ simultaneous users
- **File Upload**: Support files up to 50MB
- **Storage**: Auto-scaling with Supabase Storage limits

## Monitoring & Observability

**Metrics to Track**:
- API response times and error rates
- Storage usage and quota violations
- File upload success/failure rates
- Conversion job queue status

**Logging**:
- All API requests with user context
- File operations and errors
- Quota enforcement events