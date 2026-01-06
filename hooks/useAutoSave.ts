'use client';

import { useEffect } from 'react';
import { useStoryBuilderStore } from '@/lib/story-builder/store';
import { initAutoSave } from '@/lib/story-builder/store';

/**
 * Hook to initialize auto-save for the story builder.
 * Should be used once in the main StoryBuilder component.
 */
export function useAutoSave() {
  const slides = useStoryBuilderStore((state) => state.slides);
  const saveStatus = useStoryBuilderStore((state) => state.saveStatus);

  useEffect(() => {
    // Initialize auto-save timer and restore draft on mount
    const cleanup = initAutoSave();

    return cleanup;
  }, []);

  // Trigger auto-save when slides change
  useEffect(() => {
    if (slides.length > 0 && saveStatus === 'unsaved') {
      const timer = setTimeout(() => {
        useStoryBuilderStore.getState().autoSave();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [slides, saveStatus]);
}
