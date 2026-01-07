'use client';

import { ScrollText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStoryBuilderStore } from '@/lib/story-builder/store';

export function EmptyState() {
  const { addSlide } = useStoryBuilderStore();

  const handleAddFirstSlide = () => {
    addSlide('teleprompter');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-muted/5 rounded-3xl border-2 border-dashed border-muted-foreground/10 m-4">
      <div className="w-20 h-20 rounded-full bg-linear-to-tr from-purple-500/20 via-pink-500/20 to-orange-500/20 flex items-center justify-center mb-6">
        <ScrollText className="w-10 h-10 text-primary" />
      </div>
      <h3 className="text-xl font-bold mb-2">Build your first story</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-8">
        Drag slide types from the library on the left or click below to start with a blank teleprompter slide.
      </p>
      <Button 
        onClick={handleAddFirstSlide}
        className="rounded-full px-8 bg-linear-to-r from-purple-600 to-pink-600 hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Your First Slide
      </Button>
    </div>
  );
}
