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

// ============================================================================
// T035: [US2] Debounce utility for batch updates
// T057: [US4] Enhanced with hybrid recording logic for undo/redo
// ============================================================================

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
  overlayOpacity: 0.5,  // 007-unified-state-architecture: Background overlay opacity
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

// T055: [US4] Type for history config partial
type HistoryConfig = {
  typography?: TypographyConfig
  colors?: ColorConfig
  effects?: EffectConfig
  layout?: LayoutConfig
  animations?: AnimationConfig
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
  // T055: [US4] Complete HistoryStack implementation
  historyStack: HistoryStack
  currentHistoryIndex: number
  isUndoing: boolean
  isRedoing: boolean
  isRecording: boolean // T057: Flag to prevent recording during undo/redo

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

  // T055-T062: [US4] Complete history management actions
  pushHistoryEntry: (entry: HistoryEntry) => void
  clearHistory: () => void
  getCurrentHistoryEntry: () => HistoryEntry | null
  resetHistory: () => void // T061: Reset on preset/template/script load
  
  // T056: [US4] Undo/redo with proper state restoration
  performUndo: () => void
  performRedo: () => void
  canUndoHistory: () => boolean
  canRedoHistory: () => boolean
  
  // T057: [US4] Hybrid recording methods
  recordDiscreteChange: (action: string, config: HistoryConfig) => void
  recordContinuousChange: (action: string, config: HistoryConfig) => void

  // Reset to defaults
  resetTypography: () => void
  resetColors: () => void
  resetEffects: () => void
  resetLayout: () => void
  resetAnimations: () => void
  resetAll: () => void
}

// ============================================================================
// T055-T062: [US4] Complete History Management Implementation
// Includes FIFO logic, hybrid recording, undo/redo, and persistence
// ============================================================================

type ConfigStoreMiddleware = <
  T extends ConfigState,
>(
  config: StateCreator<T>
) => StateCreator<T>

/**
 * T055: [US4] Helper class to manage HistoryStack with FIFO logic
 * Maintains up to 50 states with automatic removal of oldest entries
 */
class HistoryManager {
  private stack: HistoryStack
  private currentIndex: number
  
  constructor(maxSize: number = 50) {
    this.stack = {
      past: [],
      future: [],
      maxSize
    }
    this.currentIndex = -1
  }
  
  /**
   * T055: Push a new entry to history with FIFO removal
   * Removes oldest entry when limit is exceeded
   */
  push(entry: HistoryEntry): void {
    // Clear future when new change is made
    this.stack.future = []
    
    // Add to past
    this.stack.past.push(entry)
    
    // FIFO: Remove oldest if limit exceeded
    if (this.stack.past.length > this.stack.maxSize) {
      this.stack.past.shift()
    } else {
      this.currentIndex++
    }
  }
  
  /**
   * T055: Get current state
   */
  getCurrent(): HistoryEntry | null {
    if (this.currentIndex < 0 || this.currentIndex >= this.stack.past.length) {
      return null
    }
    return this.stack.past[this.currentIndex]
  }
  
  /**
   * T055: Check if undo is possible
   */
  canUndo(): boolean {
    return this.currentIndex > 0
  }
  
  /**
   * T055: Check if redo is possible
   */
  canRedo(): boolean {
    return this.stack.future.length > 0
  }
  
  /**
   * T056: Undo - move to previous state
   */
  undo(): HistoryEntry | null {
    if (!this.canUndo()) return null
    
    const currentEntry = this.stack.past[this.currentIndex]
    this.stack.future.unshift(currentEntry)
    this.currentIndex--
    
    return this.getCurrent()
  }
  
  /**
   * T056: Redo - move to next state
   */
  redo(): HistoryEntry | null {
    if (!this.canRedo()) return null
    
    const nextEntry = this.stack.future.shift()!
    this.stack.past.push(nextEntry)
    this.currentIndex++
    
    return nextEntry
  }
  
  /**
   * T060: Clear all history
   */
  clear(): void {
    this.stack.past = []
    this.stack.future = []
    this.currentIndex = -1
  }
  
