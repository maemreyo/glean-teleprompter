/**
 * Integration tests for story builder to preview synchronization
 * @feature 014-teleprompter-preview-sync
 */

import { render, waitFor } from '@testing-library/react';
import { useStoryBuilderStore } from '@/lib/story-builder/store';
import type { BuilderSlide } from '@/lib/story-builder/types';
import { convertBuilderSlideToStorySlide } from '@/app/story-preview/page';
import type { TeleprompterSlide } from '@/lib/story/types';

// Mock usePreviewSync hook
jest.mock('@/lib/story-builder/hooks/usePreviewSync', () => ({
  usePreviewSync: jest.fn(),
}));

describe('Builder to Preview Sync - Focal Point (T010)', () => {
  beforeEach(() => {
    // Reset store before each test
    useStoryBuilderStore.getState().clearStory();
  });

  it('should sync focal point from builder to preview', () => {
    const builderSlide: BuilderSlide = {
      id: 'test-slide-1',
      type: 'teleprompter',
      duration: 'manual',
      content: 'Test content',
      focalPoint: 75,
      backgroundColor: '#000000',
      thumbnail: undefined,
      isDragging: false,
      isSelected: false,
    };

    const storySlide = convertBuilderSlideToStorySlide(builderSlide) as TeleprompterSlide;

    expect(storySlide.focalPoint).toBe(75);
    expect(storySlide.type).toBe('teleprompter');
  });

  it('should apply default focal point when not provided', () => {
    const builderSlide: BuilderSlide = {
      id: 'test-slide-2',
      type: 'teleprompter',
      duration: 'manual',
      content: 'Test content',
      backgroundColor: '#000000',
      thumbnail: undefined,
      isDragging: false,
      isSelected: false,
    };

    const storySlide = convertBuilderSlideToStorySlide(builderSlide) as TeleprompterSlide;

    expect(storySlide.focalPoint).toBe(50); // Default
  });

  it('should sync focal point changes in real-time', async () => {
    const { addSlide, updateSlide, slides } = useStoryBuilderStore.getState();

    // Add a teleprompter slide
    addSlide('teleprompter', 0);

    const updatedSlide = {
      ...slides[0],
      focalPoint: 60,
    };

    updateSlide(0, updatedSlide);

    await waitFor(() => {
      const currentSlide = useStoryBuilderStore.getState().slides[0];
      expect((currentSlide as any).focalPoint).toBe(60);
    });
  });
});

describe('Builder to Preview Sync - Font Size (T019)', () => {
  beforeEach(() => {
    useStoryBuilderStore.getState().clearStory();
  });

  it('should sync font size from builder to preview', () => {
    const builderSlide: BuilderSlide = {
      id: 'test-slide-3',
      type: 'teleprompter',
      duration: 'manual',
      content: 'Test content',
      fontSize: 36,
      backgroundColor: '#000000',
      thumbnail: undefined,
      isDragging: false,
      isSelected: false,
    };

    const storySlide = convertBuilderSlideToStorySlide(builderSlide) as TeleprompterSlide;

    expect(storySlide.fontSize).toBe(36);
    expect(storySlide.type).toBe('teleprompter');
  });

  it('should apply default font size when not provided', () => {
    const builderSlide: BuilderSlide = {
      id: 'test-slide-4',
      type: 'teleprompter',
      duration: 'manual',
      content: 'Test content',
      backgroundColor: '#000000',
      thumbnail: undefined,
      isDragging: false,
      isSelected: false,
    };

    const storySlide = convertBuilderSlideToStorySlide(builderSlide) as TeleprompterSlide;

    expect(storySlide.fontSize).toBe(24); // Default
  });

  it('should sync font size changes in real-time', async () => {
    const { addSlide, updateSlide, slides } = useStoryBuilderStore.getState();

    // Add a teleprompter slide
    addSlide('teleprompter', 0);

    const updatedSlide = {
      ...slides[0],
      fontSize: 32,
    };

    updateSlide(0, updatedSlide);

    await waitFor(() => {
      const currentSlide = useStoryBuilderStore.getState().slides[0];
      expect((currentSlide as any).fontSize).toBe(32);
    });
  });
});

