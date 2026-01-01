"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useUIStore } from '@/stores/useUIStore';
import { ContentPanel } from './editor/ContentPanel';
import { ConfigPanel } from './config/ConfigPanel';
import { PreviewPanel } from './editor/PreviewPanel';

/**
 * Editor - Main teleprompter editor component
 * 
 * Redesigned with three-column layout:
 * - ContentPanel (30%): Text input, auth, quick actions
 * - ConfigPanel (35%): Always-visible configuration tabs
 * - PreviewPanel (35%): Live preview of teleprompter
 * 
 * Legacy controls removed:
 * - FontSelector, ColorPicker (moved to ConfigPanel)
 * - MediaInput (moved to ConfigPanel as MediaTab)
 * - Inline sliders (moved to TypographyTab/LayoutTab)
 */
export function Editor() {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { panelState } = useUIStore();

  // T025: Sync panel visibility with screen size
  // Panel should only be visible on desktop (1024px+)
  const shouldShowPanel = isDesktop && panelState.visible;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -50 }}
      transition={prefersReducedMotion ? { duration: 0 } : undefined}
      className="h-screen flex flex-col lg:flex-row overflow-hidden"
    >
      {/* Content Panel - Text editing and quick actions */}
      <ContentPanel />
      
      {/* T021: Config Panel wrapped with AnimatePresence for exit animations */}
      {/* T025: Only show on desktop screens (1024px+) */}
      <AnimatePresence mode="wait">
        {shouldShowPanel && <ConfigPanel key="config-panel" />}
      </AnimatePresence>
      
      {/* Preview Panel - Live preview (desktop only) */}
      <PreviewPanel />
    </motion.div>
  );
}
