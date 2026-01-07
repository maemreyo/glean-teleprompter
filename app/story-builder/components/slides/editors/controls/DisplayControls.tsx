'use client';

/**
 * Display Controls Component
 *
 * Controls for teleprompter display settings:
 * - Scroll speed (slow, medium, fast)
 * - Horizontal mirror mode
 * - Vertical mirror mode
 *
 * @feature 014-teleprompter-preview-sync
 */

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Monitor, FlipHorizontal, FlipVertical, Gauge } from 'lucide-react';

export interface DisplayControlsProps {
  scrollSpeed?: 'slow' | 'medium' | 'fast';
  mirrorHorizontal?: boolean;
  mirrorVertical?: boolean;
  onScrollSpeedChange: (value: 'slow' | 'medium' | 'fast') => void;
  onMirrorHorizontalChange: (value: boolean) => void;
  onMirrorVerticalChange: (value: boolean) => void;
  className?: string;
}

export function DisplayControls({
  scrollSpeed = 'medium',
  mirrorHorizontal = false,
  mirrorVertical = false,
  onScrollSpeedChange,
  onMirrorHorizontalChange,
  onMirrorVerticalChange,
  className = '',
}: DisplayControlsProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 pb-2 border-b">
        <Monitor className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Display</h3>
      </div>

      {/* Scroll Speed */}
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Scroll Speed
        </Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={scrollSpeed === 'slow' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onScrollSpeedChange('slow')}
            className="flex-1"
          >
            <Gauge className="w-4 h-4 mr-1" />
            Slow
          </Button>
          <Button
            type="button"
            variant={scrollSpeed === 'medium' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onScrollSpeedChange('medium')}
            className="flex-1"
          >
            <Gauge className="w-4 h-4 mr-1" />
            Medium
          </Button>
          <Button
            type="button"
            variant={scrollSpeed === 'fast' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onScrollSpeedChange('fast')}
            className="flex-1"
          >
            <Gauge className="w-4 h-4 mr-1" />
            Fast
          </Button>
        </div>
      </div>

      {/* Mirror Modes */}
      <div className="space-y-3">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Mirror Mode
        </Label>
        
        {/* Horizontal Mirror */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
          <div className="flex items-center gap-2">
            <FlipHorizontal className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Horizontal Flip</span>
          </div>
          <Button
            type="button"
            variant={mirrorHorizontal ? 'default' : 'outline'}
            size="sm"
            onClick={() => onMirrorHorizontalChange(!mirrorHorizontal)}
          >
            {mirrorHorizontal ? 'On' : 'Off'}
          </Button>
        </div>

        {/* Vertical Mirror */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
          <div className="flex items-center gap-2">
            <FlipVertical className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Vertical Flip</span>
          </div>
          <Button
            type="button"
            variant={mirrorVertical ? 'default' : 'outline'}
            size="sm"
            onClick={() => onMirrorVerticalChange(!mirrorVertical)}
          >
            {mirrorVertical ? 'On' : 'Off'}
          </Button>
        </div>
      </div>
    </div>
  );
}
