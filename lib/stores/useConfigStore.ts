import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  TypographyConfig,
  ColorConfig,
  EffectConfig,
  LayoutConfig,
  AnimationConfig,
  ConfigSnapshot,
  TabId,
  HistoryEntry,
  HistoryStack,
} from '@/lib/config/types'
import type { StateCreator } from 'zustand'

// Import TeleprompterConfig for history entries
import type { TeleprompterConfig } from '@/lib/templates/templateConfig'

// T035: [US2] Debounce utility for batch updates
const debounceTimeouts: Map<string, NodeJS.Timeout> = new Map()

function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
  key: string = 'default'
): T {
  return ((...args: Parameters<T>) => {
    const existingTimeout = debounceTimeouts.get(key)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }
    
    const timeout = setTimeout(() => {
      func(...args)
      debounceTimeouts.delete(key)
    }, wait)
    
    debounceTimeouts.set(key, timeout)
  }) as T
}

// Default configurations
export const defaultTypography: TypographyConfig = {
  fontFamily: 'Inter',
  fontWeight: 400,
  fontSize: 48,
  letterSpacing: 0,
  lineHeight: 1.5,
  textTransform: 'none',
}

export const defaultColors: ColorConfig = {
  primaryColor: '#ffffff',
  gradientEnabled: false,
  gradientType: 'linear',
  gradientColors: ['#ffffff', '#fbbf24'],
  gradientAngle: 90,
  outlineColor: '#000000',
  glowColor: '#ffffff',
}

export const defaultEffects: EffectConfig = {
  shadowEnabled: false,
  shadowOffsetX: 2,
  shadowOffsetY: 2,
  shadowBlur: 4,
  shadowColor: '#000000',
  shadowOpacity: 0.5,
  outlineEnabled: false,
  outlineWidth: 2,
  outlineColor: '#000000',
  glowEnabled: false,
  glowBlurRadius: 10,
  glowIntensity: 0.5,
  glowColor: '#ffffff',
  backdropFilterEnabled: false,
  backdropBlur: 0,
  backdropBrightness: 100,
  backdropSaturation: 100,
}

export const defaultLayout: LayoutConfig = {
  horizontalMargin: 0,
  verticalPadding: 0,
  textAlign: 'center',
  columnCount: 1,
  columnGap: 20,
  textAreaWidth: 100,
  textAreaPosition: 'center',
}

export const defaultAnimations: AnimationConfig = {
  smoothScrollEnabled: true,
  scrollDamping: 0.5,
  entranceAnimation: 'fade-in',
  entranceDuration: 500,
  wordHighlightEnabled: false,
  highlightColor: '#fbbf24',
  highlightSpeed: 200,
  autoScrollEnabled: false,
  autoScrollSpeed: 50,
  autoScrollAcceleration: 0,
}

interface ConfigState {
  // Configuration state
  typography: TypographyConfig
  colors: ColorConfig
  effects: EffectConfig
  layout: LayoutConfig
  animations: AnimationConfig

  // UI state
  activeTab: TabId
  isPanelOpen: boolean

  // Legacy Undo/Redo (for backward compatibility)
  pastStates: ConfigSnapshot[]
  futureStates: ConfigSnapshot[]

  // T012: Phase 2 - History management interface
  historyStack: HistoryStack
  currentHistoryIndex: number
  isUndoing: boolean
  isRedoing: boolean

  // Actions
  setTypography: (config: Partial<TypographyConfig>) => void
  setColors: (config: Partial<ColorConfig>) => void
  setEffects: (config: Partial<EffectConfig>) => void
  setLayout: (config: Partial<LayoutConfig>) => void
  setAnimations: (config: Partial<AnimationConfig>) => void

  // T035: [US2] Debounced versions for batch updates (50ms window)
  setTypographyDebounced: (config: Partial<TypographyConfig>) => void
  setColorsDebounced: (config: Partial<ColorConfig>) => void
  setEffectsDebounced: (config: Partial<EffectConfig>) => void
  setLayoutDebounced: (config: Partial<LayoutConfig>) => void
  setAnimationsDebounced: (config: Partial<AnimationConfig>) => void

  setActiveTab: (tab: TabId) => void
  togglePanel: () => void

