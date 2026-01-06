'use client';

import { useEffect, useState, useMemo } from 'react';
import { StoryViewer } from '@/components/story/StoryViewer';
import { BuilderSlide } from '@/lib/story-builder/types';
import type { AnySlide, StoryScript } from '@/lib/story/types';
import { useStoryStore } from '@/lib/stores/useStoryStore';
import { sanitizeText, sanitizeUrl } from '@/lib/story-builder/utils/xssProtection';

type PreviewMessage = {
  type: 'UPDATE_STORY';
  payload: {
    slides: BuilderSlide[];
    activeSlideIndex: number | null;
  };
};

function convertBuilderSlideToStorySlide(slide: BuilderSlide): AnySlide {
  const baseSlide = {
    id: slide.id,
    type: slide.type,
    duration: slide.duration,
    animation: slide.animation,
    effects: slide.effects,
  };

  switch (slide.type) {
    case 'text-highlight':
      return {
        ...baseSlide,
        type: 'text-highlight',
        content: sanitizeText((slide as any).content || ''),
        highlights: (slide as any).highlights || [],
      };

    case 'widget-chart':
      return {
        ...baseSlide,
        type: 'widget-chart',
        data: (slide as any).data || {},
      };

    case 'image':
      return {
        ...baseSlide,
        type: 'image',
        content: sanitizeUrl((slide as any).content || ''),
        alt: sanitizeText((slide as any).alt || ''),
      };

    case 'poll':
      return {
        ...baseSlide,
        type: 'poll',
        question: sanitizeText((slide as any).question || ''),
        options: ((slide as any).options || []).map((opt: string) => sanitizeText(opt)),
      };

    case 'teleprompter':
      return {
        ...baseSlide,
        type: 'teleprompter',
        content: sanitizeText((slide as any).content || ''),
        duration: 'manual' as const,
      };

    default:
      const exhaustiveCheck: never = slide;
      throw new Error(`Unknown slide type: ${exhaustiveCheck}`);
  }
}

export default function StoryPreviewPage() {
  const [story, setStory] = useState<{ slides: BuilderSlide[]; activeSlideIndex: number | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const goToSlide = useStoryStore(state => state.goToSlide);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<PreviewMessage>) => {
      // Validate origin for security
      if (event.origin !== window.location.origin) {
        console.warn('Rejected message from untrusted origin:', event.origin);
        return;
      }

      if (event.data?.type === 'UPDATE_STORY') {
        try {
          const { slides, activeSlideIndex } = event.data.payload;
          
          // Validate story data
          if (!Array.isArray(slides)) {
            throw new Error('Invalid slides data');
          }

          if (slides.length > 20) {
            throw new Error('Story cannot exceed 20 slides');
          }

          setStory({ slides, activeSlideIndex });
          setError(null);
        } catch (err) {
          console.error('Failed to process story update:', err);
          setError('Invalid story data received');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Navigate to the active slide when story updates
  useEffect(() => {
    if (story && story.activeSlideIndex !== null) {
      goToSlide(story.activeSlideIndex);
    }
  }, [story, goToSlide]);

  // Convert BuilderSlide to StoryScript format - must be before early returns
  const storyScript = useMemo<StoryScript>(() => {
    if (!story) {
      return {
        id: 'preview-story',
        title: 'Story Preview',
        slides: [],
        autoAdvance: true,
        showProgress: true,
        version: '1.0',
      };
    }
    
    return {
      id: 'preview-story',
      title: 'Story Preview',
      slides: story.slides.map(convertBuilderSlideToStorySlide),
      autoAdvance: true,
      showProgress: true,
      version: '1.0',
    };
  }, [story]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!story || story.slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p className="text-muted">Waiting for story data...</p>
      </div>
    );
  }

  return <StoryViewer story={storyScript} />;
}
