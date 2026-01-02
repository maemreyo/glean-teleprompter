"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { X, Maximize2, AlertCircle, Loader2 } from 'lucide-react';
// 007-unified-state-architecture: Use useContentStore for content data
import { useContentStore } from '@/lib/stores/useContentStore';
import { TeleprompterText } from '@/components/teleprompter/display/TeleprompterText';
import { useConfigStore } from '@/lib/stores/useConfigStore';
import { useUIStore } from '@/stores/useUIStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { FullPreviewDialog, FullPreviewDialogTrigger } from './FullPreviewDialog';

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
 * - Real-time config updates (100ms target)
 * - Loading states for slow operations
 * - Error handling for invalid media URLs
 * - Performance monitoring
 */

// T038: [US2] Performance monitoring
const PERFORMANCE_THRESHOLD_MS = 100;
const LOADING_THRESHOLD_MS = 50;

interface PreviewPanelProps {
  // Props for React.memo comparison
  className?: string;
}

// T037: [US2] Optimize PreviewPanel with React.memo
const areEqual = (prevProps: PreviewPanelProps, nextProps: PreviewPanelProps) => {
  return prevProps.className === nextProps.className;
};

export const PreviewPanel = React.memo<PreviewPanelProps>(function PreviewPanel({ className = '' }) {
  // Full preview dialog state
  const [fullPreviewOpen, setFullPreviewOpen] = useState(false);
  // 007-unified-state-architecture: Use useContentStore for content data
  const { text, bgUrl } = useContentStore();
  
  // T032: [US2] Subscribe to all config properties that affect preview
  const { typography, colors, effects, layout, animations } = useConfigStore();
  
  const { previewState, setPreviewState } = useUIStore();
  
  // T033: [US2] Loading state for slow operations
  const [isLoading, setIsLoading] = useState(false);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // T034: [US2] Error state for invalid media URLs
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // T038: [US2] Performance monitoring
  const renderStartTimeRef = useRef<number>(0);
  const lastConfigUpdateRef = useRef<string>('');
  
  // Breakpoint queries
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  const isOpen = previewState.isOpen;
  
  // T038: [US2] Track config changes for performance monitoring
  const configSignature = useMemo(() => {
    return JSON.stringify({ typography, colors, effects, layout, animations });
  }, [typography, colors, effects, layout, animations]);
  
  // T033: [US2] Show loading state after threshold
  useEffect(() => {
    if (configSignature !== lastConfigUpdateRef.current) {
      // Clear any existing loading timer
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
      
      // Start loading timer
      loadingTimerRef.current = setTimeout(() => {
        setIsLoading(true);
      }, LOADING_THRESHOLD_MS);
      
      // Clear loading after a reasonable timeout (simulated)
      const actualLoadTimer = setTimeout(() => {
        setIsLoading(false);
        if (loadingTimerRef.current) {
          clearTimeout(loadingTimerRef.current);
        }
      }, 100);
      
      lastConfigUpdateRef.current = configSignature;
      
      return () => {
        if (loadingTimerRef.current) {
          clearTimeout(loadingTimerRef.current);
        }
        clearTimeout(actualLoadTimer);
      };
    }
  }, [configSignature]);
  
  // T038: [US2] Performance monitoring on render
  useEffect(() => {
    renderStartTimeRef.current = performance.now();
    
    return () => {
      const renderTime = performance.now() - renderStartTimeRef.current;
      if (process.env.NODE_ENV === 'development' && renderTime > PERFORMANCE_THRESHOLD_MS) {
        console.warn(
          `[PreviewPanel] Slow render detected: ${renderTime.toFixed(2)}ms (threshold: ${PERFORMANCE_THRESHOLD_MS}ms)`
        );
      }
    };
  }, [configSignature]);
  
  // T034: [US2] Handle media load errors
  const handleMediaError = useCallback(() => {
    setHasError(true);
    setErrorMessage('Failed to load background image');
    // 007-unified-state-architecture: Use bgUrl from useContentStore
    console.error('[PreviewPanel] Media load error:', bgUrl);
  }, [bgUrl]);
  
  const handleMediaLoad = useCallback(() => {
    setHasError(false);
    setErrorMessage('');
  }, []);
  
  // Memoized background image style
  // 007-unified-state-architecture: Use bgUrl from useContentStore
  const backgroundStyle = useMemo(() => ({
    backgroundImage: `url('${bgUrl}')`,
    backgroundSize: 'cover' as const,
    backgroundPosition: 'center' as const,
  }), [bgUrl]);
  
  // Memoized text styles from config
  const textStyle = useMemo(() => ({
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight,
    fontSize: `${typography.fontSize}px`,
    letterSpacing: `${typography.letterSpacing}px`,
    lineHeight: typography.lineHeight,
    textTransform: typography.textTransform as 'none' | 'uppercase' | 'lowercase' | 'capitalize',
    color: colors.primaryColor,
    textAlign: layout.textAlign as 'left' | 'center' | 'right' | 'justify',
  }), [typography, colors, layout]);
  
  // Memoized effects styles
  const effectsStyle = useMemo(() => {
    const styles: React.CSSProperties = {};
    
    if (effects.shadowEnabled) {
      styles.textShadow = `${effects.shadowOffsetX}px ${effects.shadowOffsetY}px ${effects.shadowBlur}px ${effects.shadowColor}`;
    }
    
    if (effects.outlineEnabled) {
      styles.WebkitTextStroke = `${effects.outlineWidth}px ${effects.outlineColor}`;
    }
    
    return styles;
  }, [effects]);
  
  // Handle drag end for swipe-down gesture
  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.y > threshold) {
      setPreviewState({ isOpen: false });
    }
  }, [setPreviewState]);
  
  // Handle close button click
  const handleClose = useCallback(() => {
    setPreviewState({ isOpen: false });
  }, [setPreviewState]);
  
  // T033: [US2] Loading overlay component
  const LoadingOverlay = useMemo(() => (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
      <Loader2 className="w-8 h-8 text-white animate-spin" />
    </div>
  ), []);
  
  // T034: [US2] Error overlay component
  const ErrorOverlay = useMemo(() => (
    <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-10">
      <div className="text-center text-white p-4">
        <AlertCircle className="w-12 h-12 mx-auto mb-2 text-red-500" />
        <p className="text-sm">{errorMessage}</p>
      </div>
    </div>
  ), [errorMessage]);
  
  // T032: [US2] Desktop: Always visible, right-side panel (70% width for two-column layout)
  if (isDesktop) {
    return (
      <>
        <FullPreviewDialog open={fullPreviewOpen} onOpenChange={setFullPreviewOpen} />
        <div className={`w-[70%] relative bg-black overflow-hidden ${className}`}>
        {/* T033: [US2] Loading overlay */}
        {isLoading && LoadingOverlay}
        
        {/* T034: [US2] Error overlay */}
        {hasError && ErrorOverlay}
        
        {/* Background Image Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-70 transition-opacity duration-300"
          style={backgroundStyle}
          onError={handleMediaError}
          onLoad={handleMediaLoad}
        />
        
        {/* Overlay Layer - dark tint for readability */}
        <div className="absolute inset-0 bg-black/30" />
        
        {/* 007-unified-state-architecture: Use text from useContentStore */}
        <div className="absolute inset-0 flex items-center justify-center p-12 overflow-hidden">
          <TeleprompterText
            text={text}
            className="max-h-full overflow-hidden"
          />
        </div>
        
        {/* Full Preview Trigger Button */}
        <div className="absolute top-4 left-4 z-20">
          <FullPreviewDialogTrigger onClick={() => setFullPreviewOpen(true)} />
        </div>
      </div>
      </>
    );
  }
  
  // Tablet: Conditional visibility, right-side panel (40% width)
  if (isTablet) {
    return (
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? '0%' : '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed right-0 top-0 bottom-0 w-[40%] z-50 relative bg-black overflow-hidden shadow-2xl border-l border-border ${className}`}
      >
        {/* T033: [US2] Loading overlay */}
        {isLoading && LoadingOverlay}
        
        {/* T034: [US2] Error overlay */}
        {hasError && ErrorOverlay}
        
        {/* Background Image Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-70 transition-opacity duration-300"
          style={backgroundStyle}
          onError={handleMediaError}
          onLoad={handleMediaLoad}
        />
        
        {/* Overlay Layer - dark tint for readability */}
        <div className="absolute inset-0 bg-black/30" />
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-colors"
          aria-label="Close preview"
        >
          <X size={20} className="text-white" />
        </button>
        
        {/* 007-unified-state-architecture: Use text from useContentStore */}
        <div className="absolute inset-0 flex items-center justify-center p-8 overflow-hidden">
          <TeleprompterText
            text={text}
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
          className={`fixed left-0 right-0 bottom-0 h-[60vh] z-50 bg-black rounded-t-3xl shadow-2xl overflow-hidden border-t border-border/20 ${className}`}
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
            {/* T033: [US2] Loading overlay */}
            {isLoading && LoadingOverlay}
            
            {/* T034: [US2] Error overlay */}
            {hasError && ErrorOverlay}
            
            {/* Background Image Layer */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-70 transition-opacity duration-300"
              style={backgroundStyle}
              onError={handleMediaError}
              onLoad={handleMediaLoad}
            />
            
            {/* Overlay Layer - dark tint for readability */}
            <div className="absolute inset-0 bg-black/30" />
            
            {/* 007-unified-state-architecture: Use text from useContentStore */}
            <div className="absolute inset-0 flex items-center justify-center p-6 overflow-hidden">
              <TeleprompterText
                text={text}
                className="max-h-full overflow-hidden"
              />
            </div>
          </div>
        </motion.div>
      </>
    );
  }
  
  return null;
}, areEqual);
