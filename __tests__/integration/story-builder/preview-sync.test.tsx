/**
 * Integration tests for story builder preview synchronization
 * @feature 014-teleprompter-preview-sync
 */

import { render, waitFor } from '@testing-library/react';
import { act } from 'react';
import { useStoryBuilderStore } from '@/lib/story-builder/store';
import type { BuilderSlide } from '@/lib/story-builder/types';
import { convertBuilderSlideToStorySlide } from '@/app/story-preview/page';

// Mock the preview sync hook
jest.mock('@/lib/story-builder/hooks/usePreviewSync', () => ({
  usePreviewSync: jest.fn(),
}));

describe('Builder-to-Preview Teleprompter Sync', () => {
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

  describe('focal point synchronization', () => {
    it('should preserve focalPoint when converting builder slide to story slide', () => {
      const builderSlide: BuilderSlide = {
        id: 'test-slide-1',
        type: 'teleprompter',
        duration: 'manual',
        backgroundColor: '#FFFFFF',
        content: 'Test content',
        focalPoint: 75,
        fontSize: 32,
      } as BuilderSlide;

      const storySlide = convertBuilderSlideToStorySlide(builderSlide);

      expect(storySlide.type).toBe('teleprompter');
      expect((storySlide as any).focalPoint).toBe(75);
    });

    it('should apply default focalPoint when not provided in builder slide', () => {
      const builderSlide: BuilderSlide = {
        id: 'test-slide-2',
        type: 'teleprompter',
        duration: 'manual',
        backgroundColor: '#FFFFFF',
        content: 'Test content',
        // focalPoint not provided
      } as BuilderSlide;

      const storySlide = convertBuilderSlideToStorySlide(builderSlide);

      expect(storySlide.type).toBe('teleprompter');
      expect((storySlide as any).focalPoint).toBe(50); // Default value
    });

    it('should preserve different focalPoint values across multiple slides', () => {
      const slides: BuilderSlide[] = [
        {
          id: 'slide-1',
          type: 'teleprompter',
          duration: 'manual',
          backgroundColor: '#FFFFFF',
          content: 'Content 1',
          focalPoint: 0,
        } as BuilderSlide,
        {
          id: 'slide-2',
          type: 'teleprompter',
          duration: 'manual',
          backgroundColor: '#FFFFFF',
          content: 'Content 2',
          focalPoint: 50,
        } as BuilderSlide,
        {
          id: 'slide-3',
          type: 'teleprompter',
          duration: 'manual',
          backgroundColor: '#FFFFFF',
          content: 'Content 3',
          focalPoint: 100,
        } as BuilderSlide,
      ];

      const convertedSlides = slides.map(convertBuilderSlideToStorySlide);

      expect((convertedSlides[0] as any).focalPoint).toBe(0);
      expect((convertedSlides[1] as any).focalPoint).toBe(50);
      expect((convertedSlides[2] as any).focalPoint).toBe(100);
    });

    it('should sync focalPoint changes to store', () => {
      const { addSlide, updateSlide } = useStoryBuilderStore.getState();

      act(() => {
        addSlide('teleprompter', 0);
      });

      const state = useStoryBuilderStore.getState();
      const slideIndex = 0;

      act(() => {
        updateSlide(slideIndex, { focalPoint: 85 } as any);
      });

      const updatedState = useStoryBuilderStore.getState();
      expect((updatedState.slides[slideIndex] as any).focalPoint).toBe(85);
    });

    it('should handle boundary values for focalPoint', () => {
      const builderSlide: BuilderSlide = {
        id: 'test-slide',
        type: 'teleprompter',
        duration: 'manual',
        backgroundColor: '#FFFFFF',
        content: 'Test content',
        focalPoint: 0,
      } as BuilderSlide;

      const storySlide = convertBuilderSlideToStorySlide(builderSlide);
      expect((storySlide as any).focalPoint).toBe(0);

      (builderSlide as any).focalPoint = 100;
      const storySlide2 = convertBuilderSlideToStorySlide(builderSlide);
      expect((storySlide2 as any).focalPoint).toBe(100);
    });
  });

  describe('fontSize synchronization', () => {
    it('should preserve fontSize when converting builder slide to story slide', () => {
      const builderSlide: BuilderSlide = {
        id: 'test-slide-1',
        type: 'teleprompter',
        duration: 'manual',
        backgroundColor: '#FFFFFF',
        content: 'Test content',
        focalPoint: 50,
        fontSize: 36,
      } as BuilderSlide;

      const storySlide = convertBuilderSlideToStorySlide(builderSlide);

      expect(storySlide.type).toBe('teleprompter');
      expect((storySlide as any).fontSize).toBe(36);
    });

    it('should apply default fontSize when not provided in builder slide', () => {
      const builderSlide: BuilderSlide = {
        id: 'test-slide-2',
        type: 'teleprompter',
        duration: 'manual',
        backgroundColor: '#FFFFFF',
        content: 'Test content',
        // fontSize not provided
      } as BuilderSlide;

      const storySlide = convertBuilderSlideToStorySlide(builderSlide);

      expect(storySlide.type).toBe('teleprompter');
      expect((storySlide as any).fontSize).toBe(24); // Default value
    });

    it('should preserve different fontSize values across multiple slides', () => {
      const slides: BuilderSlide[] = [
        {
          id: 'slide-1',
          type: 'teleprompter',
          duration: 'manual',
          backgroundColor: '#FFFFFF',
          content: 'Content 1',
          fontSize: 16,
        } as BuilderSlide,
        {
          id: 'slide-2',
          type: 'teleprompter',
          duration: 'manual',
          backgroundColor: '#FFFFFF',
          content: 'Content 2',
          fontSize: 32,
        } as BuilderSlide,
        {
          id: 'slide-3',
          type: 'teleprompter',
          duration: 'manual',
          backgroundColor: '#FFFFFF',
          content: 'Content 3',
          fontSize: 72,
        } as BuilderSlide,
      ];

      const convertedSlides = slides.map(convertBuilderSlideToStorySlide);

      expect((convertedSlides[0] as any).fontSize).toBe(16);
      expect((convertedSlides[1] as any).fontSize).toBe(32);
      expect((convertedSlides[2] as any).fontSize).toBe(72);
    });

    it('should sync fontSize changes to store', () => {
      const { addSlide, updateSlide } = useStoryBuilderStore.getState();

      act(() => {
        addSlide('teleprompter', 0);
      });

      const state = useStoryBuilderStore.getState();
      const slideIndex = 0;

      act(() => {
        updateSlide(slideIndex, { fontSize: 48 } as any);
      });

      const updatedState = useStoryBuilderStore.getState();
      expect((updatedState.slides[slideIndex] as any).fontSize).toBe(48);
    });

    it('should handle boundary values for fontSize', () => {
      const builderSlide: BuilderSlide = {
        id: 'test-slide',
        type: 'teleprompter',
        duration: 'manual',
        backgroundColor: '#FFFFFF',
        content: 'Test content',
        fontSize: 16,
      } as BuilderSlide;

      const storySlide = convertBuilderSlideToStorySlide(builderSlide);
      expect((storySlide as any).fontSize).toBe(16);

      (builderSlide as any).fontSize = 72;
      const storySlide2 = convertBuilderSlideToStorySlide(builderSlide);
      expect((storySlide2 as any).fontSize).toBe(72);
    });
  });

  describe('combined property synchronization', () => {
    it('should preserve both focalPoint and fontSize together', () => {
      const builderSlide: BuilderSlide = {
        id: 'test-slide',
        type: 'teleprompter',
        duration: 'manual',
        backgroundColor: '#FFFFFF',
        content: 'Test content',
        focalPoint: 65,
        fontSize: 28,
      } as BuilderSlide;

      const storySlide = convertBuilderSlideToStorySlide(builderSlide);

      expect((storySlide as any).focalPoint).toBe(65);
      expect((storySlide as any).fontSize).toBe(28);
    });

    it('should handle slides with only focalPoint set', () => {
      const builderSlide: BuilderSlide = {
        id: 'test-slide',
        type: 'teleprompter',
        duration: 'manual',
        backgroundColor: '#FFFFFF',
        content: 'Test content',
        focalPoint: 40,
      } as BuilderSlide;

      const storySlide = convertBuilderSlideToStorySlide(builderSlide);

      expect((storySlide as any).focalPoint).toBe(40);
      expect((storySlide as any).fontSize).toBe(24); // Default
    });

    it('should handle slides with only fontSize set', () => {
      const builderSlide: BuilderSlide = {
        id: 'test-slide',
        type: 'teleprompter',
        duration: 'manual',
        backgroundColor: '#FFFFFF',
        content: 'Test content',
        fontSize: 40,
      } as BuilderSlide;

      const storySlide = convertBuilderSlideToStorySlide(builderSlide);

      expect((storySlide as any).focalPoint).toBe(50); // Default
      expect((storySlide as any).fontSize).toBe(40);
    });

    it('should handle slides with neither property set', () => {
      const builderSlide: BuilderSlide = {
        id: 'test-slide',
        type: 'teleprompter',
        duration: 'manual',
        backgroundColor: '#FFFFFF',
        content: 'Test content',
      } as BuilderSlide;

      const storySlide = convertBuilderSlideToStorySlide(builderSlide);

      expect((storySlide as any).focalPoint).toBe(50); // Default
      expect((storySlide as any).fontSize).toBe(24); // Default
    });
  });

  describe('content sanitization', () => {
    it('should sanitize content during conversion', () => {
      const builderSlide: BuilderSlide = {
        id: 'test-slide',
        type: 'teleprompter',
        duration: 'manual',
        backgroundColor: '#FFFFFF',
        content: '<script>alert("xss")</script>Safe content',
        focalPoint: 50,
        fontSize: 24,
      } as BuilderSlide;

      const storySlide = convertBuilderSlideToStorySlide(builderSlide);

      // Content should be sanitized
      expect((storySlide as any).content).not.toContain('<script>');
      expect((storySlide as any).focalPoint).toBe(50);
      expect((storySlide as any).fontSize).toBe(24);
    });
  });
});
