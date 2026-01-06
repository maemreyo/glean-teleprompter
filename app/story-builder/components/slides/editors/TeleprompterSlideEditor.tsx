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
    <div className="space-y-4">
      <div>
        <Label htmlFor="text">Teleprompter Text</Label>
        <Input
          id="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            updateSlide(index, { content: e.target.value });
          }}
          placeholder="Your scrolling text here"
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="focal-point">Focal Point ({focalPoint}%)</Label>
        <div className="flex items-center gap-3 mt-1.5">
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
            className="flex-1"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {focalPoint < 33 ? 'Top' : focalPoint < 66 ? 'Center' : 'Bottom'} of screen
        </p>
      </div>

      <div>
        <Label htmlFor="font-size">Font Size</Label>
        <div className="flex items-center gap-3 mt-1.5">
          <Slider
            id="font-size"
            min={16}
            max={48}
            step={2}
            value={[24]}
            onValueChange={([value]) => updateSlide(index, { fontSize: value } as any)}
            className="flex-1"
          />
          <span className="text-sm w-12 text-right">24px</span>
        </div>
      </div>
    </div>
  );
}
