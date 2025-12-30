/**
 * POST /api/recordings/upload - Upload a video file to storage with optional format conversion
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadRecording } from '@/lib/supabase/storage';
import { createRecording } from '@/lib/supabase/recordings';
import { createApiResponse, createErrorResponse } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createErrorResponse('UNAUTHORIZED', 'Unauthorized', 401);
    }

    const formData = await request.formData();
    const videoFile = formData.get('video') as File;

    if (!videoFile) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Video file is required',
        400
      );
    }

    // Validate file size (50MB max)
    if (videoFile.size > 50 * 1024 * 1024) {
      return createErrorResponse(
        'FILE_TOO_LARGE',
        'File size exceeds 50MB limit',
        413
      );
    }

    // Upload to storage
    const { url, size_mb } = await uploadRecording(user.id, videoFile, 'webm');

    // Create recording entry
    const recording = await createRecording({
      video_url: url,
      duration: 0, // Will be calculated from metadata
      size_mb,
      file_format: 'webm',
      recording_quality: 'standard',
    });

    return createApiResponse(
      {
        url,
        size_mb,
        recording_id: recording.id,
      },
      201
    );
  } catch (error) {
    console.error('Error uploading recording:', error);

    if (error instanceof Error && error.message.includes('quota')) {
      return createErrorResponse(
        'QUOTA_EXCEEDED',
        error.message,
        507
      );
    }

    return createErrorResponse(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Failed to upload recording',
      500
    );
  }
}
