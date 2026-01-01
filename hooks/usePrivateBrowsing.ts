/**
 * Hook for detecting private browsing mode
 * Tests localStorage write capability and caches result
 */

import { useState, useEffect } from 'react';
import { detectPrivateBrowsing, clearDetectionCache } from '@/lib/utils/privateBrowsing';

export interface UsePrivateBrowsingReturn {
  /**
   * Whether private browsing mode is detected
   */
  isPrivate: boolean;
  
  /**
   * Detection completed
   */
  isDetected: boolean;
  
  /**
   * Whether warning should be shown
   */
  shouldShowWarning: boolean;
  
  /**
   * Dismiss warning for current session
   */
  dismissWarning: () => void;
  
  /**
   * Re-check detection (clears cache)
   */
  recheck: () => void;
}

/**
 * Hook for private browsing detection
 * 
 * Detects private browsing mode and provides utilities for warning management.
 * Result is cached for the session duration.
 * 
 * @returns Detection state and utilities
 */
export function usePrivateBrowsing(): UsePrivateBrowsingReturn {
  const [isPrivate, setIsPrivate] = useState(false);
  const [isDetected, setIsDetected] = useState(false);
  const [warningDismissed, setWarningDismissed] = useState(false);

  // Detect on mount
  useEffect(() => {
    const detected = detectPrivateBrowsing();
    setIsPrivate(detected);
    setIsDetected(true);
  }, []);

  const shouldShowWarning = isPrivate && !warningDismissed;

  const dismissWarning = () => {
    setWarningDismissed(true);
  };

  const recheck = () => {
    clearDetectionCache();
    const detected = detectPrivateBrowsing();
    setIsPrivate(detected);
    setIsDetected(true);
    setWarningDismissed(false);
  };

  return {
    isPrivate,
    isDetected,
    shouldShowWarning,
    dismissWarning,
    recheck,
  };
}
