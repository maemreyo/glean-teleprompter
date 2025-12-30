"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { useConfigStore } from '@/lib/stores/useConfigStore';

interface TeleprompterTextProps {
  text: string;
  className?: string; // for additional styling (e.g. text shadow in runner)
  style?: React.CSSProperties;
}

export const TeleprompterText: React.FC<TeleprompterTextProps> = ({
  text,
  className,
  style
}) => {
  const { typography, layout, colors, effects } = useConfigStore();

  return (
    <div
        className={cn(
          "w-full transition-all duration-300",
          layout.textAlign === 'center' ? 'text-center' : layout.textAlign === 'justify' ? 'text-justify' : `text-${layout.textAlign}`,
          className
        )}
        style={{
          paddingLeft: `${layout.horizontalMargin}px`,
          paddingRight: `${layout.horizontalMargin}px`,
          paddingTop: `${layout.verticalPadding}px`,
          paddingBottom: `${layout.verticalPadding}px`,
        }}
    >
        <p
            className="leading-relaxed whitespace-pre-wrap"
            style={{
                fontFamily: typography.fontFamily,
                fontWeight: typography.fontWeight,
                fontSize: `${typography.fontSize}px`,
                lineHeight: typography.lineHeight,
                letterSpacing: `${typography.letterSpacing}px`,
                textTransform: typography.textTransform,
                color: colors.primaryColor,
                ...(colors.gradientEnabled ? {
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
