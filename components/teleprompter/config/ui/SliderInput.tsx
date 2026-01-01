'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ARIA_LABELS } from '@/lib/a11y/ariaLabels'
import { useMediaQuery } from '@/hooks/useMediaQuery'

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

/**
 * SliderInput - Touch-optimized slider with 48px minimum touch targets
 *
 * T072: [US5] Mobile touch optimization
 * - 48px minimum touch target size on mobile
 * - Increased slider thumb size for better touch interaction
 * - Enhanced padding for touch targets
 */
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
  
  // T072: Detect mobile for touch optimization
  const isMobile = useMediaQuery('(max-width: 1023px)')
  
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
      <div className={cn(
        "flex items-center gap-3",
        // T072: Increased gap for better touch spacing on mobile
        isMobile && "gap-4"
      )}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
          className={cn(
            "flex-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary/80 transition-colors",
            // T072: Larger slider track on mobile (height: h-3 = 12px)
            isMobile ? "h-3" : "h-2"
          )}
          style={{
            // T072: 48px minimum touch target for slider thumb on mobile
            ...(isMobile && {
              '--thumb-height': '48px',
              '--thumb-width': '48px',
            } as React.CSSProperties),
          }}
          // T072: Add custom slider styles via data attribute
          data-touch-optimized={isMobile}
          aria-label={ariaLabel}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={ariaLabel}
        />
        <div className={cn(
          "relative flex items-center",
          // T072: Larger number input on mobile
          isMobile ? "w-24" : "w-20 sm:w-24"
        )}>
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={inputValue}
            onChange={handleInputChange}
            className={cn(
              "w-full border rounded-lg",
              "focus:ring-2 focus:ring-primary focus:border-transparent",
              "bg-background text-foreground",
              "border-border",
              // T072: Larger padding and text on mobile for 48px touch target
              isMobile ? "px-4 py-3 text-base min-h-[48px]" : "px-2 py-1 text-sm",
              unit && "pr-8"
            )}
            aria-label={`${label || 'Value'} input`}
          />
          {unit && (
            <span className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground",
              // T072: Slightly larger unit text on mobile
              isMobile ? "text-sm" : "text-xs"
            )}>
              {unit}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
