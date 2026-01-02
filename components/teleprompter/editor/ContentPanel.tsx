"use client";

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Play, Save, Share2, LogOut, Crown, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
// 007-unified-state-architecture: Use useContentStore for content data
import { useContentStore } from '@/lib/stores/useContentStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { saveScriptAction } from '@/actions/scripts';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useConfigStore } from '@/lib/stores/useConfigStore';
import { useDemoStore } from '@/stores/useDemoStore';
import { useUIStore } from '@/stores/useUIStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useAutoSave } from '@/hooks/useAutoSave';
import { AutoSaveStatus } from '@/components/teleprompter/config/ui/AutoSaveStatus';
import { ContentEditorDialog, ContentEditorDialogTrigger } from '@/components/teleprompter/editor/ContentEditorDialog';
import { ConfigPanel } from '@/components/teleprompter/config/ConfigPanel';

interface ContentPanelProps {
  // Props for React.memo comparison
  className?: string;
}

/**
 * ContentPanel - The content editing section of the Editor
 *
 * Redesigned with 20/80 vertical split:
 * - Textarea area: 20% height (fixed, not scrollable)
 * - Config area: 80% height (scrollable)
 *
 * Contains:
 * - Header with title, auth, and theme switcher
 * - Text area for script content (20% height)
 * - Config panel below (80% height, scrollable)
 * - Quick action buttons (Preview, Save, Share)
 * - "View Detail" button to open ContentEditorDialog
 */
