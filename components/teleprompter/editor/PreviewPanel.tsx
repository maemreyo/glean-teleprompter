"use client";

import React from 'react';
import { motion, PanInfo } from 'framer-motion';
import { X, Maximize2 } from 'lucide-react';
import { useTeleprompterStore } from '@/stores/useTeleprompterStore';
import { TeleprompterText } from '@/components/teleprompter/display/TeleprompterText';
import { useConfigStore } from '@/lib/stores/useConfigStore';
import { useUIStore } from '@/stores/useUIStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';

/**
 * PreviewPanel - The live preview section of the Editor
 * 
 * Displays:
 * - Desktop: Right-side panel (35% width) for >= 1024px
 * - Tablet: Right-side panel (40% width) for 768px - 1024px
 * - Mobile: Bottom sheet (60% height) for < 768px with swipe gestures
 * 
 * Features:
 * - Background image layer
 * - Dark overlay for readability
 * - TeleprompterText styled by useConfigStore
 * - Swipe-down gesture to close on mobile
 * - Toggle button for mobile/tablet
 */
export const PreviewPanel = React.memo(function PreviewPanel() {
  const store = useTeleprompterStore();
  const { typography, colors, effects, layout, animations } = useConfigStore();
  const { previewState, setPreviewState } = useUIStore();
  
  // Breakpoint queries
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  const isOpen = previewState.isOpen;
  
  // Handle drag end for swipe-down gesture
  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.y > threshold) {
      // Swipe down detected - close preview
      setPreviewState({ isOpen: false });
    }
  };
  
  // Handle close button click
  const handleClose = () => {
    setPreviewState({ isOpen: false });
  };
  
  // Desktop: Always visible, right-side panel (35% width)
  if (isDesktop) {
    return (
      <div className="w-[35%] relative bg-black overflow-hidden">
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
  
  // Tablet: Conditional visibility, right-side panel (40% width)
  if (isTablet) {
    return (
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? '0%' : '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 bottom-0 w-[40%] z-50 relative bg-black overflow-hidden shadow-2xl border-l border-border"
      >
        {/* Background Image Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-70 transition-opacity duration-300"
          style={{ backgroundImage: `url('${store.bgUrl}')` }}
        />
        
        {/* Overlay Layer - dark tint for readability */}
        <div className="absolute inset-0 bg-black/30" />
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-colors"
          aria-label="Close preview"
        >
          <X size={20} className="text-white" />
        </button>
        
        {/* Teleprompter Text */}
        <div className="absolute inset-0 flex items-center justify-center p-8 overflow-hidden">
          <TeleprompterText
            text={store.text}
            className="max-h-full overflow-hidden"
          />
        </div>
      </motion.div>
    );
  }
  
  // Mobile: Bottom sheet (60% height) with swipe gesture
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={handleClose}
          />
        )}
        
        {/* Bottom Sheet */}
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 300 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          initial={{ y: "100%" }}
          animate={{ y: isOpen ? "0%" : "100%" }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed left-0 right-0 bottom-0 h-[60vh] z-50 bg-black rounded-t-3xl shadow-2xl overflow-hidden border-t border-border/20"
          whileDrag={{ scale: 0.98 }}
        >
          {/* Drag Handle Indicator */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-white/20 rounded-full" />
          </div>
          
          {/* Header with Close Button */}
          <div className="flex justify-between items-center px-4 py-2 border-b border-white/10">
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Maximize2 size={16} />
              <span className="font-medium">Preview</span>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close preview"
            >
              <X size={18} className="text-white/80" />
            </button>
          </div>
          
          {/* Preview Content */}
          <div className="relative h-[calc(100%-60px)] overflow-hidden">
            {/* Background Image Layer */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-70 transition-opacity duration-300"
              style={{ backgroundImage: `url('${store.bgUrl}')` }}
            />
            
            {/* Overlay Layer - dark tint for readability */}
            <div className="absolute inset-0 bg-black/30" />
            
            {/* Teleprompter Text */}
            <div className="absolute inset-0 flex items-center justify-center p-6 overflow-hidden">
              <TeleprompterText
                text={store.text}
                className="max-h-full overflow-hidden"
              />
            </div>
          </div>
        </motion.div>
      </>
    );
  }
  
  return null;
});
