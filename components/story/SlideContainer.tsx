"use client";

/**
 * Slide Container Component
 *
 * Wraps each slide with Framer Motion transitions.
 * Handles slide-in, fade, and zoom animations with direction support.
 *
 * @feature 012-standalone-story
 */

import React from 'react';
import { motion, AnimatePresence, Transition } from 'framer-motion';
import { useStoryStore } from '@/lib/stores/useStoryStore';
import { TextHighlightSlide } from './SlideTypes/TextHighlightSlide';
import { WidgetChartSlide } from './SlideTypes/WidgetChartSlide';
import { ImageSlide } from './SlideTypes/ImageSlide';
import { PollSlide } from './SlideTypes/PollSlide';
import { TeleprompterSlide } from './SlideTypes/TeleprompterSlide';
import type { AnySlide, AnimationEffect } from '@/lib/story/types';

export interface SlideContainerProps {
  slide: AnySlide;
  index: number;
  isCurrent: boolean;
  totalSlides?: number;
}

/**
 * Animation variants for slide transitions
 */
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.95,
  }) as const,
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    zIndex: 1,
  } as const,
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.95,
    zIndex: 0,
  }) as const,
};

const fadeVariants = {
  enter: {
    opacity: 0,
    scale: 0.95,
  } as const,
  center: {
    opacity: 1,
    scale: 1,
    zIndex: 1,
  } as const,
  exit: {
    opacity: 0,
    scale: 1.05,
    zIndex: 0,
  } as const,
};

const zoomVariants = {
  enter: {
    scale: 0.8,
    opacity: 0,
  } as const,
  center: {
    scale: 1,
    opacity: 1,
    zIndex: 1,
  } as const,
  exit: {
    scale: 1.1,
    opacity: 0,
    zIndex: 0,
  } as const,
};

/**
 * Get animation variants based on animation type
 */
function getVariants(animation?: AnimationEffect) {
  if (!animation) {
    return fadeVariants;
  }

  switch (animation.type) {
    case 'slide-in':
      return slideVariants;
    case 'fade':
      return fadeVariants;
    case 'zoom':
      return zoomVariants;
    default:
      return fadeVariants;
  }
}

/**
 * Get transition configuration based on animation
 */
function getTransition(animation?: AnimationEffect): Transition {
  // Default simple transition
  if (!animation) {
    return {
      duration: 0.3,
      ease: 'easeOut' as const,
    };
  }

  const duration = animation.duration / 1000; // Convert ms to seconds

  // Return properly typed transition configuration
  // Framer Motion's Easing type accepts string values like 'easeOut', 'easeIn', etc.
  return {
    duration,
    ease: (animation.easing || 'easeOut') as Transition['ease'],
  };
}

/**
 * Render the appropriate slide component based on slide type
 */
function renderSlide(slide: AnySlide, slideIndex: number, totalSlides = 1): React.ReactNode {
  switch (slide.type) {
    case 'text-highlight':
      return <TextHighlightSlide slide={slide} />;
    case 'widget-chart':
      return <WidgetChartSlide slide={slide} />;
    case 'image':
      return <ImageSlide slide={slide} />;
    case 'poll':
      return <PollSlide slide={slide} />;
    case 'teleprompter':
      return <TeleprompterSlide slide={slide} slideIndex={slideIndex} totalSlides={totalSlides} />;
    default: {
      // Exhaustiveness check - ensure all slide types are handled
      const _exhaustiveCheck: never = slide;
      return (
        <div className="flex h-full w-full items-center justify-center">
          <p className="text-white text-center">Unknown slide type</p>
        </div>
      );
    }
  }
}

/**
 * Slide container with transition animations
 */
export function SlideContainer({ slide, index, isCurrent, totalSlides }: SlideContainerProps): React.JSX.Element {
  const { direction } = useStoryStore();
  const animation = slide.animation;

  const variants = getVariants(animation);
  const transition = getTransition(animation);

  return (
    <AnimatePresence initial={false} custom={direction}>
      {isCurrent && (
        <motion.div
          key={slide.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transition satisfies Transition}
          className="absolute inset-0 flex items-center justify-center h-full w-full"
        >
          {renderSlide(slide, index, totalSlides)}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
