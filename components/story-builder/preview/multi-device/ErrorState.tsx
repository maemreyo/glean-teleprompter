'use client';

/**
 * ErrorState Component
 *
 * Displays an error state when device preview fails to load or sync.
 * Includes retry functionality with exponential backoff.
 */

import { useState, useCallback } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface ErrorStateProps {
  /** Additional CSS classes */
  className?: string;
  /** Error message to display */
  error: string;
  /** Number of retry attempts made */
  retryCount?: number;
  /** Maximum retry attempts */
  maxRetries?: number;
  /** Callback when user clicks retry */
  onRetry?: () => void;
}

/**
 * Error state display with retry button.
 *
 * Shows error icon, message, and retry button with loading state.
 * Tracks retry attempts and disables button after max retries.
 */
export function ErrorState({
  className,
  error,
  retryCount = 0,
  maxRetries = 3,
  onRetry,
}: ErrorStateProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const canRetry = retryCount < maxRetries;

  const handleRetry = useCallback(async () => {
    if (!canRetry || isRetrying || !onRetry) return;

    setIsRetrying(true);

    try {
      await onRetry();
      toast.success('Preview reloaded successfully');
    } catch (err) {
      toast.error('Failed to reload preview. Please try again.');
    } finally {
      setIsRetrying(false);
    }
  }, [canRetry, isRetrying, onRetry]);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4',
        'p-6 text-center',
        'bg-neutral-900/50',
        'rounded-2xl',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      {/* Error icon */}
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10">
        <AlertCircle className="w-6 h-6 text-red-500" aria-hidden="true" />
      </div>

      {/* Error message */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-neutral-300">
          Preview Unavailable
        </h3>
        <p className="text-xs text-neutral-500 max-w-[200px]">{error}</p>
      </div>

      {/* Retry button */}
      {canRetry && onRetry && (
        <button
          type="button"
          onClick={handleRetry}
          disabled={isRetrying}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg',
            'text-sm font-medium transition-colors',
            'bg-neutral-800 text-neutral-300',
            'hover:bg-neutral-700',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-neutral-600'
          )}
          aria-label={isRetrying ? 'Retrying...' : 'Retry loading preview'}
        >
          <RefreshCw
            className={cn(
              'w-4 h-4',
              isRetrying && 'animate-spin'
            )}
            aria-hidden="true"
          />
          <span>{isRetrying ? 'Retrying...' : 'Retry'}</span>
        </button>
      )}

      {/* Retry count indicator */}
      {retryCount > 0 && (
        <p className="text-xs text-neutral-600">
          Retry attempt {retryCount} of {maxRetries}
        </p>
      )}

      {/* Screen reader announcement */}
      <span className="sr-only">
        Error loading device preview: {error}
        {canRetry && '. Click retry button to attempt loading again.'}
      </span>
    </div>
  );
}
