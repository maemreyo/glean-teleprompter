'use client';

/**
 * DeviceChrome Component
 *
 * Visual frame styling for device previews that mimics device hardware.
 * Provides a realistic device frame around the preview iframe.
 */

import { cn } from '@/lib/utils';
import type { DeviceType } from '@/lib/story-builder/multi-device/deviceRegistry';

export interface DeviceChromeProps {
  /** Device type for chrome styling */
  device: DeviceType;
  /** Additional CSS classes */
  className?: string;
  /** Child elements (typically the iframe) */
  children: React.ReactNode;
}

/**
 * Device frame chrome with realistic device styling.
 *
 * The chrome includes:
 * - Rounded corners mimicking device bezels
 * - Subtle shadow for depth
 * - Device-specific aspect ratio
 * - Scale-aware sizing for larger devices
 */
export function DeviceChrome({ device, className, children }: DeviceChromeProps) {
  const { width, height, scale, category } = device;

  // Calculate aspect ratio for responsive sizing
  const aspectRatio = `${width}/${height}`;

  // Category-specific styling
  const isMobile = category === 'mobile';
  const isTablet = category === 'tablet';
  const isDesktop = category === 'desktop';

  // Border radius based on device type
  const borderRadius = isMobile ? '2.5rem' : isTablet ? '1.5rem' : '0.75rem';

  // Padding (bezel size)
  const padding = isMobile ? '12px' : isTablet ? '16px' : '8px';

  // Max width for display to prevent devices from being too large
  const getMaxWidth = () => {
    if (isDesktop) return '100%'; // Desktop fills container
    if (isTablet) return `${width * scale}px`; // Tablet uses scaled width
    return `${Math.min(width * scale, 320)}px`; // Mobile capped at 320px
  };

  return (
    <div
      className={cn(
        // Base frame styles
        'relative bg-neutral-900 shadow-2xl',
        'border border-neutral-800',
        // Responsive sizing
        'w-full',
        // Device-specific styling
        isMobile && 'rounded-[40px]',
        isTablet && 'rounded-3xl',
        isDesktop && 'rounded-xl',
        // Custom overrides
        className
      )}
      style={{
        maxWidth: getMaxWidth(),
        aspectRatio,
        // Add device-specific padding for bezel effect
        padding,
      }}
      data-device-id={device.id}
      data-device-category={category}
    >
      {/* Inner frame for screen */}
      <div
        className={cn(
          'relative w-full h-full bg-black overflow-hidden',
          'rounded-[2.5rem]', // Screen radius
          isDesktop && 'rounded-lg'
        )}
      >
        {children}

        {/* Screen reflection effect */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/5 to-transparent rounded-inherit" />
      </div>

      {/* Device notch/camera indicator for mobile devices */}
      {isMobile && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full z-10 flex items-center justify-center">
          <div className="w-2 h-2 bg-neutral-800 rounded-full" />
        </div>
      )}
    </div>
  );
}
