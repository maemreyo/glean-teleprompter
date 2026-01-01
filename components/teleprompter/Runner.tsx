"use client";

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Edit3, Pause, Play, Music, Camera, CameraOff } from 'lucide-react';
import { motion } from 'framer-motion';
// 007-unified-state-architecture: Import new stores
import { useContentStore } from '@/lib/stores/useContentStore';
import { useConfigStore } from '@/lib/stores/useConfigStore';
import { usePlaybackStore } from '@/lib/stores/usePlaybackStore';
import { useUIStore } from '@/stores/useUIStore';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { ARIA_LABELS } from '@/lib/a11y/ariaLabels';

// Modular Components
import { TeleprompterText } from '@/components/teleprompter/display/TeleprompterText';
import { UniversalAudioPlayer } from '@/components/teleprompter/audio/AudioPlayer';
import { DraggableCamera } from '@/components/teleprompter/camera/DraggableCamera';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

export function Runner() {
    const t = useTranslations('Runner');
    // 007-unified-state-architecture: Use new stores with single responsibility
    const { text, bgUrl, musicUrl, isReadOnly } = useContentStore();
    const { typography, colors, effects, layout, animations } = useConfigStore();
    const { isPlaying, togglePlaying, setIsPlaying } = usePlaybackStore();
    const { mode, setMode } = useUIStore();
    const router = useRouter();
    const textContainerRef = useRef<HTMLDivElement>(null);
    const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const [cameraVisible, setCameraVisible] = useState(false);
    
    // Auto-start music if URL exists? Or wait for user? 
    // Usually teleprompter should auto start everything on play?
    // Let's start music stopped.

    // Auto-scroll logic
    // 007-unified-state-architecture: Use animations.autoScrollSpeed from config
    useEffect(() => {
        let intervalId: NodeJS.Timeout;
        if (mode === 'running' && isPlaying) {
          intervalId = setInterval(() => {
            if (textContainerRef.current) {
              textContainerRef.current.scrollTop += 1;
              if (textContainerRef.current.scrollTop + textContainerRef.current.clientHeight >= textContainerRef.current.scrollHeight - 2) {
                setIsPlaying(false);
              }
            }
          }, 50); // Fixed scroll rate - actual speed controlled by config
        }
        return () => clearInterval(intervalId);
    }, [isPlaying, mode, setIsPlaying]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : undefined}
            className="relative h-screen w-full overflow-hidden font-sans text-white"
        >
             {/* Universal Audio Player (Hidden or Managed) */}
             <UniversalAudioPlayer
                // 007-unified-state-architecture: Use contentStore for content data
                url={musicUrl}
                playing={isMusicPlaying}
                volume={0.5}
             />
             
             {/* 007-unified-state-architecture: Use contentStore.bgUrl for background */}
             <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105" style={{ backgroundImage: `url('${bgUrl}')` }} />
             {/* 007-unified-state-architecture: Use effects.overlayOpacity from config */}
             <div className="absolute inset-0 bg-black transition-opacity" style={{ opacity: effects.overlayOpacity }} />

             {/* Top Control */}
             <div className="absolute top-6 left-6 z-50 flex gap-2 items-center">
                <ThemeSwitcher />
                {/* Camera Toggle Button */}
                <button
                  onClick={() => setCameraVisible(!cameraVisible)}
                  className={cn(
                      "p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black",
                      cameraVisible
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "bg-black/60 hover:bg-black/80 backdrop-blur text-white"
                  )}
                  title={cameraVisible ? "Hide Camera" : "Show Camera"}
                  aria-label={cameraVisible ? "Hide camera" : "Show camera"}
                  aria-pressed={cameraVisible}
                >
                  {cameraVisible ? <CameraOff size={20} /> : <Camera size={20} />}
                </button>
                {/* 007-unified-state-architecture: Use contentStore.isReadOnly and useUIStore.mode */}
                {!isReadOnly ? (
                  <button
                    onClick={() => setMode('setup')}
                    className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur rounded-full text-white transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                    aria-label="Back to setup"
                  >
                    <ArrowLeft size={20} />
                  </button>
                ) : (
                  <button
                    // 007-unified-state-architecture: Use setMode from useUIStore
                    onClick={() => { setMode('setup'); router.push(window.location.pathname); }}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full text-white text-sm font-medium flex items-center gap-2 border border-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                    aria-label={`Create new teleprompter, ${t('create')}`}
                  >
                    <Edit3 size={14} /> {t('create')}
                  </button>
                )}
             </div>

             {/* Content (Refactored to use TeleprompterText) */}
             {/* 007-unified-state-architecture: Use contentStore.text for content */}
             <div ref={textContainerRef} className="relative z-10 h-full overflow-y-auto no-scrollbar mask-gradient-y">
                <div className="min-h-screen flex flex-col items-center">
                  <div className="h-[45vh]" />
                  <div className="max-w-4xl w-full p-6">
                      {/* 007-unified-state-architecture: TeleprompterText uses useConfigStore for all styling */}
                      <TeleprompterText
                        text={text}
                        style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}
                      />
                  </div>
                  <div className="h-screen" />
                </div>
             </div>

             {/* Bottom Control Bar */}
             <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-xl">
               <div className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-4">
                  {/* 007-unified-state-architecture: Use togglePlaying from usePlaybackStore */}
                  <button
                    onClick={togglePlaying}
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black",
                      isPlaying ? "bg-white text-black hover:bg-white/90" : "bg-gradient-to-r from-pink-500 to-violet-600 text-white hover:from-pink-600 hover:to-violet-700"
                    )}
                    aria-label={isPlaying ? "Pause scrolling" : "Start scrolling"}
                    aria-pressed={isPlaying}
                  >
                    {isPlaying ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} className="ml-1" />}
                  </button>

                  <div className="flex-1 space-y-2">
                     <div className="flex items-center justify-between text-[10px] text-white/70 font-medium uppercase tracking-wider">
                       <span>{t('speed')}</span>
                       <span>{t('fontSize')}</span>
                     </div>
                     {/* 007-unified-state-architecture: Control font size from config */}
                     <div className="grid grid-cols-2 gap-4">
                        {/* 007-unified-state-architecture: Scroll speed control - uses animations.autoScrollSpeed from config */}
                        {/* Note: This is a legacy speed control that should be replaced by Quick Settings */}
                        <input
                          type="range"
                          min="1"
                          max="10"
                          // 007: Temporary - use legacy behavior until Quick Settings implemented
                          value={animations.autoScrollSpeed / 10} // Convert px/sec to 1-10 range
                          onChange={(e) => {
                            const speed = Number(e.target.value)
                            // Convert back to px/sec and update config
                            useConfigStore.getState().setAnimations({ autoScrollSpeed: speed * 10 })
                          }}
                          className="h-1 bg-gray-600 rounded-full appearance-none accent-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
                          aria-label={ARIA_LABELS.slider(t('speed'), animations.autoScrollSpeed, 'pixels per second')}
                          aria-valuenow={animations.autoScrollSpeed}
                          aria-valuemin={10}
                          aria-valuemax={200}
                          aria-valuetext={`${animations.autoScrollSpeed} pixels/sec`}
                        />
                        {/* 007-unified-state-architecture: Font size control - uses typography.fontSize from config */}
                        <input
                          type="range"
                          min="20"
                          max="80"
                          value={typography.fontSize}
                          onChange={(e) => {
                            useConfigStore.getState().setTypography({ fontSize: Number(e.target.value) })
                          }}
                          className="h-1 bg-gray-600 rounded-full appearance-none accent-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
                          aria-label={ARIA_LABELS.slider(t('fontSize'), typography.fontSize, 'pixels')}
                          aria-valuenow={typography.fontSize}
                          aria-valuemin={20}
                          aria-valuemax={80}
                          aria-valuetext={`${typography.fontSize} pixels`}
                        />
                     </div>
                  </div>

                  <div className="w-px h-8 bg-white/10 mx-1" />
                  
                  {/* 007-unified-state-architecture: Use contentStore.musicUrl for music */}
                  {musicUrl && (
                    <button
                      onClick={() => setIsMusicPlaying(!isMusicPlaying)}
                      className={cn(
                        "p-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-white/50",
                        isMusicPlaying ? "text-pink-400 bg-pink-500/20" : "text-white/70 hover:text-white"
                      )}
                      aria-label={isMusicPlaying ? "Pause music" : "Play music"}
                      aria-pressed={isMusicPlaying}
                    >
                      <Music size={20} />
                    </button>
                  )}
               </div>
             </div>

             {/* Camera Widget */}
             <DraggableCamera
               isVisible={cameraVisible}
               onToggle={() => setCameraVisible(!cameraVisible)}
               quality="standard"
             />
        </motion.div>
    );
}
