/**
 * Vinyl Speed Selector Component
 * 
 * Allows users to select the rotation speed for the Vinyl widget style.
 * Includes preset RPM buttons and a custom BPM input.
 * 
 * @feature 011-music-player-widget
 */

'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMusicPlayerStore } from '@/lib/stores/useMusicPlayerStore';
import type { VinylSpeed } from '@/types/music';
import { cn } from '@/lib/utils';

export interface VinylSpeedSelectorProps {
  className?: string;
}

const SPEED_OPTIONS: {
  value: VinylSpeed;
  label: string;
  description: string;
}[] = [
  {
    value: '33-1/3',
    label: 'vinylSpeed.33',
    description: '33⅓ RPM',
  },
  {
    value: '45',
    label: 'vinylSpeed.45',
    description: '45 RPM',
  },
  {
    value: '78',
    label: 'vinylSpeed.78',
    description: '78 RPM',
  },
  {
    value: 'custom',
    label: 'vinylSpeed.custom',
    description: 'Custom BPM',
  },
];

export function VinylSpeedSelector({ className }: VinylSpeedSelectorProps) {
  const t = useTranslations('MusicPlayer');
  const vinylSpeed = useMusicPlayerStore((state) => state.vinylSpeed) || '45';
  const vinylCustomBPM = useMusicPlayerStore((state) => state.vinylCustomBPM) || 60;
  const setVinylSpeed = useMusicPlayerStore((state) => state.setVinylSpeed);
  const setVinylCustomBPM = useMusicPlayerStore((state) => state.setVinylCustomBPM);

  const [customBPMInput, setCustomBPMInput] = useState(vinylCustomBPM.toString());
  const [isCustomFocused, setIsCustomFocused] = useState(false);

  const handleSpeedChange = (speed: VinylSpeed) => {
    setVinylSpeed(speed);
  };

  const handleCustomBPMChange = (value: string) => {
    setCustomBPMInput(value);
    const bpm = parseInt(value, 10);
    if (!isNaN(bpm) && bpm >= 10 && bpm <= 200) {
      setVinylCustomBPM(bpm);
    }
  };

  const handleCustomBPMBlur = () => {
    setIsCustomFocused(false);
    const bpm = parseInt(customBPMInput, 10);
    if (isNaN(bpm) || bpm < 10 || bpm > 200) {
      // Reset to valid value
      setCustomBPMInput(vinylCustomBPM.toString());
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <label className="block text-sm font-medium">
        {t('vinylSpeed.label')}
      </label>
      <p className="text-sm text-muted-foreground">
        {t('vinylSpeed.description')}
      </p>

      {/* Speed Options */}
      <div className="flex flex-wrap gap-2">
        {SPEED_OPTIONS.map((option) => {
          const isSelected = vinylSpeed === option.value;
          const isCustom = option.value === 'custom';

          return (
            <div key={option.value} className={cn('flex-1 min-w-[70px]', isCustom && 'flex-2')}>
              <button
                onClick={() => handleSpeedChange(option.value)}
                className={cn(
                  'w-full px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium',
                  'hover:border-primary hover:bg-accent/50',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  isSelected ? 'border-primary bg-accent/50' : 'border-border'
                )}
                aria-pressed={isSelected}
                aria-label={`Select ${option.description} vinyl speed`}
              >
                {option.description}
              </button>
              
              {/* Custom BPM Input */}
              {isCustom && isSelected && (
                <div className="mt-2">
                  <input
                    type="number"
                    value={customBPMInput}
                    onChange={(e) => handleCustomBPMChange(e.target.value)}
                    onFocus={() => setIsCustomFocused(true)}
                    onBlur={handleCustomBPMBlur}
                    placeholder={t('vinylSpeed.custom')}
                    min={10}
                    max={200}
                    className={cn(
                      'w-full h-10 px-3 rounded-md border border-input bg-background text-sm',
                      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                      'placeholder:text-muted-foreground'
                    )}
                    aria-label="Custom beats per minute"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Range: 10-200 BPM
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
