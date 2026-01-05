/**
 * Story Viewer Page
 *
 * Dynamic route for viewing standalone stories.
 * Loads story data from URL parameter, validates it, and renders the StoryViewer.
 *
 * @feature 012-standalone-story
 */

import { decodeStoryFromUrl } from '@/lib/story/utils/urlEncoder';
import { validateStoryData } from '@/lib/story/validation';
import { StoryContainer } from '@/components/story/StoryContainer';
import { StoryViewer } from '@/components/story/StoryViewer';
import { ErrorScreen } from '@/components/story/ErrorScreen';
import { Metadata } from 'next';
import type { DecodedStoryResult } from '@/lib/story/types';

interface StoryPageProps {
  params: Promise<{ storyId: string }>;
}

/**
 * Generate metadata for the story page
 */
export async function generateMetadata(
  { params }: StoryPageProps
): Promise<Metadata> {
  const resolvedParams = await params;
  const storyId = resolvedParams.storyId;

  return {
    title: 'Story Viewer',
    description: 'View standalone story content',
    other: {
      'noindex': 'true',
    },
  };
}

/**
 * Server-side component to load and validate story data
 */
export default async function StoryPage({ params }: StoryPageProps) {
  const resolvedParams = await params;
  const storyId = resolvedParams.storyId;

  // Try to decode story from URL
  const decodedResult: DecodedStoryResult = decodeStoryFromUrl(storyId);

  // If decoding failed, show error screen
  if (!decodedResult.success || !decodedResult.data) {
    return (
      <ErrorScreen
        type="decode-error"
        details={decodedResult.error ? [decodedResult.error] : ['Failed to decode story data']}
      />
    );
  }

  // Validate the decoded story data
  const validationResult = validateStoryData(decodedResult.data);

  if (!validationResult.valid) {
    return (
      <ErrorScreen
        type="schema-violation"
        details={validationResult.errors}
      />
    );
  }

  // Reset story store when loading a new story
  const story = decodedResult.data;

  return (
    <StoryContainer>
      <StoryViewer story={story} />
    </StoryContainer>
  );
}
