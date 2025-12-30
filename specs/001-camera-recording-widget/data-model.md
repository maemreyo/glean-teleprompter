# Data Model: Floating Camera Widget & Recording

**Feature**: Floating Camera Widget & Recording
**Database**: Supabase PostgreSQL
**Storage**: Supabase Storage

## Overview

The camera recording feature requires data persistence for user recordings, metadata tracking, and storage quota management. The data model supports video file storage, recording metadata, and user-specific access controls.

## Core Entities

### Recording Entity

**Purpose**: Stores metadata for each video recording session

**Database Table**: `recordings`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT `uuid_generate_v4()` | Unique recording identifier |
| `user_id` | `uuid` | NOT NULL, REFERENCES `auth.users(id)` | Owner of the recording |
| `video_url` | `text` | NOT NULL | Supabase Storage file path/URL |
| `script_snapshot` | `text` | NULL | Teleprompter text content at recording time |
| `duration` | `integer` | NOT NULL, CHECK `duration > 0` | Recording length in seconds |
| `size_mb` | `float` | NOT NULL, CHECK `size_mb > 0` | File size in megabytes |
| `file_format` | `text` | NOT NULL, DEFAULT 'webm' | Original recording format (webm/mp4) |
| `converted_url` | `text` | NULL | Path to converted format file (if different from original) |
| `recording_quality` | `text` | NULL, CHECK `recording_quality IN ('standard', 'reduced')` | Quality setting used for recording |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `NOW()` | Recording creation timestamp |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `NOW()` | Last modification timestamp |

**Indexes**:
- `idx_recordings_user_id` on `(user_id)` - User's recordings lookup
- `idx_recordings_created_at` on `(created_at DESC)` - Chronological ordering
- `idx_recordings_user_created` on `(user_id, created_at DESC)` - User's recent recordings

**Constraints**:
- Maximum duration: 300 seconds (5 minutes) enforced via CHECK constraint
- Maximum size: 50MB per recording (reasonable upload limit)

### User Entity (Extended)

**Purpose**: Existing auth.users table with recording-specific extensions

**Database Table**: `auth.users` (existing) + `user_recording_settings`

**User Recording Settings Table**: `user_recording_settings`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `user_id` | `uuid` | PRIMARY KEY, REFERENCES `auth.users(id)` | User identifier |
| `storage_used_mb` | `float` | NOT NULL, DEFAULT 0 | Current storage usage in MB |
| `storage_limit_mb` | `integer` | NOT NULL, DEFAULT 100 | User's storage quota |
| `default_quality` | `text` | NOT NULL, DEFAULT 'standard' | Default recording quality |
| `auto_convert` | `boolean` | NOT NULL, DEFAULT true | Auto-convert formats for compatibility |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `NOW()` | Settings creation timestamp |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `NOW()` | Settings modification timestamp |

## Storage Design

### Supabase Storage Buckets

**Bucket**: `user_recordings`

**Structure**:
```
user_recordings/
├── {user_id}/
│   ├── {timestamp}_original.webm    # Original recording
│   ├── {timestamp}_converted.mp4    # Converted format (if needed)
│   └── thumbnails/
│       └── {timestamp}.jpg           # Video thumbnail
```

**File Naming Convention**:
- `{timestamp}`: ISO 8601 format (e.g., `2025-12-30T14:15:30Z`)
- Original recordings: `{timestamp}_original.{ext}`
- Converted recordings: `{timestamp}_converted.{ext}`
- Thumbnails: `{timestamp}.jpg`

### Storage Policies

**Upload Policy** (`INSERT`):
```sql
-- Users can only upload to their own directory
CREATE POLICY "Users can upload their own recordings"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user_recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Read Policy** (`SELECT`):
```sql
-- Users can only view their own recordings
CREATE POLICY "Users can view their own recordings"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user_recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Delete Policy** (`DELETE`):
```sql
-- Users can only delete their own recordings
CREATE POLICY "Users can delete their own recordings"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user_recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## Data Relationships

```
auth.users (1) ──── (1) user_recording_settings
    │
    └── (∞) recordings
