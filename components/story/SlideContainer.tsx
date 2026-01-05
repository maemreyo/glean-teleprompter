/**
 * Slide Container Component
 *
 * Wraps each slide with Framer Motion transitions.
 * Handles slide-in, fade, and zoom animations with direction support.
 *
 * @feature 012-standalone-story
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoryStore } from '@/lib/stores/useStoryStore';
import { TextHighlightSlide } from './SlideTypes/TextHighlightSlide';
import { WidgetChartSlide } from './SlideTypes/WidgetChartSlide';
import { ImageSlide } from './SlideTypes/ImageSlide';
import { PollSlide } from './SlideTypes/PollSlide';
import type { AnySlide, AnimationEffect } from '@/lib/story/types';

export interface SlideContainerProps {
  slide: AnySlide;
  index: number;
  isCurrent: boolean;
}

/**
 * Animation variants for slide transitions
 */
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    zIndex: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.95,
    zIndex: 0,
  }),
};

const fadeVariants = {
  enter: {
    opacity: 0,
    scale: 0.95,
  },
  center: {
    opacity: 1,
    scale: 1,
    zIndex: 1,
  },
  exit: {
    opacity: 0,
    scale: 1.05,
    zIndex: 0,
  },
};

const zoomVariants = {
  enter: {
    scale: 0.8,
    opacity: 0,
  },
  center: {
    scale: 1,
    opacity: 1,
    zIndex: 1,
  },
  exit: {
    scale: 1.1,
    opacity: 0,
    zIndex: 0,
  },
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
function getTransition(animation?: AnimationEffect) {
  // Default simple transition
  if (!animation) {
    return {
      duration: 0.3,
      ease: 'easeOut',
    } as const;
  }

  const duration = animation.duration / 1000; // Convert ms to seconds

  // Return simple transition - Framer Motion will accept these string values
  // Using 'as any' to bypass Framer Motion's strict typing for ease strings
  return {
    duration,
    ease: animation.easing || 'easeOut',
  } as any;
}

/**
 * Render the appropriate slide component based on slide type
 */
function renderSlide(slide: AnySlide): React.ReactNode {
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
      return (
        <div className="flex h-full w-full items-center justify-center">
          <p className="text-white text-center">
            Teleprompter slide - TeleprompterSlide component will be implemented in Phase 4
          </p>
        </div>
      );
    default:
      return (
        <div className="flex h-full w-full items-center justify-center">
          <p className="text-white text-center">Unknown slide type</p>
        </div>
      );
  }
}

/**
 * Slide container with transition animations
 */
export function SlideContainer({ slide, index, isCurrent }: SlideContainerProps): React.ReactElement {
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
          transition={transition}
          className="absolute inset-0 flex items-center justify-center"
        >
          {renderSlide(slide)}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
