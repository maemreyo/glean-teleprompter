'use client';

/**
 * usePreviewSync Hook
 *
 * Synchronizes story builder state with the preview iframe via postMessage.
 * Uses debouncing (100ms) to prevent excessive updates during rapid editing.
 * Includes performance monitoring for updates exceeding 100ms threshold.
 */

import { useEffect, useRef } from 'react';
import { useStoryBuilderStore } from '../store';
import { BuilderSlide } from '../types';

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
    // Shallow comparison to detect changes in slides or active index
    // Compare length and slide IDs for efficient change detection
    const hasChanged =
      slides.length !== previousSlidesRef.current.length ||
      slides.some((slide, index) => slide.id !== previousSlidesRef.current[index]?.id) ||
      previousActiveIndexRef.current !== activeSlideIndex;

    if (!hasChanged) return;

    // Clear existing timeout to prevent multiple pending updates
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce updates to 100ms threshold
    // This prevents excessive iframe updates during rapid editing
    timeoutRef.current = setTimeout(() => {
      const iframe = iframeRef.current;
      if (iframe?.contentWindow) {
        const message: PreviewMessage = {
          type: 'UPDATE_STORY',
          payload: { slides, activeSlideIndex },
        };
        // Send update to preview iframe via postMessage
        // Use specific origin for security (must match story-preview page)
        iframe.contentWindow.postMessage(message, window.location.origin);
        
        // Mark performance measurement point
        // Used by performance monitoring below to detect slow updates
        if (typeof performance !== 'undefined') {
          performance.mark('preview-update-sent');
        }
      }

      // Update refs to prevent duplicate updates (only if changed)
      if (hasChanged) {
        previousSlidesRef.current = slides;
        previousActiveIndexRef.current = activeSlideIndex;
      }
    }, 100);

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
      // Measure time from 'preview-update-sent' mark to now
      performance.measure('preview-update-latency', 'preview-update-sent');
      const measures = performance.getEntriesByName('preview-update-latency');
      if (measures.length > 0) {
        const lastMeasure = measures[measures.length - 1];
        // Log warning if update took longer than 100ms
        if (lastMeasure.duration > 100) {
          console.warn(`Preview update exceeded 100ms threshold: ${lastMeasure.duration.toFixed(2)}ms`);
        }
        // Clear marks and measures to prevent memory leaks
        performance.clearMarks();
        performance.clearMeasures();
      }
    };

    // Check performance every 5 seconds
    const interval = setInterval(measurePerformance, 5000);
    return () => clearInterval(interval);
  }, []);
}
