"use client";

/**
 * Teleprompter Content Component
 *
 * Displays scrollable teleprompter text content with:
 * - Top/bottom gradient overlays (35vh each)
 * - Mirror mode support (scaleX(-1))
 * - Font size adjustment
 * - GPU acceleration for smooth scrolling
 * - Text selection disabled during scrolling
 *
 * @feature 012-standalone-story
 */

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useTeleprompterStore } from '@/lib/stores/useTeleprompterStore';
import { FocalPointIndicator } from './FocalPointIndicator';

interface TeleprompterContentProps {
  content: string;
  onScrollProgress?: (depth: number) => void;
  onScrollComplete?: () => void;
  className?: string;
  /** Optional focal point position (0-100) to override store default */
  focalPoint?: number;
  /** Optional font size in pixels to override store default */
  fontSize?: number;
  /** Optional text alignment to override store default */
  textAlign?: 'left' | 'center' | 'right';
  /** Optional line height multiplier to override store default */
  lineHeight?: number;
  /** Optional letter spacing in pixels to override store default */
  letterSpacing?: number;
  /** Optional scroll speed preset to override store default */
  scrollSpeed?: 'slow' | 'medium' | 'fast';
  /** Optional horizontal mirror mode to override store default */
  mirrorHorizontal?: boolean;
  /** Optional vertical mirror mode to override store default */
  mirrorVertical?: boolean;
  /** Optional background color to override store default */
  backgroundColor?: string;
  /** Optional background opacity (0-100) to override store default */
  backgroundOpacity?: number;
  /** Optional safe area padding to override store default */
  safeAreaPadding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

export interface TeleprompterContentHandle {
  getScrollContainer: () => HTMLElement | null;
}

/**
 * Scrollable teleprompter content area
 */
function TeleprompterContentFunction(
  {
    content,
    onScrollProgress,
    onScrollComplete,
    className = '',
    focalPoint,
    fontSize: fontSizeProp,
    textAlign = 'left',
    lineHeight = 1.4,
    letterSpacing = 0,
    scrollSpeed = 'medium',
    mirrorHorizontal = false,
    mirrorVertical = false,
    backgroundColor = '#000000',
    backgroundOpacity = 100,
    safeAreaPadding = { top: 0, right: 0, bottom: 0, left: 0 }
  }: TeleprompterContentProps,
  ref: React.Ref<TeleprompterContentHandle>
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { fontSize: storeFontSize, isMirrored } = useTeleprompterStore();
  
  // Use prop value if provided, otherwise fall back to store
  const fontSize = fontSizeProp !== undefined ? fontSizeProp : storeFontSize;

  // Calculate scroll speed multiplier
  const scrollSpeedMultiplier = scrollSpeed === 'slow' ? 0.5 : scrollSpeed === 'fast' ? 2 : 1;

  // Calculate background color with opacity
  const bgColor = backgroundColor || '#000000';
  const bgOpacity = Math.max(0, Math.min(100, backgroundOpacity)) / 100;
  
  // Parse hex color and apply opacity
  const applyOpacity = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const finalBackgroundColor = applyOpacity(bgColor, bgOpacity);

  // Calculate mirror transform
  const getMirrorTransform = () => {
    const transforms = [];
    if (mirrorHorizontal) transforms.push('scaleX(-1)');
    if (mirrorVertical) transforms.push('scaleY(-1)');
    if (transforms.length === 0 && isMirrored) transforms.push('scaleX(-1)');
    return transforms.join(' ') || 'none';
  };

  // Apply safe area padding
  const { top: padTop = 0, right: padRight = 0, bottom: padBottom = 0, left: padLeft = 0 } = safeAreaPadding;

  /**
   * Expose the scroll container to parent
   */
  useImperativeHandle(ref, () => ({
    getScrollContainer: () => containerRef.current?.querySelector('[data-scroll-container]') || null,
  }));

  /**
   * Handle manual scroll events
   */
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollableDiv = container.querySelector('[data-scroll-container]') as HTMLElement;
    if (!scrollableDiv) return;

    const scrollTop = scrollableDiv.scrollTop;
    const scrollHeight = scrollableDiv.scrollHeight;
    const viewportHeight = scrollableDiv.clientHeight;

    // Calculate scroll depth
    const maxScroll = scrollHeight - viewportHeight;
    const depth = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;

    onScrollProgress?.(depth);
  }, [onScrollProgress]);

  /**
   * Disable text selection during scrolling
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleSelectStart = (e: Event) => {
      e.preventDefault();
    };

    container.addEventListener('selectstart', handleSelectStart);

    return () => {
      container.removeEventListener('selectstart', handleSelectStart);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ backgroundColor: finalBackgroundColor }}
      role="region"
      aria-label="Teleprompter content"
      aria-live="polite"
    >
      {/* Top gradient overlay */}
      <div
        className="absolute top-0 left-0 right-0 h-[35vh] bg-gradient-to-b from-black via-black/80 to-transparent pointer-events-none z-10"
        aria-hidden="true"
      />

      {/* Bottom gradient overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[35vh] bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-10"
        aria-hidden="true"
      />

      {/* Focal point indicator */}
      <FocalPointIndicator focalPoint={focalPoint} />

      {/* Scrollable content */}
      <div
        data-scroll-container
        className="relative w-full h-full overflow-y-auto overflow-x-hidden"
        style={{
          // Mirror mode + GPU acceleration
          transform: `${getMirrorTransform()} translateZ(0)`,
        }}
        onScroll={handleScroll}
      >
        <div
          className="text-white"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: lineHeight,
            textAlign: textAlign,
            letterSpacing: `${letterSpacing}px`,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            userSelect: 'none',
            paddingTop: `${padTop}px`,
            paddingRight: `${padRight}px`,
            paddingBottom: `${padBottom}px`,
            paddingLeft: `${padLeft}px`,
            // GPU acceleration
            transform: 'translateZ(0)',
          }}
        >
          {content}
        </div>
      </div>
    </div>
  );
}

TeleprompterContentFunction.displayName = 'TeleprompterContent';

export const TeleprompterContent = forwardRef<
  TeleprompterContentHandle,
  TeleprompterContentProps
>(TeleprompterContentFunction);
