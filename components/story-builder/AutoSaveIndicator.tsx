'use client';

import { Save, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SaveStatus } from '@/lib/story-builder/types';

interface AutoSaveIndicatorProps {
  status: SaveStatus;
  className?: string;
}

export function AutoSaveIndicator({ status, className }: AutoSaveIndicatorProps) {
  const indicators = {
    saved: {
      icon: Save,
      label: 'Saved',
      color: 'text-green-500',
      animate: false,
    },
    saving: {
      icon: Loader2,
      label: 'Saving...',
      color: 'text-blue-500',
      animate: true,
    },
    unsaved: {
      icon: Save,
      label: 'Unsaved',
      color: 'text-muted-foreground',
      animate: false,
    },
    error: {
      icon: AlertCircle,
      label: 'Save failed',
      color: 'text-destructive',
      animate: false,
    },
  };

  const { icon: Icon, label, color, animate } = indicators[status];

  return (
    <div className={cn('flex items-center gap-2 text-xs', color, className)}>
      <Icon className={cn('w-4 h-4', animate && 'animate-spin')} />
      <span>{label}</span>
    </div>
  );
}
