/**
 * File Upload Input Component
 * 
 * Allows users to upload audio files for background music.
 * Handles file validation, quota checking, and Supabase Storage upload.
 * 
 * @feature 011-music-player-widget
 */

'use client';

import React, { useState, useRef } from 'react';
import { Upload, Music, X, FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { validateAudioFile, validateFileQuota, formatBytes, getAudioFileErrorMessage } from '@/lib/music/audioSourceValidation';
import { useMusicPlayerStore } from '@/lib/stores/useMusicPlayerStore';
import { uploadAudioFile, getAudioStorageUsage } from '@/lib/supabase/storage';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface FileUploadInputProps {
  className?: string;
}

export function FileUploadInput({ className }: FileUploadInputProps) {
  const t = useTranslations('MusicPlayer');
  const uploadedFileId = useMusicPlayerStore((state) => state.uploadedFileId);
  const setUploadedFileId = useMusicPlayerStore((state) => state.setUploadedFileId);
  const setSourceType = useMusicPlayerStore((state) => state.setSourceType);
  const user = useAuthStore((state) => state.user);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    // Validate file
    const result = validateAudioFile(file);

    if (!result.isValid && result.error) {
      const errorMsg = getAudioFileErrorMessage(result.error);
      toast.error(errorMsg.title, {
        description: errorMsg.description,
      });
      return;
    }

    // Check quota with actual Supabase usage
    const userId = user?.id || 'anonymous';
    let currentUsage = 0;
    
    try {
      currentUsage = await getAudioStorageUsage(userId);
    } catch (error) {
      console.warn('Failed to fetch storage usage, assuming 0:', error);
    }
    
    const quotaResult = validateFileQuota(file.size, currentUsage);

    if (!quotaResult.isValid && quotaResult.error) {
      const errorMsg = getAudioFileErrorMessage(quotaResult.error);
      toast.error(errorMsg.title, {
        description: errorMsg.description,
      });
      return;
    }

    // File is valid, proceed with upload
    setIsUploading(true);

    try {
      // Upload to Supabase Storage
      const fileId = await uploadAudioFile(userId, file);
      
      setUploadedFileId(fileId);
      setSourceType('upload');
      setUploadedFileName(file.name);

      toast.success(t('source.upload.uploadSuccess'), {
        description: `${file.name} (${formatBytes(file.size)})`,
      });
    } catch (error) {
      toast.error(t('source.upload.uploadFailed'), {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setUploadedFileId('');
    setUploadedFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info(t('source.upload.fileRemoved'));
  };

  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor="audio-file" className="block text-sm font-medium">
        {t('source.upload.label')}
      </label>

      {!uploadedFileId ? (
        <>
          <div className="flex items-center gap-4">
            <label
              htmlFor="audio-file"
              className={cn(
                'flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
                'hover:border-primary hover:bg-accent/50',
                isUploading && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2" />
                    <p className="text-sm text-muted-foreground">{t('source.upload.uploading')}</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-primary">{t('source.upload.selectFile')}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('source.upload.supportedFormats')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('source.upload.maxSize')}
                    </p>
                  </>
                )}
              </div>
              <input
                id="audio-file"
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleChange}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-between p-3 rounded-lg border bg-accent/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Music className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{uploadedFileName || 'Uploaded audio'}</p>
              <p className="text-xs text-muted-foreground">Ready to play</p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="p-2 hover:bg-destructive/10 rounded-full transition-colors"
            aria-label="Remove audio file"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        {t('source.upload.description')}
      </p>
    </div>
  );
}
