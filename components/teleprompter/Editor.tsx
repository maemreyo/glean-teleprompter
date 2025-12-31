"use client";

import React from 'react';
import { motion } from 'framer-motion';
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
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0, y: -50 }}
      className="h-screen flex flex-col lg:flex-row overflow-hidden"
    >
      {/* Content Panel - Text editing and quick actions */}
      <ContentPanel />
      
      {/* Config Panel - Always-visible configuration */}
      <ConfigPanel />
      
      {/* Preview Panel - Live preview (desktop only) */}
      <PreviewPanel />
    </motion.div>
  );
}
