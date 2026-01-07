/**
 * Visual Story Builder - Zustand Store
 *
 * Global state management for the story builder interface.
 * Handles slide management, auto-save, template loading, and URL generation.
 *
 * @feature 013-visual-story-builder
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import type {
  BuilderSlide,
  BuilderSlideType,
  SaveStatus,
  StoryBuilderState,
  AutoSaveDraft,
  Template,
} from './types';
import { DRAFT_STORAGE_KEY } from './types';
import { encodeStoryForUrl } from '../story/utils/urlEncoder';
import { MAX_SLIDES, AUTO_SAVE_INTERVAL, MAX_URL_LENGTH } from './constants';
import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('StoryBuilderStore');

// ============================================================================
// Store Interface
// ============================================================================

interface HistoryState {
  slides: BuilderSlide[];
  activeSlideIndex: number;
  timestamp: number;
}

interface StoryBuilderStore extends StoryBuilderState {
  // Slide Management Actions
  addSlide: (type: BuilderSlideType, position?: number) => void;
  removeSlide: (index: number) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  updateSlide: (index: number, updates: Partial<BuilderSlide>) => void;
  setActiveSlide: (index: number) => void;
  
  // Story Operations
  generateUrl: () => string;
  loadTemplate: (template: Template) => void;
  clearStory: () => void;
  
  // Auto-Save Actions
  autoSave: () => Promise<void>;
  restoreDraft: () => void;
  handleStorageEvent: (event: StorageEvent) => void;
  
  // Undo/Redo Actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Internal state
  _autoSaveTimer: ReturnType<typeof setInterval> | null;
  _history: HistoryState[];
  _historyIndex: number;
  _maxHistorySize: number;
}

// ============================================================================
// Slide Type Default Contents
// ============================================================================

/**
 * Create a new slide with default content for the specified type.
 * Returns a properly typed BuilderSlide based on the slide type.
 */
