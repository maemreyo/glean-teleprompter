'use client';

import { Card } from '@/components/ui/card';
import type { BuilderSlideType } from '@/lib/story-builder/types';
import { SLIDE_TYPES } from '@/lib/story-builder/templates/slideTypes';
import { SlideTypeCard } from './slides/SlideTypeCard';

export function SlideLibrary() {
  return (
    <div className="flex flex-col h-full bg-muted/30 rounded-lg p-4" role="region" aria-labelledby="slide-library-heading">
      <h2 id="slide-library-heading" className="text-lg font-semibold mb-4">Slide Library</h2>
      <div className="flex-1 overflow-y-auto space-y-2">
        {SLIDE_TYPES.map((type) => (
          <SlideTypeCard key={type} type={type} />
        ))}
      </div>
    </div>
  );
}
