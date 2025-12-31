"use client";

import React from 'react';
import { Play, Save, Share2, LogOut, Crown } from 'lucide-react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useTeleprompterStore } from '@/stores/useTeleprompterStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { saveScriptAction } from '@/actions/scripts';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useConfigStore } from '@/lib/stores/useConfigStore';
import { useDemoStore } from '@/stores/useDemoStore';

/**
 * ContentPanel - The content editing section of the Editor
 * 
 * Contains:
 * - Header with title, auth, and theme switcher
 * - Text area for script content
 * - Quick action buttons (Preview, Save, Share)
 */
export function ContentPanel() {
  const t = useTranslations('Editor');
  const router = useRouter();
  const store = useTeleprompterStore();
  const { user, isPro } = useAuthStore();
  const { isDemoMode } = useDemoStore();
  const { loginWithGoogle, logout } = useSupabaseAuth();
  const { typography, colors, effects, layout, animations } = useConfigStore();
  
  // Handlers
  const handleSave = async () => {
    // Check demo mode first
    if (isDemoMode) {
      toast.error('Demo Mode: Sign up to save your scripts and recordings', {
        action: {
          label: 'Sign Up',
          onClick: () => router.push('/auth/sign-up')
        }
      });
      return;
    }
    
    if (!user) {
      await loginWithGoogle();
      return;
    }
    
    const toastId = toast.loading(t('saving'));
    const result = await saveScriptAction({
      content: store.text,
      bg_url: store.bgUrl,
      music_url: store.musicUrl,
      
      // NEW: Include full config snapshot from useConfigStore
      config: {
        version: '1.0.0',
        typography,
        colors,
        effects,
        layout,
        animations,
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          appVersion: '1.0.0',
        },
      },
      
      // DEPRECATED: Keep for backward compatibility with existing scripts
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
    <div className="w-full lg:w-[30%] bg-card border-r border-border flex flex-col h-full z-20 shadow-2xl relative">
      {/* Header */}
      <div className="p-6 border-b border-border flex justify-between items-center gap-2">
        <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
          {t('title')}
        </h1>
        
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          {!user ? (
            <button onClick={loginWithGoogle} className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-full font-bold hover:bg-primary/90 transition-colors">
              {t('login')}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-muted-foreground max-w-[80px] truncate">{user?.email || ''}</span>
                {isPro && <span className="text-[9px] text-yellow-400 font-bold flex items-center gap-0.5"><Crown size={8}/> PRO</span>}
              </div>
              <button onClick={logout} className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground">
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content Controls */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-24">
        {/* Text Area */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-muted-foreground uppercase">{t('contentLabel')}</label>
          </div>
          <textarea
            value={store.text}
            onChange={(e) => store.setText(e.target.value)}
            className="w-full h-32 bg-secondary rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none resize-none border border-border placeholder-muted-foreground"
            placeholder={t('contentPlaceholder')}
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-card/90 backdrop-blur border-t border-border space-y-2">
        <button onClick={() => store.setMode('running')} className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
          <Play size={16} fill="currentColor" /> {t('preview')}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={handleSave} className="py-2 bg-green-900/40 text-green-400 border border-green-900 hover:bg-green-900/60 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
            <Save size={14} /> {t('save')}
          </button>
          <button onClick={handleShare} className="py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
            <Share2 size={14} /> {t('share')}
          </button>
        </div>
      </div>
    </div>
  );
}
