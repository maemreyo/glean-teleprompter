'use client';

/**
 * SlideCard Component (Memoized)
 *
 * Displays a thumbnail card for a single slide in the story rail.
 * Wrapped with React.memo to prevent unnecessary re-renders during
 * sibling slide updates or drag operations.
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
    removeSlide(index);
  };

  const handleClick = () => {
    setActiveSlide(index);
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <Card
        {...attributes}
        {...listeners}
        onClick={handleClick}
        className={cn(
          'w-32 h-20 cursor-grab active:cursor-grabbing transition-all relative overflow-hidden',
          isActive && 'ring-2 ring-primary',
          isDragging && 'opacity-50 scale-95'
        )}
      >
        <div className="absolute inset-0 p-2 flex flex-col">
          <span className="text-xs font-medium truncate">{getSlideTypeLabel(slide.type)}</span>
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
});
