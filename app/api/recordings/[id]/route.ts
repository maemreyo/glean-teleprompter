/**
 * GET /api/recordings/[id] - Get detailed information about a specific recording
 * PATCH /api/recordings/[id] - Update recording metadata
 * DELETE /api/recordings/[id] - Delete a recording and its associated files
 */

import { NextRequest } from 'next/server';
import {
  getRecording,
  updateRecording,
  deleteRecording,
} from '@/lib/supabase/recordings';
import type { RecordingUpdate } from '@/types/recording';
import { createApiResponse, createErrorResponse } from '@/types/api';

interface RouteContext {
  params: { id: string };
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const recording = await getRecording(context.params.id);

    if (!recording) {
      return createErrorResponse('NOT_FOUND', 'Recording not found', 404);
    }

    return createApiResponse(recording);
  } catch (error) {
    console.error('Error getting recording:', error);
    return createErrorResponse(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Failed to get recording',
      500
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const body = (await request.json()) as Partial<RecordingUpdate>;
    const recording = await updateRecording(context.params.id, body);

    return createApiResponse(recording);
  } catch (error) {
    console.error('Error updating recording:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return createErrorResponse('NOT_FOUND', 'Recording not found', 404);
    }

    return createErrorResponse(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Failed to update recording',
      500
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await deleteRecording(context.params.id);

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting recording:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return createErrorResponse('NOT_FOUND', 'Recording not found', 404);
    }

    return createErrorResponse(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Failed to delete recording',
      500
    );
  }
}
