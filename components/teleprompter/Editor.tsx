"use client";

import React from 'react';
import { Play, Save, Share2, LogOut, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTeleprompterStore } from '@/stores/useTeleprompterStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { saveScriptAction } from '@/actions/scripts';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

// Modular Components
import { FontSelector } from '@/components/teleprompter/controls/FontSelector';
import { ColorPicker } from '@/components/teleprompter/controls/ColorPicker';
import { MediaInput } from '@/components/teleprompter/controls/MediaInput';
import { TeleprompterText } from '@/components/teleprompter/display/TeleprompterText';

export function Editor() {
  const t = useTranslations('Editor');
  const store = useTeleprompterStore();
  const { user, isPro } = useAuthStore();
  const { loginWithGoogle, logout } = useSupabaseAuth();
  
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
            lineHeight: store.lineHeight,
            margin: store.margin,
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
    // Basic share logic: Copy current URL
    navigator.clipboard.writeText(window.location.href);
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
                
                {/* Advanced Text Options */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Line Height ({store.lineHeight})</label>
                            <input 
                                type="range" min="1" max="3" step="0.1"
                                value={store.lineHeight} onChange={(e) => store.setLineHeight(Number(e.target.value))}
                                className="w-full h-1 bg-gray-800 rounded-full appearance-none accent-pink-500" 
                            />
                        </div>
                         <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Margin ({store.margin}%)</label>
                            <input 
                                type="range" min="0" max="30" step="1"
                                value={store.margin} onChange={(e) => store.setMargin(Number(e.target.value))}
                                className="w-full h-1 bg-gray-800 rounded-full appearance-none accent-pink-500" 
                            />
                        </div>
                    </div>
                </div>

                {/* Font & Color */}
                <div className="space-y-4">
                  {/* eslint-disable @typescript-eslint/no-explicit-any */}
                  <FontSelector
                    selectedFont={store.font as any}
                    onSelect={(f) => store.setFont(f as any)}
                  />
                  <ColorPicker selectedIndex={store.colorIndex} onSelect={store.setColorIndex} />
                </div>

                {/* Media Input (Modular) */}
                <MediaInput />
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
        
        {/* WYSIWYG Preview Panel */}
        <div className="hidden md:block w-2/3 relative bg-black overflow-hidden">
               <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: `url('${store.bgUrl}')` }} />
               <div className="absolute inset-0 bg-black/30" />
               <div className="absolute inset-0 flex items-center justify-center p-12 overflow-hidden">
                   {/* Reusing TeleprompterText for Exact WYSIWYG */}
                   <TeleprompterText
                        text={store.text}
                        fontName={store.font}
                        colorIndex={store.colorIndex}
                        fontSize={store.fontSize} // Use actual font size or scaled? Let's use actual for true WYSIWYG
                        lineHeight={store.lineHeight}
                        margin={store.margin}
                        align={store.align}
                        className="max-h-full overflow-hidden text-ellipsis line-clamp-[10]" // Limit lines in preview?
                   />
               </div>
        </div>
    </motion.div>
  );
}
