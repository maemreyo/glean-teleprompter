'use client';

/**
 * StoryRail Component
 *
 * Horizontal scrollable rail displaying all story slides as thumbnails.
 * Supports drag-and-drop reordering with visual drop indicators.
 * Includes aria-live region for screen reader announcements.
 */

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useStoryBuilderStore } from '@/lib/story-builder/store';
import { SlideCard } from './slides/SlideCard';
import { EmptyState } from '@/components/story-builder/EmptyState';
import { cn } from '@/lib/utils';

interface StoryRailProps {
  className?: string;
}

export function StoryRail({ className }: StoryRailProps) {
  const { slides, activeSlideIndex } = useStoryBuilderStore();
  const { setNodeRef } = useDroppable({
    id: 'story-rail',
    data: { container: 'rail' },
  });

  const slideIds = slides.map((s) => s.id);

  return (
    <div className={cn('flex flex-col bg-background border rounded-lg', className)}>
      <div className="p-3 border-b">
        <h2 className="text-sm font-medium">Story Rail</h2>
        <p className="text-xs text-muted-foreground">
          {slides.length} {slides.length === 1 ? 'slide' : 'slides'}
        </p>
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
        className="flex-1 p-4 overflow-x-auto"
      >
        {slides.length === 0 ? (
          <EmptyState />
        ) : (
          <SortableContext items={slideIds} strategy={horizontalListSortingStrategy}>
            <div className="flex gap-3">
              {slides.map((slide, index) => (
                <SlideCard
                  key={slide.id}
                  slide={slide}
                  index={index}
                  isActive={index === activeSlideIndex}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  );
}
