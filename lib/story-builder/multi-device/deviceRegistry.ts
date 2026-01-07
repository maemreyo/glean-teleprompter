/**
 * Device Registry
 *
 * Defines available device types for multi-device preview.
 * Each device has specific dimensions, scale factor, and category.
 */

export type DeviceCategory = 'mobile' | 'tablet' | 'desktop';

export interface DeviceType {
  /** Unique identifier for the device */
  id: string;
  /** Human-readable device name */
  name: string;
  /** Device viewport width in pixels */
  width: number;
  /** Device viewport height in pixels */
  height: number;
  /** Scale factor for display (default 1.0) */
  scale: number;
  /** Device category for grouping */
  category: DeviceCategory;
}

/**
 * Registry of available device types for multi-device preview.
 *
 * Devices are ordered by priority for display in the grid.
 * Desktop is scaled to 0.5x to prevent overwhelming the grid layout.
 */
export const DEVICE_REGISTRY: readonly DeviceType[] = [
  {
    id: 'iphone-se',
    name: 'iPhone SE',
    width: 375,
    height: 667,
    scale: 1.0,
    category: 'mobile',
  },
  {
    id: 'iphone-14-pro',
    name: 'iPhone 14 Pro',
    width: 393,
    height: 852,
    scale: 1.0,
    category: 'mobile',
  },
  {
    id: 'ipad-air',
    name: 'iPad Air',
    width: 820,
    height: 1180,
    scale: 1.0,
    category: 'tablet',
  },
  {
    id: 'desktop',
    name: 'Desktop',
    width: 1920,
    height: 1080,
    scale: 0.5,
    category: 'desktop',
  },
] as const;

/**
 * Get a device type by ID
 */
export function getDeviceById(id: string): DeviceType | undefined {
  return DEVICE_REGISTRY.find((device) => device.id === id);
}

/**
 * Get all device IDs
 */
export function getAllDeviceIds(): string[] {
  return DEVICE_REGISTRY.map((device) => device.id);
}

/**
 * Get devices by category
 */
export function getDevicesByCategory(category: DeviceCategory): DeviceType[] {
  return DEVICE_REGISTRY.filter((device) => device.category === category);
}

/**
 * Calculate the actual display size for a device frame
 * (accounting for scale factor)
 */
export function getDeviceDisplaySize(device: DeviceType): {
  width: number;
  height: number;
} {
  return {
    width: device.width * device.scale,
    height: device.height * device.scale,
  };
}
