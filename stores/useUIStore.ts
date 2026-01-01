import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  PanelState,
  TextareaScaleState,
  FooterState as ConfigFooterState,
} from '@/lib/config/types'
import { TEXTAREA_SCALE_MULTIPLIERS } from '@/lib/config/types'

// ==================== Interfaces from data-model.md ====================

/**
 * Auto-save status tracking
 */
export interface AutoSaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error'
  lastSavedAt?: number
  errorMessage?: string
  retryCount?: number
}

/**
 * Textarea user preferences
 */
export interface TextareaPreferences {
  size: 'default' | 'medium' | 'large' | 'fullscreen' | 'custom'
  customHeight?: number
  isFullscreen: boolean
}

/**
 * Footer state management (legacy - for backward compatibility)
 * @deprecated Use ConfigFooterState from @/lib/config/types for new features
 */
export interface FooterState {
  isCollapsed: boolean
  collapsedSince?: number
}

// Re-export for convenience
export type { ConfigFooterState }

/**
 * Preview panel state for mobile/tablet
 */
export interface PreviewPanelState {
  isOpen: boolean
  lastToggledAt?: number
}

/**
 * Keyboard shortcuts statistics for discoverability
 */
export interface KeyboardShortcutsStats {
  sessionsCount: number
  modalOpenedCount: number
  tipsShown: string[]
  lastSessionAt?: number
}

/**
 * Error context for contextual error messages
 */
export interface ErrorContext {
  type: 'network' | 'not_found' | 'permission' | 'quota' | 'unknown'
  message: string
  details?: string
  timestamp: number
  action?: 'retry' | 'browse_templates' | 'sign_up' | 'copy_error' | 'none'
}

// ==================== Default Values ====================

const DEFAULT_TEXTAREA_PREFS: TextareaPreferences = {
  size: 'default',
  isFullscreen: false,
}

const DEFAULT_FOOTER_STATE: FooterState = {
  isCollapsed: false,
}

const DEFAULT_PREVIEW_STATE: PreviewPanelState = {
  isOpen: false,
}

const DEFAULT_SHORTCUTS_STATS: KeyboardShortcutsStats = {
  sessionsCount: 0,
  modalOpenedCount: 0,
  tipsShown: [],
}

const DEFAULT_AUTOSAVE_STATUS: AutoSaveStatus = {
  status: 'idle',
}

// ==================== localStorage Helpers ====================

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window === 'undefined') return defaultValue
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch (error) {
    console.warn(`Failed to load ${key} from localStorage:`, error)
    return defaultValue
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    if (typeof window === 'undefined') return
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`Failed to save ${key} to localStorage:`, error)
  }
}

// ==================== Main UI Store Interface ====================

interface UIStore {
  // State
  textareaPrefs: TextareaPreferences
  footerState: FooterState
  previewState: PreviewPanelState
  shortcutsStats: KeyboardShortcutsStats
  autoSaveStatus: AutoSaveStatus
  errorContext: ErrorContext | null

  // T008: Phase 2 - Configuration Panel UI/UX state
  panelState: PanelState
  textareaScale: TextareaScaleState
  configFooterState: ConfigFooterState

  // Textarea actions
  setTextareaPrefs: (prefs: Partial<TextareaPreferences>) => void
  toggleTextareaSize: () => void

  // Footer actions
  setFooterState: (state: Partial<FooterState>) => void
  toggleFooter: () => void

  // Preview panel actions
  setPreviewState: (state: Partial<PreviewPanelState>) => void
  togglePreview: () => void

  // Keyboard shortcuts actions
  incrementSessionsCount: () => void
  recordModalOpened: () => void
  markTipShown: (tip: string) => void

  // Auto-save actions
  setAutoSaveStatus: (status: Partial<AutoSaveStatus>) => void

  // Error context actions
  setErrorContext: (error: ErrorContext | null) => void
  clearError: () => void

  // T009: Phase 2 - Panel visibility actions
  setPanelVisible: (visible: boolean, isAnimating?: boolean) => void
  togglePanel: () => void

  // T010: Phase 2 - Textarea scale action
  setTextareaSize: (size: 'compact' | 'medium' | 'large') => void

  // T011: Phase 2 - Config footer actions
  setConfigFooterVisible: (visible: boolean, height?: number) => void
  toggleConfigFooterCollapsed: () => void
}

