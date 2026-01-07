/**
 * Visual Story Builder Type Definitions
 *
 * Extends existing StoryScript types from lib/story/types.ts with
 * builder-specific state and UI management.
 *
 * @feature 013-visual-story-builder
 */

import type {
  AnySlide,
  SlideDuration,
  AnimationEffect,
  SlideEffects,
  TextHighlightSlide,
  WidgetChartSlide,
  ImageSlide,
  PollSlide,
  TeleprompterSlide
} from '../story/types';

// ============================================================================
// Builder Slide Types
// ============================================================================

/**
 * Slide types available in the story builder.
 * Maps to existing slide types from the story viewer.
 */
export type BuilderSlideType =
  | 'text-highlight'    // Text slide with highlights
  | 'image'            // Image from URL
  | 'teleprompter'     // Scrolling text overlay
  | 'poll'            // Interactive poll widget
  | 'widget-chart';    // Chart widget

/**
 * Base builder slide interface with common properties.
 */
export interface BaseBuilderSlide {
  id: string;                      // Unique slide ID (UUID v4)
  backgroundColor: string;         // Hex color (e.g., '#FFFFFF')
  animation?: AnimationEffect;     // Animation configuration
  effects?: SlideEffects;          // Visual effects
  
  // Builder-specific UI properties (transient)
  thumbnail?: string;              // Generated thumbnail URL
  isDragging?: boolean;            // Drag state
  isSelected?: boolean;            // Selection state
}

/**
 * Extended text highlight slide for builder.
 */
export type BuilderTextHighlightSlide = BaseBuilderSlide & Omit<TextHighlightSlide, 'id'>;

/**
 * Extended widget chart slide for builder.
 */
export type BuilderWidgetChartSlide = BaseBuilderSlide & Omit<WidgetChartSlide, 'id'>;

/**
 * Extended image slide for builder.
 */
export type BuilderImageSlide = BaseBuilderSlide & Omit<ImageSlide, 'id'>;

/**
 * Extended poll slide for builder.
 */
export type BuilderPollSlide = BaseBuilderSlide & Omit<PollSlide, 'id'>;

/**
 * Extended teleprompter slide for builder.
 */
export type BuilderTeleprompterSlide = BaseBuilderSlide & Omit<TeleprompterSlide, 'id'>;

/**
 * Union type for all builder slide types.
 * Compatible with AnySlide from the story viewer.
 */
export type BuilderSlide =
  | BuilderTextHighlightSlide
  | BuilderWidgetChartSlide
  | BuilderImageSlide
  | BuilderPollSlide
  | BuilderTeleprompterSlide;

// ============================================================================
// Slide Content Types
// ============================================================================

/**
 * Text slide content with formatting options.
 */
export interface TextContent {
  type: 'text-highlight';
  content: string;                 // Plain text content (max 500 chars)
  highlights: TextHighlight[];     // Formatted ranges
  
  // Builder-specific formatting
  textColor?: string;              // Hex color for text
  fontSize?: number;               // Pixel size (16-72)
  fontWeight?: 'normal' | 'bold';  // Font weight
  fontStyle?: 'normal' | 'italic'; // Font style
}

/**
 * Text highlight for formatted ranges.
 */
export interface TextHighlight {
  startIndex: number;              // 0-based character index
  endIndex: number;                // Exclusive end index
  color: string;                   // Hex color
  fontWeight?: 'normal' | 'bold';
}

/**
 * Image slide content with URL validation.
 */
export interface ImageContent {
  type: 'image';
  content: string;                 // Image URL (https://...)
  alt?: string;                    // Alt text for accessibility (max 200 chars)
  
  // Validation state (transient)
  isValid?: boolean;               // URL loads successfully
  error?: string;                  // Error message if invalid
}

/**
 * Teleprompter slide content with focal point control.
 */
