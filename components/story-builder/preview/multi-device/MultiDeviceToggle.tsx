'use client';

/**
 * MultiDeviceToggle Component
 *
 * Toggle button for switching between single and multi-device preview modes.
 */

import { Monitor, Grid3x3 } from 'lucide-react';
import { useMultiDeviceStore } from '@/lib/stores/useMultiDeviceStore';
import { cn } from '@/lib/utils';

export interface MultiDeviceToggleProps {
  /** Additional CSS classes */
  className?: string;
  /** Display size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Label text override */
  label?: string;
}

/**
 * Toggle button for multi-device preview mode.
 *
 * Shows:
 * - Grid icon when multi-device is enabled
 * - Single monitor icon when in single-device mode
 * - Active state styling
 * - Accessible button label
 */
export function MultiDeviceToggle({
  className,
  size = 'md',
  label,
}: MultiDeviceToggleProps) {
  const { enabled, setEnabled } = useMultiDeviceStore();

  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-6 text-lg',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const handleToggle = () => {
    setEnabled(!enabled);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        'inline-flex items-center gap-2 font-medium transition-all duration-200',
        'rounded-lg border',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400',
        // Inactive state
        !enabled && 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:border-neutral-600',
        // Active state
        enabled && 'bg-neutral-100 border-neutral-200 text-neutral-900 hover:bg-neutral-200',
        sizeClasses[size],
        className
      )}
      aria-pressed={enabled}
      aria-label={label || (enabled ? 'Disable multi-device preview' : 'Enable multi-device preview')}
    >
      {/* Icon */}
      {enabled ? (
        <Grid3x3 className="shrink-0" size={iconSizes[size]} aria-hidden="true" />
      ) : (
        <Monitor className="shrink-0" size={iconSizes[size]} aria-hidden="true" />
      )}

      {/* Label */}
      <span>{label || (enabled ? 'Multi-Device' : 'Single Device')}</span>

      {/* Screen reader status */}
      <span className="sr-only">
        {enabled ? 'Multi-device preview is enabled' : 'Single device preview is enabled'}
      </span>
    </button>
  );
}
