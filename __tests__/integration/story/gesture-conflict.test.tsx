/**
 * Gesture Conflict Prevention Integration Tests
 *
 * Tests for preventing accidental slide advancement during teleprompter use.
 *
 * @feature 012-standalone-story
 * @file __tests__/integration/story/gesture-conflict.test.tsx
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useStoryNavigation } from '@/lib/story/hooks/useStoryNavigation';
import type { AnySlide } from '@/lib/story/types';

describe('Gesture Conflict Prevention Integration', () => {
  const mockSlide: AnySlide = {
    id: 'test-slide-1',
    type: 'teleprompter',
    content: 'Test content for teleprompter slide.',
    duration: 'manual',
  };

  const mockNonTeleprompterSlide: AnySlide = {
    id: 'test-slide-2',
    type: 'text-highlight',
    content: 'Test content',
    highlights: [],
    duration: 5000,
  };

  /**
   * Test component with gesture handling
   */
  function TestComponent({
    currentSlide,
    onNextSlide,
  }: {
    currentSlide: AnySlide;
    onNextSlide?: () => void;
  }) {
    const { handleTap, goToNextSlide } = useStoryNavigation({
      totalSlides: 3,
      currentSlide,
      onSlideChange: (index) => onNextSlide?.(),
    });

    return (
      <div onClick={handleTap} data-testid="slide-container">
        <button onClick={goToNextSlide} data-testid="next-button">
          Next Slide
        </button>
      </div>
    );
  }

  it('should disable tap navigation for teleprompter slides (T080)', () => {
    const onNextSlide = jest.fn();

    render(<TestComponent currentSlide={mockSlide} onNextSlide={onNextSlide} />);

    const container = screen.getByTestId('slide-container');

    // Tap on the container (should not advance slide for teleprompter)
    fireEvent.click(container);

    // Should not advance slide
    expect(onNextSlide).not.toHaveBeenCalled();
  });

  it('should allow tap navigation for non-teleprompter slides (T083)', () => {
    const onNextSlide = jest.fn();

    render(<TestComponent currentSlide={mockNonTeleprompterSlide} onNextSlide={onNextSlide} />);

    const container = screen.getByTestId('slide-container');

    // Tap on the container (should advance slide for non-teleprompter)
    fireEvent.click(container);

    // Should advance slide
    expect(onNextSlide).toHaveBeenCalled();
  });

  it('should allow explicit navigation via SkipToNext button (T082)', () => {
    const onNextSlide = jest.fn();

    render(<TestComponent currentSlide={mockSlide} onNextSlide={onNextSlide} />);

    const nextButton = screen.getByTestId('next-button');

    // Click the explicit next button
    fireEvent.click(nextButton);

    // Should advance slide even for teleprompter
    expect(onNextSlide).toHaveBeenCalled();
  });

  it('should handle different tap zones for non-teleprompter slides', () => {
    const onNextSlide = jest.fn();
    const onPreviousSlide = jest.fn();

    render(<TestComponent currentSlide={mockNonTeleprompterSlide} onNextSlide={onNextSlide} />);

    const container = screen.getByTestId('slide-container');
    const rect = container.getBoundingClientRect();

    // Simulate right-side tap (70% of width)
    fireEvent(
      container,
      new MouseEvent('click', {
        clientX: rect.left + rect.width * 0.8,
        clientY: rect.top + rect.height * 0.5,
      })
    );

    expect(onNextSlide).toHaveBeenCalled();
  });

  it('should not advance slide when tapping center of teleprompter slide', () => {
    const onNextSlide = jest.fn();

    render(<TestComponent currentSlide={mockSlide} onNextSlide={onNextSlide} />);

    const container = screen.getByTestId('slide-container');
    const rect = container.getBoundingClientRect();

    // Tap center of teleprompter slide (should not advance)
    fireEvent(
      container,
      new MouseEvent('click', {
        clientX: rect.left + rect.width * 0.5,
        clientY: rect.top + rect.height * 0.5,
      })
    );

    // Should not advance
    expect(onNextSlide).not.toHaveBeenCalled();
  });

  it('should not advance slide when tapping edges of teleprompter slide', () => {
    const onNextSlide = jest.fn();

    render(<TestComponent currentSlide={mockSlide} onNextSlide={onNextSlide} />);

    const container = screen.getByTestId('slide-container');
    const rect = container.getBoundingClientRect();

    // Tap left edge (should not advance for teleprompter)
    fireEvent(
      container,
      new MouseEvent('click', {
        clientX: rect.left + rect.width * 0.1,
        clientY: rect.top + rect.height * 0.5,
      })
    );

    expect(onNextSlide).not.toHaveBeenCalled();

    // Tap right edge (should not advance for teleprompter)
    fireEvent(
      container,
      new MouseEvent('click', {
        clientX: rect.left + rect.width * 0.9,
        clientY: rect.top + rect.height * 0.5,
      })
    );

    expect(onNextSlide).not.toHaveBeenCalled();
  });
});
