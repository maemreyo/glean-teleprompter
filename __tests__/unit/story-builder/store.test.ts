/**
 * Unit tests for story builder store
 * @feature 014-teleprompter-preview-sync
 */

import { renderHook, act } from '@testing-library/react';
import { useStoryBuilderStore } from '@/lib/story-builder/store';
import type { BuilderSlide } from '@/lib/story-builder/types';

describe('Story Builder Store - Teleprompter Defaults', () => {
  beforeEach(() => {
    // Reset store before each test
    useStoryBuilderStore.setState({
      slides: [],
      activeSlideIndex: 0,
      saveStatus: 'saved',
      isTemplateModalOpen: false,
      lastModified: Date.now(),
    });
  });

  describe('addSlide - teleprompter defaults', () => {
    it('should apply default focalPoint of 50 to new teleprompter slides', () => {
      const { result } = renderHook(() => useStoryBuilderStore());

      act(() => {
        result.current.addSlide('teleprompter', 0);
      });

      const state = result.current;
      expect(state.slides).toHaveLength(1);
      
      const slide = state.slides[0] as any;
      expect(slide.type).toBe('teleprompter');
      expect(slide.focalPoint).toBe(50);
    });

    it('should apply default fontSize of 24 to new teleprompter slides', () => {
      const { result } = renderHook(() => useStoryBuilderStore());

      act(() => {
        result.current.addSlide('teleprompter', 0);
      });

      const state = result.current;
      expect(state.slides).toHaveLength(1);
      
      const slide = state.slides[0] as any;
      expect(slide.type).toBe('teleprompter');
      expect(slide.fontSize).toBe(24);
    });

    it('should apply both defaults together', () => {
      const { result } = renderHook(() => useStoryBuilderStore());

      act(() => {
        result.current.addSlide('teleprompter', 0);
      });

      const state = result.current;
      const slide = state.slides[0] as any;
      
      expect(slide.focalPoint).toBe(50);
      expect(slide.fontSize).toBe(24);
    });

    it('should maintain defaults when adding multiple teleprompter slides', () => {
      const { result } = renderHook(() => useStoryBuilderStore());

      act(() => {
        result.current.addSlide('teleprompter', 0);
        result.current.addSlide('teleprompter', 1);
        result.current.addSlide('teleprompter', 2);
      });

      const state = result.current;
      expect(state.slides).toHaveLength(3);
      
      state.slides.forEach((slide: any) => {
        expect(slide.focalPoint).toBe(50);
        expect(slide.fontSize).toBe(24);
      });
    });

    it('should not affect other slide types', () => {
      const { result } = renderHook(() => useStoryBuilderStore());

      act(() => {
        result.current.addSlide('text-highlight', 0);
        result.current.addSlide('image', 1);
        result.current.addSlide('poll', 2);
      });

      const state = result.current;
      expect(state.slides).toHaveLength(3);
      
      // None of these should have teleprompter-specific properties
      state.slides.forEach((slide: any) => {
        expect(slide.focalPoint).toBeUndefined();
        expect(slide.fontSize).toBeUndefined();
      });
    });
  });

  describe('updateSlide - preserving settings', () => {
    it('should preserve focalPoint when updating other slide properties', () => {
      const { result } = renderHook(() => useStoryBuilderStore());

      // Add a teleprompter slide
      act(() => {
        result.current.addSlide('teleprompter', 0);
      });

      // Update the content
      act(() => {
        result.current.updateSlide(0, { content: 'Updated content' } as any);
      });

      const state = result.current;
      const slide = state.slides[0] as any;
      
      expect(slide.content).toBe('Updated content');
      expect(slide.focalPoint).toBe(50); // Should still be there
      expect(slide.fontSize).toBe(24); // Should still be there
    });

    it('should preserve fontSize when updating other slide properties', () => {
      const { result } = renderHook(() => useStoryBuilderStore());

      act(() => {
        result.current.addSlide('teleprompter', 0);
      });

      act(() => {
        result.current.updateSlide(0, { backgroundColor: '#FF0000' } as any);
      });

      const state = result.current;
      const slide = state.slides[0] as any;
      
      expect(slide.backgroundColor).toBe('#FF0000');
      expect(slide.focalPoint).toBe(50);
      expect(slide.fontSize).toBe(24);
    });

    it('should allow updating focalPoint to a new value', () => {
      const { result } = renderHook(() => useStoryBuilderStore());

      act(() => {
        result.current.addSlide('teleprompter', 0);
      });

      act(() => {
        result.current.updateSlide(0, { focalPoint: 75 } as any);
      });

      const state = result.current;
      const slide = state.slides[0] as any;
      
      expect(slide.focalPoint).toBe(75);
      expect(slide.fontSize).toBe(24); // Should be preserved
    });

    it('should allow updating fontSize to a new value', () => {
      const { result } = renderHook(() => useStoryBuilderStore());

      act(() => {
        result.current.addSlide('teleprompter', 0);
      });

      act(() => {
        result.current.updateSlide(0, { fontSize: 36 } as any);
      });

      const state = result.current;
      const slide = state.slides[0] as any;
      
      expect(slide.focalPoint).toBe(50); // Should be preserved
      expect(slide.fontSize).toBe(36);
    });

    it('should allow updating both properties simultaneously', () => {
      const { result } = renderHook(() => useStoryBuilderStore());

      act(() => {
        result.current.addSlide('teleprompter', 0);
      });

      act(() => {
        result.current.updateSlide(0, { 
          focalPoint: 80, 
          fontSize: 48 
        } as any);
      });

      const state = result.current;
      const slide = state.slides[0] as any;
      
      expect(slide.focalPoint).toBe(80);
      expect(slide.fontSize).toBe(48);
    });
  });

  describe('removeSlide and reorderSlides', () => {
    it('should preserve settings when removing a different slide', () => {
      const { result } = renderHook(() => useStoryBuilderStore());

      act(() => {
        result.current.addSlide('teleprompter', 0);
        result.current.addSlide('text-highlight', 1);
        result.current.addSlide('teleprompter', 2);
      });

      // Modify first teleprompter slide
      act(() => {
        result.current.updateSlide(0, { focalPoint: 65, fontSize: 32 } as any);
      });

      // Remove the middle slide
      act(() => {
        result.current.removeSlide(1);
      });

      const state = result.current;
      expect(state.slides).toHaveLength(2);
      
      // First slide should still have its settings
      const slide0 = state.slides[0] as any;
      expect(slide0.focalPoint).toBe(65);
      expect(slide0.fontSize).toBe(32);
      
      // Third slide (now second) should still have defaults
      const slide1 = state.slides[1] as any;
      expect(slide1.focalPoint).toBe(50);
      expect(slide1.fontSize).toBe(24);
    });

    it('should preserve settings when reordering slides', () => {
      const { result } = renderHook(() => useStoryBuilderStore());

      act(() => {
        result.current.addSlide('teleprompter', 0);
        result.current.addSlide('teleprompter', 1);
      });

      // Modify each slide differently
      act(() => {
        result.current.updateSlide(0, { focalPoint: 25, fontSize: 20 } as any);
        result.current.updateSlide(1, { focalPoint: 75, fontSize: 40 } as any);
      });

      // Reorder slides
      act(() => {
        result.current.reorderSlides(0, 1);
      });

      const state = result.current;
      
      // Verify settings moved with slides
      const slide0 = state.slides[0] as any;
      expect(slide0.focalPoint).toBe(75);
      expect(slide0.fontSize).toBe(40);
      
      const slide1 = state.slides[1] as any;
      expect(slide1.focalPoint).toBe(25);
      expect(slide1.fontSize).toBe(20);
    });
  });

  describe('undo/redo with teleprompter settings', () => {
    it('should restore settings on undo', () => {
      const { result } = renderHook(() => useStoryBuilderStore());

      act(() => {
        result.current.addSlide('teleprompter', 0);
      });

      // Update settings
      act(() => {
        result.current.updateSlide(0, { focalPoint: 85, fontSize: 56 } as any);
      });

      // Undo
      act(() => {
        result.current.undo();
      });

      const state = result.current;
      const slide = state.slides[0] as any;
      
      expect(slide.focalPoint).toBe(50); // Back to default
      expect(slide.fontSize).toBe(24);  // Back to default
    });

    it('should redo settings changes', () => {
      const { result } = renderHook(() => useStoryBuilderStore());

      act(() => {
        result.current.addSlide('teleprompter', 0);
      });

      // Update settings
      act(() => {
        result.current.updateSlide(0, { focalPoint: 90, fontSize: 60 } as any);
      });

      // Undo then redo
      act(() => {
        result.current.undo();
        result.current.redo();
      });

      const state = result.current;
      const slide = state.slides[0] as any;
      
      expect(slide.focalPoint).toBe(90);
      expect(slide.fontSize).toBe(60);
    });
  });
});