```

**Relationship Details**:
- One user can have multiple recordings
- User settings control recording behavior and limits
- Recordings are soft-deleted by marking as inactive (not hard deleted from storage)
- Storage quota enforced at application level

## Data Validation Rules

### Recording Validation

```sql
-- Duration limits (5 minutes max)
ALTER TABLE recordings
ADD CONSTRAINT check_duration_limit
CHECK (duration <= 300);

-- File size limits (50MB max per recording)
ALTER TABLE recordings
ADD CONSTRAINT check_file_size_limit
CHECK (size_mb <= 50);

-- Supported formats
ALTER TABLE recordings
ADD CONSTRAINT check_supported_formats
CHECK (file_format IN ('webm', 'mp4'));
```

### User Quota Validation

```sql
-- Storage limit cannot be negative
ALTER TABLE user_recording_settings
ADD CONSTRAINT check_positive_limits
CHECK (storage_limit_mb > 0);

-- Storage used cannot exceed limit
ALTER TABLE user_recording_settings
ADD CONSTRAINT check_usage_within_limit
CHECK (storage_used_mb <= storage_limit_mb);
```

## Data Access Patterns

### Common Queries

**Get user's recordings with pagination**:
```sql
SELECT id, video_url, duration, size_mb, created_at
FROM recordings
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
```

**Check user's storage quota**:
```sql
SELECT
  storage_used_mb,
  storage_limit_mb,
  (storage_used_mb / storage_limit_mb * 100) as usage_percentage
FROM user_recording_settings
WHERE user_id = $1;
```

**Calculate total storage used**:
```sql
SELECT COALESCE(SUM(size_mb), 0) as total_used
FROM recordings
WHERE user_id = $1;
```

## Migration Strategy

### Database Migrations

**Migration 001: Create recordings table**
```sql
-- Create recordings table
CREATE TABLE recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  script_snapshot TEXT,
  duration INTEGER NOT NULL CHECK (duration > 0),
  size_mb FLOAT NOT NULL CHECK (size_mb > 0),
  file_format TEXT NOT NULL DEFAULT 'webm',
  converted_url TEXT,
  recording_quality TEXT CHECK (recording_quality IN ('standard', 'reduced')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_recordings_user_id ON recordings(user_id);
CREATE INDEX idx_recordings_created_at ON recordings(created_at DESC);
CREATE INDEX idx_recordings_user_created ON recordings(user_id, created_at DESC);
```

**Migration 002: Create user settings table**
```sql
-- Create user recording settings table
CREATE TABLE user_recording_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_used_mb FLOAT NOT NULL DEFAULT 0,
  storage_limit_mb INTEGER NOT NULL DEFAULT 100,
  default_quality TEXT NOT NULL DEFAULT 'standard',
  auto_convert BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Storage Setup

**Create storage bucket and policies** (via Supabase dashboard or SQL):
```sql
-- Create bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('user_recordings', 'user_recordings', false);

-- Create policies (defined above)
-- ... policy creation SQL
```

## Performance Considerations

### Query Optimization
- Indexes on frequently queried fields (user_id, created_at)
- Pagination for large result sets
- Efficient storage usage calculations

### Storage Optimization
- Automatic cleanup of old/unused files
- Compression for uploaded videos
- CDN delivery for playback

### Monitoring
- Track storage usage per user
- Monitor upload/download performance
- Alert on quota violations

## Security Considerations

- **Row Level Security (RLS)**: Enforced on all recording data
- **Storage Policies**: User-scoped file access
- **API Authentication**: Supabase Auth required for all operations
- **Data Encryption**: Automatic encryption at rest and in transit
- **Audit Logging**: All recording operations logged for compliance

## Future Extensions

- **Recording Tags/Categories**: Add categorization for better organization
- **Sharing Permissions**: Allow sharing recordings with other users
- **Version History**: Track recording edits and versions
- **Analytics**: Recording usage statistics and performance metrics