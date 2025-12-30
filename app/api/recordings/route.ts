/**
 * GET /api/recordings - List user recordings with pagination
 * POST /api/recordings - Create a new recording entry
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { listRecordings, createRecording } from '@/lib/supabase/recordings';
import type { RecordingCreate } from '@/types/recording';
import { createApiResponse, createErrorResponse } from '@/types/api';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return createErrorResponse('UNAUTHORIZED', 'Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);

    const { recordings, total } = await listRecordings(page, limit);

    return createApiResponse({
      recordings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error listing recordings:', error);
    return createErrorResponse(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Failed to list recordings',
      500
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return createErrorResponse('UNAUTHORIZED', 'Unauthorized', 401);
    }

    const body = await request.json() as RecordingCreate;

    // Validate required fields
    if (!body.video_url || !body.duration || !body.size_mb) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Missing required fields: video_url, duration, and size_mb are required',
        400
      );
    }

    // Validate constraints
    if (body.duration <= 0 || body.duration > 300) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Duration must be between 1 and 300 seconds',
        400
      );
    }

    if (body.size_mb <= 0 || body.size_mb > 50) {
      return createErrorResponse(
        'FILE_TOO_LARGE',
        'File size must be between 0 and 50 MB',
        413
      );
    }

    const recording = await createRecording(body);

    return createApiResponse(recording, 201);
  } catch (error) {
    console.error('Error creating recording:', error);

    if (error instanceof Error && error.message.includes('quota')) {
      return createErrorResponse(
        'QUOTA_EXCEEDED',
        error.message,
        507
      );
    }

    return createErrorResponse(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Failed to create recording',
      500
    );
  }
}
