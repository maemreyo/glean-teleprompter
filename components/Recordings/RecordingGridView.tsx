/**
 * RecordingGridView Component
 * Grid view for recordings with card-based layout
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Recording } from '@/types/recording';
import { RecordingCard } from './RecordingCard';

interface RecordingGridViewProps {
  recordings: Recording[];
  selectedIds: Set<string>;
  isBulkMode: boolean;
  onPlay: (recording: Recording) => void;
  onDelete: (id: string) => void;
  onToggleSelection: (id: string) => void;
}

export function RecordingGridView({
  recordings,
  selectedIds,
  isBulkMode,
  onPlay,
  onDelete,
  onToggleSelection,
}: RecordingGridViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <AnimatePresence mode="popLayout">
        {recordings.map((recording) => (
          <RecordingCard
            key={recording.id}
            recording={recording}
            isSelected={selectedIds.has(recording.id)}
            isBulkMode={isBulkMode}
            onPlay={onPlay}
            onDelete={onDelete}
            onToggleSelection={onToggleSelection}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export default RecordingGridView;
