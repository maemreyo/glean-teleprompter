'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Plus, Trash2 } from 'lucide-react';
import type { BuilderSlide } from '@/lib/story-builder/types';
import { useStoryBuilderStore } from '@/lib/story-builder/store';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface PollSlideEditorProps {
  slide: BuilderSlide;
  index: number;
}

export function PollSlideEditor({ slide, index }: PollSlideEditorProps) {
  const { updateSlide } = useStoryBuilderStore();
  const slideData = slide as any;
  const [question, setQuestion] = useState(slideData.question || '');
  const [options, setOptions] = useState<PollOption[]>(
    slideData.options || [
      { id: uuidv4(), text: 'Option 1' },
      { id: uuidv4(), text: 'Option 2' },
    ]
  );

  interface PollOption {
    id: string;
    text: string;
  }

  const updateQuestion = (newQuestion: string) => {
    setQuestion(newQuestion);
    updateSlide(index, { question: newQuestion });
  };

  const updateOption = (optionId: string, text: string) => {
    const updatedOptions = options.map((opt) =>
      opt.id === optionId ? { ...opt, text } : opt
    );
    setOptions(updatedOptions);
    updateSlide(index, { options: updatedOptions });
  };

  const addOption = () => {
    if (options.length >= 4) return;
    const newOption = { id: uuidv4(), text: `Option ${options.length + 1}` };
    const updatedOptions = [...options, newOption];
    setOptions(updatedOptions);
    updateSlide(index, { options: updatedOptions });
  };

  const removeOption = (optionId: string) => {
    if (options.length <= 2) return;
    const updatedOptions = options.filter((opt) => opt.id !== optionId);
    setOptions(updatedOptions);
    updateSlide(index, { options: updatedOptions });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="space-y-2">
        <Label htmlFor="question" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Question</Label>
        <Input
          id="question"
          value={question}
          onChange={(e) => updateQuestion(e.target.value)}
          placeholder="Ask your audience..."
          className="rounded-xl border-muted shadow-sm h-11 transition-all focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Choices ({options.length}/4)</Label>
        </div>
        <div className="space-y-3 p-4 bg-muted/30 rounded-2xl border border-muted-foreground/5">
          {options.map((option, idx) => (
            <div key={option.id} className="flex gap-2 group">
              <div className="flex-1 relative">
                <Input
                  value={option.text}
                  onChange={(e) => updateOption(option.id, e.target.value)}
                  placeholder={`Choice ${idx + 1}`}
                  className="rounded-lg h-10 pr-10 shadow-sm border-muted transition-all focus:border-primary/50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/30 group-focus-within:text-primary/30">
                  {idx + 1}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeOption(option.id)}
                disabled={options.length <= 2}
                className="h-10 w-10 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={addOption}
            disabled={options.length >= 4}
            className="w-full h-10 border-dashed border-2 hover:border-primary hover:text-primary bg-background/50 transition-all rounded-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Choice
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="duration" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Duration</Label>
        <div className="p-4 bg-muted/30 rounded-2xl border border-muted-foreground/5 space-y-4">
          <Slider
            id="duration"
            min={1}
            max={30}
            step={0.5}
            value={[typeof slide.duration === 'number' ? slide.duration : 10]}
            onValueChange={([value]) => updateSlide(index, { duration: value })}
          />
          <div className="flex justify-between items-center text-[11px] font-bold text-muted-foreground">
            <span>0s</span>
            <div className="flex items-center gap-1.5 bg-background px-2 py-0.5 rounded-full border shadow-sm">
              <span className="text-primary">{typeof slide.duration === 'number' ? slide.duration : 10}</span>
              <span>seconds</span>
            </div>
            <span>30s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
