/**
 * Unit tests for localStorage utilities
 * @feature 015-multi-device-matrix
 */

import {
  loadMultiDevicePreferences,
  saveMultiDevicePreferences,
  clearMultiDevicePreferences,
  migratePreferences,
  exportPreferences,
  importPreferences,
  StorageError,
} from '@/lib/story-builder/multi-device/storage';
import type { MultiDevicePreviewPreferences } from '@/lib/story-builder/types';

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

describe('localStorage utilities', () => {
  const mockPreferences: MultiDevicePreviewPreferences = {
    enabled: true,
    gridConfig: '2x2',
    enabledDeviceTypes: ['iphone-se', 'iphone-14-pro', 'ipad-air'],
    deviceOrder: ['iphone-se', 'iphone-14-pro', 'ipad-air', 'desktop'],
    lastUpdated: Date.now(),
  };

  beforeEach(() => {
    localStorage.clear();
  });

  describe('loadMultiDevicePreferences', () => {
    it('should return default preferences when localStorage is empty', () => {
      const preferences = loadMultiDevicePreferences();

      expect(preferences).toHaveProperty('enabled');
      expect(preferences).toHaveProperty('gridConfig');
      expect(preferences).toHaveProperty('enabledDeviceTypes');
      expect(preferences).toHaveProperty('deviceOrder');
      expect(preferences).toHaveProperty('lastUpdated');
    });

    it('should load valid preferences from localStorage', () => {
      localStorage.setItem('teleprompter-multi-device-preview', JSON.stringify(mockPreferences));

      const preferences = loadMultiDevicePreferences();

      expect(preferences.enabled).toBe(true);
      expect(preferences.gridConfig).toBe('2x2');
      expect(preferences.enabledDeviceTypes).toEqual(['iphone-se', 'iphone-14-pro', 'ipad-air']);
    });

    it('should return defaults for corrupted data', () => {
      localStorage.setItem('teleprompter-multi-device-preview', 'invalid-json');

      const preferences = loadMultiDevicePreferences();

      expect(preferences).toHaveProperty('enabled');
      expect(preferences).toHaveProperty('gridConfig');
    });

    it('should return defaults for invalid structure', () => {
      localStorage.setItem('teleprompter-multi-device-preview', JSON.stringify({ invalid: 'data' }));

      const preferences = loadMultiDevicePreferences();

      expect(preferences).toHaveProperty('enabled');
      expect(preferences).toHaveProperty('gridConfig');
    });

    it('should throw StorageError on critical failure', () => {
      // Mock JSON.parse to throw
      const originalParse = JSON.parse;
      JSON.parse = jest.fn(() => {
        throw new Error('Critical error');
      });

      expect(() => loadMultiDevicePreferences()).toThrow(StorageError);

      JSON.parse = originalParse;
    });
  });

  describe('saveMultiDevicePreferences', () => {
    it('should save preferences to localStorage', () => {
      saveMultiDevicePreferences(mockPreferences);

      const saved = localStorage.getItem('teleprompter-multi-device-preview');
      expect(saved).toBeDefined();

      const parsed = JSON.parse(saved!) as MultiDevicePreviewPreferences;
      expect(parsed.enabled).toBe(true);
      expect(parsed.gridConfig).toBe('2x2');
    });

    it('should throw StorageError when localStorage is unavailable', () => {
      // Mock localStorage to throw
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage unavailable');
      });

      expect(() => saveMultiDevicePreferences(mockPreferences)).toThrow(StorageError);

      localStorage.setItem = originalSetItem;
    });

    it('should throw StorageError on quota exceeded', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        const error = new Error('Quota exceeded');
        (error as any).name = 'QuotaExceededError';
        throw error;
      });

      expect(() => saveMultiDevicePreferences(mockPreferences)).toThrow(StorageError);

      localStorage.setItem = originalSetItem;
    });
  });

  describe('clearMultiDevicePreferences', () => {
    it('should remove preferences from localStorage', () => {
      localStorage.setItem('teleprompter-multi-device-preview', JSON.stringify(mockPreferences));

      clearMultiDevicePreferences();

      const saved = localStorage.getItem('teleprompter-multi-device-preview');
      expect(saved).toBeNull();
    });

    it('should throw StorageError when localStorage is unavailable', () => {
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = jest.fn(() => {
        throw new Error('Storage unavailable');
      });

      expect(() => clearMultiDevicePreferences()).toThrow(StorageError);

      localStorage.removeItem = originalRemoveItem;
    });
  });

  describe('migratePreferences', () => {
    it('should update lastUpdated timestamp', () => {
      const oldPreferences: MultiDevicePreviewPreferences = {
        ...mockPreferences,
        lastUpdated: 1000000,
      };

      const migrated = migratePreferences(oldPreferences, 1);

      expect(migrated.lastUpdated).toBeGreaterThan(oldPreferences.lastUpdated);
    });

    it('should preserve other properties', () => {
      const migrated = migratePreferences(mockPreferences, 1);

      expect(migrated.enabled).toBe(mockPreferences.enabled);
      expect(migrated.gridConfig).toBe(mockPreferences.gridConfig);
      expect(migrated.enabledDeviceTypes).toEqual(mockPreferences.enabledDeviceTypes);
      expect(migrated.deviceOrder).toEqual(mockPreferences.deviceOrder);
    });
  });

  describe('exportPreferences', () => {
    it('should export preferences as JSON string', () => {
      const exported = exportPreferences(mockPreferences);

      expect(typeof exported).toBe('string');

      const parsed = JSON.parse(exported) as MultiDevicePreviewPreferences;
      expect(parsed.enabled).toBe(true);
      expect(parsed.gridConfig).toBe('2x2');
    });

    it('should produce formatted JSON with indentation', () => {
      const exported = exportPreferences(mockPreferences);

      expect(exported).toContain('\n');
      expect(exported).toContain('  ');
    });
  });

  describe('importPreferences', () => {
    it('should import valid JSON string', () => {
      const json = JSON.stringify(mockPreferences);

      const imported = importPreferences(json);

      expect(imported.enabled).toBe(true);
      expect(imported.gridConfig).toBe('2x2');
    });

    it('should throw StorageError for invalid JSON', () => {
      expect(() => importPreferences('invalid-json')).toThrow(StorageError);
    });

    it('should throw StorageError for invalid structure', () => {
      const invalidJson = JSON.stringify({ invalid: 'data' });

      expect(() => importPreferences(invalidJson)).toThrow(StorageError);
    });
  });
});
