'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { Maximize2, AlertCircle, Loader2 } from 'lucide-react'
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
  const { text, bgUrl } = useContentStore()
  const t = useTranslations('PreviewPanel')

  // T027: Error handling state
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // T028: Loading state
  const [isLoading, setIsLoading] = useState(false)

  // Reset states when bgUrl changes
  useEffect(() => {
    setHasError(false)
    setErrorMessage('')
    setIsLoading(true)
  }, [bgUrl])

  // T029: Handle media load errors
  const handleMediaError = useCallback(() => {
    setHasError(true)
    setErrorMessage(t('failedToLoadBg'))
    setIsLoading(false)
    console.error('[FullPreviewDialog] Media load error:', bgUrl)
  }, [bgUrl, t])

  // T030: Handle successful media load
  const handleMediaLoad = useCallback(() => {
    setHasError(false)
    setErrorMessage('')
    setIsLoading(false)
  }, [])

  // Memoized background image style (matches PreviewPanel.tsx)
  const backgroundStyle = useMemo(() => ({
    backgroundImage: `url('${bgUrl}')`,
    backgroundSize: 'cover' as const,
    backgroundPosition: 'center' as const,
  }), [bgUrl])

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
        {/* T033: Loading indicator */}
        {isLoading && (
          <div data-testid="loading-indicator" className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
            <div className="text-center text-white">
              <Loader2 data-testid="loading-spinner" className="w-8 h-8 mx-auto mb-2 animate-spin" />
              <p data-testid="loading-message" className="text-sm">{t('loadingBg')}</p>
            </div>
          </div>
        )}

        {/* T032: Error indicator */}
        {hasError && (
          <div data-testid="error-indicator" className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-10">
            <div className="text-center text-white p-4">
              <AlertCircle data-testid="error-icon" className="w-12 h-12 mx-auto mb-2 text-red-500" />
              <p data-testid="error-message" className="text-sm">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* T031: Background Image Layer with error and load handlers */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70 transition-opacity duration-300"
          style={backgroundStyle}
          onError={handleMediaError}
          onLoad={handleMediaLoad}
        />

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
