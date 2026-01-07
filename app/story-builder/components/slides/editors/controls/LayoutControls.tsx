'use client';

/**
 * Layout Controls Component
 *
 * Controls for teleprompter layout settings:
 * - Safe area padding (top, right, bottom, left in pixels)
 *
 * @feature 014-teleprompter-preview-sync
 */

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Layout } from 'lucide-react';

export interface LayoutControlsProps {
  safeAreaPadding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  onSafeAreaPaddingChange: (value: { top?: number; right?: number; bottom?: number; left?: number }) => void;
  className?: string;
}

export function LayoutControls({
  safeAreaPadding = { top: 0, right: 0, bottom: 0, left: 0 },
  onSafeAreaPaddingChange,
  className = '',
}: LayoutControlsProps) {
  const { top = 0, right = 0, bottom = 0, left = 0 } = safeAreaPadding;

  const handlePaddingChange = (side: 'top' | 'right' | 'bottom' | 'left', value: number) => {
    onSafeAreaPaddingChange({
      ...safeAreaPadding,
      [side]: value,
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 pb-2 border-b">
        <Layout className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Safe Area Padding</h3>
      </div>

      <div className="space-y-3">
        {/* Top Padding */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Top
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={200}
                value={top}
                onChange={(e) => handlePaddingChange('top', parseInt(e.target.value) || 0)}
                className="w-20 h-8"
              />
              <span className="text-[10px] text-muted-foreground">px</span>
            </div>
          </div>
          <Slider
            min={0}
            max={200}
            step={5}
            value={[top]}
            onValueChange={([value]) => handlePaddingChange('top', value)}
            className="py-2"
          />
        </div>

        {/* Right Padding */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Right
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={200}
                value={right}
                onChange={(e) => handlePaddingChange('right', parseInt(e.target.value) || 0)}
                className="w-20 h-8"
              />
              <span className="text-[10px] text-muted-foreground">px</span>
            </div>
          </div>
          <Slider
            min={0}
            max={200}
            step={5}
            value={[right]}
            onValueChange={([value]) => handlePaddingChange('right', value)}
            className="py-2"
          />
        </div>

        {/* Bottom Padding */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Bottom
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={200}
                value={bottom}
                onChange={(e) => handlePaddingChange('bottom', parseInt(e.target.value) || 0)}
                className="w-20 h-8"
              />
              <span className="text-[10px] text-muted-foreground">px</span>
            </div>
          </div>
          <Slider
            min={0}
            max={200}
            step={5}
            value={[bottom]}
            onValueChange={([value]) => handlePaddingChange('bottom', value)}
            className="py-2"
          />
        </div>

        {/* Left Padding */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Left
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={200}
                value={left}
                onChange={(e) => handlePaddingChange('left', parseInt(e.target.value) || 0)}
                className="w-20 h-8"
              />
              <span className="text-[10px] text-muted-foreground">px</span>
            </div>
          </div>
          <Slider
            min={0}
            max={200}
            step={5}
            value={[left]}
            onValueChange={([value]) => handlePaddingChange('left', value)}
            className="py-2"
          />
        </div>
      </div>

      {/* Reset All Button */}
      <button
        type="button"
        onClick={() => onSafeAreaPaddingChange({ top: 0, right: 0, bottom: 0, left: 0 })}
        className="w-full p-2 text-xs text-center text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-lg transition-colors"
      >
        Reset All Padding
      </button>
    </div>
  );
}
