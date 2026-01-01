/**
 * Unit tests for draft storage operations
 * Tests localStorage save/load operations
 */

import {
  saveDraft,
  loadDraft,
  deleteDraft,
  hasDraft,
  loadAllDrafts,
  addToCollection,
  removeFromCollection,
  clearCollection,
  saveDraftWithConflictDetection,
  createDraft,
} from '@/lib/storage/draftStorage';
import { TeleprompterDraft } from '@/lib/storage/types';

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
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock draftMigration
jest.mock('@/lib/storage/draftMigration', () => ({
  migrateDraft: jest.fn((draft) => draft),
}));

describe('draftStorage', () => {
  let mockDraft: TeleprompterDraft;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();

    mockDraft = {
      _id: 'test-id-123',
      _version: '2.0',
      _timestamp: Date.now(),
      text: 'Test script content',
      backgroundUrl: 'https://example.com/bg.jpg',
      musicUrl: 'https://example.com/music.mp3',
      fontStyle: 'Arial',
      colorIndex: 0,
      scrollSpeed: 50,
      fontSize: 24,
      textAlignment: 'center',
      lineHeight: 1.5,
      margin: 20,
      overlayOpacity: 0.5,
    };
  });

  describe('saveDraft', () => {
    it('should save draft to localStorage', () => {
      saveDraft(mockDraft);

      const saved = localStorage.getItem('teleprompter_draft');
      expect(saved).toBeTruthy();

      const parsed = JSON.parse(saved!);
      expect(parsed._id).toBe(mockDraft._id);
      expect(parsed.text).toBe(mockDraft.text);
    });

    it('should save all 11 teleprompter properties', () => {
      saveDraft(mockDraft);

      const saved = localStorage.getItem('teleprompter_draft');
      const parsed = JSON.parse(saved!);

      // Verify all properties are saved
      expect(parsed.text).toBe(mockDraft.text);
      expect(parsed.backgroundUrl).toBe(mockDraft.backgroundUrl);
      expect(parsed.musicUrl).toBe(mockDraft.musicUrl);
      expect(parsed.fontStyle).toBe(mockDraft.fontStyle);
      expect(parsed.colorIndex).toBe(mockDraft.colorIndex);
      expect(parsed.scrollSpeed).toBe(mockDraft.scrollSpeed);
      expect(parsed.fontSize).toBe(mockDraft.fontSize);
      expect(parsed.textAlignment).toBe(mockDraft.textAlignment);
      expect(parsed.lineHeight).toBe(mockDraft.lineHeight);
      expect(parsed.margin).toBe(mockDraft.margin);
      expect(parsed.overlayOpacity).toBe(mockDraft.overlayOpacity);
    });

    it('should throw QuotaExceededError when storage is full', () => {
      // Mock localStorage to throw quota exceeded error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        const error: any = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      expect(() => saveDraft(mockDraft)).toThrow('Storage quota exceeded');

      localStorage.setItem = originalSetItem;
    });
  });

  describe('loadDraft', () => {
    it('should load draft from localStorage', () => {
      localStorage.setItem('teleprompter_draft', JSON.stringify(mockDraft));

      const loaded = loadDraft();

      expect(loaded).toBeTruthy();
      expect(loaded?._id).toBe(mockDraft._id);
      expect(loaded?.text).toBe(mockDraft.text);
    });

    it('should return null when no draft exists', () => {
      const loaded = loadDraft();

      expect(loaded).toBeNull();
    });

    it('should apply migration when draft version differs', () => {
      const { migrateDraft } = require('@/lib/storage/draftMigration');
      migrateDraft.mockReturnValue(mockDraft);

      const oldDraft = { ...mockDraft, _version: '1.0' };
      localStorage.setItem('teleprompter_draft', JSON.stringify(oldDraft));

      const loaded = loadDraft();

      expect(migrateDraft).toHaveBeenCalledWith(oldDraft);
      expect(loaded?._version).toBe('2.0');
    });
  });

  describe('deleteDraft', () => {
    it('should remove draft from localStorage', () => {
      localStorage.setItem('teleprompter_draft', JSON.stringify(mockDraft));

      deleteDraft();

      const saved = localStorage.getItem('teleprompter_draft');
      expect(saved).toBeNull();
    });
  });

  describe('hasDraft', () => {
    it('should return true when draft exists', () => {
      localStorage.setItem('teleprompter_draft', JSON.stringify(mockDraft));

      expect(hasDraft()).toBe(true);
    });

    it('should return false when no draft exists', () => {
      expect(hasDraft()).toBe(false);
    });
  });

  describe('loadAllDrafts', () => {
    it('should load all drafts from collection', () => {
      const collection = {
        drafts: [mockDraft],
        _schemaVersion: '2.0',
        _lastUpdated: Date.now(),
      };

      localStorage.setItem('teleprompter_drafts', JSON.stringify(collection));

      const drafts = loadAllDrafts();

      expect(drafts).toHaveLength(1);
      expect(drafts[0]._id).toBe(mockDraft._id);
    });

    it('should return empty array when no collection exists', () => {
      const drafts = loadAllDrafts();

      expect(drafts).toEqual([]);
    });
  });

  describe('addToCollection', () => {
    it('should add draft to collection', () => {
      const id = addToCollection(mockDraft);

      expect(id).toBe(mockDraft._id);

      const collection = JSON.parse(localStorage.getItem('teleprompter_drafts')!);
      expect(collection.drafts).toHaveLength(1);
      expect(collection.drafts[0]._id).toBe(mockDraft._id);
    });

    it('should generate ID if draft has none', () => {
      const draftWithoutId = { ...mockDraft, _id: '' };

      const id = addToCollection(draftWithoutId);

      expect(id).toBeTruthy();
      expect(id).not.toBe('');
    });

    it('should update existing draft in collection', () => {
      addToCollection(mockDraft);

      const updatedDraft = { ...mockDraft, text: 'Updated text' };
      addToCollection(updatedDraft);

      const collection = JSON.parse(localStorage.getItem('teleprompter_drafts')!);
      expect(collection.drafts).toHaveLength(1);
      expect(collection.drafts[0].text).toBe('Updated text');
    });
  });

  describe('removeFromCollection', () => {
    it('should remove draft from collection', () => {
      const collection = {
        drafts: [mockDraft],
        _schemaVersion: '2.0',
        _lastUpdated: Date.now(),
      };

      localStorage.setItem('teleprompter_drafts', JSON.stringify(collection));

      removeFromCollection(mockDraft._id);

      const updated = JSON.parse(localStorage.getItem('teleprompter_drafts')!);
      expect(updated.drafts).toHaveLength(0);
    });
  });

  describe('clearCollection', () => {
    it('should remove entire collection', () => {
      const collection = {
        drafts: [mockDraft],
        _schemaVersion: '2.0',
        _lastUpdated: Date.now(),
      };

      localStorage.setItem('teleprompter_drafts', JSON.stringify(collection));

      clearCollection();

      const saved = localStorage.getItem('teleprompter_drafts');
      expect(saved).toBeNull();
    });
  });

  describe('saveDraftWithConflictDetection', () => {
    it('should save without checking when checkConflicts is false', () => {
      const result = saveDraftWithConflictDetection(mockDraft, {
        checkConflicts: false,
      });

      expect(result.success).toBe(true);
      expect(result.conflict).toBeUndefined();
    });

    it('should detect conflict when existing draft is newer', () => {
      const newerDraft = {
        ...mockDraft,
        _timestamp: mockDraft._timestamp + 1000,
      };

      localStorage.setItem('teleprompter_draft', JSON.stringify(newerDraft));

      const result = saveDraftWithConflictDetection(mockDraft, {
        checkConflicts: true,
      });

      expect(result.success).toBe(true); // No handler, so overwrites
      expect(result.conflict).toBeUndefined();
    });

    it('should call onConflict handler when conflict detected', () => {
      const newerDraft = {
        ...mockDraft,
        _timestamp: mockDraft._timestamp + 1000,
      };

      localStorage.setItem('teleprompter_draft', JSON.stringify(newerDraft));

      const onConflict = jest.fn().mockReturnValue('cancel');

      const result = saveDraftWithConflictDetection(mockDraft, {
        checkConflicts: true,
        onConflict,
      });

      expect(onConflict).toHaveBeenCalledWith({
        localDraft: mockDraft,
        remoteDraft: newerDraft,
        timeDifference: 1000,
      });

      expect(result.success).toBe(false);
      expect(result.conflict?.hasNewerVersion).toBe(true);
    });

    it('should overwrite when conflict handler returns overwrite', () => {
      const newerDraft = {
        ...mockDraft,
        _timestamp: mockDraft._timestamp + 1000,
        text: 'Newer text',
      };

      localStorage.setItem('teleprompter_draft', JSON.stringify(newerDraft));

      const onConflict = jest.fn().mockReturnValue('overwrite');

      const result = saveDraftWithConflictDetection(mockDraft, {
        checkConflicts: true,
        onConflict,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('createDraft', () => {
    it('should create draft with all required fields', () => {
      const state = {
        text: 'New script',
        backgroundUrl: 'https://example.com/bg.jpg',
      };

      const draft = createDraft(state);

      expect(draft._id).toBeTruthy();
      expect(draft._version).toBe('2.0');
      expect(draft._timestamp).toBeTruthy();
      expect(draft.text).toBe('New script');
      expect(draft.backgroundUrl).toBe('https://example.com/bg.jpg');
    });

    it('should use default values for unspecified properties', () => {
      const draft = createDraft({});

      expect(draft.text).toBe('');
      expect(draft.fontStyle).toBe('Arial');
      expect(draft.colorIndex).toBe(0);
      expect(draft.scrollSpeed).toBe(50);
      expect(draft.fontSize).toBe(24);
      expect(draft.textAlignment).toBe('center');
      expect(draft.lineHeight).toBe(1.5);
      expect(draft.margin).toBe(20);
      expect(draft.overlayOpacity).toBe(0.5);
    });
  });
});
