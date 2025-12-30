'use client'

import { cn } from '@/lib/utils'
import { ColorPicker } from '../ui/ColorPicker'
import { SliderInput } from '../ui/SliderInput'
import { useConfigStore } from '@/lib/stores/useConfigStore'

export function OutlineControl() {
  const { effects, setEffects } = useConfigStore()
  
  return (
    <div className="space-y-4">
      {/* Enable Outline */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Text Outline
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Add border around text for better visibility
          </p>
        </div>
        <button
          onClick={() => setEffects({ outlineEnabled: !effects.outlineEnabled })}
          className={cn(
            'relative w-12 h-6 rounded-full transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            effects.outlineEnabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
              effects.outlineEnabled ? 'translate-x-6' : 'translate-x-0'
            )}
          />
        </button>
      </div>

      {effects.outlineEnabled && (
        <>
          {/* Width */}
          <SliderInput
            value={effects.outlineWidth}
            min={1}
            max={10}
            step={0.5}
            unit="px"
            label="Width"
            onChange={(value) => setEffects({ outlineWidth: value })}
          />

          {/* Color */}
          <ColorPicker
            label="Outline Color"
            value={effects.outlineColor}
            onChange={(value) => setEffects({ outlineColor: value })}
          />
        </>
      )}
    </div>
  )
}
