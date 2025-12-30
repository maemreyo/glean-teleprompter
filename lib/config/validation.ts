// Input validation utilities for configuration values

import type {
  TypographyConfig,
  ColorConfig,
  EffectConfig,
  LayoutConfig,
  AnimationConfig,
  ConfigSnapshot,
} from './types'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

// Validation constraints
export const constraints = {
  typography: {
    fontFamily: {
      allowedValues: [
        'Inter', 'Roboto', 'Open Sans', 'Montserrat', 'Poppins', 'Raleway',
        'Playfair Display', 'Merriweather', 'Lora', 'Crimson Text', 'Source Serif Pro',
        'Oswald', 'Bebas Neue', 'Anton', 'Lobster', 'Righteous', 'Satisfy',
        'JetBrains Mono', 'Fira Code', 'Source Code Pro', 'IBM Plex Mono',
        'Pacifico', 'Caveat', 'Dancing Script', 'Shadows Into Light',
      ],
    },
    fontWeight: { min: 100, max: 900, step: 100 },
    fontSize: { min: 12, max: 120 },
    letterSpacing: { min: -5, max: 20 },
    lineHeight: { min: 1.0, max: 3.0 },
  },
  colors: {
    gradientColors: { min: 2, max: 3 },
    gradientAngle: { min: 0, max: 360 },
  },
  effects: {
    shadowOffset: { min: 0, max: 20 },
    shadowBlur: { min: 0, max: 30 },
    shadowOpacity: { min: 0, max: 1 },
    outlineWidth: { min: 1, max: 10 },
    glowBlurRadius: { min: 5, max: 50 },
    glowIntensity: { min: 0, max: 1 },
  },
  layout: {
    horizontalMargin: { min: 0, max: 200 },
    verticalPadding: { min: 0, max: 100 },
    columnCount: { min: 1, max: 4 },
    columnGap: { min: 20, max: 100 },
    textAreaWidth: { min: 50, max: 100 },
  },
  animations: {
    scrollDamping: { min: 0.1, max: 1.0 },
    entranceDuration: { min: 200, max: 2000 },
    highlightSpeed: { min: 100, max: 500 },
    autoScrollSpeed: { min: 10, max: 100 },
    autoScrollAcceleration: { min: 0, max: 10 },
  },
} as const

// HEX color validation
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(color)
}

// Typography validation
export function validateTypography(config: Partial<TypographyConfig>): ValidationResult {
  const errors: string[] = []
  
  if (config.fontFamily !== undefined && !constraints.typography.fontFamily.allowedValues.includes(config.fontFamily as typeof constraints.typography.fontFamily.allowedValues[number])) {
    errors.push(`fontFamily must be one of: ${constraints.typography.fontFamily.allowedValues.join(', ')}`)
  }
  
  if (config.fontWeight !== undefined) {
    const { min, max, step } = constraints.typography.fontWeight
    if (config.fontWeight < min || config.fontWeight > max || config.fontWeight % step !== 0) {
      errors.push(`fontWeight must be between ${min} and ${max} in increments of ${step}`)
    }
  }
  
  if (config.fontSize !== undefined) {
    const { min, max } = constraints.typography.fontSize
    if (config.fontSize < min || config.fontSize > max) {
      errors.push(`fontSize must be between ${min} and ${max}`)
    }
  }
  
  if (config.letterSpacing !== undefined) {
    const { min, max } = constraints.typography.letterSpacing
    if (config.letterSpacing < min || config.letterSpacing > max) {
      errors.push(`letterSpacing must be between ${min} and ${max}`)
    }
  }
  
  if (config.lineHeight !== undefined) {
    const { min, max } = constraints.typography.lineHeight
    if (config.lineHeight < min || config.lineHeight > max) {
      errors.push(`lineHeight must be between ${min} and ${max}`)
    }
  }
  
  return { valid: errors.length === 0, errors }
}

