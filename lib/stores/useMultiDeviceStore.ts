/**
 * Multi-Device Preview Store
 *
 * Zustand store for managing multi-device preview state and persistence.
 */

import { create } from 'zustand';
import {
  type MultiDevicePreviewStore,
  type MultiDevicePreviewPreferences,
  DEFAULT_MULTI_DEVICE_PREFERENCES,
} from '../story-builder/types';
import {
  loadMultiDevicePreferences,
  saveMultiDevicePreferences,
} from '../story-builder/multi-device/storage';
import { getAllDeviceIds } from '../story-builder/multi-device/deviceRegistry';

/**
 * Create the multi-device preview store with persistence.
 */
export const useMultiDeviceStore = create<MultiDevicePreviewStore>((set) => {
  // Load initial state from localStorage or use defaults
  const initialState = loadInitialState();

  return {
    // State
    ...initialState,

    // Actions
    setEnabled: (enabled) => {
      set((state) => {
        const updated = { ...state, enabled };
        persistState(updated);
        return updated;
      });
    },

    setGridConfig: (gridConfig) => {
      set((state) => {
        const updated = { ...state, gridConfig };
        persistState(updated);
        return updated;
      });
    },

    toggleDeviceType: (deviceTypeId) => {
      set((state) => {
        const isEnabled = state.enabledDeviceTypes.includes(deviceTypeId);
        const updated = {
          ...state,
          enabledDeviceTypes: isEnabled
            ? state.enabledDeviceTypes.filter((id) => id !== deviceTypeId)
            : [...state.enabledDeviceTypes, deviceTypeId],
        };
        persistState(updated);
        return updated;
      });
    },

    reorderDevices: (fromIndex, toIndex) => {
      set((state) => {
        const newOrder = [...state.deviceOrder];
        const [movedDevice] = newOrder.splice(fromIndex, 1);
        newOrder.splice(toIndex, 0, movedDevice);

        const updated = { ...state, deviceOrder: newOrder };
        persistState(updated);
        return updated;
      });
    },

    resetToDefaults: () => {
      set((state) => {
        const updated = {
          ...state,
          ...DEFAULT_MULTI_DEVICE_PREFERENCES,
        };
        persistState(updated);
        return updated;
      });
    },

    setDraggingState: (isDragging, draggedDeviceId) => {
      set((state) => ({
        ...state,
        isDragging,
        draggedDeviceId,
      }));
    },
  };
});

/**
 * Load initial state from localStorage.
 */
function loadInitialState(): MultiDevicePreviewStore {
  try {
    const loaded = loadMultiDevicePreferences();

    // Ensure all device IDs from registry are present in deviceOrder
    // (handles cases where new devices are added in future versions)
    const allDeviceIds = getAllDeviceIds();
    const deviceOrder = [
      ...loaded.deviceOrder,
      ...allDeviceIds.filter((id) => !loaded.deviceOrder.includes(id)),
    ];

    return {
      enabled: loaded.enabled,
      gridConfig: loaded.gridConfig,
      enabledDeviceTypes: loaded.enabledDeviceTypes,
      deviceOrder,
      isDragging: false,
      draggedDeviceId: null,
      // Actions will be added by the store creator
      setEnabled: () => {},
      setGridConfig: () => {},
      toggleDeviceType: () => {},
      reorderDevices: () => {},
      resetToDefaults: () => {},
      setDraggingState: () => {},
    };
  } catch (error) {
    console.error('[MultiDevice] Failed to load preferences, using defaults:', error);
    return {
      ...DEFAULT_MULTI_DEVICE_PREFERENCES,
      isDragging: false,
      draggedDeviceId: null,
      // Actions will be added by the store creator
      setEnabled: () => {},
      setGridConfig: () => {},
      toggleDeviceType: () => {},
      reorderDevices: () => {},
      resetToDefaults: () => {},
      setDraggingState: () => {},
    };
  }
}

/**
 * Persist state to localStorage.
 */
function persistState(state: MultiDevicePreviewStore): void {
  try {
    const preferences: MultiDevicePreviewPreferences = {
      enabled: state.enabled,
      gridConfig: state.gridConfig,
      enabledDeviceTypes: state.enabledDeviceTypes,
      deviceOrder: state.deviceOrder,
      lastUpdated: Date.now(),
    };

    saveMultiDevicePreferences(preferences);
  } catch (error) {
    console.error('[MultiDevice] Failed to save preferences:', error);
  }
}

/**
 * Selectors for common state queries.
 */
export const multiDeviceSelectors = {
  /** Check if multi-device mode is enabled */
  isEnabled: (state: MultiDevicePreviewStore) => state.enabled,

  /** Get current grid configuration */
  gridConfig: (state: MultiDevicePreviewStore) => state.gridConfig,

  /** Get enabled device types */
  enabledDeviceTypes: (state: MultiDevicePreviewStore) => state.enabledDeviceTypes,

  /** Get device order */
  deviceOrder: (state: MultiDevicePreviewStore) => state.deviceOrder,

  /** Check if currently dragging */
  isDragging: (state: MultiDevicePreviewStore) => state.isDragging,

  /** Get currently dragged device ID */
  draggedDeviceId: (state: MultiDevicePreviewStore) => state.draggedDeviceId,
};
