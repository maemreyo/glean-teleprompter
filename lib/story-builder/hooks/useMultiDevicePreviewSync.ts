'use client';

/**
 * useMultiDevicePreviewSync Hook
 *
 * Extends the single-iframe preview sync to support multiple device iframes.
 * Broadcasts story state to all device frames and tracks acknowledgments.
 * Includes performance monitoring for multi-device scenarios.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useStoryBuilderStore } from '../store';
import { BuilderSlide } from '../types';
import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('useMultiDevicePreviewSync');

/**
 * Deep equality check for slides using JSON.stringify with caching.
 * This is more efficient than comparing on every render since we cache results.
 */
function areSlidesEqual(slides1: BuilderSlide[], slides2: BuilderSlide[]): boolean {
  // Quick length check
  if (slides1.length !== slides2.length) return false;

  // Check if all slide IDs match (shallow check)
  const ids1 = slides1.map((s) => s.id).join(',');
  const ids2 = slides2.map((s) => s.id).join(',');
  if (ids1 !== ids2) return false;

  // Deep comparison only if IDs match
  return JSON.stringify(slides1) === JSON.stringify(slides2);
}

/**
 * Message sent to device iframes.
 */
export interface PreviewMessage {
  type: 'UPDATE_STORY';
  payload: {
    slides: BuilderSlide[];
    activeSlideIndex: number | null;
    deviceId?: string; // Include device ID for tracking
  };
}

/**
 * Message received from device iframes.
 */
export interface PreviewAckMessage {
  type: 'PREVIEW_ACK';
  deviceId: string;
  timestamp: number;
}

/**
 * Hook options.
 */
export interface UseMultiDevicePreviewSyncOptions {
  /** Enable performance monitoring (default: true) */
  enablePerformanceMonitoring?: boolean;
  /** Callback when all iframes have acknowledged */
  onAllAcknowledged?: (latencyMs: number) => void;
  /** Callback when an iframe fails to acknowledge */
  onAckTimeout?: (deviceId: string) => void;
  /** Timeout for acknowledgment in ms (default: 1000) */
  ackTimeout?: number;
}

/**
 * Hook for synchronizing preview state across multiple device iframes.
 *
 * @param iframeRefs - Map of device ID to iframe element refs
 * @param options - Configuration options
 */
