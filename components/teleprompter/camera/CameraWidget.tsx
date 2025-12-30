import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Loader2, Mic, MicOff, X, GripHorizontal } from 'lucide-react';
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
  const [isHovered, setIsHovered] = useState(false);

  const {
    stream,
    isActive,
    isLoading,
    error,
    hasPermission,
    requestPermissions,
    stopCamera,
    clearError,
    toggleAudio,
    toggleVideo,
    isAudioEnabled,
    isVideoEnabled,
  } = useCamera({ quality, includeAudio: true });

  // Attach stream to video element when available
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    let isAborted = false;

    console.log('[CameraWidget] Setting up stream', {
      streamId: stream.id,
      videoElement: !!video,
      videoState: video.readyState
    });

    const playVideo = async () => {
      try {
        video.srcObject = stream;
        
        // Wait for metadata to ensure video is ready
        if (video.readyState < 1) { // HAVE_METADATA
             await new Promise((resolve) => {
                 video.onloadedmetadata = () => resolve(true);
             });
        }
        
        if (isAborted) return;

        console.log('[CameraWidget] Attempting play()', {
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight
        });

        await video.play();
        console.log('[CameraWidget] Video play() succeeded');
      } catch (err) {
        if (isAborted) return;
        
        // Ignore AbortError as it happens when video is paused/unmounted during load
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('[CameraWidget] Video play() aborted (expected during fast switching)');
          return;
        }
        console.error('[CameraWidget] Video play() failed:', err);
      }
    };

    playVideo();

    return () => {
      console.log('[CameraWidget] Cleanup stream effect', { streamId: stream.id });
      isAborted = true;
      video.pause();
      // Don't fully clear srcObject here to prevent black flashes if overlapping
      // But we should ensure we stop playing current stream
      if (video.srcObject === stream) {
          video.srcObject = null;
      }
    };
  }, [stream]);

  // Start camera when widget becomes visible
  useEffect(() => {
    if (isVisible && !isActive && hasPermission !== false) {
      requestPermissions();
    } else if (!isVisible && isActive) {
      stopCamera();
    }
  }, [isVisible, hasPermission, requestPermissions, stopCamera, isActive]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'relative bg-black rounded-2xl overflow-hidden shadow-2xl group',
        'border-2',
        error ? 'border-red-500' : 'border-white/10',
        className
      )}
      style={{ width: '280px', height: '380px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video Preview with Mirroring */}
      <video
        ref={videoRef}
        className={cn(
          'w-full h-full object-cover',
          mirrored && 'scale-x-[-1]',
          !isVideoEnabled && 'opacity-0'
        )}
        muted
        playsInline
      />
      
      {/* Video Disabled Placeholder */}
      {!isVideoEnabled && isActive && (
         <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-gray-500">
             <CameraOff className="w-12 h-12 mb-2 opacity-50" />
             <p className="text-sm">Camera Off</p>
         </div>
      )}

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
          <Button
            size="sm"
            variant="outline"
            className="mt-4"
            onClick={() => requestPermissions()}
          >
            Request Permission
          </Button>
        </div>
      )}

      {/* Controls Overlay - Visible on Hover */}
      <div className={cn(
          "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-200 flex items-center justify-center gap-3 z-20",
          isHovered || !isVideoEnabled ? "opacity-100" : "opacity-0"
      )}>
        
        {/* Toggle Audio */}
        <button
            onClick={toggleAudio}
            className={cn(
                "p-3 rounded-full transition-all backdrop-blur-md",
                isAudioEnabled 
                    ? "bg-white/20 hover:bg-white/30 text-white" 
                    : "bg-red-500/80 hover:bg-red-500 text-white"
            )}
            title={isAudioEnabled ? "Mute Microphone" : "Unmute Microphone"}
        >
            {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        </button>

        {/* Toggle Video */}
        <button
            onClick={toggleVideo}
            className={cn(
                "p-3 rounded-full transition-all backdrop-blur-md",
                isVideoEnabled
                    ? "bg-white/20 hover:bg-white/30 text-white"
                    : "bg-red-500/80 hover:bg-red-500 text-white"
            )}
            title={isVideoEnabled ? "Turn Off Camera" : "Turn On Camera"}
        >
            {isVideoEnabled ? <Camera size={20} /> : <CameraOff size={20} />}
        </button>

        {/* Close Widget */}
        <button
            onClick={() => {
                if (isActive) stopCamera();
                onToggle?.();
            }}
            className="p-3 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all"
            title="Close Camera Widget"
        >
            <X size={20} />
        </button>
      </div>

      {/* Error State Overlay */}
      {error && isActive && (
        <div className="absolute top-2 left-2 right-2 bg-red-500/95 text-white text-xs px-3 py-2 rounded-lg z-20">
          <p className="font-medium">{error.userMessage}</p>
        </div>
      )}
    </div>
  );
}
