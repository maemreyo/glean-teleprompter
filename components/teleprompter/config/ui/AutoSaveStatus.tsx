"use client"

import React from 'react'
import { Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils/formatRelativeTime'

export interface AutoSaveStatusProps {
  /** Current auto-save status */
  status: 'idle' | 'saving' | 'saved' | 'error'
  /** Timestamp when last save occurred (for 'saved' status) */
  lastSavedAt?: number
  /** Error message to display when status is 'error' */
  errorMessage?: string
  /** Optional retry callback for error state */
  onRetry?: () => void
  /** Additional CSS classes */
  className?: string
}

/**
 * AutoSaveStatus - Displays auto-save status with icons and timestamps
 * 
 * Shows:
 * - Spinner when saving
 * - Checkmark with relative time when saved
 * - Error icon with retry button when error
 */
export function AutoSaveStatus({
  status,
  lastSavedAt,
  errorMessage,
  onRetry,
  className,
}: AutoSaveStatusProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'saving':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'saved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'idle':
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'saving':
        return 'Saving...'
      case 'saved':
        return `Saved ${formatRelativeTime(lastSavedAt ?? null)}`
      case 'error':
        return errorMessage || 'Failed to save'
      case 'idle':
      default:
        return null
    }
  }

  const getContainerClass = () => {
    switch (status) {
      case 'saving':
        return 'text-blue-500'
      case 'saved':
        return 'text-green-500'
      case 'error':
        return 'text-red-500'
      default:
        return 'text-muted-foreground'
    }
  }

  if (status === 'idle') {
    return null
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-xs font-medium transition-all duration-300',
        getContainerClass(),
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex-shrink-0 transition-all duration-300">
        {getStatusIcon()}
      </div>
      
      <span className="truncate transition-opacity duration-200">
        {getStatusText()}
      </span>

      {status === 'error' && onRetry && (
        <button
          onClick={onRetry}
          className="flex-shrink-0 p-1 hover:bg-red-500/10 rounded transition-colors"
          aria-label="Retry save"
          title="Retry save"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}
