"use client";

import React, { useState } from 'react';
import { UploadCloud, Lock, LogOut, Crown, Play, Save, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTeleprompterStore } from '@/stores/useTeleprompterStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useFileUpload } from '@/hooks/useFileUpload'; // We will create this
import { saveScriptAction } from '@/actions/scripts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Inter, Roboto_Mono, Lobster, Merriweather, Oswald } from 'next/font/google';
import { useTranslations } from 'next-intl';

// Lazy fonts or import them here? 
// Importing here is fine for now, or centralized config.
const inter = Inter({ subsets: ['latin'] });
const robotoMono = Roboto_Mono({ subsets: ['latin'] });
const lobster = Lobster({ weight: '400', subsets: ['latin'] });
const merriweather = Merriweather({ weight: ['400', '700'], subsets: ['latin'] });
const oswald = Oswald({ subsets: ['latin'] });

export const FONT_STYLES = [
  { name: 'Classic', font: inter.className, label: 'Cổ điển' },
  { name: 'Modern', font: oswald.className, label: 'Hiện đại' },
  { name: 'Typewriter', font: robotoMono.className, label: 'Máy chữ' },
  { name: 'Novel', font: merriweather.className, label: 'Tiểu thuyết' },
  { name: 'Neon', font: lobster.className, label: 'Bay bổng' },
];

export const TEXT_COLORS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Yellow', value: '#fbbf24' },
  { name: 'Green', value: '#4ade80' },
  { name: 'Blue', value: '#60a5fa' },
  { name: 'Pink', value: '#f472b6' },
  { name: 'Red', value: '#f87171' },
];

