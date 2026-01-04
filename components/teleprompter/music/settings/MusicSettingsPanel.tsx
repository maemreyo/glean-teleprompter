/**
 * Music Settings Panel Component
 *
 * Main configuration panel for the music player widget.
 * Integrates source selection (YouTube/Upload) and widget styling.
 *
 * @feature 011-music-player-widget
 */

'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMusicPlayerStore } from '@/lib/stores/useMusicPlayerStore';
import type { MusicSourceType } from '@/types/music';
import { cn } from '@/lib/utils';
import { YouTubeUrlInput } from './YouTubeUrlInput';
import { FileUploadInput } from './FileUploadInput';
import { WidgetStyleSelector } from './WidgetStyleSelector';
import { VinylSpeedSelector } from './VinylSpeedSelector';

export interface MusicSettingsPanelProps {
  className?: string;
}

export function MusicSettingsPanel({ className }: MusicSettingsPanelProps) {
  const t = useTranslations('MusicPlayer');
  const sourceType = useMusicPlayerStore((state) => state.sourceType);
  const setSourceType = useMusicPlayerStore((state) => state.setSourceType);
  const widgetStyle = useMusicPlayerStore((state) => state.widgetStyle);
  const [activeTab, setActiveTab] = useState<MusicSourceType>(sourceType);

  const handleTabChange = (value: MusicSourceType) => {
    setActiveTab(value);
    setSourceType(value);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-1">{t('settings.title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('settings.description')}
        </p>
      </div>

      {/* Music Source Selection */}
      <div className="space-y-4">
        <label className="block text-sm font-medium">
          {t('settings.sourceType')}
        </label>
        
        {/* Custom Tab Implementation */}
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full">
          <button
            onClick={() => handleTabChange('youtube')}
            className={cn(
              'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1',
              activeTab === 'youtube'
                ? 'bg-background text-foreground shadow-sm'
                : 'hover:bg-background/50'
            )}
            aria-selected={activeTab === 'youtube'}
            role="tab"
          >
            {t('settings.source.youtube')}
          </button>
          <button
            onClick={() => handleTabChange('upload')}
            className={cn(
              'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1',
              activeTab === 'upload'
                ? 'bg-background text-foreground shadow-sm'
                : 'hover:bg-background/50'
            )}
            aria-selected={activeTab === 'upload'}
            role="tab"
          >
            {t('settings.source.upload')}
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4" role="tabpanel">
          {activeTab === 'youtube' && <YouTubeUrlInput />}
          {activeTab === 'upload' && <FileUploadInput />}
        </div>
      </div>

      {/* Widget Style Selection */}
      <div className="pt-4 border-t border-border">
        <WidgetStyleSelector />
        
        {/* Vinyl Speed Selector - Only shown when Vinyl style is selected */}
        {widgetStyle === 'vinyl' && (
          <div className="mt-4 pt-4 border-t border-border">
            <VinylSpeedSelector />
          </div>
        )}
      </div>
    </div>
  );
}
