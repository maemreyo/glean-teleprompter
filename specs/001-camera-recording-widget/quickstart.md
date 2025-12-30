# Quickstart Guide: Camera Recording Feature

**Feature**: Floating Camera Widget & Recording
**Audience**: Frontend/Backend Developers
**Time to Complete**: 4-6 hours

## Overview

This guide provides step-by-step instructions for implementing the camera recording feature, including the floating camera widget, video recording, storage integration, and format conversion.

## Prerequisites

- Next.js 14+ project with App Router
- Supabase project configured
- TypeScript configured
- Tailwind CSS and shadcn/ui installed
- Basic understanding of React hooks and media APIs

## Phase 1: Database Setup (30 minutes)

### 1.1 Create Database Tables

Run these SQL migrations in your Supabase SQL editor:

```sql
-- Create recordings table
CREATE TABLE recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  script_snapshot TEXT,
  duration INTEGER NOT NULL CHECK (duration > 0 AND duration <= 300),
  size_mb FLOAT NOT NULL CHECK (size_mb > 0 AND size_mb <= 50),
  file_format TEXT NOT NULL DEFAULT 'webm' CHECK (file_format IN ('webm', 'mp4')),
  converted_url TEXT,
  recording_quality TEXT CHECK (recording_quality IN ('standard', 'reduced')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user settings table
CREATE TABLE user_recording_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_used_mb FLOAT NOT NULL DEFAULT 0,
  storage_limit_mb INTEGER NOT NULL DEFAULT 100,
  default_quality TEXT NOT NULL DEFAULT 'standard',
  auto_convert BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_recordings_user_id ON recordings(user_id);
CREATE INDEX idx_recordings_created_at ON recordings(created_at DESC);
CREATE INDEX idx_recordings_user_created ON recordings(user_id, created_at DESC);
```

### 1.2 Setup Storage Bucket

In Supabase Dashboard → Storage:

1. Create bucket: `user_recordings`
2. Set to private (not public)
3. Create these policies:

**Upload Policy**:
```sql
CREATE POLICY "Users can upload their own recordings"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user_recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Read Policy**:
```sql
CREATE POLICY "Users can view their own recordings"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user_recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Delete Policy**:
```sql
CREATE POLICY "Users can delete their own recordings"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user_recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## Phase 2: Core Components (2 hours)

### 2.1 Create Recording Hook

Create `hooks/useCameraRecorder.ts`:

```typescript
import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

interface RecordingState {
  isRecording: boolean;
  duration: number;
  stream: MediaStream | null;
  recordedBlob: Blob | null;
}

export function useCameraRecorder() {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    duration: 0,
    stream: null,
    recordedBlob: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  const requestPermissions = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: { width: 1280, height: 720 }
      });
      setState(prev => ({ ...prev, stream }));
      return true;
    } catch (error) {
      console.error('Camera permission denied:', error);
      return false;
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!state.stream) return false;

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
      ? 'video/webm;codecs=vp8,opus'
      : 'video/webm';

    const mediaRecorder = new MediaRecorder(state.stream, { mimeType });
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];
    startTimeRef.current = Date.now();

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);

      setState(prev => ({
        ...prev,
        isRecording: false,
        duration,
        recordedBlob: blob,
      }));
    };

    mediaRecorder.start(1000); // Collect data every second
    setState(prev => ({ ...prev, isRecording: true }));

    return true;
  }, [state.stream]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [state.isRecording]);

  const saveToCloud = useCallback(async (scriptSnapshot?: string): Promise<string | null> => {
    if (!state.recordedBlob) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const timestamp = new Date().toISOString();
      const fileName = `${timestamp}_original.webm`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user_recordings')
        .upload(filePath, state.recordedBlob);

      if (uploadError) throw uploadError;

      // Save metadata to database
      const { data: recording, error: dbError } = await supabase
        .from('recordings')
        .insert({
          user_id: user.id,
          video_url: uploadData.path,
          script_snapshot: scriptSnapshot,
          duration: state.duration,
          size_mb: state.recordedBlob.size / (1024 * 1024),
          file_format: 'webm',
          recording_quality: 'standard',
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return recording.id;
    } catch (error) {
      console.error('Failed to save recording:', error);
      return null;
    }
  }, [state.recordedBlob, state.duration]);

  const cleanup = useCallback(() => {
    if (state.stream) {
      state.stream.getTracks().forEach(track => track.stop());
    }
    setState({
      isRecording: false,
      duration: 0,
      stream: null,
      recordedBlob: null,
    });
  }, [state.stream]);

  return {
    ...state,
    requestPermissions,
    startRecording,
    stopRecording,
    saveToCloud,
    cleanup,
  };
}
```

### 2.2 Create Camera Widget Component

Create `components/teleprompter/camera/DraggableCamera.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { Camera, CameraOff, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCameraRecorder } from '@/hooks/useCameraRecorder';

