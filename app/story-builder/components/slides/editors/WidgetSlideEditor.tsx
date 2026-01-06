'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import type { BuilderSlide } from '@/lib/story-builder/types';
import { useStoryBuilderStore } from '@/lib/story-builder/store';
import { useState } from 'react';

interface WidgetSlideEditorProps {
  slide: BuilderSlide;
  index: number;
}

export function WidgetSlideEditor({ slide, index }: WidgetSlideEditorProps) {
  const { updateSlide } = useStoryBuilderStore();
  const slideData = slide as any;
  const data = slideData.data || { type: 'bar', title: '', labels: ['A', 'B', 'C'], values: [10, 20, 30] };
  const [chartType, setChartType] = useState(data.type);
  const [title, setTitle] = useState(data.title || '');
  const [labels, setLabels] = useState(data.labels.join(', '));
  const [values, setValues] = useState(data.values.join(', '));

  const updateData = () => {
    const newLabels = labels.split(',').map((l: string) => l.trim()).filter((l: string) => l);
    const newValues = values.split(',').map((v: string) => parseFloat(v.trim()) || 0);
    
    updateSlide(index, {
      data: {
        type: chartType,
        title,
        labels: newLabels,
        values: newValues,
      }
    } as any);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="chart-type">Chart Type</Label>
        <select
          id="chart-type"
          value={chartType}
          onChange={(e) => {
            setChartType(e.target.value as any);
            updateData();
          }}
          className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="bar">Bar Chart</option>
          <option value="line">Line Chart</option>
          <option value="pie">Pie Chart</option>
          <option value="doughnut">Doughnut Chart</option>
        </select>
      </div>

      <div>
        <Label htmlFor="title">Chart Title (optional)</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            updateData();
          }}
          placeholder="Chart Title"
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="labels">Labels (comma-separated)</Label>
        <Input
          id="labels"
          value={labels}
          onChange={(e) => {
            setLabels(e.target.value);
            updateData();
          }}
          placeholder="A, B, C, D"
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="values">Values (comma-separated numbers)</Label>
        <Input
          id="values"
          value={values}
          onChange={(e) => {
            setValues(e.target.value);
            updateData();
          }}
          placeholder="10, 20, 30, 40"
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
    </div>
  );
}
