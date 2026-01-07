/**
 * Visual tests for FocalPointIndicator tooltip appearance
 * @feature 014-teleprompter-preview-sync
 * @task T035
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { FocalPointIndicator } from '@/components/story/Teleprompter/FocalPointIndicator';

// Mock useSafeArea hook
jest.mock('@/lib/story/hooks/useSafeArea', () => ({
  useSafeArea: () => ({ top: 0, hasSafeArea: false }),
}));

describe('FocalPointIndicator Tooltip Visual Tests (T035)', () => {
  describe('Tooltip positioning', () => {
    it('should position tooltip above the indicator', () => {
      const { container } = render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Show tooltip
      fireEvent.mouseEnter(indicator);

      const tooltip = screen.getByRole('tooltip');

      // Should have positioning classes for above placement
      expect(tooltip).toHaveClass('-top-12');
    });

    it('should center tooltip horizontally', () => {
      const { container } = render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Show tooltip
      fireEvent.mouseEnter(indicator);

      const tooltip = screen.getByRole('tooltip');

      // Should be centered using transform
      expect(tooltip).toHaveClass('-translate-x-1/2');
    });

    it('should have arrow pointing down', () => {
      const { container } = render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Show tooltip
      fireEvent.mouseEnter(indicator);

      // Check for arrow element
      const arrow = container.querySelector('.border-t-gray-900');
      expect(arrow).toBeInTheDocument();
    });
  });

  describe('Tooltip styling', () => {
    it('should have dark background', () => {
      const { container } = render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Show tooltip
      fireEvent.mouseEnter(indicator);

      const tooltip = screen.getByRole('tooltip');

      expect(tooltip).toHaveClass('bg-gray-900');
    });

    it('should have light text', () => {
      render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Show tooltip
      fireEvent.mouseEnter(indicator);

      const tooltip = screen.getByRole('tooltip');

      expect(tooltip).toHaveClass('text-white');
    });

    it('should have rounded corners', () => {
      const { container } = render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Show tooltip
      fireEvent.mouseEnter(indicator);

      const tooltip = screen.getByRole('tooltip');

      expect(tooltip).toHaveClass('rounded-lg');
    });

    it('should have shadow', () => {
      const { container } = render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Show tooltip
      fireEvent.mouseEnter(indicator);

      const tooltip = screen.getByRole('tooltip');

      expect(tooltip).toHaveClass('shadow-lg');
    });

    it('should have padding', () => {
      const { container } = render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Show tooltip
      fireEvent.mouseEnter(indicator);

      const tooltip = screen.getByRole('tooltip');

      expect(tooltip).toHaveClass('px-3', 'py-2');
    });

    it('should have small text size', () => {
      const { container } = render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Show tooltip
      fireEvent.mouseEnter(indicator);

      const tooltip = screen.getByRole('tooltip');

      expect(tooltip).toHaveClass('text-xs');
    });
  });

  describe('Tooltip content layout', () => {
    it('should not wrap text (whitespace-nowrap)', () => {
      const { container } = render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Show tooltip
      fireEvent.mouseEnter(indicator);

      const tooltip = screen.getByRole('tooltip');

      expect(tooltip).toHaveClass('whitespace-nowrap');
    });

    it('should display percentage and explanation on same line or properly formatted', () => {
      render(<FocalPointIndicator focalPoint={65} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Show tooltip
      fireEvent.mouseEnter(indicator);

      const tooltip = screen.getByRole('tooltip');

      // Should contain both pieces of information
      expect(tooltip).toHaveTextContent('Focal Point: 65%');
      expect(tooltip).toHaveTextContent('Optimal reading area during recording');
    });
  });

  describe('Percentage label styling', () => {
    it('should appear on hover near the indicator', () => {
      render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Show percentage label
      fireEvent.mouseEnter(indicator);

      // Should show percentage label
      const label = screen.getByText('50%');
      expect(label).toBeInTheDocument();
    });

    it('should have yellow background', () => {
      render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Show percentage label
      fireEvent.mouseEnter(indicator);

      const label = screen.getByText('50%');
      expect(label).toHaveClass('bg-yellow-400');
    });

    it('should have dark text for contrast', () => {
      render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Show percentage label
      fireEvent.mouseEnter(indicator);

      const label = screen.getByText('50%');
      expect(label).toHaveClass('text-gray-900');
    });

    it('should have small font size', () => {
      render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Show percentage label
      fireEvent.mouseEnter(indicator);

      const label = screen.getByText('50%');
      expect(label).toHaveClass('text-[10px]');
    });

    it('should have bold font weight', () => {
      render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Show percentage label
      fireEvent.mouseEnter(indicator);

      const label = screen.getByText('50%');
      expect(label).toHaveClass('font-bold');
    });

    it('should be positioned to the right of indicator', () => {
      const { container } = render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Show percentage label
      fireEvent.mouseEnter(indicator);

      const label = screen.getByText('50%');
      expect(label).toHaveClass('right-2');
    });

    it('should be positioned slightly above indicator', () => {
      const { container } = render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Show percentage label
      fireEvent.mouseEnter(indicator);

      const label = screen.getByText('50%');
      expect(label).toHaveClass('-top-5');
    });

    it('should fade in on hover', () => {
      const { container } = render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Before hover, label should have opacity 0
      const label = screen.getByText('50%');
      expect(label).toHaveClass('opacity-0');

      // On hover, should transition to opacity 100
      expect(label).toHaveClass('group-hover:opacity-100');
      expect(label).toHaveClass('transition-opacity');
    });
  });

  describe('Indicator line visual appearance', () => {
    it('should be a thin horizontal line', () => {
      const { container } = render(<FocalPointIndicator focalPoint={50} />);

      const line = container.querySelector('.h-0\\.5');
      expect(line).toBeInTheDocument();
    });

    it('should span full width', () => {
      const { container } = render(<FocalPointIndicator focalPoint={50} />);

      const line = container.querySelector('.left-0.right-0');
      expect(line).toBeInTheDocument();
    });

    it('should be yellow color', () => {
      const { container } = render(<FocalPointIndicator focalPoint={50} />);

      const line = container.querySelector('.bg-yellow-400');
      expect(line).toBeInTheDocument();
    });

    it('should have slight transparency', () => {
      const { container } = render(<FocalPointIndicator focalPoint={50} />);

      const line = container.querySelector('.opacity-80');
      expect(line).toBeInTheDocument();
    });

    it('should have glow effect', () => {
      const { container } = render(<FocalPointIndicator focalPoint={50} />);

      const glow = container.querySelector('.blur-sm');
      expect(glow).toBeInTheDocument();
      expect(glow).toHaveClass('bg-yellow-400');
      expect(glow).toHaveClass('opacity-50');
    });
  });

  describe('z-index layering', () => {
    it('should have tooltip above other content', () => {
      const { container } = render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Show tooltip
      fireEvent.mouseEnter(indicator);

      const tooltip = screen.getByRole('tooltip');

      // Should have high z-index
      expect(tooltip).toHaveClass('z-50');
    });

    it('should have percentage label above indicator', () => {
      render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Show percentage label
      fireEvent.mouseEnter(indicator);

      // Should be visible above indicator
      const label = screen.getByText('50%');
      expect(label).toBeInTheDocument();
    });
  });

  describe('Pointer events', () => {
    it('should prevent pointer events on tooltip', () => {
      const { container } = render(<FocalPointIndicator focalPoint={50} />);

      const indicator = screen.getByRole('presentation', { hidden: true });

      // Show tooltip
      fireEvent.mouseEnter(indicator);

      const tooltip = screen.getByRole('tooltip');

      // Should not capture pointer events
      expect(tooltip).toHaveClass('pointer-events-none');
    });
  });
});
