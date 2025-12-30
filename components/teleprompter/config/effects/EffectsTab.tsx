'use client'

import { ShadowControl } from './ShadowControl'
import { OutlineControl } from './OutlineControl'
import { GlowControl } from './GlowControl'

export function EffectsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Visual Effects</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Configure shadows, outlines, and glows for enhanced readability.
        </p>
      </div>
      
      <div className="space-y-6 pt-4">
        <ShadowControl />
        <OutlineControl />
        <GlowControl />
      </div>
    </div>
  )
}
