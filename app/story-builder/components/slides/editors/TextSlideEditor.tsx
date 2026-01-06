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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="space-y-2">
        <Label htmlFor="text" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Heading Text</Label>
        <Input
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter a catchy headline..."
          className="rounded-xl h-11 shadow-sm border-muted transition-all focus:ring-2 focus:ring-primary/20"
        />
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="duration" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Display Time</Label>
        <div className="p-4 bg-muted/30 rounded-2xl border border-muted-foreground/5 space-y-4">
          <Slider
            id="duration"
            min={1}
            max={30}
            step={0.5}
            value={[typeof slide.duration === 'number' ? slide.duration : 5]}
            onValueChange={([value]) => updateSlide(index, { duration: value })}
          />
          <div className="flex justify-between items-center text-[11px] font-bold text-muted-foreground">
            <span>1s</span>
            <div className="flex items-center gap-1.5 bg-background px-2 py-0.5 rounded-full border shadow-sm text-primary">
              <span>{typeof slide.duration === 'number' ? slide.duration : 5}s</span>
            </div>
            <span>30s</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="bg-color" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Background Theme</Label>
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-muted-foreground/5">
          <div 
            className="w-10 h-10 rounded-lg shadow-inner shrink-0 border-2 border-background"
            style={{ backgroundColor }}
          />
          <Input
            id="bg-color"
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="flex-1 h-9 cursor-pointer border-0 bg-transparent"
          />
          <span className="text-[10px] font-mono text-muted-foreground uppercase">{backgroundColor}</span>
        </div>
      </div>
    </div>
  );
}
