'use client';

/**
 * ImageSlideEditor Component
 *
 * Editor for image slide type.
 * Validates URL format and provides user guidance.
 * Note: Direct file upload size validation not applicable for URL input.
 * Users should ensure hosted images are under 5MB for optimal performance.
 */

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import type { BuilderSlide } from '@/lib/story-builder/types';
import { useStoryBuilderStore } from '@/lib/story-builder/store';
import { useState, useEffect } from 'react';

interface ImageSlideEditorProps {
  slide: BuilderSlide;
  index: number;
}

export function ImageSlideEditor({ slide, index }: ImageSlideEditorProps) {
  const { updateSlide } = useStoryBuilderStore();
  const content = (slide as any).content || '';
  const alt = (slide as any).alt || '';
  const [imageUrl, setImageUrl] = useState(content);
  const [altText, setAltText] = useState(alt);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Validate URL format
  useEffect(() => {
    if (!imageUrl) {
      setUrlError(null);
      return;
    }

    try {
      const url = new URL(imageUrl);
      // Check if URL points to an image
      if (!url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        setUrlError('URL should point to an image file (jpg, png, gif, webp, svg)');
      } else {
        setUrlError(null);
      }
    } catch {
      setUrlError('Please enter a valid URL');
    }
  }, [imageUrl]);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="image-url">Image URL</Label>
        <Input
          id="image-url"
          value={imageUrl}
          onChange={(e) => {
            setImageUrl(e.target.value);
            updateSlide(index, { content: e.target.value });
          }}
          placeholder="https://example.com/image.jpg"
          className="mt-1.5"
          aria-invalid={!!urlError}
        />
        {urlError && (
          <p className="text-sm text-destructive mt-1">{urlError}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          For best performance, use images under 5MB. Recommended formats: JPG, PNG, WebP.
        </p>
      </div>

      <div>
        <Label htmlFor="alt-text">Alt Text (optional)</Label>
        <Input
          id="alt-text"
          value={altText}
          onChange={(e) => {
            setAltText(e.target.value);
            updateSlide(index, { alt: e.target.value });
          }}
          placeholder="Description of the image"
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
