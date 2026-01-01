/**
 * Unit tests for StorageQuotaWarning component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { StorageQuotaWarning } from '@/components/teleprompter/config/ui/StorageQuotaWarning';
import { StorageUsageMetrics } from '@/lib/storage/types';

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}));

describe('StorageQuotaWarning', () => {
  const mockCleanup = jest.fn();
  const mockUsage: StorageUsageMetrics = {
    used: 8000,
    total: 10000,
    percentage: 80,
    byKey: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render warning when storage usage is >= 90%', () => {
    const highUsage: StorageUsageMetrics = {
      used: 9000,
      total: 10000,
      percentage: 90,
      byKey: {},
    };

    render(<StorageQuotaWarning usage={highUsage} onCleanup={mockCleanup} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should not render warning when storage usage is below 90%', () => {
    render(<StorageQuotaWarning usage={mockUsage} onCleanup={mockCleanup} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should display storage usage percentage and size', () => {
    const highUsage: StorageUsageMetrics = {
      used: 9500,
      total: 10000,
      percentage: 95,
      byKey: {},
    };

    render(<StorageQuotaWarning usage={highUsage} onCleanup={mockCleanup} />);

    // Should display percentage
    expect(screen.getByText(/95%/i)).toBeInTheDocument();
  });

  it('should call cleanup when "Clear Old Drafts" button is clicked', () => {
    const highUsage: StorageUsageMetrics = {
      used: 9000,
      total: 10000,
      percentage: 90,
      byKey: {},
    };

    render(<StorageQuotaWarning usage={highUsage} onCleanup={mockCleanup} />);

    const button = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(button);

    expect(mockCleanup).toHaveBeenCalled();
  });

  it('should have accessible ARIA labels', () => {
    const highUsage: StorageUsageMetrics = {
      used: 9500,
      total: 10000,
      percentage: 95,
      byKey: {},
    };

    render(<StorageQuotaWarning usage={highUsage} onCleanup={mockCleanup} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'polite');
  });

  it('should show full storage message when usage is 100%', () => {
    const fullUsage: StorageUsageMetrics = {
      used: 10000,
      total: 10000,
      percentage: 100,
      byKey: {},
    };

    render(<StorageQuotaWarning usage={fullUsage} onCleanup={mockCleanup} />);

    expect(screen.getByText(/storage full/i)).toBeInTheDocument();
  });
});
