'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronDown, Type, Heading, Code, PenTool, TextCursorInput } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConfigStore } from '@/lib/stores/useConfigStore'
import { FontLoader } from './FontLoader'
import {
  fontLibrary,
  categoryDisplayNames,
  type FontCategory,
} from '@/lib/fonts/google-fonts'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useTranslations } from 'next-intl'

interface FontSelectorProps {
  className?: string
}

// Map categories to their icons
const categoryIconComponents: Record<FontCategory, React.ComponentType<{ className?: string }>> = {
  serif: Type,
  sans: Heading,
  display: TextCursorInput,
  mono: Code,
  handwriting: PenTool,
}

/**
 * FontSelector - Font selection with native picker on mobile
 *
 * T074: [US5] Mobile native font picker
 * - Uses native <select> on mobile
 * - Keeps custom dropdown on desktop
 */
export function FontSelector({ className }: FontSelectorProps) {
  const t = useTranslations('Config.typography')
  const { typography, setTypography } = useConfigStore()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<FontCategory>('sans')
  const [searchQuery, setSearchQuery] = useState('')
  
  // T074: Detect mobile for native font picker
  const isMobile = useMediaQuery('(max-width: 1023px)')
  
  // Find current font category
  useEffect(() => {
    for (const [category, fonts] of Object.entries(fontLibrary)) {
      if (fonts.some(f => f.name === typography.fontFamily)) {
        setSelectedCategory(category as FontCategory)
        break
      }
    }
  }, [typography.fontFamily])
  
  const currentFonts = fontLibrary[selectedCategory] || []
  const filteredFonts = searchQuery
    ? currentFonts.filter(f => 
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentFonts
  
  const handleSelectFont = (fontName: string) => {
    setTypography({ fontFamily: fontName })
    setIsOpen(false)
    setSearchQuery('')
  }
  
  return (
    <div className={cn('relative', className)}>
      <label className="block text-sm font-medium text-foreground mb-2">
        {t('fontFamily')}
      </label>
      
      {/* T074: Native select on mobile, custom dropdown on desktop */}
      {isMobile ? (
        // Mobile: Native select element
        <select
          value={typography.fontFamily}
          onChange={(e) => setTypography({ fontFamily: e.target.value })}
          className={cn(
            "w-full px-4 py-3 rounded-lg",
            "bg-background border border-border",
            "focus:outline-none focus:ring-2 focus:ring-primary",
            "text-foreground",
            // T072: 48px minimum touch target
            "min-h-[48px]"
          )}
          aria-label="Font Family"
        >
          {Object.entries(fontLibrary).map(([category, fonts]) => (
            <optgroup key={category} label={categoryDisplayNames[category as FontCategory]}>
              {fonts.map((font) => (
                <option key={font.name} value={font.name}>
                  {font.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      ) : (
        // Desktop: Custom dropdown with category tabs
        <>
          {/* Category Selector */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
            {Object.keys(fontLibrary).map((category) => {
              const Icon = categoryIconComponents[category as FontCategory] || Type
              
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category as FontCategory)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                    'border border-gray-200 dark:border-gray-700',
                    selectedCategory === category
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{categoryDisplayNames[category as FontCategory]}</span>
                </button>
              )
            })}
          </div>
          
          {/* Font Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3 text-left',
                'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600',
                'rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                'transition-colors'
              )}
            >
              <span
                className="truncate"
                style={{ fontFamily: typography.fontFamily }}
              >
                {typography.fontFamily}
              </span>
              <ChevronDown
                className={cn(
                  'w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform',
                  isOpen && 'transform rotate-180'
                )}
              />
            </button>
            
            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-hidden flex flex-col">
                {/* Search */}
                <div className="p-3 border-b border-border">
                  <input
                    type="text"
                    placeholder={t('searchFonts')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      'w-full px-3 py-2 text-sm border border-border rounded-lg',
                      'focus:outline-none focus:ring-2 focus:ring-primary',
                      'bg-background text-foreground'
                    )}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                
                {/* Font List */}
                <div className="flex-1 overflow-y-auto p-2">
                  {filteredFonts.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      {t('noFontsFound')}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredFonts.map((font) => (
                        <button
                          key={font.name}
                          onClick={() => handleSelectFont(font.name)}
                          className={cn(
                            'w-full flex items-center justify-between px-3 py-2 rounded-lg',
                            'text-left hover:bg-gray-100 dark:hover:bg-gray-700',
                            'transition-colors group'
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <div
                              className="truncate text-sm"
                              style={{ fontFamily: font.name }}
                            >
                              {font.name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {font.previewText}
                            </div>
                          </div>
                          {typography.fontFamily === font.name && (
                            <Check className="w-5 h-5 text-blue-500 shrink-0 ml-2" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
