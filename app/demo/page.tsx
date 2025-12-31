"use client";

import React, { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useTeleprompterStore } from '@/stores/useTeleprompterStore';
import { useDemoStore } from '@/stores/useDemoStore';
import { Editor } from '@/components/teleprompter/Editor';
import { Runner } from '@/components/teleprompter/Runner';
import { AppProvider } from '@/components/AppProvider';
import { Toaster } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import { DemoBanner } from '@/components/Demo/DemoBanner';
import { demoConfig, demoLimits } from '@/lib/demo/demoConfig';
import { toast } from 'sonner';

/**
 * Demo mode page with pre-loaded sample content
 * Demonstrates all teleprompter features without requiring authentication
 * Recordings and changes are not saved in demo mode
 */
function DemoLogic() {
  const router = useRouter();
  const store = useTeleprompterStore();
  const { setDemoMode } = useDemoStore();

  useEffect(() => {
    // Set demo mode on mount
    setDemoMode(true);

    // Load demo configuration
    store.setAll({
      text: demoConfig.script.text,
      bgUrl: demoConfig.media.bgUrl,
      musicUrl: demoConfig.media.musicUrl,
      font: demoConfig.script.font,
      colorIndex: demoConfig.script.colorIndex,
      speed: demoConfig.script.speed,
      fontSize: demoConfig.script.fontSize,
      align: demoConfig.script.align,
      lineHeight: demoConfig.script.lineHeight,
      margin: demoConfig.script.margin,
      overlayOpacity: demoConfig.script.overlayOpacity,
      mode: 'setup',
      isReadOnly: false
    });

    return () => {
      // Reset demo mode on unmount
      setDemoMode(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setDemoMode]);

  // Override save handler to show warning
  useEffect(() => {
    const handleSaveAttempt = () => {
      toast.error('Demo Mode: Sign up to save your scripts and recordings', {
        action: {
          label: 'Sign Up',
          onClick: () => router.push('/auth/sign-up')
        }
      });
    };

    // Listen for save attempts
    window.addEventListener('demo-save-attempt', handleSaveAttempt);

    return () => {
      window.removeEventListener('demo-save-attempt', handleSaveAttempt);
    };
  }, [router]);

  return (
    <>
      <DemoBanner />
      <AnimatePresence mode="wait">
        {store.mode === 'setup' ? <Editor key="editor" /> : <Runner key="runner" />}
      </AnimatePresence>
    </>
  );
}

export default function DemoPage() {
  return (
    <AppProvider>
      <Toaster position="top-center" richColors />
      <Suspense fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          Loading Demo...
        </div>
      }>
        <DemoLogic />
      </Suspense>
    </AppProvider>
  );
}
