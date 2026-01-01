"use client";

import React from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';

/**
 * TextareaExpandButton - Button to expand/contract textarea
 *
 * T044: Updated with proportional scaling based on textareaScale
 * - Scales button size with textarea
 * - Remains centered at all sizes
 * - 200ms smooth transition
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
  // T044: Import textareaScale from useUIStore for proportional scaling
  const { textareaScale } = useUIStore();
  
  const isFullscreen = currentSize === 'fullscreen';
  const tooltip = isFullscreen ? 'Exit fullscreen (Esc)' : 'Expand';
  const Icon = isFullscreen ? Minimize2 : Maximize2;

  // T044: Calculate scale transform and button size
  const scale = textareaScale.scale;
  const buttonSize = Math.round(40 * scale); // Base size 40px scaled
  
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className="absolute bottom-4 right-4 bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-md transition-all duration-200 ease-in-out z-10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      style={{
        width: `${buttonSize}px`,
        height: `${buttonSize}px`,
        // Ensure minimum 44x44px touch target
        minWidth: '44px',
        minHeight: '44px',
      }}
      aria-label={tooltip}
      title={tooltip}
    >
      <Icon size={16 * scale} />
    </button>
  );
}
