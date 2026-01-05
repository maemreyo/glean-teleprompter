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
}

export interface TeleprompterContentHandle {
  getScrollContainer: () => HTMLElement | null;
}

/**
 * Scrollable teleprompter content area
 */
function TeleprompterContentFunction(
  { content, onScrollProgress, onScrollComplete, className = '' }: TeleprompterContentProps,
  ref: React.Ref<TeleprompterContentHandle>
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { fontSize, isMirrored } = useTeleprompterStore();

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
      className={`relative w-full h-full overflow-hidden bg-black ${className}`}
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
      <FocalPointIndicator />

      {/* Scrollable content */}
      <div
        data-scroll-container
        className="relative w-full h-full overflow-y-auto overflow-x-hidden"
        style={{
          // Mirror mode + GPU acceleration
          transform: isMirrored ? 'scaleX(-1) translateZ(0)' : 'translateZ(0)',
        }}
        onScroll={handleScroll}
      >
        <div
          className="px-8 py-12"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            userSelect: 'none',
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
