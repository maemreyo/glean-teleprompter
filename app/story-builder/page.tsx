'use client';

import { StoryBuilder } from './components/StoryBuilder';
import { ErrorBoundary } from '@/components/ui/error-boundary';

function StoryBuilderFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="max-w-md text-center p-6">
        <h2 className="text-xl font-semibold text-destructive">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mt-2">
          {error.message || 'An error occurred loading the story builder.'}
        </p>
        <button
          onClick={reset}
          className="mt-4 px-4 py-2 text-sm font-medium border rounded-md hover:bg-accent"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export default function StoryBuilderPage() {
  return (
    <ErrorBoundary Fallback={StoryBuilderFallback}>
      <StoryBuilder />
    </ErrorBoundary>
  );
}

export const metadata = {
  title: 'Story Builder',
  description: 'Create visual stories with drag-and-drop',
};
