/**
 * Story Layout
 *
 * Minimal layout for story viewer.
 * No navigation or footer - just the story content.
 * Integrates StoryContainer for 9:16 aspect ratio and viewport height fix.
 *
 * @feature 012-standalone-story
 * @task T027
 */

import { StoryContainer } from '@/components/story/StoryContainer';

export default function StoryLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <StoryContainer>
      {children}
    </StoryContainer>
  );
}
