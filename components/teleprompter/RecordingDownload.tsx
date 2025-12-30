/**
 * RecordingDownload Component
 * Button component for downloading recorded videos
 */

'use client';

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import type { Recording } from '@/types/recording';
import { getFileExtension } from '@/lib/utils/video';

interface RecordingDownloadProps {
  recording: Recording;
  className?: string;
}

export function RecordingDownload({ recording, className }: RecordingDownloadProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);

      // Use the converted URL if available, otherwise use original
      const downloadUrl = recording.converted_url || recording.video_url;
      const format = recording.converted_url 
        ? downloadUrl.split('.').pop() || recording.file_format
        : recording.file_format;
      const extension = getFileExtension(format as 'webm' | 'mp4');

      // Fetch the file
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error('Failed to download recording');
      }

      const blob = await response.blob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `recording_${new Date(recording.created_at).toISOString().split('T')[0]}${extension}`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download recording. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className={className}
      title="Download recording"
    >
      {downloading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Download size={18} />
      )}
    </button>
  );
}
