'use client';

import { useEffect, useState, useMemo } from 'react';
import { StoryViewer } from '@/components/story/StoryViewer';
import { BuilderSlide, BuilderTeleprompterSlide } from '@/lib/story-builder/types';
import type { AnySlide, StoryScript, TeleprompterSlide } from '@/lib/story/types';
import { useStoryStore } from '@/lib/stores/useStoryStore';
import { sanitizeText, sanitizeUrl } from '@/lib/story-builder/utils/xssProtection';
import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('StoryPreview');

type PreviewMessage = {
  type: 'UPDATE_STORY';
  payload: {
    slides: BuilderSlide[];
    activeSlideIndex: number | null;
  };
};

export function convertBuilderSlideToStorySlide(slide: BuilderSlide): AnySlide {
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
        content: sanitizeText(slide.content || ''),
        highlights: slide.highlights || [],
      };

    case 'widget-chart':
      return {
        ...baseSlide,
        type: 'widget-chart',
        data: slide.data || {},
      };

    case 'image':
      return {
        ...baseSlide,
        type: 'image',
        content: sanitizeUrl(slide.content || ''),
        alt: sanitizeText(slide.alt || ''),
      };

    case 'poll':
      return {
        ...baseSlide,
        type: 'poll',
        question: sanitizeText(slide.question || ''),
        options: (slide.options || []).map((opt) => ({
          id: typeof opt === 'string' ? opt : opt.id,
          text: sanitizeText(typeof opt === 'string' ? opt : opt.text),
          votes: typeof opt === 'string' ? 0 : opt.votes || 0,
        })),
      };

    case 'teleprompter': {
      const teleprompterSlide = slide as BuilderTeleprompterSlide;
      const result: TeleprompterSlide = {
        ...baseSlide,
        type: 'teleprompter',
        content: sanitizeText(teleprompterSlide.content || ''),
        duration: 'manual' as const,
        // Preserve all teleprompter settings with fallbacks for backward compatibility
        focalPoint: teleprompterSlide.focalPoint ?? 50,           // Default to center
        fontSize: teleprompterSlide.fontSize ?? 24,              // Default to 24px
        textAlign: teleprompterSlide.textAlign ?? 'left',        // Default to left
        lineHeight: teleprompterSlide.lineHeight ?? 1.4,         // Default to 1.4
        letterSpacing: teleprompterSlide.letterSpacing ?? 0,      // Default to 0
        scrollSpeed: teleprompterSlide.scrollSpeed ?? 'medium',  // Default to medium
        mirrorHorizontal: teleprompterSlide.mirrorHorizontal ?? false,  // Default to false
        mirrorVertical: teleprompterSlide.mirrorVertical ?? false,      // Default to false
        backgroundColor: teleprompterSlide.backgroundColor ?? '#000000', // Default to black
        backgroundOpacity: teleprompterSlide.backgroundOpacity ?? 100,   // Default to 100%
        safeAreaPadding: teleprompterSlide.safeAreaPadding ?? {         // Default to no padding
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      };
      return result;
    }

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
    logger.debug('Page mounted');
  }, []);

  useEffect(() => {
      logger.debug('Setting up message listener');
      
      const handleMessage = (event: MessageEvent<PreviewMessage>) => {
        logger.debug('Received message:', {
          type: event.data?.type,
          origin: event.origin,
          currentOrigin: window.location.origin,
          data: event.data
        });

        // Validate origin for security (relaxed for development)
        if (process.env.NODE_ENV === 'production' && event.origin !== window.location.origin) {
          logger.warn('Message rejected - origin mismatch');
          return;
        }

      if (event.data?.type === 'UPDATE_STORY') {
        logger.debug('Processing UPDATE_STORY:', event.data.payload);
        try {
          const { slides, activeSlideIndex } = event.data.payload;
          
          // Validate story data
          if (!Array.isArray(slides)) {
            throw new Error('Invalid slides data');
          }

          if (slides.length > 20) {
            throw new Error('Story cannot exceed 20 slides');
          }

          logger.debug('Setting story state:', { slidesCount: slides.length, activeSlideIndex });
          setStory({ slides, activeSlideIndex });
          setError(null);
        } catch (err) {
          logger.error('Failed to process story update:', err);
          setError('Invalid story data received');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    logger.debug('Message listener attached successfully');
    return () => {
      logger.debug('Cleaning up message listener');
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Navigate to the active slide when story updates
  useEffect(() => {
    if (story && story.activeSlideIndex !== null) {
      logger.debug('Navigating to slide:', story.activeSlideIndex);
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
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!story || story.slides.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p className="text-muted">Waiting for story data...</p>
      </div>
    );
  }

  return (
    <main className="h-screen w-full bg-black overflow-hidden overscroll-none">
      <style jsx global>{`
        html, body, #__next, [data-nextjs-scroll-focus-boundary] {
          height: 100% !important;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
      `}</style>
      <StoryViewer story={storyScript} />
    </main>
  );
}
