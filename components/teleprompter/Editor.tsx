"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useUIStore } from '@/stores/useUIStore';
import { ContentPanel } from './editor/ContentPanel';
import { PreviewPanel } from './editor/PreviewPanel';

/**
 * Editor - Main teleprompter editor component
 *
 * Redesigned with responsive layout:
 * - Desktop (1024px+): Two-column layout
 *   - ContentPanel (30%): Text input (20%), Config (80%), auth, quick actions
 *   - PreviewPanel (70%): Live preview
 *
 * - Mobile/Tablet (< 1024px): Stacked layout
 *   - ContentPanel: Text editing and inline config
 *   - PreviewPanel: Live preview
 *
 * Changes from original:
 * - ContentPanel now has 20/80 vertical split (textarea: 20%, config: 80%)
 * - Config is always visible inline in ContentPanel
 */
export function Editor() {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, y: -50 }}
        transition={prefersReducedMotion ? { duration: 0 } : undefined}
        className="h-screen flex flex-col lg:flex-row overflow-hidden"
      >
        {/* Content Panel - Text editing and inline config */}
        <ContentPanel />
        
        {/* Preview Panel - Live preview */}
        <PreviewPanel />
      </motion.div>
    </>
  );
}
