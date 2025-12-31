'use client'

import { useState } from 'react'
import {
  Type,
  Palette,
  Sparkles,
  LayoutGrid,
  Wand2,
  FolderOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConfigStore } from '@/lib/stores/useConfigStore'
import { useTranslations } from 'next-intl'
import { TypographyTab } from './typography/TypographyTab'
import { ColorsTab } from './colors/ColorsTab'
import { EffectsTab } from './effects/EffectsTab'
import { LayoutTab } from './layout/LayoutTab'
import { AnimationsTab } from './animations/AnimationsTab'
import { PresetsTab } from './presets/PresetsTab'

type TabId = 'typography' | 'colors' | 'effects' | 'layout' | 'animations' | 'presets'

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
]

export function ConfigTabs() {
  const t = useTranslations('Config')
  const { activeTab, setActiveTab } = useConfigStore()
  const [hoveredTab, setHoveredTab] = useState<TabId | null>(null)
  
  const tabs = getTabConfig(t)
  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component
  
  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          const isHovered = hoveredTab === tab.id
          const label = t(tab.labelKey)
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap',
                'border-b-2 -mb-px',
                isActive
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              )}
              aria-label={`Switch to ${label} tab`}
              aria-selected={isActive}
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
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            {t('selectTab')}
          </div>
        )}
      </div>
    </div>
  )
}
