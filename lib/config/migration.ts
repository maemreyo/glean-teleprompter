/**
 * Migration utilities for converting legacy settings to config format
 */

export interface LegacySettings {
    font?: string;
    color?: number;
    speed?: number;
    fontSize?: number;
    lineHeight?: number;
    margin?: number;
    overlayOpacity?: number;
    align?: 'left' | 'center' | 'right';
}

/**
 * Migrate legacy settings to config format
 * This can be used client-side when loading old scripts
 */
export function migrateLegacyToConfig(legacy: LegacySettings) {
    // Map font style names to font families
    const fontMap: Record<string, string> = {
        'Classic': 'Inter',
        'Modern': 'Oswald',
        'Typewriter': 'Roboto Mono',
        'Novel': 'Merriweather',
        'Neon': 'Lobster',
    };
    
    // Map color index to actual colors (legacy system)
    const colorMap: Record<number, string> = {
        0: '#ffffff',
        1: '#000000',
        2: '#ef4444',
        3: '#22c55e',
        4: '#3b82f6',
        5: '#eab308',
    };
    
    return {
        version: '1.0.0',
        typography: {
            fontFamily: fontMap[legacy.font || 'Classic'] || 'Inter',
            fontWeight: 400,
            fontSize: legacy.fontSize || 48,
            letterSpacing: 0,
            lineHeight: legacy.lineHeight || 1.5,
            textTransform: 'none' as const,
        },
        colors: {
            primaryColor: colorMap[legacy.color ?? 0] || '#ffffff',
            gradientEnabled: false,
            gradientType: 'linear' as const,
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
            shadowOpacity: 0.5,
            outlineEnabled: false,
            outlineWidth: 2,
            outlineColor: '#000000',
            glowEnabled: false,
            glowBlurRadius: 10,
            glowIntensity: 0.5,
            glowColor: '#ffffff',
            backdropFilterEnabled: false,
            backdropBlur: legacy.overlayOpacity ? Math.round(legacy.overlayOpacity * 10) : 0,
            backdropBrightness: 100,
            backdropSaturation: 100,
        },
        layout: {
            horizontalMargin: legacy.margin || 0,
            verticalPadding: 0,
            textAlign: legacy.align === 'left' ? 'left' as const : 'center' as const,
            columnCount: 1,
            columnGap: 20,
            textAreaWidth: 100,
            textAreaPosition: 'center' as const,
        },
        animations: {
            smoothScrollEnabled: true,
            scrollDamping: 0.5,
            entranceAnimation: 'fade-in' as const,
            entranceDuration: 500,
            wordHighlightEnabled: false,
            highlightColor: '#fbbf24',
            highlightSpeed: 200,
            autoScrollEnabled: false,
            autoScrollSpeed: legacy.speed || 50,
            autoScrollAcceleration: 0,
        },
        metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            appVersion: '1.0.0',
        },
    };
}
