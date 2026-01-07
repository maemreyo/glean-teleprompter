/**
 * Unit tests for FocalPointIndicator component
 * @feature 014-teleprompter-preview-sync
 * @task T033
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { FocalPointIndicator } from '@/components/story/Teleprompter/FocalPointIndicator';

// Mock useSafeArea hook
jest.mock('@/lib/story/hooks/useSafeArea', () => ({
  useSafeArea: () => ({ top: 0, hasSafeArea: false }),
}));

describe('FocalPointIndicator', () => {
  describe('Tooltip functionality (T033)', () => {
    it('should show tooltip on hover', () => {
      render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Hover over the indicator
      fireEvent.mouseEnter(indicator);

      // Check that tooltip appears
      expect(screen.getByText(/Focal Point:/)).toBeInTheDocument();
      expect(screen.getByText(/Optimal reading area during recording/)).toBeInTheDocument();
    });

    it('should hide tooltip when hover ends', () => {
      render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Hover over the indicator
      fireEvent.mouseEnter(indicator);

      // Verify tooltip is shown
      expect(screen.getByText(/Focal Point:/)).toBeInTheDocument();

      // Mouse leave
      fireEvent.mouseLeave(indicator);

      // Tooltip should be hidden (removed from DOM)
      expect(screen.queryByText(/Focal Point:/)).not.toBeInTheDocument();
    });

    it('should show tooltip on keyboard focus', () => {
      render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Focus the indicator
      fireEvent.focus(indicator);

      // Check that tooltip appears
      expect(screen.getByText(/Focal Point:/)).toBeInTheDocument();
    });

    it('should hide tooltip on keyboard blur', () => {
      render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Focus the indicator
      fireEvent.focus(indicator);

      // Verify tooltip is shown
      expect(screen.getByText(/Focal Point:/)).toBeInTheDocument();

      // Blur
      fireEvent.blur(indicator);

      // Tooltip should be hidden
      expect(screen.queryByText(/Focal Point:/)).not.toBeInTheDocument();
    });

    it('should respect hideTooltip prop', () => {
      render(<FocalPointIndicator focalPoint={50} hideTooltip />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Hover over the indicator
      fireEvent.mouseEnter(indicator);

      // Tooltip should not appear
      expect(screen.queryByText(/Focal Point:/)).not.toBeInTheDocument();
    });

    it('should not be keyboard focusable when tooltip is hidden', () => {
      render(<FocalPointIndicator focalPoint={50} hideTooltip />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Should have tabIndex={-1}
      expect(indicator).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Focal point positioning', () => {
    it('should use provided focal point value', () => {
      const { container } = render(<FocalPointIndicator focalPoint={75} />);

      const indicator = container.querySelector('.group');
      expect(indicator).toHaveStyle({ top: '75vh' });
    });

    it('should show percentage label when focal point is provided', () => {
      render(<FocalPointIndicator focalPoint={60} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Hover to show percentage label
      fireEvent.mouseEnter(indicator);

      // Check for percentage label
      expect(screen.getByText('60%')).toBeInTheDocument();
    });

    it('should not show percentage label when focal point is not provided', () => {
      render(<FocalPointIndicator />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Hover
      fireEvent.mouseEnter(indicator);

      // Percentage label should not exist
      expect(screen.queryByText(/\d+%/)).not.toBeInTheDocument();
    });

    it('should round percentage values', () => {
      render(<FocalPointIndicator focalPoint={67.8} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Hover
      fireEvent.mouseEnter(indicator);

      // Should show rounded value
      expect(screen.getByText('68%')).toBeInTheDocument();
    });
  });

  describe('Tooltip text content', () => {
    it('should include focal point percentage in tooltip', () => {
      render(<FocalPointIndicator focalPoint={45} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      fireEvent.mouseEnter(indicator);

      expect(screen.getByText('Focal Point: 45%')).toBeInTheDocument();
    });

    it('should include explanation text in tooltip', () => {
      render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      fireEvent.mouseEnter(indicator);

      expect(screen.getByText('Optimal reading area during recording')).toBeInTheDocument();
    });

    it('should show empty tooltip when hideTooltip is true', () => {
      render(<FocalPointIndicator focalPoint={50} hideTooltip />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      fireEvent.mouseEnter(indicator);

      // No tooltip should be present
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      expect(indicator).toHaveAttribute('aria-label', 'Focal point indicator');
    });

    it('should be keyboard accessible by default', () => {
      render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Should have tabIndex={0} to be focusable
      expect(indicator).toHaveAttribute('tabIndex', '0');
    });

    it('should have tooltip role when visible', () => {
      render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      fireEvent.mouseEnter(indicator);

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
    });
  });

  describe('Visual appearance', () => {
    it('should have glow effect', () => {
      const { container } = render(<FocalPointIndicator focalPoint={50} />);

      const glow = container.querySelector('.blur-sm');
      expect(glow).toBeInTheDocument();
      expect(glow).toHaveClass('bg-yellow-400');
      expect(glow).toHaveClass('opacity-50');
    });

    it('should be positioned absolutely', () => {
      const { container } = render(<FocalPointIndicator focalPoint={50} />);

      const indicator = container.querySelector('.absolute');
      expect(indicator).toHaveClass('left-0', 'right-0');
    });

    it('should have yellow color', () => {
      const { container } = render(<FocalPointIndicator focalPoint={50} />);

      const indicator = container.querySelector('.bg-yellow-400');
      expect(indicator).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <FocalPointIndicator focalPoint={50} className="custom-class" />
      );

      const indicator = container.querySelector('.custom-class');
      expect(indicator).toBeInTheDocument();
    });
  });
});
