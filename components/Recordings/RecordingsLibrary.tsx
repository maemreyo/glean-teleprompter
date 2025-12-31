/**
 * RecordingsLibrary Component
 * Enhanced recordings management page with list view, search, filters, and bulk operations
 */

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Play, Download, Trash2, Calendar, Clock, HardDrive, Video, Search, Filter, Grid, List, ChevronDown, Check, X, FolderPlus, Archive, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { Recording } from '@/types/recording';
import { listRecordings, deleteRecording, getStorageQuota } from '@/lib/supabase/recordings';
import { formatDuration, formatFileSize } from '@/lib/utils/video';
import { RecordingPlayer } from '@/components/teleprompter/RecordingPlayer';
import { RecordingDownload } from '@/components/teleprompter/RecordingDownload';
import { StorageQuota } from '@/components/teleprompter/StorageQuota';
import { RecordingFilters } from './RecordingFilters';
import { RecordingCard } from './RecordingCard';
import { BulkActionsBar } from './BulkActionsBar';
import { RecordingListView } from './RecordingListView';
import { RecordingGridView } from './RecordingGridView';

/**
 * Sort options for recordings
 */
export type RecordingSortField = 'created_at' | 'duration' | 'size_mb';
export type SortOrder = 'asc' | 'desc';

/**
 * Filter options for recordings
 */
export interface RecordingFiltersState {
  dateRange?: { start: Date; end: Date };
  quality?: 'standard' | 'reduced' | 'all';
  duration?: 'short' | 'medium' | 'long' | 'all';
  search?: string;
}

/**
 * Props for the RecordingsLibrary component
 */
export interface RecordingsLibraryProps {
  className?: string;
  showFilters?: boolean;
  enableBulkActions?: boolean;
  initialSort?: RecordingSortField;
  initialSortOrder?: SortOrder;
  initialFilters?: Partial<RecordingFiltersState>;
}

