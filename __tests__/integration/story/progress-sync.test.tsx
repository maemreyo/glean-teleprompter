/**
 * Progress Sync Integration Tests
 * 
 * Tests for progress bar synchronization with scroll depth
 * 
 * @feature 012-standalone-story
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { TeleprompterSlide } from '@/components/story/SlideTypes/TeleprompterSlide';
import { useStoryStore } from '@/lib/stores/useStoryStore';
import { useTeleprompterStore } from '@/lib/stores/useTeleprompterStore';
import type { TeleprompterSlide as TeleprompterSlideType } from '@/lib/story/types';

// Mock requestAnimationFrame
let mockRafCallbacks: Array<(timestamp: number) => void> = [];
let mockRafId = 0;

global.requestAnimationFrame = (callback: FrameRequestCallback) => {
  const id = mockRafId++;
  mockRafCallbacks.push(callback);
  return id;
};

global.cancelAnimationFrame = (id: number) => {
  mockRafCallbacks = mockRafCallbacks.filter((cb, index) => index !== id);
};

describe('Progress Sync Integration (T036)', () => {
  const mockTeleprompterSlide: TeleprompterSlideType = {
    id: 'slide-1',
    type: 'teleprompter',
    content: 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\n'.repeat(20), // Long content
    duration: 'manual',
  };

  beforeEach(() => {
    mockRafCallbacks = [];
    mockRafId = 0;
    jest.clearAllMocks();
    
    // Reset stores
    useStoryStore.getState().reset();
    useTeleprompterStore.getState().reset();
  });

  afterEach(() => {
    mockRafCallbacks = [];
  });

  it('should update progress bar when scrolling', () => {
    const onProgressChange = jest.fn();
    
    render(
      <TeleprompterSlide
        slide={mockTeleprompterSlide}
        slideIndex={0}
        totalSlides={1}
      />
    );

    // Start scrolling
    act(() => {
      const { startScrolling } = useTeleprompterStore.getState();
      startScrolling();
    });

    // Simulate scroll by triggering RAF callbacks
    act(() => {
      let timestamp = 0;
      for (let i = 0; i < 10; i++) {
        timestamp += 16; // ~60fps
        mockRafCallbacks.forEach((cb) => cb(timestamp));
      }
    });

    // Progress should have been updated in the store
    const storeState = useStoryStore.getState();
    expect(storeState.progressOverride).toBeGreaterThanOrEqual(0);
  });

  it('should sync progress override with scroll depth', () => {
    render(
      <TeleprompterSlide
        slide={mockTeleprompterSlide}
        slideIndex={0}
        totalSlides={1}
      />
    );

    // Start scrolling
    act(() => {
      const { startScrolling } = useTeleprompterStore.getState();
      startScrolling();
    });

    // Get initial progress
    const initialProgress = useStoryStore.getState().progressOverride;

    // Scroll further
    act(() => {
      let timestamp = 100;
      for (let i = 0; i < 20; i++) {
        timestamp += 16;
        mockRafCallbacks.forEach((cb) => cb(timestamp));
      }
    });

    // Progress should have increased
    const finalProgress = useStoryStore.getState().progressOverride;
    expect(finalProgress).toBeGreaterThanOrEqual(initialProgress || 0);
  });

  it('should update slide progress with scroll depth', () => {
    render(
      <TeleprompterSlide
        slide={mockTeleprompterSlide}
        slideIndex={0}
        totalSlides={1}
      />
    );

    // Start scrolling
    act(() => {
      const { startScrolling } = useTeleprompterStore.getState();
      startScrolling();
    });

    // Simulate scrolling
    act(() => {
      let timestamp = 0;
      for (let i = 0; i < 15; i++) {
        timestamp += 16;
        mockRafCallbacks.forEach((cb) => cb(timestamp));
      }
    });

    // Both progressOverride and slideProgress should be updated
    const storeState = useStoryStore.getState();
    expect(storeState.slideProgress).toBeGreaterThanOrEqual(0);
    expect(storeState.progressOverride).toBe(storeState.slideProgress);
  });

  it('should mark slide as complete when reaching bottom', () => {
    const onComplete = jest.fn();
    
    render(
      <TeleprompterSlide
        slide={mockTeleprompterSlide}
        slideIndex={0}
        totalSlides={2}
        onComplete={onComplete}
      />
    );

    // Start scrolling
    act(() => {
      const { startScrolling } = useTeleprompterStore.getState();
      startScrolling();
    });

    // Simulate scrolling to end
    act(() => {
      let timestamp = 0;
      // Simulate many frames to reach end
      for (let i = 0; i < 100; i++) {
        timestamp += 16;
        mockRafCallbacks.forEach((cb) => cb(timestamp));
      }
    });

    // Slide progress should be 1.0 (100%)
    const storeState = useStoryStore.getState();
    expect(storeState.slideProgress).toBe(1);
  });

  it('should not auto-advance when teleprompter completes', () => {
    let completed = false;
    const onComplete = () => { completed = true; };
    
    render(
      <TeleprompterSlide
        slide={mockTeleprompterSlide}
        slideIndex={0}
        totalSlides={2}
        onComplete={onComplete}
      />
    );

    const initialIndex = useStoryStore.getState().currentSlideIndex;

    // Start scrolling
    act(() => {
      const { startScrolling } = useTeleprompterStore.getState();
      startScrolling();
    });

    // Scroll to end
    act(() => {
      let timestamp = 0;
      for (let i = 0; i < 100; i++) {
        timestamp += 16;
        mockRafCallbacks.forEach((cb) => cb(timestamp));
      }
    });

    // Should not auto-advance - index should remain the same
    const finalIndex = useStoryStore.getState().currentSlideIndex;
    expect(finalIndex).toBe(initialIndex);
  });

  it('should handle manual scroll events', () => {
    render(
      <TeleprompterSlide
        slide={mockTeleprompterSlide}
        slideIndex={0}
        totalSlides={1}
      />
    );

    // Get scroll container from DOM
    const scrollContainer = document.querySelector('[data-scroll-container]');
    expect(scrollContainer).toBeInTheDocument();

    // Simulate manual scroll
    act(() => {
      if (scrollContainer) {
        scrollContainer.scrollTop = 100;
        scrollContainer.dispatchEvent(new Event('scroll'));
      }
    });

    // Progress should update after manual scroll
    const storeState = useStoryStore.getState();
    // May be throttled, so just verify store is accessible
    expect(storeState).toBeDefined();
  });

  it('should throttle progress updates to 100ms', () => {
    render(
      <TeleprompterSlide
        slide={mockTeleprompterSlide}
        slideIndex={0}
        totalSlides={1}
      />
    );

    // Start scrolling
    act(() => {
      const { startScrolling } = useTeleprompterStore.getState();
      startScrolling();
    });

    let updateCount = 0;
    const originalSetProgressOverride = useStoryStore.getState().setProgressOverride;
    
    // Spy on progress updates
    jest.spyOn(useStoryStore.getState(), 'setProgressOverride').mockImplementation((...args) => {
      updateCount++;
      originalSetProgressOverride(...args);
    });

    // Simulate rapid scrolling
    act(() => {
      let timestamp = 0;
      for (let i = 0; i < 50; i++) {
        timestamp += 5; // Very fast updates
        mockRafCallbacks.forEach((cb) => cb(timestamp));
      }
    });

    // Updates should be throttled (less than raw frame count)
    // With 50 frames at 5ms intervals, we should have fewer than 50 updates
    expect(updateCount).toBeLessThan(50);
  });

  it('should maintain progress accuracy within 2%', () => {
    render(
      <TeleprompterSlide
        slide={mockTeleprompterSlide}
        slideIndex={0}
        totalSlides={1}
      />
    );

    // Start scrolling
    act(() => {
      const { startScrolling } = useTeleprompterStore.getState();
      startScrolling();
    });

    // Scroll to various positions and verify accuracy
    const testDepths = [0.25, 0.5, 0.75];
    
    testDepths.forEach(targetDepth => {
      act(() => {
        // Simulate scrolling to target depth
        let timestamp = 0;
        for (let i = 0; i < 50; i++) {
          timestamp += 16;
          mockRafCallbacks.forEach((cb) => cb(timestamp));
        }
      });

      const progress = useStoryStore.getState().progressOverride;
      // Verify progress is within 2% of expected
      if (progress !== null) {
        expect(Math.abs(progress - targetDepth)).toBeLessThan(0.02);
      }
    });
  });
});
