/**
 * Music Player Widget Component
 *
 * Floating draggable widget for Runner mode.
 * Features: Position state, play/pause controls, source detection (YouTube/file upload),
 * style-based rendering (Capsule, Vinyl, Spectrum), position persistence to localStorage.
 *
 * @feature 011-music-player-widget
 * @task T018 (with T022, T023)
 */

'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import ReactPlayer from 'react-player';
import { useMusicPlayerStore } from '@/lib/stores/useMusicPlayerStore';
import { constrainPosition, getViewportDimensions, WIDGET_DIMENSIONS } from '@/lib/music/widgetDimensions';
import { toast } from 'sonner';
import { CapsuleWidget } from './styles/CapsuleWidget';
import { VinylWidget } from './styles/VinylWidget';
import { SpectrumWidget } from './styles/SpectrumWidget';
import { cn } from '@/lib/utils';

const MUSIC_STORAGE_BUCKET = 'user_music';

/**
 * Get Supabase Storage public URL for uploaded music files
 */
function getMusicFileUrl(fileId: string): string {
  if (typeof window === 'undefined') return '';
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.error('[MusicWidget] NEXT_PUBLIC_SUPABASE_URL not defined');
    return '';
  }
  
  return `${supabaseUrl}/storage/v1/object/public/${MUSIC_STORAGE_BUCKET}/${fileId}`;
}

