/**
 * Text Highlight Slide Component
 *
 * Displays text content with highlighted sections.
 * Supports karaoke-style effect for sequential highlighting.
 *
 * @feature 012-standalone-story
 */

import React from 'react';
import type { TextHighlightSlide as TextHighlightSlideType } from '@/lib/story/types';

export interface TextHighlightSlideProps {
  slide: TextHighlightSlideType;
}

/**
 * Render a text highlight slide
 */
export function TextHighlightSlide({ slide }: TextHighlightSlideProps): React.JSX.Element {
  const { content, highlights } = slide;

  /**
   * Render text with highlights applied
   * Sorts highlights by start index and renders them as styled spans
   */
  const renderHighlightedText = () => {
    if (!highlights || highlights.length === 0) {
      return <span>{content}</span>;
    }

    // Sort highlights by start index for proper rendering
    const sortedHighlights = [...highlights].sort((a, b) => a.startIndex - b.startIndex);

    // Create text segments with highlights
    const segments: React.ReactNode[] = [];
    let lastIndex = 0;

    for (const highlight of sortedHighlights) {
      // Add non-highlighted text before this highlight
      if (highlight.startIndex > lastIndex) {
        segments.push(
          <span key={`text-${lastIndex}`}>
            {content.slice(lastIndex, highlight.startIndex)}
          </span>
        );
      }

      // Add highlighted text
      const highlightStyle: React.CSSProperties = {
        color: highlight.color,
        fontWeight: highlight.fontWeight || 'normal',
      };

      segments.push(
        <span key={`highlight-${highlight.startIndex}`} style={highlightStyle}>
          {content.slice(highlight.startIndex, highlight.endIndex)}
        </span>
      );

      lastIndex = highlight.endIndex;
    }

    // Add remaining text after last highlight
    if (lastIndex < content.length) {
      segments.push(
        <span key={`text-${lastIndex}`}>
          {content.slice(lastIndex)}
        </span>
      );
    }

    return <>{segments}</>;
  };

  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="text-center">
        <p className="text-2xl font-bold leading-relaxed text-white drop-shadow-lg">
          {renderHighlightedText()}
        </p>
      </div>
    </div>
  );
}