export function Editor() {
  const t = useTranslations('Editor');
  const store = useTeleprompterStore();
  const { user, isPro } = useAuthStore();
  const { loginWithGoogle, logout } = useSupabaseAuth();
  const { uploadFile } = useFileUpload();

  const [inputType, setInputType] = useState<'url' | 'file'>('url');
  
  // Handlers
  const handleSave = async () => {
    if (!user) {
        await loginWithGoogle();
        return;
    }
    
    const toastId = toast.loading(t('saving'));
    const result = await saveScriptAction({
        content: store.text,
        bg_url: store.bgUrl,
        music_url: store.musicUrl,
        settings: {
            font: store.font,
            color: store.colorIndex,
            speed: store.speed,
            fontSize: store.fontSize,
            overlayOpacity: store.overlayOpacity,
            align: store.align
        },
        title: store.text.substring(0, 30) || "Untitled",
        description: "Created via Web Editor"
    });

    if (result.success) {
        toast.success(t('saveSuccess'), { id: toastId });
    } else {
        toast.error(t('saveFailed') + " " + result.error, { id: toastId });
    }
  };

  const handleShare = () => {
     // Implement share logic (use existing logic from page.tsx or simpler)
     // ...
     toast.success(t('share') + " Copied!");
  };

  return (
    <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -50 }}
        className="h-screen flex flex-col md:flex-row"
    >
        <div className="w-full md:w-1/3 bg-gray-950 border-r border-gray-800 flex flex-col h-full z-20 shadow-2xl relative">
            {/* Header */}
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                  {t('title')}
                </h1>
                
                {!user ? (
                   <button onClick={loginWithGoogle} className="text-xs bg-white text-black px-3 py-1.5 rounded-full font-bold hover:bg-gray-200 transition-colors">
                     {t('login')}
                   </button>
                ) : (
                   <div className="flex items-center gap-2">
                     <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-400 max-w-[80px] truncate">{user.email}</span>
                        {isPro && <span className="text-[9px] text-yellow-400 font-bold flex items-center gap-0.5"><Crown size={8}/> PRO</span>}
                     </div>
                     <button onClick={logout} className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white">
                        <LogOut size={14} />
                     </button>
                   </div>
                )}
            </div>

            {/* Content Controls */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-24">
                {/* Text Area */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-500 uppercase">{t('contentLabel')}</label>
                  </div>
                  <textarea
                    value={store.text} 
                    onChange={(e) => store.setText(e.target.value)}
                    className="w-full h-32 bg-gray-900 rounded-lg p-3 text-sm focus:ring-1 focus:ring-pink-500 outline-none resize-none border border-gray-800 placeholder-gray-600"
                    placeholder={t('contentPlaceholder')}
                  />
                </div>
                
                {/* Font & Color */}
                <div className="space-y-4">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {FONT_STYLES.map((style, idx) => (
                      <button key={style.name} onClick={() => store.setFont(style.name as any)}
                        className={cn("px-3 py-1.5 rounded-md text-xs border transition-all", store.font === style.name ? "bg-white text-black font-bold" : "border-gray-800 text-gray-500")}
                      >
                        {style.name}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3 items-center">
                    {TEXT_COLORS.map((color, idx) => (
                      <button key={color.name} onClick={() => store.setColorIndex(idx)}
                        className={cn("w-5 h-5 rounded-full transition-transform", store.colorIndex === idx ? "ring-2 ring-white scale-110" : "opacity-60 hover:scale-110")}
                        style={{ backgroundColor: color.value }}
                      />
                    ))}
                  </div>
                </div>

                {/* Media Upload */}
                <div className="space-y-4 pt-4 border-t border-gray-900">
                  <div className="flex gap-2 mb-2">
                     <button onClick={() => setInputType('url')} className={cn("text-xs px-2 py-1 rounded", inputType === 'url' ? "bg-gray-800 text-white" : "text-gray-600")}>{t('useUrl')}</button>
                     <button onClick={() => setInputType('file')} className={cn("text-xs px-2 py-1 rounded", inputType === 'file' ? "bg-gray-800 text-white" : "text-gray-600")}>{t('uploadPro')}</button>
                  </div>

                  {inputType === 'url' ? (
                    <div className="space-y-3">
                       <input type="text" value={store.bgUrl} onChange={(e) => store.setBgUrl(e.target.value)} placeholder={t('bgUrlPlaceholder')} className="w-full bg-gray-900 p-2 rounded text-xs border border-gray-800 outline-none" />
                       <input type="text" value={store.musicUrl} onChange={(e) => store.setMusicUrl(e.target.value)} placeholder={t('musicUrlPlaceholder')} className="w-full bg-gray-900 p-2 rounded text-xs border border-gray-800 outline-none" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                       <div className="bg-gray-900 p-3 rounded border border-gray-800 relative group text-center overflow-hidden">
                          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], 'image').then(url => url && store.setBgUrl(url))} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                          <div className="flex flex-col items-center gap-1 text-gray-500 group-hover:text-pink-500 transition-colors">
                             <UploadCloud size={16} />
                             <span className="text-[10px]">{t('uploadImage')}</span>
                          </div>
                       </div>
                       <div className={cn("bg-gray-900 p-3 rounded border border-gray-800 relative group text-center overflow-hidden", !isPro && "opacity-60")}>
                          {isPro && <input type="file" accept="audio/*" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], 'audio').then(url => url && store.setMusicUrl(url))} className="absolute inset-0 opacity-0 cursor-pointer z-10" />}
                          <div className="flex flex-col items-center gap-1 text-gray-500 group-hover:text-pink-500 transition-colors">
                             {isPro ? <UploadCloud size={16} /> : <Lock size={16} />}
                             <span className="text-[10px]">{t('uploadMusic')}</span>
                          </div>
                       </div>
                    </div>
                  )}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-950/90 backdrop-blur border-t border-gray-800 space-y-2">
                 <button onClick={() => store.setMode('running')} className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                    <Play size={16} fill="currentColor" /> {t('preview')}
                 </button>
                 <div className="grid grid-cols-2 gap-2">
                    <button onClick={handleSave} className="py-2 bg-green-900/40 text-green-400 border border-green-900 hover:bg-green-900/60 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                        <Save size={14} /> {t('save')}
                    </button>
                    <button onClick={handleShare} className="py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                        <Share2 size={14} /> {t('share')}
                    </button>
                 </div>
            </div>
        </div>
        
        {/* Preview Panel (Static) */}
        <div className="hidden md:block w-2/3 relative bg-black overflow-hidden">
               <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: `url('${store.bgUrl}')` }} />
               <div className="absolute inset-0 bg-black/30" />
               <div className="absolute inset-0 flex items-center justify-center p-12">
                 {/* Match font style logic */}
                 <h2 className={cn("text-4xl text-center", FONT_STYLES.find(f => f.name === store.font)?.font)} style={{ color: TEXT_COLORS[store.colorIndex].value }}>
                   {store.text}
                 </h2>
               </div>
        </div>
    </motion.div>
  );
}
