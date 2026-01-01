'use client'

import { useEffect, useMemo } from 'react'
import { Undo, Redo } from 'lucide-react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { useConfigStore } from '@/lib/stores/useConfigStore'
import { useUIStore } from '@/stores/useUIStore'
import { ConfigTabs } from './ConfigTabs'
import { Button } from '@/components/ui/button'

/**
 * ConfigPanel - Always-visible configuration panel
 * 
 * Redesigned from overlay to inline panel that's always visible on desktop.
 * Contains all styling controls organized into tabs.
 */
export function ConfigPanel() {
  const { canUndo, canRedo, undo, redo } = useConfigStore()
  const { panelState } = useUIStore()
  
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

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (canUndo()) undo()
      }
      // Ctrl+Shift+Z or Cmd+Shift+Z for redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        if (canRedo()) redo()
      }
      // Ctrl+Y or Cmd+Y for redo (alternative)
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault()
        if (canRedo()) redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canUndo, canRedo, undo, redo])
  
  // T020: Apply motion wrapper with slide animation
  return (
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
          <Button
            size="sm"
            variant="outline"
            onClick={undo}
            disabled={!canUndo()}
            className="h-8 w-8 p-0"
            aria-label="Undo"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={redo}
            disabled={!canRedo()}
            className="h-8 w-8 p-0"
            aria-label="Redo"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        <ConfigTabs />
      </div>
    </motion.div>
  )
}
