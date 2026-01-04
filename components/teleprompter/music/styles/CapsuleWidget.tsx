/**
 * Capsule Widget Style Component
 *
 * Horizontal capsule layout (280×80px).
 * Features: Play/pause button (circle, left), music icon (center), source indicator (right).
 * Styling: Rounded pill shape, subtle shadow, glassmorphism effect.
 *
 * @feature 011-music-player-widget
 * @task T019
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Music, Youtube, FileAudio } from 'lucide-react';
import type { MusicSourceType } from '@/types/music';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface CapsuleWidgetProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  sourceType: MusicSourceType;
  className?: string;
}

export function CapsuleWidget({
  isPlaying,
  onPlayPause,
  sourceType,
  className,
}: CapsuleWidgetProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(
        'relative bg-black/60 backdrop-blur-md rounded-full',
        'border border-white/10 shadow-2xl',
        'flex items-center px-3 py-2 gap-3',
        'transition-all duration-200',
        'hover:bg-black/70 hover:shadow-lg hover:border-white/20',
        className
      )}
      style={{
        width: '280px',
        height: '80px',
      }}
      animate={{
        opacity: isPlaying ? 1 : 0.6,
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Play/Pause Button (left side) - T037: Enhanced accessibility */}
      <button
        onClick={onPlayPause}
        className={cn(
          // T038: Touch target minimum 44px (this is 56px)
          'flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black',
          isPlaying
            ? 'bg-white text-black hover:bg-white/90'
            : 'bg-gradient-to-r from-pink-500 to-violet-600 text-white hover:from-pink-600 hover:to-violet-700'
        )}
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
        aria-checked={isPlaying}
        role="switch"
        type="button"
      >
        {isPlaying ? (
          <Pause fill="currentColor" size={24} />
        ) : (
          <Play fill="currentColor" size={24} className="ml-1" />
        )}
      </button>

      {/* Music Icon/Indicator (center) */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Music
            className={cn(
              'transition-all duration-300',
              isPlaying ? 'text-pink-400 animate-pulse' : 'text-white/50'
            )}
            size={24}
          />
          {isPlaying && (
            <div className="flex items-end gap-0.5 h-4">
              {/* Animated bars for visual feedback */}
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-pink-500 to-violet-600 rounded-full"
                  style={{
                    height: `${8 + Math.random() * 8}px`,
                    animation: `pulse 0.5s ease-in-out ${i * 0.1}s infinite`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* T037: Source Type Indicator (right side) with descriptive labels */}
      <div
        className="flex-shrink-0 flex items-center justify-center"
        role="img"
        aria-label={`Music source: ${sourceType === 'youtube' ? 'YouTube' : 'uploaded file'}`}
      >
        {sourceType === 'youtube' ? (
          <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/30">
            <Youtube className="text-red-400" size={20} aria-hidden="true" />
          </div>
        ) : (
          <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
            <FileAudio className="text-blue-400" size={20} aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Pulsing glow effect when playing */}
      <motion.div
        className="absolute inset-0 rounded-full bg-primary/20 blur-xl pointer-events-none"
        animate={
          isPlaying && !prefersReducedMotion
            ? {
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Glassmorphism overlay */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
        }}
      />
    </motion.div>
  );
}
