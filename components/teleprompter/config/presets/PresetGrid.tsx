'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Trash2 } from 'lucide-react'
import type { Preset } from '@/lib/config/types'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface PresetGridProps {
  presets: Preset[]
  onApply: (preset: Preset) => void
  onExport: (preset: Preset) => void
  onDelete: (presetId: string) => void
  isReadOnly?: boolean
}

export function PresetGrid({ presets, onApply, onExport, onDelete, isReadOnly = false }: PresetGridProps) {
  const t = useTranslations('Config.presets.presetGrid')
  
  if (presets.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p>{t('noPresets')}</p>
        <p className="text-sm mt-1">{t('createFirst')}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {presets.map((preset) => (
        <Card key={preset.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-sm">{preset.name}</h4>
              {preset.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {preset.description}
                </p>
              )}
              {preset.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {preset.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              className={cn("flex-1", isReadOnly && "w-full")}
              onClick={() => onApply(preset)}
            >
              {t('apply')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onExport(preset)}
            >
              <Download className="w-4 h-4" />
            </Button>
            {!isReadOnly && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(preset.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
