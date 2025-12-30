'use client';

/**
 * RecordingModal Component
 * Modal for recording preview with save and discard options
 * @module components/teleprompter/camera/RecordingModal
 */

import { useState, useRef, useEffect } from 'react';
import { Play, Save, Trash2, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatFileSize, formatDuration } from '@/lib/utils/video';

export interface RecordingModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Recorded video blob */
  videoBlob: Blob | null;
  /** Callback when user chooses to save */
  onSave: () => Promise<void>;
  /** Callback when user chooses to discard */
  onDiscard: () => void;
  /** Recording duration in seconds */
  duration?: number;
  /** Script snapshot text that was recorded */
  scriptSnapshot?: string;
  /** Whether save operation is in progress */
  isSaving?: boolean;
}

export function RecordingModal({
  open,
  onClose,
  videoBlob,
  onSave,
  onDiscard,
  duration = 0,
  scriptSnapshot,
  isSaving = false,
}: RecordingModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Generate video URL from blob
  const videoUrl = videoBlob ? URL.createObjectURL(videoBlob) : '';

  // Cleanup video URL on unmount
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setIsPlaying(false);
      setCurrentTime(0);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [open]);

  // Handle video events
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  const handleEnded = () => setIsPlaying(false);

  // Handle save
  const handleSave = async () => {
    await onSave();
    onClose();
  };

  // Handle discard
  const handleDiscard = () => {
    onDiscard();
    onClose();
  };

  // Download video
  const handleDownload = () => {
    if (!videoBlob) return;
    const url = URL.createObjectURL(videoBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${new Date().toISOString()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Recording Preview</DialogTitle>
          <DialogDescription>
            Review your recording before saving or discard.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Video Preview */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain"
              onPlay={handlePlay}
              onPause={handlePause}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              playsInline
            />

            {/* Play/Pause Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {!isPlaying && (
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center pointer-events-auto cursor-pointer hover:bg-white transition-colors">
                  <Play className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" />
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800 cursor-pointer" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percentage = x / rect.width;
              if (videoRef.current) {
                videoRef.current.currentTime = percentage * (videoRef.current.duration || 0);
              }
            }}>
              <div
                className="h-full bg-red-500 transition-all"
                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
              />
            </div>
          </div>

          {/* Recording Info */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex gap-4">
              <div>
                <span className="text-gray-500">Duration:</span>{' '}
                <span className="font-medium">{formatDuration(duration)}</span>
              </div>
              <div>
                <span className="text-gray-500">Size:</span>{' '}
                <span className="font-medium">{videoBlob ? formatFileSize(videoBlob.size) : 'N/A'}</span>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              className="gap-1"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>

          {/* Script Snapshot (if available) */}
          {scriptSnapshot && (
            <details className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <summary className="text-sm font-medium cursor-pointer">
                Recorded Script ({scriptSnapshot.length} characters)
              </summary>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap max-h-32 overflow-y-auto">
                {scriptSnapshot}
              </p>
            </details>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleDiscard}
            disabled={isSaving}
            className="border-red-500 text-red-500 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Discard
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Recording
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
