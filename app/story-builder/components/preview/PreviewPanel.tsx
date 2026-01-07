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
    <div className="flex flex-col h-full bg-background border rounded-2xl overflow-hidden shadow-sm">
      <div className="p-3 border-b bg-background/50 backdrop-blur-md">
        <h3 className="text-sm font-bold bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">Live Preview</h3>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-linear-to-b from-muted/50 to-muted/20 relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/40 backdrop-blur-[2px] rounded-b-2xl">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
              <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
            </div>
            <p className="text-xs font-medium text-muted-foreground mt-4 tracking-wider uppercase">Syncing Preview</p>
          </div>
        )}

        {error && (
          <div className="text-center p-4 bg-red-50 rounded-xl border border-red-100">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Device Frame Wrapper */}
        <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
          <div className="relative w-full max-w-[320px] aspect-9/16 pointer-events-auto">
            <div className="absolute inset-0 rounded-[3rem] ring-12 ring-[#1a1a1a] ring-inset z-10 pointer-events-none" />
            <div className="absolute inset-0 rounded-[3rem] ring-[1px] ring-[#333] ring-offset-2 ring-offset-[#1a1a1a] z-10 pointer-events-none" />
            <iframe
              ref={iframeRef}
              src="/story-preview"
              className={cn(
                'w-full h-full bg-black rounded-[2.5rem] transition-all duration-700 relative z-0',
                isLoading ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'
              )}
              style={{
                boxShadow: '0 30px 60px -15px rgba(0,0,0,0.5)',
              }}
              sandbox="allow-scripts allow-same-origin"
              title="Story preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
