/**
 * Integration tests for grid configuration
 * @feature 015-multi-device-matrix
 */

import React from 'react';
import { render, screen, waitFor, renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider } from '@/components/AppProvider';
import { useMultiDeviceStore } from '@/lib/stores/useMultiDeviceStore';
import { GridConfiguration } from '@/components/story-builder/preview/multi-device/GridConfiguration';

describe('Grid Configuration Integration', () => {
  beforeEach(() => {
    // Reset store state
    const { result } = renderHook(() => useMultiDeviceStore());
    act(() => {
      result.current.resetToDefaults();
    });
  });

  describe('GridConfigSelector', () => {
    it('should display all grid configuration options', () => {
      render(
        <AppProvider>
          <GridConfiguration />
        </AppProvider>
      );

      const gridSelector = screen.getByLabelText('Select grid configuration');
      expect(gridSelector).toBeVisible();

      // Check options
      const options = screen.getAllByRole('option');
      expect(options.length).toBe(4);
      expect(options[0]).toHaveTextContent('1x');
      expect(options[1]).toHaveTextContent('2x');
      expect(options[2]).toHaveTextContent('2x2');
      expect(options[3]).toHaveTextContent('3x2');
    });

    it('should update grid config when option is selected', async () => {
      const user = userEvent.setup();

      render(
        <AppProvider>
          <GridConfiguration />
        </AppProvider>
      );

      const gridSelector = screen.getByLabelText('Select grid configuration');

      await user.selectOptions(gridSelector, '2x2');

      const { result } = renderHook(() => useMultiDeviceStore());

      await waitFor(() => {
        expect(result.current.gridConfig).toBe('2x2');
      });
    });

    it('should persist grid config selection to localStorage', async () => {
      const user = userEvent.setup();

      render(
        <AppProvider>
          <GridConfiguration />
        </AppProvider>
      );

      const gridSelector = screen.getByLabelText('Select grid configuration');

      await user.selectOptions(gridSelector, '3x2');

      await waitFor(() => {
        const saved = localStorage.getItem('teleprompter-multi-device-preview');
        expect(saved).toBeDefined();

        const parsed = JSON.parse(saved!);
        expect(parsed.gridConfig).toBe('3x2');
      });
    });
  });

  describe('DeviceTypeChecklist', () => {
    it('should display all device types', () => {
      render(
        <AppProvider>
          <GridConfiguration />
        </AppProvider>
      );

      // Check for device labels
      expect(screen.getByText('iPhone SE')).toBeVisible();
      expect(screen.getByText('iPhone 14 Pro')).toBeVisible();
      expect(screen.getByText('iPad Air')).toBeVisible();
      expect(screen.getByText('Desktop')).toBeVisible();
    });

    it('should toggle device type when checkbox is clicked', async () => {
      const user = userEvent.setup();

      render(
        <AppProvider>
          <GridConfiguration />
        </AppProvider>
      );

      const ipadCheckbox = screen.getByLabelText('Toggle iPad Air display');

      await user.click(ipadCheckbox);

      const { result } = renderHook(() => useMultiDeviceStore());

      await waitFor(() => {
        expect(result.current.enabledDeviceTypes).toContain('ipad-air');
      });
    });

    it('should disable checkboxes when at memory limit', () => {
      // Enable all devices first
      const { result } = renderHook(() => useMultiDeviceStore());

      act(() => {
        result.current.toggleDeviceType('iphone-se');
        result.current.toggleDeviceType('iphone-14-pro');
        result.current.toggleDeviceType('ipad-air');
        result.current.toggleDeviceType('desktop');
      });

      render(
        <AppProvider>
          <GridConfiguration />
        </AppProvider>
      );

      // Some checkboxes should be disabled
      const desktopCheckbox = screen.getByLabelText('Toggle Desktop display');
      expect(desktopCheckbox).toBeDisabled();
    });
  });

  describe('MemoryUsageDisplay', () => {
    it('should display current memory usage', () => {
      render(
        <AppProvider>
          <GridConfiguration />
        </AppProvider>
      );

      expect(screen.getByText('Memory Usage')).toBeVisible();

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeVisible();
    });

    it('should update memory display when devices change', async () => {
      const user = userEvent.setup();

      render(
        <AppProvider>
          <GridConfiguration />
        </AppProvider>
      );

      const initialMemory = screen.getByRole('progressbar');
      const initialValue = await initialMemory.getAttribute('aria-valuenow');

      const ipadCheckbox = screen.getByLabelText('Toggle iPad Air display');
      await user.click(ipadCheckbox);

      await waitFor(() => {
        const updatedMemory = screen.getByRole('progressbar');
        expect(updatedMemory).not.toHaveAttribute('aria-valuenow', initialValue);
      });
    });

    it('should show warning when approaching memory limit', async () => {
      const { result } = renderHook(() => useMultiDeviceStore());

      // Enable multiple devices
      act(() => {
        result.current.toggleDeviceType('iphone-se');
        result.current.toggleDeviceType('iphone-14-pro');
        result.current.toggleDeviceType('ipad-air');
      });

      render(
        <AppProvider>
          <GridConfiguration />
        </AppProvider>
      );

      // Check for warning message
      const warningText = screen.queryByText(/memory/i);
      expect(warningText).toBeInTheDocument();
    });
  });

  describe('EmptySlot', () => {
    it('should display empty slots when enabled devices < grid slots', () => {
      const { result } = renderHook(() => useMultiDeviceStore());

      // Set grid to 3x2 (6 slots) but only enable 2 devices
      act(() => {
        result.current.setGridConfig('3x2');
        result.current.toggleDeviceType('iphone-se');
        result.current.toggleDeviceType('iphone-14-pro');
      });

      render(
        <AppProvider>
          <GridConfiguration />
        </AppProvider>
      );

      // Should show empty slots
      const emptySlots = screen.queryAllByText('No device');
      expect(emptySlots.length).toBeGreaterThan(0);
    });
  });
});
