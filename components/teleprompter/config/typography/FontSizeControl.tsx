'use client'

import { cn } from '@/lib/utils'
import { SliderInput } from '../ui/SliderInput'
import { useConfigStore } from '@/lib/stores/useConfigStore'
import { useTranslations } from 'next-intl'

export function FontSizeControl() {
  const t = useTranslations('Config.typography')
  const { typography, setTypography } = useConfigStore()
  
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-foreground">
        {t('fontSize')}
      </label>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Font Size */}
        <SliderInput
          value={typography.fontSize}
          min={12}
          max={120}
          step={1}
          unit="px"
          label={t('size')}
          onChange={(value) => setTypography({ fontSize: value })}
        />
        
        {/* Font Weight */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            {t('weight')}
          </label>
          <select
            value={typography.fontWeight}
            onChange={(e) => setTypography({ fontWeight: parseInt(e.target.value) })}
            className={cn(
              "w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
              "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            )}
          >
            <option value={100}>{t('fontWeights.thin')}</option>
            <option value={200}>{t('fontWeights.extraLight')}</option>
            <option value={300}>{t('fontWeights.light')}</option>
            <option value={400}>{t('fontWeights.regular')}</option>
            <option value={500}>{t('fontWeights.medium')}</option>
            <option value={600}>{t('fontWeights.semiBold')}</option>
            <option value={700}>{t('fontWeights.bold')}</option>
            <option value={800}>{t('fontWeights.extraBold')}</option>
            <option value={900}>{t('fontWeights.black')}</option>
          </select>
        </div>
      </div>
    </div>
  )
}
