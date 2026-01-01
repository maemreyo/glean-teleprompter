'use client'

import { useState } from 'react'
import { useConfigStore } from '@/lib/stores/useConfigStore'
import { SliderInput } from '../ui/SliderInput'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { EntranceAnimation } from '@/lib/config/types'

export function AnimationsTab() {
  const t = useTranslations('Config.animations')
  const { animations, setAnimations } = useConfigStore()
  
  // T036: [US2] Test button state for entrance animations
  const [isTesting, setIsTesting] = useState(false)

  const animationTypeMap: Record<EntranceAnimation, string> = {
    'fade-in': t('fadeIn'),
    'slide-up': t('slideUp'),
    'scale-in': t('scaleIn'),
    'none': t('none'),
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">{t('title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <div className="space-y-6 pt-4">
        {/* Smooth Scroll */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground">{t('smoothScroll')}</h4>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="smooth-scroll" className="text-sm">{t('enableSmoothScrolling')}</Label>
            <Checkbox
              id="smooth-scroll"
              checked={animations.smoothScrollEnabled}
              onCheckedChange={(checked: boolean) => setAnimations({ smoothScrollEnabled: checked })}
            />
          </div>

          {animations.smoothScrollEnabled && (
            <SliderInput
              label={t('scrollDamping')}
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
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">{t('entranceAnimation')}</h4>
            {/* T036: [US2] Test button for entrance animations */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsTesting(true)
                // Reset animation state after duration completes
                setTimeout(() => {
                  setIsTesting(false)
                }, animations.entranceDuration)
              }}
              disabled={isTesting}
              className="gap-2"
            >
              <Play size={14} />
              {isTesting ? 'Testing...' : 'Test'}
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm">{t('animationType')}</Label>
            <div className="grid grid-cols-2 gap-2">
              {(['fade-in', 'slide-up', 'scale-in', 'none'] as EntranceAnimation[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setAnimations({ entranceAnimation: type })}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    animations.entranceAnimation === type
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-secondary'
                  }`}
                >
                  {animationTypeMap[type]}
                </button>
              ))}
            </div>
          </div>

          <SliderInput
            label={t('animationDuration')}
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
          <h4 className="text-sm font-medium text-foreground">{t('wordHighlighting')}</h4>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="word-highlight" className="text-sm">{t('enableWordHighlight')}</Label>
            <Checkbox
              id="word-highlight"
              checked={animations.wordHighlightEnabled}
              onCheckedChange={(checked: boolean) => setAnimations({ wordHighlightEnabled: checked })}
            />
          </div>

          {animations.wordHighlightEnabled && (
            <>
              <SliderInput
                label={t('highlightSpeed')}
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
          <h4 className="text-sm font-medium text-foreground">{t('autoScroll')}</h4>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-scroll" className="text-sm">{t('enableAutoScrolling')}</Label>
            <Checkbox
              id="auto-scroll"
              checked={animations.autoScrollEnabled}
              onCheckedChange={(checked: boolean) => setAnimations({ autoScrollEnabled: checked })}
            />
          </div>

          {animations.autoScrollEnabled && (
            <>
              <SliderInput
                label={t('scrollSpeed')}
                value={animations.autoScrollSpeed}
                min={10}
                max={100}
                step={5}
                unit="px/s"
                onChange={(value) => setAnimations({ autoScrollSpeed: value })}
              />

              <SliderInput
                label={t('acceleration')}
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
