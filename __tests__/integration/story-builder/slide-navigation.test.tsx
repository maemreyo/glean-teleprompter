/**
 * Integration test for slide navigation persistence
 * @feature 014-teleprompter-preview-sync
 * @task T027
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useStoryBuilderStore } from '@/lib/story-builder/store';
import type { BuilderSlide } from '@/lib/story-builder/types';

describe('Slide Navigation Persistence (T027)', () => {
  beforeEach(() => {
    // Reset store before each test
    const { clearStory } = useStoryBuilderStore.getState();
    clearStory();
  });

  it('should persist settings when switching between slides', async () => {
    const { addSlide, setActiveSlide, slides, updateSlide } = useStoryBuilderStore.getState();

    // Add first teleprompter slide
    act(() => {
      addSlide('teleprompter', 0);
    });

    // Set custom settings on first slide
    act(() => {
      updateSlide(0, {
        focalPoint: 60,
        fontSize: 32,
        textAlign: 'center',
        lineHeight: 1.6,
        letterSpacing: 1,
      } as any);
    });

    // Add second teleprompter slide
    act(() => {
      addSlide('teleprompter', 1);
    });

    // Set different settings on second slide
    act(() => {
      updateSlide(1, {
        focalPoint: 40,
        fontSize: 28,
        textAlign: 'right',
        lineHeight: 1.8,
        letterSpacing: 2,
      } as any);
    });

    // Switch to first slide
    act(() => {
      setActiveSlide(0);
    });

    await waitFor(() => {
      const currentSlide = useStoryBuilderStore.getState().slides[0];
      expect((currentSlide as any).focalPoint).toBe(60);
      expect((currentSlide as any).fontSize).toBe(32);
      expect((currentSlide as any).textAlign).toBe('center');
      expect((currentSlide as any).lineHeight).toBe(1.6);
      expect((currentSlide as any).letterSpacing).toBe(1);
    });

    // Switch to second slide
    act(() => {
      setActiveSlide(1);
    });

    await waitFor(() => {
      const currentSlide = useStoryBuilderStore.getState().slides[1];
      expect((currentSlide as any).focalPoint).toBe(40);
      expect((currentSlide as any).fontSize).toBe(28);
      expect((currentSlide as any).textAlign).toBe('right');
      expect((currentSlide as any).lineHeight).toBe(1.8);
      expect((currentSlide as any).letterSpacing).toBe(2);
    });
  });

  it('should not affect one slide when editing another', async () => {
    const { addSlide, setActiveSlide, updateSlide } = useStoryBuilderStore.getState();

    // Add two slides
    act(() => {
      addSlide('teleprompter', 0);
      addSlide('teleprompter', 1);
    });

    // Set settings on first slide
    act(() => {
      updateSlide(0, {
        focalPoint: 70,
        fontSize: 36,
      } as any);
    });

    // Switch to second slide and change settings
    act(() => {
      setActiveSlide(1);
      updateSlide(1, {
        focalPoint: 30,
        fontSize: 20,
      } as any);
    });

    await waitFor(() => {
      const firstSlide = useStoryBuilderStore.getState().slides[0];
      const secondSlide = useStoryBuilderStore.getState().slides[1];

      // First slide should be unchanged
      expect((firstSlide as any).focalPoint).toBe(70);
      expect((firstSlide as any).fontSize).toBe(36);

      // Second slide should have new values
      expect((secondSlide as any).focalPoint).toBe(30);
      expect((secondSlide as any).fontSize).toBe(20);
    });
  });

  it('should persist all 11 enhanced settings across navigation', async () => {
    const { addSlide, setActiveSlide, updateSlide } = useStoryBuilderStore.getState();

    // Add a slide with all settings
    act(() => {
      addSlide('teleprompter', 0);
    });

    const allSettings = {
      focalPoint: 55,
      fontSize: 30,
      textAlign: 'center' as const,
      lineHeight: 1.7,
      letterSpacing: 1.5,
      scrollSpeed: 'fast' as const,
      mirrorHorizontal: true,
      mirrorVertical: false,
      backgroundColor: '#2a2a2a',
      backgroundOpacity: 85,
      safeAreaPadding: { top: 15, right: 25, bottom: 15, left: 25 },
    };

    act(() => {
      updateSlide(0, allSettings as any);
    });

    // Add another slide and switch to it
    act(() => {
      addSlide('teleprompter', 1);
      setActiveSlide(1);
    });

    // Switch back to first slide
    act(() => {
      setActiveSlide(0);
    });

    await waitFor(() => {
      const currentSlide = useStoryBuilderStore.getState().slides[0];

      // All settings should be preserved
      expect((currentSlide as any).focalPoint).toBe(allSettings.focalPoint);
      expect((currentSlide as any).fontSize).toBe(allSettings.fontSize);
      expect((currentSlide as any).textAlign).toBe(allSettings.textAlign);
      expect((currentSlide as any).lineHeight).toBe(allSettings.lineHeight);
      expect((currentSlide as any).letterSpacing).toBe(allSettings.letterSpacing);
      expect((currentSlide as any).scrollSpeed).toBe(allSettings.scrollSpeed);
      expect((currentSlide as any).mirrorHorizontal).toBe(allSettings.mirrorHorizontal);
      expect((currentSlide as any).mirrorVertical).toBe(allSettings.mirrorVertical);
      expect((currentSlide as any).backgroundColor).toBe(allSettings.backgroundColor);
      expect((currentSlide as any).backgroundOpacity).toBe(allSettings.backgroundOpacity);
      expect((currentSlide as any).safeAreaPadding).toEqual(allSettings.safeAreaPadding);
    });
  });

  it('should handle rapid slide switching without data loss', async () => {
    const { addSlide, setActiveSlide, updateSlide } = useStoryBuilderStore.getState();

    // Add 5 slides with different settings
    for (let i = 0; i < 5; i++) {
      act(() => {
        addSlide('teleprompter', i);
        updateSlide(i, {
          focalPoint: i * 20,
          fontSize: 20 + i * 10,
        } as any);
      });
    }

    // Rapidly switch between slides
    for (let i = 0; i < 10; i++) {
      act(() => {
        setActiveSlide(i % 5);
      });
    }

    // Verify all slides retained their settings
    await waitFor(() => {
      const currentSlides = useStoryBuilderStore.getState().slides;

      for (let i = 0; i < 5; i++) {
        expect((currentSlides[i] as any).focalPoint).toBe(i * 20);
        expect((currentSlides[i] as any).fontSize).toBe(20 + i * 10);
      }
    });
  });

  it('should apply correct defaults when creating new slide', () => {
    const { addSlide, slides } = useStoryBuilderStore.getState();

    act(() => {
      addSlide('teleprompter', 0);
    });

    const newSlide = slides[0];

    // Verify all defaults are applied
    expect((newSlide as any).focalPoint).toBe(50);
    expect((newSlide as any).fontSize).toBe(24);
    expect((newSlide as any).textAlign).toBe('left');
    expect((newSlide as any).lineHeight).toBe(1.4);
    expect((newSlide as any).letterSpacing).toBe(0);
    expect((newSlide as any).scrollSpeed).toBe('medium');
    expect((newSlide as any).mirrorHorizontal).toBe(false);
    expect((newSlide as any).mirrorVertical).toBe(false);
    expect((newSlide as any).backgroundColor).toBe('#000000');
    expect((newSlide as any).backgroundOpacity).toBe(100);
    expect((newSlide as any).safeAreaPadding).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
  });

  it('should maintain 100% data retention across 10 slide switches', async () => {
    const { addSlide, setActiveSlide, updateSlide } = useStoryBuilderStore.getState();

    // Create 10 slides
    for (let i = 0; i < 10; i++) {
      act(() => {
        addSlide('teleprompter', i);
        updateSlide(i, {
          focalPoint: i * 10,
          fontSize: 16 + i * 5,
          textAlign: ['left', 'center', 'right'][i % 3] as any,
        } as any);
      });
    }

    // Switch through all slides multiple times
    for (let round = 0; round < 3; round++) {
      for (let i = 0; i < 10; i++) {
        act(() => {
          setActiveSlide(i);
        });
      }
    }

    await waitFor(() => {
      const currentSlides = useStoryBuilderStore.getState().slides;

      // Verify 100% data retention
      for (let i = 0; i < 10; i++) {
        expect((currentSlides[i] as any).focalPoint).toBe(i * 10);
        expect((currentSlides[i] as any).fontSize).toBe(16 + i * 5);
        expect((currentSlides[i] as any).textAlign).toBe(['left', 'center', 'right'][i % 3]);
      }
    });
  });
});