export interface TeleprompterContent {
  type: 'teleprompter';
  content: string;                 // Text to scroll (max 1000 chars)
  duration: 'manual';              // Always manual for teleprompter
  
  // Builder-specific
  focalPoint: number;              // Vertical position (0-100%)
  fontSize?: number;               // Pixel size (16-48)
  textAlign?: 'left' | 'center' | 'right';  // Text alignment
  lineHeight?: number;             // Line height multiplier (default: 1.4)
  letterSpacing?: number;          // Letter spacing in pixels (default: 0)
  scrollSpeed?: 'slow' | 'medium' | 'fast';  // Scroll speed preset
  mirrorHorizontal?: boolean;      // Horizontal mirror mode
  mirrorVertical?: boolean;        // Vertical mirror mode
  backgroundColor?: string;        // Background color hex
  backgroundOpacity?: number;      // Background opacity (0-100)
  safeAreaPadding?: {              // Safe area padding in pixels
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

/**
 * Poll slide content with answer options.
 */
export interface PollContent {
  type: 'poll';
  question: string;                // Poll question (max 200 chars)
  options: PollOption[];           // Answer options (2-4 options)
}

/**
 * Poll answer option.
 */
export interface PollOption {
  id: string;                      // Unique option ID
  text: string;                    // Option text (max 100 chars)
  votes?: number;                  // Vote count (for display)
}

/**
 * Widget chart content.
 */
export interface WidgetContent {
  type: 'widget-chart';
  data: WidgetData;                // Chart configuration
}

/**
 * Chart data configuration.
 */
export interface WidgetData {
  type: WidgetChartType;           // 'bar' | 'line' | 'pie' | 'doughnut'
  title?: string;                  // Chart title (max 100 chars)
  labels: string[];                // X-axis labels or slice names (2-10 items)
  values: number[];                // Data values
  colors?: string[];               // Custom colors (hex)
}

/**
 * Chart types supported.
 */
export type WidgetChartType = 'bar' | 'line' | 'pie' | 'doughnut';

// ============================================================================
// Save Status
// ============================================================================

/**
 * Auto-save state for the story builder.
 */
export type SaveStatus =
  | 'saved'      // Successfully saved to localStorage
  | 'saving'     // Save in progress
  | 'unsaved'    // Changes pending save
  | 'error';     // Save failed (localStorage disabled/full)

// ============================================================================
// Template System
// ============================================================================

/**
 * Pre-built story template.
 * Uses AnySlide from the story viewer since templates are consumed by the viewer.
 */
export interface Template {
  id: string;                      // Unique template ID
  name: string;                    // Display name
  description: string;             // Short description
  thumbnail: string;               // Thumbnail image path
  slides: AnySlide[];              // Pre-configured slides (viewer format)
  
  // Metadata
  category?: TemplateCategory;     // For grouping
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: number;          // Minutes to customize
}

/**
 * Template categories.
 */
export type TemplateCategory = 'business' | 'education' | 'social';

/**
 * Default content union for all slide types.
 */
export type SlideDefaultContent =
  | TextContent
  | ImageContent
  | TeleprompterContent
  | PollContent
  | WidgetContent;

/**
 * Discriminated union for slide type definitions.
 * The `id` field discriminates which specific type is being used.
 */
export type SlideTypeDefinition =
  | TextSlideTypeDefinition
  | ImageSlideTypeDefinition
  | TeleprompterSlideTypeDefinition
  | PollSlideTypeDefinition
  | WidgetSlideTypeDefinition;

/**
 * Base fields shared by all slide type definitions.
 */
interface BaseSlideTypeDefinition {
  name: string;                    // Display name (e.g., "Text Slide")
  icon: string;                    // Lucide icon name (e.g., "Type")
  description: string;             // Short description
  defaultDuration: SlideDuration;  // Default duration (e.g., 5)
  defaultBackgroundColor: string;  // Default color (e.g., "#FFFFFF")
  
  // UI hints
  category?: SlideCategory;        // For grouping in library
  requiresMedia?: boolean;         // Needs external media
}

/**
 * Text slide type definition with typed default content.
 */
export interface TextSlideTypeDefinition extends BaseSlideTypeDefinition {
  id: 'text-highlight';
  defaultContent: TextContent;
}

/**
 * Image slide type definition with typed default content.
 */
export interface ImageSlideTypeDefinition extends BaseSlideTypeDefinition {
  id: 'image';
  defaultContent: ImageContent;
}

/**
 * Teleprompter slide type definition with typed default content.
 */
export interface TeleprompterSlideTypeDefinition extends BaseSlideTypeDefinition {
  id: 'teleprompter';
  defaultContent: TeleprompterContent;
}

/**
 * Poll slide type definition with typed default content.
 */
export interface PollSlideTypeDefinition extends BaseSlideTypeDefinition {
  id: 'poll';
  defaultContent: PollContent;
}

/**
 * Widget chart slide type definition with typed default content.
 */
export interface WidgetSlideTypeDefinition extends BaseSlideTypeDefinition {
  id: 'widget-chart';
  defaultContent: WidgetContent;
}

/**
 * Slide categories for library grouping.
 */
export type SlideCategory = 'content' | 'media' | 'interactive';

// ============================================================================
// Story Builder State
// ============================================================================

/**
 * Main state container for the story builder interface.
 */
export interface StoryBuilderState {
  slides: BuilderSlide[];          // Ordered array of slides (max 20)
  activeSlideIndex: number;        // Currently selected slide (0-based)
  saveStatus: SaveStatus;          // Auto-save state
  isTemplateModalOpen: boolean;    // Template gallery visibility
  lastModified: number;            // Unix timestamp (ms)
}

// ============================================================================
// Auto-Save Entities
// ============================================================================

/**
 * Stored in localStorage for persistence.
 */
export interface AutoSaveDraft {
  id: string;                      // 'story-builder-draft'
  slides: AnySlide[];              // Current slide array
  activeSlideIndex: number;        // Active slide position
  savedAt: number;                 // Unix timestamp (ms)
  version: string;                 // Draft format version
}

/**
 * Storage key for auto-save draft.
 */
export const DRAFT_STORAGE_KEY = 'story-builder-draft';

// ============================================================================
// UI State Entities
// ============================================================================

/**
 * Transient state for drag-and-drop operations.
 */
export interface DragState {
  isDragging: boolean;             // Active drag operation
  draggedSlideId?: string;         // ID of slide being dragged
  draggedSlideType?: SlideTypeDefinition; // Type from library
  dropTargetIndex?: number;        // Target position in rail
  dragPosition?: { x: number; y: number }; // Current cursor position
}

/**
 * State for the preview iframe.
 */
export interface PreviewState {
  isLoading: boolean;              // Preview loading
  currentSlideIndex: number;       // Previewed slide
  isFullscreen: boolean;           // Fullscreen mode
  syncStatus: 'synced' | 'pending' | 'error';
}

// ============================================================================
// Action Types
// ============================================================================

/**
 * Union type for all builder actions (for undo/redo).
 */
export type BuilderAction =
  | AddSlideAction
  | RemoveSlideAction
  | ReorderSlidesAction
  | UpdateSlideAction
  | LoadTemplateAction
  | ClearStoryAction;

/**
 * Add slide action.
 */
export interface AddSlideAction {
  type: 'addSlide';
  payload: {
    slideType: BuilderSlideType;
    position: number;
  };
}

/**
 * Remove slide action.
 */
export interface RemoveSlideAction {
  type: 'removeSlide';
  payload: {
    index: number;
  };
}

/**
 * Reorder slides action.
 */
export interface ReorderSlidesAction {
  type: 'reorderSlides';
  payload: {
    fromIndex: number;
    toIndex: number;
  };
}

/**
 * Update slide action.
 */
export interface UpdateSlideAction {
  type: 'updateSlide';
  payload: {
    index: number;
    updates: Partial<BuilderSlide>;
  };
}

/**
 * Load template action.
 */
export interface LoadTemplateAction {
  type: 'loadTemplate';
  payload: {
    templateId: string;
  };
}

/**
 * Clear story action.
 */
export interface ClearStoryAction {
  type: 'clearStory';
  payload: Record<string, never>;
}

// ============================================================================
// Multi-Device Preview Types
// ============================================================================

/**
 * Grid layout configuration for multi-device preview.
 * Each configuration defines the maximum number of device slots.
 */
export type GridConfig = '1x' | '2x' | '2x2' | '3x2';

/**
 * Number of slots available for each grid configuration.
 */
export const GRID_SLOT_COUNTS: Readonly<Record<GridConfig, number>> = {
  '1x': 1,
  '2x': 2,
  '2x2': 4,
  '3x2': 6,
} as const;

/**
 * State for multi-device preview mode.
 */
export interface MultiDevicePreviewState {
  /** Toggle state for multi-device mode */
  enabled: boolean;
  /** Grid layout configuration */
  gridConfig: GridConfig;
  /** Array of enabled device type IDs */
  enabledDeviceTypes: string[];
  /** Priority order for device display */
  deviceOrder: string[];
  /** Drag-and-drop state */
  isDragging: boolean;
  /** Currently dragged device ID */
  draggedDeviceId: string | null;
}

/**
 * Actions for multi-device preview state.
 */
export interface MultiDevicePreviewActions {
  /** Enable/disable multi-device mode */
  setEnabled: (enabled: boolean) => void;
  /** Update grid configuration */
  setGridConfig: (config: GridConfig) => void;
  /** Toggle a device type on/off */
  toggleDeviceType: (deviceTypeId: string) => void;
  /** Reorder devices by moving from one index to another */
  reorderDevices: (fromIndex: number, toIndex: number) => void;
  /** Reset all settings to defaults */
  resetToDefaults: () => void;
  /** Set drag-and-drop state */
  setDraggingState: (isDragging: boolean, deviceId: string | null) => void;
}

/**
 * Combined state and actions type for Zustand store.
 */
export type MultiDevicePreviewStore = MultiDevicePreviewState & MultiDevicePreviewActions;

/**
 * Preferences schema for localStorage persistence.
 */
export interface MultiDevicePreviewPreferences {
  /** Multi-device mode toggle state */
  enabled: boolean;
  /** Grid layout configuration */
  gridConfig: GridConfig;
  /** Array of enabled device type IDs */
  enabledDeviceTypes: string[];
  /** Priority order for device display */
  deviceOrder: string[];
  /** Timestamp for migration */
  lastUpdated: number;
}

/**
 * Default preferences for multi-device preview.
 */
export const DEFAULT_MULTI_DEVICE_PREFERENCES: MultiDevicePreviewPreferences = {
  enabled: false,
  gridConfig: '2x',
  enabledDeviceTypes: ['iphone-se', 'iphone-14-pro'],
  deviceOrder: ['iphone-se', 'iphone-14-pro', 'ipad-air', 'desktop'],
  lastUpdated: Date.now(),
} as const;

/**
 * Storage key for multi-device preview preferences.
 */
export const MULTI_DEVICE_STORAGE_KEY = 'teleprompter-multi-device-preview';

/**
 * Memory thresholds for multi-device preview (in MB).
 */
export const MEMORY_THRESHOLDS = {
  /** Warning threshold - show toast notification */
  WARNING: 250,
  /** Hard limit - prevent enabling more devices */
  HARD_LIMIT: 350,
  /** Base memory per iframe */
  BASE_PER_IFRAME: 50,
  /** Memory per 1000 characters of content */
  CONTENT_PER_1000_CHARS: 5,
} as const;
