'use client'

import { cn } from '@/lib/utils'
import { ColorPicker } from '../ui/ColorPicker'
import { SliderInput } from '../ui/SliderInput'
import { useConfigStore } from '@/lib/stores/useConfigStore'

export function GlowControl() {
  const { effects, setEffects } = useConfigStore()
  
  return (
    <div className="space-y-4">
      {/* Enable Glow */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Text Glow
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Add luminous effect around text
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
            label="Blur Radius"
            onChange={(value) => setEffects({ glowBlurRadius: value })}
          />

          {/* Intensity */}
          <SliderInput
            value={effects.glowIntensity}
            min={0}
            max={1}
            step={0.05}
            label="Intensity"
            onChange={(value) => setEffects({ glowIntensity: value })}
          />

          {/* Glow Color */}
          <ColorPicker
            label="Glow Color"
            value={effects.glowColor}
            onChange={(value) => setEffects({ glowColor: value })}
          />
        </>
      )}
    </div>
  )
}
