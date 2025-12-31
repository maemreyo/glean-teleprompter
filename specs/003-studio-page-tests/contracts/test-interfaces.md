# Test Interfaces: Studio Page Testing

**Feature**: Studio Page Core Module Testing  
**Date**: 2025-12-31  
**Status**: Complete

## Overview

This document defines TypeScript interfaces for test utilities, mocks, and helpers used throughout the Studio page test suite.

---

## Store Mock Interfaces

### Teleprompter Store Mock

```typescript
interface MockTeleprompterStore {
  // State
  text: string;
  bgUrl: string;
  musicUrl: string;
  font: 'Classic' | 'Modern' | 'Typewriter' | 'Novel' | 'Neon';
  colorIndex: number;
  speed: number;
  fontSize: number;
  align: 'left' | 'center';
  lineHeight: number;
  margin: number;
  overlayOpacity: number;
  mode: 'setup' | 'run';
  isReadOnly: boolean;
  
  // Methods (spied/mock functions)
  setText: jest.Mock;
  setBgUrl: jest.Mock;
  setMusicUrl: jest.Mock;
  setAll: jest.Mock;
}

interface MockTeleprompterStoreFactory {
  (overrides?: Partial<MockTeleprompterStore>): MockTeleprompterStore;
}
```

### Config Store Mock

```typescript
interface MockConfigStore {
  // Config state (simplified - actual config is more complex)
  typography?: {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    align: string;
  };
  colors?: {
    colorIndex: number;
  };
  effects?: {
    shadow?: { enabled: boolean };
    glow?: { enabled: boolean; color: string };
  };
  
  // Methods
  setAll: jest.Mock;
  getState: jest.Mock;
}

interface MockConfigStoreFactory {
  (overrides?: Partial<MockConfigStore>): MockConfigStore;
}
```

### Demo Store Mock

```typescript
interface MockDemoStore {
  isDemoMode: boolean;
  setDemoMode: jest.Mock;
}
```

---

## Mock Function Interfaces

### Toast Mock

```typescript
interface MockToast {
  success: jest.Mock;
  error: jest.Mock;
  info: jest.Mock;
  warning: jest.Mock;
  promise: jest.Mock;
}

interface ToastAssertionHelpers {
  expectSuccess: (message: string | RegExp) => void;
  expectError: (message: string | RegExp) => void;
  expectNoToasts: () => void;
  clearMocks: () => void;
}
```

### localStorage Mock

```typescript
interface MockLocalStorage {
  getItem: jest.Mock;
  setItem: jest.Mock;
  removeItem: jest.Mock;
  clear: jest.Mock;
  length: number;
  key: jest.Mock;
  
  // Error simulation methods
  simulateQuotaExceeded: () => void;
  simulateCorruptedData: (key: string) => void;
  simulateDisabled: () => void;
  reset: () => void;
}

interface LocalStorageAssertionHelpers {
  expectStored: (key: string, value: any) => void;
  expectNotStored: (key: string) => void;
  expectRetrieved: (key: string, times?: number) => void;
  getStoredValue: (key: string) => string | null;
  clear: () => void;
}
```

### URL Search Params Mock

```typescript
interface MockSearchParams {
  get: jest.Mock;
  has: jest.Mock;
  entries: jest.Mock;
  keys: jest.Mock;
  values: jest.Mock;
  forEach: jest.Mock;
  toString: jest.Mock;
}

interface SearchParamsMockFactory {
  (params: Record<string, string | null>): MockSearchParams;
}
```

---

## Test Helper Interfaces

### Timer Control Interface

```typescript
interface TimerControl {
  useFakeTimers: () => void;
  useRealTimers: () => void;
  advanceTimersByTime: (ms: number) => void;
  runAllTimers: () => void;
  runOnlyPendingTimers: () => void;
  advanceTimersToNextTimer: () => number;
  clearAllTimers: () => void;
  getTimerCount: () => number;
}
```

### Render Wrapper Interface

```typescript
interface TestRenderOptions {
  mockStores?: {
    teleprompter?: Partial<MockTeleprompterStore>;
    config?: Partial<MockConfigStore>;
    demo?: Partial<MockDemoStore>;
  };
  mockSearchParams?: Record<string, string | null>;
  mockLocalStorage?: Record<string, string>;
  mockToast?: boolean;
  mockAnimatePresence?: boolean;
}

interface TestRenderResult {
  container: HTMLElement;
  baseElement: HTMLElement;
  debug: (element?: HTMLElement) => void;
  rerender: (ui: React.ReactElement) => void;
  unmount: () => void;
}
```

