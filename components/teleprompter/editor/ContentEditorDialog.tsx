'use client'

import { useEffect, useRef, useCallback } from 'react'
import { Expand } from 'lucide-react'
import { useContentStore } from '@/lib/stores/useContentStore'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'

interface ContentEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * ContentEditorDialog - Full viewport content editor dialog
 *
 * Renders the textarea at full viewport size in a modal dialog.
 * Provides an immersive editing experience.
 *
 * Features:
 * - Full viewport size textarea for editing
 * - Keyboard shortcut: Ctrl/Cmd + E to toggle (optional)
 * - Close on Escape key
 * - Close on backdrop click
 * - Auto-scroll to bottom on Enter key
 * - All textarea functionality available
 */
export function ContentEditorDialog({ open, onOpenChange }: ContentEditorDialogProps) {
  const t = useTranslations('Editor')
  const { text, setText } = useContentStore()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when Enter is pressed
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && textareaRef.current) {
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.scrollTop = textareaRef.current.scrollHeight
        }
      }, 10)
    }
  }, [])

  // Focus textarea when dialog opens
  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [open])

  // Optional keyboard shortcut: Ctrl/Cmd + E to toggle dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen h-screen max-w-screen max-h-screen p-0 gap-0 border-0 rounded-none bg-card">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">{t('contentLabel')}</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="Close content editor"
          >
            ✕
          </button>
        </div>

        {/* Full viewport textarea */}
        <div className="flex-1 p-6">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-full min-h-[calc(100vh-120px)] bg-secondary rounded-lg p-4 text-sm focus:ring-1 focus:ring-primary outline-none resize-none border border-border placeholder-muted-foreground custom-scrollbar"
            placeholder={t('contentPlaceholder')}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * ContentEditorDialogTrigger - Button to trigger the content editor dialog
 *
 * Can be used in the ContentPanel to open the full-size content editor dialog.
 */
export function ContentEditorDialogTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-xs font-medium transition-all duration-200 text-muted-foreground hover:text-foreground flex items-center gap-1.5"
      aria-label="Open content editor (Ctrl+E)"
      title="Open content editor (Ctrl+E)"
    >
      <Expand size={12} />
      <span>View Detail</span>
    </button>
  )
}
