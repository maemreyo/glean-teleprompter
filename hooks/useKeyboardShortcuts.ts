import { useEffect, useRef, useCallback } from 'react'
import { useUIStore } from '@/stores/useUIStore'

export interface KeyboardShortcut {
  /** Keys that must be pressed together (e.g., ['ctrl', 'z']) */
  keys: string[]
  /** Human-readable description */
  description: string
  /** Action to execute when shortcut is triggered */
  action: () => void
}

export interface UseKeyboardShortcutsOptions {
  /** Whether keyboard shortcuts are enabled (default: true) */
  enabled?: boolean
  /** Custom shortcuts to register */
  shortcuts?: KeyboardShortcut[]
  /** Whether to track usage statistics (default: true) */
  trackStats?: boolean
}

/**
 * Detects the platform's modifier key (Ctrl or Cmd)
 */
function getPlatformModifierKey(): 'ctrl' | 'meta' {
  if (typeof window === 'undefined') return 'ctrl'
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? 'meta' : 'ctrl'
}

/**
 * Normalizes a keyboard event to a key string
 */
function normalizeKey(event: KeyboardEvent): string {
  const key = event.key.toLowerCase()
  
  // Handle special keys
  if (key === ' ') return 'space'
  if (key === 'escape') return 'esc'
  
  return key
}

/**
 * Checks if a key combination matches a shortcut
 */
function matchesShortcut(
  event: KeyboardEvent,
  keys: string[],
  platformModifier: 'ctrl' | 'meta'
): boolean {
  const pressedKeys: string[] = []

  // Add modifier keys
  if (event.ctrlKey) pressedKeys.push('ctrl')
  if (event.metaKey) pressedKeys.push('meta')
  if (event.altKey) pressedKeys.push('alt')
  if (event.shiftKey) pressedKeys.push('shift')

  // Add the main key
  const mainKey = normalizeKey(event)
  if (
    mainKey !== 'ctrl' &&
    mainKey !== 'meta' &&
    mainKey !== 'alt' &&
    mainKey !== 'shift'
  ) {
    pressedKeys.push(mainKey)
  }

  // Normalize platform modifier in shortcut
  const normalizedShortcut = keys.map((k) =>
    k === 'mod' || k === 'cmd' || k === 'command' ? platformModifier : k.toLowerCase()
  )

  // Check if all required keys are pressed
  const hasAllKeys = normalizedShortcut.every((k) => pressedKeys.includes(k))
  const hasExactKeys = pressedKeys.length === normalizedShortcut.length

  return hasAllKeys && hasExactKeys
}

/**
 * useKeyboardShortcuts - Hook for managing keyboard shortcuts
 * 
 * Features:
 * - Platform-aware (Ctrl on Windows/Linux, Cmd on macOS)
 * - Native event listeners
 * - Usage statistics tracking
 * - Prevents default behavior for registered shortcuts
 * 
 * Built-in shortcuts:
 * - Shift + ?: Open shortcuts modal (tracks modalOpenedCount)
 * - Ctrl/Cmd + Z: Undo
 * - Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z: Redo
 * - Ctrl/Cmd + S: Save
 * - Esc: Exit fullscreen / collapse textarea
 * 
 * @param options - Configuration options
 */
export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const {
    enabled = true,
    shortcuts: customShortcuts = [],
    trackStats = true,
  } = options

  const platformModifier = useRef(getPlatformModifierKey())
  const shortcutsStats = useUIStore((state) => state.shortcutsStats)
  const recordModalOpened = useUIStore((state) => state.recordModalOpened)

  // Track a shortcut usage
  const trackUsage = useCallback(
    (shortcut: string) => {
      if (!trackStats) return
      console.log('[useKeyboardShortcuts] Shortcut used:', shortcut)
    },
    [trackStats]
  )

  // Define built-in shortcuts
  const getBuiltInShortcuts = useCallback(
    (): KeyboardShortcut[] => {
      const mod = platformModifier.current

      return [
        {
          keys: ['shift', '?'],
          description: 'Open keyboard shortcuts',
          action: () => {
            trackUsage(`${mod}+shift+?`)
            recordModalOpened()
            window.dispatchEvent(new CustomEvent('teleprompter:open-shortcuts-modal'))
          },
        },
        {
          keys: [mod, 'z'],
          description: 'Undo',
          action: () => {
            trackUsage(`${mod}+z`)
            // Call useConfigStore's undo action
            // Note: This requires useConfigStore to have undo/redo implemented
            // For now, we'll emit a custom event that can be listened to
            window.dispatchEvent(new CustomEvent('teleprompter:undo'))
          },
        },
        {
          keys: [mod, 'y'],
          description: 'Redo',
          action: () => {
            trackUsage(`${mod}+y`)
            window.dispatchEvent(new CustomEvent('teleprompter:redo'))
          },
        },
        {
          keys: [mod, 'shift', 'z'],
          description: 'Redo (alternate)',
          action: () => {
            trackUsage(`${mod}+shift+z`)
            window.dispatchEvent(new CustomEvent('teleprompter:redo'))
          },
        },
        {
          keys: [mod, 's'],
          description: 'Save',
          action: () => {
            trackUsage(`${mod}+s`)
            event?.preventDefault()
            window.dispatchEvent(new CustomEvent('teleprompter:save'))
          },
        },
        {
          keys: ['esc'],
          description: 'Exit fullscreen / Collapse textarea',
          action: () => {
            trackUsage('esc')
            window.dispatchEvent(new CustomEvent('teleprompter:exit-fullscreen'))
          },
        },
      ]
    },
    [trackUsage]
  )

  // Handle keydown events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow some shortcuts in textareas (like Ctrl+S for save)
        if (
          !matchesShortcut(event, [platformModifier.current, 's'], platformModifier.current)
        ) {
          return
        }
      }

      // Check built-in shortcuts
      const builtInShortcuts = getBuiltInShortcuts()
      for (const shortcut of builtInShortcuts) {
        if (matchesShortcut(event, shortcut.keys, platformModifier.current)) {
          event.preventDefault()
          shortcut.action()
          return
        }
      }

      // Check custom shortcuts
      for (const shortcut of customShortcuts) {
        if (matchesShortcut(event, shortcut.keys, platformModifier.current)) {
          event.preventDefault()
          shortcut.action()
          return
        }
      }
    },
    [enabled, getBuiltInShortcuts, customShortcuts, platformModifier]
  )

  // Set up event listener
  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, handleKeyDown])

  // Update platform modifier on mount
  useEffect(() => {
    platformModifier.current = getPlatformModifierKey()
  }, [])

  return {
    /** Current platform modifier key ('ctrl' or 'meta') */
    platformModifier: platformModifier.current,
    /** Number of sessions recorded */
    sessionsCount: shortcutsStats.sessionsCount,
    /** Number of times shortcuts modal was opened */
    modalOpenedCount: shortcutsStats.modalOpenedCount,
  }
}
