'use client'

import { cn } from '@/lib/utils'
import { FontSelector } from './FontSelector'
import { FontSizeControl } from './FontSizeControl'
import { SliderInput } from '../ui/SliderInput'
import { useConfigStore } from '@/lib/stores/useConfigStore'
import { useTranslations } from 'next-intl'

export function TypographyTab() {
  const t = useTranslations('Config.typography')
  const { typography, setTypography } = useConfigStore()
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">{t('title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('description')}
        </p>
      </div>
      
      {/* Font Family Selector */}
      <FontSelector />
      
      {/* Font Size & Weight */}
      <FontSizeControl />
      
      {/* Letter Spacing */}
      <SliderInput
        value={typography.letterSpacing}
        min={-5}
        max={20}
        step={0.5}
        unit="px"
        label={t('letterSpacing')}
        onChange={(value) => setTypography({ letterSpacing: value })}
      />
      
      {/* Line Height */}
      <SliderInput
        value={typography.lineHeight}
        min={1}
        max={3}
        step={0.1}
        label={t('lineHeight')}
        onChange={(value) => setTypography({ lineHeight: value })}
      />
      
      {/* Text Transform */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          {t('textTransform')}
        </label>
        <div className="flex gap-2">
          {(['none', 'uppercase', 'lowercase', 'capitalize'] as const).map((transform) => (
            <button
              key={transform}
              onClick={() => setTypography({ textTransform: transform })}
              className={cn(
                'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                'border border-border',
                typography.textTransform === transform
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground hover:bg-secondary'
              )}
            >
              {t(transform)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
