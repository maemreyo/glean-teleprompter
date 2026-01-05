'use client'

/**
 * QuickSettingsPanel Component - Z-Index Usage
 *
 * This component uses centralized z-index constants from @/lib/constants/z-index
 *
 * Z-INDEX LAYER: Z_INDEX_QUICK_SETTINGS (200)
 * - Must be higher than controls (100-110) to avoid overlap conflict
 * - Overrides Radix UI Dialog default z-50 to fix critical conflict
 *
 * T025-T031 [US2] QuickSettingsPanel Component
 *
 * A collapsible floating panel for quick adjustments in Runner mode.
 * Uses Radix UI Dialog for accessibility and keyboard navigation.
 *
 * Features:
 * - Scroll speed control (T026)
 * - Font size control (T027)
 * - Text alignment control (T028)
 * - Background URL input (T029)
 * - Error handling with toast notifications (T030)
 * - Visual indication for modified settings (T031)
 * @module components/teleprompter/runner/QuickSettingsPanel
 */

import React, { useState, useCallback } from 'react'
import { Settings, X, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { useConfigStore } from '@/lib/stores/useConfigStore'
import { useContentStore } from '@/lib/stores/useContentStore'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
// 012-z-index-refactor: Import centralized z-index constants
import { ZIndex } from '@/lib/constants/z-index'

// Default values from stores for comparison
const DEFAULT_SCROLL_SPEED = 50
const DEFAULT_FONT_SIZE = 48
const DEFAULT_TEXT_ALIGN = 'center'
const DEFAULT_BG_URL = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop'

interface QuickSettingsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * QuickSettingsPanel - Floating settings panel for Runner mode
 */
export function QuickSettingsPanel({ open, onOpenChange }: QuickSettingsPanelProps) {
  const t = useTranslations('QuickSettings')
  // Get state from stores
  const { animations, typography, layout, setAnimations, setTypography, setLayout, setAnimationsDebounced } = useConfigStore()
  const { bgUrl, setBgUrl } = useContentStore()

  // Track modified settings for visual indication (T031)
  const [hasModifications, setHasModifications] = useState(false)

  // Update modification state when any value differs from defaults
  React.useEffect(() => {
    const modified = 
      animations.autoScrollSpeed !== DEFAULT_SCROLL_SPEED ||
      typography.fontSize !== DEFAULT_FONT_SIZE ||
      layout.textAlign !== DEFAULT_TEXT_ALIGN ||
      bgUrl !== DEFAULT_BG_URL
    setHasModifications(modified)
  }, [animations.autoScrollSpeed, typography.fontSize, layout.textAlign, bgUrl])

  // T026: Scroll speed control
  // 010-runner-settings: Use debounced version for rapid slider changes (100ms)
  const handleScrollSpeedChange = useCallback((value: number) => {
    try {
      // Use debounced version to avoid excessive re-renders during rapid slider movement
      setAnimationsDebounced({ autoScrollSpeed: value })
    } catch (error) {
      // T030: Error handling with toast notifications
      // T047 [Phase 6]: Ensure 5-second visibility requirement
      toast.error(t('errors.scrollSpeedFailed'), {
        description: error instanceof Error ? error.message : t('errors.unknownError'),
        duration: 5000,
      })
    }
  }, [setAnimationsDebounced, t])

  // T027: Font size control
  const handleFontSizeChange = useCallback((value: number) => {
    try {
      setTypography({ fontSize: value })
    } catch (error) {
      toast.error(t('errors.fontSizeFailed'), {
        description: error instanceof Error ? error.message : t('errors.unknownError'),
        duration: 5000,
      })
    }
  }, [setTypography, t])

  // T028: Text alignment control
  const handleTextAlignChange = useCallback((align: 'left' | 'center' | 'right') => {
    try {
      setLayout({ textAlign: align })
    } catch (error) {
      toast.error(t('errors.textAlignFailed'), {
        description: error instanceof Error ? error.message : t('errors.unknownError'),
        duration: 5000,
      })
    }
  }, [setLayout, t])

  // T029: Background URL input
  const handleBgUrlChange = useCallback((url: string) => {
    try {
      setBgUrl(url)
    } catch (error) {
      toast.error(t('errors.backgroundFailed'), {
        description: error instanceof Error ? error.message : t('errors.unknownError'),
        duration: 5000,
      })
    }
  }, [setBgUrl, t])

  // Handle Escape key for closing dialog
  const handleEscapeKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      onOpenChange(false)
    }
  }, [open, onOpenChange])

  React.useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey)
    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [handleEscapeKey])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 012-z-index-refactor: Z_INDEX_QUICK_SETTINGS (200) - Override Radix z-50 default to fix critical conflict with controls */}
      <DialogContent
        className={cn(
          "sm:max-w-md",
          "bg-background/95 backdrop-blur-xl",
          "border-border/50 shadow-2xl"
        )}
        style={{ zIndex: ZIndex.QuickSettings }}
        onEscapeKeyDown={() => onOpenChange(false)}
        showCloseButton={false}
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {t('title')}
            </DialogTitle>
            {/* T031: Visual indication for modified settings */}
            {hasModifications && (
              <Badge variant="secondary" className="ml-2" data-testid="modified-badge">
                {t('modified')}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8"
            aria-label={t('close')}
            data-testid="close-button"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* T026: Scroll speed control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('scrollSpeed')}</label>
              <span className="text-sm text-muted-foreground">
                {animations.autoScrollSpeed} {t('scrollSpeedUnit')}
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              step="5"
              value={animations.autoScrollSpeed}
              onChange={(e) => handleScrollSpeedChange(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary/80 transition-colors"
              aria-label={t('scrollSpeedAria')}
              role="slider"
              aria-valuemin={10}
              aria-valuemax={200}
              aria-valuenow={animations.autoScrollSpeed}
              data-testid="slider-scroll-speed"
            />
          </div>

          {/* T027: Font size control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('fontSize')}</label>
              <span className="text-sm text-muted-foreground">
                {typography.fontSize} {t('fontSizeUnit')}
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="80"
              step="2"
              value={typography.fontSize}
              onChange={(e) => handleFontSizeChange(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary/80 transition-colors"
              aria-label={t('fontSizeAria')}
              role="slider"
              aria-valuemin={20}
              aria-valuemax={80}
              aria-valuenow={typography.fontSize}
              data-testid="slider-font-size"
            />
          </div>

          {/* T028: Text alignment control */}
          <div className="space-y-3">
            <label className="text-sm font-medium">{t('textAlign')}</label>
            <div className="flex gap-2">
              <Button
                variant={layout.textAlign === 'left' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTextAlignChange('left')}
                aria-label={t('alignLeftAria')}
                aria-pressed={layout.textAlign === 'left'}
                className="flex-1"
                data-testid="align-left"
              >
                <AlignLeft className="w-4 h-4" />
                {t('alignLeft')}
              </Button>
              <Button
                variant={layout.textAlign === 'center' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTextAlignChange('center')}
                aria-label={t('alignCenterAria')}
                aria-pressed={layout.textAlign === 'center'}
                className="flex-1"
                data-testid="align-center"
              >
                <AlignCenter className="w-4 h-4" />
                {t('alignCenter')}
              </Button>
              <Button
                variant={layout.textAlign === 'right' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTextAlignChange('right')}
                aria-label={t('alignRightAria')}
                aria-pressed={layout.textAlign === 'right'}
                className="flex-1"
                data-testid="align-right"
              >
                <AlignRight className="w-4 h-4" />
                {t('alignRight')}
              </Button>
            </div>
          </div>

          {/* T029: Background URL input */}
          <div className="space-y-3">
            <label htmlFor="bg-url" className="text-sm font-medium">
              {t('backgroundUrl')}
            </label>
            <Input
              id="bg-url"
              type="text"
              placeholder={t('backgroundUrlPlaceholder')}
              value={bgUrl}
              onChange={(e) => handleBgUrlChange(e.target.value)}
              aria-label={t('backgroundUrlAria')}
              className="w-full"
              data-testid="bg-url-input"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
