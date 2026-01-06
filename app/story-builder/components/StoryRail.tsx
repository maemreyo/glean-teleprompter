'use client';

/**
 * StoryRail Component
 *
 * Horizontal scrollable rail displaying all story slides as thumbnails.
 * Supports drag-and-drop reordering with visual drop indicators.
 * Includes aria-live region for screen reader announcements.
 * Supports arrow key navigation between slides.
 *
 * Performance: Uses react-virtuoso for virtualization
 */

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useStoryBuilderStore } from '@/lib/story-builder/store';
import { SlideCard } from './slides/SlideCard';
import { EmptyState } from '@/components/story-builder/EmptyState';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

interface StoryRailProps {
  className?: string;
}

const ESTIMATED_CARD_WIDTH = 180; // width + gap

export function StoryRail({ className }: StoryRailProps) {
  const { activeSlideIndex, slides, setActiveSlide } = useStoryBuilderStore();
  const { setNodeRef } = useDroppable({
    id: 'story-rail',
    data: { container: 'rail' },
  });

  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const slideIds = slides.map((s) => s.id);

  // Scroll to active slide when it changes
  useEffect(() => {
    if (activeSlideIndex !== null && virtuosoRef.current) {
      virtuosoRef.current.scrollToIndex({
        index: activeSlideIndex,
        align: 'center',
        behavior: 'smooth',
      });
    }
  }, [activeSlideIndex]);

  // Keyboard navigation for arrow keys
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Only handle arrow keys when not focused on input elements
      if (document.activeElement instanceof HTMLElement) {
        const isInputFocused =
          document.activeElement.tagName.toLowerCase() === 'input' ||
          document.activeElement.tagName.toLowerCase() === 'textarea' ||
          document.activeElement.getAttribute('contenteditable') === 'true';

        if (!isInputFocused) {
          if (e.key === 'ArrowLeft' && activeSlideIndex > 0) {
            e.preventDefault();
            setActiveSlide(activeSlideIndex - 1);
            // Focus is handled by the slide card itself if needed, or we rely on virtual scroll
          } else if (e.key === 'ArrowRight' && activeSlideIndex < slides.length - 1) {
            e.preventDefault();
            setActiveSlide(activeSlideIndex + 1);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [activeSlideIndex, slides.length, setActiveSlide]);

  return (
    <div className={cn('flex flex-col bg-background border rounded-lg', className)} style={{ height: '240px' }} role="region" aria-labelledby="story-rail-heading">
      <div className="p-3 border-b shrink-0">
        <h2 id="story-rail-heading" className="text-sm font-medium">Story Rail</h2>
        <p className="text-xs text-muted-foreground">
          {slides.length} {slides.length === 1 ? 'slide' : 'slides'}
        </p>
        {slides.length > 1 && (
          <p className="text-xs text-muted-foreground mt-1">
            Tip: Use ← → arrow keys to navigate between slides
          </p>
        )}
        {/* Screen reader announcement for slide changes */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {slides.length} {slides.length === 1 ? 'slide' : 'slides'} in story
          {activeSlideIndex !== null && `, slide ${activeSlideIndex + 1} selected`}
        </div>
      </div>
      
      <div
        ref={setNodeRef}
        className="flex-1 overflow-hidden p-4"
      >
        {slides.length === 0 ? (
          <EmptyState />
        ) : (
          <SortableContext items={slideIds} strategy={horizontalListSortingStrategy}>
            <Virtuoso
              ref={virtuosoRef}
              horizontalDirection
              data={slides}
              totalCount={slides.length}
              itemContent={(index, slide) => (
                <div style={{ marginRight: '12px', display: 'inline-block', height: '100%' }}>
                  <SlideCard
                    key={slide.id}
                    slide={slide}
                    index={index}
                    isActive={index === activeSlideIndex}
                  />
                </div>
              )}
              style={{ height: '100%', width: '100%' }}
            />
          </SortableContext>
        )}
      </div>
    </div>
  );
}
