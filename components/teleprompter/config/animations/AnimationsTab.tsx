'use client'

import { useConfigStore } from '@/lib/stores/useConfigStore'
import { SliderInput } from '../ui/SliderInput'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import type { EntranceAnimation } from '@/lib/config/types'

export function AnimationsTab() {
  const { animations, setAnimations } = useConfigStore()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Animation Settings</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Configure scroll behaviors, entrance animations, and highlighting.
        </p>
      </div>

      <div className="space-y-6 pt-4">
        {/* Smooth Scroll */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Smooth Scroll</h4>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="smooth-scroll" className="text-sm">Enable Smooth Scrolling</Label>
            <Checkbox
              id="smooth-scroll"
              checked={animations.smoothScrollEnabled}
              onCheckedChange={(checked: boolean) => setAnimations({ smoothScrollEnabled: checked })}
            />
          </div>

          {animations.smoothScrollEnabled && (
            <SliderInput
              label="Scroll Damping"
              value={animations.scrollDamping}
              min={0.1}
              max={1.0}
              step={0.1}
              onChange={(value) => setAnimations({ scrollDamping: value })}
            />
          )}
        </div>

        {/* Entrance Animation */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Entrance Animation</h4>
          
          <div className="space-y-2">
            <Label className="text-sm">Animation Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {(['fade-in', 'slide-up', 'scale-in', 'none'] as EntranceAnimation[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setAnimations({ entranceAnimation: type })}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    animations.entranceAnimation === type
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>

          <SliderInput
            label="Animation Duration"
            value={animations.entranceDuration}
            min={200}
            max={2000}
            step={100}
            unit="ms"
            onChange={(value) => setAnimations({ entranceDuration: value })}
          />
        </div>

        {/* Word Highlighting */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Word Highlighting</h4>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="word-highlight" className="text-sm">Enable Word-by-Word Highlighting</Label>
            <Checkbox
              id="word-highlight"
              checked={animations.wordHighlightEnabled}
              onCheckedChange={(checked: boolean) => setAnimations({ wordHighlightEnabled: checked })}
            />
          </div>

          {animations.wordHighlightEnabled && (
            <>
              <SliderInput
                label="Highlight Speed"
                value={animations.highlightSpeed}
                min={100}
                max={500}
                step={50}
                unit="ms"
                onChange={(value) => setAnimations({ highlightSpeed: value })}
              />
            </>
          )}
        </div>

        {/* Auto Scroll */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto Scroll</h4>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-scroll" className="text-sm">Enable Auto Scrolling</Label>
            <Checkbox
              id="auto-scroll"
              checked={animations.autoScrollEnabled}
              onCheckedChange={(checked: boolean) => setAnimations({ autoScrollEnabled: checked })}
            />
          </div>

          {animations.autoScrollEnabled && (
            <>
              <SliderInput
                label="Scroll Speed"
                value={animations.autoScrollSpeed}
                min={10}
                max={100}
                step={5}
                unit="px/s"
                onChange={(value) => setAnimations({ autoScrollSpeed: value })}
              />

              <SliderInput
                label="Acceleration"
                value={animations.autoScrollAcceleration}
                min={0}
                max={10}
                step={1}
                onChange={(value) => setAnimations({ autoScrollAcceleration: value })}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
