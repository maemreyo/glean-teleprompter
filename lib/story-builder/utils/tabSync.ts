/**
 * Cross-Tab Synchronization Utilities
 * 
 * Handles synchronization of story builder state across multiple browser tabs.
 * Uses storage events to detect changes made in other tabs.
 * 
 * @feature 013-visual-story-builder
 */

import type { AutoSaveDraft } from '../types';
import { DRAFT_STORAGE_KEY } from '../types';

// ============================================================================
// Storage Event Handler
// ============================================================================

/**
 * Check if a storage event is related to the story builder draft.
 */
export function isStoryBuilderStorageEvent(event: StorageEvent): boolean {
  return (
    event.key === DRAFT_STORAGE_KEY &&
    event.newValue !== null &&
    event.oldValue !== event.newValue
  );
}

/**
 * Parse draft from storage event.
 */
export function parseDraftFromStorageEvent(event: StorageEvent): AutoSaveDraft | null {
  if (!isStoryBuilderStorageEvent(event) || !event.newValue) {
    return null;
  }

  try {
    const draft: AutoSaveDraft = JSON.parse(event.newValue);
    return draft;
  } catch (error) {
    console.error('Failed to parse draft from storage event:', error);
    return null;
  }
}

/**
 * Check if draft was updated in another tab (not the current one).
 * Storage events fire in all tabs except the one that made the change.
 */
export function isExternalUpdate(event: StorageEvent): boolean {
  // StorageEvent has no 'url' property in TypeScript, but it exists at runtime
  const eventUrl = (event as any).url;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  // If URLs don't match, the change came from another tab/window
  return eventUrl !== currentUrl;
}

// ============================================================================
// Sync Conflict Detection
// ============================================================================

/**
 * Detect if there's a sync conflict between local state and external draft.
 * A conflict occurs if both drafts have been modified since they diverged.
 */
export function hasSyncConflict(
  localDraft: AutoSaveDraft | null,
  externalDraft: AutoSaveDraft
): boolean {
  if (!localDraft) {
    // No local state, no conflict
    return false;
  }

  // Check if external draft is newer
  const externalIsNewer = externalDraft.savedAt > localDraft.savedAt;

  // Check if local state has unsaved changes
  // (This would need to be tracked separately in the store)

  return externalIsNewer;
}

// ============================================================================
// Sync Strategy
// ============================================================================

/**
 * Determine sync strategy based on local state and external changes.
 */
export type SyncStrategy = 'merge' | 'replace' | 'ignore' | 'prompt';

export function determineSyncStrategy(
  localDraft: AutoSaveDraft | null,
  externalDraft: AutoSaveDraft,
  hasUnsavedChanges: boolean
): SyncStrategy {
  // No local state or no unsaved changes - replace with external
  if (!localDraft || !hasUnsavedChanges) {
    return 'replace';
  }

  // Both have changes - check timestamps
  if (externalDraft.savedAt > localDraft.savedAt) {
    // External is newer - prompt user to resolve conflict
    return 'prompt';
  }

  // Local is newer - ignore external
  return 'ignore';
}

// ============================================================================
// Sync Notification
// ============================================================================

/**
 * Create a user-friendly message about external changes.
 */
export function getSyncMessage(
  externalDraft: AutoSaveDraft,
  localDraft: AutoSaveDraft | null
): string {
  const slideCount = externalDraft.slides.length;
  const timeAgo = getTimeAgo(externalDraft.savedAt);

  if (!localDraft) {
    return `A draft with ${slideCount} slide${slideCount !== 1 ? 's' : ''} was saved ${timeAgo} in another tab.`;
  }

  return `Another tab updated the story ${timeAgo}. It has ${slideCount} slide${slideCount !== 1 ? 's' : ''}.`;
}

/**
 * Format timestamp as human-readable "time ago" string.
 */
function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) {
    return 'just now';
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

// ============================================================================
// BroadcastChannel Alternative (for future enhancement)
// ============================================================================

/**
 * BroadcastChannel API provides a more reliable way to sync across tabs.
 * This is prepared for future enhancement but not currently used.
 */
export class StoryBuilderChannel {
  private channel: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(DRAFT_STORAGE_KEY);
    }
  }

  /**
   * Broadcast draft update to other tabs.
   */
  broadcast(draft: AutoSaveDraft): void {
    if (this.channel) {
      this.channel.postMessage({ type: 'UPDATE', draft });
    }
  }

  /**
   * Listen for draft updates from other tabs.
   */
  listen(callback: (draft: AutoSaveDraft) => void): () => void {
    if (!this.channel) {
      return () => {};
    }

    const handler = (event: MessageEvent) => {
      if (event.data.type === 'UPDATE') {
        callback(event.data.draft);
      }
    };

    this.channel.addEventListener('message', handler);

    // Return cleanup function
    return () => {
      this.channel?.removeEventListener('message', handler);
    };
  }

  /**
   * Close the channel.
   */
  close(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
  }
}
