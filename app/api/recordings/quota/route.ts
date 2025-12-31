/**
 * GET /api/recordings/quota - Get user's current storage usage and limits
 */

import { NextRequest } from 'next/server';
import { getStorageQuota } from '@/lib/supabase/recordings';
import { createApiResponse, createErrorResponse } from '@/types/api';

export async function GET(request: NextRequest) {
  try {
    const quota = await getStorageQuota();
    return Response.json(createApiResponse(quota));
  } catch (error) {
    console.error('Error getting storage quota:', error);
    return Response.json(createErrorResponse(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Failed to get storage quota',
      500
    ), { status: 500 });
  }
}
