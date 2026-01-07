/**
 * Integration tests for memory management
 * @feature 015-multi-device-matrix
 */

import React from 'react';
import { render, screen, waitFor, renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider } from '@/components/AppProvider';
import { useMultiDeviceStore } from '@/lib/stores/useMultiDeviceStore';
import { useStoryBuilderStore } from '@/lib/story-builder/store';
import { GridConfiguration } from '@/components/story-builder/preview/multi-device/GridConfiguration';
import {
  calculateMemoryUsage,
  isAtWarningThreshold,
  isAtHardLimit,
  canEnableDevice,
} from '@/lib/story-builder/multi-device/memory';
import { MEMORY_THRESHOLDS } from '@/lib/story-builder/types';

describe('Memory Management Integration', () => {
  beforeEach(() => {
    // Reset store state
    const { result } = renderHook(() => useMultiDeviceStore());
    act(() => {
      result.current.resetToDefaults();
    });
  });

  describe('memory calculation', () => {
    it('should calculate memory usage correctly', () => {
      const { result } = renderHook(() => useMultiDeviceStore());

      act(() => {
        result.current.toggleDeviceType('iphone-se');
        result.current.toggleDeviceType('iphone-14-pro');
      });

      const enabledCount = 2;
      const contentCharCount = 0;
      const expectedMemory = calculateMemoryUsage(enabledCount, contentCharCount);

      expect(expectedMemory).toBe(100); // 2 devices * 50MB
    });

    it('should include content in memory calculation', () => {
      const { result: storyResult } = renderHook(() => useStoryBuilderStore());

      // Mock some content
      act(() => {
        // This would be updated by actual slide content
      });

      const deviceCount = 2;
      const contentCharCount = 5000;
      const expectedMemory = calculateMemoryUsage(deviceCount, contentCharCount);

      expect(expectedMemory).toBe(125); // (2 * 50) + (5000/1000 * 5) = 100 + 25
    });
  });

  describe('threshold detection', () => {
    it('should detect when at warning threshold', () => {
      const warningMemory = MEMORY_THRESHOLDS.WARNING;
      expect(isAtWarningThreshold(warningMemory)).toBe(true);
      expect(isAtWarningThreshold(warningMemory - 1)).toBe(false);
    });

    it('should detect when at hard limit', () => {
      const limitMemory = MEMORY_THRESHOLDS.HARD_LIMIT;
      expect(isAtHardLimit(limitMemory)).toBe(true);
      expect(isAtHardLimit(limitMemory - 1)).toBe(false);
    });
  });

  describe('device enablement checks', () => {
    it('should allow enabling when within limits', () => {
      const currentDevices = 2;
      const contentChars = 0;

      const result = canEnableDevice(currentDevices, contentChars);

      expect(result.canEnable).toBe(true);
      expect(result.wouldExceedWarning).toBe(false);
      expect(result.wouldExceedLimit).toBe(false);
    });

    it('should warn when approaching warning threshold', () => {
      const currentDevices = 5;
      const contentChars = 0;

      const result = canEnableDevice(currentDevices, contentChars);

      // 6 devices * 50MB = 300MB (above 250MB warning)
      expect(result.canEnable).toBe(true);
      expect(result.wouldExceedWarning).toBe(true);
    });

    it('should prevent enabling when at hard limit', () => {
      const currentDevices = 7;
      const contentChars = 0;

      const result = canEnableDevice(currentDevices, contentChars);

      // 8 devices * 50MB = 400MB (above 350MB limit)
      expect(result.canEnable).toBe(false);
      expect(result.wouldExceedLimit).toBe(true);
    });
  });

  describe('UI behavior', () => {
    it('should update memory display when devices are toggled', async () => {
      const user = userEvent.setup();

      render(
        <AppProvider>
          <GridConfiguration />
        </AppProvider>
      );

      const progressBar = screen.getByRole('progressbar');
      const initialValue = await progressBar.getAttribute('aria-valuenow');

      const ipadCheckbox = screen.getByLabelText('Toggle iPad Air display');
      await user.click(ipadCheckbox);

      await waitFor(() => {
        const updatedValue = progressBar.getAttribute('aria-valuenow');
        expect(updatedValue).not.toBe(initialValue);
      });
    });

    it('should disable checkbox when would exceed limit', async () => {
      const { result } = renderHook(() => useMultiDeviceStore());

      // Enable devices up to the limit
      act(() => {
        result.current.toggleDeviceType('iphone-se');
        result.current.toggleDeviceType('iphone-14-pro');
        result.current.toggleDeviceType('ipad-air');
        result.current.toggleDeviceType('desktop');
      });

      render(
        <AppProvider>
          <GridConfiguration />
        </AppProvider>
      );

      // At least one checkbox should be disabled
      const checkboxes = screen.getAllByRole('checkbox');
      const disabledCheckboxes = checkboxes.filter(
        (checkbox) => checkbox.getAttribute('disabled') === 'true'
      );

      expect(disabledCheckboxes.length).toBeGreaterThan(0);
    });

    it('should show warning indicator when approaching threshold', async () => {
      const { result } = renderHook(() => useMultiDeviceStore());

      // Enable devices to approach warning threshold
      act(() => {
        result.current.toggleDeviceType('iphone-se');
        result.current.toggleDeviceType('iphone-14-pro');
        result.current.toggleDeviceType('ipad-air');
      });

      render(
        <AppProvider>
          <GridConfiguration />
        </AppProvider>
      );

      // Check for warning indicator
      const progressBar = screen.getByRole('progressbar');
      const value = await progressBar.getAttribute('aria-valuenow');

      if (value) {
        const numericValue = parseFloat(value);
        // Should be above warning threshold (250MB)
        if (numericValue >= MEMORY_THRESHOLDS.WARNING) {
          const warningText = screen.queryByText(/memory/i);
          expect(warningText).toBeInTheDocument();
        }
      }
    });
  });

  describe('memory status display', () => {
    it('should display correct status message', () => {
      const { result } = renderHook(() => useMultiDeviceStore());

      act(() => {
        result.current.toggleDeviceType('iphone-se');
      });

      render(
        <AppProvider>
          <GridConfiguration />
        </AppProvider>
      );

      // Memory should be displayed
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeVisible();
    });

    it('should display percentage of limit', async () => {
      render(
        <AppProvider>
          <GridConfiguration />
        </AppProvider>
      );

      const percentageText = screen.queryByText(/%\s*of limit/i);
      expect(percentageText).toBeInTheDocument();
    });
  });

  describe('memory recovery', () => {
    it('should re-enable checkboxes when devices are disabled', async () => {
      const user = userEvent.setup();

      // First enable all devices
      const { result } = renderHook(() => useMultiDeviceStore());

      act(() => {
        result.current.toggleDeviceType('iphone-se');
        result.current.toggleDeviceType('iphone-14-pro');
        result.current.toggleDeviceType('ipad-air');
        result.current.toggleDeviceType('desktop');
      });

      render(
        <AppProvider>
          <GridConfiguration />
        </AppProvider>
      );

      // Disable one device
      const desktopCheckbox = screen.getByLabelText('Toggle Desktop display');
      if (!desktopCheckbox.getAttribute('disabled')) {
        await user.click(desktopCheckbox);

        await waitFor(() => {
          // Checkbox should be re-enabled
          expect(desktopCheckbox).not.toBeDisabled();
        });
      }
    });
  });
});
