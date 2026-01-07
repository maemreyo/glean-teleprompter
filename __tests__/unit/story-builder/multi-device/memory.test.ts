/**
 * Unit tests for memory calculation
 * @feature 015-multi-device-matrix
 */

import {
  calculateMemoryUsage,
  isAtWarningThreshold,
  isAtHardLimit,
  canEnableDevice,
  getMaxDeviceCount,
  getMemoryStatus,
  formatMemoryUsage,
} from '@/lib/story-builder/multi-device/memory';
import { MEMORY_THRESHOLDS } from '@/lib/story-builder/types';

describe('memory calculation', () => {
  describe('calculateMemoryUsage', () => {
    it('should calculate base memory for devices', () => {
      const usage = calculateMemoryUsage(2, 0);

      // 2 devices * 50MB per device = 100MB
      expect(usage).toBe(100);
    });

    it('should add content memory to device memory', () => {
      const usage = calculateMemoryUsage(2, 2000);

      // 2 devices * 50MB = 100MB + (2000 chars / 1000 * 5MB) = 10MB
      expect(usage).toBe(110);
    });

    it('should handle zero devices', () => {
      const usage = calculateMemoryUsage(0, 1000);
      expect(usage).toBe(5); // Content only
    });

    it('should handle zero content', () => {
      const usage = calculateMemoryUsage(3, 0);
      expect(usage).toBe(150); // Devices only
    });

    it('should handle large content sizes', () => {
      const usage = calculateMemoryUsage(4, 10000);

      // 4 * 50 = 200MB + (10000 / 1000 * 5) = 50MB
      expect(usage).toBe(250);
    });
  });

  describe('isAtWarningThreshold', () => {
    it('should return false below warning threshold', () => {
      expect(isAtWarningThreshold(200)).toBe(false);
    });

    it('should return true at warning threshold', () => {
      expect(isAtWarningThreshold(250)).toBe(true);
    });

    it('should return true above warning threshold', () => {
      expect(isAtWarningThreshold(300)).toBe(true);
    });
  });

  describe('isAtHardLimit', () => {
    it('should return false below hard limit', () => {
      expect(isAtHardLimit(300)).toBe(false);
    });

    it('should return true at hard limit', () => {
      expect(isAtHardLimit(350)).toBe(true);
    });

    it('should return true above hard limit', () => {
      expect(isAtHardLimit(400)).toBe(true);
    });
  });

  describe('canEnableDevice', () => {
    it('should allow enabling when within limits', () => {
      const result = canEnableDevice(2, 0);

      expect(result.canEnable).toBe(true);
      expect(result.wouldExceedWarning).toBe(false);
      expect(result.wouldExceedLimit).toBe(false);
      expect(result.projectedUsage).toBe(150); // 3 devices * 50MB
    });

    it('should warn when approaching warning threshold', () => {
      const result = canEnableDevice(4, 5000);

      // 5 * 50 = 250MB + (5000/1000*5) = 25MB = 275MB
      expect(result.canEnable).toBe(true);
      expect(result.wouldExceedWarning).toBe(true);
      expect(result.wouldExceedLimit).toBe(false);
      expect(result.projectedUsage).toBe(275);
    });

    it('should prevent enabling when at hard limit', () => {
      const result = canEnableDevice(6, 10000);

      // 7 * 50 = 350MB + (10000/1000*5) = 50MB = 400MB
      expect(result.canEnable).toBe(false);
      expect(result.wouldExceedWarning).toBe(true);
      expect(result.wouldExceedLimit).toBe(true);
      expect(result.projectedUsage).toBe(400);
    });

    it('should calculate projected usage correctly', () => {
      const result = canEnableDevice(3, 2000);

      // 4 * 50 = 200MB + (2000/1000*5) = 10MB = 210MB
      expect(result.projectedUsage).toBe(210);
    });
  });

  describe('getMaxDeviceCount', () => {
    it('should return maximum devices for small content', () => {
      const maxDevices = getMaxDeviceCount(1000);

      // 1000 chars = 5MB content, 350 - 5 = 345MB for devices
      // 345 / 50 = 6.9, so 6 devices
      expect(maxDevices).toBe(6);
    });

    it('should return maximum devices for large content', () => {
      const maxDevices = getMaxDeviceCount(10000);

      // 10000 chars = 50MB content, 350 - 50 = 300MB for devices
      // 300 / 50 = 6 devices
      expect(maxDevices).toBe(6);
    });

    it('should return at least 1 device', () => {
      const maxDevices = getMaxDeviceCount(100000);

      // Even with huge content, should allow at least 1 device
      expect(maxDevices).toBeGreaterThanOrEqual(1);
    });

    it('should decrease as content size increases', () => {
      const maxSmall = getMaxDeviceCount(1000);
      const maxLarge = getMaxDeviceCount(10000);

      expect(maxLarge).toBeLessThanOrEqual(maxSmall);
    });
  });

  describe('getMemoryStatus', () => {
    it('should return normal status below warning', () => {
      const status = getMemoryStatus(200);

      expect(status.status).toBe('normal');
      expect(status.message).toBe('Memory usage is within safe limits.');
      expect(status.percentage).toBeLessThan(72);
    });

    it('should return warning status at warning threshold', () => {
      const status = getMemoryStatus(250);

      expect(status.status).toBe('warning');
      expect(status.message).toBe('High memory usage. Performance may be affected.');
      expect(status.percentage).toBeCloseTo(71.43);
    });

    it('should return critical status at hard limit', () => {
      const status = getMemoryStatus(350);

      expect(status.status).toBe('critical');
      expect(status.message).toBe('Memory limit reached. Cannot enable more devices.');
      expect(status.percentage).toBe(100);
    });

    it('should calculate percentage correctly', () => {
      const status1 = getMemoryStatus(175);
      expect(status1.percentage).toBe(50);

      const status2 = getMemoryStatus(280);
      expect(status2.percentage).toBe(80);
    });
  });

  describe('formatMemoryUsage', () => {
    it('should format whole numbers', () => {
      expect(formatMemoryUsage(100)).toBe('100 MB');
      expect(formatMemoryUsage(250)).toBe('250 MB');
      expect(formatMemoryUsage(350)).toBe('350 MB');
    });

    it('should round decimal values', () => {
      expect(formatMemoryUsage(123.7)).toBe('124 MB');
      expect(formatMemoryUsage(276.3)).toBe('276 MB');
    });

    it('should handle zero', () => {
      expect(formatMemoryUsage(0)).toBe('0 MB');
    });
  });
});
