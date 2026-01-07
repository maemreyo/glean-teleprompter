'use client';

/**
 * Styling Controls Component
 *
 * Controls for teleprompter styling settings:
 * - Background color (hex color picker)
 * - Background opacity (0-100%)
 *
 * @feature 014-teleprompter-preview-sync
 */

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Palette, Sparkles } from 'lucide-react';
import { useState } from 'react';

export interface StylingControlsProps {
  backgroundColor?: string;
  backgroundOpacity?: number;
  onBackgroundColorChange: (value: string) => void;
  onBackgroundOpacityChange: (value: number) => void;
  className?: string;
}

export function StylingControls({
  backgroundColor = '#000000',
  backgroundOpacity = 100,
  onBackgroundColorChange,
  onBackgroundOpacityChange,
  className = '',
}: StylingControlsProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Common color presets
  const colorPresets = [
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Dark Gray', value: '#1a1a1a' },
    { name: 'Navy', value: '#000080' },
    { name: 'Dark Blue', value: '#00008b' },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 pb-2 border-b">
        <Palette className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Styling</h3>
      </div>

      {/* Background Color */}
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Background Color
        </Label>
        <div className="flex gap-2 flex-wrap">
          {colorPresets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onBackgroundColorChange(preset.value)}
              className={`w-10 h-10 rounded-lg border-2 transition-all ${
                backgroundColor.toLowerCase() === preset.value.toLowerCase()
                  ? 'border-primary scale-110'
                  : 'border-muted hover:border-muted-foreground'
              }`}
              style={{ backgroundColor: preset.value }}
              title={preset.name}
              aria-label={`Set background color to ${preset.name}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="color"
            value={backgroundColor}
            onChange={(e) => onBackgroundColorChange(e.target.value)}
            className="w-12 h-10 p-1 cursor-pointer"
          />
          <Input
            type="text"
            value={backgroundColor}
            onChange={(e) => onBackgroundColorChange(e.target.value)}
            placeholder="#000000"
            className="flex-1"
            pattern="^#[0-9A-Fa-f]{6}$"
            title="Enter a hex color code (e.g., #000000)"
          />
        </div>
      </div>

      {/* Background Opacity */}
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Background Opacity
        </Label>
        <div className="p-3 bg-muted/30 rounded-xl space-y-3">
          <Slider
            min={0}
            max={100}
            step={5}
            value={[backgroundOpacity]}
            onValueChange={([value]) => onBackgroundOpacityChange(value)}
            className="py-2"
          />
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">
              {backgroundOpacity < 20 ? 'Transparent' : backgroundOpacity > 80 ? 'Solid' : 'Semi-transparent'}
            </span>
            <span className="text-[10px] font-mono bg-background px-1.5 py-0.5 rounded border">
              {backgroundOpacity}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
