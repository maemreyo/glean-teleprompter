/**
 * Vinyl Widget Style Component
 *
 * Circular vinyl record layout (200×200px).
 * Features: Rotating vinyl disc with grooves, center label with play/pause button,
 * tonearm indicator, RPM/speed indicator.
 * Styling: Dark disc with grooves, center label, realistic vinyl appearance.
 * Note: Actual rotation animation will be added in Phase 5.
 *
 * @feature 011-music-player-widget
 * @task T020
 */

'use client';

import React from 'react';
import { Play, Pause, Disc3 } from 'lucide-react';
import type { VinylSpeed } from '@/types/music';
import { cn } from '@/lib/utils';

export interface VinylWidgetProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  vinylSpeed: VinylSpeed;
  className?: string;
}

/**
 * Get RPM display text from vinyl speed
 */
function getRPMText(speed: VinylSpeed): string {
  if (speed === 'custom') {
    return 'CUSTOM';
  }
  return speed.replace('-', ' ') + ' RPM';
}

/**
 * Get rotation duration based on speed (for Phase 5 animation)
 */
function getRotationDuration(speed: VinylSpeed): string {
  const speeds: Record<VinylSpeed, number> = {
    '33-1/3': 1.8,
    '45': 1.33,
    '78': 0.77,
    'custom': 1.5,
  };
  return `${speeds[speed]}s`;
}

export function VinylWidget({
  isPlaying,
  onPlayPause,
  vinylSpeed,
  className,
}: VinylWidgetProps) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        className
      )}
      style={{
        width: '200px',
        height: '200px',
      }}
    >
      {/* Vinyl Disc */}
      <div
        className={cn(
          'absolute inset-0 rounded-full',
          'bg-gradient-to-br from-gray-900 via-gray-800 to-black',
          'border-4 border-gray-700 shadow-2xl',
          'overflow-hidden'
        )}
      >
        {/* Vinyl Grooves - concentric circles */}
        <svg
          className="absolute inset-0 w-full h-full opacity-30"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          {[...Array(15)].map((_, i) => (
            <circle
              key={i}
              cx="100"
              cy="100"
              r={30 + i * 5.5}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gray-600"
            />
          ))}
        </svg>

        {/* Shine reflection effect */}
        <div
          className="absolute inset-0 rounded-full opacity-20"
          style={{
            background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)',
          }}
        />
      </div>

      {/* Center Label */}
      <div
        className={cn(
          'relative z-10 rounded-full',
          'bg-gradient-to-br from-red-600 to-red-800',
          'border-4 border-gray-900',
          'flex flex-col items-center justify-center',
          'shadow-inner'
        )}
        style={{
          width: '80px',
          height: '80px',
        }}
      >
        {/* Play/Pause Button in center */}
        <button
          onClick={onPlayPause}
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-red-700',
            isPlaying
              ? 'bg-white text-red-700 hover:bg-white/90'
              : 'bg-gradient-to-r from-pink-500 to-violet-600 text-white hover:from-pink-600 hover:to-violet-700'
          )}
          aria-label={isPlaying ? 'Pause music' : 'Play music'}
          aria-pressed={isPlaying}
        >
          {isPlaying ? (
            <Pause fill="currentColor" size={18} />
          ) : (
            <Play fill="currentColor" size={18} className="ml-0.5" />
          )}
        </button>
      </div>

      {/* Center Spindle Hole */}
      <div
        className="absolute z-20 rounded-full bg-gray-900 border border-gray-700"
        style={{
          width: '8px',
          height: '8px',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Tonearm Indicator (top-right) */}
      <div
        className={cn(
          'absolute -top-2 -right-2',
          'w-12 h-12 rounded-full',
          'bg-gray-800 border-2 border-gray-600',
          'flex items-center justify-center',
          'shadow-lg',
          isPlaying && 'animate-bounce'
        )}
      >
        <Disc3
          className={cn(
            'transition-colors',
            isPlaying ? 'text-pink-400' : 'text-gray-400'
          )}
          size={20}
        />
      </div>

      {/* RPM Speed Indicator (bottom) */}
      <div
        className={cn(
          'absolute -bottom-6 left-1/2 -translate-x-1/2',
          'px-2 py-0.5 rounded',
          'bg-black/60 backdrop-blur-sm border border-white/10',
          'text-[10px] font-bold tracking-wider text-white/70'
        )}
      >
        {getRPMText(vinylSpeed)}
      </div>

      {/* Glassmorphism overlay */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        }}
      />
    </div>
  );
}
