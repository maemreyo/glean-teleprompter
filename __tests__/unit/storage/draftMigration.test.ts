/**
 * Unit tests for draft migration utilities
 */

import { getCurrentVersion, getDraftVersion, migrateDraft } from '@/lib/storage/draftMigration';
import { TeleprompterDraft } from '@/lib/storage/types';

describe('draftMigration', () => {
  describe('getCurrentVersion', () => {
    it('should return current schema version', () => {
      const version = getCurrentVersion();
      expect(version).toBe('2.0');
    });
  });

  describe('getDraftVersion', () => {
    it('should return version from draft with _version field', () => {
      const draft: any = { _version: '2.0', text: 'test' };
      expect(getDraftVersion(draft)).toBe('2.0');
    });

    it('should default to "1.0" for drafts without _version', () => {
      const draft: any = { text: 'test', fontSize: 24 };
      expect(getDraftVersion(draft)).toBe('1.0');
    });

    it('should return null for null/undefined drafts', () => {
      expect(getDraftVersion(null)).toBeNull();
      expect(getDraftVersion(undefined)).toBeNull();
    });
  });

  describe('migrateDraft', () => {
    it('should return draft unchanged if already at current version', () => {
      const currentDraft: TeleprompterDraft = {
        _id: 'draft-1',
        _version: '2.0',
        _timestamp: Date.now(),
        text: 'test',
        backgroundUrl: '',
        musicUrl: '',
        fontStyle: 'Arial',
        colorIndex: 0,
        scrollSpeed: 50,
        fontSize: 24,
        textAlignment: 'center',
        lineHeight: 1.5,
        margin: 20,
        overlayOpacity: 0.5,
      };

      const result = migrateDraft(currentDraft);
      expect(result).toEqual(currentDraft);
    });

    it('should migrate from 1.0 to 2.0', () => {
      const oldDraft: any = {
        text: 'Old script',
        fontSize: 28,
      };

      const result = migrateDraft(oldDraft);

      expect(result._version).toBe('2.0');
      expect(result.text).toBe('Old script');
      expect(result.fontSize).toBe(28);
    });

    it('should handle null drafts gracefully', () => {
      const result = migrateDraft(null);
      expect(result).toBeNull();
    });

    it('should handle undefined drafts gracefully', () => {
      const result = migrateDraft(undefined);
      expect(result).toBeNull();
    });

    it('should throw error for unsupported versions', () => {
      const invalidDraft: any = {
        _version: '99.0',
        text: 'test',
      };

      expect(() => migrateDraft(invalidDraft)).toThrow();
    });
  });
});
