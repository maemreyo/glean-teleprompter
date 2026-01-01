/**
 * Unit tests for PrivateBrowsingWarning component
 */

import { render, screen } from '@testing-library/react';
import { PrivateBrowsingWarning } from '@/components/teleprompter/config/ui/PrivateBrowsingWarning';
import { usePrivateBrowsing, UsePrivateBrowsingReturn } from '@/hooks/usePrivateBrowsing';

jest.mock('@/hooks/usePrivateBrowsing');
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}));

const mockUsePrivateBrowsing = usePrivateBrowsing as jest.MockedFunction<typeof usePrivateBrowsing>;

describe('PrivateBrowsingWarning', () => {
  const mockReturnValue: UsePrivateBrowsingReturn = {
    isPrivate: false,
    isDetected: true,
    shouldShowWarning: false,
    dismissWarning: jest.fn(),
    recheck: jest.fn(),
  };

  it('should render warning banner when in private browsing', () => {
    mockReturnValue.isPrivate = true;
    mockReturnValue.shouldShowWarning = true;
    mockUsePrivateBrowsing.mockReturnValue(mockReturnValue);

    render(<PrivateBrowsingWarning />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should not render warning when not in private browsing', () => {
    mockReturnValue.isPrivate = false;
    mockReturnValue.shouldShowWarning = false;
    mockUsePrivateBrowsing.mockReturnValue(mockReturnValue);

    render(<PrivateBrowsingWarning />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should display "Save to account" CTA button', () => {
    mockReturnValue.isPrivate = true;
    mockReturnValue.shouldShowWarning = true;
    mockUsePrivateBrowsing.mockReturnValue(mockReturnValue);

    render(<PrivateBrowsingWarning />);

    // The CTA button should be present
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should have accessible ARIA labels', () => {
    mockReturnValue.isPrivate = true;
    mockReturnValue.shouldShowWarning = true;
    mockUsePrivateBrowsing.mockReturnValue(mockReturnValue);

    render(<PrivateBrowsingWarning />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'polite');
  });
});
