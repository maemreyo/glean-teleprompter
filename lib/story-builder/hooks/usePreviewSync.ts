'use client';

/**
 * usePreviewSync Hook
 *
 * Synchronizes story builder state with the preview iframe via postMessage.
 * Uses debouncing (100ms) to prevent excessive updates during rapid editing.
 * Includes performance monitoring for updates exceeding 100ms threshold.
 */

import { useEffect, useRef, useMemo } from 'react';
import { useStoryBuilderStore } from '../store';
import { BuilderSlide } from '../types';
import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('usePreviewSync');

/**
 * Deep equality check for slides using JSON.stringify with caching
 * This is more efficient than comparing on every render since we cache results
 */
function areSlidesEqual(slides1: BuilderSlide[], slides2: BuilderSlide[]): boolean {
  // Quick length check
  if (slides1.length !== slides2.length) return false;

  // Check if all slide IDs match (shallow check)
  const ids1 = slides1.map(s => s.id).join(',');
  const ids2 = slides2.map(s => s.id).join(',');
  if (ids1 !== ids2) return false;

  // Deep comparison only if IDs match
  return JSON.stringify(slides1) === JSON.stringify(slides2);
}

interface PreviewMessage {
  type: 'UPDATE_STORY';
  payload: {
    slides: BuilderSlide[];
    activeSlideIndex: number | null;
  };
}

export function usePreviewSync(iframeRef: React.RefObject<HTMLIFrameElement | null>) {
  const { slides, activeSlideIndex } = useStoryBuilderStore();
  const previousSlidesRef = useRef<BuilderSlide[]>(slides);
  const previousActiveIndexRef = useRef<number | null>(activeSlideIndex);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    // Detect changes using optimized equality check
    const slidesChanged = !areSlidesEqual(slides, previousSlidesRef.current);
    const indexChanged = previousActiveIndexRef.current !== activeSlideIndex;
    const hasChanged = slidesChanged || indexChanged;

    logger.debug('State changed:', {
      hasChanged,
      slidesChanged,
      indexChanged,
      slidesCount: slides.length,
      activeSlideIndex,
      previousCount: previousSlidesRef.current.length,
      previousIndex: previousActiveIndexRef.current,
      iframeExists: !!iframeRef.current,
      iframeContentWindow: !!iframeRef.current?.contentWindow
    });

    if (!hasChanged) return;

    // Clear existing timeout to prevent multiple pending updates
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const sendUpdate = () => {
      const iframe = iframeRef.current;
      if (iframe?.contentWindow) {
        const message: PreviewMessage = {
          type: 'UPDATE_STORY',
          payload: { slides, activeSlideIndex },
        };

        try {
          iframe.contentWindow.postMessage(message, window.location.origin);
          logger.debug('Message sent successfully');
          
          if (typeof performance !== 'undefined') {
            performance.mark('preview-update-sent');
          }
        } catch (error) {
          logger.error('Failed to send postMessage:', error);
          // Could show a toast notification here if needed
          return;
        }
      }

      // Update refs
      previousSlidesRef.current = slides;
      previousActiveIndexRef.current = activeSlideIndex;
    };

    // If only the active index changed, update immediately for responsiveness
    if (!slidesChanged && indexChanged) {
      sendUpdate();
    } else {
      // Debounce content updates
      timeoutRef.current = setTimeout(sendUpdate, 100);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [slides, activeSlideIndex, iframeRef]);

  // Performance monitoring for preview updates
  // Logs warnings when updates exceed 100ms threshold
  // Helps identify performance regressions in story rendering
  useEffect(() => {
    if (typeof performance === 'undefined') return;

    const measurePerformance = () => {
      try {
        // Check if mark exists before measuring to avoid errors
        const entries = performance.getEntriesByName('preview-update-sent', 'mark');
        if (entries.length === 0) return;

        // Double-check mark exists right before measuring (in case it was cleared)
        if (!performance.getEntriesByName('preview-update-sent', 'mark').length) return;

        // Measure time from 'preview-update-sent' mark to now
        performance.measure('preview-update-latency', 'preview-update-sent');
        const measures = performance.getEntriesByName('preview-update-latency');
        if (measures.length > 0) {
          const lastMeasure = measures[measures.length - 1];
          // Log warning if update took longer than 100ms
          if (lastMeasure.duration > 100) {
            logger.warn(`Preview update exceeded 100ms threshold: ${lastMeasure.duration.toFixed(2)}ms`);
          }
        }
        // Clear marks and measures to prevent memory leaks
        performance.clearMarks();
        performance.clearMeasures();
      } catch (error) {
        // Ignore performance API errors (DOMException, etc.)
        logger.debug('Performance measurement failed:', error);
      }
    };

    // Check performance every 5 seconds
    const interval = setInterval(measurePerformance, 5000);
    return () => clearInterval(interval);
  }, []);
}
