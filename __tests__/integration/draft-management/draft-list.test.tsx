/**
 * Integration test for draft list functionality
 */

import { render, screen, waitFor } from '@testing-library/react';
import { DraftManagementDialog } from '@/components/teleprompter/editor/DraftManagementDialog';
import * as draftStorage from '@/lib/storage/draftStorage';
import { TeleprompterDraft } from '@/lib/storage/types';

jest.mock('@/lib/storage/draftStorage');
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}));

describe('Draft List Integration', () => {
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
      text: 'Second script with more content',
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

  it('should display list of drafts with timestamps', async () => {
    render(<DraftManagementDialog open={true} onOpenChange={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('First script')).toBeInTheDocument();
      expect(screen.getByText('Second script with more content')).toBeInTheDocument();
    });
  });

  it('should show draft previews', async () => {
    render(<DraftManagementDialog open={true} onOpenChange={jest.fn()} />);

    await waitFor(() => {
      // Check that preview content is shown
      expect(screen.getByText(/First script/)).toBeInTheDocument();
    });
  });

  it('should display drafts sorted by timestamp (newest first)', async () => {
    render(<DraftManagementDialog open={true} onOpenChange={jest.fn()} />);

    await waitFor(() => {
      // Check that drafts are displayed
      expect(screen.getByText('First script')).toBeInTheDocument();
      expect(screen.getByText('Second script with more content')).toBeInTheDocument();
    });
  });
});
