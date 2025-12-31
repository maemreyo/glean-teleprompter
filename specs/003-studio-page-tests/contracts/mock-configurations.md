# Mock Configurations: Studio Page Testing

**Feature**: Studio Page Core Module Testing  
**Date**: 2025-12-31  
**Status**: Complete

## Overview

This document provides ready-to-use mock configurations for testing the Studio page. These mocks are pre-configured for common test scenarios.

---

## Global Mock Setup

### jest.setup.js Extensions

Add to existing [`jest.setup.js`](../../jest.setup.js):

```javascript
// Studio page test mocks
import { setupStudioPageMocks } from './__tests__/utils/studio-page-mocks';

beforeEach(() => {
  setupStudioPageMocks();
});
```

---

## Store Mocks

### Teleprompter Store Mock

```typescript
// __tests__/mocks/stores/teleprompter-store.mock.ts

import { jest } from '@jest/globals';

export const createMockTeleprompterStore = (overrides = {}) => ({
  text: '',
  bgUrl: '',
  musicUrl: '',
  font: 'Classic',
  colorIndex: 0,
  speed: 2,
  fontSize: 48,
  align: 'center',
  lineHeight: 1.5,
  margin: 0,
  overlayOpacity: 0.5,
  mode: 'setup',
  isReadOnly: false,
  setText: jest.fn(),
  setBgUrl: jest.fn(),
  setMusicUrl: jest.fn(),
  setAll: jest.fn(),
  ...overrides
});

// Reset store state between tests
export const resetTeleprompterStore = () => {
  const store = createMockTeleprompterStore();
  store.setText.mockClear();
  store.setBgUrl.mockClear();
  store.setMusicUrl.mockClear();
  store.setAll.mockClear();
  return store;
};
```

### Config Store Mock

```typescript
// __tests__/mocks/stores/config-store.mock.ts

import { jest } from '@jest/globals';

export const createMockConfigStore = (overrides = {}) => ({
  typography: {
    fontFamily: 'Classic',
    fontSize: 48,
    lineHeight: 1.5,
    align: 'center'
  },
  colors: {
    colorIndex: 0
  },
  effects: {
    shadow: { enabled: false },
    glow: { enabled: false, color: '#00ffff' }
  },
  setAll: jest.fn(),
  getState: jest.fn(() => ({})),
  ...overrides
});

export const resetConfigStore = () => {
  const store = createMockConfigStore();
  store.setAll.mockClear();
  store.getState.mockClear();
  return store;
};
```

### Demo Store Mock

```typescript
// __tests__/mocks/stores/demo-store.mock.ts

import { jest } from '@jest/globals';

export const createMockDemoStore = (overrides = {}) => ({
  isDemoMode: false,
  setDemoMode: jest.fn(),
  ...overrides
});

export const resetDemoStore = () => {
  const store = createMockDemoStore();
  store.setDemoMode.mockClear();
  return store;
};
```

---

## React Hook Mocks

### useTeleprompterStore Mock

```typescript
// __tests__/mocks/hooks/use-teleprompter-store.mock.ts

import { renderHook } from '@testing-library/react';
import { createMockTeleprompterStore } from '../stores/teleprompter-store.mock';

let mockStore = createMockTeleprompterStore();

export const mockUseTeleprompterStore = () => mockStore;

export const setMockTeleprompterStore = (store: ReturnType<typeof createMockTeleprompterStore>) => {
  mockStore = store;
};

export const resetMockTeleprompterStore = () => {
  mockStore = createMockTeleprompterStore();
};

jest.mock('@/stores/useTeleprompterStore', () => ({
  useTeleprompterStore: () => mockUseTeleprompterStore()
}));
```

### useConfigStore Mock

```typescript
// __tests__/mocks/hooks/use-config-store.mock.ts

import { createMockConfigStore } from '../stores/config-store.mock';

let mockStore = createMockConfigStore();

export const mockUseConfigStore = () => mockStore;

export const setMockConfigStore = (store: ReturnType<typeof createMockConfigStore>) => {
  mockStore = store;
};

export const resetMockConfigStore = () => {
  mockStore = createMockConfigStore();
};

jest.mock('@/lib/stores/useConfigStore', () => ({
  useConfigStore: () => mockUseConfigStore()
}));
```

### useDemoStore Mock

```typescript
// __tests__/mocks/hooks/use-demo-store.mock.ts

import { createMockDemoStore } from '../stores/demo-store.mock';

let mockStore = createMockDemoStore();

export const mockUseDemoStore = () => mockStore;

export const setMockDemoStore = (store: ReturnType<typeof createMockDemoStore>) => {
  mockStore = store;
};

export const resetMockDemoStore = () => {
  mockStore = createMockDemoStore();
};

jest.mock('@/stores/useDemoStore', () => ({
  useDemoStore: () => mockUseDemoStore()
}));
```

---

## Next.js Mocks

### next/navigation Mock