export function RecordingsLibrary({
  className,
  showFilters = true,
  enableBulkActions = true,
  initialSort = 'created_at',
  initialSortOrder = 'desc',
  initialFilters,
}: RecordingsLibraryProps) {
  const t = useTranslations('RecordingsLibrary');
  
  // State for recordings data
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [filteredRecordings, setFilteredRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  // State for filters and sorting
  const [sortField, setSortField] = useState<RecordingSortField>(initialSort);
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder);
  const [filters, setFilters] = useState<RecordingFiltersState>({
    quality: 'all',
    duration: 'all',
    ...initialFilters,
  });
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  // State for view mode
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // State for playback
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  
  // State for bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkMode, setIsBulkMode] = useState(false);
  
  // Pagination settings
  const limit = 20;
  const totalPages = Math.ceil(total / limit);

  /**
   * Load recordings from the API
   */
  const loadRecordings = async () => {
    try {
      setLoading(true);
      setError(null);
      const { recordings: data, total: count } = await listRecordings(page, limit);
      setRecordings(data);
      setTotal(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recordings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecordings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  /**
   * Apply filters and sorting to recordings
   */
  const processedRecordings = useMemo(() => {
    let result = [...recordings];
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(rec => 
        rec.script_snapshot?.toLowerCase().includes(searchLower) ||
        new Date(rec.created_at).toLocaleDateString().toLowerCase().includes(searchLower)
      );
    }
    
    // Apply quality filter
    if (filters.quality && filters.quality !== 'all') {
      result = result.filter(rec => rec.recording_quality === filters.quality);
    }
    
    // Apply duration filter
    if (filters.duration && filters.duration !== 'all') {
      const durationRanges = {
        short: { min: 0, max: 60 },
        medium: { min: 60, max: 300 },
        long: { min: 300, max: Infinity },
      };
      const range = durationRanges[filters.duration];
      result = result.filter(rec => rec.duration >= range.min && rec.duration < range.max);
    }
    
    // Apply date range filter
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      result = result.filter(rec => {
        const recDate = new Date(rec.created_at);
        return recDate >= start && recDate <= end;
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
        case 'size_mb':
          comparison = a.size_mb - b.size_mb;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [recordings, filters, sortField, sortOrder]);

  /**
   * Update filtered recordings when processed recordings change
   */
  useEffect(() => {
    setFilteredRecordings(processedRecordings);
  }, [processedRecordings]);

  /**
   * Handle deletion of a recording
   */
  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) {
      return;
    }

    try {
      await deleteRecording(id);
      await loadRecordings();
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recording');
    }
  };

  /**
   * Handle bulk deletion
   */
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    if (!confirm(t('bulkDeleteConfirm', { count: selectedIds.size }))) {
      return;
    }

    try {
      await Promise.all(Array.from(selectedIds).map(id => deleteRecording(id)));
      await loadRecordings();
      setSelectedIds(new Set());
      setIsBulkMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recordings');
    }
  };

  /**
   * Handle selection toggle for bulk operations
   */
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  /**
   * Toggle select all
   */
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredRecordings.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRecordings.map(r => r.id)));
    }
  };

  /**
   * Handle recording playback
   */
  const handlePlay = (recording: Recording) => {
    setSelectedRecording(recording);
    setShowPlayer(true);
  };

  /**
   * Update filters
   */
  const updateFilters = (newFilters: Partial<RecordingFiltersState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setFilters({
      quality: 'all',
      duration: 'all',
      search: '',
    });
  };

  /**
   * Loading state
   */
  if (loading && recordings.length === 0) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
        </div>
      </div>
    );
  }

  /**
   * Error state
   */
  if (error) {
    return (
      <div className={className}>
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200">
          {error}
          <button
            onClick={loadRecordings}
            className="ml-4 px-3 py-1 bg-red-500/30 hover:bg-red-500/50 rounded text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Storage Quota Banner */}
      <StorageQuota className="mb-6" />

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {isBulkMode && enableBulkActions && (
          <BulkActionsBar
            selectedCount={selectedIds.size}
            totalCount={filteredRecordings.length}
            onClearSelection={() => {
              setSelectedIds(new Set());
              setIsBulkMode(false);
            }}
            onSelectAll={toggleSelectAll}
            onBulkDelete={handleBulkDelete}
            onDownloadSelected={() => {
              // TODO: Implement bulk download
              console.log('Download selected:', Array.from(selectedIds));
            }}
            onOrganizeSelected={() => {
              // TODO: Implement organize functionality
              console.log('Organize selected:', Array.from(selectedIds));
            }}
          />
        )}
      </AnimatePresence>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={filters.search || ''}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Filter Toggle */}
          {showFilters && (
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`p-2.5 rounded-lg transition-colors ${
                showFilterPanel || filters.quality !== 'all' || filters.duration !== 'all' || filters.dateRange
                  ? 'bg-pink-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
              title={t('toggleFilters')}
            >
              <Filter size={18} />
            </button>
          )}

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-') as [RecordingSortField, SortOrder];
                setSortField(field);
                setSortOrder(order);
              }}
              className="appearance-none pl-4 pr-10 py-2.5 bg-white/10 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 cursor-pointer"
            >
              <option value="created_at-desc" className="bg-gray-900">{t('newestFirst')}</option>
              <option value="created_at-asc" className="bg-gray-900">{t('oldestFirst')}</option>
              <option value="duration-asc" className="bg-gray-900">{t('shortestFirst')}</option>
              <option value="duration-desc" className="bg-gray-900">{t('longestFirst')}</option>
              <option value="size_mb-asc" className="bg-gray-900">{t('smallestFirst')}</option>
              <option value="size_mb-desc" className="bg-gray-900">{t('largestFirst')}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' ? 'bg-pink-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
              title={t('listView')}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-pink-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
              title={t('gridView')}
            >
              <Grid size={18} />
            </button>
          </div>

          {/* Bulk Mode Toggle */}
          {enableBulkActions && (
            <button
              onClick={() => setIsBulkMode(!isBulkMode)}
              className={`p-2.5 rounded-lg transition-colors ${
                isBulkMode ? 'bg-pink-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
              title={t('toggleBulkMode')}
            >
              <Check size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilterPanel && showFilters && (
          <RecordingFilters
            filters={filters}
            onUpdateFilters={updateFilters}
            onClearFilters={clearFilters}
            onClose={() => setShowFilterPanel(false)}
          />
        )}
      </AnimatePresence>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4 text-sm text-gray-400">
        <span>
          {t('showingResults', { 
            count: filteredRecordings.length, 
            total: total 
          })}
        </span>
        {(filters.quality !== 'all' || filters.duration !== 'all' || filters.search || filters.dateRange) && (
          <button
            onClick={clearFilters}
            className="text-pink-400 hover:text-pink-300 transition-colors"
          >
            {t('clearFilters')}
          </button>
        )}
      </div>

      {/* Recordings Display */}
      {filteredRecordings.length === 0 ? (
        <div className="text-center py-16">
          <Video className="mx-auto h-16 w-16 text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">{t('noRecordings')}</h3>
          <p className="text-gray-500">{t('noRecordingsDesc')}</p>
          {(filters.search || filters.quality !== 'all' || filters.duration !== 'all' || filters.dateRange) && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
            >
              {t('clearFilters')}
            </button>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'list' ? (
            <RecordingListView
              recordings={filteredRecordings}
              selectedIds={selectedIds}
              isBulkMode={isBulkMode}
              onPlay={handlePlay}
              onDelete={handleDelete}
              onToggleSelection={toggleSelection}
            />
          ) : (
            <RecordingGridView
              recordings={filteredRecordings}
              selectedIds={selectedIds}
              isBulkMode={isBulkMode}
              onPlay={handlePlay}
              onDelete={handleDelete}
              onToggleSelection={toggleSelection}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
              >
                {t('previous')}
              </button>
              <span className="text-sm text-gray-400">
                {t('page')} {page} {t('of')} {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
              >
                {t('next')}
              </button>
            </div>
          )}
        </>
      )}

      {/* Recording Player Modal */}
      {showPlayer && selectedRecording && (
        <RecordingPlayer
          recording={selectedRecording}
          onClose={() => {
            setShowPlayer(false);
            setSelectedRecording(null);
          }}
        />
      )}
    </div>
  );
}

export default RecordingsLibrary;
