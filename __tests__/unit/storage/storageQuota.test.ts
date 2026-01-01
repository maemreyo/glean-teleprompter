/**
 * Unit tests for storage quota utilities
 */

import { getUsage, getWarningLevel, cleanupOldDrafts } from '@/lib/storage/storageQuota';
import * as draftStorage from '@/lib/storage/draftStorage';

jest.mock('@/lib/storage/draftStorage');

describe('storageQuota', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock localStorage
    const mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 0,
      key: jest.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });
  });

  describe('getUsage', () => {
    it('should calculate total storage usage', () => {
      // Mock localStorage with data
      const mockData = {
        'draft-1': JSON.stringify({ content: 'x'.repeat(1000) }),
        'draft-2': JSON.stringify({ content: 'x'.repeat(2000) }),
        'other-key': JSON.stringify({ data: 'x'.repeat(500) }),
      };

      const mockLocalStorage = window.localStorage as any;
      Object.defineProperty(mockLocalStorage, 'length', { value: 3 });
      mockLocalStorage.key = jest.fn((index: number) => Object.keys(mockData)[index]);
      mockLocalStorage.getItem = jest.fn((key: string) => mockData[key as keyof typeof mockData]);

      const usage = getUsage();

      expect(usage.used).toBeGreaterThan(0);
      expect(usage.total).toBeGreaterThan(0);
      expect(usage.percentage).toBeGreaterThanOrEqual(0);
      expect(usage.percentage).toBeLessThanOrEqual(100);
    });

    it('should return zero usage when localStorage is empty', () => {
      const mockLocalStorage = window.localStorage as any;
      Object.defineProperty(mockLocalStorage, 'length', { value: 0 });

      const usage = getUsage();

      expect(usage.used).toBe(0);
      expect(usage.percentage).toBe(0);
    });

    it('should calculate usage by key', () => {
      const mockData = {
        'draft-1': JSON.stringify({ content: 'x'.repeat(1000) }),
        'draft-2': JSON.stringify({ content: 'x'.repeat(2000) }),
      };

      const mockLocalStorage = window.localStorage as any;
      Object.defineProperty(mockLocalStorage, 'length', { value: 2 });
      mockLocalStorage.key = jest.fn((index: number) => Object.keys(mockData)[index]);
      mockLocalStorage.getItem = jest.fn((key: string) => mockData[key as keyof typeof mockData]);

      const usage = getUsage();

      expect(usage.byKey).toBeDefined();
      expect(typeof usage.byKey['draft-1']).toBe('number');
      expect(typeof usage.byKey['draft-2']).toBe('number');
    });
  });

  describe('getWarningLevel', () => {
    it('should return normal when usage is below 50%', () => {
      const mockLocalStorage = window.localStorage as any;
      Object.defineProperty(mockLocalStorage, 'length', { value: 0 });
      
      const level = getWarningLevel();
      expect(level).toBe('normal');
    });
  });

  describe('cleanupOldDrafts', () => {
    it('should remove drafts older than specified days', () => {
      const oldDrafts = [
        { _id: 'draft-1', _timestamp: Date.now() - 31 * 24 * 60 * 60 * 1000 }, // 31 days old
        { _id: 'draft-2', _timestamp: Date.now() - 35 * 24 * 60 * 60 * 1000 }, // 35 days old
      ];

      (draftStorage.loadAllDrafts as jest.Mock).mockReturnValue(oldDrafts);
      (draftStorage.clearCollection as jest.Mock).mockReturnValue(undefined);

      const result = cleanupOldDrafts(30);

      expect(result.deletedCount).toBe(2);
      expect(draftStorage.clearCollection).toHaveBeenCalled();
    });

    it('should keep drafts newer than specified days', () => {
      const newDrafts = [
        { _id: 'draft-1', _timestamp: Date.now() - 15 * 24 * 60 * 60 * 1000 }, // 15 days old
        { _id: 'draft-2', _timestamp: Date.now() - 20 * 24 * 60 * 60 * 1000 }, // 20 days old
      ];

      (draftStorage.loadAllDrafts as jest.Mock).mockReturnValue(newDrafts);

      const result = cleanupOldDrafts(30);

      expect(result.deletedCount).toBe(0);
    });

    it('should return number of drafts cleaned up', () => {
      const oldDrafts = [
        { _id: 'draft-1', _timestamp: Date.now() - 31 * 24 * 60 * 60 * 1000 },
      ];

      (draftStorage.loadAllDrafts as jest.Mock).mockReturnValue(oldDrafts);
      (draftStorage.clearCollection as jest.Mock).mockReturnValue(undefined);

      const result = cleanupOldDrafts(30);

      expect(result.deletedCount).toBe(1);
    });

    it('should handle empty draft collection', () => {
      (draftStorage.loadAllDrafts as jest.Mock).mockReturnValue([]);

      const result = cleanupOldDrafts(30);

      expect(result.deletedCount).toBe(0);
    });
  });
});
