/**
 * Hook for managing local drafts collection
 * Provides CRUD operations for draft list UI
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  loadAllDrafts,
  addToCollection,
  removeFromCollection,
  createDraft,
} from '@/lib/storage/draftStorage';
import { TeleprompterDraft } from '@/lib/storage/types';
import { useConfigStore } from '@/lib/stores/useConfigStore';
import { useContentStore } from '@/lib/stores/useContentStore';
import { TEXT_COLORS } from '@/lib/constants';
import { toast } from 'sonner';

export interface UseDraftManagementOptions {
  /**
   * Auto-load drafts on mount
   * @default true
   */
  autoLoad?: boolean;
  
  /**
   * Sort drafts by timestamp descending
   * @default true
   */
  sortNewestFirst?: boolean;
  
  /**
   * Maximum number of drafts to keep
   * @default Infinity (no limit)
   */
  maxDrafts?: number;
}

export interface UseDraftManagementReturn {
  /**
   * Array of all saved drafts
   */
  drafts: TeleprompterDraft[];
  
  /**
   * Loading state
   */
  isLoading: boolean;
  
  /**
   * Error state
   */
  error: Error | null;
  
  /**
   * Load all drafts from storage
   */
  loadDrafts: () => Promise<void>;
  
  /**
   * Restore a draft to the editor
   */
  restoreDraft: (id: string) => void;
  
  /**
   * Delete one or more drafts
   */
  deleteDrafts: (ids: string[]) => Promise<void>;
  
  /**
   * Get a single draft by ID
   */
  getDraft: (id: string) => TeleprompterDraft | null;
  
  /**
   * Create a new draft from current state
   */
  createDraftFromState: () => string;
  
  /**
   * Refresh drafts list
   */
  refresh: () => Promise<void>;
}

/**
 * Hook for draft management
 * 
 * Provides CRUD operations for the draft collection.
 * Supports loading, restoring, deleting, and creating drafts.
 * 
 * @param options - Configuration options
 * @returns Draft management operations and state
 */
export function useDraftManagement(
  options: UseDraftManagementOptions = {}
): UseDraftManagementReturn {
  const {
    autoLoad = true,
    sortNewestFirst = true,
    maxDrafts = Infinity,
  } = options;

  const router = useRouter();
  
  const [drafts, setDrafts] = useState<TeleprompterDraft[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadDrafts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let loaded = loadAllDrafts();

      // Sort if requested
      if (sortNewestFirst) {
        loaded = loaded.sort((a, b) => b._timestamp - a._timestamp);
      }

      // Limit if maxDrafts is set
      if (maxDrafts < Infinity) {
        loaded = loaded.slice(0, maxDrafts);
      }

      setDrafts(loaded);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load drafts'));
    } finally {
      setIsLoading(false);
    }
  }, [sortNewestFirst, maxDrafts]);

  const restoreDraft = useCallback((id: string) => {
    const draft = drafts.find(d => d._id === id);
    
    if (!draft) {
      toast.error('Draft not found');
      return;
    }

    try {
      // Apply draft state to stores (excluding metadata)
      // Map draft properties to store property names
      const { _id, _version, _timestamp, text, backgroundUrl, musicUrl, fontStyle, colorIndex, scrollSpeed, fontSize, textAlignment, lineHeight, margin, overlayOpacity } = draft;
      
      // 1. Restore Content
      useContentStore.getState().setAll({
        text,
        bgUrl: backgroundUrl,
        musicUrl: musicUrl,
      });

      // 2. Restore Config
      useConfigStore.getState().setTypography({
        fontFamily: fontStyle,
        fontSize,
        lineHeight,
      });

      useConfigStore.getState().setEffects({
        overlayOpacity,
      });

      useConfigStore.getState().setLayout({
        textAlign: textAlignment as any,
        horizontalMargin: margin,
      });

      useConfigStore.getState().setAnimations({
        autoScrollSpeed: scrollSpeed,
      });

      // Map color index to actual color value
      const colorValue = TEXT_COLORS[colorIndex]?.value;
      if (colorValue) {
        useConfigStore.getState().setColors({
          primaryColor: colorValue,
        });
      }
      
      toast.success('Draft restored successfully');
    } catch (err) {
      toast.error('Failed to restore draft');
      console.error(err);
    }
  }, [drafts]);

  const deleteDrafts = useCallback(async (ids: string[]) => {
    try {
      for (const id of ids) {
        removeFromCollection(id);
      }

      // Refresh list
      await loadDrafts();
      
      toast.success(`Deleted ${ids.length} draft${ids.length > 1 ? 's' : ''}`);
    } catch (err) {
      toast.error('Failed to delete drafts');
      throw err;
    }
  }, [loadDrafts]);

  const getDraft = useCallback((id: string) => {
    return drafts.find(d => d._id === id) || null;
  }, [drafts]);

  const createDraftFromState = useCallback(() => {
    try {
      const contentState = useContentStore.getState();
      const configState = useConfigStore.getState();
      
      // Map color back to index (best effort)
      const currentColor = configState.colors.primaryColor;
      const index = TEXT_COLORS.findIndex(c => c.value.toLowerCase() === currentColor.toLowerCase());
      const colorIndex = index >= 0 ? index : 0;
      
      // Map store properties to draft properties
      const draftState = {
        text: contentState.text,
        backgroundUrl: contentState.bgUrl,
        musicUrl: contentState.musicUrl,
        fontStyle: configState.typography.fontFamily,
        colorIndex,
        scrollSpeed: configState.animations.autoScrollSpeed,
        fontSize: configState.typography.fontSize,
        textAlignment: configState.layout.textAlign,
        lineHeight: configState.typography.lineHeight,
        margin: configState.layout.horizontalMargin,
        overlayOpacity: configState.effects.overlayOpacity,
      };
      
      const draft = createDraft(draftState);
      
      const id = addToCollection(draft);
      
      toast.success('Draft created successfully');
      
      // Refresh list
      loadDrafts();
      
      return id;
    } catch (err) {
      toast.error('Failed to create draft');
      throw err;
    }
  }, [loadDrafts]);

  const refresh = useCallback(async () => {
    await loadDrafts();
  }, [loadDrafts]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      loadDrafts();
    }
  }, [autoLoad, loadDrafts]);

  return {
    drafts,
    isLoading,
    error,
    loadDrafts,
    restoreDraft,
    deleteDrafts,
    getDraft,
    createDraftFromState,
    refresh,
  };
}