// Color validation
export function validateColors(config: Partial<ColorConfig>): ValidationResult {
  const errors: string[] = []
  
  if (config.primaryColor !== undefined && !isValidHexColor(config.primaryColor)) {
    errors.push('primaryColor must be a valid HEX color (e.g., #ffffff)')
  }
  
  if (config.outlineColor !== undefined && !isValidHexColor(config.outlineColor)) {
    errors.push('outlineColor must be a valid HEX color')
  }
  
  if (config.glowColor !== undefined && !isValidHexColor(config.glowColor)) {
    errors.push('glowColor must be a valid HEX color')
  }
  
  if (config.gradientColors !== undefined) {
    const { min, max } = constraints.colors.gradientColors
    if (config.gradientColors.length < min || config.gradientColors.length > max) {
      errors.push(`gradientColors must have between ${min} and ${max} colors`)
    }
    for (const color of config.gradientColors) {
      if (!isValidHexColor(color)) {
        errors.push(`gradient color "${color}" is not a valid HEX color`)
        break
      }
    }
  }
  
  if (config.gradientAngle !== undefined) {
    const { min, max } = constraints.colors.gradientAngle
    if (config.gradientAngle < min || config.gradientAngle > max) {
      errors.push(`gradientAngle must be between ${min} and ${max}`)
    }
  }
  
  return { valid: errors.length === 0, errors }
}

// Effect validation
export function validateEffects(config: Partial<EffectConfig>): ValidationResult {
  const errors: string[] = []
  
  if (config.shadowColor !== undefined && !isValidHexColor(config.shadowColor)) {
    errors.push('shadowColor must be a valid HEX color')
  }
  
  if (config.outlineColor !== undefined && !isValidHexColor(config.outlineColor)) {
    errors.push('outlineColor must be a valid HEX color')
  }
  
  if (config.glowColor !== undefined && !isValidHexColor(config.glowColor)) {
    errors.push('glowColor must be a valid HEX color')
  }
  
  if (config.shadowOffsetX !== undefined) {
    const { min, max } = constraints.effects.shadowOffset
    if (config.shadowOffsetX < min || config.shadowOffsetX > max) {
      errors.push(`shadowOffsetX must be between ${min} and ${max}`)
    }
  }
  
  if (config.shadowOffsetY !== undefined) {
    const { min, max } = constraints.effects.shadowOffset
    if (config.shadowOffsetY < min || config.shadowOffsetY > max) {
      errors.push(`shadowOffsetY must be between ${min} and ${max}`)
    }
  }
  
  if (config.shadowBlur !== undefined) {
    const { min, max } = constraints.effects.shadowBlur
    if (config.shadowBlur < min || config.shadowBlur > max) {
      errors.push(`shadowBlur must be between ${min} and ${max}`)
    }
  }
  
  if (config.shadowOpacity !== undefined) {
    const { min, max } = constraints.effects.shadowOpacity
    if (config.shadowOpacity < min || config.shadowOpacity > max) {
      errors.push(`shadowOpacity must be between ${min} and ${max}`)
    }
  }
  
  if (config.outlineWidth !== undefined) {
    const { min, max } = constraints.effects.outlineWidth
    if (config.outlineWidth < min || config.outlineWidth > max) {
      errors.push(`outlineWidth must be between ${min} and ${max}`)
    }
  }
  
  if (config.glowBlurRadius !== undefined) {
    const { min, max } = constraints.effects.glowBlurRadius
    if (config.glowBlurRadius < min || config.glowBlurRadius > max) {
      errors.push(`glowBlurRadius must be between ${min} and ${max}`)
    }
  }
  
  if (config.glowIntensity !== undefined) {
    const { min, max } = constraints.effects.glowIntensity
    if (config.glowIntensity < min || config.glowIntensity > max) {
      errors.push(`glowIntensity must be between ${min} and ${max}`)
    }
  }
  
  return { valid: errors.length === 0, errors }
}

