'use client'

import { SliderInput } from '../ui/SliderInput'
import { useConfigStore } from '@/lib/stores/useConfigStore'
import { cn } from '@/lib/utils'

export function LayoutTab() {
  const { layout, setLayout } = useConfigStore()
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Layout Settings</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Configure margins, padding, alignment, and text area positioning.
        </p>
      </div>
      
      {/* Horizontal Margin */}
      <SliderInput
        value={layout.horizontalMargin}
        min={0}
        max={200}
        step={5}
        unit="px"
        label="Horizontal Margin"
        onChange={(value) => setLayout({ horizontalMargin: value })}
      />
      
      {/* Vertical Padding */}
      <SliderInput
        value={layout.verticalPadding}
        min={0}
        max={100}
        step={5}
        unit="px"
        label="Vertical Padding"
        onChange={(value) => setLayout({ verticalPadding: value })}
      />
      
      {/* Text Alignment */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Text Alignment
        </label>
        <div className="flex gap-2">
          {(['left', 'center', 'right', 'justify'] as const).map((align) => (
            <button
              key={align}
              onClick={() => setLayout({ textAlign: align })}
              className={cn(
                'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                'border border-gray-300 dark:border-gray-600',
                layout.textAlign === align
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              )}
            >
              {align.charAt(0).toUpperCase() + align.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Column Count */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Columns
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((count) => (
            <button
              key={count}
              onClick={() => setLayout({ columnCount: count })}
              className={cn(
                'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                'border border-gray-300 dark:border-gray-600',
                layout.columnCount === count
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              )}
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
          label="Column Gap"
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
        label="Text Area Width"
        onChange={(value) => setLayout({ textAreaWidth: value })}
      />
      
      {/* Text Area Position */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Text Area Position
        </label>
        <div className="flex gap-2">
          {(['left', 'center', 'right'] as const).map((position) => (
            <button
              key={position}
              onClick={() => setLayout({ textAreaPosition: position })}
              className={cn(
                'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                'border border-gray-300 dark:border-gray-600',
                layout.textAreaPosition === position
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              )}
            >
              {position.charAt(0).toUpperCase() + position.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
