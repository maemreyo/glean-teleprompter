'use client';

/**
 * DeviceFrame Component
 *
 * Reusable component for rendering a single device preview.
 * Combines device chrome, iframe, loading state, and error handling.
 * Supports drag-and-drop for device reordering.
 * @feature 015-multi-device-matrix
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DeviceChrome } from './DeviceChrome';
import { LoadingIndicator } from './LoadingIndicator';
import { ErrorState } from './ErrorState';
import type { DeviceType } from '@/lib/story-builder/multi-device/deviceRegistry';
import { PreviewAckMessage } from '@/lib/story-builder/hooks/useMultiDevicePreviewSync';
import { createLogger } from '@/lib/utils/logger';
import { cn } from '@/lib/utils';

const logger = createLogger('DeviceFrame');

export interface DeviceFrameProps {
  /** Device type to render */
  device: DeviceType;
  /** URL for the preview iframe */
  previewUrl: string;
  /** Unique identifier for this frame instance */
  frameId: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show device chrome (default: true) */
  showChrome?: boolean;
  /** Whether drag-and-drop is enabled (default: false) */
  isDragEnabled?: boolean;
  /** Callback to register iframe with parent */
  onIframeRef?: (deviceId: string, iframe: HTMLIFrameElement | null) => void;
}

type FrameState = 'loading' | 'ready' | 'error';

/**
 * Draggable device frame with loading/error states and retry logic.
 *
 * Handles:
 * - iframe loading with timeout
 * - postMessage acknowledgment tracking
 * - Error recovery with exponential backoff
 * - Retry state machine (max 3 attempts)
 * - Drag-and-drop with visual feedback
 */
export function DeviceFrame({
  device,
  previewUrl,
  frameId,
  className,
  showChrome = true,
  isDragEnabled = false,
  onIframeRef,
}: DeviceFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [frameState, setFrameState] = useState<FrameState>('loading');
  const [error, setError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  // Register iframe with parent when ref changes
  useEffect(() => {
    if (onIframeRef && iframeRef.current) {
      onIframeRef(device.id, iframeRef.current);
    }
    return () => {
      if (onIframeRef) {
        onIframeRef(device.id, null);
      }
    };
  }, [device.id, onIframeRef]);

  // Setup drag-and-drop if enabled
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: device.id,
    disabled: !isDragEnabled 
  });

  // Handle iframe error
  const handleError = useCallback((errorMessage: string) => {
    logger.error(`Iframe error for ${device.id}:`, errorMessage);
    setFrameState('error');
    setError(errorMessage);
  }, [device.id]);

  // Handle iframe load
  const handleLoad = useCallback(() => {
    logger.debug(`Iframe loaded for ${device.id}`);
    setFrameState('ready');
    setRetryCount(0);

    // Send acknowledgment to parent
    if (iframeRef.current?.contentWindow) {
      const ackMessage: PreviewAckMessage = {
        type: 'PREVIEW_ACK',
        deviceId: device.id,
        timestamp: Date.now(),
      };

      try {
        window.parent.postMessage(ackMessage, window.location.origin);
      } catch (err) {
        logger.warn('Failed to send acknowledgment:', err);
      }
    }
  }, [device.id]);

  // Track iframe load timeout (increased to 30 seconds for slower connections)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (frameState === 'loading') {
        handleError('Preview load timeout. Please check your connection.');
      }
    }, 30000); // 30 second timeout

    return () => clearTimeout(timeoutId);
  }, [frameState, handleError]);

  // Retry logic with exponential backoff
  const handleRetry = useCallback(async () => {
    if (retryCount >= 3) return;

    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    setFrameState('loading');

    // Exponential backoff: 1s, 2s, 4s
    const delay = Math.pow(2, newRetryCount - 1) * 1000;

    await new Promise((resolve) => setTimeout(resolve, delay));

    // Force iframe reload
    if (iframeRef.current) {
      iframeRef.current.src = previewUrl;
    }
  }, [retryCount, previewUrl]);

  // Render frame content based on state
  const renderContent = () => {
    // Show loading indicator
    if (frameState === 'loading') {
      return <LoadingIndicator size="lg" message="Loading preview..." />;
    }

    // Show error state
    if (frameState === 'error') {
      return (
        <ErrorState
          error={error}
          retryCount={retryCount}
          maxRetries={3}
          onRetry={handleRetry}
        />
      );
    }

    // Show iframe
    return (
      <iframe
        ref={iframeRef}
        src={previewUrl}
        title={`${device.name} preview`}
        className="w-full h-full border-0"
        onLoad={handleLoad}
        onError={() => handleError('Failed to load preview')}
        sandbox="allow-same-origin allow-scripts allow-forms"
        aria-label={`${device.name} teleprompter preview`}
      />
    );
  };

  const content = renderContent();

  // Build styles for drag state
  const style = transform && isDragEnabled
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
      }
    : undefined;

  // Cursor style based on drag state
  const cursorClass = isDragEnabled ? 'cursor-move touch-none' : '';

  // Wrap in device chrome if enabled
  if (showChrome) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'flex items-center justify-center',
          cursorClass,
          isDragging && 'opacity-50',
          className
        )}
        data-device-frame={device.id}
        {...(isDragEnabled ? attributes : {})}
        {...(isDragEnabled ? listeners : {})}
      >
        <DeviceChrome device={device}>
          {/* Drag handle indicator */}
          {isDragEnabled && (
            <div className="absolute top-2 left-2 p-1 bg-white dark:bg-gray-800 rounded shadow opacity-0 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing" aria-label="Drag to reorder">
              <svg 
                className="w-4 h-4 text-gray-600 dark:text-gray-400" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M7 2a2 2 0 1 0-.4 4H2a2 2 0 0 0 0 4h4.6a2 2 0 1 0 .4-4M0 9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V9zm3.5 2a1.5 1.5 0 1 0 3 0v7a1.5 1.5 0 1 0-3 0V4zm7 0a1.5 1.5 0 1 1 3 0v7a1.5 1.5 0 1 1-3 0V4z" />
              </svg>
            </div>
          )}
          {content}
        </DeviceChrome>
      </div>
    );
  }

  // Render without chrome
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative w-full h-full bg-black rounded-2xl overflow-hidden',
        cursorClass,
        isDragging && 'opacity-50',
        className
      )}
      data-device-frame={device.id}
      {...(isDragEnabled ? attributes : {})}
      {...(isDragEnabled ? listeners : {})}
    >
      {content}
    </div>
  );
}
