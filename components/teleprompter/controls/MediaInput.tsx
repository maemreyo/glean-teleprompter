"use client";

import React, { useState } from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';
// 007-unified-state-architecture: Use useContentStore for content data (bgUrl, musicUrl)
import { useContentStore } from '@/lib/stores/useContentStore';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/useAuthStore';
import { cn } from '@/lib/utils';
import { UploadCloud, Lock, Music, Image as ImageIcon } from 'lucide-react';

export const MediaInput = () => {
    const t = useTranslations('Editor');
    // 007-unified-state-architecture: Use useContentStore for content data
    const { bgUrl, musicUrl, setBgUrl, setMusicUrl } = useContentStore();
    const { isPro } = useAuthStore();
    const { uploadFile, uploading } = useFileUpload();
    
    const [tab, setTab] = useState<'url' | 'file'>('url');

    return (
        <div className="space-y-4 pt-4 border-t border-border">
            {/* Tabs */}
            <div className="flex gap-2 mb-2">
                <button onClick={() => setTab('url')} className={cn("text-xs px-2 py-1 rounded transition-colors", tab === 'url' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                    {t('useUrl')}
                </button>
                <button onClick={() => setTab('file')} className={cn("text-xs px-2 py-1 rounded transition-colors", tab === 'file' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                    {t('uploadPro')}
                </button>
            </div>

            {/* Content */}
            {tab === 'url' ? (
                <div className="space-y-3">
                   <div className="relative group">
                       <input value={bgUrl} onChange={(e) => setBgUrl(e.target.value)} placeholder={t('bgUrlPlaceholder')} className="w-full bg-secondary pl-8 p-2 rounded text-xs border border-border outline-none focus:border-primary/50 transition-colors" />
                       <ImageIcon size={14} className="absolute left-2.5 top-2.5 text-muted-foreground" />
                   </div>
                   <div className="relative group">
                       <input value={musicUrl} onChange={(e) => setMusicUrl(e.target.value)} placeholder={t('musicUrlPlaceholder')} className="w-full bg-secondary pl-8 p-2 rounded text-xs border border-border outline-none focus:border-primary/50 transition-colors" />
                       <Music size={14} className="absolute left-2.5 top-2.5 text-muted-foreground" />
                   </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                   {/* Image Upload */}
                   <div className="bg-secondary p-3 rounded border border-border relative group text-center overflow-hidden hover:border-border transition-colors">
                      <input type="file" accept="image/*" disabled={uploading} onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], 'image').then(url => url && setBgUrl(url))} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      <div className="flex flex-col items-center gap-1 text-muted-foreground group-hover:text-primary transition-colors">
                         <UploadCloud size={16} />
                         <span className="text-[10px]">{t('uploadImage')}</span>
                      </div>
                   </div>

                   {/* Music Upload (Pro) */}
                   <div className={cn("bg-secondary p-3 rounded border border-border relative group text-center overflow-hidden", !isPro && "opacity-60 cursor-not-allowed")}>
                      {isPro && <input type="file" accept="audio/*" disabled={uploading} onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], 'audio').then(url => url && setMusicUrl(url))} className="absolute inset-0 opacity-0 cursor-pointer z-10" />}
                      <div className="flex flex-col items-center gap-1 text-muted-foreground group-hover:text-primary transition-colors">
                         {isPro ? <UploadCloud size={16} /> : <Lock size={16} />}
                         <span className="text-[10px]">{t('uploadMusic')}</span>
                      </div>
                   </div>
                </div>
            )}
        </div>
    );
};
