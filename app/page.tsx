"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Play, Pause, Music, ArrowLeft, Image as ImageIcon, Share2, Edit3, Save, UploadCloud, Crown, Lock, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inter, Roboto_Mono, Lobster, Merriweather, Oswald } from 'next/font/google';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import LZString from 'lz-string';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { toast, Toaster } from 'sonner';

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
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [mode, setMode] = useState<'setup' | 'running'>('setup');
  const [isReadOnly, setIsReadOnly] = useState(false);

  // User State
  const [user, setUser] = useState<any>(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(false);

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

  // 1. Check Auth & Load Profile
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase.from('profiles').select('tier').eq('id', user.id).single();
        setIsPro(data?.tier === 'pro' || data?.tier === 'enterprise');
      }
    };
    checkUser();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) setIsPro(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // 2. Load Shared Data (URL)
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
    toast.success("Đã copy Link chia sẻ!", { description: "Gửi cho bạn bè ngay nào." });
  };

  // 3. Upload Logic
  const handleFileUpload = async (file: File, type: 'image' | 'audio') => {
    if (!user) return toast.error("Vui lòng đăng nhập để upload!");
    
    if (type === 'audio' && !isPro) {
      return toast.warning("Tính năng PRO!", { description: "Nâng cấp gói Pro để upload nhạc riêng." });
    }

    const toastId = toast.loading("Đang upload...");
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const bucket = type === 'image' ? 'backgrounds' : 'music';

      const { error } = await supabase.storage.from(bucket).upload(fileName, file);
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
      
      if (type === 'image') setBgUrl(publicUrl);
      else setMusicUrl(publicUrl);
      
      toast.success("Upload thành công!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Upload thất bại", { id: toastId });
    }
  };

  // 4. Save to Cloud Logic
  const handleSaveToCloud = async () => {
    await handleLogin(); // Ensure user is logged in
    
    // Check again
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) return;

    const toastId = toast.loading("Đang lưu...");
    const settings = {
        font: selectedFontIndex,
        color: selectedColorIndex,
        speed,
        fontSize,
        overlayOpacity,
        align
    };

    const { error } = await supabase.from('scripts').insert({
        user_id: currentUser.id,
        content: text,
        bg_url: bgUrl,
        music_url: musicUrl,
        settings: settings,
        title: text.substring(0, 30) + (text.length > 30 ? "..." : "") || "Untitled Script",
        description: "Created via Web Editor"
    });

    if (!error) {
        toast.success("Đã lưu vào đám mây!", { id: toastId });
    } else {
        toast.error("Lỗi khi lưu!", { id: toastId, description: error.message });
    }
  };

  const handleLogin = async () => {
      if (user) return;
      await supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`
        }
      });
  };

  const handleLogout = async () => {
      await supabase.auth.signOut();
      toast.success("Đã đăng xuất");
  };

  // Auto-scroll logic
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
            <div className="w-full md:w-1/3 bg-gray-950 border-r border-gray-800 flex flex-col h-full z-20 shadow-2xl relative">
              
              {/* Header */}
              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                  Creator Studio
                </h1>
                
                {/* Auth Status */}
                {!user ? (
                   <button onClick={handleLogin} className="text-xs bg-white text-black px-3 py-1.5 rounded-full font-bold hover:bg-gray-200 transition-colors">
                     Đăng nhập
                   </button>
                ) : (
                   <div className="flex items-center gap-2">
                     <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-400 max-w-[80px] truncate">{user.email}</span>
                        {isPro && <span className="text-[9px] text-yellow-400 font-bold flex items-center gap-0.5"><Crown size={8}/> PRO</span>}
                     </div>
                     <button onClick={handleLogout} className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white">
                        <LogOut size={14} />
                     </button>
                   </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-24">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-500 uppercase">Nội dung</label>
                  </div>
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
                     <button onClick={() => setInputType('file')} className={cn("text-xs px-2 py-1 rounded", inputType === 'file' ? "bg-gray-800 text-white" : "text-gray-600")}>Upload (Pro)</button>
                  </div>

                  {inputType === 'url' ? (
                    <div className="space-y-3">
                       <input type="text" value={bgUrl} onChange={(e) => setBgUrl(e.target.value)} placeholder="Link ảnh (VD: unplash...)" className="w-full bg-gray-900 p-2 rounded text-xs border border-gray-800 outline-none" />
                       <input type="text" value={musicUrl} onChange={(e) => setMusicUrl(e.target.value)} placeholder="Link nhạc mp3..." className="w-full bg-gray-900 p-2 rounded text-xs border border-gray-800 outline-none" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                       <div className="bg-gray-900 p-3 rounded border border-gray-800 relative group text-center overflow-hidden">
                          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'image')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                          <div className="flex flex-col items-center gap-1 text-gray-500 group-hover:text-pink-500 transition-colors">
                             <UploadCloud size={16} />
                             <span className="text-[10px]">Ảnh nền</span>
                          </div>
                       </div>
                       <div className={cn("bg-gray-900 p-3 rounded border border-gray-800 relative group text-center overflow-hidden", !isPro && "opacity-60")}>
                          {isPro && <input type="file" accept="audio/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'audio')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />}
                          <div className="flex flex-col items-center gap-1 text-gray-500 group-hover:text-pink-500 transition-colors">
                             {isPro ? <UploadCloud size={16} /> : <Lock size={16} />}
                             <span className="text-[10px]">Nhạc (Pro)</span>
                          </div>
                       </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-950/90 backdrop-blur border-t border-gray-800 space-y-2">
                 <button onClick={() => setMode('running')} className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                    <Play size={16} fill="currentColor" /> Preview
                 </button>
                 <div className="grid grid-cols-2 gap-2">
                    <button onClick={handleSaveToCloud} className="py-2 bg-green-900/40 text-green-400 border border-green-900 hover:bg-green-900/60 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                        <Save size={14} /> Lưu Cloud
                    </button>
                    <button onClick={handleShare} className="py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                        <Share2 size={14} /> Share Link
                    </button>
                 </div>
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

export default function TeleprompterSaaS() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
      <Toaster position="top-center" richColors />
      <TeleprompterContent />
    </Suspense>
  );
}
