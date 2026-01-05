/**
 * Wake Lock Visibility Integration Tests
 *
 * Tests for wake lock behavior when tab visibility changes.
 *
 * @feature 012-standalone-story
 * @file __tests__/integration/story/wake-lock-visibility.test.tsx
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { useWakeLock } from '@/lib/story/hooks/useWakeLock';

// Wake Lock API mock
const mockWakeLockSentinel = {
  release: jest.fn(() => Promise.resolve()),
  addEventListener: jest.fn(),
};

const mockWakeLock = {
  request: jest.fn(() => Promise.resolve(mockWakeLockSentinel)),
};

describe('Wake Lock Visibility Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Mock native Wake Lock API
    Object.defineProperty(navigator, 'wakeLock', {
      value: mockWakeLock,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    delete (navigator as any).wakeLock;
  });

  /**
   * Test component that uses useWakeLock hook
   */
  function TestComponent() {
    const { isWakeLockActive, requestWakeLock, releaseWakeLock } = useWakeLock();

    return (
      <div>
        <div data-testid="wake-lock-status">{isWakeLockActive ? 'active' : 'inactive'}</div>
        <button onClick={() => requestWakeLock()} data-testid="request-button">
          Request Wake Lock
        </button>
        <button onClick={() => releaseWakeLock()} data-testid="release-button">
          Release Wake Lock
        </button>
      </div>
    );
  }

  it('should re-request wake lock when tab becomes visible after being hidden', async () => {
    render(<TestComponent />);

    const requestButton = screen.getByTestId('request-button');
    const statusElement = screen.getByTestId('wake-lock-status');

    // Initial wake lock request
    await act(async () => {
      requestButton.click();
    });

    await waitFor(() => {
      expect(statusElement).toHaveTextContent('active');
      expect(mockWakeLock.request).toHaveBeenCalledTimes(1);
    });

    // Simulate tab becoming hidden (wake lock auto-released)
    const releaseCallback = mockWakeLockSentinel.addEventListener.mock.calls.find(
      (call) => call[0] === 'release'
    )?.[1];

    act(() => {
      if (releaseCallback) {
        releaseCallback();
      }
    });

    await waitFor(() => {
      expect(statusElement).toHaveTextContent('inactive');
    });

    // Simulate tab becoming visible again
    act(() => {
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        writable: true,
      });
      const event = new Event('visibilitychange');
      document.dispatchEvent(event);
    });

    // Wake lock should be re-requested
    await waitFor(
      () => {
        expect(mockWakeLock.request).toHaveBeenCalledTimes(2);
      },
      { timeout: 3000 }
    );
  });

  it('should not re-request wake lock if not previously active', async () => {
    render(<TestComponent />);

    const statusElement = screen.getByTestId('wake-lock-status');

    // Wake lock should be inactive initially
    expect(statusElement).toHaveTextContent('inactive');
    expect(mockWakeLock.request).not.toHaveBeenCalled();

    // Simulate tab visibility change without active wake lock
    act(() => {
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        writable: true,
      });
      const event = new Event('visibilitychange');
      document.dispatchEvent(event);
    });

    // Wake lock should not be requested
    expect(mockWakeLock.request).not.toHaveBeenCalled();
  });

  it('should handle multiple visibility changes correctly', async () => {
    render(<TestComponent />);

    const requestButton = screen.getByTestId('request-button');
    const statusElement = screen.getByTestId('wake-lock-status');

    // Initial wake lock request
    await act(async () => {
      requestButton.click();
    });

    await waitFor(() => {
      expect(statusElement).toHaveTextContent('active');
    });

    const initialRequestCount = mockWakeLock.request.mock.calls.length;

    // Simulate multiple visibility changes
    for (let i = 0; i < 3; i++) {
      act(() => {
        // Tab becomes hidden
        const releaseCallback = mockWakeLockSentinel.addEventListener.mock.calls.find(
          (call) => call[0] === 'release'
        )?.[1];

        if (releaseCallback) {
          releaseCallback();
        }

        // Tab becomes visible
        Object.defineProperty(document, 'visibilityState', {
          value: 'visible',
          writable: true,
        });
        const event = new Event('visibilitychange');
        document.dispatchEvent(event);
      });
    }

    // Wake lock should be re-requested for each visibility change
    await waitFor(
      () => {
        expect(mockWakeLock.request).toHaveBeenCalledTimes(initialRequestCount + 3);
      },
      { timeout: 3000 }
    );
  });

  it('should gracefully handle re-request failures', async () => {
    // Mock re-request failure
    mockWakeLock.request
      .mockResolvedValueOnce(mockWakeLockSentinel) // Initial request succeeds
      .mockRejectedValueOnce(new Error('Wake lock unavailable')); // Re-request fails

    const onError = jest.fn();
    function TestComponentWithError() {
      const { isWakeLockActive, requestWakeLock } = useWakeLock({ onError });

      return (
        <div>
          <div data-testid="wake-lock-status">{isWakeLockActive ? 'active' : 'inactive'}</div>
          <button onClick={() => requestWakeLock()} data-testid="request-button">
            Request Wake Lock
          </button>
        </div>
      );
    }

    render(<TestComponentWithError />);

    const requestButton = screen.getByTestId('request-button');

    // Initial wake lock request
    await act(async () => {
      requestButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('wake-lock-status')).toHaveTextContent('active');
    });

    // Simulate tab visibility change (will fail re-request)
    act(() => {
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        writable: true,
      });
      const event = new Event('visibilitychange');
      document.dispatchEvent(event);
    });

    // Wait for async operations
    await waitFor(
      () => {
        // The hook should have attempted re-request (logged warning but didn't block)
        expect(mockWakeLock.request).toHaveBeenCalledTimes(2);
      },
      { timeout: 3000 }
    );
  });

  it('should clean up visibility listener on unmount', async () => {
    const { unmount } = render(<TestComponent />);

    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });
});
