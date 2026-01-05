"use client";

/**
 * Restore Progress Dialog Component
 *
 * Offers users the option to restore their saved reading progress
 * when they return to a story they've previously started.
 *
 * @feature 012-standalone-story - T100 restore dialog implementation
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { SavedProgress } from '@/lib/story/hooks/useProgressPersistence';

export interface RestoreProgressDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;

  /**
   * Callback when dialog is closed without restoring
   */
  onOpenChange: (open: boolean) => void;

  /**
   * Callback when user chooses to restore progress
   */
  onRestore: () => void;

  /**
   * Callback when user chooses to start over
   */
  onStartOver: () => void;

  /**
   * Saved progress data to display
   */
  progress: SavedProgress | null;

  /**
   * Total number of slides in the story (for progress display)
   */
  totalSlides?: number;

  /**
   * Current slide index (for progress display)
   */
  currentSlideIndex?: number;
}

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

/**
 * Restore Progress Dialog
 *
 * Shows when a user has saved progress for a story, offering
 * to either continue where they left off or start from the beginning.
 */
export function RestoreProgressDialog({
  open,
  onOpenChange,
  onRestore,
  onStartOver,
  progress,
  totalSlides = 0,
  currentSlideIndex = 0,
}: RestoreProgressDialogProps): React.ReactElement | null {
  const handleRestore = () => {
    onRestore();
    onOpenChange(false);
    toast.success('Progress restored! Continuing where you left off.');
  };

  const handleStartOver = () => {
    onStartOver();
    onOpenChange(false);
    toast.success('Starting from the beginning.');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // User closed dialog without choosing - don't restore or clear
      onOpenChange(false);
    }
  };

  if (!progress) {
    return null;
  }

  const progressText = totalSlides > 0
    ? `Slide ${currentSlideIndex + 1} of ${totalSlides}`
    : 'In progress';

  const lastReadTime = formatRelativeTime(progress.timestamp);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        aria-labelledby="restore-dialog-title"
        aria-describedby="restore-dialog-description"
      >
        <DialogHeader>
          <DialogTitle id="restore-dialog-title" className="text-xl">
            Continue Reading?
          </DialogTitle>
          <DialogDescription id="restore-dialog-description" className="text-base">
            You have saved progress for this story. Would you like to continue where you left off?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-4">
          <div className="flex items-center justify-between rounded-lg bg-muted p-3">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm font-medium">{progressText}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted p-3">
            <span className="text-sm text-muted-foreground">Last read</span>
            <span className="text-sm font-medium">{lastReadTime}</span>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handleStartOver}
          >
            Start Over
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={handleRestore}
          >
            Resume
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
