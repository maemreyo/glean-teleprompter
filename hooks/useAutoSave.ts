import { useState, useEffect, useRef, useCallback } from 'react'
import { useUIStore } from '@/stores/useUIStore'

export interface UseAutoSaveOptions {
  /** Interval in milliseconds between auto-save attempts (default: 5000ms) */
  interval?: number
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean
  /** Custom storage key (default: 'teleprompter_draft') */
  storageKey?: string
  /** Debounce delay in milliseconds (default: 1000ms) */
  debounceMs?: number
}

export interface UseAutoSaveReturn {
  /** Current auto-save status */
  status: 'idle' | 'saving' | 'saved' | 'error'
  /** Timestamp of last successful save */
  lastSavedAt: number | null
  /** Error message if save failed */
  error: string | null
  /** Manually trigger a save */
  saveNow: () => Promise<void>
}

/**
 * useAutoSave - Hook for auto-saving data to localStorage
 * 
 * Features:
 * - Debounced saves to avoid excessive writes
 * - requestIdleCallback for non-blocking saves
 * - QuotaExceededError handling
 * - Status tracking via useUIStore
 * 
 * @param data - Data to save (any serializable object)
 * @param options - Configuration options
 * @returns Auto-save status and controls
 */
export function useAutoSave<T extends Record<string, any>>(
  data: T,
  options: UseAutoSaveOptions = {}
): UseAutoSaveReturn {
  const {
    interval = 5000,
    enabled = true,
    storageKey = 'teleprompter_draft',
    debounceMs = 1000,
  } = options

  const setAutoSaveStatus = useUIStore((state) => state.setAutoSaveStatus)

  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastDataRef = useRef<string>(JSON.stringify(data))
  const isMountedRef = useRef(true)

  /**
   * Perform the actual save operation
   */
  const performSave = useCallback(
    async (dataToSave: T): Promise<void> => {
      if (!isMountedRef.current) return

      setStatus('saving')
      setError(null)
      setAutoSaveStatus({ status: 'saving' })

      try {
        // Use requestIdleCallback for non-blocking save if available
        const saveOperation = () => {
          return new Promise<void>((resolve, reject) => {
            const saveData = () => {
              try {
                if (typeof window !== 'undefined') {
                  localStorage.setItem(storageKey, JSON.stringify(dataToSave))
                }
                resolve()
              } catch (err) {
                reject(err)
              }
            }

            // Check if requestIdleCallback is available
            if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
              ;(window as any).requestIdleCallback(
                () => {
                  saveData()
                },
                { timeout: 2000 }
              )
            } else {
              // Fallback to immediate save
              saveData()
            }
          })
        }

        await saveOperation()

        if (!isMountedRef.current) return

        const now = Date.now()
        setStatus('saved')
        setLastSavedAt(now)
        setError(null)
        setAutoSaveStatus({
          status: 'saved',
          lastSavedAt: now,
          errorMessage: undefined,
        })
      } catch (err) {
        if (!isMountedRef.current) return

        // Handle QuotaExceededError specifically
        const isQuotaError =
          err instanceof DOMException && err.name === 'QuotaExceededError'
        const errorMessage = isQuotaError
          ? 'Storage full. Some browsers limit storage. Try saving to your account instead.'
          : err instanceof Error
          ? err.message
          : 'Unknown error occurred'

        setStatus('error')
        setError(errorMessage)
        setAutoSaveStatus({
          status: 'error',
          errorMessage,
        })

        console.error('[useAutoSave] Save failed:', err)
      }
    },
    [storageKey, setAutoSaveStatus]
  )

  /**
   * Manually trigger a save
   */
  const saveNow = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    await performSave(data)
  }, [data, performSave])

  /**
   * Debounced save trigger
   */
  const triggerSave = useCallback(() => {
    if (!enabled) return

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      performSave(data)
    }, debounceMs)
  }, [data, enabled, debounceMs, performSave])

  // Watch for data changes and trigger debounced save
  useEffect(() => {
    const currentDataString = JSON.stringify(data)
    if (currentDataString !== lastDataRef.current) {
      lastDataRef.current = currentDataString
      triggerSave()
    }
  }, [data, triggerSave])

  // Set up periodic saves
  useEffect(() => {
    if (!enabled) return

    // Set up interval save
    saveTimerRef.current = setInterval(() => {
      performSave(data)
    }, interval)

    return () => {
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current)
      }
    }
  }, [data, interval, enabled, performSave])

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current)
      }
    }
  }, [])

  return {
    status,
    lastSavedAt,
    error,
    saveNow,
  }
}
