'use client';

/**
 * SlideCard Component (Memoized)
 *
 * Displays a thumbnail card for a single slide in the story rail.
 * Wrapped with React.memo to prevent unnecessary re-renders during
 * sibling slide updates or drag operations.
 *
 * Uses custom comparison function to only re-render when:
 * - Slide ID changes (different slide)
 * - Index changes (position in rail changed)
 * - isActive state changes (selection changed)
 */

import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import type { BuilderSlide } from '@/lib/story-builder/types';
import { getSlideTypeLabel } from '@/lib/story-builder/templates/slideTypes';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useStoryBuilderStore } from '@/lib/story-builder/store';

interface SlideCardProps {
  slide: BuilderSlide;
  index: number;
  isActive?: boolean;
}

export const SlideCard = memo(function SlideCard({ slide, index, isActive }: SlideCardProps) {
  const { removeSlide, setActiveSlide } = useStoryBuilderStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: slide.id,
    data: { index, source: 'rail' },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Focus restoration: find the next slide to focus after deletion
    const nextSlideIndex = index < slides.length - 1 ? index : Math.max(0, index - 1);
    
    removeSlide(index);
    
    // Focus the next available slide card after deletion
    setTimeout(() => {
      const nextCard = document.querySelector(`[data-slide-index="${nextSlideIndex}"]`);
      if (nextCard instanceof HTMLElement) {
        nextCard.focus();
      }
    }, 0);
  };

  const handleClick = () => {
    setActiveSlide(index);
  };

  const slides = useStoryBuilderStore(state => state.slides);

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <Card
        {...attributes}
        {...listeners}
        role="button"
        tabIndex={0}
        data-slide-index={index}
        aria-label={`${getSlideTypeLabel(slide.type)} slide ${index + 1} of ${slides.length}`}
        aria-pressed={isActive}
        onClick={handleClick}
        className={cn(
          'w-[120px] h-[213px] rounded-2xl cursor-grab active:cursor-grabbing transition-all relative overflow-hidden',
          'hover:scale-105 hover:shadow-md',
          isActive && 'border-2 border-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500',
          isDragging && 'opacity-50 scale-95'
        )}
      >
        <div className="absolute inset-0 p-2 flex flex-col">
          <h3 className="font-display text-xs font-medium truncate">{getSlideTypeLabel(slide.type)}</h3>
          <span className="text-[10px] text-muted-foreground mt-auto">
            {typeof slide.duration === 'number' ? `${slide.duration}s` : slide.duration}
          </span>
        </div>
        
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-primary/10 pointer-events-none"
            />
          )}
        </AnimatePresence>
      </Card>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute -top-2 -right-2 h-11 w-11 rounded-full bg-background shadow-md"
        onClick={handleDelete}
        aria-label="Remove slide"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  // Only re-render if these critical props change
  return (
    prevProps.slide.id === nextProps.slide.id &&
    prevProps.index === nextProps.index &&
    prevProps.isActive === nextProps.isActive
  );
});
