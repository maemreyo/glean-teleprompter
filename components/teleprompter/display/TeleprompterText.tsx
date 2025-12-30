"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { FONT_STYLES, TEXT_COLORS } from '@/lib/constants';

interface TeleprompterTextProps {
  text: string;
  fontName: string;
  colorIndex: number;
  fontSize: number;
  lineHeight: number;
  margin: number; // percentage 0-30
  align: 'left' | 'center';
  className?: string; // for additional styling (e.g. text shadow in runner)
  style?: React.CSSProperties;
}

export const TeleprompterText: React.FC<TeleprompterTextProps> = ({
  text,
  fontName,
  colorIndex,
  fontSize,
  lineHeight,
  margin,
  align,
  className,
  style
}) => {
  const fontStyle = FONT_STYLES.find(f => f.name === fontName)?.font || FONT_STYLES[0].font;
  const colorValue = TEXT_COLORS[colorIndex]?.value || TEXT_COLORS[0].value;

  return (
    <div 
        className={cn("w-full transition-all duration-300", align === 'center' ? 'text-center' : 'text-left', className)}
        style={{
            paddingLeft: `${margin}%`,
            paddingRight: `${margin}%`
        }}
    >
        <p 
            className={cn("leading-relaxed whitespace-pre-wrap", fontStyle)}
            style={{ 
                fontSize: `${fontSize}px`, 
                lineHeight: lineHeight,
                color: colorValue,
                ...style
            }}
        >
            {text || "..."}
        </p>
    </div>
  );
};
