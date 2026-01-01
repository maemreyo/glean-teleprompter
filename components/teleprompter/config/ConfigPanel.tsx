'use client'

import { useEffect, useMemo, useState } from 'react'
import { RotateCcw, RotateCw, Trash2 } from 'lucide-react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { useConfigStore } from '@/lib/stores/useConfigStore'
import { useUIStore } from '@/stores/useUIStore'
import { ConfigTabs } from './ConfigTabs'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/**
 * ConfigPanel - Always-visible configuration panel
 * 
 * T058-T063: [US4] Enhanced with undo/redo functionality, visual indicator, and clear history dialog
 * 
 * Redesigned from overlay to inline panel that's always visible on desktop.
 * Contains all styling controls organized into tabs.
 */
export function ConfigPanel() {
  // T058, T063: Use new history methods from store
  const { canUndoHistory, canRedoHistory, performUndo, performRedo, clearHistory, historyStack, currentHistoryIndex } = useConfigStore()
  const { panelState } = useUIStore()
  
  // T060: State for clear history dialog
  const [showClearHistoryDialog, setShowClearHistoryDialog] = useState(false)
  
  // T027: Respect prefers-reduced-motion
  const prefersReducedMotion = useReducedMotion()
  
  // T020: Animation variants for slide-in/slide-out
  const panelVariants: Variants = useMemo(() => {
    if (prefersReducedMotion) {
      return {
        visible: { opacity: 1, x: 0 },
        hidden: { opacity: 0, x: 0 },
      }
    }
    return {
      visible: {
        opacity: 1,
        x: 0,
        transition: {
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1] as const,
        }
      },
      hidden: {
        opacity: 0,
        x: '100%',
        transition: {
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1] as const,
        }
      },
    }
  }, [prefersReducedMotion])

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
  
  // T020: Apply motion wrapper with slide animation
  return (
    <>
      <motion.div
        className="w-full lg:w-[35%] bg-card border-r border-border flex flex-col h-full"
        initial="visible"
        animate={panelState.visible ? "visible" : "hidden"}
        variants={panelVariants}
        // T027: Disable layout shift when reduced motion is preferred
        style={{
          display: panelState.visible || !prefersReducedMotion ? 'flex' : 'none',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Configuration
          </h2>
          <div className="flex items-center gap-2">
            {/* T063: Undo button - disabled when at beginning of history */}
            <Button
              size="sm"
              variant="outline"
              onClick={performUndo}
              disabled={!canUndo}
              className="h-8 w-8 p-0"
              aria-label="Undo"
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
              aria-label="Redo"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
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
