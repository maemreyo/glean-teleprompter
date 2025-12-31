'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ARIA_LABELS } from '@/lib/a11y/ariaLabels'

interface SliderInputProps {
  value: number
  min: number
  max: number
  step: number
  unit?: string
  label?: string
  onChange: (value: number) => void
  className?: string
}

export function SliderInput({
  value,
  min,
  max,
  step,
  unit = '',
  label,
  onChange,
  className,
}: SliderInputProps) {
  const [inputValue, setInputValue] = useState(value.toString())
  
  useEffect(() => {
    setInputValue(value.toString())
  }, [value])
  
  const handleSliderChange = (newValue: number) => {
    onChange(newValue)
    setInputValue(newValue.toString())
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue)
      setInputValue(newValue.toString())
    }
  }

  // Format value for ARIA
  const ariaLabel = label
    ? ARIA_LABELS.slider(label, value, unit)
    : `${value}${unit}`
  
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
          className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary/80 transition-colors"
          aria-label={ariaLabel}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={ariaLabel}
        />
        <div className="relative w-20 sm:w-24 flex items-center">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={inputValue}
            onChange={handleInputChange}
            className={cn(
              "w-full px-2 py-1 text-sm border rounded-lg",
              "focus:ring-2 focus:ring-primary focus:border-transparent",
              "bg-background text-foreground",
              "border-border",
              unit ? "pr-8" : ""
            )}
          />
          {unit && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              {unit}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
