'use client'

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConfigStore } from '@/lib/stores/useConfigStore'
import { ConfigTabs } from './ConfigTabs'

export function ConfigPanel() {
  const { isPanelOpen, togglePanel } = useConfigStore()
  
  return (
    <>
      {/* Backdrop */}
      {isPanelOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 transition-opacity"
          onClick={togglePanel}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar Panel */}
      <aside
        className={cn(
          'fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 shadow-xl z-50',
          'transition-transform duration-300 ease-in-out',
          isPanelOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Configuration
          </h2>
          <button
            onClick={togglePanel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close panel"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        
        {/* Tabs */}
        <ConfigTabs />
      </aside>
    </>
  )
}
