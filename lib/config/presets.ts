// Preset management utilities

import type { Preset, ConfigSnapshot } from './types'
import type { TypographyConfig, ColorConfig, EffectConfig, LayoutConfig, AnimationConfig } from './types'

// Built-in presets
export const builtInPresets: Omit<Preset, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Broadcast',
    description: 'Professional broadcast preset for news and sports',
    config: {
      version: '1.0.0',
      typography: {
        fontFamily: 'Oswald',
        fontWeight: 500,
        fontSize: 56,
        letterSpacing: 0,
        lineHeight: 1.3,
        textTransform: 'uppercase',
      },
      colors: {
        primaryColor: '#ffffff',
        gradientEnabled: false,
        gradientType: 'linear',
        gradientColors: ['#ffffff', '#fbbf24'],
        gradientAngle: 90,
        outlineColor: '#000000',
        glowColor: '#ffffff',
      },
      effects: {
        shadowEnabled: true,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        shadowBlur: 8,
        shadowColor: '#000000',
        shadowOpacity: 0.7,
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
        overlayOpacity: 0.5,
      },
      layout: {
        horizontalMargin: 0,
        verticalPadding: 0,
        textAlign: 'center',
        columnCount: 1,
        columnGap: 20,
        textAreaWidth: 100,
        textAreaPosition: 'center',
      },
      animations: {
        smoothScrollEnabled: true,
        scrollDamping: 0.3,
        entranceAnimation: 'fade-in',
        entranceDuration: 500,
        wordHighlightEnabled: false,
        highlightColor: '#fbbf24',
        highlightSpeed: 200,
        autoScrollEnabled: false,
        autoScrollSpeed: 50,
        autoScrollAcceleration: 0,
      },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        appVersion: '1.0.0',
      },
    },
    thumbnailUrl: undefined,
    tags: ['broadcast', 'professional'],
    isShared: false,
    syncStatus: 'synced',
  },
  {
    name: 'Minimal',
    description: 'Clean and simple presentation style',
    config: {
      version: '1.0.0',
      typography: {
        fontFamily: 'Inter',
        fontWeight: 400,
        fontSize: 48,
        letterSpacing: 0,
        lineHeight: 1.6,
        textTransform: 'none',
      },
      colors: {
        primaryColor: '#ffffff',
        gradientEnabled: false,
        gradientType: 'linear',
        gradientColors: ['#ffffff', '#fbbf24'],
        gradientAngle: 90,
        outlineColor: '#000000',
        glowColor: '#ffffff',
      },
      effects: {
        shadowEnabled: false,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        shadowBlur: 4,
        shadowColor: '#000000',
        shadowOpacity: 0.3,
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
        overlayOpacity: 0.5,
      },
      layout: {
        horizontalMargin: 0,
        verticalPadding: 0,
        textAlign: 'center',
        columnCount: 1,
        columnGap: 20,
        textAreaWidth: 100,
        textAreaPosition: 'center',
      },
      animations: {
        smoothScrollEnabled: true,
        scrollDamping: 0.5,
        entranceAnimation: 'fade-in',
        entranceDuration: 300,
        wordHighlightEnabled: false,
        highlightColor: '#fbbf24',
        highlightSpeed: 200,
        autoScrollEnabled: false,
        autoScrollSpeed: 50,
        autoScrollAcceleration: 0,
      },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        appVersion: '1.0.0',
      },
    },
    thumbnailUrl: undefined,
    tags: ['minimal', 'clean'],
    isShared: false,
    syncStatus: 'synced',
  },
  {
    name: 'Cinematic',
    description: 'Dramatic style for film and video',
    config: {
      version: '1.0.0',
      typography: {
        fontFamily: 'Playfair Display',
        fontWeight: 700,
        fontSize: 52,
        letterSpacing: 1,
        lineHeight: 1.4,
        textTransform: 'none',
      },
      colors: {
        primaryColor: '#fbbf24',
        gradientEnabled: true,
        gradientType: 'linear',
        gradientColors: ['#fbbf24', '#f472b6'],
        gradientAngle: 45,
        outlineColor: '#000000',
        glowColor: '#fbbf24',
      },
      effects: {
        shadowEnabled: true,
        shadowOffsetX: 4,
        shadowOffsetY: 4,
        shadowBlur: 15,
        shadowColor: '#000000',
        shadowOpacity: 0.6,
        outlineEnabled: false,
        outlineWidth: 2,
        outlineColor: '#000000',
        glowEnabled: true,
        glowBlurRadius: 20,
        glowIntensity: 0.7,
        glowColor: '#fbbf24',
        backdropFilterEnabled: false,
        backdropBlur: 0,
        backdropBrightness: 100,
        backdropSaturation: 100,
        overlayOpacity: 0.5,
      },
      layout: {
        horizontalMargin: 40,
        verticalPadding: 20,
        textAlign: 'center',
        columnCount: 1,
        columnGap: 20,
        textAreaWidth: 80,
        textAreaPosition: 'center',
      },
      animations: {
        smoothScrollEnabled: true,
        scrollDamping: 0.4,
        entranceAnimation: 'fade-in',
        entranceDuration: 800,
        wordHighlightEnabled: false,
        highlightColor: '#fbbf24',
        highlightSpeed: 200,
        autoScrollEnabled: false,
        autoScrollSpeed: 50,
        autoScrollAcceleration: 0,
      },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        appVersion: '1.0.0',
      },
    },
    thumbnailUrl: undefined,
    tags: ['cinematic', 'dramatic'],
    isShared: false,
    syncStatus: 'synced',
  },
  {
    name: 'Corporate',
    description: 'Professional business presentation style',
    config: {
      version: '1.0.0',
      typography: {
        fontFamily: 'Montserrat',
        fontWeight: 600,
        fontSize: 44,
        letterSpacing: 0.5,
        lineHeight: 1.5,
        textTransform: 'none',
      },
      colors: {
        primaryColor: '#1e3a5f',
        gradientEnabled: false,
        gradientType: 'linear',
        gradientColors: ['#1e3a5f', '#3b82f6'],
        gradientAngle: 90,
        outlineColor: '#000000',
        glowColor: '#1e3a5f',
      },
      effects: {
        shadowEnabled: false,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        shadowBlur: 4,
        shadowColor: '#000000',
        shadowOpacity: 0.3,
        outlineEnabled: true,
        outlineWidth: 1,
        outlineColor: '#1e3a5f',
        glowEnabled: false,
        glowBlurRadius: 10,
        glowIntensity: 0.5,
        glowColor: '#1e3a5f',
        backdropFilterEnabled: false,
        backdropBlur: 0,
        backdropBrightness: 100,
        backdropSaturation: 100,
        overlayOpacity: 0.5,
      },
      layout: {
        horizontalMargin: 20,
        verticalPadding: 10,
        textAlign: 'left',
        columnCount: 1,
        columnGap: 20,
        textAreaWidth: 100,
        textAreaPosition: 'left',
      },
      animations: {
        smoothScrollEnabled: true,
        scrollDamping: 0.5,
        entranceAnimation: 'slide-up',
        entranceDuration: 400,
        wordHighlightEnabled: false,
        highlightColor: '#3b82f6',
        highlightSpeed: 200,
        autoScrollEnabled: false,
        autoScrollSpeed: 50,
        autoScrollAcceleration: 0,
      },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        appVersion: '1.0.0',
      },
    },
    thumbnailUrl: undefined,
    tags: ['corporate', 'business'],
    isShared: false,
    syncStatus: 'synced',
  },
  {
    name: 'Creative',
    description: 'Artistic and vibrant style',
    config: {
      version: '1.0.0',
      typography: {
        fontFamily: 'Poppins',
        fontWeight: 700,
        fontSize: 50,
        letterSpacing: 1,
        lineHeight: 1.2,
        textTransform: 'none',
      },
      colors: {
        primaryColor: '#f43f5e',
        gradientEnabled: true,
        gradientType: 'linear',
        gradientColors: ['#f43f5e', '#d946ef', '#a855f7'],
        gradientAngle: 120,
        outlineColor: '#000000',
        glowColor: '#f43f5e',
      },
      effects: {
        shadowEnabled: true,
        shadowOffsetX: 3,
        shadowOffsetY: 3,
        shadowBlur: 12,
        shadowColor: '#000000',
        shadowOpacity: 0.5,
        outlineEnabled: false,
        outlineWidth: 3,
        outlineColor: '#000000',
        glowEnabled: true,
        glowBlurRadius: 15,
        glowIntensity: 0.6,
        glowColor: '#f43f5e',
        backdropFilterEnabled: false,
        backdropBlur: 0,
        backdropBrightness: 100,
        backdropSaturation: 100,
        overlayOpacity: 0.5,
      },
      layout: {
        horizontalMargin: 10,
        verticalPadding: 5,
        textAlign: 'center',
        columnCount: 1,
        columnGap: 20,
        textAreaWidth: 100,
        textAreaPosition: 'center',
      },
      animations: {
        smoothScrollEnabled: true,
        scrollDamping: 0.6,
        entranceAnimation: 'scale-in',
        entranceDuration: 600,
        wordHighlightEnabled: true,
        highlightColor: '#f43f5e',
        highlightSpeed: 150,
        autoScrollEnabled: false,
        autoScrollSpeed: 50,
        autoScrollAcceleration: 0,
      },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        appVersion: '1.0.0',
      },
    },
    thumbnailUrl: undefined,
    tags: ['creative', 'artistic'],
    isShared: false,
    syncStatus: 'synced',
  },
]

