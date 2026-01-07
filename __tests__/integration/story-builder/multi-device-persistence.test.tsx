/**
 * Integration tests for localStorage persistence
 * @feature 015-multi-device-matrix
 */

import React from 'react';
import { render, screen, waitFor, renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider } from '@/components/AppProvider';
import { useMultiDeviceStore } from '@/lib/stores/useMultiDeviceStore';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Multi-Device localStorage Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('preferences persistence', () => {
    it('should save preferences to localStorage', async () => {
      const { result } = renderHook(() => useMultiDeviceStore());

      act(() => {
        result.current.setEnabled(true);
        result.current.setGridConfig('2x2');
      });

      await waitFor(() => {
        const saved = localStorage.getItem('teleprompter-multi-device-preview');
        expect(saved).toBeDefined();

        const parsed = JSON.parse(saved!);
        expect(parsed.enabled).toBe(true);
        expect(parsed.gridConfig).toBe('2x2');
      });
    });

    it('should load preferences from localStorage on initialization', async () => {
      const savedState = {
        enabled: true,
        gridConfig: '3x2',
        enabledDeviceTypes: ['iphone-se', 'ipad-air'],
        deviceOrder: ['ipad-air', 'iphone-se', 'iphone-14-pro', 'desktop'],
        lastUpdated: Date.now(),
      };

      localStorage.setItem('teleprompter-multi-device-preview', JSON.stringify(savedState));

      const { result } = renderHook(() => useMultiDeviceStore());

      await waitFor(() => {
        expect(result.current.enabled).toBe(true);
        expect(result.current.gridConfig).toBe('3x2');
        expect(result.current.enabledDeviceTypes).toEqual(['iphone-se', 'ipad-air']);
      });
    });

    it('should persist device type selections', async () => {
      const { result } = renderHook(() => useMultiDeviceStore());

      act(() => {
        result.current.toggleDeviceType('ipad-air');
        result.current.toggleDeviceType('desktop');
      });

      await waitFor(() => {
        const saved = localStorage.getItem('teleprompter-multi-device-preview');
        const parsed = JSON.parse(saved!);

        expect(parsed.enabledDeviceTypes).toContain('ipad-air');
        expect(parsed.enabledDeviceTypes).toContain('desktop');
      });
    });

    it('should persist device order changes', async () => {
      const { result } = renderHook(() => useMultiDeviceStore());

      act(() => {
        result.current.reorderDevices(0, 2);
      });

      await waitFor(() => {
        const saved = localStorage.getItem('teleprompter-multi-device-preview');
        const parsed = JSON.parse(saved!);

        expect(parsed.deviceOrder[0]).toBe(result.current.deviceOrder[1]);
      });
    });
  });

  describe('reset to defaults', () => {
    it('should reset to defaults and persist', async () => {
      const { result } = renderHook(() => useMultiDeviceStore());

      // Make changes
      act(() => {
        result.current.setEnabled(true);
        result.current.setGridConfig('2x2');
      });

      // Reset
      act(() => {
        result.current.resetToDefaults();
      });

      await waitFor(() => {
        const saved = localStorage.getItem('teleprompter-multi-device-preview');
        const parsed = JSON.parse(saved!);

        expect(parsed.enabled).toBe(false);
        expect(parsed.gridConfig).toBe('2x');
      });
    });
  });

  describe('migration handling', () => {
    it('should add new devices to deviceOrder if missing', async () => {
      const oldState = {
        enabled: true,
        gridConfig: '2x',
        enabledDeviceTypes: ['iphone-se'],
        deviceOrder: ['iphone-se'], // Missing new devices
        lastUpdated: Date.now(),
      };

      localStorage.setItem('teleprompter-multi-device-preview', JSON.stringify(oldState));

      const { result } = renderHook(() => useMultiDeviceStore());

      await waitFor(() => {
        // Should include all devices from registry
        expect(result.current.deviceOrder).toContain('iphone-14-pro');
        expect(result.current.deviceOrder).toContain('ipad-air');
        expect(result.current.deviceOrder).toContain('desktop');
      });
    });
  });

  describe('error handling', () => {
    it('should handle corrupted localStorage data gracefully', async () => {
      localStorage.setItem('teleprompter-multi-device-preview', 'invalid-json');

      const { result } = renderHook(() => useMultiDeviceStore());

      await waitFor(() => {
        // Should fall back to defaults
        expect(result.current.enabled).toBe(false);
        expect(result.current.gridConfig).toBe('2x');
      });
    });

    it('should handle localStorage quota exceeded gracefully', async () => {
      const { result } = renderHook(() => useMultiDeviceStore());

      // Mock quota exceeded error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        const error = new Error('Quota exceeded');
        (error as any).name = 'QuotaExceededError';
        throw error;
      });

      act(() => {
        result.current.setEnabled(true);
      });

      // Should not throw, just log error
      expect(result.current.enabled).toBe(true);

      localStorage.setItem = originalSetItem;
    });
  });

  describe('lastUpdated timestamp', () => {
    it('should update lastUpdated timestamp on save', async () => {
      const { result } = renderHook(() => useMultiDeviceStore());

      const beforeTimestamp = Date.now();

      act(() => {
        result.current.setEnabled(true);
      });

      await waitFor(() => {
        const saved = localStorage.getItem('teleprompter-multi-device-preview');
        const parsed = JSON.parse(saved!);

        expect(parsed.lastUpdated).toBeGreaterThanOrEqual(beforeTimestamp);
      });
    });
  });
});
