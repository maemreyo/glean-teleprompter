'use client';

/**
 * BaseCamera Component
 * Core camera widget component providing video preview and basic controls
 * @module components/teleprompter/camera/BaseCamera
 */

import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface BaseCameraProps {
  /** Whether the camera is currently active */
  isActive: boolean;
  /** Callback when camera is toggled on/off */
  onToggle: () => void;
  /** Additional CSS classes for styling */
  className?: string;
  /** Whether the video should be mirrored (default: true) */
  mirrored?: boolean;
  /** Optional error state */
  error?: string | null;
}

export function BaseCamera({
  isActive,
  onToggle,
  className,
  mirrored = true,
  error,
}: BaseCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Request camera access when component becomes active
  useEffect(() => {
    if (isActive && hasPermission !== false) {
      startCamera();
    } else if (!isActive) {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const startCamera = async () => {
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleToggle = () => {
    if (isActive) {
      stopCamera();
    }
    onToggle();
  };

  return (
    <div
      className={cn(
        'relative bg-black rounded-2xl overflow-hidden',
        'border-2 border-gray-200 dark:border-gray-700',
        className
      )}
      style={{ width: '240px', height: '320px' }}
    >
      {/* Video Preview */}
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
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}

      {/* Permission Denied State */}
      {hasPermission === false && !isActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 text-white p-4 text-center">
          <CameraOff className="w-12 h-12 mb-2 text-red-400" />
          <p className="text-sm">Camera access denied</p>
          <p className="text-xs text-gray-400 mt-1">Please enable camera permissions</p>
        </div>
      )}

      {/* Inactive State */}
      {!isActive && !isLoading && hasPermission !== false && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
          <Camera className="w-12 h-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-300">Camera Off</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute top-2 left-2 right-2 bg-red-500/90 text-white text-xs px-2 py-1 rounded">
          {error}
        </div>
      )}

      {/* Camera Toggle Button */}
      <div className="absolute bottom-2 left-2 right-2">
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
