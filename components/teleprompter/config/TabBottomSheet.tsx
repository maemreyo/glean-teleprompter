'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TabId } from '@/lib/config/types'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useConfigStore } from '@/lib/stores/useConfigStore'
import { ConfigTabs } from './ConfigTabs'

interface TabConfig {
  id: TabId
  labelKey: string
  icon: React.ComponentType<{ className?: string }>
  component: React.ComponentType
}

interface MobileConfigPanelProps {
  isOpen: boolean
  onClose: () => void
  tabs: TabConfig[]
  activeTab: TabId
  onTabSelect: (tabId: TabId) => void
  t: (key: string) => string
}

/**
 * MobileConfigPanel - Touch-optimized bottom sheet for mobile configuration
 *
 * T069-T078: [US5] Mobile-optimized configuration interface
 * - 90% height bottom sheet on mobile portrait
 * - 50% width panel in landscape mode
 * - Swipe-to-close with 100px threshold
 * - 48px minimum touch targets
 * - "Done" button to close
 * - Compact layout for < 375px devices
 */
export function MobileConfigPanel({
  isOpen,
  onClose,
  tabs,
  activeTab,
  onTabSelect,
  t,
}: MobileConfigPanelProps) {
  // T069: Mobile detection
  const isMobile = useMediaQuery('(max-width: 1023px)')
  const isLandscape = useMediaQuery('(orientation: landscape) and (max-height: 600px)')
  const isSmallScreen = useMediaQuery('(max-width: 374px)')
  
  // T075: Swipe-to-close gesture state
  const [dragY, setDragY] = useState(0)
  const constraintsRef = useRef<HTMLDivElement>(null)
  const y = useMotionValue(0)
  
  // T075: Close threshold for swipe gesture (100px)
  const SWIPE_CLOSE_THRESHOLD = 100
  
  // T075: Handle drag end for swipe-to-close
  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.y
    const velocity = info.velocity.y
    
    // Close if dragged down more than threshold or with high velocity
    if (offset > SWIPE_CLOSE_THRESHOLD || velocity > 500) {
      onClose()
    }
  }, [onClose])
  
  // Transform y value for opacity during drag
  const opacity = useTransform(y, [0, 200], [1, 0])

  // Don't render on desktop
  if (!isMobile) {
    return null
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay with blur effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* T069-T078: Bottom sheet with full config content */}
          <motion.div
            ref={constraintsRef}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ y, opacity }}
            initial={{ y: '100%' }}
            animate={{ y: dragY > 0 ? dragY : 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
            }}
            className={cn(
              'fixed z-50 bg-card shadow-2xl overflow-hidden flex flex-col',
              // T077: Landscape split view - 50% width, right side
              isLandscape
                ? 'top-0 bottom-0 right-0 w-1/2 max-w-md rounded-l-2xl'
                : 'bottom-0 left-0 right-0 rounded-t-2xl',
              // T070: 90% height on portrait mobile
              !isLandscape && 'max-h-[90vh]'
            )}
          >
            {/* T070: Drag handle at top */}
            <div className="flex justify-center py-3 border-b border-border touch-none">
              <div className="w-12 h-1.5 bg-muted rounded-full" />
            </div>

            {/* T070: Header */}
            <div className={cn(
              "flex items-center justify-between border-b border-border",
              // T078: Compact layout for small screens
              isSmallScreen ? "px-3 py-2" : "px-4 py-3"
            )}>
              <h2 className={cn(
                "font-semibold text-foreground",
                isSmallScreen ? "text-base" : "text-lg"
              )}>
                {t('title') || 'Configuration'}
              </h2>
              {/* T076: Done button with 48px minimum touch target */}
              <button
                onClick={onClose}
                className={cn(
                  'px-4 py-3 rounded-lg transition-colors',
                  'bg-primary text-primary-foreground font-medium',
                  'hover:bg-primary/90 active:bg-primary/80',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  'min-h-[48px] min-w-[48px]'
                )}
                aria-label="Done"
              >
                {t('done') || 'Done'}
              </button>
            </div>

            {/* T069: Full ConfigTabs component for all configuration options */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <ConfigTabs />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/**
 * TabBottomSheet - Tab selector sheet (legacy, kept for backward compatibility)
 * This component is used for quick tab selection, not for full config panel
 */
interface TabBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  tabs: TabConfig[]
  activeTab: TabId
  onTabSelect: (tabId: TabId) => void
  t: (key: string) => string
}

export function TabBottomSheet({
  isOpen,
  onClose,
  tabs,
  activeTab,
  onTabSelect,
  t,
}: TabBottomSheetProps) {
  // T075: Swipe-to-close gesture state
  const y = useMotionValue(0)
  const SWIPE_CLOSE_THRESHOLD = 100
  
  // T075: Handle drag end for swipe-to-close
  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.y
    const velocity = info.velocity.y
    
    // Close if dragged down more than threshold or with high velocity
    if (offset > SWIPE_CLOSE_THRESHOLD || velocity > 500) {
      onClose()
    }
  }, [onClose])
  
  // Transform y value for opacity during drag
  const opacity = useTransform(y, [0, 200], [1, 0])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay with blur effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Bottom sheet */}
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ y, opacity }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
            }}
            className={cn(
              'fixed bottom-0 left-0 right-0 z-50',
              'bg-card rounded-t-2xl shadow-2xl',
              'max-h-[60vh] overflow-hidden',
              'flex flex-col'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">{t('allTabs')}</h2>
              <button
                onClick={onClose}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  'hover:bg-muted',
                  'focus:outline-none focus:ring-2 focus:ring-primary'
                )}
                aria-label="Close tab selector"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* T063: 2-column grid layout for all tabs */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-3">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  const label = t(tab.labelKey)

                  return (
                    <button
                      key={tab.id}
                      onClick={() => onTabSelect(tab.id)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-lg transition-all',
                        'hover:bg-muted/50 hover:scale-105',
                        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                        isActive
                          ? 'bg-primary/10 border-2 border-primary'
                          : 'border-2 border-border'
                      )}
                      aria-label={`${label} tab, ${tabs.findIndex(t => t.id === tab.id) + 1} of ${tabs.length}`}
                      aria-pressed={isActive}
                    >
                      <Icon
                        className={cn(
                          'w-6 h-6 transition-colors',
                          isActive ? 'text-primary' : 'text-muted-foreground'
                        )}
                      />
                      <span className={cn(
                        'text-sm font-medium text-center',
                        isActive ? 'text-primary' : 'text-foreground'
                      )}>
                        {label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Handle bar for visual indication */}
            <div className="flex justify-center py-2 border-t border-border">
              <div className="w-12 h-1.5 bg-muted rounded-full" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
