"use client";

import React, { useState } from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useTeleprompterStore } from '@/stores/useTeleprompterStore';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/useAuthStore';
import { cn } from '@/lib/utils';
import { UploadCloud, Lock, Music, Image as ImageIcon } from 'lucide-react';

export const MediaInput = () => {
    const t = useTranslations('Editor');
    const { bgUrl, musicUrl, setBgUrl, setMusicUrl } = useTeleprompterStore();
    const { isPro } = useAuthStore();
    const { uploadFile, uploading } = useFileUpload();
    
    const [tab, setTab] = useState<'url' | 'file'>('url');

    return (
        <div className="space-y-4 pt-4 border-t border-gray-900">
            {/* Tabs */}
            <div className="flex gap-2 mb-2">
                <button onClick={() => setTab('url')} className={cn("text-xs px-2 py-1 rounded transition-colors", tab === 'url' ? "bg-gray-800 text-white" : "text-gray-600 hover:text-gray-400")}>
                    {t('useUrl')}
                </button>
                <button onClick={() => setTab('file')} className={cn("text-xs px-2 py-1 rounded transition-colors", tab === 'file' ? "bg-gray-800 text-white" : "text-gray-600 hover:text-gray-400")}>
                    {t('uploadPro')}
                </button>
            </div>

            {/* Content */}
            {tab === 'url' ? (
                <div className="space-y-3">
                   <div className="relative group">
                       <input value={bgUrl} onChange={(e) => setBgUrl(e.target.value)} placeholder={t('bgUrlPlaceholder')} className="w-full bg-gray-900 pl-8 p-2 rounded text-xs border border-gray-800 outline-none focus:border-pink-500/50 transition-colors" />
                       <ImageIcon size={14} className="absolute left-2.5 top-2.5 text-gray-500" />
                   </div>
                   <div className="relative group">
                       <input value={musicUrl} onChange={(e) => setMusicUrl(e.target.value)} placeholder={t('musicUrlPlaceholder')} className="w-full bg-gray-900 pl-8 p-2 rounded text-xs border border-gray-800 outline-none focus:border-pink-500/50 transition-colors" />
                       <Music size={14} className="absolute left-2.5 top-2.5 text-gray-500" />
                   </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                   {/* Image Upload */}
                   <div className="bg-gray-900 p-3 rounded border border-gray-800 relative group text-center overflow-hidden hover:border-gray-700 transition-colors">
                      <input type="file" accept="image/*" disabled={uploading} onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], 'image').then(url => url && setBgUrl(url))} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      <div className="flex flex-col items-center gap-1 text-gray-500 group-hover:text-pink-500 transition-colors">
                         <UploadCloud size={16} />
                         <span className="text-[10px]">{t('uploadImage')}</span>
                      </div>
                   </div>

                   {/* Music Upload (Pro) */}
                   <div className={cn("bg-gray-900 p-3 rounded border border-gray-800 relative group text-center overflow-hidden", !isPro && "opacity-60 cursor-not-allowed")}>
                      {isPro && <input type="file" accept="audio/*" disabled={uploading} onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], 'audio').then(url => url && setMusicUrl(url))} className="absolute inset-0 opacity-0 cursor-pointer z-10" />}
                      <div className="flex flex-col items-center gap-1 text-gray-500 group-hover:text-pink-500 transition-colors">
                         {isPro ? <UploadCloud size={16} /> : <Lock size={16} />}
                         <span className="text-[10px]">{t('uploadMusic')}</span>
                      </div>
                   </div>
                </div>
            )}
        </div>
    );
};
