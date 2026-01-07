'use client';

/**
 * LoadingIndicator Component
 *
 * Shows a loading spinner while device preview content is being loaded.
 */

import { cn } from '@/lib/utils';

export interface LoadingIndicatorProps {
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Optional message */
  message?: string;
}

/**
 * Loading indicator with spinner and optional message.
 */
export function LoadingIndicator({
  className,
  size = 'md',
  message,
}: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 border-2',
    md: 'w-12 h-12 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        'text-neutral-400',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={message || 'Loading preview'}
    >
      {/* Spinner */}
      <div
        className={cn(
          'animate-spin rounded-full border-neutral-700 border-t-white',
          sizeClasses[size]
        )}
      />

      {/* Optional message */}
      {message && (
        <p className="text-sm font-medium text-neutral-500">{message}</p>
      )}

      {/* Screen reader only text */}
      <span className="sr-only">Loading device preview</span>
    </div>
  );
}
