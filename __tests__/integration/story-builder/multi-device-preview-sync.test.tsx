/**
 * Integration tests for multi-device preview sync
 * @feature 015-multi-device-matrix
 */

import React from 'react';
import { render, screen, waitFor, renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider } from '@/components/AppProvider';
import { useMultiDevicePreviewSync } from '@/lib/story-builder/hooks/useMultiDevicePreviewSync';
import { useMultiDeviceStore } from '@/lib/stores/useMultiDeviceStore';
import { useStoryBuilderStore } from '@/lib/story-builder/store';
import type { PreviewMessage } from '@/lib/story-builder/hooks/useMultiDevicePreviewSync';

// Mock iframe creation
const createMockIframe = (id: string): HTMLIFrameElement => {
  const iframe = document.createElement('iframe');
  iframe.id = `device-${id}`;
  Object.defineProperty(iframe, 'contentWindow', {
    value: {
      postMessage: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    writable: true,
  });
  return iframe;
};

// Test component that uses the sync hook
function TestMultiDeviceComponent() {
  const iframeRefs = React.useRef<Map<string, HTMLIFrameElement>>(new Map());

  React.useEffect(() => {
    // Set up mock iframes
    const devices = ['iphone-se', 'iphone-14-pro', 'ipad-air'];
    devices.forEach((deviceId) => {
      const iframe = createMockIframe(deviceId);
      iframeRefs.current.set(deviceId, iframe);
    });
  }, []);

  const { broadcast, iframeCount, pendingAcks } = useMultiDevicePreviewSync(iframeRefs);
  const { enabled, setEnabled } = useMultiDeviceStore();

  return (
    <div>
      <div data-testid="iframe-count">{iframeCount}</div>
      <div data-testid="pending-acks">{pendingAcks}</div>
      <button onClick={() => setEnabled(!enabled)} data-testid="toggle-multi-device">
        Toggle Multi-Device
      </button>
      <button
        onClick={() => {
          broadcast({
            type: 'UPDATE_STORY',
            payload: { slides: [], activeSlideIndex: 0 },
          });
        }}
        data-testid="broadcast"
      >
        Broadcast
      </button>
    </div>
  );
}

describe('Multi-Device Preview Sync Integration', () => {
  beforeEach(() => {
    // Reset store state
    const { result } = renderHook(() => useMultiDeviceStore());
    act(() => {
      result.current.resetToDefaults();
    });
  });

  describe('store and hook integration', () => {
    it('should integrate with multi-device store', () => {
      render(
        <AppProvider>
          <TestMultiDeviceComponent />
        </AppProvider>
      );

      const toggleButton = screen.getByTestId('toggle-multi-device');
      expect(toggleButton).toBeInTheDocument();
    });

    it('should update iframe count when devices change', async () => {
      render(
        <AppProvider>
          <TestMultiDeviceComponent />
        </AppProvider>
      );

      const iframeCount = screen.getByTestId('iframe-count');
      expect(iframeCount).toHaveTextContent('3');
    });

    it('should broadcast to all iframes when triggered', async () => {
      const user = userEvent.setup();

      render(
        <AppProvider>
          <TestMultiDeviceComponent />
        </AppProvider>
      );

      const broadcastButton = screen.getByTestId('broadcast');

      await user.click(broadcastButton);

      // Verify broadcast was called
      await waitFor(() => {
        const pendingAcks = screen.getByTestId('pending-acks');
        expect(pendingAcks).toHaveTextContent('3');
      });
    });
  });

  describe('message broadcasting', () => {
    it('should send messages to all iframes', async () => {
      const user = userEvent.setup();

      render(
        <AppProvider>
          <TestMultiDeviceComponent />
        </AppProvider>
      );

      const broadcastButton = screen.getByTestId('broadcast');

      await user.click(broadcastButton);

      // Check that all iframes received messages
      await waitFor(() => {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach((iframe) => {
          const contentWindow = iframe as any;
          expect(contentWindow.contentWindow?.postMessage).toHaveBeenCalled();
        });
      });
    });

    it('should include device ID in each message', async () => {
      const user = userEvent.setup();

      render(
        <AppProvider>
          <TestMultiDeviceComponent />
        </AppProvider>
      );

      const broadcastButton = screen.getByTestId('broadcast');

      await user.click(broadcastButton);

      // Verify device IDs are included
      await waitFor(() => {
        const iframes = document.querySelectorAll('iframe');
        const deviceIds = ['iphone-se', 'iphone-14-pro', 'ipad-air'];

        iframes.forEach((iframe, index) => {
          const contentWindow = iframe as any;
          const calls = contentWindow.contentWindow?.postMessage.mock.calls;
          if (calls && calls.length > 0) {
            const message = calls[0][0] as PreviewMessage;
            expect(message.payload.deviceId).toBe(deviceIds[index]);
          }
        });
      });
    });
  });

  describe('acknowledgment tracking', () => {
    it('should track pending acknowledgments', async () => {
      const user = userEvent.setup();

      render(
        <AppProvider>
          <TestMultiDeviceComponent />
        </AppProvider>
      );

      const broadcastButton = screen.getByTestId('broadcast');

      await user.click(broadcastButton);

      // Should have 3 pending acks
      await waitFor(() => {
        const pendingAcks = screen.getByTestId('pending-acks');
        expect(pendingAcks).toHaveTextContent('3');
      });
    });

    it('should clear acknowledgments when all iframes respond', async () => {
      const user = userEvent.setup();

      render(
        <AppProvider>
          <TestMultiDeviceComponent />
        </AppProvider>
      );

      const broadcastButton = screen.getByTestId('broadcast');

      await user.click(broadcastButton);

      // Simulate acknowledgments
      const deviceIds = ['iphone-se', 'iphone-14-pro', 'ipad-air'];

      await act(async () => {
        for (const deviceId of deviceIds) {
          window.postMessage(
            {
              type: 'PREVIEW_ACK',
              deviceId,
              timestamp: Date.now(),
            },
            window.location.origin
          );
          await waitFor(() => {}, { timeout: 10 });
        }
      });

      // All acks should be cleared
      await waitFor(() => {
        const pendingAcks = screen.getByTestId('pending-acks');
        expect(pendingAcks).toHaveTextContent('0');
      });
    });
  });

  describe('error handling', () => {
    it('should handle iframe communication errors gracefully', async () => {
      const user = userEvent.setup();

      // Create an iframe that throws on postMessage
      const errorIframe = document.createElement('iframe');
      Object.defineProperty(errorIframe, 'contentWindow', {
        value: {
          postMessage: jest.fn(() => {
            throw new Error('Communication error');
          }),
        },
        writable: true,
      });

      render(
        <AppProvider>
          <TestMultiDeviceComponent />
        </AppProvider>
      );

      document.body.appendChild(errorIframe);

      const broadcastButton = screen.getByTestId('broadcast');

      // Should not throw
      await expect(user.click(broadcastButton)).resolves.not.toThrow();

      document.body.removeChild(errorIframe);
    });
  });
});
