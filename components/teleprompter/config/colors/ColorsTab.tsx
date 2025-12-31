'use client'

import { useState } from 'react'
import { ColorPicker } from '../ui/ColorPicker'
import { GradientPicker } from './GradientPicker'
import { ContrastBadge } from './ContrastBadge'
import { useConfigStore } from '@/lib/stores/useConfigStore'
import { validateContrast } from '@/lib/config/contrast'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { ARIA_LABELS } from '@/lib/a11y/ariaLabels'

// Color palettes
const getColorPalettes = (t: (key: string) => string) => [
  {
    name: t('broadcastStandard'),
    category: 'broadcast',
    colors: ['#ffffff', '#fbbf24', '#4ade80', '#60a5fa', '#f472b6', '#f87171'],
  },
  {
    name: t('corporate'),
    category: 'corporate',
    colors: ['#1e3a5f', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
  },
  {
    name: t('creative'),
    category: 'creative',
    colors: ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1'],
  },
  {
    name: t('highContrast'),
    category: 'high-contrast',
    colors: ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00'],
  },
]

export function ColorsTab() {
  const t = useTranslations('Config.colors')
  const { colors, setColors } = useConfigStore()
  const colorPalettes = getColorPalettes(t)
  const [focusedPaletteIndex, setFocusedPaletteIndex] = useState<number | null>(null)

  // Calculate contrast validation (against black background for now)
  const contrastValidation = validateContrast(
    colors.primaryColor,
    '#000000'
  )

  // Apply palette
  const applyPalette = (palette: typeof colorPalettes[0]) => {
    setColors({ primaryColor: palette.colors[0] })
  }

  // Handle keyboard navigation for color swatches
  const handleSwatchKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    color: string,
    paletteIndex: number,
    swatchIndex: number
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const palette = colorPalettes[paletteIndex]
      setColors({ primaryColor: color })
    }
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">{t('title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('description')}
        </p>
      </div>
      
      {/* Color Palettes */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground">
          {t('colorPalettes')}
        </label>
        <div
          role="grid"
          aria-label="Color palette"
          className="grid grid-cols-2 gap-2"
        >
          {colorPalettes.map((palette, paletteIndex) => (
            <button
              key={palette.name}
              onClick={() => applyPalette(palette)}
              className="p-3 rounded-lg border border-border hover:border-primary transition-colors text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label={`${palette.name} palette`}
              role="row"
            >
              <div className="text-sm font-medium text-foreground mb-2">
                {palette.name}
              </div>
              <div role="grid" className="flex gap-1">
                {palette.colors.map((color, swatchIndex) => (
                  <div
                    key={color}
                    className="w-6 h-6 rounded-full border border-border"
                    style={{ backgroundColor: color }}
                    role="gridcell"
                    aria-label={ARIA_LABELS.colorSwatch(color)}
                    tabIndex={0}
                    onKeyDown={(e) => handleSwatchKeyDown(e, color, paletteIndex, swatchIndex)}
                    onClick={(e) => {
                      e.stopPropagation()
                      setColors({ primaryColor: color })
                    }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Primary Color */}
      <ColorPicker
        label={t('primaryTextColor')}
        value={colors.primaryColor}
        onChange={(value) => setColors({ primaryColor: value })}
      />
      
      {/* Contrast Validation */}
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <div className="flex-1">
          <label className="block text-sm font-medium text-foreground mb-1">
            {t('wcagCompliance')}
          </label>
          <p className="text-xs text-muted-foreground">
            {t('againstBlackBg')}
          </p>
        </div>
        <ContrastBadge validation={contrastValidation} />
      </div>
      
      {/* Gradient Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('enableGradient')}
          </label>
          <p className="text-xs text-muted-foreground">
            {t('gradientDesc')}
          </p>
        </div>
        <button
          onClick={() => setColors({ gradientEnabled: !colors.gradientEnabled })}
          className={cn(
            'relative w-12 h-6 rounded-full transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary',
            colors.gradientEnabled ? 'bg-primary' : 'bg-muted'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
              colors.gradientEnabled ? 'translate-x-6' : 'translate-x-0'
            )}
          />
        </button>
      </div>
      
      {/* Gradient Configuration */}
      {colors.gradientEnabled && (
        <GradientPicker
          enabled={colors.gradientEnabled}
          type={colors.gradientType}
          colors={colors.gradientColors}
          angle={colors.gradientAngle}
          onEnabledChange={(enabled) => setColors({ gradientEnabled: enabled })}
          onTypeChange={(type) => setColors({ gradientType: type })}
          onColorsChange={(colors) => setColors({ gradientColors: colors })}
          onAngleChange={(angle) => setColors({ gradientAngle: angle })}
        />
      )}
      
      {/* Effect Colors */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h4 className="text-sm font-medium text-foreground">
          {t('effectColors')}
        </h4>
        
        <ColorPicker
          label={t('outlineColor')}
          value={colors.outlineColor}
          onChange={(value) => setColors({ outlineColor: value })}
        />
        
        <ColorPicker
          label={t('glowColor')}
          value={colors.glowColor}
          onChange={(value) => setColors({ glowColor: value })}
        />
      </div>
    </div>
  )
}
