/**
 * DraftManagementDialog - UI for viewing, managing, and restoring local drafts
 */

"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatRelativeTime } from '@/lib/utils/formatRelativeTime';
import { ARIA_LABELS } from '@/lib/a11y/ariaLabels';
import { cn } from '@/lib/utils';
import { Trash2, RotateCcw, Clock, FileText } from 'lucide-react';
import { useDraftManagement } from '@/hooks/useDraftManagement';
import { TeleprompterDraft } from '@/lib/storage/types';
import { formatBytes } from '@/lib/storage/storageQuota';

export interface DraftManagementDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog is closed */
  onOpenChange: (open: boolean) => void;
}

/**
 * DraftManagementDialog component
 * 
 * Displays a list of saved drafts with options to restore or delete.
 * Supports multi-select for bulk deletion.
 * 
 * Accessibility:
 * - Full keyboard navigation
 * - ARIA labels for screen readers
 * - Focus trap in modal
 */
export function DraftManagementDialog({
  open,
  onOpenChange,
}: DraftManagementDialogProps) {
  const t = useTranslations('DraftManagementDialog')
  const {
    drafts,
    isLoading,
    restoreDraft,
    deleteDrafts,
    getDraft,
  } = useDraftManagement({
    autoLoad: true,
    sortNewestFirst: true,
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  // Reset selection when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedIds(new Set());
      setFocusedIndex(-1);
    }
  }, [open]);

  const getDraftSize = useCallback((draft: TeleprompterDraft) => {
    const json = JSON.stringify(draft);
    return formatBytes(json.length * 2); // UTF-16 = 2 bytes per char
  }, []);

  const getPreviewText = useCallback((text: string) => {
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  }, []);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleToggleAll = useCallback(() => {
    if (selectedIds.size === drafts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(drafts.map(d => d._id)));
    }
  }, [selectedIds.size, drafts]);

  const handleRestore = useCallback((id: string) => {
    restoreDraft(id);
    onOpenChange(false);
  }, [restoreDraft, onOpenChange]);

  const handleDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;

    const idsToDelete = Array.from(selectedIds);
    await deleteDrafts(idsToDelete);
    setSelectedIds(new Set());
  }, [selectedIds, deleteDrafts]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (drafts.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => (prev + 1) % drafts.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => (prev - 1 + drafts.length) % drafts.length);
          break;
        case 'Enter':
          if (focusedIndex >= 0) {
            e.preventDefault();
            handleRestore(drafts[focusedIndex]._id);
          }
          break;
        case 'Delete':
        case 'Backspace':
          if (focusedIndex >= 0 && !selectedIds.has(drafts[focusedIndex]._id)) {
            e.preventDefault();
            handleToggleSelect(drafts[focusedIndex]._id);
          } else if (selectedIds.size > 0) {
            e.preventDefault();
            handleDelete();
          }
          break;
        case 'Escape':
          if (selectedIds.size > 0) {
            e.preventDefault();
            setSelectedIds(new Set());
          } else {
            onOpenChange(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, drafts, focusedIndex, selectedIds, handleRestore, handleToggleSelect, handleDelete, onOpenChange]);

  const allSelected = drafts.length > 0 && selectedIds.size === drafts.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">{t('loading')}</p>
              </div>
            </div>
          ) : drafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">{t('noDrafts')}</p>
              <p className="text-sm text-muted-foreground">
                {t('noDraftsDesc')}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Bulk actions header */}
              {drafts.length > 0 && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <Checkbox
                    id="select-all"
                    checked={allSelected}
                    onCheckedChange={handleToggleAll}
                    aria-label={ARIA_LABELS.draftList(drafts.length)}
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm font-medium cursor-pointer flex-1"
                  >
                    {drafts.length} {drafts.length === 1 ? t('draftCount_one', { count: drafts.length }) : t('draftCount_other', { count: drafts.length })}
                  </label>
                  {selectedIds.size > 0 && (
                    <>
                      <span className="text-sm text-muted-foreground">
                        {t('selectedCount', { count: selectedIds.size })}
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        className="h-8"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {t('delete')}
                      </Button>
                    </>
                  )}
                </div>
              )}

              {/* Draft list */}
              <div
                role="listbox"
                aria-label={ARIA_LABELS.draftList(drafts.length)}
                className="space-y-1"
              >
                {drafts.map((draft, index) => {
                  const isSelected = selectedIds.has(draft._id);
                  const isFocused = index === focusedIndex;

                  return (
                    <div
                      key={draft._id}
                      role="option"
                      tabIndex={0}
                      aria-selected={isSelected}
                      aria-label={ARIA_LABELS.draftListItem(
                        draft._timestamp,
                        index,
                        drafts.length,
                        isSelected
                      )}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg border transition-all',
                        'hover:bg-accent',
                        isFocused && 'ring-2 ring-primary ring-offset-2',
                        isSelected && 'bg-accent'
                      )}
                      onClick={() => handleToggleSelect(draft._id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleToggleSelect(draft._id);
                        }
                      }}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleSelect(draft._id)}
                        className="mt-1"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(draft._timestamp)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            • {getDraftSize(draft)}
                          </span>
                        </div>
                        <p className="text-sm font-medium truncate">
                          {getPreviewText(draft.text) || t('emptyDraft')}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestore(draft._id);
                        }}
                        className="flex-shrink-0 h-8"
                        aria-label={ARIA_LABELS.restoreDraft(draft._timestamp)}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        {t('restore')}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer hints */}
        {drafts.length > 0 && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            <p>💡 {t('tip')}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
