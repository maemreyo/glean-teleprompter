/**
 * Widget Style Selector Component
 * 
 * Allows users to choose the visual style of the music player widget.
 * Shows visual previews of each style option.
 * 
 * @feature 011-music-player-widget
 */

'use client';

import React from 'react';
import { Circle, Disc, BarChart3 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMusicPlayerStore } from '@/lib/stores/useMusicPlayerStore';
import type { WidgetStyle } from '@/types/music';
import { cn } from '@/lib/utils';

export interface WidgetStyleSelectorProps {
  className?: string;
}

const STYLES: {
  id: WidgetStyle;
  icon: React.ReactNode;
  name: string;
  description: string;
}[] = [
  {
    id: 'capsule',
    icon: <Circle className="h-5 w-5" />,
    name: 'widgetStyle.capsule.name',
    description: 'widgetStyle.capsule.description',
  },
  {
    id: 'vinyl',
    icon: <Disc className="h-5 w-5" />,
    name: 'widgetStyle.vinyl.name',
    description: 'widgetStyle.vinyl.description',
  },
  {
    id: 'spectrum',
    icon: <BarChart3 className="h-5 w-5" />,
    name: 'widgetStyle.spectrum.name',
    description: 'widgetStyle.spectrum.description',
  },
];

export function WidgetStyleSelector({ className }: WidgetStyleSelectorProps) {
  const t = useTranslations('MusicPlayer');
  const widgetStyle = useMusicPlayerStore((state) => state.widgetStyle);
  const setWidgetStyle = useMusicPlayerStore((state) => state.setWidgetStyle);

  const handleStyleChange = (style: WidgetStyle) => {
    setWidgetStyle(style);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <label className="block text-sm font-medium">
        {t('widgetStyle.label')}
      </label>
      <p className="text-sm text-muted-foreground">
        {t('widgetStyle.description')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {STYLES.map((style) => {
          const isSelected = widgetStyle === style.id;

          return (
            <button
              key={style.id}
              onClick={() => handleStyleChange(style.id)}
              className={cn(
                'relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all',
                'hover:border-primary hover:bg-accent/50',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                isSelected ? 'border-primary bg-accent/50' : 'border-border'
              )}
              aria-pressed={isSelected}
              aria-label={`Select ${t(style.name)} widget style`}
            >
              <div className={cn(
                'h-12 w-12 rounded-full flex items-center justify-center transition-colors',
                isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
              )}>
                {style.icon}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">{t(style.name)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t(style.description)}
                </p>
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
