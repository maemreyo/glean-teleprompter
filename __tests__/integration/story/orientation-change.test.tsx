/**
 * Orientation Change Integration Tests
 *
 * Tests for handling device orientation changes and layout recalculation.
 *
 * @feature 012-standalone-story
 * @file __tests__/integration/story/orientation-change.test.tsx
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { useOrientationChange } from '@/lib/story/hooks/useOrientationChange';

describe('Orientation Change Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  /**
   * Test component that uses useOrientationChange hook
   */
  function TestComponent({
    onOrientationChange,
    onBeforeOrientationChange,
  }: {
    onOrientationChange?: (orientation: 'portrait' | 'landscape') => void;
    onBeforeOrientationChange?: () => void;
  }) {
    const { currentOrientation, previousOrientation } = useOrientationChange({
      onOrientationChange,
      onBeforeOrientationChange,
    });

    return (
      <div>
        <div data-testid="current-orientation">{currentOrientation}</div>
        <div data-testid="previous-orientation">{previousOrientation || 'none'}</div>
      </div>
    );
  }

  it('should detect initial orientation', async () => {
    render(<TestComponent />);

    const currentElement = screen.getByTestId('current-orientation');
    expect(currentElement).toHaveTextContent(/portrait|landscape/);
  });

  it('should detect orientation change from portrait to landscape', async () => {
    const onOrientationChange = jest.fn();
    render(<TestComponent onOrientationChange={onOrientationChange} />);

    const currentElement = screen.getByTestId('current-orientation');

    // Initial orientation
    await waitFor(() => {
      expect(currentElement).toHaveTextContent(/portrait|landscape/);
    });

    // Simulate orientation change by resizing window
    await act(async () => {
      // Change to landscape (width > height)
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });
      window.dispatchEvent(new Event('resize'));
    });

    // Fast forward timers
    act(() => {
      jest.advanceTimersByTime(150);
    });

    await waitFor(() => {
      expect(currentElement).toHaveTextContent('landscape');
    });

    // Callback should be called
    expect(onOrientationChange).toHaveBeenCalledWith('landscape');
  });

  it('should detect orientation change from landscape to portrait', async () => {
    const onOrientationChange = jest.fn();

    // Start with landscape dimensions
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });

    render(<TestComponent onOrientationChange={onOrientationChange} />);

    const currentElement = screen.getByTestId('current-orientation');

    // Initial orientation should be landscape
    await waitFor(() => {
      expect(currentElement).toHaveTextContent('landscape');
    });

    // Simulate orientation change to portrait
    await act(async () => {
      // Change to portrait (height > width)
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 812, writable: true });
      window.dispatchEvent(new Event('resize'));
    });

    // Fast forward timers
    act(() => {
      jest.advanceTimersByTime(150);
    });

    await waitFor(() => {
      expect(currentElement).toHaveTextContent('portrait');
    });

    // Callback should be called
    expect(onOrientationChange).toHaveBeenCalledWith('portrait');
  });

  it('should debounce rapid orientation changes', async () => {
    const onOrientationChange = jest.fn();
    render(<TestComponent onOrientationChange={onOrientationChange} />);

    // Trigger multiple rapid changes
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        const width = i % 2 === 0 ? 375 : 1024;
        const height = i % 2 === 0 ? 812 : 768;
        Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: height, writable: true });
        window.dispatchEvent(new Event('resize'));
      });
    }

    // Fast forward past debounce delay
    act(() => {
      jest.advanceTimersByTime(150);
    });

    // Should only call callback once after debounce
    await waitFor(() => {
      expect(onOrientationChange).toHaveBeenCalledTimes(1);
    });
  });

  it('should call onBeforeOrientationChange callback', async () => {
    const onBeforeOrientationChange = jest.fn();
    const onOrientationChange = jest.fn();

    render(
      <TestComponent
        onOrientationChange={onOrientationChange}
        onBeforeOrientationChange={onBeforeOrientationChange}
      />
    );

    // Simulate orientation change
    await act(async () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });
      window.dispatchEvent(new Event('resize'));
    });

    // Before callback should be called immediately
    expect(onBeforeOrientationChange).toHaveBeenCalled();

    // Fast forward for actual callback
    act(() => {
      jest.advanceTimersByTime(150);
    });

    await waitFor(() => {
      expect(onOrientationChange).toHaveBeenCalled();
    });
  });

  it('should clean up event listeners on unmount', async () => {
    const { unmount } = render(<TestComponent />);

    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('orientationchange', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });

  it('should handle orientationchange event', async () => {
    const onOrientationChange = jest.fn();
    render(<TestComponent onOrientationChange={onOrientationChange} />);

    // Trigger orientationchange event
    await act(async () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });
      window.dispatchEvent(new Event('orientationchange'));
    });

    // Fast forward timers
    act(() => {
      jest.advanceTimersByTime(150);
    });

    await waitFor(() => {
      expect(onOrientationChange).toHaveBeenCalled();
    });
  });
});