const createDefaultSlide = (type: BuilderSlideType): BuilderSlide => {
  const baseProps = {
    animation: { type: 'fade' as const, duration: 300 },
    effects: undefined,
    thumbnail: undefined,
    isDragging: false,
    isSelected: false,
  };

  switch (type) {
    case 'text-highlight':
      return {
        ...baseProps,
        id: uuidv4(),
        type: 'text-highlight',
        duration: 5,
        backgroundColor: '#FFFFFF',
        content: 'Your text here',
        highlights: [],
      } as BuilderSlide;

    case 'image':
      return {
        ...baseProps,
        id: uuidv4(),
        type: 'image',
        duration: 5,
        backgroundColor: '#FFFFFF',
        content: '',
        alt: '',
      } as BuilderSlide;

    case 'teleprompter':
      return {
        ...baseProps,
        id: uuidv4(),
        type: 'teleprompter',
        duration: 'manual',
        backgroundColor: '#000000', // Use teleprompter default (black)
        content: 'Your scrolling text here',
        focalPoint: 50,        // Center position (0-100)
        fontSize: 24,          // Default font size in pixels (16-72)
        textAlign: 'left',     // Default text alignment
        lineHeight: 1.4,       // Default line height multiplier
        letterSpacing: 0,      // Default letter spacing in pixels
        scrollSpeed: 'medium', // Default scroll speed preset
        mirrorHorizontal: false, // No horizontal mirroring by default
        mirrorVertical: false,   // No vertical mirroring by default
        backgroundOpacity: 100,    // Full opacity by default
        safeAreaPadding: {         // No padding by default
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      } as BuilderSlide;

    case 'poll':
      return {
        ...baseProps,
        id: uuidv4(),
        type: 'poll',
        duration: 10,
        backgroundColor: '#FFFFFF',
        question: 'Your question here?',
        options: [
          { id: uuidv4(), text: 'Option 1' },
          { id: uuidv4(), text: 'Option 2' },
        ],
      } as BuilderSlide;

    case 'widget-chart':
      return {
        ...baseProps,
        id: uuidv4(),
        type: 'widget-chart',
        duration: 5,
        backgroundColor: '#FFFFFF',
        data: {
          type: 'bar',
          title: 'Chart Title',
          labels: ['A', 'B', 'C'],
          values: [10, 20, 30],
          colors: ['#8B5CF6', '#EC4899', '#F97316'],
        },
      } as BuilderSlide;

    default:
      const exhaustiveCheck: never = type;
      throw new Error(`Unknown slide type: ${exhaustiveCheck}`);
  }
};

// ============================================================================
// Store Implementation
// ============================================================================

/**
 * Helper function to save current state to history before mutations.
 * This should be called before any state-changing operation.
 */
const saveToHistory = (get: () => StoryBuilderStore) => {
  const state = get();
  
  // Don't save if no changes
  if (state.slides.length === 0) {
    return;
  }

  // Create history entry
  const historyEntry: HistoryState = {
    slides: JSON.parse(JSON.stringify(state.slides)),
    activeSlideIndex: state.activeSlideIndex,
    timestamp: Date.now(),
  };

  // Remove any forward history (redo stack) when new action is performed
  const newHistory = state._history.slice(0, state._historyIndex + 1);
  
  // Add new entry
  newHistory.push(historyEntry);
  
  // Limit history size
  if (newHistory.length > state._maxHistorySize) {
    newHistory.shift();
  }

  // Update history state
  useStoryBuilderStore.setState({
    _history: newHistory,
    _historyIndex: newHistory.length - 1,
  });
};

export const useStoryBuilderStore = create<StoryBuilderStore>((set, get) => ({
  // Initial State
  slides: [],
  activeSlideIndex: 0,
  saveStatus: 'saved',
  isTemplateModalOpen: false,
  lastModified: Date.now(),
  _autoSaveTimer: null,
  _history: [],
  _historyIndex: -1,
  _maxHistorySize: 50,

  // ============================================================================
  // Slide Management Actions
  // ============================================================================

  /**
   * Add a new slide of the specified type at the given position.
   * Validates slide count limit (max 20).
   */
  addSlide: (type: BuilderSlideType, position?: number) => {
    const state = get();

    // Validate slide count
    if (state.slides.length >= MAX_SLIDES) {
      toast.error(`Cannot add more slides. Maximum ${MAX_SLIDES} slides per story.`);
      return;
    }

    // Save to history before mutation
    saveToHistory(get);

    // Create new slide with default content
    const newSlide = createDefaultSlide(type);

    // Insert at specified position or append to end
    const insertIndex = position !== undefined ? Math.min(position, state.slides.length) : state.slides.length;
    const updatedSlides = [
      ...state.slides.slice(0, insertIndex),
      newSlide,
      ...state.slides.slice(insertIndex),
    ];

    set({
      slides: updatedSlides,
      activeSlideIndex: insertIndex,
      saveStatus: 'unsaved',
      lastModified: Date.now(),
    });
  },

  /**
   * Remove a slide at the specified index.
   * Adjusts activeSlideIndex if needed.
   */
  removeSlide: (index: number) => {
    const state = get();

    // Validate index
    if (index < 0 || index >= state.slides.length) {
      toast.error(`Cannot remove slide: index ${index} out of bounds`);
      return;
    }

    // Save to history before mutation
    saveToHistory(get);

    const updatedSlides = state.slides.filter((_, i) => i !== index);
    
    // Adjust active slide index
    let newActiveIndex = state.activeSlideIndex;
    if (updatedSlides.length === 0) {
      newActiveIndex = 0;
    } else if (state.activeSlideIndex >= updatedSlides.length) {
      newActiveIndex = updatedSlides.length - 1;
    }

    set({
      slides: updatedSlides,
      activeSlideIndex: newActiveIndex,
      saveStatus: 'unsaved',
      lastModified: Date.now(),
    });
  },

  /**
   * Reorder slides by moving from one index to another.
   */
  reorderSlides: (fromIndex: number, toIndex: number) => {
    const state = get();

    // Validate indices
    if (
      fromIndex < 0 ||
      fromIndex >= state.slides.length ||
      toIndex < 0 ||
      toIndex >= state.slides.length
    ) {
      toast.error('Cannot reorder slides: index out of bounds');
      return;
    }

    if (fromIndex === toIndex) {
      return; // No change needed
    }

    // Save to history before mutation
    saveToHistory(get);

    const updatedSlides = [...state.slides];
    const [movedSlide] = updatedSlides.splice(fromIndex, 1);
    updatedSlides.splice(toIndex, 0, movedSlide);

    set({
      slides: updatedSlides,
      activeSlideIndex: toIndex,
      saveStatus: 'unsaved',
      lastModified: Date.now(),
    });
  },

  /**
   * Update properties of an existing slide.
   * Performs shallow merge with existing slide data.
   */
  updateSlide: (index: number, updates: Partial<BuilderSlide>) => {
    const state = get();

    // Validate index
    if (index < 0 || index >= state.slides.length) {
      toast.error(`Cannot update slide: index ${index} out of bounds`);
      return;
    }

    // Save to history before mutation
    saveToHistory(get);

    const updatedSlides = [...state.slides];
    const currentSlide = updatedSlides[index];
    
    // Merge updates while preserving id and type
    // Use type assertion since we're preserving the slide's type structure
    updatedSlides[index] = {
      ...currentSlide,
      ...updates,
      id: currentSlide.id,
      type: currentSlide.type,
    } as BuilderSlide;

    set({
      slides: updatedSlides,
      saveStatus: 'unsaved',
      lastModified: Date.now(),
    });
  },

  /**
    * Set the active slide index.
    */
  setActiveSlide: (index: number) => {
    const state = get();

    logger.debug('setActiveSlide called:', {
      newIndex: index,
      currentIndex: state.activeSlideIndex,
      slidesCount: state.slides.length,
      isValid: index >= 0 && index < state.slides.length
    });

    // Validate index
    if (index < 0 || index >= state.slides.length) {
      logger.error('setActiveSlide validation failed:', { index, slidesCount: state.slides.length });
      toast.error(`Cannot set active slide: index ${index} out of bounds`);
      return;
    }

    logger.debug('Updating activeSlideIndex to:', index);
    set({
      activeSlideIndex: index,
    });
  },

  // ============================================================================
  // Story Operations
  // ============================================================================

  /**
   * Generate a shareable URL for the current story.
   * Uses existing URL encoder from lib/story/utils/urlEncoder.ts
   */
  generateUrl: () => {
    const state = get();

    if (state.slides.length === 0) {
      toast.error('Cannot generate URL: no slides in story');
      return '';
    }

    try {
      // Convert BuilderSlide to AnySlide by removing builder-specific properties
      const slidesForUrl = state.slides.map(
        ({ thumbnail, isDragging, isSelected, ...slide }) => slide
      );

      const storyScript = {
        id: uuidv4(),
        title: 'Story Builder Story',
        slides: slidesForUrl,
        autoAdvance: true,
        showProgress: true,
        version: '1.0' as const,
      };

      const encoded = encodeStoryForUrl(storyScript);
      
      // Check URL length limit (32KB)
      if (encoded.length > MAX_URL_LENGTH) {
        toast.error('Story URL is too long. Try reducing slide count or content size.');
        return '';
      }

      return encoded;
    } catch (error) {
      console.error('Failed to generate URL:', error);
      toast.error('Failed to generate URL. Please try again.');
      return '';
    }
  },

  /**
   * Load a template into the story builder.
   * Generates new UUIDs for all template slides.
   */
  loadTemplate: (template: Template) => {
    const slidesWithIds: BuilderSlide[] = template.slides.map((slide) => ({
      ...slide,
      id: uuidv4(),
      thumbnail: undefined,
      isDragging: false,
      isSelected: false,
    })) as BuilderSlide[];

    set({
      slides: slidesWithIds,
      activeSlideIndex: 0,
      saveStatus: 'unsaved',
      lastModified: Date.now(),
    });
  },

  /**
   * Clear all slides from the story.
   */
  clearStory: () => {
    set({
      slides: [],
      activeSlideIndex: 0,
      saveStatus: 'unsaved',
      lastModified: Date.now(),
    });
  },

  // ============================================================================
  // Auto-Save Actions
  // ============================================================================

  /**
   * Auto-save current story to localStorage.
   * Handles localStorage disabled and quota exceeded errors.
   */
  autoSave: async () => {
    const state = get();

    // Skip if already saved or saving
    if (state.saveStatus === 'saved' || state.saveStatus === 'saving') {
      return;
    }

    set({ saveStatus: 'saving' });

    try {
      // Check if localStorage is available
      if (typeof window === 'undefined' || !window.localStorage) {
        set({ saveStatus: 'error' });
        return;
      }

      // Convert BuilderSlide to AnySlide for storage
      const slidesForStorage = state.slides.map(
        ({ thumbnail, isDragging, isSelected, ...slide }) => slide
      );

      const draft: AutoSaveDraft = {
        id: DRAFT_STORAGE_KEY,
        slides: slidesForStorage,
        activeSlideIndex: state.activeSlideIndex,
        savedAt: Date.now(),
        version: '1.0',
      };

      // Save to localStorage
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));

      set({ saveStatus: 'saved' });
    } catch (error) {
      // Handle QuotaExceededError
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded:', error);
        toast.error('Storage quota exceeded. Please clear some data.');
      } else {
        console.error('Failed to auto-save:', error);
        toast.error('Failed to auto-save. Please check your browser settings.');
      }
      set({ saveStatus: 'error' });
    }
  },

  /**
   * Restore draft from localStorage on page load.
   */
  restoreDraft: () => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }

      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!savedDraft) {
        return;
      }

      const draft: AutoSaveDraft = JSON.parse(savedDraft);

      // Convert back to BuilderSlide with builder properties
      const slidesWithBuilderProps: BuilderSlide[] = draft.slides.map((slide) => ({
        ...slide,
        id: slide.id || uuidv4(),
        backgroundColor: '#FFFFFF',
        thumbnail: undefined,
        isDragging: false,
        isSelected: false,
      }));

      set({
        slides: slidesWithBuilderProps,
        activeSlideIndex: draft.activeSlideIndex,
        saveStatus: 'saved',
        lastModified: draft.savedAt,
      });
    } catch (error) {
      console.error('Failed to restore draft:', error);
      toast.error('Failed to restore draft from storage.');
    }
  },

  /**
   * Handles storage events for cross-tab synchronization
   * @param event - The storage event containing draft changes
   */
  handleStorageEvent: (event: StorageEvent) => {
    if (event.key === DRAFT_STORAGE_KEY && event.newValue) {
      // Draft was updated in another tab
      // For now, just restore it silently
      // In a full implementation, this would show a toast warning
      get().restoreDraft();
    }
  },

  // ============================================================================
  // Undo/Redo Actions
  // ============================================================================

  /**
   * Undo the last action by reverting to the previous history state.
   */
  undo: () => {
    const state = get();
    
    if (state._historyIndex < 0) {
      return; // Nothing to undo
    }

    const previousState = state._history[state._historyIndex];
    
    set({
      slides: previousState.slides,
      activeSlideIndex: previousState.activeSlideIndex,
      saveStatus: 'unsaved',
      lastModified: Date.now(),
      _historyIndex: state._historyIndex - 1,
    });
  },

  /**
   * Redo the next action by moving forward in history.
   */
  redo: () => {
    const state = get();
    
    if (state._historyIndex >= state._history.length - 1) {
      return; // Nothing to redo
    }

    const nextStateIndex = state._historyIndex + 1;
    const nextState = state._history[nextStateIndex];
    
    set({
      slides: nextState.slides,
      activeSlideIndex: nextState.activeSlideIndex,
      saveStatus: 'unsaved',
      lastModified: Date.now(),
      _historyIndex: nextStateIndex,
    });
  },

  /**
   * Check if undo is available (has history to revert to).
   */
  canUndo: () => {
    return get()._historyIndex >= 0;
  },

  /**
   * Check if redo is available (has forward history).
   */
  canRedo: () => {
    const state = get();
    return state._historyIndex < state._history.length - 1;
  },
}));

