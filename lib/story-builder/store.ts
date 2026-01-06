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

// Maximum slides allowed (URL length constraint)
const MAX_SLIDES = 20;

// Auto-save interval in milliseconds
const AUTO_SAVE_INTERVAL = 30000;

// ============================================================================
// Store Interface
// ============================================================================

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
  
  // Internal state for auto-save timer
  _autoSaveTimer: ReturnType<typeof setInterval> | null;
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
        backgroundColor: '#FFFFFF',
        content: 'Your scrolling text here',
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

export const useStoryBuilderStore = create<StoryBuilderStore>((set, get) => ({
  // Initial State
  slides: [],
  activeSlideIndex: 0,
  saveStatus: 'saved',
  isTemplateModalOpen: false,
  lastModified: Date.now(),
  _autoSaveTimer: null,

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
      console.warn(`Cannot add slide: maximum of ${MAX_SLIDES} slides reached`);
      return;
    }

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
      console.warn(`Cannot remove slide: index ${index} out of bounds`);
      return;
    }

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
      console.warn('Cannot reorder slides: index out of bounds');
      return;
    }

    if (fromIndex === toIndex) {
      return; // No change needed
    }

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
      console.warn(`Cannot update slide: index ${index} out of bounds`);
      return;
    }

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

    // Validate index
    if (index < 0 || index >= state.slides.length) {
      console.warn(`Cannot set active slide: index ${index} out of bounds`);
      return;
    }

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
      console.warn('Cannot generate URL: no slides in story');
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
      if (encoded.length > 32768) {
        console.warn('Generated URL exceeds 32KB limit');
        return '';
      }

      return encoded;
    } catch (error) {
      console.error('Failed to generate URL:', error);
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
      } else {
        console.error('Failed to auto-save:', error);
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
  }, AUTO_SAVE_INTERVAL);

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
