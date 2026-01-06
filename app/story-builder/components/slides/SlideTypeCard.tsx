'use client';

import { useDraggable } from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import type { BuilderSlideType } from '@/lib/story-builder/types';
import { getSlideTypeLabel, getSlideTypeDescription } from '@/lib/story-builder/templates/slideTypes';
import { cn } from '@/lib/utils';
import { 
  ScrollText, 
  Image as ImageIcon, 
  Sparkles, 
  BarChart3, 
  LineChart,
  type LucideIcon 
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SlideTypeCardProps {
  type: BuilderSlideType;
}

export function SlideTypeCard({ type }: SlideTypeCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `type-${type}`,
    data: { type, source: 'library' },
  });

  const iconMap: Record<BuilderSlideType, LucideIcon> = {
    teleprompter: ScrollText,
    image: ImageIcon,
    'text-highlight': Sparkles,
    poll: BarChart3,
    'widget-chart': LineChart,
  };

  const Icon = iconMap[type];

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <Card
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        role="button"
        tabIndex={0}
        aria-label={`Drag ${getSlideTypeLabel(type)} slide to story rail`}
        className={cn(
          'p-3 cursor-grab active:cursor-grabbing transition-all hover:shadow-lg border-2 border-transparent hover:border-primary/10',
          isDragging && 'opacity-50 scale-95 shadow-2xl'
        )}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm">{getSlideTypeLabel(type)}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {getSlideTypeDescription(type)}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