---

## Action Mock Interfaces

### loadScriptAction Mock

```typescript
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

interface MockLoadScriptAction {
  (scriptId: string): Promise<ScriptActionResult>;
  
  // Helper methods for test control
  __setMockResult: (result: ScriptActionResult) => void;
  __setMockError: (error: string) => void;
  __setDelay: (ms: number) => void;
  __reset: () => void;
}
```

### getTemplateById Mock

```typescript
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

interface MockGetTemplateById {
  (templateId: string): TemplateResult | null;
  
  // Helper methods for test control
  __setMockTemplate: (template: TemplateResult) => void;
  __setNull: () => void;
  __reset: () => void;
}
```

---

## Component Mock Interfaces

### Editor Component Mock

```typescript
interface MockEditor {
  displayName: string;
  render: () => React.ReactElement;
  
  // Test helpers
  __setText: (text: string) => void;
  __setMode: (mode: 'setup' | 'run') => void;
}
```

### Runner Component Mock

```typescript
interface MockRunner {
  displayName: string;
  render: () => React.ReactElement;
  
  // Test helpers
  __setMode: (mode: 'setup' | 'run') => void;
}
```

### AnimatePresence Mock

```typescript
interface MockAnimatePresence {
  displayName: string;
  render: () => React.ReactElement;
  
  // Test helpers to verify transitions
  __getExitDuration: () => number;
  __getEnterDuration: () => number;
  __waitForTransition: () => Promise<void>;
}
```

---

## Test Context Interface

### Test Suite Context

```typescript
interface StudioPageTestContext {
  // Mocks
  mocks: {
    teleprompterStore: MockTeleprompterStore;
    configStore: MockConfigStore;
    demoStore: MockDemoStore;
    toast: MockToast;
    localStorage: MockLocalStorage;
    searchParams: MockSearchParams;
    loadScriptAction: MockLoadScriptAction;
    getTemplateById: MockGetTemplateById;
  };
  
  // Helpers
  helpers: {
    toast: ToastAssertionHelpers;
    localStorage: LocalStorageAssertionHelpers;
    timers: TimerControl;
  };
  
  // State
  state: {
    currentTestName: string;
    timerCallbacks: Set<() => void>;
  };
}
```

---

## Assertion Helper Interfaces

### Component Rendering Assertions

```typescript
interface ComponentAssertions {
  expectEditorRendered: () => void;
  expectRunnerRendered: () => void;
  expectComponentNotRendered: (component: 'Editor' | 'Runner') => void;
  expectSuspenseFallback: () => void;
}
```

### Store Assertions

```typescript
interface StoreAssertions {
  expectStoreMethodCalled: (
    store: 'teleprompter' | 'config' | 'demo',
    method: string,
    times?: number
  ) => void;
  expectStoreMethodCalledWith: (
    store: 'teleprompter' | 'config' | 'demo',
    method: string,
    ...args: any[]
  ) => void;
  expectStoreState: (store: 'teleprompter' | 'config', state: any) => void;
}
```

### Initialization Assertions

```typescript
interface InitializationAssertions {
  expectInitializedOnce: () => void;
  expectDemoModeDisabled: () => void;
  expectInitializationCount: (count: number) => void;
}
```

---

## Test File Interfaces

### Test File Metadata

```typescript
interface TestFileMetadata {
  fileName: string;
  userStory: string;
  priority: 'P1' | 'P2' | 'P3';
  requirementsCovered: string[];
  successCriteriaCovered: string[];
}

interface TestSuiteDefinition {
  metadata: TestFileMetadata;
  setup: () => void;
  teardown: () => void;
  tests: TestCase[];
}
```

### Test Case Interface

```typescript
interface TestCase {
  name: string;
  scenario: string;
  given: string;
  when: string;
  then: string;
  test: () => Promise<void> | void;
  tags?: string[];
  requirements?: string[];
}
```

---

## Summary

These interfaces provide:

1. **Type-safe mock definitions** for all external dependencies
2. **Helper interfaces** for common test operations
3. **Assertion interfaces** for verifying expected behaviors
4. **Test organization interfaces** for structuring test suites

All interfaces are designed to work with Jest 29+ and React Testing Library 13+, aligning with the project's testing infrastructure.
