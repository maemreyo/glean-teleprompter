'use client';

/**
 * RecordingControls Component
 * Start/stop recording button with visual feedback
 * @module components/teleprompter/camera/RecordingControls
 */

import { Play, Square, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export interface RecordingControlsProps {
  /** Whether recording is currently active */
  isRecording: boolean;
  /** Whether recording is paused */
  isPaused: boolean;
  /** Callback to start recording */
  onStart: () => void;
  /** Callback to stop recording */
  onStop: () => void;
  /** Callback to pause recording */
  onPause?: () => void;
  /** Callback to resume recording */
  onResume?: () => void;
  /** Callback to discard recording */
  onDiscard?: () => void;
  /** Current recording duration in seconds */
  duration?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function RecordingControls({
  isRecording,
  isPaused,
  onStart,
  onStop,
  onPause,
  onResume,
  onDiscard,
  duration = 0,
  disabled = false,
  className,
}: RecordingControlsProps) {
  const t = useTranslations('RecordingControls');
  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Duration Display */}
      {isRecording && (
        <div className="px-3 py-1 bg-gray-900/50 text-white rounded-lg font-mono text-sm">
          {formatDuration(duration)}
        </div>
      )}

      {/* Not Recording - Show Start Button */}
      {!isRecording && (
        <Button
          size="sm"
          variant="default"
          onClick={onStart}
          disabled={disabled}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          <Play className="w-4 h-4 mr-1" />
          {t('record')}
        </Button>
      )}

      {/* Recording - Show Stop/Pause Buttons */}
      {isRecording && (
        <>
          {onPause && onResume && (
            <Button
              size="sm"
              variant="outline"
              onClick={isPaused ? onResume : onPause}
              className="bg-white/90 hover:bg-white text-gray-900"
            >
              {isPaused ? (
                <Play className="w-4 h-4" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
            </Button>
          )}

          <Button
            size="sm"
            variant="destructive"
            onClick={onStop}
            className="bg-gray-900 hover:bg-gray-800"
          >
            <Square className="w-4 h-4 mr-1" />
            {t('stop')}
          </Button>
        </>
      )}

      {/* Discard Button (when recording is paused) */}
      {isRecording && isPaused && onDiscard && (
        <Button
          size="sm"
          variant="outline"
          onClick={onDiscard}
          className="border-red-500 text-red-500 hover:bg-red-50"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          {t('discard')}
        </Button>
      )}
    </div>
  );
}
