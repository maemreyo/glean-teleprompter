'use client';

/**
 * PermissionDialog Component
 * Dialog for requesting camera and microphone permissions with helpful guidance
 * @module components/teleprompter/camera/PermissionDialog
 */

import { AlertTriangle, Video, Mic, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface PermissionDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog is closed */
  onClose: () => void;
  /** Callback when permission request is confirmed */
  onConfirm: () => void;
  /** Type of permission being requested */
  permissionType: 'camera' | 'microphone' | 'both';
  /** Optional error message to display */
  error?: string;
}

export function PermissionDialog({
  open,
  onClose,
  onConfirm,
  permissionType,
  error,
}: PermissionDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  const getTitle = () => {
    switch (permissionType) {
      case 'camera':
        return 'Camera Permission Required';
      case 'microphone':
        return 'Microphone Permission Required';
      case 'both':
        return 'Camera & Microphone Permission Required';
    }
  };

  const getDescription = () => {
    switch (permissionType) {
      case 'camera':
        return 'To use the camera feature, we need access to your camera. This allows you to see yourself while recording.';
      case 'microphone':
        return 'To record videos with audio, we need access to your microphone. Your audio will be recorded along with the video.';
      case 'both':
        return 'To record videos, we need access to both your camera and microphone. This allows you to record yourself with audio.';
    }
  };

  const getPermissionsList = () => {
    const permissions = [];
    if (permissionType === 'camera' || permissionType === 'both') {
      permissions.push({ icon: Video, label: 'Camera access', color: 'text-blue-500' });
    }
    if (permissionType === 'microphone' || permissionType === 'both') {
      permissions.push({ icon: Mic, label: 'Microphone access', color: 'text-green-500' });
    }
    return permissions;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            {getTitle()}
          </DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Permissions List */}
          <div className="space-y-2">
            {getPermissionsList().map((permission) => (
              <div key={permission.label} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <permission.icon className={`w-5 h-5 ${permission.color}`} />
                <span className="text-sm font-medium">{permission.label}</span>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Privacy:</strong> Your camera and microphone data is processed locally and only used for your
              recordings. We don&apos;t access your media without your permission.
            </p>
          </div>

          {/* Help Link */}
          <a
            href="https://support.google.com/chrome/answer/2693763"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ExternalLink className="w-3 h-3" />
            Learn how to manage browser permissions
            <span className="sr-only">(opens in new tab)</span>
          </a>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="w-full sm:w-auto">
            Allow Permission
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