// Convert config to preset (for saving)
export function configToPreset(
  config: ConfigSnapshot,
  name: string,
  description?: string
): Omit<Preset, 'id' | 'userId' | 'createdAt' | 'updatedAt'> {
  return {
    name,
    description,
    config,
    thumbnailUrl: undefined,
    collectionId: undefined,
    tags: [],
    isShared: false,
    syncStatus: 'synced',
  }
}

// Apply preset to config (for loading)
export function presetToConfig(preset: Preset): ConfigSnapshot {
  return preset.config
}

// Validate preset before saving
export function validatePreset(preset: Omit<Preset, 'id' | 'createdAt' | 'updatedAt'>): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!preset.name || preset.name.trim().length === 0) {
    errors.push('Preset name is required')
  }
  
  if (preset.name.length > 100) {
    errors.push('Preset name must be 100 characters or less')
  }
  
  if (!preset.config || !preset.config.typography || !preset.config.colors) {
    errors.push('Preset must include complete configuration')
  }
  
  return { valid: errors.length === 0, errors }
}

// Export preset to JSON
export function exportPresetAsJSON(preset: Preset): string {
  return JSON.stringify({
    version: '1.0.0',
    preset: {
      name: preset.name,
      description: preset.description,
      config: preset.config,
      tags: preset.tags,
      created_at: preset.createdAt,
      updatedAt: preset.updatedAt,
    },
  }, null, 2)
}

// Import preset from JSON
export function importPresetFromJSON(jsonString: string): Omit<Preset, 'id' | 'userId' | 'createdAt' | 'updatedAt'> | { error?: string } {
  try {
    const data = JSON.parse(jsonString)
    
    if (!data.preset && !data.config) {
      return { error: 'Invalid preset file format' }
    }
    
    const presetData = data.preset || data
    const configData = data.config || presetData.config
    
    return {
      name: presetData.name,
      description: presetData.description,
      config: configData,
      thumbnailUrl: presetData.thumbnailUrl,
      tags: presetData.tags || [],
      isShared: presetData.isShared || false,
      syncStatus: 'synced',
    }
  } catch {
    return { error: 'Invalid JSON format' }
  }
}

// Get current config as snapshot
export function getCurrentConfig(
  typography: TypographyConfig,
  colors: ColorConfig,
  effects: EffectConfig,
  layout: LayoutConfig,
  animations: AnimationConfig
): ConfigSnapshot {
  return {
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
  }
}
