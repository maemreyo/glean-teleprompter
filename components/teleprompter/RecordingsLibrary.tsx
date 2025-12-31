/**
 * RecordingsLibrary Component
 * Displays a paginated list of user's recorded videos with playback, download, and delete options
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Play, Download, Trash2, Calendar, Clock, HardDrive, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { Recording } from '@/types/recording';
import { listRecordings, deleteRecording } from '@/lib/supabase/recordings';
import { formatDuration, formatFileSize } from '@/lib/utils/video';
import { RecordingPlayer } from './RecordingPlayer';
import { RecordingDownload } from './RecordingDownload';
import { StorageQuota } from './StorageQuota';

interface RecordingsLibraryProps {
  className?: string;
}

export function RecordingsLibrary({ className }: RecordingsLibraryProps) {
  const t = useTranslations('RecordingsLibrary');
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  
  const limit = 20;
  const totalPages = Math.ceil(total / limit);

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
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) {
      return;
    }

    try {
      await deleteRecording(id);
      // Reload recordings after deletion
      await loadRecordings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recording');
    }
  };

  const handlePlay = (recording: Recording) => {
    setSelectedRecording(recording);
    setShowPlayer(true);
  };

  if (loading && recordings.length === 0) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Storage Quota Banner */}
      <StorageQuota className="mb-6" />

      {/* Recordings List */}
      {recordings.length === 0 ? (
        <div className="text-center py-16">
          <Video className="mx-auto h-16 w-16 text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">{t('noRecordings')}</h3>
          <p className="text-gray-500">{t('noRecordingsDesc')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recordings.map((recording, index) => (
            <motion.div
              key={recording.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-all"
            >
              <div className="flex items-center gap-4">
                {/* Thumbnail / Preview */}
                <div className="flex-shrink-0 w-32 h-20 bg-black rounded-lg overflow-hidden relative">
                  <video
                    src={recording.video_url}
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => handlePlay(recording)}
                  >
                    <Play className="h-8 w-8 text-white" />
                  </div>
                </div>

                {/* Recording Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 text-sm text-gray-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(recording.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatDuration(recording.duration)}
                    </span>
                    <span className="flex items-center gap-1">
                      <HardDrive size={14} />
                      {recording.size_mb.toFixed(1)} MB
                    </span>
                  </div>
                  {recording.script_snapshot && (
                    <p className="text-sm text-gray-300 line-clamp-2 mt-1">
                      {recording.script_snapshot.substring(0, 100)}...
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
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
                    onClick={() => handlePlay(recording)}
                    className="p-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white transition-colors"
                    title={t('playRecording')}
                  >
                    <Play size={18} />
                  </button>
                  <RecordingDownload
                    recording={recording}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  />
                  <button
                    onClick={() => handleDelete(recording.id)}
                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 transition-colors"
                    title={t('deleteRecording')}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t('previous')}
          </button>
          <span className="text-sm text-gray-400">
            {t('page')} {page} {t('of')} {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t('next')}
          </button>
        </div>
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
