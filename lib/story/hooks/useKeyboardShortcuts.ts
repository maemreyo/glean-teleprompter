/**
 * useKeyboardShortcuts Hook
 *
 * Manages keyboard shortcuts for teleprompter control.
 * Supports Space (play/pause), ArrowUp (speed+), ArrowDown (speed-), 'r' (reset).
 * (T106, T107, T112)
 *
 * @feature 012-standalone-story
 */

import { useEffect, useCallback } from 'react';
import { useTeleprompterStore } from '@/lib/stores/useTeleprompterStore';

export interface UseKeyboardShortcutsOptions {
  onPlayPause?: () => void;
  onSpeedChange?: (newSpeed: number) => void;
  onReset?: () => void;
  enabled?: boolean;
}

export interface UseKeyboardShortcutsReturn {
  keyPressed: string | null;
}

const SPEED_INCREMENT = 0.2;
const MIN_SPEED = 0;
const MAX_SPEED = 5;

/**
 * Hook for managing keyboard shortcuts
 */
export function useKeyboardShortcuts({
  onPlayPause,
  onSpeedChange,
  onReset,
  enabled = true,
}: UseKeyboardShortcutsOptions): UseKeyboardShortcutsReturn {
  const { scrollSpeed, setScrollSpeed, isScrolling } = useTeleprompterStore();
  const [keyPressed, setKeyPressed] = React.useState<string | null>(null);

  /**
   * Handle keyboard events (T107)
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore if user is typing in an input field
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      let handled = false;

      switch (event.key) {
        case ' ':
          // Space - Toggle play/pause (T107)
          event.preventDefault();
          handled = true;
          setKeyPressed('Space');
          onPlayPause?.();
          break;

        case 'ArrowUp':
          // ArrowUp - Increase speed (T107)
          event.preventDefault();
          handled = true;
          setKeyPressed('ArrowUp');
          const newSpeedUp = Math.min(MAX_SPEED, scrollSpeed + SPEED_INCREMENT);
          setScrollSpeed(newSpeedUp);
          onSpeedChange?.(newSpeedUp);
          break;

        case 'ArrowDown':
          // ArrowDown - Decrease speed (T107)
          event.preventDefault();
          handled = true;
          setKeyPressed('ArrowDown');
          const newSpeedDown = Math.max(MIN_SPEED, scrollSpeed - SPEED_INCREMENT);
          setScrollSpeed(newSpeedDown);
          onSpeedChange?.(newSpeedDown);
          break;

        case 'r':
        case 'R':
          // 'r' key - Reset to top (T107)
          event.preventDefault();
          handled = true;
          setKeyPressed('r');
          onReset?.();
          break;
      }

      if (handled) {
        // Announce to screen readers (T112)
        announceAction(event.key);
      }
    },
    [enabled, scrollSpeed, onPlayPause, onSpeedChange, onReset, setScrollSpeed]
  );

  /**
   * Register keyboard event listeners
   */
  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  /**
   * Clear key press state after delay
   */
  useEffect(() => {
    if (keyPressed) {
      const timeout = setTimeout(() => {
        setKeyPressed(null);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [keyPressed]);

  return { keyPressed };
}

/**
 * Announce action to screen readers (T112)
 */
function announceAction(key: string): void {
  let message = '';

  switch (key) {
    case ' ':
      message = 'Play or paused';
      break;
    case 'ArrowUp':
      message = 'Speed increased';
      break;
    case 'ArrowDown':
      message = 'Speed decreased';
      break;
    case 'r':
    case 'R':
      message = 'Reset to top';
      break;
  }

  if (message) {
    // Create or update aria-live region for screen reader announcements
    let liveRegion = document.getElementById('teleprompter-keyboard-announcer');

    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'teleprompter-keyboard-announcer';
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }

    liveRegion.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (liveRegion) {
        liveRegion.textContent = '';
      }
    }, 1000);
  }
}

/**
 * Calculate WPM (Words Per Minute) from scroll speed (T111)
 * Formula: speed × 150 = WPM
 */
export function calculateWPM(scrollSpeed: number): number {
  return Math.round(scrollSpeed * 150);
}

/**
 * Get keyboard shortcut hint text for display
 */
export function getShortcutHint(shortcut: string): string {
  switch (shortcut) {
    case 'playPause':
      return 'Space: Play/Pause';
    case 'speedUp':
      return '↑: Speed Up';
    case 'speedDown':
      return '↓: Speed Down';
    case 'reset':
      return 'R: Reset';
    default:
      return '';
  }
}

// Import React for useState
import React from 'react';
