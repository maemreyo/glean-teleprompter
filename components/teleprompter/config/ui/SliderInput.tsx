'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

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
  unit,
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
  
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
          className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-600 transition-colors"
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
              "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
              "border-gray-300 dark:border-gray-600"
            )}
          />
          {unit && (
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400 pointer-events-none">
              {unit}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
