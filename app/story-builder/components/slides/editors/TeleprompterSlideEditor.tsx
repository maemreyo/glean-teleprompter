'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import type { BuilderSlide } from '@/lib/story-builder/types';
import { useStoryBuilderStore } from '@/lib/story-builder/store';
import { useState } from 'react';

interface TeleprompterSlideEditorProps {
  slide: BuilderSlide;
  index: number;
}

export function TeleprompterSlideEditor({ slide, index }: TeleprompterSlideEditorProps) {
  const { updateSlide } = useStoryBuilderStore();
  const content = (slide as any).content || '';
  const [text, setText] = useState(content);
  const [focalPoint, setFocalPoint] = useState(50);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="space-y-2">
        <Label htmlFor="text" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Story Text</Label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            updateSlide(index, { content: e.target.value });
          }}
          placeholder="Compose your story narrative..."
          className="w-full min-h-[120px] rounded-xl border bg-background px-3 py-2 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label htmlFor="focal-point" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Focal Point</Label>
          <div className="p-3 bg-muted/30 rounded-xl space-y-3">
            <Slider
              id="focal-point"
              min={0}
              max={100}
              step={5}
              value={[focalPoint]}
              onValueChange={([value]) => {
                setFocalPoint(value);
                updateSlide(index, { focalPoint: value } as any);
              }}
              className="py-2"
            />
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                {focalPoint < 33 ? 'Top' : focalPoint < 66 ? 'Center' : 'Bottom'}
              </span>
              <span className="text-[10px] font-mono bg-background px-1.5 py-0.5 rounded border">{focalPoint}%</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="font-size" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Size</Label>
          <div className="p-3 bg-muted/30 rounded-xl space-y-3">
            <Slider
              id="font-size"
              min={16}
              max={48}
              step={2}
              value={[24]}
              onValueChange={([value]) => updateSlide(index, { fontSize: value } as any)}
              className="py-2"
            />
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Scale</span>
              <span className="text-[10px] font-mono bg-background px-1.5 py-0.5 rounded border">24px</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
