# API Route Specifications

This document defines all API routes needed for the redesigned teleprompter application, including new endpoints and modifications to existing routes.

## Table of Contents

1. [Authentication](#1-authentication)
2. [Scripts API](#2-scripts-api)
3. [Recordings API](#3-recordings-api)
4. [Presets API](#4-presets-api)
5. [User API](#5-user-api)
6. [Share API](#6-share-api)
7. [Storage API](#7-storage-api)

---

## 1. Authentication

Existing authentication routes remain unchanged. These are provided by Supabase Auth.

### Existing Routes

```
POST   /auth/login          # Supabase Auth (login page uses this)
POST   /auth/sign-up        # Supabase Auth
POST   /auth/logout         # Supabase Auth
POST   /auth/forgot-password
POST   /auth/update-password
GET    /auth/callback       # OAuth callback
GET    /auth/confirm        # Email confirmation
```

---

## 2. Scripts API

### 2.1 List Scripts

**Endpoint:** `GET /api/scripts`

**Description:** Retrieve a paginated list of user's scripts.

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (1-indexed) |
| `limit` | number | 20 | Items per page (max 100) |
| `search` | string | - | Filter by title/content |
| `sort` | string | `updated_at` | Sort field: `created_at`, `updated_at`, `title` |
| `order` | string | `desc` | Sort order: `asc`, `desc` |

**Request:**
```http
GET /api/scripts?page=1&limit=20&sort=updated_at&order=desc
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "scripts": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "title": "Product Launch Script",
      "content": "In just 2 minutes...",
      "preview": "In just 2 minutes...",
      "bg_url": "https://...",
      "music_url": "https://...",
      "settings": {
        "font": "Modern",
        "colorIndex": 2,
        "speed": 2,
        "fontSize": 48,
        "lineHeight": 1.5,
        "margin": 0,
        "overlayOpacity": 0.5,
        "align": "center"
      },
      "is_public": false,
      "share_id": null,
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T12:45:00Z"
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Server error

---

### 2.2 Get Single Script

**Endpoint:** `GET /api/scripts/[id]`

**Description:** Retrieve a specific script by ID.

**Authentication:** Required (owner) or Public (if `is_public: true`)

**Path Parameters:**
- `id` - Script UUID

**Request:**
```http
GET /api/scripts/abc-123-def
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "title": "Product Launch Script",
  "content": "Full script content here...",
  "bg_url": "https://...",
  "music_url": "https://...",
  "settings": { /* ... */ },
  "is_public": false,
  "share_id": "xyz-789-uvw",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T12:45:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Not owner and not public
- `404 Not Found` - Script doesn't exist

---

### 2.3 Create Script

**Endpoint:** `POST /api/scripts`

**Description:** Create a new script.

**Authentication:** Required

**Request Body:**
```json
{
  "title": "Product Launch Script",
  "content": "In just 2 minutes...",
  "bg_url": "https://images.unsplash.com/...",
  "music_url": "https://...",
  "settings": {
    "font": "Modern",
    "colorIndex": 2,
    "speed": 2,
    "fontSize": 48,
    "lineHeight": 1.5,
    "margin": 0,
    "overlayOpacity": 0.5,
    "align": "center"
  },
  "is_public": false
}
```

**Response:** `201 Created`
```json
{
  "id": "new-uuid",
  "user_id": "uuid",
  "title": "Product Launch Script",
  "content": "In just 2 minutes...",
  "bg_url": "https://...",
  "music_url": "https://...",
  "settings": { /* ... */ },
  "is_public": false,
  "share_id": null,
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid request body
- `401 Unauthorized` - Authentication required

---

### 2.4 Update Script

**Endpoint:** `PATCH /api/scripts/[id]`

**Description:** Update an existing script. Supports partial updates.

**Authentication:** Required (owner only)

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "bg_url": "https://...",
  "music_url": "https://...",
  "settings": {
    "font": "Classic"
  }
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "title": "Updated Title",
  "content": "Updated content...",
  "bg_url": "https://...",
  "music_url": "https://...",
  "settings": { /* ... */ },
  "is_public": false,
  "share_id": null,
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T12:50:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid request body
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Not owner
- `404 Not Found` - Script doesn't exist

---

### 2.5 Delete Script

**Endpoint:** `DELETE /api/scripts/[id]`

**Description:** Delete a script permanently.

**Authentication:** Required (owner only)

**Request:**
```http
DELETE /api/scripts/abc-123-def
Authorization: Bearer <token>
```

**Response:** `204 No Content`

**Error Responses:**
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Not owner
- `404 Not Found` - Script doesn't exist

---

### 2.6 Duplicate Script

**Endpoint:** `POST /api/scripts/[id]/duplicate`

**Description:** Create a copy of an existing script.

**Authentication:** Required (owner only)

**Request:**
```http
POST /api/scripts/abc-123-def/duplicate
Authorization: Bearer <token>
```

**Response:** `201 Created`
```json
{
  "id": "new-uuid",
  "user_id": "uuid",
  "title": "Product Launch Script (Copy)",
  "content": "In just 2 minutes...",
  "bg_url": "https://...",
  "music_url": "https://...",
  "settings": { /* ... */ },
  "is_public": false,
  "share_id": null,
  "created_at": "2025-01-15T12:55:00Z",
  "updated_at": "2025-01-15T12:55:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Not owner
- `404 Not Found` - Script doesn't exist

---

### 2.7 Generate Share Link

**Endpoint:** `POST /api/scripts/[id]/share`

**Description:** Generate or update a public share link for a script.

**Authentication:** Required (owner only)

**Request Body:** (optional)
```json
{
  "expires_at": "2025-02-15T00:00:00Z"
}
```

**Response:** `200 OK`
```json
{
  "share_id": "xyz-789-uvw",
  "share_url": "https://app.example.com/studio/share/xyz-789-uvw",
  "expires_at": "2025-02-15T00:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Not owner
- `404 Not Found` - Script doesn't exist

---

### 2.8 Revoke Share Link

**Endpoint:** `DELETE /api/scripts/[id]/share`

**Description:** Remove public share link for a script.

**Authentication:** Required (owner only)

**Request:**
```http
DELETE /api/scripts/abc-123-def/share
Authorization: Bearer <token>
```

**Response:** `204 No Content`

**Error Responses:**
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Not owner
- `404 Not Found` - Script doesn't exist

---

## 3. Recordings API

### Existing Routes (Keep)

The following recording routes already exist and should be maintained:

```
GET    /api/recordings              # List recordings (enhance with filters)
POST   /api/recordings              # Create recording (from camera widget)
GET    /api/recordings/[id]         # Get single recording
DELETE /api/recordings/[id]         # Delete recording
POST   /api/recordings/upload       # Upload recording
POST   /api/recordings/convert      # Convert recording format
GET    /api/recordings/quota        # Get storage quota
```

### 3.1 Enhanced List Recordings

**Endpoint:** `GET /api/recordings`

**Description:** Retrieve paginated list of user's recordings with enhanced filtering.

**New Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `quality` | string | `all` | Filter: `standard`, `high`, `all` |
| `min_duration` | number | - | Minimum duration in seconds |
| `max_duration` | number | - | Maximum duration in seconds |
| `date_from` | string | - | ISO date string (start) |
| `date_to` | string | - | ISO date string (end) |
| `sort` | string | `created_at` | Sort field: `created_at`, `duration`, `size_mb` |
| `order` | string | `desc` | Sort order: `asc`, `desc` |

**Request:**
```http
GET /api/recordings?page=1&limit=20&quality=high&sort=created_at&order=desc
```

**Response:** `200 OK`
```json
{
  "recordings": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "video_url": "https://storage...",
      "thumbnail_url": "https://storage...",
      "duration": 180,
      "size_mb": 45.2,
      "recording_quality": "high",
      "file_format": "webm",
      "script_snapshot": "Product launch script...",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### 3.2 Bulk Delete Recordings (NEW)

**Endpoint:** `POST /api/recordings/bulk-delete`

**Description:** Delete multiple recordings at once.

**Authentication:** Required

**Request Body:**
```json
{
  "recording_ids": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**Response:** `200 OK`
```json
{
  "deleted_count": 3,
  "errors": []
}
```

---

## 4. Presets API

### 4.1 List Presets

**Endpoint:** `GET /api/presets`

**Description:** Retrieve user's custom presets and built-in presets.

**Authentication:** Required for custom presets, built-ins are public

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | `all` | Filter: `custom`, `builtin`, `all` |

**Request:**
```http
GET /api/presets?type=all
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "presets": [
    {
      "id": "builtin-professional",
      "name": "Professional",
      "description": "Clean and professional look",
      "config": {
        "font": "Modern",
        "colorIndex": 2,
        "fontSize": 48,
        "lineHeight": 1.5,
        "margin": 5,
        "overlayOpacity": 0.4,
        "align": "center"
      },
      "thumbnail_url": "https://...",
      "is_builtin": true,
      "created_at": null
    },
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "My News Look",
      "description": "For daily news recording",
      "config": { /* ... */ },
      "thumbnail_url": null,
      "is_builtin": false,
      "share_id": null,
      "created_at": "2025-01-10T08:00:00Z",
      "updated_at": "2025-01-10T08:00:00Z"
    }
  ]
}
```

---

### 4.2 Create Preset

**Endpoint:** `POST /api/presets`

**Description:** Create a new custom preset.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "My News Look",
  "description": "For daily news recording",
  "config": {
    "font": "Classic",
    "colorIndex": 0,
    "fontSize": 52,
    "lineHeight": 1.6,
    "margin": 10,
    "overlayOpacity": 0.5,
    "align": "center"
  }
}
```

**Response:** `201 Created`
```json
{
  "id": "new-uuid",
  "user_id": "uuid",
  "name": "My News Look",
  "description": "For daily news recording",
  "config": { /* ... */ },
  "thumbnail_url": null,
  "is_builtin": false,
  "share_id": null,
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

---

### 4.3 Update Preset

**Endpoint:** `PATCH /api/presets/[id]`

**Description:** Update a custom preset.

**Authentication:** Required (owner only)

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "config": {
    "fontSize": 56
  }
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Updated Name",
  "description": "Updated description",
  "config": { /* ... */ },
  "thumbnail_url": null,
  "is_builtin": false,
  "share_id": null,
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T12:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Attempting to update built-in preset
- `403 Forbidden` - Not owner

---

### 4.4 Delete Preset

**Endpoint:** `DELETE /api/presets/[id]`

**Description:** Delete a custom preset.

**Authentication:** Required (owner only)

**Request:**
```http
DELETE /api/presets/uuid
Authorization: Bearer <token>
```

**Response:** `204 No Content`

**Error Responses:**
- `400 Bad Request` - Attempting to delete built-in preset
- `403 Forbidden` - Not owner

---

### 4.5 Generate Preset Thumbnail

**Endpoint:** `POST /api/presets/[id]/thumbnail`

**Description:** Generate a thumbnail image for a preset.

**Authentication:** Required (owner only)

**Request Body:**
```json
{
  "image_data": "data:image/png;base64,iVBORw0KGg..."
}
```

**Response:** `200 OK`
```json
{
  "thumbnail_url": "https://storage.example.com/presets/uuid/thumb.png"
}
```

---

## 5. User API

### 5.1 Get User Profile

**Endpoint:** `GET /api/user`

**Description:** Get current user's profile information.

**Authentication:** Required

**Request:**
```http
GET /api/user
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "john@example.com",
  "display_name": "John Doe",
  "avatar_url": "https://...",
  "is_pro": false,
  "created_at": "2025-01-01T00:00:00Z"
}
```

---

### 5.2 Update User Profile

**Endpoint:** `PATCH /api/user`

**Description:** Update user's profile information.

**Authentication:** Required

**Request Body:**
```json
{
  "display_name": "John Smith",
  "avatar_url": "https://...",
  "preferences": {
    "defaultFont": "Modern",
    "defaultFontSize": 48,
    "defaultTheme": "dark",
    "autoSave": true,
    "autoSaveInterval": 30,
    "defaultSpeed": 2,
    "mirrorModeDefault": false
  }
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "john@example.com",
  "display_name": "John Smith",
  "avatar_url": "https://...",
  "is_pro": false,
  "preferences": { /* ... */ },
  "updated_at": "2025-01-15T12:00:00Z"
}
```

---

### 5.3 Get User Stats

**Endpoint:** `GET /api/user/stats`

**Description:** Get user's statistics (scripts, recordings, storage).

**Authentication:** Required

**Request:**
```http
GET /api/user/stats
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "scripts": {
    "total": 42,
    "created_this_month": 5
  },
  "recordings": {
    "total": 15,
    "total_duration": 3600,
    "created_this_month": 2
  },
  "presets": {
    "total": 8,
    "builtin": 5,
    "custom": 3
  },
  "storage": {
    "used_mb": 1250,
    "limit_mb": 5120,
    "percentage": 24.4
  }
}
```

---

### 5.4 Delete User Account

**Endpoint:** `DELETE /api/user`

**Description:** Permanently delete user account and all associated data.

**Authentication:** Required

**Request Body:**
```json
{
  "password": "current_password",
  "confirmation": "DELETE"
}
```

**Response:** `204 No Content`

**Error Responses:**
- `400 Bad Request` - Invalid confirmation or password
- `401 Unauthorized` - Wrong password

---

## 6. Share API

### 6.1 Get Shared Script

**Endpoint:** `GET /api/share/[shareId]`

**Description:** Retrieve a publicly shared script by share ID.

**Authentication:** Not required

**Path Parameters:**
- `shareId` - Share UUID

**Request:**
```http
GET /api/share/xyz-789-uvw
```

**Response:** `200 OK`
```json
{
  "share_id": "xyz-789-uvw",
  "script": {
    "id": "uuid",
    "title": "Product Launch Script",
    "content": "Full script content...",
    "bg_url": "https://...",
    "music_url": "https://...",
    "settings": { /* ... */ }
  },
  "author": {
    "display_name": "John Doe",
    "avatar_url": "https://..."
  },
  "shared_at": "2025-01-15T10:30:00Z",
  "expires_at": null
}
```

**Error Responses:**
- `404 Not Found` - Share doesn't exist or expired
- `410 Gone` - Share was revoked

---

### 6.2 Copy Shared Script

**Endpoint:** `POST /api/share/[shareId]/copy`

**Description:** Copy a shared script to current user's library.

**Authentication:** Required

**Request:**
```http
POST /api/share/xyz-789-uvw/copy
Authorization: Bearer <token>
```

**Response:** `201 Created`
```json
{
  "id": "new-uuid",
  "user_id": "current-user-uuid",
  "title": "Product Launch Script",
  "content": "Full script content...",
  "bg_url": "https://...",
  "music_url": "https://...",
  "settings": { /* ... */ },
  "is_public": false,
  "share_id": null,
  "created_at": "2025-01-15T12:00:00Z",
  "updated_at": "2025-01-15T12:00:00Z"
}
```

---

## 7. Storage API

### 7.1 Get Storage Usage

**Endpoint:** `GET /api/user/storage`

**Description:** Get detailed storage usage breakdown.

**Authentication:** Required

**Request:**
```http
GET /api/user/storage
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "total": {
    "used_mb": 1250.5,
    "limit_mb": 5120,
    "available_mb": 3869.5,
    "percentage": 24.4
  },
  "breakdown": {
    "recordings": {
      "count": 15,
      "size_mb": 1180.2,
      "percentage": 94.4
    },
    "presets": {
      "count": 3,
      "size_mb": 2.5,
      "percentage": 0.2
    },
    "other": {
      "size_mb": 67.8,
      "percentage": 5.4
    }
  }
}
```

---

### 7.2 Clear Old Recordings

**Endpoint:** `POST /api/user/storage/cleanup`

**Description:** Delete recordings older than specified days.

**Authentication:** Required

**Request Body:**
```json
{
  "older_than_days": 30
}
```

**Response:** `200 OK`
```json
{
  "deleted_count": 5,
  "freed_mb": 450.2
}
```

---

### 7.3 Export User Data

**Endpoint:** `GET /api/user/export`

**Description:** Generate a ZIP file with all user data (scripts, recordings metadata, presets).

**Authentication:** Required

**Request:**
```http
GET /api/user/export
Authorization: Bearer <token>
```

**Response:** `200 OK`
```
Content-Type: application/zip
Content-Disposition: attachment; filename="glean-export-2025-01-15.zip"

<binary ZIP file content>
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `FORBIDDEN` | 403 | User lacks permission |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `QUOTA_EXCEEDED` | 429 | User quota exceeded |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| All API routes | 100 requests | 15 minutes |
| Recording upload | 5 requests | 1 hour |
| Export data | 1 request | 24 hours |

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705334400
```

---

## API Versioning

The API is currently at version 1. Version is specified in the URL path:

```
/api/v1/scripts
/api/v1/recordings
```

Currently, the `/api/` prefix redirects to `/api/v1/` for backward compatibility. Future breaking changes will use `/api/v2/`.

---

## OpenAPI Specification

A complete OpenAPI 3.0 specification is available at:

```
/api/docs
```

This provides interactive API documentation using Swagger UI.
