import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Auto-save status tracking
export interface AutoSaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error'
  lastSavedAt: number | null
  errorMessage: string | null
}

// Textarea user preferences
export interface TextareaPreferences {
  height: number // Current height in pixels
  isFullscreen: boolean // Whether in fullscreen mode
  expandedState: 'compact' | 'medium' | 'large' | 'fullscreen' // Height preset
}

// Footer state management
export interface FooterState {
  isCollapsed: boolean // Whether footer is minimized
  isVisible: boolean // Whether footer is visible at all
}

// Preview panel state for mobile/tablet
export interface PreviewPanelState {
  isOpen: boolean // Whether preview panel is open
  position: 'bottom' | 'right' // Bottom for mobile, right for tablet
  height: number // Height in pixels (for bottom sheet)
  width: number // Width in pixels (for right panel)
}

// Keyboard shortcuts statistics for discoverability
export interface KeyboardShortcutsStats {
  totalShortcutsUsed: number
  shortcutUsageCounts: Record<string, number> // e.g., { 'ctrl+z': 5, 'ctrl+s': 10 }
  lastUsedShortcut: string | null
  showShortcutsModal: boolean
  showInlineHint: boolean
}

// Error context for contextual error messages
export interface ErrorContext {
  type: 'network' | 'not_found' | 'permission' | 'quota' | 'unknown'
  message: string
  action: 'retry' | 'browse_templates' | 'sign_up' | 'none'
  details: string
  timestamp: number
}

// Main UI Store interface
interface UIStore {
  // Auto-save status
  autoSaveStatus: AutoSaveStatus
  
  // Textarea preferences
  textareaPrefs: TextareaPreferences
  
  // Footer state
  footerState: FooterState
  
  // Preview panel state
  previewState: PreviewPanelState
  
  // Keyboard shortcuts stats
  keyboardShortcutsStats: KeyboardShortcutsStats
  
  // Error context
  errorContext: ErrorContext | null
  
  // Actions - Auto-save
  setAutoSaveStatus: (status: AutoSaveStatus) => void
  updateAutoSaveStatus: (status: AutoSaveStatus['status'], error?: string) => void
  
  // Actions - Textarea
  setTextareaPrefs: (prefs: Partial<TextareaPreferences>) => void
  setTextareaHeight: (height: number) => void
  setTextareaExpandedState: (state: TextareaPreferences['expandedState']) => void
  toggleFullscreen: () => void
  
  // Actions - Footer
  setFooterState: (state: Partial<FooterState>) => void
  toggleFooter: () => void
  
  // Actions - Preview panel
  setPreviewState: (state: Partial<PreviewPanelState>) => void
  togglePreview: () => void
  openPreview: () => void
  closePreview: () => void
  
  // Actions - Keyboard shortcuts
  setKeyboardShortcutsStats: (stats: Partial<KeyboardShortcutsStats>) => void
  trackShortcutUsage: (shortcut: string) => void
  setShowShortcutsModal: (show: boolean) => void
  setShowInlineHint: (show: boolean) => void
  
  // Actions - Error context
  setErrorContext: (error: ErrorContext | null) => void
  clearError: () => void
}

// Initial state values
const initialAutoSaveStatus: AutoSaveStatus = {
  status: 'idle',
  lastSavedAt: null,
  errorMessage: null,
}

const initialTextareaPrefs: TextareaPreferences = {
  height: 128,
  isFullscreen: false,
  expandedState: 'compact',
}

const initialFooterState: FooterState = {
  isCollapsed: false,
  isVisible: true,
}

const initialPreviewState: PreviewPanelState = {
  isOpen: false,
  position: 'bottom',
  height: 0,
  width: 0,
}

const initialKeyboardShortcutsStats: KeyboardShortcutsStats = {
  totalShortcutsUsed: 0,
  shortcutUsageCounts: {},
  lastUsedShortcut: null,
  showShortcutsModal: false,
  showInlineHint: false,
}