// ==================== Create the UI Store ====================

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // ==================== Initial State ====================
      textareaPrefs: DEFAULT_TEXTAREA_PREFS,
      footerState: DEFAULT_FOOTER_STATE,
      previewState: DEFAULT_PREVIEW_STATE,
      shortcutsStats: DEFAULT_SHORTCUTS_STATS,
      autoSaveStatus: DEFAULT_AUTOSAVE_STATUS,
      errorContext: null,

      // T025: Phase 2 - Configuration Panel UI/UX initial state
      // Panel hidden by default on mobile/tablet (< 1024px), visible on desktop
      panelState: {
        visible: typeof window !== 'undefined' && window.innerWidth >= 1024,
        isAnimating: false,
        lastToggled: null,
      },
      textareaScale: {
        size: 'medium',
        scale: TEXTAREA_SCALE_MULTIPLIERS.medium,
      },
      configFooterState: {
        visible: true,
        collapsed: false,
        height: 60, // Default footer height in pixels
      },

      // ==================== Textarea Actions ====================
      setTextareaPrefs: (prefs) => {
        set((state) => {
          const updated = { ...state.textareaPrefs, ...prefs }
          saveToStorage('teleprompter_textarea_prefs', updated)
          return { textareaPrefs: updated }
        })
      },

      toggleTextareaSize: () => {
        set((state) => {
          const sizeOrder: Array<'default' | 'medium' | 'large' | 'fullscreen'> = [
            'default',
            'medium',
            'large',
            'fullscreen',
          ]
          // Skip toggle if in custom mode, reset to default
          const currentSize = state.textareaPrefs.size
          const startIndex = currentSize === 'custom' ? 0 : sizeOrder.indexOf(currentSize)
          const nextSize = sizeOrder[(startIndex + 1) % sizeOrder.length]
          const updated = {
            ...state.textareaPrefs,
            size: nextSize,
            isFullscreen: nextSize === 'fullscreen',
            customHeight: undefined,
          }
          saveToStorage('teleprompter_textarea_prefs', updated)
          return { textareaPrefs: updated }
        })
      },

      // ==================== Footer Actions ====================
      setFooterState: (footerState) => {
        set((state) => {
          const updated = { ...state.footerState, ...footerState }
          saveToStorage('teleprompter_footer_state', updated)
          return { footerState: updated }
        })
      },

      toggleFooter: () => {
        set((state) => {
          const isCollapsed = !state.footerState.isCollapsed
          const updated = {
            ...state.footerState,
            isCollapsed,
            collapsedSince: isCollapsed ? Date.now() : undefined,
          }
          saveToStorage('teleprompter_footer_state', updated)
          return { footerState: updated }
        })
      },

      // ==================== Preview Panel Actions ====================
      setPreviewState: (previewState) => {
        set((state) => {
          const updated = { ...state.previewState, ...previewState }
          saveToStorage('teleprompter_preview_state', updated)
          return { previewState: updated }
        })
      },

      togglePreview: () => {
        set((state) => {
          const isOpen = !state.previewState.isOpen
          const updated = {
            ...state.previewState,
            isOpen,
            lastToggledAt: Date.now(),
          }
          saveToStorage('teleprompter_preview_state', updated)
          return { previewState: updated }
        })
      },

      // ==================== Keyboard Shortcuts Actions ====================
      incrementSessionsCount: () => {
        set((state) => {
          const updated = {
            ...state.shortcutsStats,
            sessionsCount: state.shortcutsStats.sessionsCount + 1,
            lastSessionAt: Date.now(),
          }
          saveToStorage('teleprompter_shortcuts_stats', updated)
          return { shortcutsStats: updated }
        })
      },

      recordModalOpened: () => {
        set((state) => {
          const updated = {
            ...state.shortcutsStats,
            modalOpenedCount: state.shortcutsStats.modalOpenedCount + 1,
          }
          saveToStorage('teleprompter_shortcuts_stats', updated)
          return { shortcutsStats: updated }
        })
      },

      markTipShown: (tip) => {
        set((state) => {
          if (state.shortcutsStats.tipsShown.includes(tip)) {
            return state
          }
          const updated = {
            ...state.shortcutsStats,
            tipsShown: [...state.shortcutsStats.tipsShown, tip],
          }
          saveToStorage('teleprompter_shortcuts_stats', updated)
          return { shortcutsStats: updated }
        })
      },

      // ==================== Auto-Save Actions ====================
      setAutoSaveStatus: (status) => {
        set((state) => ({
          autoSaveStatus: { ...state.autoSaveStatus, ...status },
        }))
      },

      // ==================== Error Context Actions ====================
      setErrorContext: (errorContext) => {
        set({ errorContext })
      },

      clearError: () => {
        set({ errorContext: null })
      },

      // ==================== T009: Panel Visibility Actions ====================
      setPanelVisible: (visible, isAnimating = false) => {
        set((state) => ({
          panelState: {
            ...state.panelState,
            visible,
            isAnimating,
            lastToggled: visible ? Date.now() : state.panelState.lastToggled,
          },
        }))
      },

      // T024: Debounce togglePanel to prevent animation glitches (150ms debounce)
      togglePanel: () => {
        set((state) => {
          const now = Date.now()
          const lastToggled = state.panelState.lastToggled || 0
          const debounceMs = 150
          
          // Prevent rapid toggle clicks within debounce period
          if (now - lastToggled < debounceMs) {
            return state
          }
          
          const newVisible = !state.panelState.visible
          return {
            panelState: {
              visible: newVisible,
              isAnimating: true, // Start animation
              lastToggled: now,
            },
          }
        })
      },

      // ==================== T010: Textarea Scale Action ====================
      setTextareaSize: (size) => {
        set((state) => {
          const scale = TEXTAREA_SCALE_MULTIPLIERS[size]
          return {
            textareaScale: {
              size,
              scale,
            },
          }
        })
      },

      // ==================== T011: Config Footer Actions ====================
      setConfigFooterVisible: (visible, height) => {
        set((state) => ({
          configFooterState: {
            ...state.configFooterState,
            visible,
            height: height ?? state.configFooterState.height,
          },
        }))
      },

      toggleConfigFooterCollapsed: () => {
        set((state) => {
          const newCollapsed = !state.configFooterState.collapsed
          return {
            configFooterState: {
              ...state.configFooterState,
              collapsed: newCollapsed,
              height: newCollapsed ? 24 : 60, // Collapsed vs expanded height
            },
          }
        })
      },
    }),
    {
      name: 'teleprompter-ui-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        textareaPrefs: state.textareaPrefs,
        footerState: state.footerState,
        previewState: state.previewState,
        shortcutsStats: state.shortcutsStats,
        // T008: Persist new state properties
        panelState: state.panelState,
        textareaScale: state.textareaScale,
        configFooterState: state.configFooterState,
      }),
    }
  )
)
