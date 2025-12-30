"use client";

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Edit3, Pause, Play, Music } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTeleprompterStore } from '@/stores/useTeleprompterStore';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FONT_STYLES, TEXT_COLORS } from './Editor';
import { useTranslations } from 'next-intl';

export function Runner() {
    const t = useTranslations('Runner');
    const store = useTeleprompterStore();
    const router = useRouter();
    const textContainerRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);

    // Auto-scroll logic
    useEffect(() => {
        let intervalId: NodeJS.Timeout;
        if (store.mode === 'running' && isPlaying) {
          intervalId = setInterval(() => {
            if (textContainerRef.current) {
              textContainerRef.current.scrollTop += 1;
              // Check end
              if (textContainerRef.current.scrollTop + textContainerRef.current.clientHeight >= textContainerRef.current.scrollHeight - 2) {
                setIsPlaying(false);
              }
            }
          }, 50 / store.speed);
        }
        return () => clearInterval(intervalId);
    }, [isPlaying, store.speed, store.mode]);

    const toggleMusic = () => {
        if (!audioRef.current) return;
        if (isMusicPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play();
        }
        setIsMusicPlaying(!isMusicPlaying);
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="relative h-screen w-full overflow-hidden font-sans text-white"
        >
             {store.musicUrl && <audio ref={audioRef} src={store.musicUrl} loop />}
             
             <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105" style={{ backgroundImage: `url('${store.bgUrl}')` }} />
             <div className="absolute inset-0 bg-black transition-opacity" style={{ opacity: store.overlayOpacity }} />

             {/* Top Control */}
             <div className="absolute top-6 left-6 z-50 flex gap-2">
                {!store.isReadOnly ? (
                  <button onClick={() => store.setMode('setup')} className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur rounded-full text-white/80 transition-all">
                    <ArrowLeft size={20} />
                  </button>
                ) : (
                  <button onClick={() => { store.setIsReadOnly(false); store.setMode('setup'); router.push(window.location.pathname); }} className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full text-white text-sm font-medium flex items-center gap-2 border border-white/10">
                    <Edit3 size={14} /> {t('create')}
                  </button>
                )}
             </div>

             {/* Content */}
             <div ref={textContainerRef} className="relative z-10 h-full overflow-y-auto scrollbar-hide">
                <div className="min-h-screen flex flex-col items-center">
                  <div className="h-[45vh]" />
                  <p 
                    className={cn("max-w-4xl w-full leading-relaxed p-6 transition-all", FONT_STYLES.find(f => f.name === store.font)?.font, store.align === 'center' ? 'text-center' : 'text-left')}
                    style={{ fontSize: `${store.fontSize}px`, color: TEXT_COLORS[store.colorIndex].value, textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}
                  >
                    {store.text}
                  </p>
                  <div className="h-[55vh]" />
                </div>
             </div>

             {/* Bottom Control Bar */}
             <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-xl">
               <div className="bg-black/70 backdrop-blur-2xl border border-white/5 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-4">
                  <button onClick={() => setIsPlaying(!isPlaying)} className={cn("w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg", isPlaying ? "bg-white text-black" : "bg-gradient-to-r from-pink-500 to-violet-600 text-white")}>
                    {isPlaying ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} className="ml-1" />}
                  </button>

                  <div className="flex-1 space-y-2">
                     <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                       <span>{t('speed')}</span>
                       <span>{t('fontSize')}</span>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <input type="range" min="1" max="10" value={store.speed} onChange={(e) => store.setSpeed(Number(e.target.value))} className="h-1 bg-gray-600 rounded-full appearance-none accent-white cursor-pointer" />
                        <input type="range" min="20" max="80" value={store.fontSize} onChange={(e) => store.setFontSize(Number(e.target.value))} className="h-1 bg-gray-600 rounded-full appearance-none accent-white cursor-pointer" />
                     </div>
                  </div>

                  <div className="w-px h-8 bg-white/10 mx-1" />
                  
                  {store.musicUrl && (
                    <button onClick={toggleMusic} className={cn("p-3 rounded-xl transition-all", isMusicPlaying ? "text-pink-400 bg-pink-500/10" : "text-gray-400 hover:text-white")}>
                      <Music size={20} />
                    </button>
                  )}
               </div>
             </div>
        </motion.div>
    );
}
