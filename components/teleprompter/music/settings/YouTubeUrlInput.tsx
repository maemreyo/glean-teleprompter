/**
 * YouTube URL Input Component
 * 
 * Allows users to input and validate YouTube URLs for background music.
 * 
 * @feature 011-music-player-widget
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Youtube } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { validateYouTubeUrl, getYouTubeErrorMessage } from '@/lib/music/audioSourceValidation';
import { useMusicPlayerStore } from '@/lib/stores/useMusicPlayerStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface YouTubeUrlInputProps {
  className?: string;
}

export function YouTubeUrlInput({ className }: YouTubeUrlInputProps) {
  const t = useTranslations('MusicPlayer');
  const youtubeUrl = useMusicPlayerStore((state) => state.youtubeUrl);
  const setYoutubeUrl = useMusicPlayerStore((state) => state.setYoutubeUrl);
  const setSourceType = useMusicPlayerStore((state) => state.setSourceType);

  const [url, setUrl] = useState(youtubeUrl || '');
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  // Initialize with current store value
  useEffect(() => {
    setUrl(youtubeUrl || '');
    if (youtubeUrl) {
      const result = validateYouTubeUrl(youtubeUrl);
      setIsValid(result.isValid);
      setError(result.isValid ? null : getYouTubeErrorMessage(result.error!).title);
    }
  }, [youtubeUrl]);

  const handleChange = (value: string) => {
    setUrl(value);

    if (!value || value.trim().length === 0) {
      setIsValid(null);
      setError(null);
      return;
    }

    const result = validateYouTubeUrl(value);

    if (result.isValid) {
      setIsValid(true);
      setError(null);
      setYoutubeUrl(value);
      setSourceType('youtube');
    } else {
      setIsValid(false);
      const errorMsg = getYouTubeErrorMessage(result.error!);
      setError(errorMsg.title);
      // Don't show toast for typing - just show inline error
    }
  };

  const handleBlur = () => {
    if (url && isValid) {
      toast.success(t('source.youtube.label'), {
        description: 'YouTube URL saved',
      });
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor="youtube-url" className="block text-sm font-medium">
        {t('source.youtube.label')}
      </label>
      <div className="relative">
        <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          id="youtube-url"
          type="text"
          value={url}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={t('source.youtube.placeholder')}
          aria-invalid={isValid === false ? 'true' : undefined}
          aria-describedby={error ? 'youtube-error' : undefined}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            isValid === false && 'border-destructive focus-visible:ring-destructive',
            isValid === true && 'border-green-500 focus-visible:ring-green-500'
          )}
        />
      </div>
      {error && (
        <p id="youtube-error" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {!error && (
        <p className="text-sm text-muted-foreground">
          {t('source.youtube.description')}
        </p>
      )}
    </div>
  );
}
