/**
 * RecordingListView Component
 * List view for recordings with detailed information
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Calendar, Clock, HardDrive } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Recording } from '@/types/recording';
import { formatDuration, formatFileSize } from '@/lib/utils/video';
import { RecordingDownload } from '@/components/teleprompter/RecordingDownload';

interface RecordingListViewProps {
  recordings: Recording[];
  selectedIds: Set<string>;
  isBulkMode: boolean;
  onPlay: (recording: Recording) => void;
  onDelete: (id: string) => void;
  onToggleSelection: (id: string) => void;
}

export function RecordingListView({
  recordings,
  selectedIds,
  isBulkMode,
  onPlay,
  onDelete,
  onToggleSelection,
}: RecordingListViewProps) {
  const t = useTranslations('RecordingListView');

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {recordings.map((recording, index) => {
          const isSelected = selectedIds.has(recording.id);

          return (
            <motion.div
              key={recording.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`bg-white/10 backdrop-blur rounded-xl p-4 border transition-all ${
                isSelected 
                  ? 'border-pink-500 ring-1 ring-pink-500/50' 
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Bulk Selection Checkbox */}
                {isBulkMode && (
                  <div className="pt-1">
                    <button
                      onClick={() => onToggleSelection(recording.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-pink-500 border-pink-500'
                          : 'bg-black/50 border-white/30 hover:border-white/50'
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}

                {/* Thumbnail / Preview */}
                <div className="flex-shrink-0 w-40 h-24 bg-black rounded-lg overflow-hidden relative group">
                  <video
                    src={recording.video_url}
                    className="w-full h-full object-cover"
                    preload="metadata"
                    muted
                  />
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => onPlay(recording)}
                  >
                    <Play className="h-8 w-8 text-white" fill="white" />
                  </div>
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-xs text-white">
                    {formatDuration(recording.duration)}
                  </div>
                </div>

                {/* Recording Info */}
                <div className="flex-1 min-w-0">
                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(recording.created_at).toLocaleDateString()} {new Date(recording.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatDuration(recording.duration)}
                    </span>
                    <span className="flex items-center gap-1">
                      <HardDrive size={14} />
                      {formatFileSize(recording.size_mb * 1024 * 1024)}
                    </span>
                  </div>

                  {/* Script Preview */}
                  {recording.script_snapshot && (
                    <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                      {recording.script_snapshot.substring(0, 150)}
                      {recording.script_snapshot.length > 150 && '...'}
                    </p>
                  )}

                  {/* Quality and Format Badges */}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      recording.recording_quality === 'standard'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {recording.recording_quality} {t('quality')}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-gray-500/20 text-gray-300">
                      {recording.file_format.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPlay(recording)}
                    className="p-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white transition-colors"
                    title={t('playRecording')}
                  >
                    <Play size={18} fill="white" />
                  </button>
                  <RecordingDownload
                    recording={recording}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  />
                  <button
                    onClick={() => onDelete(recording.id)}
                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 transition-colors"
                    title={t('deleteRecording')}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default RecordingListView;