```typescript
// __tests__/mocks/next-navigation.mock.ts

import { jest } from '@jest/globals';

type SearchParamsValue = string | null;
type SearchParamsMap = Map<string, SearchParamsValue>;

let mockSearchParams: SearchParamsMap = new Map();

export const setSearchParams = (params: Record<string, SearchParamsValue>) => {
  mockSearchParams = new Map(Object.entries(params));
};

export const getSearchParams = () => mockSearchParams;

export const resetSearchParams = () => {
  mockSearchParams = new Map();
};

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams.get(key) || null,
    has: (key: string) => mockSearchParams.has(key),
    entries: () => mockSearchParams.entries(),
    keys: () => mockSearchParams.keys(),
    values: () => mockSearchParams.values(),
    forEach: (callback: (value: string, key: string) => void) => {
      mockSearchParams.forEach(callback);
    },
    toString: () => {
      const params = Array.from(mockSearchParams.entries())
        .filter(([_, v]) => v !== null)
        .map(([k, v]) => `${k}=${v}`)
        .join('&');
      return params ? `?${params}` : '';
    }
  })
}));
```

---

## Utility Mocks

### Toast Mock (sonner)

```typescript
// __tests__/mocks/toast.mock.ts

import { jest } from '@jest/globals';

export const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
  promise: jest.fn()
};

export const expectToastSuccess = (message: string | RegExp) => {
  expect(mockToast.success).toHaveBeenCalledWith(
    expect.stringMatching(message)
  );
};

export const expectToastError = (message: string | RegExp) => {
  expect(mockToast.error).toHaveBeenCalledWith(
    expect.stringMatching(message)
  );
};

export const expectNoToasts = () => {
  expect(mockToast.success).not.toHaveBeenCalled();
  expect(mockToast.error).not.toHaveBeenCalled();
};

export const clearToastMocks = () => {
  mockToast.success.mockClear();
  mockToast.error.mockClear();
  mockToast.info.mockClear();
  mockToast.warning.mockClear();
  mockToast.promise.mockClear();
};

jest.mock('sonner', () => ({
  toast: mockToast,
  Toaster: () => null // Don't render the Toaster component in tests
}));
```

### localStorage Mock

```typescript
// __tests__/mocks/local-storage.mock.ts

import { jest } from '@jest/globals';

const createLocalStorageMock = () => {
  const store = new Map<string, string>();
  
  return {
    getItem: jest.fn((key: string) => store.get(key) || null),
    setItem: jest.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: jest.fn((key: string) => {
      store.delete(key);
    }),
    clear: jest.fn(() => {
      store.clear();
    }),
    get length() {
      return store.size;
    },
    key: jest.fn((index: number) => {
      const keys = Array.from(store.keys());
      return keys[index] || null;
    }),
    
    // Error simulation helpers
    simulateQuotaExceeded: () => {
      store.clear();
      store.setItem.mockImplementation(() => {
        throw new DOMException('QuotaExceededError');
      });
    },
    simulateCorruptedData: (key: string, data: string) => {
      store.set(key, data);
    },
    simulateDisabled: () => {
      store.clear();
      store.getItem.mockImplementation(() => {
        throw new Error('localStorage is disabled');
      });
      store.setItem.mockImplementation(() => {
        throw new Error('localStorage is disabled');
      });
    },
    reset: () => {
      store.clear();
      store.getItem.mockClear();
      store.setItem.mockClear();
      store.removeItem.mockClear();
      store.clear.mockClear();
      store.key.mockClear();
    }
  };
};

export const mockLocalStorage = createLocalStorageMock();

// Store methods are already spied via jest.fn()
export const spyOnLocalStorage = () => ({
  getItem: mockLocalStorage.getItem,
  setItem: mockLocalStorage.setItem,
  removeItem: mockLocalStorage.removeItem,
  clear: mockLocalStorage.clear,
  key: mockLocalStorage.key
});

// Assertion helpers
export const expectStored = (key: string, value: string) => {
  expect(mockLocalStorage.setItem).toHaveBeenCalledWith(key, value);
};

export const expectNotStored = (key: string) => {
  expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith(
    key,
    expect.any(String)
  );
};

export const expectRetrieved = (key: string, times = 1) => {
  expect(mockLocalStorage.getItem).toHaveBeenCalledTimes(times);
  expect(mockLocalStorage.getItem).toHaveBeenCalledWith(key);
};

export const getStoredValue = (key: string) => {
  return mockLocalStorage.getItem(key);
};

export const resetLocalStorage = () => {
  mockLocalStorage.reset();
};
```

---

## Component Mocks

### Framer Motion Mock

```typescript
// __tests__/mocks/framer-motion.mock.ts

import { ReactElement } from 'react';
import { jest } from '@jest/globals';

export const mockAnimatePresence = ({ children, mode }: any) => {
  return <>{children}</>;
};

export const mockMotionDiv = ({ children, ...props }: any) => {
  return <div {...props}>{children}</div>;
};

jest.mock('framer-motion', () => ({
  AnimatePresence: mockAnimatePresence,
  motion: {
    div: mockMotionDiv
  }
}));

// Transition helpers for tests
export const waitForTransition = async (ms = 500) => {
  await new Promise(resolve => setTimeout(resolve, ms));
};
```

