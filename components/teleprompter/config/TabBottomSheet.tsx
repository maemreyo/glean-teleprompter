'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type TabId = 'typography' | 'colors' | 'effects' | 'layout' | 'animations' | 'presets' | 'media'

interface TabConfig {
  id: TabId
  labelKey: string
  icon: React.ComponentType<{ className?: string }>
  component: React.ComponentType
}

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
