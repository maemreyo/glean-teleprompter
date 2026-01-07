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
 * @task T031
 * @task T032
 * @task T033
 */

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Music, Youtube, FileAudio } from 'lucide-react';
import type { MusicSourceType } from '@/types/music';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Number of spectrum bars
 */
const BAR_COUNT = 16;

/**
 * Props for SpectrumWidget including optional audio element for Web Audio API
 */
export interface SpectrumWidgetProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  sourceType: MusicSourceType;
  className?: string;
  audioElement?: HTMLAudioElement | null; // For Web Audio API analysis
}

/**
 * Generate simulated bar height for a specific bar index
 * Used for YouTube source where Web Audio API doesn't work (CORS)
 */
function getSimulatedBarHeight(index: number, isPlaying: boolean, timestamp: number): number {
  if (!isPlaying) return 20; // baseline when paused

  // Create wave pattern with time-based variation for smooth animation
  const baseWave = Math.sin((index / BAR_COUNT) * Math.PI * 2 + timestamp * 0.003) * 0.5 + 0.5;
  const secondaryWave = Math.sin((index / BAR_COUNT) * Math.PI * 4 + timestamp * 0.002) * 0.3;
  const variation = Math.sin(timestamp * 0.01 + index * 0.5) * 0.2;
  
  const height = baseWave * 50 + secondaryWave * 20 + variation * 20 + 30;
  return Math.max(20, Math.min(100, height));
}

export function SpectrumWidget({
  isPlaying,
  onPlayPause,
  sourceType,
  className,
  audioElement,
}: SpectrumWidgetProps) {
  const prefersReducedMotion = useReducedMotion();
  
  // State for bar heights
  const [barHeights, setBarHeights] = useState<number[]>(new Array(BAR_COUNT).fill(20));
  const [timestamp, setTimestamp] = useState(0);

  // Web Audio API refs for uploaded files
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize Web Audio API for uploaded files
  useEffect(() => {
    if (sourceType !== 'upload' || !audioElement) {
      return;
    }

    // Create audio context and analyzer only once
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 64; // 32 frequency bins
        
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      } catch (error) {
        console.warn('Web Audio API initialization failed:', error);
        return;
      }
    }

    return () => {
      // Cleanup - capture ref value locally
      const animationId = animationFrameRef.current;
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [sourceType, audioElement]);

  // Animation loop for Web Audio API (uploaded files) or simulated (YouTube)
  useEffect(() => {
    if (prefersReducedMotion) {
      // Set baseline heights when reduced motion is preferred
      setBarHeights(new Array(BAR_COUNT).fill(20));
      return;
    }

    let animationId: number;

    if (sourceType === 'upload' && isPlaying && analyserRef.current && audioElement) {
      // Real Web Audio API analysis for uploaded files
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const animate = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Map frequency data to bar heights (use lower frequencies which are more visually interesting)
        const heights = new Array(BAR_COUNT).fill(20);
        for (let i = 0; i < BAR_COUNT; i++) {
          const dataIndex = Math.floor((i / BAR_COUNT) * (bufferLength * 0.7)); // Use 70% of frequency range
          const value = dataArray[dataIndex] || 0;
          heights[i] = Math.max(20, Math.min(100, (value / 255) * 100));
        }
        
        setBarHeights(heights);
        animationId = requestAnimationFrame(animate);
      };

      animate();
    } else if (sourceType === 'youtube') {
      // Simulated animation for YouTube
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        setTimestamp(elapsed);

        if (isPlaying) {
          const heights = new Array(BAR_COUNT).fill(20).map((_, i) =>
            getSimulatedBarHeight(i, isPlaying, elapsed)
          );
          setBarHeights(heights);
        } else {
          setBarHeights(new Array(BAR_COUNT).fill(20));
        }

        animationId = requestAnimationFrame(animate);
      };

      animate();
    } else {
      // Paused state - baseline
      setBarHeights(new Array(BAR_COUNT).fill(20));
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPlaying, sourceType, prefersReducedMotion, audioElement]);

  return (
    <motion.div
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
      animate={{
        opacity: isPlaying ? 1 : 0.8,
      }}
      transition={{ duration: 0.3 }}
    >
      {/* T037/T038: Play/Pause Button (left side) with enhanced accessibility */}
      <button
        onClick={onPlayPause}
        className={cn(
          // T038: Touch target minimum 44px (this is 56px)
          'shrink-0 w-14 h-14 rounded-full flex items-center justify-center',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black',
          isPlaying
            ? 'bg-white text-black hover:bg-white/90'
            : 'bg-linear-to-r from-pink-500 to-violet-600 text-white hover:from-pink-600 hover:to-violet-700'
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

      {/* T037: Spectrum Bars (center) - decorative, hidden from screen readers */}
      <div
        className="flex-1 flex items-end justify-center gap-1 h-full py-2"
        role="img"
        aria-label={isPlaying ? 'Audio spectrum visualizer showing music playing' : 'Audio spectrum visualizer showing music paused'}
      >
        <AnimatePresence mode="popLayout">
          {barHeights.map((height, index) => (
            <motion.div
              key={index}
              className={cn(
                'flex-1 max-w-[12px] min-w-[4px] rounded-t-sm',
                'bg-linear-to-t from-pink-600 via-violet-600 to-cyan-500'
              )}
              aria-hidden="true"
              initial={{ height: '20%' }}
              animate={{
                height: `${height}%`,
              }}
              exit={{ height: '20%' }}
              transition={{
                duration: 0.15,
                ease: 'easeOut',
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* T037: Source Indicator and Music Icon (right side) with accessibility */}
      <div
        className="shrink-0 flex flex-col items-center gap-2"
        role="img"
        aria-label={`Music source: ${sourceType === 'youtube' ? 'YouTube' : 'uploaded file'}, status: ${isPlaying ? 'playing' : 'paused'}`}
      >
        {/* Music Icon */}
        <Music
          className={cn(
            'transition-all duration-300',
            isPlaying ? 'text-pink-400' : 'text-white/50'
          )}
          size={20}
          aria-hidden="true"
        />
        {/* Source Type Badge */}
        {sourceType === 'youtube' ? (
          <div className="p-1.5 rounded-lg bg-red-500/20 border border-red-500/30">
            <Youtube className="text-red-400" size={16} aria-hidden="true" />
          </div>
        ) : (
          <div className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30">
            <FileAudio className="text-blue-400" size={16} aria-hidden="true" />
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
      <motion.div
        className={cn(
          'absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl',
          'bg-linear-to-r from-pink-500 via-violet-600 to-cyan-500'
        )}
        animate={{
          opacity: isPlaying ? 1 : 0.3,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}
