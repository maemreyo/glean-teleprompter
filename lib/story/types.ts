/**
 * Standalone Story with Teleprompter - Type Definitions
 * Feature: 012-standalone-story
 * @see specs/012-standalone-story/data-model.md
 */

// ============================================================================
// Slide Types
// ============================================================================

export type SlideType = 'text-highlight' | 'widget-chart' | 'image' | 'poll' | 'teleprompter';
export type SlideDuration = number | 'manual';

export type AnimationType = 'slide-in' | 'fade' | 'zoom';
export type AnimationDirection = 'left' | 'right' | 'up' | 'down';

export type WidgetChartType = 'bar' | 'line' | 'pie' | 'doughnut';

// ============================================================================
// Base Slide Interface
// ============================================================================

export interface Slide {
  id: string;
  type: SlideType;
  duration: SlideDuration;
  animation?: AnimationEffect;
  effects?: SlideEffects;
}

// ============================================================================
// Animation Effects
// ============================================================================

export interface AnimationEffect {
  type: AnimationType;
  direction?: AnimationDirection;
  duration: number;
  easing?: string;
}

// ============================================================================
// Slide Effects
// ============================================================================

export interface SlideEffects {
  glow?: GlowEffect;
  shadow?: ShadowEffect;
  backdrop?: BackdropEffect;
}

export interface GlowEffect {
  color: string;
  intensity: number;
  blur: number;
}

export interface ShadowEffect {
  color: string;
  offsetX: number;
  offsetY: number;
  blur: number;
}

export interface BackdropEffect {
  type: 'blur' | 'gradient' | 'solid';
  value: string;
  opacity: number;
}

// ============================================================================
// Type-Specific Slide Interfaces
// ============================================================================

export interface TextHighlightSlide extends Slide {
  type: 'text-highlight';
  content: string;
  highlights: TextHighlight[];
}

export interface TextHighlight {
  startIndex: number;
  endIndex: number;
  color: string;
  fontWeight?: 'normal' | 'bold';
}

export interface WidgetChartSlide extends Slide {
  type: 'widget-chart';
  data: WidgetData;
}

export interface WidgetData {
  type: WidgetChartType;
  title?: string;
  labels: string[];
  values: number[];
  colors?: string[];
}

export interface ImageSlide extends Slide {
  type: 'image';
  content: string; // Image URL
  alt?: string;
}

export interface PollSlide extends Slide {
  type: 'poll';
  question: string;
  options: PollOption[];
}

export interface PollOption {
  id: string;
  text: string;
  votes?: number;
}

export interface TeleprompterSlide extends Slide {
  type: 'teleprompter';
  content: string;
  duration: 'manual'; // Always manual for teleprompter
  /** Focal point position for optimal reading area (0-100, where 50 is center) */
  focalPoint?: number;
  /** Font size in pixels for teleprompter text (16-72, default: 24) */
  fontSize?: number;
  /** Text alignment for teleprompter content (default: 'left') */
  textAlign?: 'left' | 'center' | 'right';
  /** Line height multiplier for teleprompter text (default: 1.4) */
  lineHeight?: number;
  /** Letter spacing in pixels (default: 0) */
  letterSpacing?: number;
  /** Scroll speed preset (default: 'medium') */
  scrollSpeed?: 'slow' | 'medium' | 'fast';
  /** Horizontal mirror mode for teleprompter display (default: false) */
  mirrorHorizontal?: boolean;
  /** Vertical mirror mode for teleprompter display (default: false) */
  mirrorVertical?: boolean;
  /** Background color for teleprompter (default: '#000000') */
  backgroundColor?: string;
  /** Background opacity percentage (0-100, default: 100) */
  backgroundOpacity?: number;
  /** Safe area padding for teleprompter content in pixels */
  safeAreaPadding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

// Union type for all slide types
export type AnySlide =
  | TextHighlightSlide
  | WidgetChartSlide
  | ImageSlide
  | PollSlide
  | TeleprompterSlide;

// ============================================================================
// Story Script
// ============================================================================

export interface StoryScript {
  id: string;
  title: string;
  slides: AnySlide[];
  autoAdvance: boolean;
  showProgress: boolean;
  createdAt?: number;
  version: '1.0';
}

// ============================================================================
// Teleprompter Runtime State
// ============================================================================

export interface TeleprompterState {
  slideId: string;
  scrollSpeed: number;
  fontSize: number;
  isScrolling: boolean;
  isMirrored: boolean;
  scrollPosition: number;
  scrollDepth: number;
  totalScrollHeight: number;
  wpm: number;
}

// ============================================================================
// Reading Progress (localStorage)
// ============================================================================

export interface ReadingProgress {
  slideId: string;
  scrollRatio: number;
  timestamp: number;
  storyId: string;
}

// ============================================================================
// Story Navigation State (Zustand)
// ============================================================================

export interface StoryState {
  currentSlideIndex: number;
  direction: number; // 1 for forward, -1 for backward
  isPaused: boolean;
  slideProgress: number; // 0.0 - 1.0 progress for current slide
  progressOverride: number | null; // Manual override for teleprompter slides
}

export interface StoryActions {
  nextSlide: () => void;
  previousSlide: () => void;
  goToSlide: (index: number) => void;
  togglePause: () => void;
  setSlideProgress: (progress: number) => void;
  setProgressOverride: (override: number | null) => void;
  reset: () => void;
}

export type StoryStore = StoryState & StoryActions;

// ============================================================================
// Teleprompter Store State (Zustand)
// ============================================================================

export interface TeleprompterStoreState {
  scrollSpeed: number;
  fontSize: number;
  isScrolling: boolean;
  isMirrored: boolean;
  scrollPosition: number;
  scrollDepth: number;
}

export interface TeleprompterStoreActions {
  setScrollSpeed: (speed: number) => void;
  setFontSize: (size: number) => void;
  startScrolling: () => void;
  stopScrolling: () => void;
  toggleMirror: () => void;
  updateScrollPosition: (position: number, depth: number) => void;
  reset: () => void;
}

export type TeleprompterStore = TeleprompterStoreState & TeleprompterStoreActions;

// ============================================================================
// Validation Results
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

// ============================================================================
// URL Encoding Types
// ============================================================================

export interface EncodedStoryData {
  data: string; // Base64 + gzip compressed JSON
}

export interface DecodedStoryResult {
  success: boolean;
  data?: StoryScript;
  error?: string;
}
