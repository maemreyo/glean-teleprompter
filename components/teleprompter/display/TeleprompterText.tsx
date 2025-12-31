"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { useConfigStore } from '@/lib/stores/useConfigStore';

interface TeleprompterTextProps {
  text: string;
  className?: string; // for additional styling (e.g. text shadow in runner)
  style?: React.CSSProperties;
  // Legacy props for backward compatibility with useTeleprompterStore
  fontName?: string;
  colorIndex?: number;
  fontSize?: number;
  lineHeight?: number;
  margin?: number;
  align?: 'left' | 'center' | 'right' | 'justify';
}

export const TeleprompterText: React.FC<TeleprompterTextProps> = ({
  text,
  className,
  style,
  // Legacy props - if provided, they override store defaults
  fontName,
  colorIndex,
  fontSize,
  lineHeight,
  margin,
  align,
}) => {
  const { typography, layout, colors, effects } = useConfigStore();
  
  // Use legacy props if provided, otherwise use store values
  const effectiveFontName = fontName || undefined; // Will be handled by CSS
  const effectiveAlign = align || layout.textAlign;
  
  return (
    <div
        className={cn(
          "w-full transition-all duration-300",
          effectiveAlign === 'center' ? 'text-center' : effectiveAlign === 'justify' ? 'text-justify' : `text-${effectiveAlign}`,
          className
        )}
        style={{
          paddingLeft: `${margin !== undefined ? margin : layout.horizontalMargin}px`,
          paddingRight: `${margin !== undefined ? margin : layout.horizontalMargin}px`,
          paddingTop: `${layout.verticalPadding}px`,
          paddingBottom: `${layout.verticalPadding}px`,
        }}
    >
        <p
            className="leading-relaxed whitespace-pre-wrap"
            style={{
              fontFamily: effectiveFontName || typography.fontFamily,
              fontWeight: typography.fontWeight,
              fontSize: fontSize ? `${fontSize}px` : `${typography.fontSize}px`,
              lineHeight: lineHeight || typography.lineHeight,
              letterSpacing: `${typography.letterSpacing}px`,
              textTransform: typography.textTransform,
              color: colorIndex !== undefined ? undefined : colors.primaryColor,
              ...(colors.gradientEnabled && colorIndex === undefined ? {
                background: colors.gradientType === 'linear'
                  ? `linear-gradient(${colors.gradientAngle}deg, ${colors.gradientColors.join(', ')})`
                  : `radial-gradient(circle, ${colors.gradientColors.join(', ')})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              } : {}),
              ...(effects.shadowEnabled ? {
                textShadow: `${effects.shadowOffsetX}px ${effects.shadowOffsetY}px ${effects.shadowBlur}px rgba(${parseInt(effects.shadowColor.slice(1, 3), 16)}, ${parseInt(effects.shadowColor.slice(5, 7), 16)}, ${parseInt(effects.shadowColor.slice(3, 5), 16)}, ${effects.shadowOpacity})`,
              } : {}),
              ...(effects.outlineEnabled ? {
                WebkitTextStroke: `${effects.outlineWidth}px ${effects.outlineColor}`,
                textShadow: `0 0 1px ${effects.outlineColor}, -1px -1px 1px ${effects.outlineColor}, 1px -1px 1px ${effects.outlineColor}`,
                paintOrder: 'stroke fill',
              } : {}),
              ...(effects.glowEnabled ? {
                textShadow: `0 0 ${effects.glowBlurRadius}px ${effects.glowColor}, 0 0 ${effects.glowBlurRadius * 0.5}px ${effects.glowColor}`,
              } : {}),
              ...style
            }}
        >
            {text || "..."}
        </p>
    </div>
  );
};