  // Set all config at once (for loading from saved scripts)
  setAll: (config: ConfigSnapshot) => void

  // Legacy undo/redo (for backward compatibility)
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  // T013: Phase 2 - History middleware skeleton actions
  // These are placeholders - full implementation will be in US4
  pushHistoryEntry: (entry: HistoryEntry) => void
  clearHistory: () => void
  getCurrentHistoryEntry: () => HistoryEntry | null

  // Reset to defaults
  resetTypography: () => void
  resetColors: () => void
  resetEffects: () => void
  resetLayout: () => void
  resetAnimations: () => void
  resetAll: () => void
}

// ============================================================================
// T013: Phase 2 - History Middleware Skeleton
// This middleware wraps config updates to track history
// Full recording logic will be implemented in US4
// ============================================================================

type ConfigStoreMiddleware = <
  T extends ConfigState,
>(
  config: StateCreator<T>
) => StateCreator<T>

/**
 * History middleware skeleton
 * Wraps store to track configuration changes for undo/redo
 * Recording logic will be added in User Story 4
 */
const historyMiddleware: ConfigStoreMiddleware = (config) => (set, get, api) => {
  // Create the base store with original config
  const baseStore = config(set, get, api)

  // Wrap actions to track history
  // For now, we just return the base store without modifications
  // This ensures existing functionality is not broken
  return baseStore
}

// Helper to create snapshot from current state
const createSnapshot = (
  typography: TypographyConfig,
  colors: ColorConfig,
  effects: EffectConfig,
  layout: LayoutConfig,
  animations: AnimationConfig
): ConfigSnapshot => ({
  version: '1.0.0',
  typography,
  colors,
  effects,
  layout,
  animations,
  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    appVersion: '1.0.0',
  },
})

