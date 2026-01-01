/**
 * Integration test for restore and delete operations
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DraftManagementDialog } from '@/components/teleprompter/editor/DraftManagementDialog';
import * as draftStorage from '@/lib/storage/draftStorage';
import { TeleprompterDraft } from '@/lib/storage/types';

jest.mock('@/lib/storage/draftStorage');
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}));

describe('Restore/Delete Operations Integration', () => {
  const mockDrafts: TeleprompterDraft[] = [
    {
      _id: 'draft-1',
      _version: '2.0',
      _timestamp: Date.now() - 1000,
      text: 'Draft to restore',
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
      text: 'Draft to delete',
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
    (draftStorage.removeFromCollection as jest.Mock).mockReturnValue(undefined);
  });

  describe('Restore operations', () => {
    it('should restore draft when clicking restore button', async () => {
      const onOpenChange = jest.fn();
      render(<DraftManagementDialog open={true} onOpenChange={onOpenChange} />);

      await waitFor(() => {
        expect(screen.getByText('Draft to restore')).toBeInTheDocument();
      });

      // Click restore button
      const restoreButtons = screen.getAllByText('Restore');
      fireEvent.click(restoreButtons[0]);

      // Dialog should close after restore
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Delete operations', () => {
    it('should delete single draft when selected and delete clicked', async () => {
      render(<DraftManagementDialog open={true} onOpenChange={jest.fn()} />);

      await waitFor(() => {
        expect(screen.getByText('Draft to delete')).toBeInTheDocument();
      });

      // Select the draft
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]); // Second checkbox (first is select-all)

      // Click delete button
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);

      // Should call removeFromCollection
      expect(draftStorage.removeFromCollection).toHaveBeenCalled();
    });

    it('should delete multiple drafts when multiple selected', async () => {
      render(<DraftManagementDialog open={true} onOpenChange={jest.fn()} />);

      await waitFor(() => {
        expect(screen.getByText('Draft to restore')).toBeInTheDocument();
      });

      // Select all drafts
      const selectAllCheckbox = screen.getByRole('checkbox', { name: /2 drafts/i });
      fireEvent.click(selectAllCheckbox);

      // Click delete button
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);

      // Should call removeFromCollection twice
      expect(draftStorage.removeFromCollection).toHaveBeenCalledTimes(2);
    });
  });

  describe('Multi-select', () => {
    it('should toggle selection when clicking checkbox', async () => {
      render(<DraftManagementDialog open={true} onOpenChange={jest.fn()} />);

      await waitFor(() => {
        expect(screen.getByText('Draft to restore')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      const firstDraftCheckbox = checkboxes[1];

      // Click to select
      fireEvent.click(firstDraftCheckbox);
      expect(firstDraftCheckbox).toBeChecked();

      // Click to deselect
      fireEvent.click(firstDraftCheckbox);
      expect(firstDraftCheckbox).not.toBeChecked();
    });

    it('should show selected count', async () => {
      render(<DraftManagementDialog open={true} onOpenChange={jest.fn()} />);

      await waitFor(() => {
        expect(screen.getByText('Draft to restore')).toBeInTheDocument();
      });

      // Select one draft
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);

      // Should show "1 selected"
      expect(screen.getByText('1 selected')).toBeInTheDocument();
    });
  });
});