// Layout validation
export function validateLayout(config: Partial<LayoutConfig>): ValidationResult {
  const errors: string[] = []
  
  if (config.horizontalMargin !== undefined) {
    const { min, max } = constraints.layout.horizontalMargin
    if (config.horizontalMargin < min || config.horizontalMargin > max) {
      errors.push(`horizontalMargin must be between ${min} and ${max}`)
    }
  }
  
  if (config.verticalPadding !== undefined) {
    const { min, max } = constraints.layout.verticalPadding
    if (config.verticalPadding < min || config.verticalPadding > max) {
      errors.push(`verticalPadding must be between ${min} and ${max}`)
    }
  }
  
  if (config.columnCount !== undefined) {
    const { min, max } = constraints.layout.columnCount
    if (config.columnCount < min || config.columnCount > max) {
      errors.push(`columnCount must be between ${min} and ${max}`)
    }
  }
  
  if (config.columnGap !== undefined) {
    const { min, max } = constraints.layout.columnGap
    if (config.columnGap < min || config.columnGap > max) {
      errors.push(`columnGap must be between ${min} and ${max}`)
    }
  }
  
  if (config.textAreaWidth !== undefined) {
    const { min, max } = constraints.layout.textAreaWidth
    if (config.textAreaWidth < min || config.textAreaWidth > max) {
      errors.push(`textAreaWidth must be between ${min} and ${max}`)
    }
  }
  
  return { valid: errors.length === 0, errors }
}

// Animation validation
export function validateAnimations(config: Partial<AnimationConfig>): ValidationResult {
  const errors: string[] = []
  
  if (config.highlightColor !== undefined && !isValidHexColor(config.highlightColor)) {
    errors.push('highlightColor must be a valid HEX color')
  }
  
  if (config.scrollDamping !== undefined) {
    const { min, max } = constraints.animations.scrollDamping
    if (config.scrollDamping < min || config.scrollDamping > max) {
      errors.push(`scrollDamping must be between ${min} and ${max}`)
    }
  }
  
  if (config.entranceDuration !== undefined) {
    const { min, max } = constraints.animations.entranceDuration
    if (config.entranceDuration < min || config.entranceDuration > max) {
      errors.push(`entranceDuration must be between ${min} and ${max}`)
    }
  }
  
  if (config.highlightSpeed !== undefined) {
    const { min, max } = constraints.animations.highlightSpeed
    if (config.highlightSpeed < min || config.highlightSpeed > max) {
      errors.push(`highlightSpeed must be between ${min} and ${max}`)
    }
  }
  
  if (config.autoScrollSpeed !== undefined) {
    const { min, max } = constraints.animations.autoScrollSpeed
    if (config.autoScrollSpeed < min || config.autoScrollSpeed > max) {
      errors.push(`autoScrollSpeed must be between ${min} and ${max}`)
    }
  }
  
  if (config.autoScrollAcceleration !== undefined) {
    const { min, max } = constraints.animations.autoScrollAcceleration
    if (config.autoScrollAcceleration < min || config.autoScrollAcceleration > max) {
      errors.push(`autoScrollAcceleration must be between ${min} and ${max}`)
    }
  }
  
  return { valid: errors.length === 0, errors }
}

// Full config snapshot validation
export function validateConfigSnapshot(config: ConfigSnapshot): ValidationResult {
  const errors: string[] = []
  
  const typographyResult = validateTypography(config.typography)
  if (!typographyResult.valid) {
    errors.push(...typographyResult.errors.map(e => `typography.${e}`))
  }
  
  const colorsResult = validateColors(config.colors)
  if (!colorsResult.valid) {
    errors.push(...colorsResult.errors.map(e => `colors.${e}`))
  }
  
  const effectsResult = validateEffects(config.effects)
  if (!effectsResult.valid) {
    errors.push(...effectsResult.errors.map(e => `effects.${e}`))
  }
  
  const layoutResult = validateLayout(config.layout)
  if (!layoutResult.valid) {
    errors.push(...layoutResult.errors.map(e => `layout.${e}`))
  }
  
  const animationsResult = validateAnimations(config.animations)
  if (!animationsResult.valid) {
    errors.push(...animationsResult.errors.map(e => `animations.${e}`))
  }
  
  return { valid: errors.length === 0, errors }
}

// Clamp value to range
export function clampValue(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
