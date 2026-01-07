/**
 * Integration tests for slide navigation persistence
 * @feature 014-teleprompter-preview-sync
 */

import { render, renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { useStoryBuilderStore } from '@/lib/story-builder/store';
import type { BuilderSlide } from '@/lib/story-builder/types';

describe('Slide Navigation - Settings Persistence', () => {
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

  describe('switching between teleprompter slides', () => {
    it('should preserve focalPoint when switching between slides', () => {
      const { result } = renderHook(() => useStoryBuilderStore());

      // Add two teleprompter slides
      act(() => {
        result.current.addSlide('teleprompter', 0);
        result.current.addSlide('teleprompter', 1);
      });

      // Set different focal points
      act(() => {
        result.current.updateSlide(0, { focalPoint: 30 } as any);
        result.current.updateSlide(1, { focalPoint: 70 } as any);
      });

      // Switch to second slide
      act(() => {
        result.current.setActiveSlide(1);
      });

      expect(result.current.activeSlideIndex).toBe(1);
      expect((result.current.slides[1] as any).focalPoint).toBe(70);

      // Switch back to first slide
      act(() => {
        result.current.setActiveSlide(0);
      });

      expect(result.current.activeSlideIndex).toBe(0);
      expect((result.current.slides[0] as any).focalPoint).toBe(30);
    });

    it('should preserve fontSize when switching between slides', () => {
      const { result } = renderHook(() => useStoryBuilderStore());

      // Add two teleprompter slides
      act(() => {
        result.current.addSlide('teleprompter', 0);
        result.current.addSlide('teleprompter', 1);
      });

      // Set different font sizes
      act(() => {
        result.current.updateSlide(0, { fontSize: 18 } as any);
        result.current.updateSlide(1, { fontSize: 48 } as any);
      });

      // Switch between slides
      act(() => {
        result.current.setActiveSlide(1);
      });

      expect((result.current.slides[1] as any).fontSize).toBe(48);

      act(() => {
        result.current.setActiveSlide(0);
      });

      expect((result.current.slides[0] as any).fontSize).toBe(18);
    });

    it('should preserve both settings when switching between slides', () => {
      const { result } = renderHook(() => useStoryBuilderStore());

      // Add three slides
      act(() => {
        result.current.addSlide('teleprompter', 0);
        result.current.addSlide('teleprompter', 1);
        result.current.addSlide('teleprompter', 2);
      });

      // Set different values for each slide
      act(() => {
        result.current.updateSlide(0, { focalPoint: 20, fontSize: 20 } as any);
        result.current.updateSlide(1, { focalPoint: 50, fontSize: 30 } as any);
        result.current.updateSlide(2, { focalPoint: 80, fontSize: 40 } as any);
      });

      // Navigate through all slides
      act(() => {
        result.current.setActiveSlide(1);
      });

      expect((result.current.slides[1] as any).focalPoint).toBe(50);
      expect((result.current.slides[1] as any).fontSize).toBe(30);

      act(() => {
        result.current.setActiveSlide(2);
      });

      expect((result.current.slides[2] as any).focalPoint).toBe(80);
      expect((result.current.slides[2] as any).fontSize).toBe(40);

      act(() => {
        result.current.setActiveSlide(0);
      });

      expect((result.current.slides[0] as any).focalPoint).toBe(20);
      expect((result.current.slides[0] as any).fontSize).toBe(20);
    });

    it('should handle rapid slide switching without data loss', () => {
      const { result } = renderHook(() => useStoryBuilderStore());

      // Add multiple slides
      act(() => {
        for (let i = 0; i < 5; i++) {
          result.current.addSlide('teleprompter', i);
        }
      });

      // Set unique values for each
      act(() => {
        result.current.slides.forEach((slide: any, index: number) => {
          result.current.updateSlide(index, {
            focalPoint: index * 20,
            fontSize: 20 + index * 10
          } as any);
        });
      });

      // Rapidly switch between slides
      act(() => {
        for (let i = 0; i < 10; i++) {
          const targetIndex = i % 5;
          result.current.setActiveSlide(targetIndex);
        }
      });

      // Verify all settings are preserved
      result.current.slides.forEach((slide: any, index: number) => {
        expect(slide.focalPoint).toBe(index * 20);
        expect(slide.fontSize).toBe(20 + index * 10);
      });
    });
  });

  describe('switching between different slide types', () => {
    it('should preserve teleprompter settings when switching to/from other slide types', () => {
      const { result } = renderHook(() => useStoryBuilderStore());

      // Add mixed slide types
      act(() => {
        result.current.addSlide('teleprompter', 0);
        result.current.addSlide('text-highlight', 1);
        result.current.addSlide('teleprompter', 2);
      });

      // Set teleprompter settings
      act(() => {
        result.current.updateSlide(0, { focalPoint: 40, fontSize: 28 } as any);
        result.current.updateSlide(2, { focalPoint: 60, fontSize: 36 } as any);
      });

      // Switch to text slide
      act(() => {
        result.current.setActiveSlide(1);
      });

      // Switch back to first teleprompter
      act(() => {
        result.current.setActiveSlide(0);
      });

      expect((result.current.slides[0] as any).focalPoint).toBe(40);
      expect((result.current.slides[0] as any).fontSize).toBe(28);

      // Switch to third teleprompter
      act(() => {
        result.current.setActiveSlide(2);
      });

      expect((result.current.slides[2] as any).focalPoint).toBe(60);
      expect((result.current.slides[2] as any).fontSize).toBe(36);
    });

    it('should not affect other slide types when switching', () => {
      const { result } = renderHook(() => useStoryBuilderStore());

      // Add mixed slides
      act(() => {
        result.current.addSlide('text-highlight', 0);
        result.current.addSlide('teleprompter', 1);
        result.current.addSlide('image', 2);
      });

      // Modify all slides
      act(() => {
        result.current.updateSlide(0, { content: 'Text content' } as any);
        result.current.updateSlide(1, { focalPoint: 55, fontSize: 32 } as any);
        result.current.updateSlide(2, { content: 'https://example.com/image.jpg' } as any);
      });

      // Switch to teleprompter and back
      act(() => {
        result.current.setActiveSlide(1);
        result.current.setActiveSlide(0);
      });

      // Verify other slides unchanged
      expect((result.current.slides[0] as any).content).toBe('Text content');
      expect((result.current.slides[2] as any).content).toBe('https://example.com/image.jpg');
    });
  });

  describe('edge cases', () => {
    it('should preserve settings after removing intermediate slides', () => {
      const { result } = renderHook(() => useStoryBuilderStore());

      // Add three teleprompter slides
      act(() => {
        result.current.addSlide('teleprompter', 0);
        result.current.addSlide('teleprompter', 1);
        result.current.addSlide('teleprompter', 2);
      });

      // Set unique values
      act(() => {
        result.current.updateSlide(0, { focalPoint: 10, fontSize: 18 } as any);
        result.current.updateSlide(1, { focalPoint: 50, fontSize: 24 } as any);
        result.current.updateSlide(2, { focalPoint: 90, fontSize: 48 } as any);
      });

      // Remove middle slide
      act(() => {
        result.current.removeSlide(1);
      });

      expect(result.current.slides).toHaveLength(2);

      // Verify remaining slides have correct settings
      expect((result.current.slides[0] as any).focalPoint).toBe(10);
      expect((result.current.slides[0] as any).fontSize).toBe(18);
      expect((result.current.slides[1] as any).focalPoint).toBe(90);
      expect((result.current.slides[1] as any).fontSize).toBe(48);
    });

    it('should preserve settings after reordering slides', () => {
      const { result } = renderHook(() => useStoryBuilderStore());

      // Add three teleprompter slides
      act(() => {
        result.current.addSlide('teleprompter', 0);
        result.current.addSlide('teleprompter', 1);
        result.current.addSlide('teleprompter', 2);
      });

      // Set unique values
      act(() => {
        result.current.updateSlide(0, { focalPoint: 0, fontSize: 16 } as any);
        result.current.updateSlide(1, { focalPoint: 50, fontSize: 24 } as any);
        result.current.updateSlide(2, { focalPoint: 100, fontSize: 72 } as any);
      });

      // Reorder: move first to last
      act(() => {
        result.current.reorderSlides(0, 2);
      });

      expect(result.current.slides).toHaveLength(3);

      // Verify settings moved with slides
      expect((result.current.slides[0] as any).focalPoint).toBe(50);
      expect((result.current.slides[0] as any).fontSize).toBe(24);
      expect((result.current.slides[2] as any).focalPoint).toBe(0);
      expect((result.current.slides[2] as any).fontSize).toBe(16);
    });

    it('should handle navigation to invalid indices gracefully', () => {
      const { result } = renderHook(() => useStoryBuilderStore());

      // Add one slide
      act(() => {
        result.current.addSlide('teleprompter', 0);
      });

      // Try to set invalid index
      act(() => {
        result.current.setActiveSlide(5);
      });

      // Should not crash and stay at valid index
      expect(result.current.activeSlideIndex).toBe(0);

      // Settings should still be intact
      expect((result.current.slides[0] as any).focalPoint).toBe(50);
      expect((result.current.slides[0] as any).fontSize).toBe(24);
    });
  });

  describe('real-world scenario', () => {
    it('should handle complete user workflow without data loss', () => {
      const { result } = renderHook(() => useStoryBuilderStore());

      // User creates a story with multiple teleprompter slides
      act(() => {
        result.current.addSlide('teleprompter', 0);
        result.current.addSlide('teleprompter', 1);
        result.current.addSlide('teleprompter', 2);
        result.current.addSlide('teleprompter', 3);
      });

      // User customizes each slide
      act(() => {
        result.current.updateSlide(0, { 
          focalPoint: 30, 
          fontSize: 20,
          content: 'Introduction'
        } as any);
        result.current.updateSlide(1, { 
          focalPoint: 40, 
          fontSize: 22,
          content: 'Main point 1'
        } as any);
        result.current.updateSlide(2, { 
          focalPoint: 50, 
          fontSize: 24,
          content: 'Main point 2'
        } as any);
        result.current.updateSlide(3, { 
          focalPoint: 60, 
          fontSize: 26,
          content: 'Conclusion'
        } as any);
      });

      // User navigates through slides to review
      act(() => {
        result.current.setActiveSlide(1);
        result.current.setActiveSlide(2);
        result.current.setActiveSlide(3);
        result.current.setActiveSlide(0);
        result.current.setActiveSlide(2);
        result.current.setActiveSlide(1);
      });

      // Verify all settings preserved
      expect((result.current.slides[0] as any).focalPoint).toBe(30);
      expect((result.current.slides[0] as any).fontSize).toBe(20);
      expect((result.current.slides[1] as any).focalPoint).toBe(40);
      expect((result.current.slides[1] as any).fontSize).toBe(22);
      expect((result.current.slides[2] as any).focalPoint).toBe(50);
      expect((result.current.slides[2] as any).fontSize).toBe(24);
      expect((result.current.slides[3] as any).focalPoint).toBe(60);
      expect((result.current.slides[3] as any).fontSize).toBe(26);
    });
  });
});