export function useMultiDevicePreviewSync(
  iframeRefs: React.RefObject<Map<string, HTMLIFrameElement>>,
  options: UseMultiDevicePreviewSyncOptions = {}
) {
  const {
    enablePerformanceMonitoring = true,
    onAllAcknowledged,
    onAckTimeout,
    ackTimeout = 1000,
  } = options;

  const { slides, activeSlideIndex } = useStoryBuilderStore();
  const previousSlidesRef = useRef<BuilderSlide[]>(slides);
  const previousActiveIndexRef = useRef<number | null>(activeSlideIndex);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Track pending acknowledgments from iframes
  const pendingAcksRef = useRef<Set<string>>(new Set());
  const ackTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  /**
   * Broadcast a message to all iframes.
   */
  const broadcastToAll = useCallback(
    (message: PreviewMessage) => {
      const refs = iframeRefs.current;
      if (!refs || refs.size === 0) {
        logger.debug('No iframes to broadcast to');
        return;
      }

      // Start performance measurement
      if (enablePerformanceMonitoring && typeof performance !== 'undefined') {
        performance.mark('multi-device-broadcast-start');
      }

      // Mark all devices as pending acknowledgment
      pendingAcksRef.current.clear();
      refs.forEach((_, deviceId) => {
        pendingAcksRef.current.add(deviceId);
      });

      // Send message to each iframe
      refs.forEach((iframe, deviceId) => {
        const deviceMessage: PreviewMessage = {
          ...message,
          payload: {
            ...message.payload,
            deviceId,
          },
        };

        try {
          iframe.contentWindow?.postMessage(deviceMessage, window.location.origin);
          logger.debug(`Sent update to ${deviceId}`);

          // Set acknowledgment timeout
          const timeoutId = setTimeout(() => {
            if (pendingAcksRef.current.has(deviceId)) {
              logger.warn(`Acknowledgment timeout for ${deviceId}`);
              onAckTimeout?.(deviceId);
              pendingAcksRef.current.delete(deviceId);
              checkAllAcknowledged();
            }
          }, ackTimeout);

          ackTimeoutsRef.current.set(deviceId, timeoutId);
        } catch (error) {
          logger.error(`Failed to send to ${deviceId}:`, error);
          pendingAcksRef.current.delete(deviceId);
        }
      });

      checkAllAcknowledged();
    },
    [iframeRefs, enablePerformanceMonitoring, onAckTimeout, ackTimeout]
  );

  /**
   * Check if all iframes have acknowledged.
   */
  const checkAllAcknowledged = useCallback(() => {
    if (pendingAcksRef.current.size === 0) {
      // All iframes acknowledged
      if (enablePerformanceMonitoring && typeof performance !== 'undefined') {
        try {
          performance.mark('multi-device-broadcast-end');
          performance.measure(
            'multi-device-sync-latency',
            'multi-device-broadcast-start',
            'multi-device-broadcast-end'
          );

          const measures = performance.getEntriesByName(
            'multi-device-sync-latency'
          );
          if (measures.length > 0) {
            const lastMeasure = measures[measures.length - 1];
            const latencyMs = lastMeasure.duration;

            // Log warning if exceeds thresholds
            const deviceCount = iframeRefs.current?.size || 0;
            const threshold = deviceCount <= 3 ? 100 : 150;

            if (latencyMs > threshold) {
              logger.warn(
                `Multi-device sync exceeded ${threshold}ms threshold: ${latencyMs.toFixed(2)}ms`
              );
            }

            onAllAcknowledged?.(latencyMs);

            // Clean up performance marks
            performance.clearMarks('multi-device-broadcast-start');
            performance.clearMarks('multi-device-broadcast-end');
            performance.clearMeasures('multi-device-sync-latency');
          }
        } catch (error) {
          logger.debug('Performance measurement failed:', error);
        }
      }
    }
  }, [enablePerformanceMonitoring, iframeRefs, onAllAcknowledged]);

  /**
   * Handle acknowledgment messages from iframes.
   */
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin
      if (event.origin !== window.location.origin) return;

      const message = event.data as PreviewAckMessage;
      if (message.type === 'PREVIEW_ACK') {
        const { deviceId } = message;

        logger.debug(`Received acknowledgment from ${deviceId}`);

        // Clear timeout for this device
        const timeoutId = ackTimeoutsRef.current.get(deviceId);
        if (timeoutId) {
          clearTimeout(timeoutId);
          ackTimeoutsRef.current.delete(deviceId);
        }

        // Remove from pending set
        pendingAcksRef.current.delete(deviceId);

        // Check if all are done
        checkAllAcknowledged();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [checkAllAcknowledged]);

  /**
   * Sync state changes to all iframes.
   */
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
      iframeCount: iframeRefs.current?.size || 0,
    });

    if (!hasChanged) return;

    // Clear existing timeout to prevent multiple pending updates
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const sendUpdate = () => {
      const message: PreviewMessage = {
        type: 'UPDATE_STORY',
        payload: { slides, activeSlideIndex },
      };

      broadcastToAll(message);

      // Update refs
      previousSlidesRef.current = slides;
      previousActiveIndexRef.current = activeSlideIndex;
    };

    // If only the active index changed, update immediately for responsiveness
    if (!slidesChanged && indexChanged) {
      sendUpdate();
    } else {
      // Debounce content updates (100ms as per original hook)
      timeoutRef.current = setTimeout(sendUpdate, 100);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [slides, activeSlideIndex, iframeRefs, broadcastToAll]);

  /**
   * Clean up timeouts on unmount.
   */
  useEffect(() => {
    return () => {
      // Clear all acknowledgment timeouts
      ackTimeoutsRef.current.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      ackTimeoutsRef.current.clear();
      pendingAcksRef.current.clear();
    };
  }, []);

  return {
    /** Manually trigger a broadcast */
    broadcast: broadcastToAll,
    /** Number of iframes currently syncing */
    iframeCount: iframeRefs.current?.size || 0,
    /** Number of pending acknowledgments */
    pendingAcks: pendingAcksRef.current.size,
  };
}
