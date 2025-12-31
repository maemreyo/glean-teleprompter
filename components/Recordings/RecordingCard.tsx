/**
 * RecordingCard Component
 * Individual recording card for grid view
 */

'use client';

import React from 'react';
import { Play, Calendar, Clock, HardDrive } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { Recording } from '@/types/recording';
import { formatDuration } from '@/lib/utils/video';
import { RecordingDownload } from '@/components/teleprompter/RecordingDownload';

interface RecordingCardProps {
  recording: Recording;
  isSelected?: boolean;
  isBulkMode?: boolean;
  onPlay: (recording: Recording) => void;
  onDelete: (id: string) => void;
  onToggleSelection?: (id: string) => void;
}

export function RecordingCard({
  recording,
  isSelected = false,
  isBulkMode = false,
  onPlay,
  onDelete,
  onToggleSelection,
}: RecordingCardProps) {
  const t = useTranslations('RecordingCard');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={`relative bg-white/10 backdrop-blur rounded-xl overflow-hidden border transition-all group ${
        isSelected 
          ? 'border-pink-500 ring-2 ring-pink-500/50' 
          : 'border-white/10 hover:border-white/20'
      }`}
    >
      {/* Bulk Selection Checkbox */}
      {isBulkMode && onToggleSelection && (
        <div className="absolute top-3 left-3 z-10">
          <button
            onClick={() => onToggleSelection(recording.id)}
            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
              isSelected
                ? 'bg-pink-500 border-pink-500'
                : 'bg-black/50 border-white/30 hover:border-white/50'
            }`}
          >
            {isSelected && (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Thumbnail/Preview */}
      <div className="aspect-video bg-black relative overflow-hidden">
        <video
          src={recording.video_url}
          className="w-full h-full object-cover"
          preload="metadata"
          muted
        />
        
        {/* Play Overlay */}
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={() => onPlay(recording)}
        >
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <Play className="w-6 h-6 text-white ml-1" fill="white" />
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white">
          {formatDuration(recording.duration)}
        </div>
      </div>

      {/* Recording Info */}
      <div className="p-4">
        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {new Date(recording.created_at).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <HardDrive size={12} />
            {recording.size_mb.toFixed(1)} MB
          </span>
        </div>

        {/* Quality Badge */}
        <div className="flex items-center gap-2 mb-3">
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

        {/* Script Preview */}
        {recording.script_snapshot && (
          <p className="text-sm text-gray-300 line-clamp-2 mb-3">
            {recording.script_snapshot.substring(0, 80)}...
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPlay(recording)}
            className="flex-1 py-2 px-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {t('play')}
          </button>
          <RecordingDownload
            recording={recording}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          />
          <button
            onClick={() => onDelete(recording.id)}
            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 transition-colors"
            title={t('delete')}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default RecordingCard;
