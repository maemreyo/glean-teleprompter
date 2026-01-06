'use client';

import { useStoryBuilderStore } from '@/lib/story-builder/store';
import { TextSlideEditor } from './slides/editors/TextSlideEditor';
import { ImageSlideEditor } from './slides/editors/ImageSlideEditor';
import { TeleprompterSlideEditor } from './slides/editors/TeleprompterSlideEditor';
import { PollSlideEditor } from './slides/editors/PollSlideEditor';
import { WidgetSlideEditor } from './slides/editors/WidgetSlideEditor';

export function SlideEditor() {
  const { slides, activeSlideIndex } = useStoryBuilderStore();
  
  if (activeSlideIndex === null || !slides[activeSlideIndex]) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Select a slide to edit</p>
      </div>
    );
  }

  const slide = slides[activeSlideIndex];

  const editors = {
    'text-highlight': TextSlideEditor,
    'image': ImageSlideEditor,
    'teleprompter': TeleprompterSlideEditor,
    'poll': PollSlideEditor,
    'widget-chart': WidgetSlideEditor,
  };

  const Editor = editors[slide.type];

  return <Editor slide={slide} index={activeSlideIndex} />;
}
