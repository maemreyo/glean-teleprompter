'use client'

import { useEffect, useMemo, useState } from 'react'
import { RotateCcw, RotateCw, Trash2, X } from 'lucide-react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { useConfigStore } from '@/lib/stores/useConfigStore'
import { useUIStore } from '@/stores/useUIStore'
import { ConfigTabs } from './ConfigTabs'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/**
 * ConfigPanel - Floating configuration panel overlay (US2)
 *
 * T022-T033: [US2] Converted to Radix UI Dialog overlay
 * T058-T063: [US4] Enhanced with undo/redo functionality, visual indicator, and clear history dialog
 *
 * Redesigned as a floating overlay that:
 * - Doesn't cause layout shift (fixed positioning)
 * - Has backdrop with blur effect
 * - Can be dismissed via Escape, click outside, or close button
 * - Only visible on desktop (1024px+)
 */
export function ConfigPanel() {
  // T058, T063: Use new history methods from store
  const { canUndoHistory, canRedoHistory, performUndo, performRedo, clearHistory, historyStack, currentHistoryIndex } = useConfigStore()
  const { panelState, setPanelVisible } = useUIStore()
  
  // T060: State for clear history dialog
  const [showClearHistoryDialog, setShowClearHistoryDialog] = useState(false)
  
  // T027: Respect prefers-reduced-motion
  const prefersReducedMotion = useReducedMotion()
  
  // T058: Keyboard shortcuts for undo/redo (Ctrl/Cmd + Z, Ctrl/Cmd + Shift + Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (canUndoHistory()) performUndo()
      }
      // Ctrl+Shift+Z or Cmd+Shift+Z for redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        if (canRedoHistory()) performRedo()
      }
      // Ctrl+Y or Cmd+Y for redo (alternative)
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault()
        if (canRedoHistory()) performRedo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canUndoHistory, canRedoHistory, performUndo, performRedo])
  
  // T060: Handle clear history confirmation
  const handleClearHistory = () => {
    clearHistory()
    setShowClearHistoryDialog(false)
  }
  
  // T059: Calculate history position indicator
  const historyInfo = useMemo(() => {
    const current = currentHistoryIndex + 1
    const total = historyStack.past.length + historyStack.future.length
    return { current, total }
  }, [historyStack, currentHistoryIndex])
  
  // T059, T063: Undo/Redo button disabled states
  const canUndo = canUndoHistory()
  const canRedo = canRedoHistory()
  
  // T028: Fade + scale animation variants (300ms duration)
  const contentVariants: Variants = useMemo(() => {
    if (prefersReducedMotion) {
      return {
        visible: { opacity: 1, scale: 1 },
        hidden: { opacity: 0, scale: 1 },
      }
    }
    return {
      visible: {
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1] as const,
        }
      },
      hidden: {
        opacity: 0,
        scale: 0.95,
        transition: {
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1] as const,
        }
      },
    }
  }, [prefersReducedMotion])
  
  // T022-T033: [US2] Render inline when isOverlay is false, otherwise as Dialog overlay
  if (!panelState.isOverlay) {
    // Inline mode - render ConfigPanel directly without Dialog wrapper
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              Configuration
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Undo button */}
            <Button
              size="sm"
              variant="outline"
              onClick={performUndo}
              disabled={!canUndo}
              className="h-8 w-8 p-0"
              aria-label="Undo last change"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            {/* Redo button */}
            <Button
              size="sm"
              variant="outline"
              onClick={performRedo}
              disabled={!canRedo}
              className="h-8 w-8 p-0"
              aria-label="Redo last change"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* History indicator bar */}
        {(historyInfo.total > 0) && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
            <span className="text-xs text-muted-foreground">
              {historyInfo.current}/{historyInfo.total} changes
            </span>
            {/* Clear history button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowClearHistoryDialog(true)}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              aria-label="Clear history"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </Button>
          </div>
        )}
        
        {/* Tabs */}
        <div className="flex-1 overflow-hidden">
          <ConfigTabs />
        </div>
      </div>
    )
  }
  
  // Overlay mode - render as Dialog
  return (
    <>
      {/* T022-T033: [US2] Radix UI Dialog overlay implementation */}
      <Dialog
        open={panelState.visible}
        onOpenChange={(open) => setPanelVisible(open, false)}
      >
        {/* T025: Fixed positioning with centered layout */}
        {/* T026: Panel width constraints: w-[400px] max-w-[90vw] h-[80vh] */}
        {/* T029: Close button - hide built-in to use custom one in header */}
        <DialogContent
          className="w-[400px] max-w-[90vw] h-[80vh] max-h-[80vh] flex flex-col p-0 gap-0"
          aria-label="Configuration panel"
          aria-describedby="config-panel-description"
          showCloseButton={false}
        >
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={contentVariants}
            className="flex flex-col h-full"
          >
            {/* T029: Close button (X) to panel header */}
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">
                  Configuration
                </h2>
                <span id="config-panel-description" className="sr-only">
                  Configure teleprompter settings including typography, colors, effects, layout, and animations
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* T063: Undo button - disabled when at beginning of history */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={performUndo}
                  disabled={!canUndo}
                  className="h-8 w-8 p-0"
                  aria-label="Undo last change"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                {/* T063: Redo button - disabled when at end of history */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={performRedo}
                  disabled={!canRedo}
                  className="h-8 w-8 p-0"
                  aria-label="Redo last change"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
                {/* T037: Close button with aria-label */}
                <DialogClose asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    aria-label="Close configuration panel"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </DialogClose>
              </div>
            </div>
            
            {/* T059: History indicator bar */}
            {(historyInfo.total > 0) && (
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
                <span className="text-xs text-muted-foreground">
                  {historyInfo.current}/{historyInfo.total} changes
                </span>
                {/* T060: Clear history button */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowClearHistoryDialog(true)}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  aria-label="Clear history"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              </div>
            )}
            
            {/* Tabs */}
            <div className="flex-1 overflow-hidden">
              <ConfigTabs />
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* T060: Clear History Confirmation Dialog */}
      <Dialog open={showClearHistoryDialog} onOpenChange={setShowClearHistoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear History</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear all undo/redo history? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowClearHistoryDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearHistory}
            >
              Clear History
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
