/**
 * PrivateBrowsingWarning - Warning banner for private browsing mode
 * Displays when localStorage is not available (private/incognito mode)
 */

"use client";

import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface PrivateBrowsingWarningProps {
  /** Callback when warning is dismissed */
  onDismiss?: () => void;
  /** Callback when user clicks "Save to account" */
  onSaveToAccount?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * PrivateBrowsingWarning component
 * 
 * Displays a dismissible warning banner when private browsing mode is detected.
 * Informs users that drafts will not persist after the session ends.
 * 
 * Accessibility:
 * - role="alert" for screen reader announcement
 * - aria-live for dynamic content
 * - Keyboard dismissible with Escape key
 */
export function PrivateBrowsingWarning({
  onDismiss,
  onSaveToAccount,
  className,
}: PrivateBrowsingWarningProps) {
  const [isDismissed, setIsDismissed] = React.useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleSaveToAccount = () => {
    onSaveToAccount?.();
  };

  // Keyboard dismiss
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDismissed) {
        handleDismiss();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isDismissed]);

  if (isDismissed) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'relative w-full bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800',
        'px-4 py-3 rounded-md',
        'transition-opacity duration-300',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Warning Icon */}
        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        
        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
            Private browsing detected
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            Your drafts will not be saved after you close this session.{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleSaveToAccount();
              }}
              className="underline font-medium hover:text-amber-900 dark:hover:text-amber-50"
            >
              Sign in to save to your account
            </a>
            {' '}or save your work manually.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveToAccount}
            className="h-8 text-xs bg-white dark:bg-gray-800 border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900"
          >
            Save to account
          </Button>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded-md hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors"
            aria-label="Dismiss warning"
          >
            <X className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
