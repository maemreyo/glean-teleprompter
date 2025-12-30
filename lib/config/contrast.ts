// WCAG contrast ratio calculation and validation

import type { ContrastValidation } from './types'

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.0 specification: https://www.w3.org/WAI/WCAG20/quickref/
 * @param hexColor - Hex color string (e.g., "#ffffff" or "#fff")
 * @returns Relative luminance value (0-1)
 */
export function calculateLuminance(hexColor: string): number {
  // Remove hash and convert to RGB
  const hex = hexColor.replace('#', '')
  
  // Handle 3-digit hex colors
  const r = parseInt(hex.length === 3 
    ? hex.slice(0, 1).repeat(2) 
    : hex.slice(0, 2), 
    16
  )
  const g = parseInt(hex.length === 3 
    ? hex.slice(1, 2).repeat(2) 
    : hex.slice(2, 4), 
    16
  )
  const b = parseInt(hex.length === 3 
    ? hex.slice(2, 3).repeat(2) 
    : hex.slice(4, 6), 
    16
  )
  
  // Convert RGB to sRGB
  const [rs, gs, bs] = [r, g, b].map((channel) => {
    const sRGB = channel / 255
    return sRGB <= 0.03928 
      ? sRGB / 12.92 
      : Math.pow((sRGB + 0.055) / 1.055, 2.4)
  })
  
  // Calculate luminance
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Calculate contrast ratio between two colors
 * @param foreground - Foreground color (hex)
 * @param background - Background color (hex)
 * @returns Contrast ratio (1-21)
 */
export function calculateContrastRatio(
  foreground: string,
  background: string
): number {
  const l1 = calculateLuminance(foreground)
  const l2 = calculateLuminance(background)
  
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Validate contrast ratio against WCAG standards
 * @param foreground - Foreground color (hex)
 * @param background - Background color (hex)
 * @param isLargeText - Whether the text is large (18pt+ or 14pt+ bold)
 * @returns Contrast validation result
 */
export function validateContrast(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): ContrastValidation {
  const ratio = calculateContrastRatio(foreground, background)
  
  // WCAG AA requirements
  // Normal text: 4.5:1
  // Large text: 3:1
  const aaThreshold = isLargeText ? 3.0 : 4.5
  
  // WCAG AAA requirements
  // Normal text: 7:1
  // Large text: 4.5:1
  const aaaThreshold = isLargeText ? 4.5 : 7.0
  
  let level: 'FAIL' | 'AA' | 'AAA' = 'FAIL'
  
  if (ratio >= aaaThreshold) {
    level = 'AAA'
  } else if (ratio >= aaThreshold) {
    level = 'AA'
  }
  
  return {
    ratio: Math.round(ratio * 100) / 100, // Round to 2 decimal places
    passesAA: ratio >= aaThreshold,
    passesAAA: ratio >= aaaThreshold,
    level,
  }
}

/**
 * Get the nearest contrasting color that passes WCAG AA
 * @param foreground - Foreground color (hex)
 * @param background - Background color (hex)
 * @param isLargeText - Whether the text is large
 * @returns Adjusted foreground color that passes AA (or original if already passes)
 */
export function getContrastingColor(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): string {
  const validation = validateContrast(foreground, background, isLargeText)
  
  if (validation.passesAA) {
    return foreground
  }
  
  // If it fails, return black or white whichever has better contrast
  const blackContrast = calculateContrastRatio('#000000', background)
  const whiteContrast = calculateContrastRatio('#ffffff', background)
  
  return whiteContrast > blackContrast ? '#ffffff' : '#000000'
}

/**
 * Check if a color is light or dark
 * @param hexColor - Hex color string
 * @returns true if color is light (luminance > 0.5)
 */
export function isLightColor(hexColor: string): boolean {
  return calculateLuminance(hexColor) > 0.5
}

/**
 * Get suggested text color for a background
 * @param backgroundColor - Background color (hex)
 * @returns '#ffffff' for dark backgrounds, '#000000' for light backgrounds
 */
export function getRecommendedTextColor(backgroundColor: string): string {
  return isLightColor(backgroundColor) ? '#000000' : '#ffffff'
}

/**
 * Format contrast ratio as a string with :1 suffix
 * @param ratio - Contrast ratio
 * @returns Formatted string (e.g., "4.5:1")
 */
export function formatContrastRatio(ratio: number): string {
  return `${Math.round(ratio * 100) / 100}:1`
}
