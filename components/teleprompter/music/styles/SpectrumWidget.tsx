/**
 * Spectrum Widget Style Component
 *
 * Rectangular spectrum layout (320×120px).
 * Features: Bar chart visualization (15-20 bars), play/pause button (overlay or side),
 * source indicator.
 * Styling: Modern gradient bars, smooth animations.
 * Note: Actual spectrum animation will be added in Phase 5 (Web Audio API).
 *
 * @feature 011-music-player-widget
 * @task T021
 */

'use client';

import React from 'react';
import { Play, Pause, Music, Youtube, FileAudio } from 'lucide-react';
import type { MusicSourceType } from '@/types/music';
import { cn } from '@/lib/utils';

export interface SpectrumWidgetProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  sourceType: MusicSourceType;
  className?: string;
}

/**
 * Number of spectrum bars
 */
const BAR_COUNT = 16;

/**
 * Generate static bar heights for visualization
 * In Phase 5, these will be animated based on Web Audio API data
 */
function generateBarHeights(): number[] {
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    // Create a wave-like pattern
    const center = BAR_COUNT / 2;
    const distance = Math.abs(i - center);
    const baseHeight = 20;
    const maxHeight = 80;
    const height = baseHeight + (maxHeight - baseHeight) * (1 - distance / center);
    return Math.max(15, Math.min(100, height));
  });
}

export function SpectrumWidget({
  isPlaying,
  onPlayPause,
  sourceType,
  className,
}: SpectrumWidgetProps) {
  const barHeights = React.useMemo(() => generateBarHeights(), []);

  return (
    <div
      className={cn(
        'relative bg-black/60 backdrop-blur-md rounded-2xl',
        'border border-white/10 shadow-2xl',
        'flex items-center px-4 py-3 gap-4',
        'transition-all duration-200',
        'hover:bg-black/70 hover:shadow-lg hover:border-white/20',
        className
      )}
      style={{
        width: '320px',
        height: '120px',
      }}
    >
      {/* Play/Pause Button (left side) */}
      <button
        onClick={onPlayPause}
        className={cn(
          'flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black',
          isPlaying
            ? 'bg-white text-black hover:bg-white/90'
            : 'bg-gradient-to-r from-pink-500 to-violet-600 text-white hover:from-pink-600 hover:to-violet-700'
        )}
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
        aria-pressed={isPlaying}
      >
        {isPlaying ? (
          <Pause fill="currentColor" size={24} />
        ) : (
          <Play fill="currentColor" size={24} className="ml-1" />
        )}
      </button>

      {/* Spectrum Bars (center) */}
      <div className="flex-1 flex items-end justify-center gap-1 h-full py-2">
        {barHeights.map((height, index) => (
          <div
            key={index}
            className={cn(
              'flex-1 max-w-[12px] min-w-[4px] rounded-t-sm',
              'transition-all duration-150 ease-out',
              'bg-gradient-to-t from-pink-600 via-violet-600 to-cyan-500',
              isPlaying && 'animate-pulse'
            )}
            style={{
              height: `${isPlaying ? height : 15}%`,
              animationDelay: isPlaying ? `${index * 0.05}s` : undefined,
              animationDuration: '0.5s',
            }}
          />
        ))}
      </div>

      {/* Source Indicator and Music Icon (right side) */}
      <div className="flex-shrink-0 flex flex-col items-center gap-2">
        {/* Music Icon */}
        <Music
          className={cn(
            'transition-all duration-300',
            isPlaying ? 'text-pink-400' : 'text-white/50'
          )}
          size={20}
        />
        {/* Source Type Badge */}
        {sourceType === 'youtube' ? (
          <div className="p-1.5 rounded-lg bg-red-500/20 border border-red-500/30">
            <Youtube className="text-red-400" size={16} />
          </div>
        ) : (
          <div className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30">
            <FileAudio className="text-blue-400" size={16} />
          </div>
        )}
      </div>

      {/* Glassmorphism overlay */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 50%)',
        }}
      />

      {/* Bottom accent line */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl',
          'bg-gradient-to-r from-pink-500 via-violet-600 to-cyan-500',
          'transition-all duration-300',
          isPlaying ? 'opacity-100' : 'opacity-30'
        )}
      />
    </div>
  );
}
