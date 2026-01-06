/**
 * Unit Tests for Story Builder Store (T026-T028)
 *
 * Tests core store actions: addSlide, removeSlide, reorderSlides
 * @feature 013-visual-story-builder
 */

import { renderHook, act } from '@testing-library/react';
import { useStoryBuilderStore } from '@/lib/story-builder/store';
import type { BuilderSlide } from '@/lib/story-builder/types';

describe('StoryBuilderStore - addSlide (T026)', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useStoryBuilderStore());
    act(() => {
      result.current.clearStory();
    });
  });

  it('should add a slide to the end when no position is specified', () => {
    const { result } = renderHook(() => useStoryBuilderStore());

    act(() => {
      result.current.addSlide('text-highlight');
    });

    expect(result.current.slides).toHaveLength(1);
    expect(result.current.slides[0].type).toBe('text-highlight');
    expect(result.current.activeSlideIndex).toBe(0);
    expect(result.current.saveStatus).toBe('unsaved');
  });

  it('should add a slide at the specified position', () => {
    const { result } = renderHook(() => useStoryBuilderStore());

    act(() => {
      result.current.addSlide('text-highlight');
      result.current.addSlide('image');
      result.current.addSlide('teleprompter', 1); // Insert at position 1
    });

    expect(result.current.slides).toHaveLength(3);
    expect(result.current.slides[0].type).toBe('text-highlight');
    expect(result.current.slides[1].type).toBe('teleprompter');
    expect(result.current.slides[2].type).toBe('image');
    expect(result.current.activeSlideIndex).toBe(1);
  });

  it('should prevent adding slides beyond MAX_SLIDES (20)', () => {
    const { result } = renderHook(() => useStoryBuilderStore());

    // Add 20 slides
    act(() => {
      for (let i = 0; i < 20; i++) {
        result.current.addSlide('text-highlight');
      }
    });

    expect(result.current.slides).toHaveLength(20);

    // Try to add 21st slide
    act(() => {
      result.current.addSlide('image');
    });

    // Should still be 20 slides
    expect(result.current.slides).toHaveLength(20);
  });

  it('should create slide with correct default content for each type', () => {
    const { result } = renderHook(() => useStoryBuilderStore());

    // Test text-highlight
    act(() => {
      result.current.clearStory();
      result.current.addSlide('text-highlight');
    });

    let slide = result.current.slides[0] as BuilderSlide;
    if (slide.type === 'text-highlight') {
      expect(slide.content).toBe('Your text here');
      expect(slide.highlights).toEqual([]);
      expect(slide.duration).toBe(5);
    }

    // Test image
    act(() => {
      result.current.clearStory();
      result.current.addSlide('image');
    });

    slide = result.current.slides[0] as BuilderSlide;
    if (slide.type === 'image') {
      expect(slide.content).toBe('');
      expect(slide.alt).toBe('');
      expect(slide.duration).toBe(5);
    }

    // Test teleprompter
    act(() => {
      result.current.clearStory();
      result.current.addSlide('teleprompter');
    });

    slide = result.current.slides[0] as BuilderSlide;
    if (slide.type === 'teleprompter') {
      expect(slide.content).toBe('Your scrolling text here');
      expect(slide.duration).toBe('manual');
    }

    // Test poll
    act(() => {
      result.current.clearStory();
      result.current.addSlide('poll');
    });

    slide = result.current.slides[0] as BuilderSlide;
    if (slide.type === 'poll') {
      expect(slide.question).toBe('Your question here?');
      expect(slide.options).toHaveLength(2);
      expect(slide.options[0].text).toBe('Option 1');
      expect(slide.duration).toBe(10);
    }

    // Test widget-chart
    act(() => {
      result.current.clearStory();
      result.current.addSlide('widget-chart');
    });

    slide = result.current.slides[0] as BuilderSlide;
    if (slide.type === 'widget-chart') {
      expect(slide.data.type).toBe('bar');
      expect(slide.data.title).toBe('Chart Title');
      expect(slide.data.labels).toEqual(['A', 'B', 'C']);
      expect(slide.data.values).toEqual([10, 20, 30]);
    }
  });
});

