/**
 * RecordingFilters Component
 * Filter panel for recordings library with date range, quality, and duration filters
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Star, Filter as FilterIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { RecordingFiltersState } from './RecordingsLibrary';

interface RecordingFiltersProps {
  filters: RecordingFiltersState;
  onUpdateFilters: (filters: Partial<RecordingFiltersState>) => void;
  onClearFilters: () => void;
  onClose: () => void;
}

export function RecordingFilters({
  filters,
  onUpdateFilters,
  onClearFilters,
  onClose,
}: RecordingFiltersProps) {
  const t = useTranslations('RecordingFilters');
  
  const [startDate, setStartDate] = useState(
    filters.dateRange?.start ? filters.dateRange.start.toISOString().split('T')[0] : ''
  );
  const [endDate, setEndDate] = useState(
    filters.dateRange?.end ? filters.dateRange.end.toISOString().split('T')[0] : ''
  );

  const handleDateRangeApply = () => {
    if (startDate && endDate) {
      onUpdateFilters({
        dateRange: {
          start: new Date(startDate),
          end: new Date(endDate),
        },
      });
    } else {
      onUpdateFilters({ dateRange: undefined });
    }
  };

  const hasActiveFilters = 
    filters.quality !== 'all' ||
    filters.duration !== 'all' ||
    filters.dateRange !== undefined ||
    filters.search !== undefined;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FilterIcon size={18} className="text-pink-400" />
            <h3 className="text-lg font-semibold text-white">{t('title')}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Date Range Filter */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Calendar size={16} />
              {t('dateRange')}
            </label>
            <div className="space-y-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              />
              <button
                onClick={handleDateRangeApply}
                className="w-full px-3 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 rounded-lg text-sm transition-colors"
              >
                {t('applyDateRange')}
              </button>
            </div>
          </div>

          {/* Quality Filter */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Star size={16} />
              {t('quality')}
            </label>
            <select
              value={filters.quality || 'all'}
              onChange={(e) => onUpdateFilters({ 
                quality: e.target.value as 'standard' | 'reduced' | 'all' 
              })}
              className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
            >
              <option value="all">{t('allQuality')}</option>
              <option value="standard">{t('standardQuality')}</option>
              <option value="reduced">{t('reducedQuality')}</option>
            </select>
          </div>

          {/* Duration Filter */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Clock size={16} />
              {t('duration')}
            </label>
            <select
              value={filters.duration || 'all'}
              onChange={(e) => onUpdateFilters({ 
                duration: e.target.value as 'short' | 'medium' | 'long' | 'all' 
              })}
              className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
            >
              <option value="all">{t('allDuration')}</option>
              <option value="short">{t('shortDuration')}</option>
              <option value="medium">{t('mediumDuration')}</option>
              <option value="long">{t('longDuration')}</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <button
              onClick={onClearFilters}
              className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
            >
              {t('clearAllFilters')}
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default RecordingFilters;