---

## Action Mocks

### loadScriptAction Mock

```typescript
// __tests__/mocks/actions/load-script-action.mock.ts

import { jest } from '@jest/globals';

interface ScriptActionResult {
  success: boolean;
  error?: string;
  script?: {
    content: string;
    bg_url: string;
    music_url: string;
    config?: Record<string, unknown>;
    settings?: {
      font: string;
      colorIndex: number;
      speed: number;
      fontSize: number;
      align: string;
      lineHeight: number;
      margin: number;
      overlayOpacity: number;
    };
  };
}

let mockResult: ScriptActionResult = { success: false, error: 'Not mocked' };
let mockDelay = 0;

export const mockLoadScriptAction = jest.fn(
  async (scriptId: string): Promise<ScriptActionResult> => {
    if (mockDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, mockDelay));
    }
    return mockResult;
  }
);

// Test control methods
export const setMockScriptResult = (result: ScriptActionResult) => {
  mockResult = result;
};

export const setMockScriptError = (error: string) => {
  mockResult = { success: false, error };
};

export const setMockScriptDelay = (ms: number) => {
  mockDelay = ms;
};

export const resetLoadScriptAction = () => {
  mockResult = { success: false, error: 'Not mocked' };
  mockDelay = 0;
  mockLoadScriptAction.mockClear();
};

jest.mock('@/actions/scripts', () => ({
  loadScriptAction: mockLoadScriptAction
}));
```

### getTemplateById Mock

```typescript
// __tests__/mocks/actions/get-template-by-id.mock.ts

import { jest } from '@jest/globals';

interface TemplateResult {
  id: string;
  name: string;
  content: string;
  settings: {
    font: 'Classic' | 'Modern' | 'Typewriter' | 'Novel' | 'Neon';
    colorIndex?: number;
    speed?: number;
    fontSize?: number;
    align?: 'left' | 'center';
    lineHeight?: number;
    margin?: number;
    overlayOpacity?: number;
  };
}

let mockTemplate: TemplateResult | null = null;

export const mockGetTemplateById = jest.fn(
  (templateId: string): TemplateResult | null => {
    return mockTemplate;
  }
);

// Test control methods
export const setMockTemplate = (template: TemplateResult) => {
  mockTemplate = template;
};

export const setMockTemplateNull = () => {
  mockTemplate = null;
};

export const resetGetTemplateById = () => {
  mockTemplate = null;
  mockGetTemplateById.mockClear();
};

jest.mock('@/lib/templates/templateConfig', () => ({
  getTemplateById: mockGetTemplateById
}));
```

---

## Complete Mock Setup Function

```typescript
// __tests__/utils/studio-page-mocks.ts

export const setupStudioPageMocks = () => {
  // Reset all mocks before each test
  resetMockTeleprompterStore();
  resetMockConfigStore();
  resetMockDemoStore();
  resetSearchParams();
  clearToastMocks();
  resetLocalStorage();
  resetLoadScriptAction();
  resetGetTemplateById();
  
  // Use fake timers for auto-save tests
  jest.useFakeTimers();
};

export const teardownStudioPageMocks = () => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
};
```

---

## Usage Examples

### Example Test with Mocks

```typescript
import { render, screen } from '@testing-library/react';
import StudioPage from '@/app/studio/page';
import { setupStudioPageMocks } from '../utils/studio-page-mocks';
import { setSearchParams } from '../mocks/next-navigation.mock';
import { setMockTemplate } from '../mocks/actions/get-template-by-id.mock';

describe('Studio Page - Template Loading', () => {
  beforeEach(() => {
    setupStudioPageMocks();
  });

  afterEach(() => {
    teardownStudioPageMocks();
  });

  it('should load template when ?template parameter is present', async () => {
    // Arrange
    setSearchParams({ template: 'classic-news' });
    setMockTemplate({
      id: 'classic-news',
      name: 'Classic News',
      content: 'News content',
      settings: {
        font: 'Classic',
        speed: 3
      }
    });

    // Act
    render(<StudioPage />);

    // Assert
    expect(screen.getByText(/News content/)).toBeInTheDocument();
  });
});
```

---

## Summary

These mock configurations provide:

1. **Store mocks** for Zustand stores (teleprompter, config, demo)
2. **React hook mocks** for useTeleprompterStore, useConfigStore, useDemoStore
3. **Next.js mocks** for next/navigation useSearchParams
4. **Utility mocks** for toast, localStorage
5. **Component mocks** for Framer Motion AnimatePresence
6. **Action mocks** for loadScriptAction, getTemplateById

All mocks are pre-configured with helper methods for test control and assertion helpers for verification.
