/**
 * Slide Transition Integration Tests
 *
 * Tests for slide navigation and transitions including:
 * - Framer Motion animations
 * - Slide direction changes
 * - Progress bar updates
 * - Slide state management
 *
 * @feature 012-standalone-story
 * @task T017
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { StoryViewer } from '@/components/story/StoryViewer';
import { useStoryStore } from '@/lib/stores/useStoryStore';
import type { StoryScript } from '@/lib/story/types';

// Mock Framer Motion
const MockMotionDiv = React.forwardRef<HTMLDivElement, React.PropsWithChildren<unknown>>(
  ({ children, ...props }, ref) => (
    <div ref={ref} {...props}>
      {children}
    </div>
  )
);
MockMotionDiv.displayName = 'MockMotionDiv';

jest.mock('framer-motion', () => ({
  motion: {
    div: MockMotionDiv,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('Story Slide Transitions', () => {
  const mockStory: StoryScript = {
    id: 'story-1',
    title: 'Test Story',
    version: '1.0',
    slides: [
      {
        id: 'slide-1',
        type: 'text-highlight',
        content: 'First slide',
        duration: 5000,
        animation: { type: 'fade', duration: 300 },
        highlights: [],
      },
      {
        id: 'slide-2',
        type: 'text-highlight',
        content: 'Second slide',
        duration: 5000,
        animation: { type: 'slide-in', direction: 'left', duration: 300 },
        highlights: [],
      },
      {
        id: 'slide-3',
        type: 'image',
        content: 'https://example.com/image.jpg',
        alt: 'Test image',
        duration: 5000,
        animation: { type: 'zoom', duration: 300 },
      },
    ],
    autoAdvance: true,
    showProgress: true,
  };

  beforeEach(() => {
    // Reset store before each test
    const store = useStoryStore.getState();
    store.reset();
  });

  describe('Slide Navigation', () => {
    it('should render first slide on mount', () => {
      render(<StoryViewer story={mockStory} />);

      expect(screen.getByText('First slide')).toBeInTheDocument();
    });

    it('should navigate to next slide', async () => {
      const { container } = render(<StoryViewer story={mockStory} />);

      // Find and click right side of screen (next slide)
      const storyContainer = container.querySelector('.story-viewer');
      expect(storyContainer).toBeInTheDocument();

      if (storyContainer) {
        // Simulate click on right side (70% of width)
        const rect: DOMRect = {
          left: 0,
          top: 0,
          width: 1000,
          height: 1000,
          right: 1000,
          bottom: 1000,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        };
        jest.spyOn(storyContainer as Element, 'getBoundingClientRect').mockReturnValue(rect);

        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          clientX: 850, // Right 30%
        });

        storyContainer.dispatchEvent(clickEvent);

        await waitFor(() => {
          expect(screen.getByText('Second slide')).toBeInTheDocument();
        });
      }
    });

    it('should navigate to previous slide', async () => {
      const { container } = render(<StoryViewer story={mockStory} />);

      // First navigate to slide 2
      const store = useStoryStore.getState();
      store.goToSlide(1);

      await waitFor(() => {
        expect(screen.getByText('Second slide')).toBeInTheDocument();
      });

      // Then navigate back
      const storyContainer = container.querySelector('.story-viewer');
      if (storyContainer) {
        const rect: DOMRect = {
          left: 0,
          top: 0,
          width: 1000,
          height: 1000,
          right: 1000,
          bottom: 1000,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        };
        jest.spyOn(storyContainer as Element, 'getBoundingClientRect').mockReturnValue(rect);

        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          clientX: 150, // Left 30%
        });

        storyContainer.dispatchEvent(clickEvent);

        await waitFor(() => {
          expect(screen.getByText('First slide')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Animation Direction', () => {
    it('should set forward direction when moving to next slide', async () => {
      const store = useStoryStore.getState();

      render(<StoryViewer story={mockStory} />);

      act(() => {
        store.nextSlide();
      });

      await waitFor(() => {
        expect(store.direction).toBe(1); // Forward
      });
    });

    it('should set backward direction when moving to previous slide', async () => {
      const store = useStoryStore.getState();

      render(<StoryViewer story={mockStory} />);

      // First go to slide 2
      act(() => {
        store.goToSlide(1);
      });

      // Then go back
      act(() => {
        store.previousSlide();
      });

      await waitFor(() => {
        expect(store.direction).toBe(-1); // Backward
      });
    });
  });

  describe('Progress Bar Updates', () => {
    it('should show progress bar when showProgress is true', () => {
      render(<StoryViewer story={mockStory} />);

      const progressBar = screen.queryByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('should update progress when slide changes', async () => {
      const store = useStoryStore.getState();

      const { container } = render(<StoryViewer story={mockStory} />);

      // Check initial progress (slide 0)
      const progressBars = container.querySelectorAll('.progress-bar-segment');
      expect(progressBars.length).toBe(mockStory.slides.length);

      // Navigate to next slide
      act(() => {
        store.nextSlide();
      });

      await waitFor(() => {
        const updatedStore = useStoryStore.getState();
        expect(updatedStore.currentSlideIndex).toBe(1);
      });
    });

    it('should not show progress bar when showProgress is false', () => {
      const storyWithoutProgress: StoryScript = {
        ...mockStory,
        showProgress: false,
      };

      render(<StoryViewer story={storyWithoutProgress} />);

      const progressBar = screen.queryByRole('progressbar');
      expect(progressBar).not.toBeInTheDocument();
    });
  });

  describe('Slide State Management', () => {
    it('should update current slide index on navigation', async () => {
      const store = useStoryStore.getState();

      render(<StoryViewer story={mockStory} />);

      expect(store.currentSlideIndex).toBe(0);

      act(() => {
        store.nextSlide();
      });

      await waitFor(() => {
        const updatedStore = useStoryStore.getState();
        expect(updatedStore.currentSlideIndex).toBe(1);
      });
    });

    it('should reset to first slide when reset is called', async () => {
      const store = useStoryStore.getState();

      render(<StoryViewer story={mockStory} />);

      // Navigate to slide 2
      act(() => {
        store.goToSlide(2);
      });

      await waitFor(() => {
        expect(store.currentSlideIndex).toBe(2);
      });

      // Reset
      act(() => {
        store.reset();
      });

      await waitFor(() => {
        const updatedStore = useStoryStore.getState();
        expect(updatedStore.currentSlideIndex).toBe(0);
      });
    });

    it('should handle pause state correctly', () => {
      const store = useStoryStore.getState();

      render(<StoryViewer story={mockStory} />);

      expect(store.isPaused).toBe(false);

      act(() => {
        store.togglePause();
      });

      const updatedStore = useStoryStore.getState();
      expect(updatedStore.isPaused).toBe(true);
    });
  });

  describe('Boundary Conditions', () => {
    it('should not navigate beyond last slide', () => {
      const store = useStoryStore.getState();

      render(<StoryViewer story={mockStory} />);

      // Go to last slide
      act(() => {
        store.goToSlide(mockStory.slides.length - 1);
      });

      // Try to go beyond
      act(() => {
        store.nextSlide();
      });

      const updatedStore = useStoryStore.getState();
      expect(updatedStore.currentSlideIndex).toBe(mockStory.slides.length - 1);
    });

    it('should not navigate before first slide', () => {
      const store = useStoryStore.getState();

      render(<StoryViewer story={mockStory} />);

      // Already at first slide, try to go back
      act(() => {
        store.previousSlide();
      });

      const updatedStore = useStoryStore.getState();
      expect(updatedStore.currentSlideIndex).toBe(0);
    });
  });

  describe('Slide Rendering', () => {
    it('should render text-highlight slide correctly', () => {
      render(<StoryViewer story={mockStory} />);

      expect(screen.getByText('First slide')).toBeInTheDocument();
    });

    it('should render image slide correctly', async () => {
      const store = useStoryStore.getState();

      const { container } = render(<StoryViewer story={mockStory} />);

      // Navigate to image slide
      act(() => {
        store.goToSlide(2);
      });

      await waitFor(() => {
        const img = container.querySelector('img');
        expect(img).toBeInTheDocument();
        expect(img?.src).toBe('https://example.com/image.jpg');
      });
    });
  });
});