export const useConfigStore = create<ConfigState>()(
  persist(
    historyMiddleware((set, get) => ({
      // Initial state
      typography: defaultTypography,
      colors: defaultColors,
      effects: defaultEffects,
      layout: defaultLayout,
      animations: defaultAnimations,
      activeTab: 'typography',
      isPanelOpen: false,
      pastStates: [],
      futureStates: [],

      // T012: Phase 2 - History management initial state
      historyStack: {
        past: [],
        future: [],
        maxSize: 50,
      },
      currentHistoryIndex: -1,
      isUndoing: false,
      isRedoing: false,
      
      // Actions
      setTypography: (config) => set((state) => {
        const newTypography = { ...state.typography, ...config }
        console.log('[useConfigStore] setTypography called:', { config, newTypography })
        return {
          typography: newTypography,
        }
      }),
      
      setColors: (config) => set((state) => {
        const newColors = { ...state.colors, ...config }
        console.log('[useConfigStore] setColors called:', { config, newColors })
        return { colors: newColors }
      }),
      
      setEffects: (config) => set((state) => {
        const newEffects = { ...state.effects, ...config }
        console.log('[useConfigStore] setEffects called:', { config, newEffects })
        return { effects: newEffects }
      }),
      
      setLayout: (config) => set((state) => {
        const newLayout = { ...state.layout, ...config }
        console.log('[useConfigStore] setLayout called:', { config, newLayout })
        return { layout: newLayout }
      }),
      
      setAnimations: (config) => set((state) => {
        const newAnimations = { ...state.animations, ...config }
        console.log('[useConfigStore] setAnimations called:', { config, newAnimations })
        return { animations: newAnimations }
      }),

      // T035: [US2] Debounced versions for batch updates (50ms window)
      setTypographyDebounced: debounce((config: Partial<TypographyConfig>) => {
        const state = useConfigStore.getState()
        const newTypography = { ...state.typography, ...config }
        console.log('[useConfigStore] setTypographyDebounced called:', { config, newTypography })
        useConfigStore.setState({ typography: newTypography })
      }, 50, 'typography'),

      setColorsDebounced: debounce((config: Partial<ColorConfig>) => {
        const state = useConfigStore.getState()
        const newColors = { ...state.colors, ...config }
        console.log('[useConfigStore] setColorsDebounced called:', { config, newColors })
        useConfigStore.setState({ colors: newColors })
      }, 50, 'colors'),

      setEffectsDebounced: debounce((config: Partial<EffectConfig>) => {
        const state = useConfigStore.getState()
        const newEffects = { ...state.effects, ...config }
        console.log('[useConfigStore] setEffectsDebounced called:', { config, newEffects })
        useConfigStore.setState({ effects: newEffects })
      }, 50, 'effects'),

      setLayoutDebounced: debounce((config: Partial<LayoutConfig>) => {
        const state = useConfigStore.getState()
        const newLayout = { ...state.layout, ...config }
        console.log('[useConfigStore] setLayoutDebounced called:', { config, newLayout })
        useConfigStore.setState({ layout: newLayout })
      }, 50, 'layout'),

      setAnimationsDebounced: debounce((config: Partial<AnimationConfig>) => {
        const state = useConfigStore.getState()
        const newAnimations = { ...state.animations, ...config }
        console.log('[useConfigStore] setAnimationsDebounced called:', { config, newAnimations })
        useConfigStore.setState({ animations: newAnimations })
      }, 50, 'animations'),
      
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      togglePanel: () => set((state) => ({
        isPanelOpen: !state.isPanelOpen
      })),
      
      setAll: (config) => set({
        typography: config.typography,
        colors: config.colors,
        effects: config.effects,
        layout: config.layout,
        animations: config.animations,
      }),
      
      undo: () => set((state) => {
        const previous = state.pastStates[state.pastStates.length - 1]
        if (!previous) return state
        
        const currentSnapshot = createSnapshot(
          state.typography,
          state.colors,
          state.effects,
          state.layout,
          state.animations
        )
        
        return {
          typography: previous.typography,
          colors: previous.colors,
          effects: previous.effects,
          layout: previous.layout,
          animations: previous.animations,
          pastStates: state.pastStates.slice(0, -1),
          futureStates: [currentSnapshot, ...state.futureStates],
        }
      }),
      
      redo: () => set((state) => {
        const next = state.futureStates[0]
        if (!next) return state
        
        const currentSnapshot = createSnapshot(
          state.typography,
          state.colors,
          state.effects,
          state.layout,
          state.animations
        )
        
        return {
          typography: next.typography,
          colors: next.colors,
          effects: next.effects,
          layout: next.layout,
          animations: next.animations,
          pastStates: [...state.pastStates, currentSnapshot],
          futureStates: state.futureStates.slice(1),
        }
      }),
      
      canUndo: () => {
        const state = get()
        return state.pastStates.length > 0
      },
      
      canRedo: () => {
        const state = get()
        return state.futureStates.length > 0
      },
      
      resetTypography: () => set({ typography: defaultTypography }),
      resetColors: () => set({ colors: defaultColors }),
      resetEffects: () => set({ effects: defaultEffects }),
      resetLayout: () => set({ layout: defaultLayout }),
      resetAnimations: () => set({ animations: defaultAnimations }),
      
      resetAll: () => set({
        typography: defaultTypography,
        colors: defaultColors,
        effects: defaultEffects,
        layout: defaultLayout,
        animations: defaultAnimations,
      }),

      // T013: Phase 2 - History management skeleton actions
      // Full implementation will be added in US4

      /**
       * Push a new entry to the history stack
       * Recording logic will be implemented in US4
       */
      pushHistoryEntry: (entry) => set((state) => {
        // For now, just log the entry
        console.log('[useConfigStore] pushHistoryEntry called (skeleton):', entry)
        return state
      }),

      /**
       * Clear all history
       */
      clearHistory: () => set((state) => ({
        historyStack: {
          past: [],
          future: [],
          maxSize: state.historyStack.maxSize,
        },
        currentHistoryIndex: -1,
      })),

      /**
       * Get the current history entry
       * Returns null if no history exists
       */
      getCurrentHistoryEntry: () => {
        const state = get()
        if (state.currentHistoryIndex < 0 || state.currentHistoryIndex >= state.historyStack.past.length) {
          return null
        }
        return state.historyStack.past[state.currentHistoryIndex]
      },
    })),
    {
      name: 'teleprompter-config',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        typography: state.typography,
        colors: state.colors,
        effects: state.effects,
        layout: state.layout,
        animations: state.animations,
        activeTab: state.activeTab,
        isPanelOpen: state.isPanelOpen,
      }),
    }
  )
)
