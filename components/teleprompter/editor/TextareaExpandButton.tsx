"use client";

import React from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

/**
 * TextareaExpandButton - Button to expand/contract textarea
 * 
 * Cycles through sizes: default → medium → large → fullscreen → default
 * Shows Maximize2 when not fullscreen, Minimize2 when fullscreen
 */

export type TextareaSize = 'default' | 'medium' | 'large' | 'fullscreen';

interface TextareaExpandButtonProps {
  currentSize: TextareaSize;
  onToggle: () => void;
  disabled?: boolean;
}

export function TextareaExpandButton({ currentSize, onToggle, disabled = false }: TextareaExpandButtonProps) {
  const isFullscreen = currentSize === 'fullscreen';
  const tooltip = isFullscreen ? 'Exit fullscreen (Esc)' : 'Expand';
  const Icon = isFullscreen ? Minimize2 : Maximize2;

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className="absolute bottom-4 right-4 p-2 bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-md transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={tooltip}
      title={tooltip}
    >
      <Icon size={16} />
    </button>
  );
}
