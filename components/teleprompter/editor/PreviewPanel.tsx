"use client";

import React from 'react';
import { useTeleprompterStore } from '@/stores/useTeleprompterStore';
import { TeleprompterText } from '@/components/teleprompter/display/TeleprompterText';
import { useConfigStore } from '@/lib/stores/useConfigStore';

/**
 * PreviewPanel - The live preview section of the Editor
 * 
 * Displays:
 * - Background image layer
 * - Dark overlay for readability
 * - TeleprompterText styled by useConfigStore (no legacy props)
 */
export function PreviewPanel() {
  const store = useTeleprompterStore();
  const { typography, colors, effects, layout, animations } = useConfigStore();

  return (
    <div className="hidden lg:block w-[35%] relative bg-black overflow-hidden">
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-70 transition-opacity duration-300"
        style={{ backgroundImage: `url('${store.bgUrl}')` }}
      />
      
      {/* Overlay Layer - dark tint for readability */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Teleprompter Text - uses ONLY useConfigStore for styling */}
      <div className="absolute inset-0 flex items-center justify-center p-12 overflow-hidden">
        <TeleprompterText
          text={store.text}
          className="max-h-full overflow-hidden"
        />
      </div>
    </div>
  );
}
