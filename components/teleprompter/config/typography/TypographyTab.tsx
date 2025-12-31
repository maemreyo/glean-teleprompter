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
        <p className="text-sm text-gray-600 dark:text-gray-400">
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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('textTransform')}
        </label>
        <div className="flex gap-2">
          {(['none', 'uppercase', 'lowercase', 'capitalize'] as const).map((transform) => (
            <button
              key={transform}
              onClick={() => setTypography({ textTransform: transform })}
              className={cn(
                'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                'border border-gray-300 dark:border-gray-600',
                typography.textTransform === transform
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
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
