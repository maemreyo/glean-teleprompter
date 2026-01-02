'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Type,
  Palette,
  Sparkles,
  LayoutGrid,
  Wand2,
  FolderOpen,
  Film,
  ChevronRight,
  MoreHorizontal,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConfigStore } from '@/lib/stores/useConfigStore'
import { useTranslations } from 'next-intl'
import { ARIA_LABELS } from '@/lib/a11y/ariaLabels'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import type { TabId } from '@/lib/config/types'
import { TypographyTab } from './typography/TypographyTab'
import { ColorsTab } from './colors/ColorsTab'
import { EffectsTab } from './effects/EffectsTab'
import { LayoutTab } from './layout/LayoutTab'
import { AnimationsTab } from './animations/AnimationsTab'
import { PresetsTab } from './presets/PresetsTab'
import { MediaTab } from './media/MediaTab'
import { TabBottomSheet } from './TabBottomSheet'

interface TabConfig {
  id: TabId
  labelKey: string
  tooltipKey: string
  icon: React.ComponentType<{ className?: string }>
  component: React.ComponentType
}

export const getTabConfig = (t: (key: string) => string): TabConfig[] => [
  {
    id: 'typography',
    labelKey: 'tabs.typography',
    tooltipKey: 'tabTooltips.typography',
    icon: Type,
    component: TypographyTab,
  },
  {
    id: 'colors',
    labelKey: 'tabs.colors',
    tooltipKey: 'tabTooltips.colors',
    icon: Palette,
    component: ColorsTab,
  },
  {
    id: 'effects',
    labelKey: 'tabs.effects',
    tooltipKey: 'tabTooltips.effects',
    icon: Sparkles,
    component: EffectsTab,
  },
  {
    id: 'layout',
    labelKey: 'tabs.layout',
    tooltipKey: 'tabTooltips.layout',
    icon: LayoutGrid,
    component: LayoutTab,
  },
  {
    id: 'animations',
    labelKey: 'tabs.animations',
    tooltipKey: 'tabTooltips.animations',
    icon: Wand2,
    component: AnimationsTab,
  },
  {
    id: 'presets',
    labelKey: 'tabs.presets',
    tooltipKey: 'tabTooltips.presets',
    icon: FolderOpen,
    component: PresetsTab,
  },
  {
    id: 'media',
    labelKey: 'tabs.media',
    tooltipKey: 'tabTooltips.media',
    icon: Film,
    component: MediaTab,
  },
]

export function ConfigTabs() {
  const t = useTranslations('Config')
  const { activeTab, setActiveTab } = useConfigStore()
  const [hoveredTab, setHoveredTab] = useState<TabId | null>(null)
  const tabs = useMemo(() => getTabConfig(t), [t])
  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const tabScrollContainerRef = useRef<HTMLDivElement>(null)

  // T057: Scroll detection state
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)
  
  // T064: Bottom sheet state
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false)

  // T060: Swipe gesture state
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // T065: Tablet viewport detection
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1024px)')

  // T057: Check if tabs overflow viewport
  useEffect(() => {
    const checkOverflow = () => {
      const container = tabScrollContainerRef.current
      if (container) {
        setShowScrollIndicator(container.scrollWidth > container.clientWidth)
      }
    }

    checkOverflow()
    
    // Re-check on window resize
    window.addEventListener('resize', checkOverflow)
    return () => window.removeEventListener('resize', checkOverflow)
  }, [tabs])

  // T060: Handle swipe gesture
  const minSwipeDistance = 50

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }, [])

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe || isRightSwipe) {
      const currentIndex = tabs.findIndex(tab => tab.id === activeTab)
      let newIndex = currentIndex

      if (isLeftSwipe) {
        // Swipe left - go to next tab
        newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0
      } else if (isRightSwipe) {
        // Swipe right - go to previous tab
        newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1
      }

      setActiveTab(tabs[newIndex].id)
    }
  }, [touchStart, touchEnd, tabs, activeTab, setActiveTab, minSwipeDistance])

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

  // T064: Handle tab selection from bottom sheet
  const handleTabSelect = (tabId: TabId) => {
    setActiveTab(tabId)
    setBottomSheetOpen(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* T071: Tab Navigation with horizontally scrollable tab pills */}
      <div
        ref={tabScrollContainerRef}
        role="tablist"
        aria-label={t('tabUI.ariaLabel')}
        className={cn(
          'relative flex border-b border-border overflow-x-auto',
          // T065: Wrap tabs on tablet viewport
          isTablet && showScrollIndicator && 'flex-wrap',
          // T071: Hide scrollbars for horizontal tab pills on mobile
          'scrollbar-hide',
          // T071: Enable horizontal scrolling on mobile
          'snap-x snap-mandatory'
        )}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {tabs.map((tab, index) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          const isHovered = hoveredTab === tab.id
          const label = t(tab.labelKey)
          const tooltip = t(tab.tooltipKey)

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
              title={tooltip}
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

        {/* T061: "More" button for bottom sheet */}
        {showScrollIndicator && (
          <button
            onClick={() => setBottomSheetOpen(true)}
            className={cn(
              'flex items-center gap-2 px-3 py-3 text-sm font-medium transition-colors',
              'border-b-2 -mb-px border-transparent text-muted-foreground hover:text-foreground',
              'md:hidden'
            )}
            aria-label={t('tabUI.showAllTabs')}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        )}

        {/* T058 & T059: Gradient fade overlay with chevron indicator */}
        <AnimatePresence>
          {showScrollIndicator && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none flex items-center justify-end pr-2"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {ActiveComponent ? <ActiveComponent /> : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {t('selectTab')}
          </div>
        )}
      </div>

      {/* T062-T064: TabBottomSheet component */}
      <TabBottomSheet
        isOpen={bottomSheetOpen}
        onClose={() => setBottomSheetOpen(false)}
        tabs={tabs}
        activeTab={activeTab}
        onTabSelect={handleTabSelect}
        t={t}
      />
    </div>
  )
}