// ============================================================================
// Auto-Save Timer Hook
// ============================================================================

/**
 * Initialize auto-save timer.
 * Should be called once in the StoryBuilder component.
 */
export const initAutoSave = () => {
  const store = useStoryBuilderStore.getState();

  // Clear existing timer if any
  if (store._autoSaveTimer) {
    clearInterval(store._autoSaveTimer);
  }

  // Set up new timer
  const timer = setInterval(() => {
    useStoryBuilderStore.getState().autoSave();
  }, AUTO_SAVE_INTERVAL as number);

  // Update store with timer reference
  useStoryBuilderStore.setState({ _autoSaveTimer: timer });

  // Restore draft on initialization
  store.restoreDraft();

  // Set up storage event listener for cross-tab sync
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', store.handleStorageEvent);
  }

  // Return cleanup function
  return () => {
    if (timer) {
      clearInterval(timer);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', store.handleStorageEvent);
    }
  };
};

// ============================================================================
// Selectors
// ============================================================================

/**
 * Select slides array.
 */
export const selectSlides = (state: StoryBuilderStore) => state.slides;

/**
 * Select active slide.
 */
export const selectActiveSlide = (state: StoryBuilderStore) =>
  state.slides[state.activeSlideIndex];

/**
 * Select save status.
 */
export const selectSaveStatus = (state: StoryBuilderStore) => state.saveStatus;

/**
 * Select whether story can be saved (has slides and not already saving).
 */
export const selectCanSave = (state: StoryBuilderStore) =>
  state.slides.length > 0 && state.saveStatus !== 'saving';

/**
 * Select whether story has unsaved changes.
 */
export const selectHasUnsavedChanges = (state: StoryBuilderStore) =>
  state.saveStatus === 'unsaved' || state.saveStatus === 'error';

/**
 * Select slide count.
 */
export const selectSlideCount = (state: StoryBuilderStore) => state.slides.length;

/**
 * Select whether more slides can be added.
 */
export const selectCanAddSlide = (state: StoryBuilderStore) =>
  state.slides.length < MAX_SLIDES;
