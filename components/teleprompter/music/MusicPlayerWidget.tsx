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
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Settings } from 'lucide-react';
import { CapsuleWidget } from './styles/CapsuleWidget';
import { VinylWidget } from './styles/VinylWidget';
import { SpectrumWidget } from './styles/SpectrumWidget';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// ============================================================================
// Constants
// ============================================================================

const MUSIC_STORAGE_BUCKET = 'user_music';
const BASE_Z_INDEX = 1000;
const MAX_Z_INDEX = 9999;

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
  const t = useTranslations('MusicPlayer');
  const router = useRouter();
  const store = useMusicPlayerStore();
  
  // T039: Dynamic z-index management
  const [zIndex, setZIndex] = useState(BASE_Z_INDEX);
  
  // State from store
  const position = useMusicPlayerStore((state) => state.position);
  const playbackState = useMusicPlayerStore((state) => state.playbackState);
  const widgetStyle = useMusicPlayerStore((state) => state.widgetStyle);
  const sourceType = useMusicPlayerStore((state) => state.sourceType);
  const youtubeUrl = useMusicPlayerStore((state) => state.youtubeUrl);
  const uploadedFileId = useMusicPlayerStore((state) => state.uploadedFileId);
  const vinylSpeed = useMusicPlayerStore((state) => state.vinylSpeed) || '45';
  
  // T038: Touch support - detect mobile viewport
  const isMobile = useMediaQuery('(max-width: 768px)');
  
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
  
  // T039: Handle focus/drag start to bring widget to front
  const handleFocus = useCallback(() => {
    setZIndex((prev) => Math.min(prev + 1, MAX_Z_INDEX));
  }, []);
  
  // Handle play/pause button click
  const handlePlayPause = useCallback(() => {
    if (playbackState === 'playing') {
      store.pause();
    } else {
      store.play();
    }
  }, [playbackState, store]);
  
  // T035: Enhanced error handling with translations
  const handleYouTubeError = useCallback((error: any) => {
    console.error('[MusicWidget] YouTube player error:', error);
    
    // Determine error type based on error code
    let errorType: 'youtubeUnavailable' | 'youtubeInvalidUrl' | 'networkError' = 'youtubeUnavailable';
    let errorKey = 'errors.youtubeUnavailable';
    
    if (error?.type === 'not_embeddable' || error?.type === 'unplayable') {
      errorType = 'youtubeUnavailable';
      errorKey = 'errors.youtubeUnavailable';
    } else if (youtubeUrl && !youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
      errorType = 'youtubeInvalidUrl';
      errorKey = 'errors.youtubeInvalidUrl';
    }
    
    store.setError({
      type: errorType === 'youtubeUnavailable' ? 'youtube_unavailable' : 'youtube_invalid_url',
      url: youtubeUrl || '',
    });
    
    toast.error(t(errorKey), {
      description: t('errors.networkError'),
    });
  }, [store, youtubeUrl, t]);
  
  // Handle audio element errors with enhanced error handling
  const handleAudioError = useCallback((event: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const audioElement = event.currentTarget;
    const errorCode = (audioElement.error as MediaError)?.code;
    
    console.error('[MusicWidget] Audio element error:', errorCode);
    
    let errorKey = 'errors.unknownError';
    
    switch (errorCode) {
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        errorKey = 'errors.fileUnsupported';
        break;
      case MediaError.MEDIA_ERR_NETWORK:
        errorKey = 'errors.networkError';
        break;
      case MediaError.MEDIA_ERR_DECODE:
        errorKey = 'errors.fileUnsupported';
        break;
      default:
        errorKey = 'errors.fileNotFound';
    }
    
    store.setError({
      type: 'file_not_found',
      fileId: uploadedFileId || '',
    });
    
    toast.error(t(errorKey), {
      description: t('errors.fileNotFound'),
    });
  }, [store, uploadedFileId, t]);
  
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
      
      {/* T036: Reconfigure button - shows on hover (desktop) or always visible (mobile) */}
      <button
        onClick={() => router.push('/studio?tab=music')}
        className={cn(
          'fixed z-50 p-2 rounded-lg',
          'bg-black/60 backdrop-blur-sm border border-white/10',
          'hover:bg-black/80 hover:border-white/20',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-white/50',
          // Position widget near the widget itself (will be updated dynamically)
          'cursor-pointer',
          // T038: Always visible on mobile, hover only on desktop
          isMobile ? 'opacity-100' : 'opacity-0 hover:opacity-100'
        )}
        style={{
          left: position.x,
          top: position.y - 40,
          zIndex: zIndex + 1,
        }}
        aria-label={t('widget.reconfigure')}
      >
        <Settings className="h-4 w-4 text-white/70 hover:text-white" />
      </button>
      
      {/* Draggable Widget Container */}
      <motion.div
        ref={widgetRef}
        drag
        dragMomentum={false}
        dragElastic={0}
        onDragEnd={handleDragEnd}
        onDragStart={handleFocus}
        onFocus={handleFocus}
        style={{ x, y, zIndex }}
        className={cn(
          'fixed cursor-move',
          'hover:scale-105 transition-transform duration-200'
        )}
        aria-label={t('widget.ariaLabel')}
        role="region"
        tabIndex={0}
        onKeyDown={(e) => {
          // T037: Keyboard navigation for play/pause
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handlePlayPause();
          }
        }}
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
        
        {/* T037: Live region for screen reader announcements */}
        <div
          role="status"
          aria-live="polite"
          className="sr-only"
          aria-label={isPlaying ? t('widget.play') : t('widget.pause')}
        >
          {isPlaying ? t('widget.play') : t('widget.pause')}
        </div>
      </motion.div>
    </>
  );
}
