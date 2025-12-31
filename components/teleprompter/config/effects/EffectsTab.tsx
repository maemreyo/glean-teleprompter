'use client'

import { ShadowControl } from './ShadowControl'
import { OutlineControl } from './OutlineControl'
import { GlowControl } from './GlowControl'
import { BackdropControl } from './BackdropControl'
import { useTranslations } from 'next-intl'

export function EffectsTab() {
  const t = useTranslations('Config.effects')
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">{t('title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('description')}
        </p>
      </div>
      
      <div className="space-y-6 pt-4">
        <ShadowControl />
        <OutlineControl />
        <GlowControl />
        <BackdropControl />
      </div>
    </div>
  )
}
