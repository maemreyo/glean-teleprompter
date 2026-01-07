'use client';

/**
 * ViewportWarning Component
 *
 * Displays a warning message when viewport is too small for multi-device preview.
 * Shown below 1024px width.
 */

import { AlertTriangle, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMultiDeviceStore } from '@/lib/stores/useMultiDeviceStore';
import { useViewportSize } from '@/lib/story-builder/hooks/useViewportSize';

export interface ViewportWarningProps {
  /** Minimum viewport width for multi-device mode */
  minWidth?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Warning banner for small viewports.
 *
 * Shows when viewport is below the minimum width (default 1024px).
 * Provides guidance to either rotate device or switch to single-device mode.
 */
export function ViewportWarning({
  minWidth = 1024,
  className,
}: ViewportWarningProps) {
  const { setEnabled } = useMultiDeviceStore();
  const { width: viewportWidth } = useViewportSize();
  const isTooSmall = viewportWidth < minWidth;

  if (!isTooSmall) return null;

  const handleSwitchToSingle = () => {
    setEnabled(false);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3',
        'bg-amber-500/10 border border-amber-500/20',
        'rounded-lg',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Warning icon */}
      <div className="flex-shrink-0">
        <AlertTriangle className="w-5 h-5 text-amber-500" aria-hidden="true" />
      </div>

      {/* Warning message */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-amber-200">
          <span className="font-semibold">Multi-device preview requires a larger screen.</span>
          <span className="block mt-1 text-amber-300/80">
            Rotate your device or switch to single-device preview.
          </span>
        </p>
      </div>

      {/* Action button */}
      <button
        type="button"
        onClick={handleSwitchToSingle}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-md',
          'text-xs font-medium',
          'bg-amber-500/20 text-amber-200',
          'hover:bg-amber-500/30',
          'transition-colors',
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-amber-500'
        )}
        aria-label="Switch to single device preview"
      >
        <Monitor className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Single Device</span>
      </button>

      {/* Screen reader only */}
      <span className="sr-only">
        Viewport width is {viewportWidth}px. Minimum required width is {minWidth}px.
      </span>
    </div>
  );
}
