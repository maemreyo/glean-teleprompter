'use client'

import { useEffect } from 'react'
import { Maximize2 } from 'lucide-react'
import { useContentStore } from '@/lib/stores/useContentStore'
import { TeleprompterText } from '@/components/teleprompter/display/TeleprompterText'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'

interface FullPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * FullPreviewDialog - Full viewport preview dialog
 * 
 * Renders the TeleprompterText component at full viewport size in a modal dialog.
 * Provides an immersive preview experience replacing the removed scale feature.
 * 
 * Features:
 * - Full viewport size preview
 * - Keyboard shortcut: Ctrl/Cmd + \ to toggle
 * - Close on Escape key
 * - Close on backdrop click
 */
export function FullPreviewDialog({ open, onOpenChange }: FullPreviewDialogProps) {
  const { text } = useContentStore()

  // Keyboard shortcut: Ctrl/Cmd + \ to toggle dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen h-screen max-w-screen max-h-screen p-0 gap-0 border-0 rounded-none bg-black">
        {/* Background Image Layer */}
        <div className="absolute inset-0 bg-cover bg-center opacity-70 transition-opacity duration-300" />
        
        {/* Overlay Layer - dark tint for readability */}
        <div className="absolute inset-0 bg-black/30" />
        
        {/* Teleprompter Text - Full viewport */}
        <div className="absolute inset-0 flex items-center justify-center p-12 overflow-hidden">
          <TeleprompterText
            text={text}
            className="max-h-full overflow-hidden"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * FullPreviewDialogTrigger - Button to trigger the full preview dialog
 * 
 * Can be used in the PreviewPanel to open the full-size preview dialog.
 */
export function FullPreviewDialogTrigger({ onClick }: { onClick: () => void }) {
  const t = useTranslations('FullPreviewDialog')
  return (
    <button
      onClick={onClick}
      className="p-2 bg-black/50 hover:bg-black/70 rounded-lg backdrop-blur-sm transition-all duration-200 text-white hover:text-white/80 flex items-center gap-2 text-sm font-medium"
      aria-label={t('openFullPreview')}
      title={t('openFullPreview')}
    >
      <Maximize2 size={16} />
      <span>{t('title')}</span>
    </button>
  )
}
