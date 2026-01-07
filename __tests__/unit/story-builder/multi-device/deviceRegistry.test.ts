/**
 * Unit tests for device registry
 * @feature 015-multi-device-matrix
 */

import {
  DEVICE_REGISTRY,
  getDeviceById,
  getAllDeviceIds,
  getDevicesByCategory,
  getDeviceDisplaySize,
} from '@/lib/story-builder/multi-device/deviceRegistry';
import type { DeviceCategory } from '@/lib/story-builder/multi-device/deviceRegistry';

describe('deviceRegistry', () => {
  describe('DEVICE_REGISTRY', () => {
    it('should contain 4 device types', () => {
      expect(DEVICE_REGISTRY).toHaveLength(4);
    });

    it('should have devices in correct priority order', () => {
      expect(DEVICE_REGISTRY[0].id).toBe('iphone-se');
      expect(DEVICE_REGISTRY[1].id).toBe('iphone-14-pro');
      expect(DEVICE_REGISTRY[2].id).toBe('ipad-air');
      expect(DEVICE_REGISTRY[3].id).toBe('desktop');
    });

    it('should have all required properties on each device', () => {
      DEVICE_REGISTRY.forEach((device) => {
        expect(device).toHaveProperty('id');
        expect(device).toHaveProperty('name');
        expect(device).toHaveProperty('width');
        expect(device).toHaveProperty('height');
        expect(device).toHaveProperty('scale');
        expect(device).toHaveProperty('category');
      });
    });

    it('should have mobile devices with scale 1.0', () => {
      const mobileDevices = getDevicesByCategory('mobile');
      mobileDevices.forEach((device) => {
        expect(device.scale).toBe(1.0);
      });
    });

    it('should have desktop device with scale 0.5', () => {
      const desktop = getDeviceById('desktop');
      expect(desktop?.scale).toBe(0.5);
    });
  });

  describe('getDeviceById', () => {
    it('should return device by valid ID', () => {
      const device = getDeviceById('iphone-14-pro');
      expect(device).toBeDefined();
      expect(device?.id).toBe('iphone-14-pro');
      expect(device?.name).toBe('iPhone 14 Pro');
    });

    it('should return undefined for invalid ID', () => {
      const device = getDeviceById('invalid-device-id');
      expect(device).toBeUndefined();
    });

    it('should return all device types by ID', () => {
      expect(getDeviceById('iphone-se')).toBeDefined();
      expect(getDeviceById('iphone-14-pro')).toBeDefined();
      expect(getDeviceById('ipad-air')).toBeDefined();
      expect(getDeviceById('desktop')).toBeDefined();
    });
  });

  describe('getAllDeviceIds', () => {
    it('should return array of all device IDs', () => {
      const ids = getAllDeviceIds();
      expect(ids).toEqual(['iphone-se', 'iphone-14-pro', 'ipad-air', 'desktop']);
    });

    it('should return 4 device IDs', () => {
      const ids = getAllDeviceIds();
      expect(ids).toHaveLength(4);
    });
  });

  describe('getDevicesByCategory', () => {
    it('should return mobile devices', () => {
      const mobileDevices = getDevicesByCategory('mobile');
      expect(mobileDevices).toHaveLength(2);
      expect(mobileDevices.map((d) => d.id)).toContain('iphone-se');
      expect(mobileDevices.map((d) => d.id)).toContain('iphone-14-pro');
    });

    it('should return tablet devices', () => {
      const tabletDevices = getDevicesByCategory('tablet');
      expect(tabletDevices).toHaveLength(1);
      expect(tabletDevices[0].id).toBe('ipad-air');
    });

    it('should return desktop devices', () => {
      const desktopDevices = getDevicesByCategory('desktop');
      expect(desktopDevices).toHaveLength(1);
      expect(desktopDevices[0].id).toBe('desktop');
    });

    it('should return empty array for invalid category', () => {
      const devices = getDevicesByCategory('invalid' as DeviceCategory);
      expect(devices).toEqual([]);
    });
  });

  describe('getDeviceDisplaySize', () => {
    it('should calculate display size for mobile device', () => {
      const iphoneSE = getDeviceById('iphone-se');
      expect(iphoneSE).toBeDefined();
      const displaySize = getDeviceDisplaySize(iphoneSE!);
      expect(displaySize.width).toBe(375);
      expect(displaySize.height).toBe(667);
    });

    it('should calculate display size for desktop device with scale', () => {
      const desktop = getDeviceById('desktop');
      expect(desktop).toBeDefined();
      const displaySize = getDeviceDisplaySize(desktop!);
      expect(displaySize.width).toBe(960); // 1920 * 0.5
      expect(displaySize.height).toBe(540); // 1080 * 0.5
    });

    it('should calculate display size for tablet device', () => {
      const ipadAir = getDeviceById('ipad-air');
      expect(ipadAir).toBeDefined();
      const displaySize = getDeviceDisplaySize(ipadAir!);
      expect(displaySize.width).toBe(820);
      expect(displaySize.height).toBe(1180);
    });
  });
});