describe('StoryBuilderStore - removeSlide (T027)', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useStoryBuilderStore());
    act(() => {
      result.current.clearStory();
    });
  });

  it('should remove slide at specified index', () => {
    const { result } = renderHook(() => useStoryBuilderStore());

    act(() => {
      result.current.addSlide('text-highlight');
      result.current.addSlide('image');
      result.current.addSlide('teleprompter');
      result.current.removeSlide(1); // Remove image slide
    });

    expect(result.current.slides).toHaveLength(2);
    expect(result.current.slides[0].type).toBe('text-highlight');
    expect(result.current.slides[1].type).toBe('teleprompter');
  });

  it('should adjust activeSlideIndex when removing active slide', () => {
    const { result } = renderHook(() => useStoryBuilderStore());

    act(() => {
      result.current.addSlide('text-highlight');
      result.current.addSlide('image');
      result.current.addSlide('teleprompter');
      result.current.setActiveSlide(1); // Select middle slide
      result.current.removeSlide(1); // Remove it
    });

    expect(result.current.activeSlideIndex).toBe(1); // Should stay at 1 (now pointing to last slide)
  });

  it('should adjust activeSlideIndex when removing last slide', () => {
    const { result } = renderHook(() => useStoryBuilderStore());

    act(() => {
      result.current.addSlide('text-highlight');
      result.current.addSlide('image');
      result.current.addSlide('teleprompter');
      result.current.setActiveSlide(2); // Select last slide
      result.current.removeSlide(2); // Remove it
    });

    expect(result.current.activeSlideIndex).toBe(1); // Should move to new last slide
  });

  it('should handle removing slide from empty story', () => {
    const { result } = renderHook(() => useStoryBuilderStore());

    act(() => {
      result.current.removeSlide(0);
    });

    expect(result.current.slides).toHaveLength(0);
  });

  it('should not remove slide with invalid index', () => {
    const { result } = renderHook(() => useStoryBuilderStore());

    act(() => {
      result.current.addSlide('text-highlight');
      result.current.addSlide('image');
      const initialLength = result.current.slides.length;
      result.current.removeSlide(5); // Invalid index
    });

    expect(result.current.slides).toHaveLength(2);
  });

  it('should set saveStatus to unsaved after removal', () => {
    const { result } = renderHook(() => useStoryBuilderStore());

    act(() => {
      result.current.addSlide('text-highlight');
      result.current.removeSlide(0);
    });

    expect(result.current.saveStatus).toBe('unsaved');
  });
});

describe('StoryBuilderStore - reorderSlides (T028)', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useStoryBuilderStore());
    act(() => {
      result.current.clearStory();
    });
  });

  it('should reorder slides by moving from one index to another', () => {
    const { result } = renderHook(() => useStoryBuilderStore());

    act(() => {
      result.current.addSlide('text-highlight');
      result.current.addSlide('image');
      result.current.addSlide('teleprompter');
      result.current.reorderSlides(0, 2); // Move first slide to last
    });

    expect(result.current.slides).toHaveLength(3);
    expect(result.current.slides[0].type).toBe('image');
    expect(result.current.slides[1].type).toBe('teleprompter');
    expect(result.current.slides[2].type).toBe('text-highlight');
  });

  it('should update activeSlideIndex to new position', () => {
    const { result } = renderHook(() => useStoryBuilderStore());

    act(() => {
      result.current.addSlide('text-highlight');
      result.current.addSlide('image');
      result.current.addSlide('teleprompter');
      result.current.setActiveSlide(0);
      result.current.reorderSlides(0, 2);
    });

    expect(result.current.activeSlideIndex).toBe(2);
  });

  it('should handle moving slide to earlier position', () => {
    const { result } = renderHook(() => useStoryBuilderStore());

    act(() => {
      result.current.addSlide('text-highlight');
      result.current.addSlide('image');
      result.current.addSlide('teleprompter');
      result.current.reorderSlides(2, 0); // Move last slide to first
    });

    expect(result.current.slides[0].type).toBe('teleprompter');
    expect(result.current.slides[1].type).toBe('text-highlight');
    expect(result.current.slides[2].type).toBe('image');
  });

  it('should do nothing when fromIndex equals toIndex', () => {
    const { result } = renderHook(() => useStoryBuilderStore());

    act(() => {
      result.current.addSlide('text-highlight');
      result.current.addSlide('image');
      result.current.addSlide('teleprompter');
      result.current.reorderSlides(1, 1);
    });

    expect(result.current.slides[0].type).toBe('text-highlight');
    expect(result.current.slides[1].type).toBe('image');
    expect(result.current.slides[2].type).toBe('teleprompter');
  });

  it('should not reorder with invalid indices', () => {
    const { result } = renderHook(() => useStoryBuilderStore());

    act(() => {
      result.current.addSlide('text-highlight');
      result.current.addSlide('image');
      result.current.addSlide('teleprompter');
      result.current.reorderSlides(5, 0); // Invalid fromIndex
    });

    // Slides should remain unchanged
    expect(result.current.slides[0].type).toBe('text-highlight');
    expect(result.current.slides[1].type).toBe('image');
    expect(result.current.slides[2].type).toBe('teleprompter');
  });

  it('should set saveStatus to unsaved after reorder', () => {
    const { result } = renderHook(() => useStoryBuilderStore());

    act(() => {
      result.current.addSlide('text-highlight');
      result.current.addSlide('image');
      result.current.reorderSlides(0, 1);
    });

    expect(result.current.saveStatus).toBe('unsaved');
  });
});
