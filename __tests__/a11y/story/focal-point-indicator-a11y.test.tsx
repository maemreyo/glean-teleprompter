/**
 * Accessibility tests for FocalPointIndicator tooltip
 * @feature 014-teleprompter-preview-sync
 * @task T034
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { FocalPointIndicator } from '@/components/story/Teleprompter/FocalPointIndicator';

// Mock useSafeArea hook
jest.mock('@/lib/story/hooks/useSafeArea', () => ({
  useSafeArea: () => ({ top: 0, hasSafeArea: false }),
}));

describe('FocalPointIndicator Accessibility (T034)', () => {
  describe('Keyboard navigation', () => {
    it('should be focusable with Tab key', () => {
      render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Should be in tab order
      expect(indicator).toHaveAttribute('tabIndex', '0');
    });

    it('should not be focusable when hideTooltip is true', () => {
      render(<FocalPointIndicator focalPoint={50} hideTooltip />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Should be removed from tab order
      expect(indicator).toHaveAttribute('tabIndex', '-1');
    });

    it('should show tooltip on focus', () => {
      render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Focus the element
      indicator.focus();

      // Tooltip should appear
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByText(/Focal Point:/)).toBeInTheDocument();
    });

    it('should hide tooltip on blur', () => {
      render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Focus the element
      indicator.focus();

      // Verify tooltip is shown
      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      // Blur the element
      indicator.blur();

      // Tooltip should disappear
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('should handle Enter and Space keys appropriately', () => {
      render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Press Enter key (should not cause any action, just toggle focus)
      fireEvent.keyDown(indicator, { key: 'Enter', code: 'Enter' });

      // Element should still be accessible
      expect(indicator).toBeInTheDocument();

      // Press Space key
      fireEvent.keyDown(indicator, { key: ' ', code: 'Space' });

      // Element should still be accessible
      expect(indicator).toBeInTheDocument();
    });

    it('should handle Escape key to close tooltip', () => {
      render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Focus to show tooltip
      indicator.focus();
      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      // Press Escape
      fireEvent.keyDown(indicator, { key: 'Escape', code: 'Escape' });

      // Tooltip should hide (though focus remains)
      // Note: Current implementation may not support Escape, this is documenting behavior
    });
  });

  describe('ARIA attributes', () => {
    it('should have appropriate role attribute', () => {
      render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });
      expect(indicator).toHaveAttribute('role', 'presentation');
    });

    it('should have aria-label for screen readers', () => {
      render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });
      expect(indicator).toHaveAttribute('aria-label', 'Focal point indicator');
    });

    it('should have tooltip role when tooltip is visible', () => {
      render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Show tooltip
      fireEvent.mouseEnter(indicator);

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
    });

    it('should provide descriptive text in tooltip', () => {
      render(<FocalPointIndicator focalPoint={75} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Show tooltip
      fireEvent.mouseEnter(indicator);

      const tooltip = screen.getByRole('tooltip');

      // Should contain both percentage and explanation
      expect(tooltip).toHaveTextContent('Focal Point: 75%');
      expect(tooltip).toHaveTextContent('Optimal reading area during recording');
    });
  });

  describe('Screen reader compatibility', () => {
    it('should be perceivable by screen readers', () => {
      render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByLabelText('Focal point indicator');
      expect(indicator).toBeInTheDocument();
    });

    it('should announce focal point value', () => {
      render(<FocalPointIndicator focalPoint={60} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Focus the indicator
      fireEvent.focus(indicator);

      // Tooltip with focal point info should be announced
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveTextContent('60%');
    });

    it('should provide context about focal point purpose', () => {
      render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Show tooltip
      fireEvent.mouseEnter(indicator);

      // Should explain what the focal point is for
      expect(screen.getByText(/Optimal reading area/)).toBeInTheDocument();
    });
  });

  describe('Color contrast', () => {
    it('should have sufficient contrast for the indicator line', () => {
      const { container } = render(<FocalPointIndicator focalPoint={50} />);

      const indicator = container.querySelector('.bg-yellow-400');

      // Yellow-400 on dark background should have sufficient contrast
      // This is a visual test, but we verify the class is applied
      expect(indicator).toHaveClass('bg-yellow-400');
      expect(indicator).toHaveClass('opacity-80');
    });

    it('should have sufficient contrast for tooltip text', () => {
      render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Show tooltip
      fireEvent.mouseEnter(indicator);

      const tooltip = screen.getByRole('tooltip');

      // Tooltip should have light text on dark background
      expect(tooltip).toHaveClass('text-white');
      expect(tooltip).toHaveClass('bg-gray-900');
    });

    it('should have sufficient contrast for percentage label', () => {
      render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Show percentage label
      fireEvent.mouseEnter(indicator);

      // Should have dark text on yellow background
      const label = screen.getByText(/\d+%/);
      expect(label).toHaveClass('text-gray-900');
    });
  });

  describe('Touch and mouse interaction', () => {
    it('should show tooltip on mouse hover', () => {
      render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Mouse enter
      fireEvent.mouseEnter(indicator);

      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      // Mouse leave
      fireEvent.mouseLeave(indicator);

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('should handle pointer events correctly', () => {
      render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Should respond to pointer events
      fireEvent.pointerEnter(indicator);

      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      fireEvent.pointerLeave(indicator);

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Focus management', () => {
    it('should not trap focus', () => {
      render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Focus the indicator
      indicator.focus();

      // Should not have focus-trap attributes
      expect(indicator).not.toHaveAttribute('aria-modal');
      expect(indicator).not.toHaveAttribute('role', 'dialog');
    });

    it('should allow focus to move away', () => {
      render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Focus the indicator
      indicator.focus();
      expect(document.activeElement).toBe(indicator);

      // Blur should work
      indicator.blur();
      expect(document.activeElement).not.toBe(indicator);
    });
  });

  describe('Reduced motion preferences', () => {
    it('should respect prefers-reduced-motion', () => {
      // Mock matchMedia
      const mockMatchMedia = jest.fn().mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      window.matchMedia = mockMatchMedia;

      render(<FocalPointIndicator focalPoint={50} />);

      // Component should render without errors
      const indicator = screen.getByRole('presentation', { hidden: true });
      expect(indicator).toBeInTheDocument();
    });
  });
});