// Create the UI store with persist middleware
export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // Initial state
      autoSaveStatus: initialAutoSaveStatus,
      textareaPrefs: initialTextareaPrefs,
      footerState: initialFooterState,
      previewState: initialPreviewState,
      keyboardShortcutsStats: initialKeyboardShortcutsStats,
      errorContext: null,
      
      // Auto-save actions
      setAutoSaveStatus: (status) => set({ autoSaveStatus: status }),
      
      updateAutoSaveStatus: (status, error) => set((state) => ({
        autoSaveStatus: {
          status,
          lastSavedAt: status === 'saved' ? Date.now() : state.autoSaveStatus.lastSavedAt,
          errorMessage: error ?? null,
        },
      })),
      
      // Textarea actions
      setTextareaPrefs: (prefs) => set((state) => ({
        textareaPrefs: { ...state.textareaPrefs, ...prefs },
      })),
      
      setTextareaHeight: (height) => set((state) => ({
        textareaPrefs: { ...state.textareaPrefs, height },
      })),
      
      setTextareaExpandedState: (expandedState) => set((state) => ({
        textareaPrefs: {
          ...state.textareaPrefs,
          expandedState,
          height: expandedState === 'compact' ? 128 : expandedState === 'medium' ? 300 : expandedState === 'large' ? 500 : window.innerHeight,
          isFullscreen: expandedState === 'fullscreen',
        },
      })),
      
      toggleFullscreen: () => set((state) => ({
        textareaPrefs: {
          ...state.textareaPrefs,
          isFullscreen: !state.textareaPrefs.isFullscreen,
          height: !state.textareaPrefs.isFullscreen ? window.innerHeight : 128,
          expandedState: !state.textareaPrefs.isFullscreen ? 'fullscreen' : 'compact',
        },
      })),
      
      // Footer actions
      setFooterState: (footerState) => set((state) => ({
        footerState: { ...state.footerState, ...footerState },
      })),
      
      toggleFooter: () => set((state) => ({
        footerState: { ...state.footerState, isCollapsed: !state.footerState.isCollapsed },
      })),
      
      // Preview panel actions
      setPreviewState: (previewState) => set((state) => ({
        previewState: { ...state.previewState, ...previewState },
      })),
      
      togglePreview: () => set((state) => ({
        previewState: { ...state.previewState, isOpen: !state.previewState.isOpen },
      })),
      
      openPreview: () => set((state) => ({
        previewState: { ...state.previewState, isOpen: true },
      })),
      
      closePreview: () => set((state) => ({
        previewState: { ...state.previewState, isOpen: false },
      })),
      
      // Keyboard shortcuts actions
      setKeyboardShortcutsStats: (stats) => set((state) => ({
        keyboardShortcutsStats: { ...state.keyboardShortcutsStats, ...stats },
      })),
      
      trackShortcutUsage: (shortcut) => set((state) => {
        const currentCount = state.keyboardShortcutsStats.shortcutUsageCounts[shortcut] || 0
        return {
          keyboardShortcutsStats: {
            ...state.keyboardShortcutsStats,
            totalShortcutsUsed: state.keyboardShortcutsStats.totalShortcutsUsed + 1,
            shortcutUsageCounts: {
              ...state.keyboardShortcutsStats.shortcutUsageCounts,
              [shortcut]: currentCount + 1,
            },
            lastUsedShortcut: shortcut,
          },
        }
      }),
      
      setShowShortcutsModal: (show) => set((state) => ({
        keyboardShortcutsStats: { ...state.keyboardShortcutsStats, showShortcutsModal: show },
      })),
      
      setShowInlineHint: (show) => set((state) => ({
        keyboardShortcutsStats: { ...state.keyboardShortcutsStats, showInlineHint: show },
      })),
      
      // Error context actions
      setErrorContext: (errorContext) => set({ errorContext }),
      
      clearError: () => set({ errorContext: null }),
    }),
    {
      name: 'teleprompter-ui-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        textareaPrefs: state.textareaPrefs,
        footerState: state.footerState,
        keyboardShortcutsStats: state.keyboardShortcutsStats,
      }),
    }
  )
)
