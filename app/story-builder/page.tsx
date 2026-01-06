'use client';

import dynamic from 'next/dynamic';
import { ErrorBoundary } from '@/components/ui/error-boundary';

// Dynamically import StoryBuilder with SSR disabled to prevent hydration mismatches
// caused by localStorage state differences between server and client
const StoryBuilder = dynamic(() => import('./components/StoryBuilder').then(mod => ({ default: mod.StoryBuilder })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="animate-pulse text-muted-foreground">Loading Story Builder...</div>
    </div>
  ),
});

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