export function ContentPanel({ className = '' }: ContentPanelProps) {
  const t = useTranslations('Editor');
  const router = useRouter();
  // 007-unified-state-architecture: Use useContentStore for content data
  const contentStore = useContentStore();
  const { user, isPro } = useAuthStore();
  const { isDemoMode } = useDemoStore();
  const { loginWithGoogle, logout } = useSupabaseAuth();
  const { typography, colors, effects, layout, animations } = useConfigStore();
  const { previewState, togglePreview, footerState, toggleFooter, mode } = useUIStore();
  const isMobileOrTablet = useMediaQuery('(max-width: 1023px)');
  const isVerySmallScreen = useMediaQuery('(max-width: 375px)');
  
  // Content editor dialog state
  const [contentEditorOpen, setContentEditorOpen] = useState(false);
  
  // Ref for textarea element
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-save hook for local draft persistence
  const { status: autoSaveStatus = 'idle', lastSavedAt, saveNow } = useAutoSave(
    useContentStore,
    {
      mode: mode ?? 'setup',
      debounceMs: 1000,
      periodicMs: 5000,
    }
  );
  
  // Auto-scroll to bottom when Enter is pressed
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && textareaRef.current) {
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        }
      }, 10);
    }
  };

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
      // 007-unified-state-architecture: Use contentStore for content data
      content: contentStore.text,
      bg_url: contentStore.bgUrl,
      music_url: contentStore.musicUrl,
      
      // Include full config snapshot from useConfigStore
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
      
      title: contentStore.text.substring(0, 30) || "Untitled",
      description: "Created via Web Editor"
    });

    if (result.success) {
      toast.success(t('saveSuccess'), { id: toastId });
      await saveNow();
    } else {
      toast.error(t('saveFailed') + " " + result.error, { id: toastId });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(t('share') + " Copied!");
  };
  
  return (
    <div
      className={`w-full lg:w-[30%] bg-card border-r border-border flex flex-col shadow-2xl relative z-20 h-full ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-border flex justify-between items-center gap-2">
        <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
          {t('title')}
        </h1>
        
        <div className="flex items-center gap-2">
          {/* Auto-save status indicator */}
          <AutoSaveStatus
            status={autoSaveStatus}
            lastSavedAt={lastSavedAt ?? undefined}
            onRetry={saveNow}
          />
          
          {/* Mobile/Tablet Preview Toggle Button */}
          {isMobileOrTablet && (
            <button
              onClick={togglePreview}
              className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"
              aria-label={previewState.isOpen ? t('hidePreview') : t('showPreview')}
            >
              {previewState.isOpen ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
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

      {/* Content Area - 20/80 Vertical Split */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Textarea Area - 20% height, fixed, not scrollable */}
        <div className="flex-none h-[20%] min-h-[20%] p-6 pb-4 border-b border-border">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">{t('contentLabel')}</label>
            <ContentEditorDialogTrigger onClick={() => setContentEditorOpen(true)} />
          </div>
          <textarea
            ref={textareaRef}
            value={contentStore.text}
            onChange={(e) => contentStore.setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-[calc(100%-32px)] bg-secondary rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none resize-none border border-border placeholder-muted-foreground"
            placeholder={t('contentPlaceholder')}
          />
        </div>

        {/* Config Area - 80% height, scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <ConfigPanel />
        </div>
      </div>

      {/* Footer */}
      <div
        className="fixed bottom-0 left-0 right-0 p-4 bg-card/90 backdrop-blur border-t border-border space-y-2 z-30 transition-all duration-200 ease-in-out lg:left-[30%]"
      >
        {/* Collapse/Expand button */}
        <div className="flex justify-center">
          <button
            onClick={toggleFooter}
            className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-all duration-200 ease-in-out"
            style={{
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label={footerState.isCollapsed ? t('expandFooter') : t('collapseFooter')}
          >
            {footerState.isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
        
        {/* Footer action buttons */}
        {footerState.isCollapsed ? (
          <div className={isVerySmallScreen ? 'space-y-2' : 'grid grid-cols-3 gap-2'}>
            <button
              onClick={handleSave}
              className="py-2 bg-green-900/40 text-green-400 border border-green-900 hover:bg-green-900/60 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 ease-in-out"
              style={{
                minHeight: '44px',
                minWidth: isVerySmallScreen ? '0' : '44px',
              }}
            >
              <Save size={14} /> {t('save')}
            </button>
            <button
              onClick={handleShare}
              className="py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 ease-in-out"
              style={{
                minHeight: '44px',
                minWidth: isVerySmallScreen ? '0' : '44px',
              }}
            >
              <Share2 size={14} /> {t('share')}
            </button>
            <button
              onClick={() => mode === 'setup' ? useUIStore.getState().setMode('running') : useUIStore.getState().setMode('setup')}
              className="py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all duration-200 ease-in-out flex items-center justify-center gap-2"
              style={{
                minHeight: '44px',
              }}
            >
              <Play size={16} fill="currentColor" /> {t('preview')}
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => mode === 'setup' ? useUIStore.getState().setMode('running') : useUIStore.getState().setMode('setup')}
              className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all duration-200 ease-in-out flex items-center justify-center gap-2"
              style={{
                minHeight: '44px',
              }}
            >
              <Play size={16} fill="currentColor" /> {t('preview')}
            </button>
            <div className={isVerySmallScreen ? 'space-y-2' : 'grid grid-cols-2 gap-2'}>
              <button
                onClick={handleSave}
                className="py-2 bg-green-900/40 text-green-400 border border-green-900 hover:bg-green-900/60 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 ease-in-out"
                style={{
                  minHeight: '44px',
                  minWidth: isVerySmallScreen ? '0' : '44px',
                }}
              >
                <Save size={14} /> {t('save')}
              </button>
              <button
                onClick={handleShare}
                className="py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 ease-in-out"
                style={{
                  minHeight: '44px',
                  minWidth: isVerySmallScreen ? '0' : '44px',
                }}
              >
                <Share2 size={14} /> {t('share')}
              </button>
            </div>
          </>
        )}
      </div>
      
      {/* Content Editor Dialog */}
      <ContentEditorDialog open={contentEditorOpen} onOpenChange={setContentEditorOpen} />
    </div>
  );
}
