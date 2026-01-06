'use client';

import { useRef, useState, useEffect } from 'react';
import { usePreviewSync } from '@/lib/story-builder/hooks/usePreviewSync';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PreviewPanel() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  usePreviewSync(iframeRef);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => setIsLoading(false);
    const handleError = () => setError('Failed to load preview');

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-background border rounded-lg overflow-hidden">
      <div className="p-3 border-b">
        <h3 className="text-sm font-medium">Preview</h3>
        <p className="text-xs text-muted-foreground">Live mobile preview</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 bg-muted/30">
        {isLoading && (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading preview...</p>
          </div>
        )}

        {error && (
          <div className="text-center">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src="/story-preview"
          className={cn(
            'w-full h-full bg-black rounded-lg transition-opacity',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          style={{
            aspectRatio: '9/16',
            maxHeight: '100%',
          }}
          sandbox="allow-scripts allow-same-origin"
          title="Story preview"
        />
      </div>
    </div>
  );
}
