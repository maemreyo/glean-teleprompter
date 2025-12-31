"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { useConfigStore } from '@/lib/stores/useConfigStore';

interface TeleprompterTextProps {
  text: string;
  className?: string; // for additional styling (e.g. text shadow in runner)
  style?: React.CSSProperties; // for runner-specific overrides
}

/**
 * TeleprompterText Component
 * 
 * This component displays teleprompter text using ONLY useConfigStore for styling.
 * Config settings have absolute priority - they override theme-based styling completely.
 * 
 * IMPORTANT: This component does NOT accept legacy props (fontName, colorIndex, etc.)
 * All styling comes from useConfigStore to ensure config settings are the single source of truth.
 */
export const TeleprompterText: React.FC<TeleprompterTextProps> = ({
  text,
  className,
  style,
}) => {
  const { typography, layout, colors, effects } = useConfigStore();
  
  // Log config on render for debugging
  console.log('[TeleprompterText] Config received:', {
    typography,
    layout,
    colors,
    effects
  });
  
  return (
    <div
        className={cn(
          "w-full transition-all duration-300",
          layout.textAlign === 'center' ? 'text-center' :
          layout.textAlign === 'justify' ? 'text-justify' :
          layout.textAlign === 'right' ? 'text-right' : 'text-left',
          effects.backdropFilterEnabled && 'backdrop-filter',
          className
        )}
        style={{
          paddingLeft: `${layout.horizontalMargin}px`,
          paddingRight: `${layout.horizontalMargin}px`,
          paddingTop: `${layout.verticalPadding}px`,
          paddingBottom: `${layout.verticalPadding}px`,
          // Text area width and positioning
          width: `${layout.textAreaWidth}%`,
          marginLeft: layout.textAreaPosition === 'center' ? 'auto' :
                     layout.textAreaPosition === 'right' ? 'auto' : '0',
          marginRight: layout.textAreaPosition === 'center' ? 'auto' : '0',
          // Backdrop filter effects
          ...(effects.backdropFilterEnabled ? {
            backdropFilter: `blur(${effects.backdropBlur}px) brightness(${effects.backdropBrightness}%) saturate(${effects.backdropSaturation}%)`,
            WebkitBackdropFilter: `blur(${effects.backdropBlur}px) brightness(${effects.backdropBrightness}%) saturate(${effects.backdropSaturation}%)`,
          } : {}),
        }}
        data-config-layout={JSON.stringify({
          horizontalMargin: layout.horizontalMargin,
          verticalPadding: layout.verticalPadding,
          textAlign: layout.textAlign,
          columnCount: layout.columnCount,
          columnGap: layout.columnGap,
          textAreaWidth: layout.textAreaWidth,
          textAreaPosition: layout.textAreaPosition,
        })}
    >
        <p
            className={cn(
              "leading-relaxed whitespace-pre-wrap",
              layout.columnCount > 1 && "break-inside-avoid"
            )}
            style={{
              // Typography - CRITICAL: These override theme fonts
              fontFamily: `${typography.fontFamily} !important`,
              fontWeight: typography.fontWeight,
              fontSize: `${typography.fontSize}px !important`,
              lineHeight: String(typography.lineHeight),
              letterSpacing: `${typography.letterSpacing}px`,
              textTransform: typography.textTransform,
              
              // Column layout
              ...(layout.columnCount > 1 ? {
                columnCount: layout.columnCount,
                columnGap: `${layout.columnGap}px`,
              } : {}),
              
              // Colors - CRITICAL: These override theme text colors
              ...(colors.gradientEnabled ? {
                background: colors.gradientType === 'linear'
                  ? `linear-gradient(${colors.gradientAngle}deg, ${colors.gradientColors.join(', ')})`
                  : `radial-gradient(circle, ${colors.gradientColors.join(', ')})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              } : {
                color: `${colors.primaryColor} !important`,
              }),
              
              // Effects - Shadow (combined with outline/glow handling)
              ...(effects.shadowEnabled && !effects.outlineEnabled && !effects.glowEnabled ? {
                textShadow: `${effects.shadowOffsetX}px ${effects.shadowOffsetY}px ${effects.shadowBlur}px rgba(${parseInt(effects.shadowColor.slice(1, 3), 16)}, ${parseInt(effects.shadowColor.slice(3, 5), 16)}, ${parseInt(effects.shadowColor.slice(5, 7), 16)}, ${effects.shadowOpacity})`,
              } : {}),
              
              // Effects - Outline (overrides shadow when enabled)
              ...(effects.outlineEnabled ? {
                WebkitTextStroke: `${effects.outlineWidth}px ${effects.outlineColor}`,
                textShadow: `0 0 1px ${effects.outlineColor}, -1px -1px 1px ${effects.outlineColor}, 1px -1px 1px ${effects.outlineColor}`,
                paintOrder: 'stroke fill',
              } : {}),
              
              // Effects - Glow (can combine with outline)
              ...(effects.glowEnabled ? {
                textShadow: effects.outlineEnabled
                  ? `0 0 ${effects.glowBlurRadius}px ${effects.glowColor}, 0 0 ${effects.glowBlurRadius * 0.5}px ${effects.glowColor}, 0 0 1px ${effects.outlineColor}, -1px -1px 1px ${effects.outlineColor}, 1px -1px 1px ${effects.outlineColor}`
                  : `0 0 ${effects.glowBlurRadius}px ${effects.glowColor}, 0 0 ${effects.glowBlurRadius * 0.5}px ${effects.glowColor}`,
              } : {}),
              
              // Runner-specific overrides (lowest priority)
              ...style,
            }}
            data-config-typography={JSON.stringify({
              fontFamily: typography.fontFamily,
              fontSize: typography.fontSize,
              fontWeight: typography.fontWeight,
              lineHeight: typography.lineHeight,
              letterSpacing: typography.letterSpacing,
              textTransform: typography.textTransform,
            })}
            data-config-colors={JSON.stringify({
              primaryColor: colors.primaryColor,
              gradientEnabled: colors.gradientEnabled,
            })}
            data-config-effects={JSON.stringify({
              shadowEnabled: effects.shadowEnabled,
              outlineEnabled: effects.outlineEnabled,
              glowEnabled: effects.glowEnabled,
              backdropFilterEnabled: effects.backdropFilterEnabled,
            })}
        >
            {text || "..."}
        </p>
    </div>
  );
};