interface DraggableCameraProps {
  isVisible: boolean;
  onToggle: () => void;
  onRecordingComplete?: (recordingId: string) => void;
}

export function DraggableCamera({
  isVisible,
  onToggle,
  onRecordingComplete
}: DraggableCameraProps) {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const dragControls = useDragControls();

  const {
    stream,
    isRecording,
    requestPermissions,
    startRecording,
    stopRecording,
    saveToCloud,
    cleanup,
  } = useCameraRecorder();

  const handleToggleCamera = async () => {
    if (!stream) {
      const granted = await requestPermissions();
      if (granted) {
        onToggle();
      }
    } else {
      cleanup();
      onToggle();
    }
  };

  const handleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      const started = startRecording();
      if (!started) {
        console.error('Failed to start recording');
      }
    }
  };

  const handleSaveRecording = async () => {
    const recordingId = await saveToCloud('Current teleprompter text...');
    if (recordingId && onRecordingComplete) {
      onRecordingComplete(recordingId);
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={(_, info) => {
        setPosition(prev => ({
          x: prev.x + info.offset.x,
          y: prev.y + info.offset.y,
        }));
      }}
      className={`fixed z-50 rounded-2xl shadow-lg border-2 ${
        isRecording ? 'border-red-500' : 'border-gray-300'
      } overflow-hidden bg-white`}
      style={{
        left: position.x,
        top: position.y,
        width: '240px',
        height: '320px',
      }}
    >
      {/* Video Preview */}
      <div className="relative w-full h-full">
        {stream ? (
          <video
            ref={(video) => {
              if (video && stream) {
                video.srcObject = stream;
                video.play().catch(console.error);
              }
            }}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <Camera className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-2 right-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-500 text-sm font-mono">REC</span>
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-between">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleToggleCamera}
          >
            {stream ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
          </Button>

          {stream && (
            <Button
              size="sm"
              variant={isRecording ? "destructive" : "default"}
              onClick={handleRecording}
            >
              {isRecording ? (
                <Square className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
```

### 2.3 Create Recording Modal

Create `components/teleprompter/camera/RecordingModal.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, Save, X } from 'lucide-react';

interface RecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoBlob: Blob;
  onSave: () => Promise<void>;
  onDiscard: () => void;
}

export function RecordingModal({
  isOpen,
  onClose,
  videoBlob,
  onSave,
  onDiscard,
}: RecordingModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const videoUrl = URL.createObjectURL(videoBlob);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save recording:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    URL.revokeObjectURL(videoUrl);
    onDiscard();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Recording Preview</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <video
            src={videoUrl}
            controls
            className="w-full rounded-lg"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleDiscard}
              disabled={isSaving}
            >
              <X className="w-4 h-4 mr-2" />
              Discard
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Recording'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## Phase 3: Integration & Testing (1 hour)

### 3.1 Integrate with Teleprompter

Update `app/protected/teleprompter/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { DraggableCamera } from '@/components/teleprompter/camera/DraggableCamera';
import { RecordingModal } from '@/components/teleprompter/camera/RecordingModal';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

export default function TeleprompterPage() {
  const [cameraVisible, setCameraVisible] = useState(false);
  const [recordingModal, setRecordingModal] = useState<{
    open: boolean;
    blob: Blob | null;
  }>({ open: false, blob: null });

  const handleRecordingComplete = (blob: Blob) => {
    setRecordingModal({ open: true, blob });
  };

  const handleSaveRecording = async () => {
    // Implement save logic
    console.log('Saving recording...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Teleprompter content */}

      {/* Camera toggle button */}
      <div className="fixed top-4 right-4 z-40">
        <Button
          onClick={() => setCameraVisible(!cameraVisible)}
          variant={cameraVisible ? "default" : "outline"}
        >
          <Camera className="w-4 h-4 mr-2" />
          {cameraVisible ? 'Hide Camera' : 'Show Camera'}
        </Button>
      </div>

      {/* Camera widget */}
      <DraggableCamera
        isVisible={cameraVisible}
        onToggle={() => setCameraVisible(!cameraVisible)}
        onRecordingComplete={handleRecordingComplete}
      />

      {/* Recording modal */}
      <RecordingModal
        isOpen={recordingModal.open}
        onClose={() => setRecordingModal({ open: false, blob: null })}
        videoBlob={recordingModal.blob!}
        onSave={handleSaveRecording}
        onDiscard={() => setRecordingModal({ open: false, blob: null })}
      />
    </div>
  );
}
```

### 3.2 Add TypeScript Types

Create `types/recording.ts`:

```typescript
export interface Recording {
  id: string;
  user_id: string;
  video_url: string;
  script_snapshot?: string;
  duration: number;
  size_mb: number;
  file_format: 'webm' | 'mp4';
  converted_url?: string;
  recording_quality: 'standard' | 'reduced';
  created_at: string;
  updated_at: string;
}

export interface StorageQuota {
  used_mb: number;
  limit_mb: number;
  usage_percentage: number;
  can_record: boolean;
}

export interface RecordingCreate {
  video_url: string;
  script_snapshot?: string;
  duration: number;
  size_mb: number;
  file_format?: 'webm' | 'mp4';
  recording_quality?: 'standard' | 'reduced';
}

export interface RecordingUpdate {
  script_snapshot?: string;
}
```

## Phase 4: Format Conversion (1 hour)

### 4.1 Create Conversion API Route

Create `app/api/recordings/convert/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { spawn } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recordingId } = await request.json();

    // Get recording details
    const { data: recording, error } = await supabase
      .from('recordings')
      .select('*')
      .eq('id', recordingId)
      .eq('user_id', user.id)
      .single();

    if (error || !recording) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 });
    }

    // Download original file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('user_recordings')
      .download(recording.video_url);

    if (downloadError) {
      throw downloadError;
    }

    // Convert using FFmpeg
    const inputPath = path.join('/tmp', `input_${recordingId}.webm`);
    const outputPath = path.join('/tmp', `output_${recordingId}.mp4`);

    await writeFile(inputPath, Buffer.from(await fileData.arrayBuffer()));

    await new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-i', inputPath,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-movflags', '+faststart',
        outputPath
      ]);

      ffmpeg.on('close', (code) => {
        if (code === 0) resolve(null);
        else reject(new Error(`FFmpeg failed with code ${code}`));
      });

      ffmpeg.on('error', reject);
    });

    // Upload converted file
    const convertedFile = await readFile(outputPath);
    const convertedPath = recording.video_url.replace('.webm', '.mp4');

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user_recordings')
      .upload(convertedPath, convertedFile);

    if (uploadError) throw uploadError;

    // Update recording with converted URL
    await supabase
      .from('recordings')
      .update({ converted_url: uploadData.path })
      .eq('id', recordingId);

    // Cleanup temp files
    await unlink(inputPath);
    await unlink(outputPath);

    return NextResponse.json({
      converted_url: uploadData.path,
      status: 'completed'
    });

  } catch (error) {
    console.error('Conversion failed:', error);
    return NextResponse.json(
      { error: 'Conversion failed' },
      { status: 500 }
    );
  }
}
```

## Testing Checklist

- [ ] Camera permissions requested correctly
- [ ] Video preview displays with mirroring
- [ ] Recording starts/stops as expected
- [ ] Files upload to Supabase Storage
- [ ] Database records created correctly
- [ ] Quota limits enforced
- [ ] Format conversion works
- [ ] Error handling robust
- [ ] Mobile responsive

## Deployment Notes

1. **Environment Variables**: Ensure Supabase credentials are set
2. **FFmpeg Installation**: Required on Vercel (add to build settings)
3. **Storage CORS**: Configure for web access
4. **Monitoring**: Set up error tracking for media operations

## Troubleshooting

**Camera not working**:
- Check browser permissions
- Verify HTTPS (required for camera access)
- Try different browser

**Recording fails**:
- Check MediaRecorder support
- Verify sufficient disk space
- Check network connectivity

**Upload issues**:
- Verify Supabase configuration
- Check file size limits
- Confirm storage policies

## Next Steps

1. Implement user settings management
2. Add recording analytics
3. Create sharing functionality
4. Optimize mobile performance