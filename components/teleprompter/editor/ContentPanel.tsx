"use client";

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Play, Save, Share2, LogOut, Crown, Eye, EyeOff, ChevronUp, ChevronDown, Settings } from 'lucide-react';
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
import { TextareaExpandButton } from '@/components/teleprompter/editor/TextareaExpandButton';
import type { TextareaSize } from '@/components/teleprompter/editor/TextareaExpandButton';
import { TEXTAREA_SCALE_MULTIPLIERS } from '@/lib/config/types';

interface ContentPanelProps {
  /** T079: Callback to open mobile config panel */
  onOpenMobileConfig?: () => void
}

/**
 * ContentPanel - The content editing section of the Editor
 *
 * Contains:
 * - Header with title, auth, and theme switcher
 * - Text area for script content
 * - Quick action buttons (Preview, Save, Share)
 * - Mobile/Tablet preview toggle button
 * - T079: Mobile config toggle button
 */
export function ContentPanel({ onOpenMobileConfig }: ContentPanelProps) {
  const t = useTranslations('Editor');
  const router = useRouter();
  // 007-unified-state-architecture: Use useContentStore for content data
  const contentStore = useContentStore();
  const { user, isPro } = useAuthStore();
  const { isDemoMode } = useDemoStore();
  const { loginWithGoogle, logout } = useSupabaseAuth();
  const { typography, colors, effects, layout, animations } = useConfigStore();
  const { previewState, togglePreview, footerState, toggleFooter, textareaPrefs, setTextareaPrefs, toggleTextareaSize, panelState, togglePanel, textareaScale, setConfigFooterVisible, configFooterState, mode } = useUIStore();
  const isMobileOrTablet = useMediaQuery('(max-width: 1023px)');
  const isVerySmallScreen = useMediaQuery('(max-width: 375px)');
  
  // T043: Define scale multipliers CSS variables
  // T045: Calculate scale multipliers for footer buttons
  // T084: [US6] Calculate footer scale multiplier based on textarea size
  const scaleStyles = useMemo(() => {
    const scale = textareaScale.scale;
    const fontScale = Math.min(scale, 1.33); // Cap at 16px max (12px * 1.33 ≈ 16px)
    return {
      '--scale-multiplier': scale.toString(),
      '--font-scale': fontScale.toString(),
      '--button-scale': scale.toString(),
    } as React.CSSProperties;
  }, [textareaScale.scale]);
  
  // T084: [US6] Calculate footer height based on textarea scale
  // Base footer height is 60px, scaled proportionally with textarea size
  const footerHeight = useMemo(() => {
    const baseHeight = 60; // Base footer height in pixels
    const scaledHeight = Math.round(baseHeight * textareaScale.scale);
    return scaledHeight;
  }, [textareaScale.scale]);
  
  // Update configFooterState when scale changes (T084)
  useEffect(() => {
    setConfigFooterVisible(true, footerHeight);
  }, [footerHeight, setConfigFooterVisible]);
  
  // T086: [US6] Calculate content padding based on footer height
  // Add extra buffer (8px) for visual comfort
  const contentPaddingBottom = useMemo(() => {
    return footerHeight + 32; // footerHeight + existing pb-32 (128px base + scaled footer)
  }, [footerHeight]);
  
  // T023: Keyboard shortcut for toggling config panel (Ctrl/Cmd + ,)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + , to toggle config panel
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        togglePanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePanel]);
  
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
      // 007-unified-state-architecture: Use contentStore for content data
      text: contentStore.text,
      bgUrl: contentStore.bgUrl,
      musicUrl: contentStore.musicUrl,
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
      // 007-unified-state-architecture: Use contentStore for content data
      content: contentStore.text,
      bg_url: contentStore.bgUrl,
      music_url: contentStore.musicUrl,
      
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
      
      // DEPRECATED: Legacy settings removed - no longer available in useContentStore
      // All styling should come from useConfigStore
      
      title: contentStore.text.substring(0, 30) || "Untitled",
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
    <div
      className={`w-full lg:w-[30%] bg-card border-r border-border flex flex-col shadow-2xl relative transition-all duration-200 ${textareaPrefs.size === 'fullscreen' ? 'fixed inset-0 z-50 w-full h-screen' : 'z-20 h-full'}`}
      style={scaleStyles}
    >
      {/* T048: Ensure no horizontal scroll - overflow-x hidden on content container */}
      {/* Header - T056: Always visible, even in fullscreen */}
      <div className={`p-6 border-b border-border flex justify-between items-center gap-2 ${textareaPrefs.size === 'fullscreen' ? 'z-50 bg-card' : ''}`}>
        <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
          {t('title')}
        </h1>
        
        <div className="flex items-center gap-2">
          {/* T019/T025/T026: Config Panel Toggle Button with ARIA labels - Desktop only */}
          <button
            onClick={togglePanel}
            className="hidden lg:block p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle configuration panel"
            aria-pressed={panelState.visible}
          >
            <Settings size={16} />
          </button>
          
          {/* T079: Mobile Config Panel Toggle Button - Mobile only */}
          {isMobileOrTablet && onOpenMobileConfig && (
            <button
              onClick={onOpenMobileConfig}
              className="lg:hidden p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Open configuration panel"
            >
              <Settings size={16} />
            </button>
          )}
          
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

      {/* T048: Content Controls - overflow-x hidden to prevent horizontal scroll at any size */}
      {/* T046: 200ms size transition on all scalable elements */}
      {/* T086: [US6] Dynamic bottom padding based on footer height to prevent content obstruction */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6 custom-scrollbar transition-all duration-200 ease-in-out"
        style={{
          paddingBottom: textareaPrefs.size === 'fullscreen' ? '1.5rem' : `${contentPaddingBottom}px`,
        }}
      >
        {/* T049: Test layout for 375px viewport - responsive spacing */}
        {/* Text Area */}
        <div className={`space-y-2 ${textareaPrefs.size === 'fullscreen' ? 'h-full flex flex-col' : ''}`}>
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-muted-foreground uppercase transition-transform duration-200 ease-in-out" style={{ transform: `scale(var(--font-scale))`, transformOrigin: 'left center' }}>{t('contentLabel')}</label>
          </div>
          <div className="relative">
            <textarea
              ref={textareaRef}
              // 007-unified-state-architecture: Use contentStore for text content
              value={contentStore.text}
              onChange={(e) => contentStore.setText(e.target.value)}
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

      {/* T085: [US6] Fixed/sticky positioning at viewport bottom */}
      {/* T088: [US6] Hide footer in fullscreen mode */}
      {/* T089: [US6] Semi-transparent backdrop (bg-card/90 backdrop-blur) */}
      {textareaPrefs.size !== 'fullscreen' && (
        <div
          className="fixed bottom-0 left-0 right-0 p-4 bg-card/90 backdrop-blur border-t border-border space-y-2 z-30 transition-all duration-200 ease-in-out"
          style={{
            height: footerState.isCollapsed ? 'auto' : `${footerHeight}px`,
          }}
        >
        
        {/* T030/T033: Collapse/Expand button with scaling */}
        {/* T087: [US6] Ensure 44x44px minimum touch targets */}
        <div className="flex justify-center">
          <button
            onClick={toggleFooter}
            className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-all duration-200 ease-in-out"
            style={{
              transform: `scale(var(--scale-multiplier))`,
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label={footerState.isCollapsed ? 'Expand footer' : 'Collapse footer'}
          >
            {footerState.isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
        
        {/* T045: Footer action buttons with proportional scaling */}
        {/* T047: Labels capped at 16px max using min() function */}
        {/* T087: [US6] 44x44px minimum touch targets maintained */}
        {/* T090: [US6] Footer reflow for mobile */}
        {footerState.isCollapsed ? (
          <div className={isVerySmallScreen ? 'space-y-2' : 'grid grid-cols-3 gap-2'}>
            <button
              onClick={handleSave}
              className="py-2 bg-green-900/40 text-green-400 border border-green-900 hover:bg-green-900/60 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 ease-in-out"
              style={{
                fontSize: 'clamp(11px, min(16px, 11px * var(--font-scale)), 16px)',
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
                fontSize: 'clamp(11px, min(16px, 11px * var(--font-scale)), 16px)',
                minHeight: '44px',
                minWidth: isVerySmallScreen ? '0' : '44px',
              }}
            >
              <Share2 size={14} /> {t('share')}
            </button>
            <button
              // 007-unified-state-architecture: Use useUIStore.mode instead of store.setMode
              onClick={() => mode === 'setup' ? useUIStore.getState().setMode('running') : useUIStore.getState().setMode('setup')}
              className="py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all duration-200 ease-in-out flex items-center justify-center gap-2"
              style={{
                fontSize: 'clamp(12px, min(16px, 12px * var(--font-scale)), 16px)',
                minHeight: '44px',
              }}
            >
              <Play size={16} fill="currentColor" /> {t('preview')}
            </button>
          </div>
        ) : (
          <>
            <button
              // 007-unified-state-architecture: Use useUIStore.mode instead of store.setMode
              onClick={() => mode === 'setup' ? useUIStore.getState().setMode('running') : useUIStore.getState().setMode('setup')}
              className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all duration-200 ease-in-out flex items-center justify-center gap-2"
              style={{
                fontSize: 'clamp(12px, min(16px, 12px * var(--font-scale)), 16px)',
                minHeight: '44px',
              }}
            >
              <Play size={16} fill="currentColor" /> {t('preview')}
            </button>
            {/* T090: [US6] Footer reflow for mobile - stack vertically on very small screens */}
            <div className={isVerySmallScreen ? 'space-y-2' : 'grid grid-cols-2 gap-2'}>
              <button
                onClick={handleSave}
                className="py-2 bg-green-900/40 text-green-400 border border-green-900 hover:bg-green-900/60 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 ease-in-out"
                style={{
                  fontSize: 'clamp(11px, min(16px, 11px * var(--font-scale)), 16px)',
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
                  fontSize: 'clamp(11px, min(16px, 11px * var(--font-scale)), 16px)',
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
      )}
    </div>
  );
}
