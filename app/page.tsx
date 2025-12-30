"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Play, Pause, Music, ArrowLeft, Image as ImageIcon, Share2, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inter, Roboto_Mono, Lobster, Merriweather, Oswald } from 'next/font/google';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import LZString from 'lz-string';
import { useSearchParams, useRouter } from 'next/navigation';

// --- CONFIG FONTS ---
const inter = Inter({ subsets: ['latin'] });
const robotoMono = Roboto_Mono({ subsets: ['latin'] });
const lobster = Lobster({ weight: '400', subsets: ['latin'] });
const merriweather = Merriweather({ weight: ['400', '700'], subsets: ['latin'] });
const oswald = Oswald({ subsets: ['latin'] });

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

const FONT_STYLES = [
  { name: 'Classic', font: inter.className, label: 'Cổ điển' },
  { name: 'Modern', font: oswald.className, label: 'Hiện đại' },
  { name: 'Typewriter', font: robotoMono.className, label: 'Máy chữ' },
  { name: 'Novel', font: merriweather.className, label: 'Tiểu thuyết' },
  { name: 'Neon', font: lobster.className, label: 'Bay bổng' },
];

const TEXT_COLORS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Yellow', value: '#fbbf24' },
  { name: 'Green', value: '#4ade80' },
  { name: 'Blue', value: '#60a5fa' },
  { name: 'Pink', value: '#f472b6' },
  { name: 'Red', value: '#f87171' },
];

const DEFAULT_BG = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop';

function TeleprompterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [mode, setMode] = useState<'setup' | 'running'>('setup');
  const [isReadOnly, setIsReadOnly] = useState(false);

  const [text, setText] = useState('Chào mừng! Hãy nhập nội dung của bạn vào đây...');
  const [bgUrl, setBgUrl] = useState(DEFAULT_BG);
  const [musicUrl, setMusicUrl] = useState<string>(''); 
  const [inputType, setInputType] = useState<'file' | 'url'>('url');

  const [selectedFontIndex, setSelectedFontIndex] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [align, setAlign] = useState<'left' | 'center'>('center');

  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [fontSize, setFontSize] = useState(48);
  const [overlayOpacity] = useState(0.5);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const textContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const decompressed = LZString.decompressFromEncodedURIComponent(data);
        if (decompressed) {
          const parsed = JSON.parse(decompressed);
          setText(parsed.text || '');
          setBgUrl(parsed.bgUrl || DEFAULT_BG);
          setMusicUrl(parsed.musicUrl || '');
          setSelectedFontIndex(parsed.font || 0);
          setSelectedColorIndex(parsed.color || 0);
          setAlign(parsed.align || 'center');
          setMode('running');
          setIsReadOnly(true); 
        }
      } catch (e) {
        console.error("Lỗi đọc link share", e);
      }
    }
  }, [searchParams]);

  const handleShare = () => {
    const stateToShare = {
      text,
      bgUrl, 
      musicUrl,
      font: selectedFontIndex,
      color: selectedColorIndex,
      align
    };

    const stringified = JSON.stringify(stateToShare);
    const compressed = LZString.compressToEncodedURIComponent(stringified);
    const newUrl = `${window.location.origin}${window.location.pathname}?data=${compressed}`;
    
    navigator.clipboard.writeText(newUrl);
    alert("Đã copy Link chia sẻ! Gửi cho bạn bè ngay nào.");
  };

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
      }, 50 / speed);
    }
    return () => clearInterval(intervalId);
  }, [isPlaying, speed, mode]);

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
    <div className={cn("min-h-screen bg-black text-white font-sans overflow-hidden", inter.className)}>
      {musicUrl && <audio ref={audioRef} src={musicUrl} loop />}

      <AnimatePresence mode="wait">
        {mode === 'setup' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -50 }}
            className="h-screen flex flex-col md:flex-row"
          >
            <div className="w-full md:w-1/3 bg-gray-950 border-r border-gray-800 flex flex-col h-full z-20 shadow-2xl">
              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                  Creator Studio
                </h1>
                <button onClick={handleShare} className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-full flex items-center gap-2 transition-colors">
                  <Share2 size={14} /> Chia sẻ
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Nội dung</label>
                  <textarea
                    value={text} onChange={(e) => setText(e.target.value)}
                    className="w-full h-32 bg-gray-900 rounded-lg p-3 text-sm focus:ring-1 focus:ring-pink-500 outline-none resize-none border border-gray-800 placeholder-gray-600"
                    placeholder="Nhập nội dung..."
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {FONT_STYLES.map((style, idx) => (
                      <button key={style.name} onClick={() => setSelectedFontIndex(idx)}
                        className={cn("px-3 py-1.5 rounded-md text-xs border transition-all", selectedFontIndex === idx ? "bg-white text-black font-bold" : "border-gray-800 text-gray-500")}
                      >
                        {style.name}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3 items-center">
                    {TEXT_COLORS.map((color, idx) => (
                      <button key={color.name} onClick={() => setSelectedColorIndex(idx)}
                        className={cn("w-5 h-5 rounded-full transition-transform", selectedColorIndex === idx ? "ring-2 ring-white scale-110" : "opacity-60 hover:scale-110")}
                        style={{ backgroundColor: color.value }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-900">
                  <div className="flex gap-2 mb-2">
                     <button onClick={() => setInputType('url')} className={cn("text-xs px-2 py-1 rounded", inputType === 'url' ? "bg-gray-800 text-white" : "text-gray-600")}>Dùng Link Online</button>
                     <button onClick={() => setInputType('file')} className={cn("text-xs px-2 py-1 rounded", inputType === 'file' ? "bg-gray-800 text-white" : "text-gray-600")}>Upload (Local only)</button>
                  </div>

                  {inputType === 'url' ? (
                    <div className="space-y-3">
                       <input type="text" value={bgUrl} onChange={(e) => setBgUrl(e.target.value)} placeholder="Link ảnh (VD: unplash...)" className="w-full bg-gray-900 p-2 rounded text-xs border border-gray-800 outline-none" />
                       <input type="text" value={musicUrl} onChange={(e) => setMusicUrl(e.target.value)} placeholder="Link nhạc mp3..." className="w-full bg-gray-900 p-2 rounded text-xs border border-gray-800 outline-none" />
                       <p className="text-[10px] text-gray-500 italic">*Dùng link online thì mới gửi cho bạn bè xem được nha!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                       <div className="bg-gray-900 p-3 rounded border border-gray-800 relative group text-center">
                          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && setBgUrl(URL.createObjectURL(e.target.files[0]))} className="absolute inset-0 opacity-0 cursor-pointer" />
                          <ImageIcon size={16} className="mx-auto text-gray-500 group-hover:text-pink-500" />
                       </div>
                       <div className="bg-gray-900 p-3 rounded border border-gray-800 relative group text-center">
                          <input type="file" accept="audio/*" onChange={(e) => e.target.files?.[0] && setMusicUrl(URL.createObjectURL(e.target.files[0]))} className="absolute inset-0 opacity-0 cursor-pointer" />
                          <Music size={16} className="mx-auto text-gray-500 group-hover:text-pink-500" />
                       </div>
                    </div>
                  )}
                </div>

                <button onClick={() => setMode('running')} className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  <Play size={16} fill="currentColor" /> Preview
                </button>
              </div>
            </div>

            <div className="hidden md:block w-2/3 relative bg-black overflow-hidden">
               <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: `url('${bgUrl}')` }} />
               <div className="absolute inset-0 bg-black/30" />
               <div className="absolute inset-0 flex items-center justify-center p-12">
                 <h2 className={cn("text-4xl text-center", FONT_STYLES[selectedFontIndex].font)} style={{ color: TEXT_COLORS[selectedColorIndex].value }}>
                   {text}
                 </h2>
               </div>
            </div>
          </motion.div>
        )}

        {mode === 'running' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="relative h-screen w-full overflow-hidden"
          >
             <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105" style={{ backgroundImage: `url('${bgUrl}')` }} />
             <div className="absolute inset-0 bg-black transition-opacity" style={{ opacity: overlayOpacity }} />

             <div className="absolute top-6 left-6 z-50 flex gap-2">
                {!isReadOnly ? (
                  <button onClick={() => setMode('setup')} className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur rounded-full text-white/80 transition-all">
                    <ArrowLeft size={20} />
                  </button>
                ) : (
                  <button onClick={() => { setIsReadOnly(false); setMode('setup'); router.push(window.location.pathname); }} className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full text-white text-sm font-medium flex items-center gap-2 border border-white/10">
                    <Edit3 size={14} /> Tạo bản mới
                  </button>
                )}
             </div>

             <div ref={textContainerRef} className="relative z-10 h-full overflow-y-auto scrollbar-hide">
                <div className="min-h-screen flex flex-col items-center">
                  <div className="h-[45vh]" />
                  <p 
                    className={cn("max-w-4xl w-full leading-relaxed p-6 transition-all", FONT_STYLES[selectedFontIndex].font, align === 'center' ? 'text-center' : 'text-left')}
                    style={{ fontSize: `${fontSize}px`, color: TEXT_COLORS[selectedColorIndex].value, textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}
                  >
                    {text}
                  </p>
                  <div className="h-[55vh]" />
                </div>
             </div>

             <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-xl">
               <div className="bg-black/70 backdrop-blur-2xl border border-white/5 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-4">
                  <button onClick={() => setIsPlaying(!isPlaying)} className={cn("w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg", isPlaying ? "bg-white text-black" : "bg-gradient-to-r from-pink-500 to-violet-600 text-white")}>
                    {isPlaying ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} className="ml-1" />}
                  </button>

                  <div className="flex-1 space-y-2">
                     <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                       <span>Tốc độ</span>
                       <span>Cỡ chữ</span>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <input type="range" min="1" max="10" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="h-1 bg-gray-600 rounded-full appearance-none accent-white cursor-pointer" />
                        <input type="range" min="20" max="80" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="h-1 bg-gray-600 rounded-full appearance-none accent-white cursor-pointer" />
                     </div>
                  </div>

                  <div className="w-px h-8 bg-white/10 mx-1" />
                  
                  {musicUrl && (
                    <button onClick={toggleMusic} className={cn("p-3 rounded-xl transition-all", isMusicPlaying ? "text-pink-400 bg-pink-500/10" : "text-gray-400 hover:text-white")}>
                      <Music size={20} />
                    </button>
                  )}
               </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TeleprompterShare() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
      <TeleprompterContent />
    </Suspense>
  );
}
