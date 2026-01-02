'use client';

/**
 * RecordingIndicator Component
 * Visual indicator showing recording status with blinking REC badge
 * @module components/teleprompter/camera/RecordingIndicator
 */

import { Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export interface RecordingIndicatorProps {
  /** Whether recording is active */
  isRecording: boolean;
  /** Whether recording is paused */
  isPaused: boolean;
  /** Current recording duration in seconds */
  duration?: number;
  /** Show compact version (smaller) */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function RecordingIndicator({
  isRecording,
  isPaused,
  duration = 0,
  compact = false,
  className,
}: RecordingIndicatorProps) {
  const t = useTranslations('RecordingIndicator');
  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isRecording && !isPaused) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        'bg-black/70 backdrop-blur-sm',
        'text-white font-medium',
        'px-3 py-1.5 rounded-lg',
        compact ? 'text-xs' : 'text-sm',
        className
      )}
    >
      {/* Blinking Red Circle */}
      <Circle
        className={cn(
          'fill-current text-red-500',
          !isPaused && 'animate-pulse'
        )}
        style={{ width: compact ? 8 : 10, height: compact ? 8 : 10 }}
      />

      {/* REC Text */}
      {!isPaused && <span className="text-red-500">{t('rec')}</span>}
      {isPaused && <span className="text-yellow-500">{t('paused')}</span>}

      {/* Duration */}
      {duration > 0 && (
        <span className="font-mono text-white/90">
          {formatDuration(duration)}
        </span>
      )}
    </div>
  );
}
