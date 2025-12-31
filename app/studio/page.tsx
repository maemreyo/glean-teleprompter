"use client";

import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTeleprompterStore } from '@/stores/useTeleprompterStore';
import { useDemoStore } from '@/stores/useDemoStore';
import { Editor } from '@/components/teleprompter/Editor';
import { Runner } from '@/components/teleprompter/Runner';
import { AppProvider } from '@/components/AppProvider';
import { Toaster, toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import { getTemplateById } from '@/lib/templates/templateConfig';

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
  const router = useRouter();
  const store = useTeleprompterStore();
  const { setDemoMode } = useDemoStore();

  useEffect(() => {
    // Ensure demo mode is off
    setDemoMode(false);

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
      // TODO: Load script from API
      // For now, this would be implemented with the scripts API
      console.log('Loading script:', scriptId);
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
  }, [searchParams, store, setDemoMode]);

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
