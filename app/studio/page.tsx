"use client";

import React, { useEffect, useRef, Suspense, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTeleprompterStore } from '@/stores/useTeleprompterStore';
import { useDemoStore } from '@/stores/useDemoStore';
import { useConfigStore } from '@/lib/stores/useConfigStore';
import { useUIStore } from '@/stores/useUIStore';
import { Editor } from '@/components/teleprompter/Editor';
import { Runner } from '@/components/teleprompter/Runner';
import { AppProvider } from '@/components/AppProvider';
import { Toaster, toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { getTemplateById } from '@/lib/templates/templateConfig';
import { loadScriptAction } from '@/actions/scripts';
import { StudioLoadingScreen } from '@/components/teleprompter/editor/StudioLoadingScreen';
import { Button } from '@/components/ui/button';
import { ErrorDialog } from '@/components/teleprompter/ErrorDialog';
import { getErrorContext } from '@/lib/utils/errorMessages';

type FontStyle = 'Classic' | 'Modern' | 'Typewriter' | 'Novel' | 'Neon';
type TextAlign = 'left' | 'center';

type LoadingState = {
  isLoading: boolean;
  progress: number;
  message: string;
  error: string | null;
  loadType: 'script' | 'template' | null;
};

/**
 * Studio page - Main teleprompter editor
 * Moved from root to /studio route
 * Supports loading from:
 * - ?script={id} - Load saved script from database
 * - ?template={id} - Load pre-configured template
 */
function StudioLogic() {
  const searchParams = useSearchParams();
  const store = useTeleprompterStore();
  const { setDemoMode } = useDemoStore();
  const { errorContext, setErrorContext } = useUIStore();
  
  // Track if we've already initialized to prevent infinite loops
  const initializedRef = useRef(false);
  
  // Track if we've already loaded the local draft to prevent infinite loops from auto-save
  const localDraftLoadedRef = useRef(false);
  
  // Loading state for progress bar and error handling
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    message: '',
    error: null,
    loadType: null
  });
  
  // Refs for retry functionality
  const scriptIdRef = useRef<string | null>(null);
  const templateIdRef = useRef<string | null>(null);
  
  // Ref to track the original error for logging
  const originalErrorRef = useRef<Error | unknown>(null);
  
  // Ref to track if loading is in progress (to avoid circular dependency)
  const isLoadingRef = useRef(false);

  useEffect(() => {
    // Only run initialization once on mount
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Ensure demo mode is off (only once)
    setDemoMode(false);
  }, [setDemoMode]);

  // Function to load template with progress tracking
  const loadTemplate = useCallback(async (templateId: string) => {
    setLoadingState({
      isLoading: true,
      progress: 0,
      message: 'Loading template...',
      error: null,
      loadType: 'template'
    });
    templateIdRef.current = templateId;
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setLoadingState(prev => {
        if (prev.progress < 70) {
          return { ...prev, progress: prev.progress + 10 };
        }
        return prev;
      });
    }, 100);
    
    try {
      const template = getTemplateById(templateId);
      if (template) {
        setLoadingState(prev => ({ ...prev, progress: 90 }));
        
        store.setAll({
          text: template.content,
          font: template.settings.font as FontStyle,
          colorIndex: template.settings.colorIndex || 0,
          speed: template.settings.speed || 2,
          fontSize: template.settings.fontSize || 48,
          align: template.settings.align || 'center' as TextAlign,
          lineHeight: template.settings.lineHeight || 1.5,
          margin: template.settings.margin || 0,
          overlayOpacity: template.settings.overlayOpacity || 0.5,
          mode: 'setup',
          isReadOnly: false
        });
        
        clearInterval(progressInterval);
        setLoadingState({
          isLoading: false,
          progress: 100,
          message: '',
          error: null,
          loadType: null
        });
        
        // Success animation with toast
        toast.success(
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2"
          >
            <span className="text-lg">✓</span>
            <span>Template loaded!</span>
          </motion.div>,
          { duration: 3000 }
        );
      } else {
        clearInterval(progressInterval);
        setLoadingState({
          isLoading: false,
          progress: 0,
          message: '',
          error: `Template "${templateId}" not found`,
          loadType: null
        });
        toast.error(`Template "${templateId}" not found`);
      }
    } catch (error) {
      clearInterval(progressInterval);
      setLoadingState({
        isLoading: false,
        progress: 0,
        message: '',
        error: error instanceof Error ? error.message : 'Failed to load template',
        loadType: null
      });
      toast.error('Failed to load template');
    }
  }, [store]);
  
  // Function to load script with progress tracking
  const loadScript = useCallback(async (scriptId: string) => {
    // Prevent concurrent loading
    if (isLoadingRef.current) {
      console.log('[Studio] Script loading already in progress, skipping');
      return;
    }
    
    console.log('[Studio] Loading script:', scriptId);
    isLoadingRef.current = true;
    
    setLoadingState({
      isLoading: true,
      progress: 0,
      message: 'Loading script...',
      error: null,
      loadType: 'script'
    });
    scriptIdRef.current = scriptId;
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setLoadingState(prev => {
        if (prev.progress < 60) {
          return { ...prev, progress: prev.progress + 15 };
        }
        return prev;
      });
    }, 150);
    
    // Timeout for 3 seconds
    const timeoutId = setTimeout(() => {
      if (isLoadingRef.current) {
        clearInterval(progressInterval);
        isLoadingRef.current = false;
        setLoadingState({
          isLoading: false,
          progress: 0,
          message: '',
          error: 'Loading timeout - please retry',
          loadType: null
        });
        toast.error('Loading script timed out');
      }
    }, 3000);
    
    try {
      const result = await loadScriptAction(scriptId);
      clearTimeout(timeoutId);
      
      if (result.error) {
        clearInterval(progressInterval);
        isLoadingRef.current = false;
        
        // Get contextual error information
        const errorContext = getErrorContext(result.error);
        originalErrorRef.current = result.error;
        
        // Log structured error to console
        console.error('[Studio] Script loading error:', {
          scriptId,
          timestamp: new Date(errorContext.timestamp).toISOString(),
          errorType: errorContext.type,
          message: errorContext.message,
          details: errorContext.details,
          originalError: result.error,
          stack: result.error && (result.error as any) instanceof Error && typeof (result.error as any).stack === 'string' ? (result.error as any).stack : undefined,
        });
        
        // Set error context in UI store for ErrorDialog
        setErrorContext(errorContext);
        
        setLoadingState({
          isLoading: false,
          progress: 0,
          message: '',
          error: errorContext.message,
          loadType: null
        });
        
        // Show toast with contextual message
        toast.error(errorContext.message, {
          description: errorContext.details,
        });
        return;
      }
      
      if (result.success && result.script) {
        setLoadingState(prev => ({ ...prev, progress: 85 }));
        const script = result.script;
        console.log('[Studio] Script loaded:', script);
        
        // Set basic teleprompter data
        store.setText(script.content || '');
        store.setBgUrl(script.bg_url || '');
        store.setMusicUrl(script.music_url || '');
        
        // Load config if present
        if (script.config) {
          console.log('[Studio] Loading config from script:', script.config);
          useConfigStore.getState().setAll(script.config);
        } else {
          // Fall back to legacy settings
          if (script.settings) {
            console.log('[Studio] Loading legacy settings:', script.settings);
            store.setAll({
              font: script.settings.font || 'Classic',
              colorIndex: script.settings.colorIndex || 0,
              speed: script.settings.speed || 2,
              fontSize: script.settings.fontSize || 48,
              align: script.settings.align || 'center',
              lineHeight: script.settings.lineHeight || 1.5,
              margin: script.settings.margin || 0,
              overlayOpacity: script.settings.overlayOpacity || 0.5,
            });
          }
        }
        
        clearInterval(progressInterval);
        isLoadingRef.current = false;
        
        setLoadingState({
          isLoading: false,
          progress: 100,
          message: '',
          error: null,
          loadType: null
        });
        
        // Success toast for script
        toast.success(
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2"
          >
            <span className="text-lg">✓</span>
            <span>Script loaded!</span>
          </motion.div>,
          { duration: 3000 }
        );
      }
    } catch (err) {
      clearTimeout(timeoutId);
      clearInterval(progressInterval);
      isLoadingRef.current = false;
      
      // Get contextual error information
      const errorContext = getErrorContext(err);
      originalErrorRef.current = err;
      
      // Log structured error to console
      console.error('[Studio] Unexpected script loading error:', {
        scriptId,
        timestamp: new Date(errorContext.timestamp).toISOString(),
        errorType: errorContext.type,
        message: errorContext.message,
        details: errorContext.details,
        originalError: err,
        stack: err && (err as any) instanceof Error && typeof (err as any).stack === 'string' ? (err as any).stack : undefined,
      });
      
      // Set error context in UI store for ErrorDialog
      setErrorContext(errorContext);
      
      setLoadingState({
        isLoading: false,
        progress: 0,
        message: '',
        error: errorContext.message,
        loadType: null
      });
      
      // Show toast with contextual message
      toast.error(errorContext.message, {
        description: errorContext.details,
      });
    }
  }, [store, setErrorContext]);
  
  // Retry function for error recovery
  const handleRetry = useCallback(() => {
    if (scriptIdRef.current) {
      loadScript(scriptIdRef.current);
    } else if (templateIdRef.current) {
      loadTemplate(templateIdRef.current);
    }
  }, [loadScript, loadTemplate]);
  
  useEffect(() => {
    // Skip if not initialized yet
    if (!initializedRef.current) return;

    // Check for template parameter first
    const templateId = searchParams.get('template');
    if (templateId) {
      loadTemplate(templateId);
      return;
    }

    // Check for script parameter (for loading saved scripts)
    const scriptId = searchParams.get('script');
    if (scriptId) {
      loadScript(scriptId);
      return;
    }

    // Otherwise start fresh or load from localStorage
    // Only load local draft once to prevent infinite loop from auto-save triggering re-renders
    if (!localDraftLoadedRef.current) {
      localDraftLoadedRef.current = true;
      const localDraft = localStorage.getItem('teleprompter_draft');
      if (localDraft) {
        try {
          const parsed = JSON.parse(localDraft);
          store.setAll({
            ...parsed,
            mode: 'setup'
          });
        } catch (e) {
          console.error('Error loading local draft', e);
        }
      }
    }
    // Only depend on searchParams and callback functions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, loadTemplate, loadScript]);

  // Auto-save to localStorage
  // Use refs to track previous values and only recreate interval when mode/readonly change
  const prevModeRef = useRef(store.mode);
  const prevIsReadOnlyRef = useRef(store.isReadOnly);
  
  useEffect(() => {
    // Only recreate interval if mode or isReadOnly actually changed
    const modeChanged = prevModeRef.current !== store.mode;
    const readonlyChanged = prevIsReadOnlyRef.current !== store.isReadOnly;
    
    if (modeChanged) prevModeRef.current = store.mode;
    if (readonlyChanged) prevIsReadOnlyRef.current = store.isReadOnly;
    
    if (!modeChanged && !readonlyChanged) return;
    
    const interval = setInterval(() => {
      const currentState = useTeleprompterStore.getState();
      if (currentState.mode === 'setup' && !currentState.isReadOnly) {
        localStorage.setItem('teleprompter_draft', JSON.stringify({
          text: currentState.text,
          bgUrl: currentState.bgUrl,
          musicUrl: currentState.musicUrl,
          font: currentState.font,
          colorIndex: currentState.colorIndex,
          speed: currentState.speed,
          fontSize: currentState.fontSize,
          align: currentState.align,
          lineHeight: currentState.lineHeight,
          margin: currentState.margin,
          overlayOpacity: currentState.overlayOpacity
        }));
      }
    }, 5000); // Save every 5 seconds

    return () => clearInterval(interval);
  }, [store.mode, store.isReadOnly]);

  return (
    <>
      {/* Progress Bar */}
      <AnimatePresence mode="wait">
        {loadingState.isLoading && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-lg"
          >
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{loadingState.message}</span>
                <span className="text-sm text-muted-foreground">{loadingState.progress}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${loadingState.progress}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Error Banner with Retry */}
      <AnimatePresence mode="wait">
        {loadingState.error && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-50 bg-destructive/10 border-b border-destructive/50 backdrop-blur-sm"
          >
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-destructive">⚠</span>
                <span className="text-sm font-medium text-destructive">{loadingState.error}</span>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleRetry}
                className="gap-1"
              >
                <span>Retry</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Error Dialog for contextual error messages */}
      <ErrorDialog
        errorContext={errorContext}
        onRetry={handleRetry}
        scriptId={scriptIdRef.current || undefined}
      />
      
      <AnimatePresence mode="wait">
        {store.mode === 'setup' ? <Editor key="editor" /> : <Runner key="runner" />}
      </AnimatePresence>
    </>
  );
}

export default function StudioPage() {
  return (
    <AppProvider>
      <Toaster position="top-center" richColors />
      <Suspense fallback={<StudioLoadingScreen />}>
        <StudioLogic />
      </Suspense>
    </AppProvider>
  );
}