describe('Builder to Preview Sync - Enhanced Settings (T043)', () => {
  beforeEach(() => {
    useStoryBuilderStore.getState().clearStory();
  });

  it('should sync all enhanced settings from builder to preview', () => {
    const builderSlide: BuilderSlide = {
      id: 'test-slide-5',
      type: 'teleprompter',
      duration: 'manual',
      content: 'Test content',
      focalPoint: 40,
      fontSize: 28,
      textAlign: 'center',
      lineHeight: 1.6,
      letterSpacing: 1,
      scrollSpeed: 'fast',
      mirrorHorizontal: true,
      mirrorVertical: false,
      backgroundColor: '#1a1a1a',
      backgroundOpacity: 90,
      safeAreaPadding: {
        top: 20,
        right: 30,
        bottom: 20,
        left: 30,
      },
      thumbnail: undefined,
      isDragging: false,
      isSelected: false,
    };

    const storySlide = convertBuilderSlideToStorySlide(builderSlide) as TeleprompterSlide;

    // Verify all 11 properties are preserved
    expect(storySlide.focalPoint).toBe(40);
    expect(storySlide.fontSize).toBe(28);
    expect(storySlide.textAlign).toBe('center');
    expect(storySlide.lineHeight).toBe(1.6);
    expect(storySlide.letterSpacing).toBe(1);
    expect(storySlide.scrollSpeed).toBe('fast');
    expect(storySlide.mirrorHorizontal).toBe(true);
    expect(storySlide.mirrorVertical).toBe(false);
    expect(storySlide.backgroundColor).toBe('#1a1a1a');
    expect(storySlide.backgroundOpacity).toBe(90);
    expect(storySlide.safeAreaPadding).toEqual({
      top: 20,
      right: 30,
      bottom: 20,
      left: 30,
    });
  });

  it('should apply defaults for all enhanced settings when not provided', () => {
    const builderSlide: BuilderSlide = {
      id: 'test-slide-6',
      type: 'teleprompter',
      duration: 'manual',
      content: 'Test content',
      backgroundColor: '#000000',
      thumbnail: undefined,
      isDragging: false,
      isSelected: false,
    };

    const storySlide = convertBuilderSlideToStorySlide(builderSlide) as TeleprompterSlide;

    // Verify all defaults are applied
    expect(storySlide.focalPoint).toBe(50);
    expect(storySlide.fontSize).toBe(24);
    expect(storySlide.textAlign).toBe('left');
    expect(storySlide.lineHeight).toBe(1.4);
    expect(storySlide.letterSpacing).toBe(0);
    expect(storySlide.scrollSpeed).toBe('medium');
    expect(storySlide.mirrorHorizontal).toBe(false);
    expect(storySlide.mirrorVertical).toBe(false);
    expect(storySlide.backgroundColor).toBe('#000000');
    expect(storySlide.backgroundOpacity).toBe(100);
    expect(storySlide.safeAreaPadding).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
  });

  it('should sync enhanced settings changes in real-time', async () => {
    const { addSlide, updateSlide, slides } = useStoryBuilderStore.getState();

    // Add a teleprompter slide
    addSlide('teleprompter', 0);

    const updatedSlide = {
      ...slides[0],
      textAlign: 'right' as const,
      lineHeight: 1.8,
      letterSpacing: 2,
    };

    updateSlide(0, updatedSlide);

    await waitFor(() => {
      const currentSlide = useStoryBuilderStore.getState().slides[0];
      expect((currentSlide as any).textAlign).toBe('right');
      expect((currentSlide as any).lineHeight).toBe(1.8);
      expect((currentSlide as any).letterSpacing).toBe(2);
    });
  });
});

describe('Builder to Preview Sync - Backward Compatibility', () => {
  it('should handle slides with missing properties gracefully', () => {
    // Simulate an old slide without enhanced properties
    const oldSlide = {
      id: 'old-slide',
      type: 'teleprompter' as const,
      duration: 'manual' as const,
      content: 'Old content',
      backgroundColor: '#000000',
    } as BuilderSlide;

    const storySlide = convertBuilderSlideToStorySlide(oldSlide) as TeleprompterSlide;

    // Should apply all defaults without errors
    expect(storySlide.focalPoint).toBeDefined();
    expect(storySlide.fontSize).toBeDefined();
    expect(storySlide.textAlign).toBeDefined();
    expect(storySlide.lineHeight).toBeDefined();
  });

  it('should preserve slide content during conversion', () => {
    const builderSlide: BuilderSlide = {
      id: 'test-slide-7',
      type: 'teleprompter',
      duration: 'manual',
      content: 'This is a test story content with multiple lines.\nLine 2\nLine 3',
      backgroundColor: '#000000',
      thumbnail: undefined,
      isDragging: false,
      isSelected: false,
    };

    const storySlide = convertBuilderSlideToStorySlide(builderSlide) as TeleprompterSlide;

    expect(storySlide.content).toContain('This is a test story content');
    expect(storySlide.content).toContain('Line 2');
    expect(storySlide.content).toContain('Line 3');
  });
});
