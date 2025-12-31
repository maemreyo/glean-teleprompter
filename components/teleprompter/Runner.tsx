"use client";

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Edit3, Pause, Play, Music, Camera, CameraOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTeleprompterStore } from '@/stores/useTeleprompterStore';
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
    const store = useTeleprompterStore();
    const router = useRouter();
    const textContainerRef = useRef<HTMLDivElement>(null);
    const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const [cameraVisible, setCameraVisible] = useState(false);
    
    // Auto-start music if URL exists? Or wait for user? 
    // Usually teleprompter should auto start everything on play?
    // Let's start music stopped.

    // Auto-scroll logic
    useEffect(() => {
        let intervalId: NodeJS.Timeout;
        if (store.mode === 'running' && isPlaying) {
          intervalId = setInterval(() => {
            if (textContainerRef.current) {
              textContainerRef.current.scrollTop += 1;
              if (textContainerRef.current.scrollTop + textContainerRef.current.clientHeight >= textContainerRef.current.scrollHeight - 2) {
                setIsPlaying(false);
              }
            }
          }, 50 / store.speed);
        }
        return () => clearInterval(intervalId);
    }, [isPlaying, store.speed, store.mode]);

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
                url={store.musicUrl} 
                playing={isMusicPlaying} 
                volume={0.5} 
             />
             
             <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105" style={{ backgroundImage: `url('${store.bgUrl}')` }} />
             <div className="absolute inset-0 bg-black transition-opacity" style={{ opacity: store.overlayOpacity }} />

             {/* Top Control */}
             <div className="absolute top-6 left-6 z-50 flex gap-2 items-center">
                <ThemeSwitcher />
                {/* Camera Toggle Button */}
                <button
                  onClick={() => setCameraVisible(!cameraVisible)}
                  className={cn(
                      "p-2 rounded-full transition-all",
                      cameraVisible
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-black/40 hover:bg-black/60 backdrop-blur"
                  )}
                  title={cameraVisible ? "Hide Camera" : "Show Camera"}
                >
                  {cameraVisible ? <CameraOff size={20} /> : <Camera size={20} />}
                </button>
                {!store.isReadOnly ? (
                  <button
                    onClick={() => store.setMode('setup')}
                    className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur rounded-full text-white transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                    aria-label="Back to setup"
                  >
                    <ArrowLeft size={20} />
                  </button>
                ) : (
                  <button
                    onClick={() => { store.setIsReadOnly(false); store.setMode('setup'); router.push(window.location.pathname); }}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full text-white text-sm font-medium flex items-center gap-2 border border-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                    aria-label={`Create new teleprompter, ${t('create')}`}
                  >
                    <Edit3 size={14} /> {t('create')}
                  </button>
                )}
             </div>

             {/* Content (Refactored to use TeleprompterText) */}
             <div ref={textContainerRef} className="relative z-10 h-full overflow-y-auto no-scrollbar mask-gradient-y">
                <div className="min-h-screen flex flex-col items-center">
                  <div className="h-[45vh]" />
                  <div className="max-w-4xl w-full p-6">
                      <TeleprompterText
                        text={store.text}
                        style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}
                      />
                  </div>
                  <div className="h-screen" />
                </div>
             </div>

             {/* Bottom Control Bar */}
             <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-xl">
               <div className="bg-black/70 backdrop-blur-2xl border border-white/5 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-4">
                  <button onClick={() => setIsPlaying(!isPlaying)} className={cn("w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg", isPlaying ? "bg-white text-black" : "bg-gradient-to-r from-pink-500 to-violet-600 text-white")}>
                    {isPlaying ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} className="ml-1" />}
                  </button>

                  <div className="flex-1 space-y-2">
                     <div className="flex items-center justify-between text-[10px] text-white/70 font-medium uppercase tracking-wider">
                       <span>{t('speed')}</span>
                       <span>{t('fontSize')}</span>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={store.speed}
                          onChange={(e) => store.setSpeed(Number(e.target.value))}
                          className="h-1 bg-gray-600 rounded-full appearance-none accent-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
                          aria-label={ARIA_LABELS.slider(t('speed'), store.speed, '')}
                          aria-valuenow={store.speed}
                          aria-valuemin={1}
                          aria-valuemax={10}
                          aria-valuetext={`${store.speed}`}
                        />
                        <input
                          type="range"
                          min="20"
                          max="80"
                          value={store.fontSize}
                          onChange={(e) => store.setFontSize(Number(e.target.value))}
                          className="h-1 bg-gray-600 rounded-full appearance-none accent-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
                          aria-label={ARIA_LABELS.slider(t('fontSize'), store.fontSize, 'pixels')}
                          aria-valuenow={store.fontSize}
                          aria-valuemin={20}
                          aria-valuemax={80}
                          aria-valuetext={`${store.fontSize} pixels`}
                        />
                     </div>
                  </div>

                  <div className="w-px h-8 bg-white/10 mx-1" />
                  
                  {store.musicUrl && (
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
