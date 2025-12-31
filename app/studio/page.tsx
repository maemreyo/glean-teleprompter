"use client";

import React, { useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTeleprompterStore } from '@/stores/useTeleprompterStore';
import { useDemoStore } from '@/stores/useDemoStore';
import { useConfigStore } from '@/lib/stores/useConfigStore';
import { Editor } from '@/components/teleprompter/Editor';
import { Runner } from '@/components/teleprompter/Runner';
import { AppProvider } from '@/components/AppProvider';
import { Toaster, toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import { getTemplateById } from '@/lib/templates/templateConfig';
import { loadScriptAction } from '@/actions/scripts';

type FontStyle = 'Classic' | 'Modern' | 'Typewriter' | 'Novel' | 'Neon';
type TextAlign = 'left' | 'center';

/**
 * Studio page - Main teleprompter editor
 * Moved from root to /studio route
 * Supports loading from:
 * - ?script={id} - Load saved script from database
 * - ?template={id} - Load pre-configured template
 */
function StudioLogic() {
  const searchParams = useSearchParams();
  const store = useTeleprompterStore();
  const { setDemoMode } = useDemoStore();
  
  // Track if we've already initialized to prevent infinite loops
  const initializedRef = useRef(false);

  useEffect(() => {
    // Only run initialization once on mount
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Ensure demo mode is off (only once)
    setDemoMode(false);
  }, [setDemoMode]);

  useEffect(() => {
    // Skip if not initialized yet
    if (!initializedRef.current) return;

    // Check for template parameter first
    const templateId = searchParams.get('template');
    if (templateId) {
      const template = getTemplateById(templateId);
      if (template) {
        store.setAll({
          text: template.content,
          font: template.settings.font as FontStyle,
          colorIndex: template.settings.colorIndex || 0,
          speed: template.settings.speed || 2,
          fontSize: template.settings.fontSize || 48,
          align: template.settings.align || 'center' as TextAlign,
          lineHeight: template.settings.lineHeight || 1.5,
          margin: template.settings.margin || 0,
          overlayOpacity: template.settings.overlayOpacity || 0.5,
          mode: 'setup',
          isReadOnly: false
        });
        toast.success(`Loaded template: ${template.name}`);
        return;
      }
    }

    // Check for script parameter (for loading saved scripts)
    const scriptId = searchParams.get('script');
    if (scriptId) {
      console.log('[Studio] Loading script:', scriptId);
      loadScriptAction(scriptId).then(result => {
        if (result.error) {
          toast.error('Failed to load script: ' + result.error);
          return;
        }
        if (result.success && result.script) {
          const script = result.script;
          console.log('[Studio] Script loaded:', script);
          
          // Set basic teleprompter data
          store.setText(script.content || '');
          store.setBgUrl(script.bg_url || '');
          store.setMusicUrl(script.music_url || '');
          
          // Load config if present
          if (script.config) {
            console.log('[Studio] Loading config from script:', script.config);
            // Use setAll to restore the full config snapshot
            useConfigStore.getState().setAll(script.config);
            toast.success('Loaded script with custom styling');
          } else {
            // Fall back to legacy settings
            if (script.settings) {
              console.log('[Studio] Loading legacy settings:', script.settings);
              store.setAll({
                font: script.settings.font || 'Classic',
                colorIndex: script.settings.colorIndex || 0,
                speed: script.settings.speed || 2,
                fontSize: script.settings.fontSize || 48,
                align: script.settings.align || 'center',
                lineHeight: script.settings.lineHeight || 1.5,
                margin: script.settings.margin || 0,
                overlayOpacity: script.settings.overlayOpacity || 0.5,
              });
            }
            toast.success('Loaded script');
          }
        }
      }).catch(err => {
        console.error('[Studio] Error loading script:', err);
        toast.error('Failed to load script');
      });
      return;
    }

    // Otherwise start fresh or load from localStorage
    const localDraft = localStorage.getItem('teleprompter_draft');
    if (localDraft) {
      try {
        const parsed = JSON.parse(localDraft);
        store.setAll({
          ...parsed,
          mode: 'setup'
        });
      } catch (e) {
        console.error('Error loading local draft', e);
      }
    }
    // Only depend on searchParams, which is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Auto-save to localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      if (store.mode === 'setup' && !store.isReadOnly) {
        localStorage.setItem('teleprompter_draft', JSON.stringify({
          text: store.text,
          bgUrl: store.bgUrl,
          musicUrl: store.musicUrl,
          font: store.font,
          colorIndex: store.colorIndex,
          speed: store.speed,
          fontSize: store.fontSize,
          align: store.align,
          lineHeight: store.lineHeight,
          margin: store.margin,
          overlayOpacity: store.overlayOpacity
        }));
      }
    }, 5000); // Save every 5 seconds

    return () => clearInterval(interval);
  }, [store]);

  return (
    <AnimatePresence mode="wait">
      {store.mode === 'setup' ? <Editor key="editor" /> : <Runner key="runner" />}
    </AnimatePresence>
  );
}

export default function StudioPage() {
  return (
    <AppProvider>
      <Toaster position="top-center" richColors />
      <Suspense fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          Loading Studio...
        </div>
      }>
        <StudioLogic />
      </Suspense>
    </AppProvider>
  );
}
