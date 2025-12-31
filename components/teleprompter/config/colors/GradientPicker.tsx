'use client'

import { cn } from '@/lib/utils'

interface GradientPickerProps {
  enabled: boolean
  type: 'linear' | 'radial'
  colors: string[]
  angle: number
  onEnabledChange: (enabled: boolean) => void
  onTypeChange: (type: 'linear' | 'radial') => void
  onColorsChange: (colors: string[]) => void
  onAngleChange: (angle: number) => void
  className?: string
}

export function GradientPicker({
  enabled,
  type,
  colors,
  angle,
  onEnabledChange,
  onTypeChange,
  onColorsChange,
  onAngleChange,
  className,
}: GradientPickerProps) {
  if (!enabled) {
    return null
  }

  const handleAddColor = () => {
    if (colors.length < 3) {
      onColorsChange([...colors, '#ffffff'])
    }
  }

  const handleColorChange = (index: number, value: string) => {
    const newColors = [...colors]
    newColors[index] = value
    onColorsChange(newColors)
  }

  const handleRemoveColor = (index: number) => {
    if (colors.length > 2) {
      onColorsChange(colors.filter((_, i) => i !== index))
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onTypeChange(type === 'linear' ? 'radial' : 'linear')}
          className={cn(
            'px-3 py-1.5 text-sm rounded-lg transition-colors',
            'border border-border',
            type === 'linear'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-foreground hover:bg-secondary'
          )}
        >
          Linear
        </button>
        <button
          onClick={() => onTypeChange(type === 'radial' ? 'linear' : 'radial')}
          className={cn(
            'px-3 py-1.5 text-sm rounded-lg transition-colors',
            'border border-border',
            type === 'radial'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-foreground hover:bg-secondary'
          )}
        >
          Radial
        </button>
      </div>

      {/* Angle control for linear gradients */}
      {type === 'linear' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Angle: {angle}°
          </label>
          <input
            type="range"
            min={0}
            max={360}
            value={angle}
            onChange={(e) => onAngleChange(parseInt(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
      )}

      {/* Color stops */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-foreground">
            Color Stops
          </label>
          <button
            onClick={handleAddColor}
            disabled={colors.length >= 3}
            className={cn(
              'px-3 py-1 text-sm rounded-lg transition-colors',
              'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            + Add Color
          </button>
        </div>
        
        <div className="space-y-2">
          {colors.map((color, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-lg border-2 border-border"
                style={{ backgroundColor: color }}
              />
              <input
                type="text"
                value={color}
                onChange={(e) => handleColorChange(index, e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
                placeholder="#ffffff"
              />
              {colors.length > 2 && (
                <button
                  onClick={() => handleRemoveColor(index)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Remove color"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Gradient preview */}
      <div
        className="w-full h-12 rounded-lg border border-border"
        style={{
          background: type === 'linear'
            ? `linear-gradient(${angle}deg, ${colors.join(', ')})`
            : `radial-gradient(circle, ${colors.join(', ')})`,
        }}
      />
    </div>
  )
}
