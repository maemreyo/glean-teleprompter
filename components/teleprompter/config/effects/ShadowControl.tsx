'use client'

import { cn } from '@/lib/utils'
import { ColorPicker } from '../ui/ColorPicker'
import { SliderInput } from '../ui/SliderInput'
import { useConfigStore } from '@/lib/stores/useConfigStore'

export function ShadowControl() {
  const { effects, setEffects } = useConfigStore()
  
  return (
    <div className="space-y-4">
      {/* Enable Shadow */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Text Shadow
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Add depth to text with shadow
          </p>
        </div>
        <button
          onClick={() => setEffects({ shadowEnabled: !effects.shadowEnabled })}
          className={cn(
            'relative w-12 h-6 rounded-full transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            effects.shadowEnabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
              effects.shadowEnabled ? 'translate-x-6' : 'translate-x-0'
            )}
          />
        </button>
      </div>

      {effects.shadowEnabled && (
        <>
          {/* Offset X */}
          <SliderInput
            value={effects.shadowOffsetX}
            min={0}
            max={20}
            step={1}
            unit="px"
            label="Offset X"
            onChange={(value) => setEffects({ shadowOffsetX: value })}
          />

          {/* Offset Y */}
          <SliderInput
            value={effects.shadowOffsetY}
            min={0}
            max={20}
            step={1}
            unit="px"
            label="Offset Y"
            onChange={(value) => setEffects({ shadowOffsetY: value })}
          />

          {/* Blur */}
          <SliderInput
            value={effects.shadowBlur}
            min={0}
            max={30}
            step={1}
            unit="px"
            label="Blur"
            onChange={(value) => setEffects({ shadowBlur: value })}
          />

          {/* Opacity */}
          <SliderInput
            value={effects.shadowOpacity}
            min={0}
            max={1}
            step={0.05}
            label="Opacity"
            onChange={(value) => setEffects({ shadowOpacity: value })}
          />

          {/* Shadow Color */}
          <ColorPicker
            label="Shadow Color"
            value={effects.shadowColor}
            onChange={(value) => setEffects({ shadowColor: value })}
          />
        </>
      )}
    </div>
  )
}
