'use client';

import { useDraggable } from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import type { BuilderSlideType } from '@/lib/story-builder/types';
import { getSlideTypeLabel, getSlideTypeDescription } from '@/lib/story-builder/templates/slideTypes';
import { cn } from '@/lib/utils';

interface SlideTypeCardProps {
  type: BuilderSlideType;
}

export function SlideTypeCard({ type }: SlideTypeCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `type-${type}`,
    data: { type, source: 'library' },
  });

  const icons: Record<BuilderSlideType, string> = {
    teleprompter: '📝',
    image: '🖼️',
    'text-highlight': '✨',
    poll: '📊',
    'widget-chart': '📈',
  };

  return (
    <Card
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'p-3 cursor-grab active:cursor-grabbing transition-all hover:shadow-md',
        isDragging && 'opacity-50 scale-95'
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icons[type]}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm">{getSlideTypeLabel(type)}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {getSlideTypeDescription(type)}
          </p>
        </div>
      </div>
    </Card>
  );
}
