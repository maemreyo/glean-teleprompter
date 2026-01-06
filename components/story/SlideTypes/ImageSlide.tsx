/**
 * Image Slide Component
 *
 * Displays an image with optional alt text.
 * Supports full-bleed images with aspect ratio preservation.
 *
 * @feature 012-standalone-story
 */

import React from 'react';
import type { ImageSlide as ImageSlideType } from '@/lib/story/types';

export interface ImageSlideProps {
  slide: ImageSlideType;
}

/**
 * Render an image slide
 */
export function ImageSlide({ slide }: ImageSlideProps): React.JSX.Element {
  const { content, alt = 'Story image' } = slide;

  return (
    <div className="relative h-full w-full">
      {/* Full-bleed image */}
      <img
        src={content}
        alt={alt}
        className="h-full w-full object-cover"
        loading="eager"
      />
    </div>
  );
}
