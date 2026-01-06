'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import type { BuilderSlide } from '@/lib/story-builder/types';
import { useStoryBuilderStore } from '@/lib/story-builder/store';
import { useEffect, useState } from 'react';

interface TextSlideEditorProps {
  slide: BuilderSlide;
  index: number;
}

export function TextSlideEditor({ slide, index }: TextSlideEditorProps) {
  const { updateSlide } = useStoryBuilderStore();
  const content = (slide as any).content || '';
  const [text, setText] = useState(content);
  const [backgroundColor, setBackgroundColor] = useState(slide.backgroundColor || '#000000');

  useEffect(() => {
    updateSlide(index, {
      content: text,
      backgroundColor,
    });
  }, [text, backgroundColor, index, updateSlide]);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="text">Text</Label>
        <Input
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your text"
          className="mt-1.5"
        />
      </div>
      
      <div>
        <Label htmlFor="duration">Duration (seconds)</Label>
        <div className="flex items-center gap-3 mt-1.5">
          <Slider
            id="duration"
            min={1}
            max={30}
            step={0.5}
            value={[typeof slide.duration === 'number' ? slide.duration : 5]}
            onValueChange={([value]) => updateSlide(index, { duration: value })}
            className="flex-1"
          />
          <span className="text-sm w-12 text-right">
            {typeof slide.duration === 'number' ? slide.duration : 5}s
          </span>
        </div>
      </div>
      
      <div>
        <Label htmlFor="bg-color">Background Color</Label>
        <Input
          id="bg-color"
          type="color"
          value={backgroundColor}
          onChange={(e) => setBackgroundColor(e.target.value)}
          className="mt-1.5 h-10"
        />
      </div>
    </div>
  );
}
