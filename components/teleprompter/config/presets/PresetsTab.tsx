'use client'

import { useState } from 'react'
import { PresetGrid } from './PresetGrid'
import { SavePresetDialog } from './SavePresetDialog'
import { SyncControls } from './SyncControls'
import { Button } from '@/components/ui/button'
import { Upload, Plus } from 'lucide-react'
import { useConfigStore } from '@/lib/stores/useConfigStore'
import { useTranslations } from 'next-intl'
import { builtInPresets, configToPreset, exportPresetAsJSON, importPresetFromJSON } from '@/lib/config/presets'
import type { Preset } from '@/lib/config/types'

export function PresetsTab() {
  const t = useTranslations('Config.presets')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const { setTypography, setColors, setEffects, setLayout, setAnimations, typography, colors, effects, layout, animations } = useConfigStore()

  const handleApplyPreset = (preset: Preset) => {
    const config = preset.config
    setTypography(config.typography)
    setColors(config.colors)
    setEffects(config.effects)
    setLayout(config.layout)
    setAnimations(config.animations)
  }

  const handleExportPreset = (preset: Preset) => {
    const json = exportPresetAsJSON(preset)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${preset.name.replace(/\s+/g, '-').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportPreset = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string
        const imported = importPresetFromJSON(json)
        
        if ('error' in imported) {
          setImportError(imported.error || 'Failed to import preset')
          return
        }

        // Apply the imported preset config
        if ('config' in imported) {
          const presetConfig = imported.config
          setTypography(presetConfig.typography)
          setColors(presetConfig.colors)
          setEffects(presetConfig.effects)
          setLayout(presetConfig.layout)
          setAnimations(presetConfig.animations)
        
          setImportError(null)
        }
      } catch {
        setImportError('Invalid preset file')
      }
    }
    reader.readAsText(file)
    
    // Reset input
    event.target.value = ''
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">{t('title')}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('description')}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-4">
        <Button onClick={() => setShowSaveDialog(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          {t('savePreset')}
        </Button>
        
        <Button onClick={() => document.getElementById('preset-import')?.click()} size="sm" variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          {t('import')}
        </Button>
        <input
          id="preset-import"
          type="file"
          accept=".json"
          onChange={handleImportPreset}
          className="hidden"
        />
      </div>

      {importError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{importError}</p>
        </div>
      )}

      {/* Sync Controls */}
      <SyncControls />

      {/* Presets Grid */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('builtinPresets')}</h4>
        <PresetGrid
          presets={builtInPresets.map((p, i) => ({ 
            ...p, 
            id: `builtin-${i}`, 
            userId: 'system', 
            createdAt: new Date().toISOString(), 
            updatedAt: new Date().toISOString() 
          }))}
          onApply={handleApplyPreset}
          onExport={handleExportPreset}
          onDelete={() => {}}
          isReadOnly
        />
      </div>

      {/* Save Preset Dialog */}
      {showSaveDialog && (
        <SavePresetDialog
          open={showSaveDialog}
          onClose={() => setShowSaveDialog(false)}
          onSave={(name: string, description?: string) => {
            const currentConfig = configToPreset(
              {
                version: '1.0.0',
                typography,
                colors,
                effects,
                layout,
                animations,
                metadata: {
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  appVersion: '1.0.0',
                },
              },
              name,
              description
            )
            // In a real implementation, this would save to Supabase
            console.log('Saving preset:', currentConfig)
            setShowSaveDialog(false)
          }}
        />
      )}
    </div>
  )
}
