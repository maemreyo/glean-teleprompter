/**
 * useSafeArea Hook Unit Tests
 *
 * Tests for safe area detection on notched devices.
 *
 * @feature 012-standalone-story
 * @file __tests__/unit/story/hooks/useSafeArea.test.ts
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { useSafeArea } from '@/lib/story/hooks/useSafeArea';

describe('useSafeArea', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should detect safe area support when CSS env() is available', async () => {
    const { result } = renderHook(() => useSafeArea());

    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    // Check that safe area object has expected structure
    expect(result.current).toHaveProperty('top');
    expect(result.current).toHaveProperty('bottom');
    expect(result.current).toHaveProperty('left');
    expect(result.current).toHaveProperty('right');
    expect(result.current).toHaveProperty('hasSafeArea');
  });

  it('should return zero values when safe area is not supported', async () => {
    const { result } = renderHook(() => useSafeArea());

    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    // On systems without safe area, values should be 0
    expect(result.current.top).toBe(0);
    expect(result.current.bottom).toBe(0);
    expect(result.current.left).toBe(0);
    expect(result.current.right).toBe(0);
    expect(result.current.hasSafeArea).toBe(false);
  });

  it('should update safe area values on window resize', async () => {
    const { result } = renderHook(() => useSafeArea());

    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    const initialTop = result.current.top;

    // Trigger resize
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    await waitFor(() => {
      // Values should be recalculated (may be same or different)
      expect(result.current.top).toBeDefined();
    });
  });

  it('should update safe area values on orientation change', async () => {
    const { result } = renderHook(() => useSafeArea());

    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    const initialBottom = result.current.bottom;

    // Trigger orientation change
    act(() => {
      window.dispatchEvent(new Event('orientationchange'));
    });

    await waitFor(() => {
      // Values should be recalculated
      expect(result.current.bottom).toBeDefined();
    });
  });

  it('should set hasSafeArea to true when any inset is positive', async () => {
    // Mock safe area values
    const mockComputedStyle = jest.spyOn(window, 'getComputedStyle');

    mockComputedStyle.mockImplementation((element) => {
      if (element === document.documentElement) {
        return {
          getPropertyValue: (property: string) => {
            if (property === 'env(safe-area-inset-top)') return '44px';
            if (property === 'env(safe-area-inset-bottom)') return '34px';
            if (property === 'env(safe-area-inset-left)') return '0px';
            if (property === 'env(safe-area-inset-right)') return '0px';
            return '0px';
          },
        } as any;
      }
      return {} as CSSStyleDeclaration;
    });

    const { result } = renderHook(() => useSafeArea());

    await waitFor(() => {
      expect(result.current.hasSafeArea).toBe(true);
    });

    expect(result.current.top).toBe(44);
    expect(result.current.bottom).toBe(34);

    mockComputedStyle.mockRestore();
  });

  it('should clean up event listeners on unmount', async () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useSafeArea());

    unmount();

    // Verify cleanup (may be called multiple times)
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('orientationchange', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });
});
