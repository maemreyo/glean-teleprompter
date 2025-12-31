/**
 * POST /api/recordings/convert - Trigger format conversion for a recording
 * This endpoint handles server-side WebM to MP4 conversion for cross-browser compatibility
 * 
 * Note: This implementation uses a simulated conversion. For production use with FFmpeg,
 * you would need to install @ffmpeg/ffmpeg or use a serverless FFmpeg solution.
 * 
 * Deployment requirements:
 * - Vercel: Use serverless function with FFmpeg wasm or external service
 * - Self-hosted: Install FFmpeg system package
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { getRecording, setConvertedUrl } from '@/lib/supabase/recordings';
import { createApiResponse, createErrorResponse } from '@/types/api';
import { generateJobId } from '@/lib/utils/video';

/**
 * POST /api/recordings/[id]/convert - Trigger format conversion
 *
 * Request body:
 * - target_format: 'mp4' (default) | 'webm'
 *
 * Response:
 * - 202: Conversion job accepted
 * - 200: Already converted
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json(createErrorResponse('UNAUTHORIZED', 'Unauthorized', 401), { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const recordingId = body.id;
    const targetFormat = body.target_format || 'mp4';

    if (!recordingId) {
      return Response.json(createErrorResponse(
        'VALIDATION_ERROR',
        'recording id is required',
        400
      ), { status: 400 });
    }

    const recording = await getRecording(recordingId);

    if (!recording) {
      return Response.json(createErrorResponse('NOT_FOUND', 'Recording not found', 404), { status: 404 });
    }

    // Check if already converted
    if (recording.converted_url) {
      return Response.json(createApiResponse({
        converted_url: recording.converted_url,
        status: 'completed',
      }));
    }

    // Validate target format
    if (!['mp4', 'webm'].includes(targetFormat)) {
      return Response.json(createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid target format. Supported: mp4, webm',
        400
      ), { status: 400 });
    }

    // Don't convert if already in target format
    if (recording.file_format === targetFormat) {
      return Response.json(createApiResponse({
        converted_url: recording.video_url,
        status: 'completed',
      }));
    }

    // Generate job ID
    const jobId = generateJobId(recordingId, targetFormat);

    // For now, we'll mark the conversion as pending
    // In production, you would:
    // 1. Queue the conversion job (using Vercel Cron, BullMQ, etc.)
    // 2. Download the original file
    // 3. Convert using FFmpeg
    // 4. Upload the converted file
    // 5. Update the database with the new URL

    // Simulate async conversion acceptance
    return Response.json(createApiResponse({
      job_id: jobId,
      status: 'pending',
      message: 'Conversion job accepted. Use the job_id to check status.',
    }, 202), { status: 202 });

  } catch (error) {
    console.error('Error converting recording:', error);
    return Response.json(createErrorResponse(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Failed to convert recording',
      500
    ), { status: 500 });
  }
}

/**
 * GET /api/recordings/convert - Check conversion status
 *
 * Query parameters:
 * - job_id: Job ID returned from POST request
 * - id: recording ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('job_id');
    const recordingId = searchParams.get('id');

    if (!jobId || !recordingId) {
      return Response.json(createErrorResponse(
        'VALIDATION_ERROR',
        'job_id and id query parameters are required',
        400
      ), { status: 400 });
    }

    const recording = await getRecording(recordingId);

    if (!recording) {
      return Response.json(createErrorResponse('NOT_FOUND', 'Recording not found', 404), { status: 404 });
    }

    // Check if conversion is complete
    if (recording.converted_url) {
      return Response.json(createApiResponse({
        converted_url: recording.converted_url,
        status: 'completed',
        job_id: jobId,
      }));
    }

    // Still processing
    return Response.json(createApiResponse({
      status: 'pending',
      job_id: jobId,
      message: 'Conversion is still in progress',
    }));

  } catch (error) {
    console.error('Error checking conversion status:', error);
    return Response.json(createErrorResponse(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Failed to check conversion status',
      500
    ), { status: 500 });
  }
}
