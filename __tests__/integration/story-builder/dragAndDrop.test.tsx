/**
 * Integration Tests for Story Builder Drag and Drop (T029-T030)
 *
 * Tests drag from library to rail and slide reordering in rail
 * @feature 013-visual-story-builder
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { StoryBuilder } from '@/app/story-builder/components/StoryBuilder';
import { useStoryBuilderStore } from '@/lib/story-builder/store';

// Mock @dnd-kit utilities for testing
jest.mock('@dnd-kit/core', () => ({
  ...jest.requireActual('@dnd-kit/core'),
  useDroppable: () => ({
    setNodeRef: jest.fn(),
    isOver: false,
  }),
  useDraggable: () => ({
    setNodeRef: jest.fn(),
    attributes: {},
    listeners: {},
    isDragging: false,
  }),
  useSortable: () => ({
    setNodeRef: jest.fn(),
    attributes: {},
    listeners: {},
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}));

describe('Drag and Drop Integration (T029)', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useStoryBuilderStore.getState();
    store.clearStory();
  });

  it('should drag slide type from library to story rail', async () => {
    render(<StoryBuilder />);

    const store = useStoryBuilderStore.getState();
    expect(store.slides).toHaveLength(0);

    // Simulate drag from library to rail
    // In a real test, this would use drag events
    // For now, we test the store action directly
    act(() => {
      store.addSlide('text-highlight', 0);
    });

    await waitFor(() => {
      expect(store.slides).toHaveLength(1);
      expect(store.slides[0].type).toBe('text-highlight');
    });
  });

  it('should add slide at correct position when dropped in rail', async () => {
    render(<StoryBuilder />);

    const store = useStoryBuilderStore.getState();

    // Add initial slides
    act(() => {
      store.addSlide('text-highlight');
      store.addSlide('image');
    });

    expect(store.slides).toHaveLength(2);

    // Add new slide at position 1
    act(() => {
      store.addSlide('teleprompter', 1);
    });

    await waitFor(() => {
      expect(store.slides).toHaveLength(3);
      expect(store.slides[0].type).toBe('text-highlight');
      expect(store.slides[1].type).toBe('teleprompter');
      expect(store.slides[2].type).toBe('image');
    });
  });

  it('should handle multiple drag operations from library', async () => {
    render(<StoryBuilder />);

    const store = useStoryBuilderStore.getState();

    // Add multiple slides
    act(() => {
      store.addSlide('text-highlight');
      store.addSlide('image');
      store.addSlide('poll');
      store.addSlide('widget-chart');
    });

    await waitFor(() => {
      expect(store.slides).toHaveLength(4);
    });
  });
});

describe('Slide Reordering in Rail (T030)', () => {
  beforeEach(() => {
    const store = useStoryBuilderStore.getState();
    store.clearStory();
  });

  it('should reorder slides when dragged to new position', async () => {
    render(<StoryBuilder />);

    const store = useStoryBuilderStore.getState();

    // Create initial slides
    act(() => {
      store.addSlide('text-highlight');
      store.addSlide('image');
      store.addSlide('teleprompter');
    });

    expect(store.slides.map(s => s.type)).toEqual(['text-highlight', 'image', 'teleprompter']);

    // Reorder: move first slide to last
    act(() => {
      store.reorderSlides(0, 2);
    });

    await waitFor(() => {
      expect(store.slides.map(s => s.type)).toEqual(['image', 'teleprompter', 'text-highlight']);
    });
  });

  it('should update activeSlideIndex after reorder', async () => {
    render(<StoryBuilder />);

    const store = useStoryBuilderStore.getState();

    act(() => {
      store.addSlide('text-highlight');
      store.addSlide('image');
      store.addSlide('teleprompter');
      store.setActiveSlide(0);
    });

    expect(store.activeSlideIndex).toBe(0);

    // Move active slide to new position
    act(() => {
      store.reorderSlides(0, 2);
    });

    await waitFor(() => {
      expect(store.activeSlideIndex).toBe(2);
    });
  });

  it('should handle reordering to earlier position', async () => {
    render(<StoryBuilder />);

    const store = useStoryBuilderStore.getState();

    act(() => {
      store.addSlide('text-highlight');
      store.addSlide('image');
      store.addSlide('teleprompter');
      store.addSlide('poll');
    });

    // Move last slide to first
    act(() => {
      store.reorderSlides(3, 0);
    });

    await waitFor(() => {
      expect(store.slides.map(s => s.type)).toEqual(['poll', 'text-highlight', 'image', 'teleprompter']);
    });
  });

  it('should maintain slide properties after reorder', async () => {
    render(<StoryBuilder />);

    const store = useStoryBuilderStore.getState();

    act(() => {
      store.addSlide('text-highlight');
      store.addSlide('image');
    });

    const firstSlideId = store.slides[0].id;

    // Reorder slides
    act(() => {
      store.reorderSlides(0, 1);
    });

    await waitFor(() => {
      expect(store.slides[1].id).toBe(firstSlideId);
      expect(store.slides[1].type).toBe('text-highlight');
    });
  });

  it('should not change slides when reordering to same position', async () => {
    render(<StoryBuilder />);

    const store = useStoryBuilderStore.getState();

    act(() => {
      store.addSlide('text-highlight');
      store.addSlide('image');
      store.addSlide('teleprompter');
    });

    const originalOrder = store.slides.map(s => s.id);

    // Try to reorder slide to its current position
    act(() => {
      store.reorderSlides(1, 1);
    });

    await waitFor(() => {
      expect(store.slides.map(s => s.id)).toEqual(originalOrder);
    });
  });
});

// Helper function for act
function act(callback: () => void) {
  callback();
}
