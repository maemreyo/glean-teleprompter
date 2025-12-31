import { act } from 'react'
import type { ConfigSnapshot, TypographyConfig, ColorConfig, EffectConfig, LayoutConfig, AnimationConfig } from '@/lib/config/types'
import { useConfigStore } from '@/lib/stores/useConfigStore'

// Mock store state for testing
export const mockInitialState = {
  typography: {
    fontFamily: 'Inter',
    fontWeight: 400,
    fontSize: 48,
    letterSpacing: 0,
    lineHeight: 1.5,
    textTransform: 'none' as const,
  } as TypographyConfig,
  colors: {
    primaryColor: '#ffffff',
    gradientEnabled: false,
    gradientType: 'linear' as const,
    gradientColors: ['#ffffff', '#fbbf24'],
    gradientAngle: 90,
    outlineColor: '#000000',
    glowColor: '#ffffff',
  } as ColorConfig,
  effects: {
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
  } as EffectConfig,
  layout: {
    horizontalMargin: 0,
    verticalPadding: 0,
    textAlign: 'center' as const,
    columnCount: 1,
    columnGap: 20,
    textAreaWidth: 100,
    textAreaPosition: 'center' as const,
  } as LayoutConfig,
  animations: {
    smoothScrollEnabled: true,
    scrollDamping: 0.5,
    entranceAnimation: 'fade-in' as const,
    entranceDuration: 500,
    wordHighlightEnabled: false,
    highlightColor: '#fbbf24',
    highlightSpeed: 200,
    autoScrollEnabled: false,
    autoScrollSpeed: 50,
    autoScrollAcceleration: 0,
  } as AnimationConfig,
}

// Helper to reset store to initial state
export const resetConfigStore = () => {
  act(() => {
    const mockStore = useConfigStore.getState()
    if (mockStore?.resetAll) {
      mockStore.resetAll()
    }
  })
}

// Helper to set specific config state
export const setConfigState = (config: Partial<ConfigSnapshot>) => {
  act(() => {
    const mockStore = useConfigStore.getState()
    if (!mockStore) return

    if (config.typography && mockStore.setTypography) {
      mockStore.setTypography(config.typography)
    }
    if (config.colors && mockStore.setColors) {
      mockStore.setColors(config.colors)
    }
    if (config.effects && mockStore.setEffects) {
      mockStore.setEffects(config.effects)
    }
    if (config.layout && mockStore.setLayout) {
      mockStore.setLayout(config.layout)
    }
    if (config.animations && mockStore.setAnimations) {
      mockStore.setAnimations(config.animations)
    }
  })
}

// Helper to get current store state
// Note: This must be called within a React component or test
// Returns the config state without version/metadata
export const getCurrentConfigState = () => {
  const state = useConfigStore.getState()
  return {
    typography: state?.typography || mockInitialState.typography,
    colors: state?.colors || mockInitialState.colors,
    effects: state?.effects || mockInitialState.effects,
    layout: state?.layout || mockInitialState.layout,
    animations: state?.animations || mockInitialState.animations,
  }
}

// Helper to get current store state (for use outside React)
// Returns the config state without version/metadata
export const getConfigSnapshot = () => {
  const state = useConfigStore.getState()
  return {
    typography: state?.typography || mockInitialState.typography,
    colors: state?.colors || mockInitialState.colors,
    effects: state?.effects || mockInitialState.effects,
    layout: state?.layout || mockInitialState.layout,
    animations: state?.animations || mockInitialState.animations,
  }
}

// Helper to create test config updates
export const createTestConfigUpdate = {
  typography: (overrides: Partial<TypographyConfig>) => ({
    typography: { ...mockInitialState.typography, ...overrides }
  }),
  colors: (overrides: Partial<ColorConfig>) => ({
    colors: { ...mockInitialState.colors, ...overrides }
  }),
  effects: (overrides: Partial<EffectConfig>) => ({
    effects: { ...mockInitialState.effects, ...overrides }
  }),
  layout: (overrides: Partial<LayoutConfig>) => ({
    layout: { ...mockInitialState.layout, ...overrides }
  }),
  animations: (overrides: Partial<AnimationConfig>) => ({
    animations: { ...mockInitialState.animations, ...overrides }
  }),
}