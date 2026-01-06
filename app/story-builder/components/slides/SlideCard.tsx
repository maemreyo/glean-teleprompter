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
import { X, FileText, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useStoryBuilderStore } from '@/lib/story-builder/store';
import { SLIDE_TYPES } from '@/lib/story-builder/templates/slideTypes';

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
          'w-[120px] h-[180px] rounded-2xl cursor-grab active:cursor-grabbing transition-all relative overflow-hidden border-2',
          'hover:scale-105 hover:shadow-xl hover:border-primary/20',
          isActive ? 'border-transparent bg-origin-border bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-[2px]' : 'border-muted',
          isDragging && 'opacity-50 scale-95 shadow-2xl ring-4 ring-primary/20'
        )}
      >
        <div className={cn(
          "w-full h-full rounded-[14px] p-3 flex flex-col gap-2",
          isActive ? "bg-card/90 backdrop-blur-sm" : "bg-card"
        )}>
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-6 h-6 rounded-md flex items-center justify-center shrink-0",
              "bg-gradient-to-br from-purple-500/10 to-pink-500/10 text-primary"
            )}>
              {slide.type === 'teleprompter' || slide.type === 'text-highlight' ? <FileText className="w-3.5 h-3.5" /> :
               slide.type === 'image' ? <ImageIcon className="w-3.5 h-3.5" /> :
               <MessageSquare className="w-3.5 h-3.5" />}
            </div>
            <h3 className="font-display text-xs font-bold truncate tracking-tight uppercase opacity-70 italic">{getSlideTypeLabel(slide.type)}</h3>
          </div>

          <div className="flex-1 overflow-hidden relative group/preview">
            {slide.type === 'image' && (slide as any).content ? (
              <div className="w-full h-full rounded-lg bg-muted overflow-hidden">
                <img 
                  src={(slide as any).content} 
                  alt="Slide preview" 
                  className="w-full h-full object-cover opacity-80 group-hover/preview:opacity-100 transition-opacity"
                />
              </div>
            ) : (
              <div className="w-full h-full rounded-lg bg-muted/30 p-2 border border-muted-foreground/5 overflow-hidden">
                <p className="text-[10px] leading-relaxed text-muted-foreground line-clamp-6 break-words">
                  {slide.type === 'poll' ? (slide as any).question || 'No question set' :
                   slide.type === 'widget-chart' ? (slide as any).data?.title || 'Chart slide' :
                   (slide as any).content || 'Empty slide'}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center px-0.5">
            <span className="text-[10px] text-muted-foreground font-medium bg-muted/50 px-1.5 py-0.5 rounded-full">
              {typeof slide.duration === 'number' ? `${slide.duration}s` : slide.duration}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground/30 italic">#{index + 1}</span>
          </div>
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
