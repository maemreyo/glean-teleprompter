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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const recording = await getRecording(params.id);

    if (!recording) {
      return Response.json(createErrorResponse('NOT_FOUND', 'Recording not found', 404), { status: 404 });
    }

    return Response.json(createApiResponse(recording));
  } catch (error) {
    console.error('Error getting recording:', error);
    return Response.json(createErrorResponse(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Failed to get recording',
      500
    ), { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = (await request.json()) as Partial<RecordingUpdate>;
    const recording = await updateRecording(params.id, body);

    return Response.json(createApiResponse(recording));
  } catch (error) {
    console.error('Error updating recording:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return Response.json(createErrorResponse('NOT_FOUND', 'Recording not found', 404), { status: 404 });
    }

    return Response.json(createErrorResponse(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Failed to update recording',
      500
    ), { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    await deleteRecording(params.id);

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting recording:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return Response.json(createErrorResponse('NOT_FOUND', 'Recording not found', 404), { status: 404 });
    }

    return Response.json(createErrorResponse(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Failed to delete recording',
      500
    ), { status: 500 });
  }
}
