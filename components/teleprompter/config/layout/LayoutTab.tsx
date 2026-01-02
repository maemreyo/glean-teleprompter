'use client'

import { SliderInput } from '../ui/SliderInput'
import { useConfigStore } from '@/lib/stores/useConfigStore'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export function LayoutTab() {
  const t = useTranslations('Config.layout')
  const { layout, setLayout } = useConfigStore()
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">{t('title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('description')}
        </p>
      </div>
      
      {/* Horizontal Margin */}
      <SliderInput
        value={layout.horizontalMargin}
        min={0}
        max={200}
        step={5}
        unit="px"
        label={t('horizontalMargin')}
        tooltip={t('tooltips.horizontalMargin')}
        onChange={(value) => setLayout({ horizontalMargin: value })}
      />
      
      {/* Vertical Padding */}
      <SliderInput
        value={layout.verticalPadding}
        min={0}
        max={100}
        step={5}
        unit="px"
        label={t('verticalPadding')}
        tooltip={t('tooltips.verticalPadding')}
        onChange={(value) => setLayout({ verticalPadding: value })}
      />
      
      {/* Text Alignment */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground" title={t('tooltips.textAlign')}>
          {t('textAlign')}
        </label>
        <div className="flex gap-2">
          {(['left', 'center', 'right', 'justify'] as const).map((align) => (
            <button
              key={align}
              onClick={() => setLayout({ textAlign: align })}
              className={cn(
                'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                'border border-border',
                layout.textAlign === align
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground hover:bg-secondary'
              )}
              title={t('tooltips.textAlign')}
            >
              {align.charAt(0).toUpperCase() + align.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Column Count */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground" title={t('tooltips.columns')}>
          {t('columns')}
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((count) => (
            <button
              key={count}
              onClick={() => setLayout({ columnCount: count })}
              className={cn(
                'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                'border border-border',
                layout.columnCount === count
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground hover:bg-secondary'
              )}
              title={t('tooltips.columns')}
            >
              {count}
            </button>
          ))}
        </div>
      </div>
      
      {/* Column Gap */}
      {layout.columnCount > 1 && (
        <SliderInput
          value={layout.columnGap}
          min={20}
          max={100}
          step={5}
          unit="px"
          label={t('columnGap')}
          tooltip={t('tooltips.columnGap')}
          onChange={(value) => setLayout({ columnGap: value })}
        />
      )}
      
      {/* Text Area Width */}
      <SliderInput
        value={layout.textAreaWidth}
        min={50}
        max={100}
        step={5}
        unit="%"
        label={t('textAreaWidth')}
        tooltip={t('tooltips.textAreaWidth')}
        onChange={(value) => setLayout({ textAreaWidth: value })}
      />
      
      {/* Text Area Position */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground" title={t('tooltips.textAreaPosition')}>
          {t('textAreaPosition')}
        </label>
        <div className="flex gap-2">
          {(['left', 'center', 'right'] as const).map((position) => (
            <button
              key={position}
              onClick={() => setLayout({ textAreaPosition: position })}
              className={cn(
                'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                'border border-border',
                layout.textAreaPosition === position
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground hover:bg-secondary'
              )}
              title={t('tooltips.textAreaPosition')}
            >
              {position.charAt(0).toUpperCase() + position.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
