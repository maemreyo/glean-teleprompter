/**
 * Story Container Component
 * 
 * 9:16 aspect ratio container with safe area padding support.
 * Integration point for story store and slide rendering.
 * 
 * @feature 012-standalone-story
 */

import React from 'react';
import { useSafeArea } from '@/lib/story/hooks/useSafeArea';
import { useVHFix } from '@/lib/story/hooks/useVHFix';

export interface StoryContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Container component with 9:16 aspect ratio and safe area support
 * 
 * @example
 * ```tsx
 * <StoryContainer>
 *   <StoryViewer story={story} />
 * </StoryContainer>
 * ```
 */
export function StoryContainer({ children, className = '' }: StoryContainerProps): React.JSX.Element {
  const safeArea = useSafeArea();
  
  // Apply viewport height fix
  useVHFix();

  // Calculate safe area padding
  const paddingTop = safeArea.hasSafeArea ? `${safeArea.top}px` : '0';
  const paddingBottom = safeArea.hasSafeArea ? `${safeArea.bottom}px` : '0';
  const paddingLeft = safeArea.hasSafeArea ? `${safeArea.left}px` : '0';
  const paddingRight = safeArea.hasSafeArea ? `${safeArea.right}px` : '0';

  return (
    <div
      className={`story-container ${className}`}
      style={{
        // Fix mobile viewport height (with --vh fallback)
        height: 'calc(var(--vh, 1vh) * 100)',
        // 9:16 aspect ratio container
        width: '100%',
        maxWidth: '56.25vh', // 9/16 * 100vh
        margin: '0 auto',
        // Safe area padding
        paddingTop,
        paddingBottom,
        paddingLeft,
        paddingRight,
        // Additional styles
        position: 'relative' as const,
        overflow: 'hidden' as const,
        backgroundColor: '#000',
      }}
    >
      {children}
    </div>
  );
}
