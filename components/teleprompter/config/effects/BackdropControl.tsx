'use client'

import { useConfigStore } from '@/lib/stores/useConfigStore'
import { SliderInput } from '../ui/SliderInput'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useTranslations } from 'next-intl'

interface BackdropControlProps {
  tooltip?: string
}

export function BackdropControl({ tooltip }: BackdropControlProps) {
  const t = useTranslations('Config.effects.backdrop')
  const { effects, setEffects } = useConfigStore()

  return (
    <div className="space-y-4" title={tooltip}>
      <div className="flex items-center justify-between">
        <Label htmlFor="backdrop-enabled" className="text-sm font-medium">
          {t('label')}
        </Label>
        <Checkbox
          id="backdrop-enabled"
          checked={effects.backdropFilterEnabled}
          onCheckedChange={(checked: boolean) => setEffects({ backdropFilterEnabled: checked })}
        />
      </div>

      {effects.backdropFilterEnabled && (
        <div className="space-y-4 pt-2">
          <SliderInput
            label={t('blur')}
            value={effects.backdropBlur}
            min={0}
            max={20}
            step={1}
            unit="px"
            onChange={(value) => setEffects({ backdropBlur: value })}
          />

          <SliderInput
            label={t('brightness')}
            value={effects.backdropBrightness}
            min={0}
            max={200}
            step={5}
            unit="%"
            onChange={(value) => setEffects({ backdropBrightness: value })}
          />

          <SliderInput
            label={t('saturation')}
            value={effects.backdropSaturation}
            min={0}
            max={200}
            step={5}
            unit="%"
            onChange={(value) => setEffects({ backdropSaturation: value })}
          />
        </div>
      )}
    </div>
  )
}
