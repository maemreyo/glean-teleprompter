"use client";

import React, { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
// 007-unified-state-architecture: Use new stores with single responsibility
import { useContentStore } from '@/lib/stores/useContentStore';
import { useConfigStore } from '@/lib/stores/useConfigStore';
import { useUIStore } from '@/stores/useUIStore';
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
  const t = useTranslations("DemoPage");
  // 007-unified-state-architecture: Use new stores with single responsibility
  const { setText, setBgUrl, setMusicUrl, setIsReadOnly } = useContentStore();
  const { setAll: setConfigAll } = useConfigStore();
  const { setMode } = useUIStore();
  const { setDemoMode } = useDemoStore();

  useEffect(() => {
    // Set demo mode on mount
    setDemoMode(true);

    // Load demo configuration into new stores
    // 007-unified-state-architecture: Load content to useContentStore
    setText(demoConfig.script.text);
    setBgUrl(demoConfig.media.bgUrl);
    setMusicUrl(demoConfig.media.musicUrl);
    setIsReadOnly(false);
    
    // 007-unified-state-architecture: Load styling to useConfigStore
    // Map legacy demo config to new config structure
    setConfigAll({
      version: '1.0.0',
      typography: {
        fontFamily: demoConfig.script.font === 'Classic' ? 'Georgia' :
                   demoConfig.script.font === 'Modern' ? 'Inter' :
                   demoConfig.script.font === 'Typewriter' ? 'Courier New' :
                   demoConfig.script.font === 'Novel' ? 'Georgia' :
                   'Inter', // Default for Neon
        fontWeight: 400,
        fontSize: demoConfig.script.fontSize || 48,
        letterSpacing: 0,
        lineHeight: demoConfig.script.lineHeight || 1.5,
        textTransform: 'none'
      },
      colors: {
        primaryColor: '#ffffff',
        gradientEnabled: false,
        gradientType: 'linear',
        gradientColors: ['#ffffff', '#fbbf24'],
        gradientAngle: 90,
        outlineColor: '#000000',
        glowColor: '#ffffff'
      },
      effects: {
        shadowEnabled: false,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        shadowBlur: 4,
        shadowColor: '#000000',
        shadowOpacity: 0.5,
        outlineEnabled: false,
        outlineWidth: 2,
        outlineColor: '#000000',
        glowEnabled: false,
        glowBlurRadius: 10,
        glowIntensity: 0.5,
        glowColor: '#ffffff',
        backdropFilterEnabled: false,
        backdropBlur: 0,
        backdropBrightness: 100,
        backdropSaturation: 100,
        overlayOpacity: demoConfig.script.overlayOpacity || 0.5
      },
      layout: {
        horizontalMargin: demoConfig.script.margin || 0,
        verticalPadding: 0,
        textAlign: demoConfig.script.align || 'center',
        columnCount: 1,
        columnGap: 20,
        textAreaWidth: 100,
        textAreaPosition: 'center'
      },
      animations: {
        smoothScrollEnabled: true,
        scrollDamping: 0.5,
        entranceAnimation: 'fade-in',
        entranceDuration: 500,
        wordHighlightEnabled: false,
        highlightColor: '#fbbf24',
        highlightSpeed: 200,
        autoScrollEnabled: false,
        autoScrollSpeed: demoConfig.script.speed * 10 || 50, // Convert multiplier 1-10 to px/sec
        autoScrollAcceleration: 0
      },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        appVersion: '1.0.0'
      }
    });
    
    // Set mode via useUIStore
    useUIStore.getState().setMode('setup');

    return () => {
      // Reset demo mode on unmount
      setDemoMode(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setDemoMode, setText, setBgUrl, setMusicUrl, setIsReadOnly, setConfigAll, setMode]);

  // Override save handler to show warning
  useEffect(() => {
    const handleSaveAttempt = () => {
      toast.error(t("saveWarning"), {
        action: {
          label: t("signUp"),
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

  // 007-unified-state-architecture: Use mode from useUIStore
  const mode = useUIStore((state) => state.mode);

  return (
    <>
      <DemoBanner />
      <AnimatePresence mode="wait">
        {mode === 'setup' && <Editor />}
        {mode === 'running' && <Runner />}
      </AnimatePresence>
    </>
  );
}

export default function DemoPage() {
  const t = useTranslations("DemoPage");
  
  return (
    <AppProvider>
      <Toaster position="top-center" richColors />
      <Suspense fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          {t("loadingDemo")}
        </div>
      }>
        <DemoLogic />
      </Suspense>
    </AppProvider>
  );
}
