import { act } from 'react-dom/test-utils'
import { useConfigStore } from '@/lib/stores/useConfigStore'
import type { ConfigSnapshot, TypographyConfig, ColorConfig, EffectConfig, LayoutConfig, AnimationConfig } from '@/lib/config/types'

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
    useConfigStore.getState().resetAll()
  })
}

// Helper to set specific config state
export const setConfigState = (config: Partial<ConfigSnapshot>) => {
  act(() => {
    if (config.typography) {
      useConfigStore.getState().setTypography(config.typography)
    }
    if (config.colors) {
      useConfigStore.getState().setColors(config.colors)
    }
    if (config.effects) {
      useConfigStore.getState().setEffects(config.effects)
    }
    if (config.layout) {
      useConfigStore.getState().setLayout(config.layout)
    }
    if (config.animations) {
      useConfigStore.getState().setAnimations(config.animations)
    }
  })
}

// Helper to get current store state
export const getCurrentConfigState = () => {
  return {
    typography: useConfigStore.getState().typography,
    colors: useConfigStore.getState().colors,
    effects: useConfigStore.getState().effects,
    layout: useConfigStore.getState().layout,
    animations: useConfigStore.getState().animations,
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