/**
 * BulkActionsBar Component
 * Action bar for bulk operations on recordings
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Trash2, Download, FolderPlus, Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onClearSelection: () => void;
  onSelectAll: () => void;
  onBulkDelete: () => void;
  onDownloadSelected: () => void;
  onOrganizeSelected: () => void;
}

export function BulkActionsBar({
  selectedCount,
  totalCount,
  onClearSelection,
  onSelectAll,
  onBulkDelete,
  onDownloadSelected,
  onOrganizeSelected,
}: BulkActionsBarProps) {
  const t = useTranslations('BulkActionsBar');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-pink-500/20 backdrop-blur border border-pink-500/30 rounded-xl p-4 mb-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Selection Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Check className="text-pink-400" size={20} />
              <span className="text-white font-medium">
                {selectedCount} {t('selected')}
              </span>
            </div>
            
            {totalCount > 0 && (
              <button
                onClick={onSelectAll}
                className="text-sm text-pink-300 hover:text-pink-200 transition-colors"
              >
                {selectedCount === totalCount ? t('deselectAll') : t('selectAll')}
              </button>
            )}
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onDownloadSelected}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              title={t('downloadSelected')}
            >
              <Download size={16} />
              <span className="hidden sm:inline">{t('download')}</span>
            </button>
            
            <button
              onClick={onOrganizeSelected}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              title={t('organizeSelected')}
            >
              <FolderPlus size={16} />
              <span className="hidden sm:inline">{t('organize')}</span>
            </button>
            
            <button
              onClick={() => {}}
              disabled={selectedCount === 0}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={t('shareSelected')}
            >
              <Share2 size={16} />
              <span className="hidden sm:inline">{t('share')}</span>
            </button>
            
            <button
              onClick={onBulkDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
              title={t('deleteSelected')}
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">{t('delete')}</span>
            </button>
            
            <button
              onClick={onClearSelection}
              className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors"
              title={t('clearSelection')}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default BulkActionsBar;
