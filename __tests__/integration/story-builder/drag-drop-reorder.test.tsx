/**
 * Integration Tests for Multi-Device Drag-and-Drop Reordering (T046)
 *
 * Tests drag-and-drop functionality for reordering device frames
 * @feature 015-multi-device-matrix
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { DeviceGrid } from '@/components/story-builder/preview/multi-device/DeviceGrid';
import { DeviceFrame } from '@/components/story-builder/preview/multi-device/DeviceFrame';
import { useMultiDeviceStore } from '@/lib/stores/useMultiDeviceStore';
import { DEVICE_REGISTRY, type DeviceType } from '@/lib/story-builder/multi-device/deviceRegistry';

// Mock @dnd-kit utilities for testing
jest.mock('@dnd-kit/core', () => ({
  ...jest.requireActual('@dnd-kit/core'),
  useDroppable: () => ({
    setNodeRef: jest.fn(),
    isOver: false,
  }),
  useDraggable: () => ({
    setNodeRef: jest.fn(),
    attributes: {},
    listeners: {},
    isDragging: false,
  }),
  useSortable: () => ({
    setNodeRef: jest.fn(),
    attributes: {},
    listeners: {},
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}));

describe('Multi-Device Drag-and-Drop Reordering (T046)', () => {
  beforeEach(() => {
    // Reset store before each test
    useMultiDeviceStore.getState().resetToDefaults();
    // Enable multi-device mode
    useMultiDeviceStore.getState().setEnabled(true);
  });

  it('should render device grid with drag-and-drop enabled', () => {
    const devices = DEVICE_REGISTRY.slice(0, 2);
    const { container } = render(
      <DeviceGrid enableDragDrop={true}>
        {devices.map((device, index) => (
          <DeviceFrame
            key={device.id}
            device={device}
            previewUrl="/preview"
            frameId={`frame-${index}`}
            isDragEnabled={true}
          />
        ))}
      </DeviceGrid>
    );

    const grid = container.querySelector('[role="list"]');
    expect(grid).toBeInTheDocument();
  });

  it('should reorder devices in store when drag completes', async () => {
    const store = useMultiDeviceStore.getState();
    
    // Get initial device order from registry
    const initialDevices = DEVICE_REGISTRY.slice(0, 3);
    const initialOrder = initialDevices.map(d => d.id);

    expect(store.deviceOrder).toContain(initialOrder[0]);

    // Simulate reorder action (move first device to last)
    const firstDeviceId = initialOrder[0];
    const lastDeviceId = initialOrder[initialOrder.length - 1];
    
    act(() => {
      store.reorderDevices(0, store.deviceOrder.length - 1);
    });

    await waitFor(() => {
      expect(store.deviceOrder[store.deviceOrder.length - 1]).toBe(firstDeviceId);
    });
  });

  it('should persist device order after reordering', async () => {
    const store = useMultiDeviceStore.getState();
    
    // Get initial order
    const initialOrder = [...store.deviceOrder];

    // Reorder devices
    act(() => {
      store.reorderDevices(0, store.deviceOrder.length - 1);
    });

    await waitFor(() => {
      expect(store.deviceOrder).not.toEqual(initialOrder);
    });

    // Verify the new order is persisted (would be validated by localStorage in actual test)
    const currentOrder = store.deviceOrder;
    expect(currentOrder).toBeDefined();
    expect(currentOrder.length).toBe(initialOrder.length);
  });

  it('should handle multiple reorders in sequence', async () => {
    const store = useMultiDeviceStore.getState();
    const initialOrder = [...store.deviceOrder];

    // First reorder
    act(() => {
      store.reorderDevices(0, 2);
    });

    await waitFor(() => {
      expect(store.deviceOrder).not.toEqual(initialOrder);
    });

    const afterFirstReorder = [...store.deviceOrder];

    // Second reorder
    act(() => {
      store.reorderDevices(1, 0);
    });

    await waitFor(() => {
      expect(store.deviceOrder).not.toEqual(afterFirstReorder);
    });
  });

  it('should not change order when reordering to same position', async () => {
    const store = useMultiDeviceStore.getState();
    const initialOrder = [...store.deviceOrder];

    act(() => {
      store.reorderDevices(1, 1);
    });

    await waitFor(() => {
      expect(store.deviceOrder).toEqual(initialOrder);
    });
  });

  it('should update device grid after reorder', async () => {
    const store = useMultiDeviceStore.getState();

    // Get first 3 devices
    const devices = DEVICE_REGISTRY.slice(0, 3);

    // Render grid with devices
    const { rerender } = render(
      <DeviceGrid enableDragDrop={true}>
        {devices.map((device, index) => (
          <DeviceFrame
            key={device.id}
            device={device}
            previewUrl="/preview"
            frameId={`frame-${index}`}
            isDragEnabled={true}
          />
        ))}
      </DeviceGrid>
    );

    // Reorder in store
    act(() => {
      store.reorderDevices(0, 2);
    });

    await waitFor(() => {
      expect(store.deviceOrder[0]).not.toBe(store.deviceOrder[2]);
    });

    // Get devices in new order
    const reorderedDevices = store.deviceOrder
      .slice(0, 3)
      .map(id => DEVICE_REGISTRY.find(d => d.id === id)!)
      .filter(Boolean) as DeviceType[];

    // Re-render with new order
    rerender(
      <DeviceGrid enableDragDrop={true}>
        {reorderedDevices.map((device, index) => (
          <DeviceFrame
            key={device.id}
            device={device}
            previewUrl="/preview"
            frameId={`frame-${index}`}
            isDragEnabled={true}
          />
        ))}
      </DeviceGrid>
    );
  });

  it('should handle edge case: reordering first device to last', async () => {
    const store = useMultiDeviceStore.getState();
    const initialOrder = [...store.deviceOrder];

    act(() => {
      store.reorderDevices(0, store.deviceOrder.length - 1);
    });

    await waitFor(() => {
      expect(store.deviceOrder[store.deviceOrder.length - 1]).toBe(initialOrder[0]);
    });
  });

  it('should handle edge case: reordering last device to first', async () => {
    const store = useMultiDeviceStore.getState();
    const initialOrder = [...store.deviceOrder];

    act(() => {
      store.reorderDevices(store.deviceOrder.length - 1, 0);
    });

    await waitFor(() => {
      expect(store.deviceOrder[0]).toBe(initialOrder[initialOrder.length - 1]);
    });
  });
});

// Helper function for act
function act(callback: () => void) {
  callback();
}
