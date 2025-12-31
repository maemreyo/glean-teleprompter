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
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json(createErrorResponse('UNAUTHORIZED', 'Unauthorized', 401), { status: 401 });
    }

    const formData = await request.formData();
    const videoFile = formData.get('video') as File;

    if (!videoFile) {
      return Response.json(createErrorResponse(
        'VALIDATION_ERROR',
        'Video file is required',
        400
      ), { status: 400 });
    }

    // Validate file size (50MB max)
    if (videoFile.size > 50 * 1024 * 1024) {
      return Response.json(createErrorResponse(
        'FILE_TOO_LARGE',
        'File size exceeds 50MB limit',
        413
      ), { status: 413 });
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

    return Response.json(createApiResponse(
      {
        url,
        size_mb,
        recording_id: recording.id,
      },
      201
    ), { status: 201 });
  } catch (error) {
    console.error('Error uploading recording:', error);

    if (error instanceof Error && error.message.includes('quota')) {
      return Response.json(createErrorResponse(
        'QUOTA_EXCEEDED',
        error.message,
        507
      ), { status: 507 });
    }

    return Response.json(createErrorResponse(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Failed to upload recording',
      500
    ), { status: 500 });
  }
}
