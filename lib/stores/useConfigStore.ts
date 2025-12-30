import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  TypographyConfig,
  ColorConfig,
  EffectConfig,
  LayoutConfig,
  AnimationConfig,
  ConfigSnapshot,
} from '@/lib/config/types'

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
  activeTab: string
  isPanelOpen: boolean
  
  // Undo/Redo
  pastStates: ConfigSnapshot[]
  futureStates: ConfigSnapshot[]
  
  // Actions
  setTypography: (config: Partial<TypographyConfig>) => void
  setColors: (config: Partial<ColorConfig>) => void
  setEffects: (config: Partial<EffectConfig>) => void
  setLayout: (config: Partial<LayoutConfig>) => void
  setAnimations: (config: Partial<AnimationConfig>) => void
  
  setActiveTab: (tab: string) => void
  togglePanel: () => void
  
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  
  // Reset to defaults
  resetTypography: () => void
  resetColors: () => void
  resetEffects: () => void
  resetLayout: () => void
  resetAnimations: () => void
  resetAll: () => void
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
    (set, get) => ({
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
      
      // Actions
      setTypography: (config) => set((state) => {
        const newTypography = { ...state.typography, ...config }
        return {
          typography: newTypography,
        }
      }),
      
      setColors: (config) => set((state) => ({
        colors: { ...state.colors, ...config }
      })),
      
      setEffects: (config) => set((state) => ({
        effects: { ...state.effects, ...config }
      })),
      
      setLayout: (config) => set((state) => ({
        layout: { ...state.layout, ...config }
      })),
      
      setAnimations: (config) => set((state) => ({
        animations: { ...state.animations, ...config }
      })),
      
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      togglePanel: () => set((state) => ({
        isPanelOpen: !state.isPanelOpen
      })),
      
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
    }),
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
