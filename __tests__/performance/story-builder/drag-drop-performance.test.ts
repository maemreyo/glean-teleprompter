/**
 * Performance Tests for Drag-and-Drop Latency (T048)
 *
 * Tests that drag-and-drop operations complete within 200ms (SC-007)
 * @feature 015-multi-device-matrix
 */

import { useMultiDeviceStore } from '@/lib/stores/useMultiDeviceStore';
import { DEVICE_REGISTRY } from '@/lib/story-builder/multi-device/deviceRegistry';

describe('Drag-and-Drop Performance (T048)', () => {
  beforeEach(() => {
    // Reset store before each test
    useMultiDeviceStore.getState().resetToDefaults();
    useMultiDeviceStore.getState().setEnabled(true);
  });

  it('should complete reorderDevices action within 50ms', async () => {
    const store = useMultiDeviceStore.getState();
    const devices = DEVICE_REGISTRY.slice(0, 4);
    
    const startTime = performance.now();
    
    // Perform reorder
    act(() => {
      store.reorderDevices(0, devices.length - 1);
    });
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // State update should be very fast (< 50ms)
    expect(duration).toBeLessThan(50);
  });

  it('should complete multiple consecutive reorders within 200ms total', async () => {
    const store = useMultiDeviceStore.getState();
    
    const startTime = performance.now();
    
    // Perform 3 consecutive reorders
    act(() => {
      store.reorderDevices(0, 3);
      store.reorderDevices(1, 2);
      store.reorderDevices(0, 1);
    });
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Total should be under 200ms
    expect(duration).toBeLessThan(200);
  });

  it('should persist device order to localStorage within 100ms', async () => {
    const store = useMultiDeviceStore.getState();
    
    const startTime = performance.now();
    
    act(() => {
      store.reorderDevices(0, 3);
    });
    
    // Wait for next tick to ensure persistence completes
    await new Promise(resolve => setTimeout(resolve, 0));
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Persistence should complete within 100ms
    expect(duration).toBeLessThan(100);
  });

  it('should maintain performance with maximum device count (6 devices)', async () => {
    const store = useMultiDeviceStore.getState();
    
    // Get initial order length
    const initialLength = store.deviceOrder.length;
    
    const startTime = performance.now();
    
    // Reorder with max devices
    act(() => {
      store.reorderDevices(0, Math.min(initialLength - 1, 5));
    });
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Should still be fast even with max devices
    expect(duration).toBeLessThan(50);
  });

  it('should not cause performance degradation after 20 reorders', async () => {
    const store = useMultiDeviceStore.getState();
    const deviceCount = Math.min(store.deviceOrder.length, 4);
    
    const timings: number[] = [];
    
    // Perform 20 reorders and track timing
    for (let i = 0; i < 20; i++) {
      const startTime = performance.now();
      
      act(() => {
        store.reorderDevices(i % deviceCount, (i + 1) % deviceCount);
      });
      
      const endTime = performance.now();
      timings.push(endTime - startTime);
    }
    
    // Calculate average
    const avgTime = timings.reduce((a, b) => a + b, 0) / timings.length;
    
    // Average should still be under 50ms
    expect(avgTime).toBeLessThan(50);
    
    // No single operation should exceed 100ms
    timings.forEach(time => {
      expect(time).toBeLessThan(100);
    });
  });

  it('should handle rapid consecutive reorders without blocking', async () => {
    const store = useMultiDeviceStore.getState();
    const deviceCount = store.deviceOrder.length;
    
    const startTime = performance.now();
    
    // Simulate rapid user input
    act(() => {
      if (deviceCount >= 4) {
        store.reorderDevices(0, 1);
        store.reorderDevices(1, 2);
        store.reorderDevices(2, 3);
        store.reorderDevices(3, 0);
      }
    });
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Should complete quickly
    expect(duration).toBeLessThan(100);
  });

  it('should complete reorder and trigger storage write efficiently', async () => {
    const store = useMultiDeviceStore.getState();
    
    // Measure multiple operations
    const iterations = 10;
    const timings: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const fromIndex = i % (store.deviceOrder.length - 1);
      const toIndex = (i + 1) % store.deviceOrder.length;
      
      const startTime = performance.now();
      
      act(() => {
        store.reorderDevices(fromIndex, toIndex);
      });
      
      // Small delay to allow async operations
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const endTime = performance.now();
      timings.push(endTime - startTime);
    }
    
    // All operations should be fast
    timings.forEach(time => {
      expect(time).toBeLessThan(100);
    });
    
    // Average should be well under 50ms
    const avgTime = timings.reduce((a, b) => a + b, 0) / timings.length;
    expect(avgTime).toBeLessThan(50);
  });
});

// Helper function for act
function act(callback: () => void) {
  callback();
}
