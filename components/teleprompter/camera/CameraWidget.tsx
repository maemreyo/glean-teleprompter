'use client';

/**
 * CameraWidget Component
 * Main camera widget with mirrored video display and integration hooks
 * @module components/teleprompter/camera/CameraWidget
 */

import { useEffect, useRef } from 'react';
import { Camera, CameraOff, Loader2 } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface CameraWidgetProps {
  /** Whether the camera widget is visible */
  isVisible: boolean;
  /** Callback when camera is toggled on/off */
  onToggle?: () => void;
  /** Whether the video should be mirrored (default: true) */
  mirrored?: boolean;
  /** Recording quality preset */
  quality?: 'standard' | 'reduced';
  /** Additional CSS classes for styling */
  className?: string;
}

export function CameraWidget({
  isVisible,
  onToggle,
  mirrored = true,
  quality = 'standard',
  className,
}: CameraWidgetProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const {
    stream,
    isActive,
    isLoading,
    error,
    hasPermission,
    requestPermissions,
    stopCamera,
    clearError,
  } = useCamera({ quality, includeAudio: true });

  // Attach stream to video element when available
  useEffect(() => {
    const video = videoRef.current;
    if (video && stream) {
      video.srcObject = stream;
      video.play().catch(console.error);
    }

    return () => {
      if (video) {
        video.srcObject = null;
      }
    };
  }, [stream]);

  // Start camera when widget becomes visible
  useEffect(() => {
    if (isVisible && hasPermission !== false) {
      requestPermissions();
    } else if (!isVisible) {
      stopCamera();
    }
  }, [isVisible, hasPermission, requestPermissions, stopCamera]);

  const handleToggle = () => {
    clearError();
    if (isActive) {
      stopCamera();
    }
    onToggle?.();
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'relative bg-black rounded-2xl overflow-hidden shadow-lg',
        'border-2',
        error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700',
        className
      )}
      style={{ width: '240px', height: '320px' }}
    >
      {/* Video Preview with Mirroring */}
      <video
        ref={videoRef}
        className={cn(
          'w-full h-full object-cover',
          mirrored && 'scale-x-[-1]'
        )}
        muted
        playsInline
        autoPlay
      />

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}

      {/* Permission Denied State */}
      {hasPermission === false && !isActive && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 text-white p-4 text-center z-10">
          <CameraOff className="w-12 h-12 mb-2 text-red-400" />
          <p className="text-sm font-medium">Camera Access Required</p>
          <p className="text-xs text-gray-400 mt-1">Please enable camera permissions in your browser</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-4 bg-white/10 hover:bg-white/20 text-white border-white/20"
            onClick={() => requestPermissions()}
          >
            Request Permission
          </Button>
        </div>
      )}

      {/* Inactive State */}
      {!isActive && !isLoading && hasPermission !== false && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
          <Camera className="w-12 h-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-300">Camera Off</p>
        </div>
      )}

      {/* Error State Overlay */}
      {error && isActive && (
        <div className="absolute top-2 left-2 right-2 bg-red-500/95 text-white text-xs px-3 py-2 rounded-lg z-20">
          <p className="font-medium">{error.userMessage}</p>
        </div>
      )}

      {/* Camera Toggle Button */}
      <div className="absolute bottom-2 left-2 right-2 z-20">
        <Button
          size="sm"
          variant={isActive ? 'destructive' : 'default'}
          onClick={handleToggle}
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : isActive ? (
            <CameraOff className="w-4 h-4 mr-2" />
          ) : (
            <Camera className="w-4 h-4 mr-2" />
          )}
          {isActive ? 'Stop Camera' : 'Start Camera'}
        </Button>
      </div>
    </div>
  );
}
