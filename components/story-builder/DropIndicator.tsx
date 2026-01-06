'use client';

import { cn } from '@/lib/utils';

interface DropIndicatorProps {
  position?: 'before' | 'after';
  className?: string;
}

export function DropIndicator({ position = 'before', className }: DropIndicatorProps) {
  return (
    <div
      className={cn(
        'h-0.5 bg-primary rounded-full transition-all',
        position === 'before' && '-mt-0.5',
        position === 'after' && '-mb-0.5',
        className
      )}
      style={{ width: '100%' }}
    />
  );
}
