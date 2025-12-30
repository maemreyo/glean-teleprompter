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

interface RouteContext {
  params: { id: string };
}

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
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createErrorResponse('UNAUTHORIZED', 'Unauthorized', 401);
    }

    const recording = await getRecording(context.params.id);

    if (!recording) {
      return createErrorResponse('NOT_FOUND', 'Recording not found', 404);
    }

    // Check if already converted
    if (recording.converted_url) {
      return createApiResponse({
        converted_url: recording.converted_url,
        status: 'completed',
      });
    }

    const body = await request.json().catch(() => ({}));
    const targetFormat = body.target_format || 'mp4';

    // Validate target format
    if (!['mp4', 'webm'].includes(targetFormat)) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid target format. Supported: mp4, webm',
        400
      );
    }

    // Don't convert if already in target format
    if (recording.file_format === targetFormat) {
      return createApiResponse({
        converted_url: recording.video_url,
        status: 'completed',
      });
    }

    // Generate job ID
    const jobId = generateJobId(context.params.id, targetFormat);

    // For now, we'll mark the conversion as pending
    // In production, you would:
    // 1. Queue the conversion job (using Vercel Cron, BullMQ, etc.)
    // 2. Download the original file
    // 3. Convert using FFmpeg
    // 4. Upload the converted file
    // 5. Update the database with the new URL

    // Simulate async conversion acceptance
    return createApiResponse({
      job_id: jobId,
      status: 'pending',
      message: 'Conversion job accepted. Use the job_id to check status.',
    }, 202);

  } catch (error) {
    console.error('Error converting recording:', error);
    return createErrorResponse(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Failed to convert recording',
      500
    );
  }
}

/**
 * GET /api/recordings/[id]/convert - Check conversion status
 * 
 * Query parameters:
 * - job_id: Job ID returned from POST request
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('job_id');

    if (!jobId) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'job_id query parameter is required',
        400
      );
    }

    const recording = await getRecording(context.params.id);

    if (!recording) {
      return createErrorResponse('NOT_FOUND', 'Recording not found', 404);
    }

    // Check if conversion is complete
    if (recording.converted_url) {
      return createApiResponse({
        converted_url: recording.converted_url,
        status: 'completed',
        job_id: jobId,
      });
    }

    // Still processing
    return createApiResponse({
      status: 'pending',
      job_id: jobId,
      message: 'Conversion is still in progress',
    });

  } catch (error) {
    console.error('Error checking conversion status:', error);
    return createErrorResponse(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Failed to check conversion status',
      500
    );
  }
}
