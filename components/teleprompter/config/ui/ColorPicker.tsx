'use client'

import { HexColorPicker } from 'react-colorful'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  showInput?: boolean
  className?: string
}

export function ColorPicker({
  value,
  onChange,
  label,
  showInput = true,
  className,
}: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(value)
  
  useEffect(() => {
    setInputValue(value)
  }, [value])
  
  const handleChange = (newColor: string) => {
    onChange(newColor)
    setInputValue(newColor)
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value
    if (/^#[0-9A-Fa-f]{6}$/.test(hex) || /^#[0-9A-Fa-f]{3}$/.test(hex)) {
      onChange(hex)
    }
    setInputValue(hex)
  }
  
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="space-y-3">
        <div className="w-full">
          <HexColorPicker color={value} onChange={handleChange} className="w-full" />
        </div>
        {showInput && (
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-lg border-2 border-gray-200 dark:border-gray-700"
              style={{ backgroundColor: value }}
            />
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="#ffffff"
              className={cn(
                "flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600",
                "rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                "uppercase font-mono"
              )}
            />
          </div>
        )}
      </div>
    </div>
  )
}
