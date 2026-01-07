'use client';

/**
 * Typography Controls Component
 *
 * Controls for teleprompter typography settings:
 * - Text alignment (left, center, right)
 * - Line height (1.0-3.0)
 * - Letter spacing (-5 to 20 pixels)
 *
 * @feature 014-teleprompter-preview-sync
 */

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { AlignLeft, AlignCenter, AlignRight, Type } from 'lucide-react';

export interface TypographyControlsProps {
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  letterSpacing?: number;
  onTextAlignChange: (value: 'left' | 'center' | 'right') => void;
  onLineHeightChange: (value: number) => void;
  onLetterSpacingChange: (value: number) => void;
  className?: string;
}

export function TypographyControls({
  textAlign = 'left',
  lineHeight = 1.4,
  letterSpacing = 0,
  onTextAlignChange,
  onLineHeightChange,
  onLetterSpacingChange,
  className = '',
}: TypographyControlsProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 pb-2 border-b">
        <Type className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Typography</h3>
      </div>

      {/* Text Alignment */}
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Alignment
        </Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={textAlign === 'left' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTextAlignChange('left')}
            className="flex-1"
          >
            <AlignLeft className="w-4 h-4 mr-1" />
            Left
          </Button>
          <Button
            type="button"
            variant={textAlign === 'center' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTextAlignChange('center')}
            className="flex-1"
          >
            <AlignCenter className="w-4 h-4 mr-1" />
            Center
          </Button>
          <Button
            type="button"
            variant={textAlign === 'right' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTextAlignChange('right')}
            className="flex-1"
          >
            <AlignRight className="w-4 h-4 mr-1" />
            Right
          </Button>
        </div>
      </div>

      {/* Line Height */}
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Line Height
        </Label>
        <div className="p-3 bg-muted/30 rounded-xl space-y-3">
          <Slider
            min={1.0}
            max={3.0}
            step={0.1}
            value={[lineHeight]}
            onValueChange={([value]) => onLineHeightChange(value)}
            className="py-2"
          />
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">
              {lineHeight < 1.3 ? 'Tight' : lineHeight > 1.8 ? 'Loose' : 'Normal'}
            </span>
            <span className="text-[10px] font-mono bg-background px-1.5 py-0.5 rounded border">
              {lineHeight.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Letter Spacing */}
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Letter Spacing
        </Label>
        <div className="p-3 bg-muted/30 rounded-xl space-y-3">
          <Slider
            min={-5}
            max={20}
            step={1}
            value={[letterSpacing]}
            onValueChange={([value]) => onLetterSpacingChange(value)}
            className="py-2"
          />
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">
              {letterSpacing < 0 ? 'Condensed' : letterSpacing > 5 ? 'Expanded' : 'Normal'}
            </span>
            <span className="text-[10px] font-mono bg-background px-1.5 py-0.5 rounded border">
              {letterSpacing}px
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
