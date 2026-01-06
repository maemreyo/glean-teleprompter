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
    <div className="space-y-4">
      <div>
        <Label htmlFor="question">Question</Label>
        <Input
          id="question"
          value={question}
          onChange={(e) => updateQuestion(e.target.value)}
          placeholder="Your question here?"
          className="mt-1.5"
        />
      </div>

      <div>
        <Label>Options (2-4)</Label>
        <div className="space-y-2 mt-1.5">
          {options.map((option, idx) => (
            <div key={option.id} className="flex gap-2">
              <Input
                value={option.text}
                onChange={(e) => updateOption(option.id, e.target.value)}
                placeholder={`Option ${idx + 1}`}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeOption(option.id)}
                disabled={options.length <= 2}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={addOption}
            disabled={options.length >= 4}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Option
          </Button>
        </div>
      </div>
      
      <div>
        <Label htmlFor="duration">Duration (seconds)</Label>
        <div className="flex items-center gap-3 mt-1.5">
          <Slider
            id="duration"
            min={1}
            max={30}
            step={0.5}
            value={[typeof slide.duration === 'number' ? slide.duration : 10]}
            onValueChange={([value]) => updateSlide(index, { duration: value })}
            className="flex-1"
          />
          <span className="text-sm w-12 text-right">
            {typeof slide.duration === 'number' ? slide.duration : 10}s
          </span>
        </div>
      </div>
    </div>
  );
}
