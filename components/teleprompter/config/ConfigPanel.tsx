'use client'

import { useEffect } from 'react'
import { X, Undo, Redo } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConfigStore } from '@/lib/stores/useConfigStore'
import { ConfigTabs } from './ConfigTabs'
import { Button } from '@/components/ui/button'

export function ConfigPanel() {
  const { isPanelOpen, togglePanel, canUndo, canRedo, undo, redo } = useConfigStore()

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
      // Escape to close panel
      if (e.key === 'Escape' && isPanelOpen) {
        e.preventDefault()
        togglePanel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canUndo, canRedo, undo, redo, isPanelOpen, togglePanel])
  
  return (
    <>
      {/* Backdrop */}
      {isPanelOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 transition-opacity"
          onClick={togglePanel}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar Panel */}
      <aside
        className={cn(
          'fixed right-0 top-0 h-full w-full sm:w-96 bg-background shadow-xl z-50',
          'transition-transform duration-300 ease-in-out',
          'flex flex-col',
          isPanelOpen ? 'translate-x-0' : 'translate-x-full'
        )}
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
            <button
              onClick={togglePanel}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="Close panel"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex-1 overflow-hidden">
          <ConfigTabs />
        </div>
      </aside>
    </>
  )
}
