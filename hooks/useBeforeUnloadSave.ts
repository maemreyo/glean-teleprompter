/**
 * Hook for protecting against accidental tab closure
 * Saves state immediately before page unload
 */

import { useEffect } from 'react';
import { StoreApi } from 'zustand';
import { saveDraft } from '@/lib/storage/draftStorage';
import { createDraft } from '@/lib/storage/draftStorage';
import { TeleprompterDraft } from '@/lib/storage/types';

export interface UseBeforeUnloadSaveOptions {
  /**
   * Only save in setup mode
   * @default true
   */
  setupOnly?: boolean;
  
  /**
   * Current mode
   */
  mode: 'setup' | 'running' | 'readonly';
  
  /**
   * Callback before save (can prevent save)
   */
  beforeSave?: () => boolean | Promise<boolean>;
}

/**
 * Extract teleprompter state from store
 */
function extractTeleprompterState(store: StoreApi<any>): Partial<TeleprompterDraft> {
  const state = store.getState();
  
  return {
    text: state.text || '',
    backgroundUrl: state.backgroundUrl || '',
    musicUrl: state.musicUrl || '',
    fontStyle: state.fontStyle || 'Arial',
    colorIndex: state.colorIndex ?? 0,
    scrollSpeed: state.scrollSpeed ?? 50,
    fontSize: state.fontSize ?? 24,
    textAlignment: state.textAlignment || 'center',
    lineHeight: state.lineHeight ?? 1.5,
    margin: state.margin ?? 20,
    overlayOpacity: state.overlayOpacity ?? 0.5,
  };
}

/**
 * Hook for beforeunload save protection
 * 
 * Adds a beforeunload event listener that saves state immediately
 * before the page closes. Only active in setup mode.
 * 
 * @param store - Zustand store to save
 * @param options - Configuration options
 */
export function useBeforeUnloadSave(
  store: StoreApi<any>,
  options: UseBeforeUnloadSaveOptions
): void {
  const {
    setupOnly = true,
    mode,
    beforeSave,
  } = options;

  useEffect(() => {
    // Only add listener in setup mode (or if setupOnly is disabled)
    if (setupOnly && mode !== 'setup') {
      return;
    }

    const handleBeforeUnload = async () => {
      // Check if save should proceed
      if (beforeSave) {
        const shouldSave = await beforeSave();
        if (!shouldSave) {
          return;
        }
      }

      // Synchronous save (must complete before page closes)
      try {
        const state = extractTeleprompterState(store);
        const draft = createDraft(state);
        saveDraft(draft);
      } catch (error) {
        console.error('[useBeforeUnloadSave] Failed to save on beforeunload:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [store, setupOnly, mode, beforeSave]);
}