export function MusicPlayerWidget() {
  const store = useMusicPlayerStore();
  
  // State from store
  const position = useMusicPlayerStore((state) => state.position);
  const playbackState = useMusicPlayerStore((state) => state.playbackState);
  const widgetStyle = useMusicPlayerStore((state) => state.widgetStyle);
  const sourceType = useMusicPlayerStore((state) => state.sourceType);
  const youtubeUrl = useMusicPlayerStore((state) => state.youtubeUrl);
  const uploadedFileId = useMusicPlayerStore((state) => state.uploadedFileId);
  const vinylSpeed = useMusicPlayerStore((state) => state.vinylSpeed) || '45';
  
  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<any>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  
  // Motion values for drag
  const x = useMotionValue(position.x);
  const y = useMotionValue(position.y);
  
  // Initialize position on mount if needed
  useEffect(() => {
    if (position.x === 0 && position.y === 0) {
      const { width, height } = getViewportDimensions();
      const dims = WIDGET_DIMENSIONS[widgetStyle as keyof typeof WIDGET_DIMENSIONS];
      const defaultPos = {
        x: width - dims.width - 16,
        y: height - dims.height - 16,
      };
      store.setPosition(defaultPos);
      x.set(defaultPos.x);
      y.set(defaultPos.y);
    }
  }, []); // Run once on mount
  
  // Sync motion values with store position
  useEffect(() => {
    x.set(position.x);
    y.set(position.y);
  }, [position.x, position.y, x, y]);
  
  // Handle window resize - constrain position to stay on screen
  useEffect(() => {
    const handleResize = () => {
      const { width: viewportWidth, height: viewportHeight } = getViewportDimensions();
      const currentPos = { x: x.get(), y: y.get() };
      
      const constrained = constrainPosition(
        currentPos,
        widgetStyle,
        viewportWidth,
        viewportHeight
      );
      
      // Only update if position changed
      if (constrained.x !== currentPos.x || constrained.y !== currentPos.y) {
        store.setPosition(constrained);
        x.set(constrained.x);
        y.set(constrained.y);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [x, y, widgetStyle, store]);
  
  // Handle play/pause for YouTube
  useEffect(() => {
    if (sourceType === 'youtube' && playerRef.current) {
      if (playbackState === 'playing') {
        // ReactPlayer handles playing state via the 'playing' prop
      } else {
        // Paused
      }
    }
  }, [playbackState, sourceType]);
  
  // Handle play/pause for uploaded files
  useEffect(() => {
    if (sourceType === 'upload' && audioRef.current) {
      if (playbackState === 'playing') {
        audioRef.current.play().catch((error) => {
          console.error('[MusicWidget] Failed to play audio:', error);
          store.setError({
            type: 'unknown_error',
            message: error.message || 'Failed to play audio file',
          });
          toast.error('Failed to play music');
        });
      } else if (playbackState === 'paused') {
        audioRef.current.pause();
      }
    }
  }, [playbackState, sourceType, store]);
  
  // Handle drag end - constrain position and save to store
  const handleDragEnd = useCallback(() => {
    const { width: viewportWidth, height: viewportHeight } = getViewportDimensions();
    
    const constrained = constrainPosition(
      { x: x.get(), y: y.get() },
      widgetStyle,
      viewportWidth,
      viewportHeight
    );
    
    store.setPosition(constrained);
    
    // Update motion values to constrained position
    x.set(constrained.x);
    y.set(constrained.y);
  }, [x, y, widgetStyle, store]);
  
  // Handle play/pause button click
  const handlePlayPause = useCallback(() => {
    if (playbackState === 'playing') {
      store.pause();
    } else {
      store.play();
    }
  }, [playbackState, store]);
  
  // Handle YouTube player errors
  const handleYouTubeError = useCallback((error: any) => {
    console.error('[MusicWidget] YouTube player error:', error);
    store.setError({
      type: 'youtube_unavailable',
      url: youtubeUrl || '',
    });
    toast.error('Failed to load YouTube video');
  }, [store, youtubeUrl]);
  
  // Handle audio element errors
  const handleAudioError = useCallback(() => {
    console.error('[MusicWidget] Audio element error');
    store.setError({
      type: 'file_not_found',
      fileId: uploadedFileId || '',
    });
    toast.error('Failed to load audio file');
  }, [store, uploadedFileId]);
  
  // Handle audio end
  const handleAudioEnd = useCallback(() => {
    store.pause();
  }, [store]);
  
  // Don't render if no source configured
  const hasSource = sourceType === 'youtube' ? !!youtubeUrl : !!uploadedFileId;
  if (!hasSource) {
    return null;
  }
  
  const dimensions = WIDGET_DIMENSIONS[widgetStyle as keyof typeof WIDGET_DIMENSIONS];
  const isPlaying = playbackState === 'playing';
  
  return (
    <>
      {/* Hidden ReactPlayer for YouTube */}
      {sourceType === 'youtube' && youtubeUrl && (
        <div style={{ display: 'none' }}>
          <ReactPlayer
            ref={playerRef}
            url={youtubeUrl}
            playing={isPlaying}
            width="1px"
            height="1px"
            style={{ display: 'none' }}
            onReady={() => {
              console.log('[MusicWidget] YouTube player ready');
            }}
            onPlay={() => {
              // Sync with store
              if (playbackState !== 'playing') {
                store.setPlaybackState('playing');
              }
            }}
            onPause={() => {
              // Sync with store
              if (playbackState !== 'paused') {
                store.setPlaybackState('paused');
              }
            }}
            onError={handleYouTubeError}
            {...({} as any)}
          />
        </div>
      )}
      
      {/* Hidden audio element for uploaded files */}
      {sourceType === 'upload' && uploadedFileId && (
        <audio
          ref={audioRef}
          src={getMusicFileUrl(uploadedFileId)}
          onPlay={() => {
            if (playbackState !== 'playing') {
              store.setPlaybackState('playing');
            }
          }}
          onPause={() => {
            if (playbackState !== 'paused') {
              store.setPlaybackState('paused');
            }
          }}
          onEnded={handleAudioEnd}
          onError={handleAudioError}
          style={{ display: 'none' }}
        />
      )}
      
      {/* Draggable Widget Container */}
      <motion.div
        ref={widgetRef}
        drag
        dragMomentum={false}
        dragElastic={0}
        onDragEnd={handleDragEnd}
        style={{ x, y }}
        className={cn(
          'fixed z-50 cursor-move',
          'hover:scale-105 transition-transform duration-200'
        )}
        aria-label="Music player widget"
        role="region"
      >
        {/* Render appropriate widget style */}
        {widgetStyle === 'capsule' && (
          <CapsuleWidget
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            sourceType={sourceType}
          />
        )}
        
        {widgetStyle === 'vinyl' && (
          <VinylWidget
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            vinylSpeed={vinylSpeed}
          />
        )}
        
        {widgetStyle === 'spectrum' && (
          <SpectrumWidget
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            sourceType={sourceType}
          />
        )}
      </motion.div>
    </>
  );
}
