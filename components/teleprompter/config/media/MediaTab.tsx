"use client";

import React, { useState } from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useTeleprompterStore } from '@/stores/useTeleprompterStore';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/useAuthStore';
import { cn } from '@/lib/utils';
import { UploadCloud, Lock, Music, Image as ImageIcon, Film } from 'lucide-react';

/**
 * MediaTab - Configuration panel for background and music media
 * 
 * Moved from legacy MediaInput component to ConfigPanel
 * Handles:
 * - Background image URL input
 * - Background music URL input
 * - File upload (Pro feature)
 */
export function MediaTab() {
  const t = useTranslations('Editor');
  const { bgUrl, musicUrl, setBgUrl, setMusicUrl } = useTeleprompterStore();
  const { isPro } = useAuthStore();
  const { uploadFile, uploading } = useFileUpload();
  
  const [tab, setTab] = useState<'url' | 'file'>('url');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Film className="w-5 h-5" />
          Media Settings
        </h3>
        <p className="text-sm text-muted-foreground">
          Configure background image and music for your teleprompter
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-secondary rounded-lg">
        <button 
          onClick={() => setTab('url')} 
          className={cn(
            "flex-1 text-xs px-3 py-2 rounded-md font-medium transition-all",
            tab === 'url' 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          )}
        >
          <ImageIcon className="w-4 h-4 inline mr-1" />
          Use URL
        </button>
        <button 
          onClick={() => setTab('file')} 
          className={cn(
            "flex-1 text-xs px-3 py-2 rounded-md font-medium transition-all",
            tab === 'file' 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          )}
        >
          <UploadCloud className="w-4 h-4 inline mr-1" />
          Upload
          {!isPro && <Lock className="w-3 h-3 inline ml-1" />}
        </button>
      </div>

      {/* Content */}
      {tab === 'url' ? (
        <div className="space-y-4">
          {/* Background Image URL */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">
              Background Image URL
            </label>
            <div className="relative group">
              <ImageIcon 
                size={16} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" 
              />
              <input 
                value={bgUrl} 
                onChange={(e) => setBgUrl(e.target.value)} 
                placeholder="https://example.com/image.jpg"
                className="w-full bg-secondary pl-10 pr-4 py-3 rounded-lg text-sm border border-border outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
              />
            </div>
            {bgUrl && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Image URL set
              </div>
            )}
          </div>

          {/* Music URL */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">
              Background Music URL
            </label>
            <div className="relative group">
              <Music 
                size={16} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" 
              />
              <input 
                value={musicUrl} 
                onChange={(e) => setMusicUrl(e.target.value)} 
                placeholder="https://example.com/music.mp3"
                className="w-full bg-secondary pl-10 pr-4 py-3 rounded-lg text-sm border border-border outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
              />
            </div>
            {musicUrl && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Music URL set
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">
              Upload Background Image
            </label>
            <div className="bg-secondary border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-6 text-center relative group overflow-hidden transition-all">
              <input 
                type="file" 
                accept="image/*" 
                disabled={uploading} 
                onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], 'image').then(url => url && setBgUrl(url))} 
                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
              />
              <div className="flex flex-col items-center gap-3 text-muted-foreground group-hover:text-primary transition-colors">
                <UploadCloud size={32} className={uploading ? "animate-pulse" : ""} />
                <div>
                  <p className="text-sm font-medium">
                    {uploading ? "Uploading..." : "Click to upload image"}
                  </p>
                  <p className="text-xs mt-1">PNG, JPG, GIF up to 5MB</p>
                </div>
              </div>
            </div>
          </div>

          {/* Music Upload (Pro) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Upload Background Music
              </label>
              {!isPro && (
                <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium flex items-center gap-1">
                  <Lock size={10} />
                  Pro Only
                </span>
              )}
            </div>
            <div 
              className={cn(
                "bg-secondary border-2 border-dashed rounded-lg p-6 text-center relative group overflow-hidden transition-all",
                isPro 
                  ? "border-border hover:border-primary/50" 
                  : "border-border opacity-60 cursor-not-allowed"
              )}
            >
              {isPro && (
                <input 
                  type="file" 
                  accept="audio/*" 
                  disabled={uploading} 
                  onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], 'audio').then(url => url && setMusicUrl(url))} 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                />
              )}
              <div className="flex flex-col items-center gap-3 text-muted-foreground group-hover:text-primary transition-colors">
                {isPro ? (
                  <>
                    <Music size={32} className={uploading ? "animate-pulse" : ""} />
                    <div>
                      <p className="text-sm font-medium">
                        {uploading ? "Uploading..." : "Click to upload music"}
                      </p>
                      <p className="text-xs mt-1">MP3, WAV up to 10MB</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Lock size={32} />
                    <div>
                      <p className="text-sm font-medium">Pro Feature</p>
                      <p className="text-xs mt-1">Upgrade to upload music</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
