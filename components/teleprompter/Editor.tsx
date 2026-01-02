"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useUIStore } from '@/stores/useUIStore';
import { ContentPanel } from './editor/ContentPanel';
import { ConfigPanel } from './config/ConfigPanel';
import { PreviewPanel } from './editor/PreviewPanel';
import { MobileConfigPanel } from './config/TabBottomSheet';
import { useConfigStore } from '@/lib/stores/useConfigStore';
import { useTranslations } from 'next-intl';
import { getTabConfig } from './config/ConfigTabs';
import type { TabId } from '@/lib/config/types';

/**
 * Editor - Main teleprompter editor component
 *
 * Redesigned with responsive layout:
 * - Desktop (1024px+): Three-column layout
 *   - ContentPanel (30%): Text input, auth, quick actions
 *   - ConfigPanel (35%): Always-visible configuration tabs
 *   - PreviewPanel (35%): Live preview of teleprompter
 *
 * - Mobile (< 1024px): Two-column layout with mobile config panel
 *   - ContentPanel: Text editing and quick actions
 *   - PreviewPanel: Live preview
 *   - MobileConfigPanel: Bottom sheet with full config (90% height)
 *
 * T069-T078: [US5] Mobile-optimized configuration interface
 *
 * Legacy controls removed:
 * - FontSelector, ColorPicker (moved to ConfigPanel)
 * - MediaInput (moved to ConfigPanel as MediaTab)
 * - Inline sliders (moved to TypographyTab/LayoutTab)
 */
export function Editor() {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const { panelState } = useUIStore();
  const { activeTab, setActiveTab } = useConfigStore();
  const t = useTranslations('Config');
  
  // T079: Mobile config panel state
  const [mobileConfigOpen, setMobileConfigOpen] = useState(false);
  
  // T079: Tab config for mobile config panel
  const tabs = getTabConfig(t);

  // T079: Handle tab selection on mobile
  const handleTabSelect = (tabId: TabId) => {
    setActiveTab(tabId);
  };

  return (
    <>
      {/* T030: [US2] Remove AnimatePresence wrapper around ConfigPanel */}
      {/* T031-T032: [US2] Update ContentPanel and PreviewPanel to lg:w-[50%] each */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, y: -50 }}
        transition={prefersReducedMotion ? { duration: 0 } : undefined}
        className="h-screen flex flex-col lg:flex-row overflow-hidden"
      >
        {/* Content Panel - Text editing and quick actions */}
        {/* T031: [US2] lg:w-[50%] for two-column layout - handled in ContentPanel component */}
        <ContentPanel onOpenMobileConfig={() => setMobileConfigOpen(true)} />
        
        {/* Preview Panel - Live preview */}
        {/* T032: [US2] lg:w-[50%] for two-column layout - handled in PreviewPanel component */}
        <PreviewPanel />
        
        {/* T079: Mobile Config Panel - Bottom sheet on mobile only */}
        {isMobile && (
          <MobileConfigPanel
            isOpen={mobileConfigOpen}
            onClose={() => setMobileConfigOpen(false)}
            tabs={tabs}
            activeTab={activeTab}
            onTabSelect={handleTabSelect}
            t={t}
          />
        )}
      </motion.div>

      {/* T033: [US2] Remove conditional rendering - ConfigPanel always renders as Dialog */}
      {/* T022-T033: [US2] ConfigPanel renders as Dialog overlay, not part of flex layout */}
      <ConfigPanel />
    </>
  );
}
