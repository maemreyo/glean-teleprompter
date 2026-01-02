'use client'

import { cn } from '@/lib/utils'
import { ColorPicker } from '../ui/ColorPicker'
import { SliderInput } from '../ui/SliderInput'
import { useConfigStore } from '@/lib/stores/useConfigStore'
import { useTranslations } from 'next-intl'

interface GlowControlProps {
  tooltip?: string
}

export function GlowControl({ tooltip }: GlowControlProps) {
  const t = useTranslations('Config.effects.glow')
  const { effects, setEffects } = useConfigStore()
  
  return (
    <div className="space-y-4" title={tooltip}>
      {/* Enable Glow */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-foreground">
            {t('label')}
          </label>
          <p className="text-xs text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <button
          onClick={() => setEffects({ glowEnabled: !effects.glowEnabled })}
          className={cn(
            'relative w-12 h-6 rounded-full transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            effects.glowEnabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
              effects.glowEnabled ? 'translate-x-6' : 'translate-x-0'
            )}
          />
        </button>
      </div>

      {effects.glowEnabled && (
        <>
          {/* Blur Radius */}
          <SliderInput
            value={effects.glowBlurRadius}
            min={5}
            max={50}
            step={1}
            unit="px"
            label={t('blurRadius')}
            onChange={(value) => setEffects({ glowBlurRadius: value })}
          />

          {/* Intensity */}
          <SliderInput
            value={effects.glowIntensity}
            min={0}
            max={1}
            step={0.05}
            label={t('intensity')}
            onChange={(value) => setEffects({ glowIntensity: value })}
          />

          {/* Glow Color */}
          <ColorPicker
            label={t('color')}
            value={effects.glowColor}
            onChange={(value) => setEffects({ glowColor: value })}
          />
        </>
      )}
    </div>
  )
}