  /**
   * T061: Reset history (same as clear but semantically different)
   */
  reset(): void {
    this.clear()
  }
  
  /**
   * Get stack info for UI display
   */
  getInfo(): { past: number; future: number; current: number; total: number } {
    return {
      past: this.stack.past.length,
      future: this.stack.future.length,
      current: this.currentIndex + 1,
      total: this.stack.past.length + this.stack.future.length
    }
  }
  
  /**
   * Get the raw stack for persistence
   */
  getStack(): HistoryStack {
    return { ...this.stack }
  }
  
  /**
   * Restore stack from persistence
   */
  restoreStack(stack: HistoryStack, index: number): void {
    this.stack = stack
    this.currentIndex = index
  }
}

/**
 * T056: [US4] History middleware with complete recording logic
 * Wraps config updates to track all changes for undo/redo
 */
const historyMiddleware: ConfigStoreMiddleware = (config) => (set, get, api) => {
  // Create history manager instance
  const historyManager = new HistoryManager(50)
  
  // Create the base store
  const baseStore = config(set, get, api)
  
  // T057: Track debounced changes for batch recording
  let pendingChange: { action: string; config: HistoryConfig } | null = null
  
  return {
    ...baseStore,
    
    // T055: Push history entry
    pushHistoryEntry: (entry) => {
      const state = get()
      if (!state.isRecording && !state.isUndoing && !state.isRedoing) {
        historyManager.push(entry)
        ;(set as (s: Partial<ConfigState>) => void)({
          historyStack: historyManager.getStack(),
          currentHistoryIndex: historyManager['currentIndex']
        })
      }
    },
    
    // T060: Clear history
    clearHistory: () => {
      historyManager.clear()
      ;(set as (s: Partial<ConfigState>) => void)({
        historyStack: historyManager.getStack(),
        currentHistoryIndex: -1
      })
    },
    
    // T061: Reset history
    resetHistory: () => {
      historyManager.reset()
      ;(set as (s: Partial<ConfigState>) => void)({
        historyStack: historyManager.getStack(),
        currentHistoryIndex: -1
      })
    },
    
    // T055: Get current history entry
    getCurrentHistoryEntry: () => {
      return historyManager.getCurrent()
    },
    
    // T056: Perform undo
    performUndo: () => {
      const state = get()
      if (!historyManager.canUndo()) return
      
      const previousEntry = historyManager.undo()
      if (!previousEntry) return
      
      // Restore the config from history entry
      const restoredState: Partial<ConfigState> = {}
      if (previousEntry.config.typography) {
        restoredState.typography = previousEntry.config.typography
      }
      if (previousEntry.config.colors) {
        restoredState.colors = previousEntry.config.colors
      }
      if (previousEntry.config.effects) {
        restoredState.effects = previousEntry.config.effects
      }
      if (previousEntry.config.layout) {
        restoredState.layout = previousEntry.config.layout
      }
      if (previousEntry.config.animations) {
        restoredState.animations = previousEntry.config.animations
      }
      
      ;(set as (s: Partial<ConfigState>) => void)({
        ...restoredState,
        historyStack: historyManager.getStack(),
        currentHistoryIndex: historyManager['currentIndex'],
        isUndoing: false
      })
    },
    
    // T056: Perform redo
    performRedo: () => {
      const state = get()
      if (!historyManager.canRedo()) return
      
      const nextEntry = historyManager.redo()
      if (!nextEntry) return
      
      // Restore the config from history entry
      const restoredState: Partial<ConfigState> = {}
      if (nextEntry.config.typography) {
        restoredState.typography = nextEntry.config.typography
      }
      if (nextEntry.config.colors) {
        restoredState.colors = nextEntry.config.colors
      }
      if (nextEntry.config.effects) {
        restoredState.effects = nextEntry.config.effects
      }
      if (nextEntry.config.layout) {
        restoredState.layout = nextEntry.config.layout
      }
      if (nextEntry.config.animations) {
        restoredState.animations = nextEntry.config.animations
      }
      
      ;(set as (s: Partial<ConfigState>) => void)({
        ...restoredState,
        historyStack: historyManager.getStack(),
        currentHistoryIndex: historyManager['currentIndex'],
        isRedoing: false
      })
    },
    
    // T055: Can undo
    canUndoHistory: () => {
      return historyManager.canUndo()
    },
    
    // T055: Can redo
    canRedoHistory: () => {
      return historyManager.canRedo()
    },
    
    // T057: Record discrete change (immediate)
    recordDiscreteChange: (action, config) => {
      const state = get()
      if (state.isUndoing || state.isRedoing || state.isRecording) return
      
      const entry: HistoryEntry = {
        timestamp: Date.now(),
        config,
        action
      }
      
      historyManager.push(entry)
      
      ;(set as (s: Partial<ConfigState>) => void)({
        historyStack: historyManager.getStack(),
        currentHistoryIndex: historyManager['currentIndex']
      })
    },
    
    // T057: Record continuous change (batched with 50ms debounce)
    recordContinuousChange: (action, config) => {
      // Store pending change
      pendingChange = { action, config }
      
      // Debounce the actual recording
      setTimeout(() => {
        if (pendingChange && pendingChange.config === config) {
          const state = get()
          if (!state.isUndoing && !state.isRedoing && !state.isRecording) {
            const entry: HistoryEntry = {
              timestamp: Date.now(),
              config: pendingChange.config!,
              action: pendingChange.action
            }
            
            historyManager.push(entry)
            
            ;(set as (s: Partial<ConfigState>) => void)({
              historyStack: historyManager.getStack(),
              currentHistoryIndex: historyManager['currentIndex']
            })
          }
          pendingChange = null
        }
      }, 50)
    }
  }
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
    historyMiddleware((set, get, api) => ({
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
      // T055: [US4] Complete HistoryStack implementation
      historyStack: {
        past: [],
        future: [],
        maxSize: 50,
      },
      currentHistoryIndex: -1,
      isUndoing: false,
      isRedoing: false,
      isRecording: false,
      
      // Actions
      // T057: [US4] Enhanced with history recording
      setTypography: (config) => {
        set((state) => {
          const newTypography = { ...state.typography, ...config }
          return { typography: newTypography }
        })
        
        // Record to history after state update
        const currentState = useConfigStore.getState()
        if (!currentState.isUndoing && !currentState.isRedoing && !currentState.isRecording) {
          setTimeout(() => {
            const state = useConfigStore.getState()
            state.recordDiscreteChange('Changed typography', { typography: state.typography })
          }, 0)
        }
      },
      
      setColors: (config) => {
        set((state) => {
          const newColors = { ...state.colors, ...config }
          return { colors: newColors }
        })
        
        // Record to history after state update
        const currentState = useConfigStore.getState()
        if (!currentState.isUndoing && !currentState.isRedoing && !currentState.isRecording) {
          setTimeout(() => {
            const state = useConfigStore.getState()
            state.recordDiscreteChange('Changed colors', { colors: state.colors })
          }, 0)
        }
      },
      
      setEffects: (config) => {
        set((state) => {
          const newEffects = { ...state.effects, ...config }
          return { effects: newEffects }
        })
        
        // Record to history after state update
        const currentState = useConfigStore.getState()
        if (!currentState.isUndoing && !currentState.isRedoing && !currentState.isRecording) {
          setTimeout(() => {
            const state = useConfigStore.getState()
            state.recordDiscreteChange('Changed effects', { effects: state.effects })
          }, 0)
        }
      },
      
      setLayout: (config) => {
        set((state) => {
          const newLayout = { ...state.layout, ...config }
          return { layout: newLayout }
        })
        
        // Record to history after state update
        const currentState = useConfigStore.getState()
        if (!currentState.isUndoing && !currentState.isRedoing && !currentState.isRecording) {
          setTimeout(() => {
            const state = useConfigStore.getState()
            state.recordDiscreteChange('Changed layout', { layout: state.layout })
          }, 0)
        }
      },
      
      setAnimations: (config) => {
        set((state) => {
          const newAnimations = { ...state.animations, ...config }
          return { animations: newAnimations }
        })
        
        // Record to history after state update
        const currentState = useConfigStore.getState()
        if (!currentState.isUndoing && !currentState.isRedoing && !currentState.isRecording) {
          setTimeout(() => {
            const state = useConfigStore.getState()
            state.recordDiscreteChange('Changed animations', { animations: state.animations })
          }, 0)
        }
      },

      // T035: [US2] Debounced versions for batch updates (50ms window)
      // T057: [US4] Enhanced with hybrid recording for continuous changes
      setTypographyDebounced: debounce((config: Partial<TypographyConfig>) => {
        const state = useConfigStore.getState()
        const newTypography = { ...state.typography, ...config }
        
        // Record as continuous (batched) change
        state.recordContinuousChange('Changed typography', { typography: newTypography })
        
        useConfigStore.setState({ typography: newTypography })
      }, 50, 'typography'),

      setColorsDebounced: debounce((config: Partial<ColorConfig>) => {
        const state = useConfigStore.getState()
        const newColors = { ...state.colors, ...config }
        
        // Record as continuous (batched) change
        state.recordContinuousChange('Changed colors', { colors: newColors })
        
        useConfigStore.setState({ colors: newColors })
      }, 50, 'colors'),

      setEffectsDebounced: debounce((config: Partial<EffectConfig>) => {
        const state = useConfigStore.getState()
        const newEffects = { ...state.effects, ...config }
        
        // Record as continuous (batched) change
        state.recordContinuousChange('Changed effects', { effects: newEffects })
        
        useConfigStore.setState({ effects: newEffects })
      }, 50, 'effects'),

      setLayoutDebounced: debounce((config: Partial<LayoutConfig>) => {
        const state = useConfigStore.getState()
        const newLayout = { ...state.layout, ...config }
        
        // Record as continuous (batched) change
        state.recordContinuousChange('Changed layout', { layout: newLayout })
        
        useConfigStore.setState({ layout: newLayout })
      }, 50, 'layout'),

      setAnimationsDebounced: debounce((config: Partial<AnimationConfig>) => {
        const state = useConfigStore.getState()
        const newAnimations = { ...state.animations, ...config }
        
        // Record as continuous (batched) change
        state.recordContinuousChange('Changed animations', { animations: newAnimations })
        
        useConfigStore.setState({ animations: newAnimations })
      }, 50, 'animations'),
      
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      togglePanel: () => set((state) => ({
        isPanelOpen: !state.isPanelOpen
      })),
      
      // T061: [US4] Reset history when loading preset/template/script
      setAll: (config) => {
        const currentState = useConfigStore.getState()
        
        // Mark as recording to prevent history entry during load
        useConfigStore.setState({ isRecording: true })
        
        setTimeout(() => {
          currentState.resetHistory()
          useConfigStore.setState({ isRecording: false })
        }, 0)
        
        set({
          typography: config.typography,
          colors: config.colors,
          effects: config.effects,
          layout: config.layout,
          animations: config.animations,
        })
      },
      
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

      // T055-T062: [US4] Complete history management actions
      // These are implemented in the historyMiddleware
      // and are here for TypeScript interface compatibility
      pushHistoryEntry: (entry) => {
        // Implemented in middleware
      },
      clearHistory: () => {
        // Implemented in middleware
      },
      getCurrentHistoryEntry: () => {
        // Implemented in middleware
        return null
      },
      resetHistory: () => {
        // Implemented in middleware
      },
      performUndo: () => {
        // Implemented in middleware
      },
      performRedo: () => {
        // Implemented in middleware
      },
      canUndoHistory: () => {
        // Implemented in middleware
        return false
      },
      canRedoHistory: () => {
        // Implemented in middleware
        return false
      },
      recordDiscreteChange: (action, config) => {
        // Implemented in middleware
      },
      recordContinuousChange: (action, config) => {
        // Implemented in middleware
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
        // T062: [US4] Persist history state to localStorage
        historyStack: state.historyStack,
        currentHistoryIndex: state.currentHistoryIndex,
      }),
    }
  )
)
