'use client';

/**
 * StoryRail Component
 *
 * Horizontal scrollable rail displaying all story slides as thumbnails.
 * Supports drag-and-drop reordering with visual drop indicators.
 * Includes aria-live region for screen reader announcements.
 * Supports arrow key navigation between slides.
 */

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useStoryBuilderStore } from '@/lib/story-builder/store';
import { SlideCard } from './slides/SlideCard';
import { EmptyState } from '@/components/story-builder/EmptyState';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface StoryRailProps {
  className?: string;
}

export function StoryRail({ className }: StoryRailProps) {
  const { slides, activeSlideIndex, setActiveSlide } = useStoryBuilderStore();
  const { setNodeRef } = useDroppable({
    id: 'story-rail',
    data: { container: 'rail' },
  });

  const slideIds = slides.map((s) => s.id);

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
            // Focus the previous slide card
            const prevCard = document.querySelector(`[data-slide-index="${activeSlideIndex - 1}"]`);
            if (prevCard instanceof HTMLElement) {
              prevCard.focus();
            }
          } else if (e.key === 'ArrowRight' && activeSlideIndex < slides.length - 1) {
            e.preventDefault();
            setActiveSlide(activeSlideIndex + 1);
            // Focus the next slide card
            const nextCard = document.querySelector(`[data-slide-index="${activeSlideIndex + 1}"]`);
            if (nextCard instanceof HTMLElement) {
              nextCard.focus();
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [activeSlideIndex, slides.length, setActiveSlide]);

  return (
    <div className={cn('flex flex-col bg-background border rounded-lg', className)} role="region" aria-labelledby="story-rail-heading">
      <div className="p-3 border-b">
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
