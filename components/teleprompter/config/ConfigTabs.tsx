'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Type,
  Palette,
  Sparkles,
  LayoutGrid,
  Wand2,
  FolderOpen,
  Film,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConfigStore } from '@/lib/stores/useConfigStore'
import { useTranslations } from 'next-intl'
import { ARIA_LABELS } from '@/lib/a11y/ariaLabels'
import { TypographyTab } from './typography/TypographyTab'
import { ColorsTab } from './colors/ColorsTab'
import { EffectsTab } from './effects/EffectsTab'
import { LayoutTab } from './layout/LayoutTab'
import { AnimationsTab } from './animations/AnimationsTab'
import { PresetsTab } from './presets/PresetsTab'
import { MediaTab } from './media/MediaTab'

type TabId = 'typography' | 'colors' | 'effects' | 'layout' | 'animations' | 'presets' | 'media'

interface TabConfig {
  id: TabId
  labelKey: string
  icon: React.ComponentType<{ className?: string }>
  component: React.ComponentType
}

const getTabConfig = (t: (key: string) => string): TabConfig[] => [
  {
    id: 'typography',
    labelKey: 'tabs.typography',
    icon: Type,
    component: TypographyTab,
  },
  {
    id: 'colors',
    labelKey: 'tabs.colors',
    icon: Palette,
    component: ColorsTab,
  },
  {
    id: 'effects',
    labelKey: 'tabs.effects',
    icon: Sparkles,
    component: EffectsTab,
  },
  {
    id: 'layout',
    labelKey: 'tabs.layout',
    icon: LayoutGrid,
    component: LayoutTab,
  },
  {
    id: 'animations',
    labelKey: 'tabs.animations',
    icon: Wand2,
    component: AnimationsTab,
  },
  {
    id: 'presets',
    labelKey: 'tabs.presets',
    icon: FolderOpen,
    component: PresetsTab,
  },
  {
    id: 'media',
    labelKey: 'tabs.media',
    icon: Film,
    component: MediaTab,
  },
]

export function ConfigTabs() {
  const t = useTranslations('Config')
  const { activeTab, setActiveTab } = useConfigStore()
  const [hoveredTab, setHoveredTab] = useState<TabId | null>(null)
  const tabs = getTabConfig(t)
  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Handle arrow key navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab)
    let newIndex = currentIndex

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1
        break
      case 'ArrowRight':
        e.preventDefault()
        newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0
        break
      case 'Home':
        e.preventDefault()
        newIndex = 0
        break
      case 'End':
        e.preventDefault()
        newIndex = tabs.length - 1
        break
      default:
        return
    }

    setActiveTab(tabs[newIndex].id)
    // Focus the new tab
    tabRefs.current[newIndex]?.focus()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div role="tablist" aria-label="Configuration tabs" className="flex border-b border-border overflow-x-auto">
        {tabs.map((tab, index) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          const isHovered = hoveredTab === tab.id
          const label = t(tab.labelKey)

          return (
            <button
              key={tab.id}
              ref={(el) => { tabRefs.current[index] = el }}
              onClick={() => setActiveTab(tab.id)}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap',
                'border-b-2 -mb-px',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
              aria-label={ARIA_LABELS.configTab(label, index, tabs.length)}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              role="tab"
            >
              <Icon
                className={cn(
                  'w-4 h-4 transition-transform',
                  isHovered && !isActive && 'scale-110'
                )}
              />
              <span className="hidden sm:inline">{label}</span>
            </button>
          )
        })}
      </div>
      
      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {ActiveComponent ? <ActiveComponent /> : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {t('selectTab')}
          </div>
        )}
      </div>
    </div>
  )
}
