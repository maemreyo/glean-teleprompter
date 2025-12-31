'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Cloud, CloudOff, RefreshCw } from 'lucide-react'

export function SyncControls() {
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced')
  const [isOnline] = useState(true)

  const handleSync = async () => {
    setSyncStatus('syncing')
    try {
      // Simulate sync - in real implementation, call Supabase API
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSyncStatus('synced')
    } catch {
      setSyncStatus('error')
    }
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div className="flex items-center gap-2">
        {isOnline ? (
          <Cloud className="w-4 h-4 text-green-500" />
        ) : (
          <CloudOff className="w-4 h-4 text-gray-400" />
        )}
        <div>
          <p className="text-sm font-medium">
            {syncStatus === 'synced' && 'All presets synced'}
            {syncStatus === 'syncing' && 'Syncing...'}
            {syncStatus === 'error' && 'Sync failed'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isOnline ? 'Connected to cloud' : 'Offline mode'}
          </p>
        </div>
      </div>
      
      {isOnline && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleSync}
          disabled={syncStatus === 'syncing'}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
          Sync
        </Button>
      )}
    </div>
  )
}
