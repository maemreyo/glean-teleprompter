"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Play, Save, Share2, LogOut, Crown, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
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
import { useUIStore } from '@/stores/useUIStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useAutoSave } from '@/hooks/useAutoSave';
import { AutoSaveStatus } from '@/components/teleprompter/config/ui/AutoSaveStatus';
import { TextareaExpandButton } from '@/components/teleprompter/editor/TextareaExpandButton';
import type { TextareaSize } from '@/components/teleprompter/editor/TextareaExpandButton';

/**
 * ContentPanel - The content editing section of the Editor
 * 
 * Contains:
 * - Header with title, auth, and theme switcher
 * - Text area for script content
 * - Quick action buttons (Preview, Save, Share)
 * - Mobile/Tablet preview toggle button
 */
export function ContentPanel() {
  const t = useTranslations('Editor');
  const router = useRouter();
  const store = useTeleprompterStore();
  const { user, isPro } = useAuthStore();
  const { isDemoMode } = useDemoStore();
  const { loginWithGoogle, logout } = useSupabaseAuth();
  const { typography, colors, effects, layout, animations } = useConfigStore();
  const { previewState, togglePreview, footerState, toggleFooter, textareaPrefs, setTextareaPrefs, toggleTextareaSize } = useUIStore();
  const isMobileOrTablet = useMediaQuery('(max-width: 1023px)');
  
  // Ref for textarea element
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Track previous size for Esc key to exit fullscreen (T054)
  const [previousSize, setPreviousSize] = useState<TextareaSize>('default');
  
  // Track the last non-fullscreen size
  useEffect(() => {
    if (textareaPrefs.size !== 'fullscreen') {
      // Update previousSize whenever we're not in fullscreen
      // This ensures we remember the size before entering fullscreen
      setPreviousSize(textareaPrefs.size as TextareaSize);
    }
    // When in fullscreen, we don't update - previousSize retains the last non-fullscreen size
  }, [textareaPrefs.size]);
  
  // Get height class based on current size
  const getHeightClass = (): string => {
    switch (textareaPrefs.size) {
      case 'medium':
        return 'h-80';
      case 'large':
        return 'h-[500px]';
      case 'fullscreen':
        return 'h-screen';
      default:
        return 'h-32';
    }
  };

  // Auto-save hook for local draft persistence
  const { status: autoSaveStatus, lastSavedAt, error: autoSaveError, saveNow } = useAutoSave(
    {
      text: store.text,
      bgUrl: store.bgUrl,
      musicUrl: store.musicUrl,
    },
    {
      storageKey: 'teleprompter_draft',
      interval: 5000,
      enabled: true,
    }
  );
  
  // Auto-scroll to bottom when Enter is pressed (T029)
  // Exit fullscreen with Esc key (T054)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && textareaRef.current) {
      // Small timeout to ensure content renders first
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        }
      }, 10);
    }
    
    // Handle Escape key to exit fullscreen
    if (e.key === 'Escape' && textareaPrefs.size === 'fullscreen') {
      e.preventDefault();
      // Return to previous size (or default if not set)
      const sizeToRestore = previousSize !== 'fullscreen' ? previousSize : 'default';
      setTextareaPrefs({ size: sizeToRestore, isFullscreen: false });
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
      // Update auto-save timestamp to show "Just now"
      await saveNow();
    } else {
      toast.error(t('saveFailed') + " " + result.error, { id: toastId });
    }
  };

  const handleShare = () => {
    // Basic share logic: Copy current URL
    navigator.clipboard.writeText(window.location.href);
    toast.success(t('share') + " Copied!");
  };

  // T056: Ensure config panel remains visible when textarea is fullscreen
  // The ContentPanel already has z-20, and PreviewPanel (config panel) should have higher z-index
  // This is handled by the parent component's layout
  
  return (
    <div className={`w-full lg:w-[30%] bg-card border-r border-border flex flex-col shadow-2xl relative transition-all duration-200 ${textareaPrefs.size === 'fullscreen' ? 'fixed inset-0 z-50 w-full h-screen' : 'z-20 h-full'}`}>
      {/* Header - T056: Always visible, even in fullscreen */}
      <div className={`p-6 border-b border-border flex justify-between items-center gap-2 ${textareaPrefs.size === 'fullscreen' ? 'z-50 bg-card' : ''}`}>
        <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
          {t('title')}
        </h1>
        
        <div className="flex items-center gap-2">
          {/* Auto-save status indicator */}
          <AutoSaveStatus
            status={autoSaveStatus}
            lastSavedAt={lastSavedAt ?? undefined}
            errorMessage={autoSaveError ?? undefined}
            onRetry={saveNow}
          />
          
          {/* Mobile/Tablet Preview Toggle Button */}
          {isMobileOrTablet && (
            <button
              onClick={togglePreview}
              className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"
              aria-label={previewState.isOpen ? 'Hide preview' : 'Show preview'}
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

      {/* Content Controls - T028: Added pb-32 (128px) padding-bottom to prevent footer obstruction */}
      <div className={`flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar ${textareaPrefs.size === 'fullscreen' ? 'overflow-hidden' : 'pb-32'}`}>
        {/* Text Area */}
        <div className={`space-y-2 ${textareaPrefs.size === 'fullscreen' ? 'h-full flex flex-col' : ''}`}>
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-muted-foreground uppercase">{t('contentLabel')}</label>
          </div>
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={store.text}
              onChange={(e) => store.setText(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`${getHeightClass()} transition-all duration-200 w-full bg-secondary rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none resize-none border border-border placeholder-muted-foreground`}
              placeholder={t('contentPlaceholder')}
            />
            <TextareaExpandButton
              currentSize={textareaPrefs.size as TextareaSize}
              onToggle={toggleTextareaSize}
              disabled={false}
            />
          </div>
        </div>
      </div>

      {/* Footer Actions - T032: Semi-transparent backdrop (bg-card/90 backdrop-blur) */}
      {/* T056: Hide footer when fullscreen to maximize editing space */}
      {textareaPrefs.size !== 'fullscreen' && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-card/90 backdrop-blur border-t border-border space-y-2">
        
        {/* T030/T033: Collapse/Expand button */}
        <div className="flex justify-center">
          <button
            onClick={toggleFooter}
            className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"
            aria-label={footerState.isCollapsed ? 'Expand footer' : 'Collapse footer'}
          >
            {footerState.isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
        
        {/* T031: Minimized footer state - show only Preview button when collapsed */}
        {footerState.isCollapsed ? (
          <button
            onClick={() => store.setMode('running')}
            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Play size={16} fill="currentColor" /> {t('preview')}
          </button>
        ) : (
          <>
            <button
              onClick={() => store.setMode('running')}
              className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <Play size={16} fill="currentColor" /> {t('preview')}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleSave}
                className="py-2 bg-green-900/40 text-green-400 border border-green-900 hover:bg-green-900/60 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Save size={14} /> {t('save')}
              </button>
              <button
                onClick={handleShare}
                className="py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Share2 size={14} /> {t('share')}
              </button>
            </div>
          </>
        )}
        </div>
      )}
    </div>
  );
}
