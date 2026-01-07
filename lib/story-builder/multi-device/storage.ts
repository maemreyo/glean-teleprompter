/**
 * localStorage Utilities for Multi-Device Preview
 *
 * Handles persistence of multi-device preview preferences.
 */

import type {
  MultiDevicePreviewPreferences,
} from '../types';
import {
  MULTI_DEVICE_STORAGE_KEY,
  DEFAULT_MULTI_DEVICE_PREFERENCES,
} from '../types';

/**
 * Error thrown when localStorage is unavailable or quota exceeded.
 */
export class StorageError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Check if localStorage is available.
 */
function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Load multi-device preview preferences from localStorage.
 *
 * @returns Parsed preferences or defaults if unavailable
 * @throws StorageError if data is corrupted
 */
export function loadMultiDevicePreferences(): MultiDevicePreviewPreferences {
  if (!isStorageAvailable()) {
    return { ...DEFAULT_MULTI_DEVICE_PREFERENCES };
  }

  try {
    const serialized = localStorage.getItem(MULTI_DEVICE_STORAGE_KEY);

    if (!serialized) {
      return { ...DEFAULT_MULTI_DEVICE_PREFERENCES };
    }

    const parsed = JSON.parse(serialized) as unknown;

    // Validate the parsed data structure
    if (!isValidPreferences(parsed)) {
      console.warn('[MultiDevice] Invalid preferences in localStorage, using defaults');
      return { ...DEFAULT_MULTI_DEVICE_PREFERENCES };
    }

    return parsed as MultiDevicePreviewPreferences;
  } catch (error) {
    throw new StorageError('Failed to load multi-device preferences', error);
  }
}

/**
 * Save multi-device preview preferences to localStorage.
 *
 * @param preferences - Preferences to save
 * @throws StorageError if localStorage is unavailable or quota exceeded
 */
export function saveMultiDevicePreferences(
  preferences: MultiDevicePreviewPreferences
): void {
  if (!isStorageAvailable()) {
    throw new StorageError('localStorage is not available');
  }

  try {
    const serialized = JSON.stringify(preferences);
    localStorage.setItem(MULTI_DEVICE_STORAGE_KEY, serialized);
  } catch (error) {
    // Handle QuotaExceededError
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new StorageError('localStorage quota exceeded', error);
    }
    throw new StorageError('Failed to save multi-device preferences', error);
  }
}

/**
 * Clear multi-device preview preferences from localStorage.
 *
 * @throws StorageError if localStorage is unavailable
 */
export function clearMultiDevicePreferences(): void {
  if (!isStorageAvailable()) {
    throw new StorageError('localStorage is not available');
  }

  try {
    localStorage.removeItem(MULTI_DEVICE_STORAGE_KEY);
  } catch (error) {
    throw new StorageError('Failed to clear multi-device preferences', error);
  }
}

/**
 * Type guard to validate preferences structure.
 */
function isValidPreferences(data: unknown): boolean {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const prefs = data as Record<string, unknown>;

  return (
    typeof prefs.enabled === 'boolean' &&
    typeof prefs.gridConfig === 'string' &&
    Array.isArray(prefs.enabledDeviceTypes) &&
    Array.isArray(prefs.deviceOrder) &&
    typeof prefs.lastUpdated === 'number'
  );
}

/**
 * Migration handler for future schema updates.
 *
 * @param preferences - Preferences to migrate
 * @param version - Target version number
 * @returns Migrated preferences
 */
export function migratePreferences(
  preferences: MultiDevicePreviewPreferences,
  version: number
): MultiDevicePreviewPreferences {
  // Current version is 1, no migrations needed yet
  // Future migrations will be handled here
  return {
    ...preferences,
    lastUpdated: Date.now(),
  };
}

/**
 * Export preferences as JSON string for backup/sharing.
 *
 * @param preferences - Preferences to export
 * @returns JSON string representation
 */
export function exportPreferences(preferences: MultiDevicePreviewPreferences): string {
  return JSON.stringify(preferences, null, 2);
}

/**
 * Import preferences from JSON string.
 *
 * @param serialized - JSON string to import
 * @returns Imported preferences
 * @throws StorageError if JSON is invalid
 */
export function importPreferences(serialized: string): MultiDevicePreviewPreferences {
  try {
    const parsed = JSON.parse(serialized) as unknown;

    if (!isValidPreferences(parsed)) {
      throw new Error('Invalid preferences format');
    }

    return parsed as MultiDevicePreviewPreferences;
  } catch (error) {
    throw new StorageError('Failed to import preferences', error);
  }
}
