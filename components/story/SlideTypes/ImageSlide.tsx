/**
 * Image Slide Component
 *
 * Displays an image with optional alt text.
 * Supports full-bleed images with aspect ratio preservation.
 *
 * @feature 012-standalone-story
 */

import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import type { ImageSlide as ImageSlideType } from '@/lib/story/types';

export interface ImageSlideProps {
  slide: ImageSlideType;
}

/**
 * Render an image slide
 */
export function ImageSlide({ slide }: ImageSlideProps): React.JSX.Element {
  const { content, alt = 'Story image' } = slide;

  if (!content) {
    return (
      <div className="flex font-display h-full w-full flex-col items-center justify-center bg-zinc-900 p-8 text-center">
        <div className="mb-4 rounded-full bg-zinc-800 p-4">
          <ImageIcon className="h-8 w-8 text-zinc-500" />
        </div>
        <h3 className="text-lg font-bold text-white">No image set</h3>
        <p className="mt-2 text-sm text-zinc-400">
          Enter an image URL in the editor to see it here
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* Full-bleed image */}
      <img
        src={content}
        alt={alt}
        className="h-full w-full object-cover"
        loading="eager"
        onError={(e) => {
          // Fallback if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            const fallback = document.createElement('div');
            fallback.className = 'flex h-full w-full flex-col items-center justify-center bg-zinc-900 p-8 text-center';
            fallback.innerHTML = `
              <div class="mb-4 rounded-full bg-zinc-800 p-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8 text-zinc-500"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              </div>
              <h3 class="text-lg font-bold text-white">Image failed to load</h3>
              <p class="mt-2 text-sm text-zinc-400">Please check the image URL</p>
            `;
            parent.appendChild(fallback);
          }
        }}
      />
    </div>
  );
}
