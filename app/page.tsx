"use client";

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LZString from 'lz-string';
import { useTeleprompterStore } from '@/stores/useTeleprompterStore';
import { Editor } from '@/components/teleprompter/Editor';
import { Runner } from '@/components/teleprompter/Runner';
import { AppProvider } from '@/components/AppProvider';
import { Toaster } from 'sonner';
import { AnimatePresence } from 'framer-motion';

import { FONT_STYLES } from '@/lib/constants';

function TeleprompterLogic() {
  const searchParams = useSearchParams();
  const store = useTeleprompterStore();

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const decompressed = LZString.decompressFromEncodedURIComponent(data);
        if (decompressed) {
          const parsed = JSON.parse(decompressed);
          store.setAll({
            text: parsed.text,
            bgUrl: parsed.bgUrl,
            musicUrl: parsed.musicUrl,
            font: FONT_STYLES[parsed.font]?.name as any || 'Classic',
            colorIndex: parsed.color || 0,
            align: parsed.align || 'center',
            mode: 'running',
            isReadOnly: true
          });
        }
      } catch (e) {
        console.error("Lỗi đọc link share", e);
      }
    }
  }, [searchParams, store]);

  return (
    <AnimatePresence mode="wait">
      {store.mode === 'setup' ? <Editor key="editor" /> : <Runner key="runner" />}
    </AnimatePresence>
  );
}

export default function TeleprompterPage() {
  return (
    <AppProvider>
        <Toaster position="top-center" richColors />
        <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
           <TeleprompterLogic />
        </Suspense>
    </AppProvider>
  );
}
