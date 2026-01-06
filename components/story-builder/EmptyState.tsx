'use client';

import { CircleDashed } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <CircleDashed className="w-16 h-16 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-medium mb-2">No slides yet</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Drag slide types from the library on the left to start building your story.
      </p>
    </div>
  );
}
