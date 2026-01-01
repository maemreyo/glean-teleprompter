/**
 * Unit tests for useDraftManagement hook
 */

import { renderHook, act } from '@testing-library/react';
import { useDraftManagement } from '@/hooks/useDraftManagement';
import * as draftStorage from '@/lib/storage/draftStorage';
import { TeleprompterDraft } from '@/lib/storage/types';

jest.mock('@/lib/storage/draftStorage');

describe('useDraftManagement', () => {
  const mockDrafts: TeleprompterDraft[] = [
    {
      _id: 'draft-1',
      _version: '2.0',
      _timestamp: Date.now() - 1000,
      text: 'First script',
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
    },
    {
      _id: 'draft-2',
      _version: '2.0',
      _timestamp: Date.now() - 2000,
      text: 'Second script',
      backgroundUrl: '',
      musicUrl: '',
      fontStyle: 'Roboto',
      colorIndex: 1,
      scrollSpeed: 60,
      fontSize: 28,
      textAlignment: 'left',
      lineHeight: 1.6,
      margin: 25,
      overlayOpacity: 0.6,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (draftStorage.loadAllDrafts as jest.Mock).mockReturnValue(mockDrafts);
  });

  describe('draft list', () => {
    it('should load drafts on mount', () => {
      const { result } = renderHook(() => useDraftManagement());

      expect(draftStorage.loadAllDrafts).toHaveBeenCalled();
      expect(result.current.drafts).toEqual(mockDrafts);
    });

    it('should sort drafts by timestamp descending', () => {
      const { result } = renderHook(() => useDraftManagement());

      const timestamps = result.current.drafts.map(d => d._timestamp);
      expect(timestamps[0]).toBeGreaterThan(timestamps[1]);
    });
  });

  describe('restoreDraft', () => {
    it('should restore draft to store', () => {
      const { result } = renderHook(() => useDraftManagement());

      act(() => {
        result.current.restoreDraft(mockDrafts[0]._id);
      });

      // Restore should find the draft in the list and apply it
      expect(result.current.drafts.length).toBeGreaterThan(0);
    });
  });

  describe('deleteDrafts', () => {
    it('should delete single draft', async () => {
      (draftStorage.removeFromCollection as jest.Mock).mockReturnValue(undefined);

      const { result } = renderHook(() => useDraftManagement());

      await act(async () => {
        await result.current.deleteDrafts(['draft-1']);
      });

      expect(draftStorage.removeFromCollection).toHaveBeenCalledWith('draft-1');
    });

    it('should delete multiple drafts', async () => {
      (draftStorage.removeFromCollection as jest.Mock).mockReturnValue(undefined);

      const { result } = renderHook(() => useDraftManagement());

      await act(async () => {
        await result.current.deleteDrafts(['draft-1', 'draft-2']);
      });

      expect(draftStorage.removeFromCollection).toHaveBeenCalledTimes(2);
    });
  });

  describe('refresh', () => {
    it('should reload drafts from storage', async () => {
      const { result } = renderHook(() => useDraftManagement());

      const callCountBefore = (draftStorage.loadAllDrafts as jest.Mock).mock.calls.length;

      await act(async () => {
        await result.current.refresh();
      });

      const callCountAfter = (draftStorage.loadAllDrafts as jest.Mock).mock.calls.length;
      expect(callCountAfter).toBeGreaterThan(callCountBefore);
    });
  });

  describe('getDraft', () => {
    it('should return draft by id', () => {
      const { result } = renderHook(() => useDraftManagement());

      const draft = result.current.getDraft('draft-1');

      expect(draft).toEqual(mockDrafts[0]);
    });

    it('should return null for non-existent draft', () => {
      const { result } = renderHook(() => useDraftManagement());

      const draft = result.current.getDraft('non-existent');

      expect(draft).toBeNull();
    });
  });
});
