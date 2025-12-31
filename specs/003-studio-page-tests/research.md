# Research: Studio Page Testing Approach

**Feature**: Studio Page Core Module Testing  
**Date**: 2025-12-31  
**Status**: Complete

## Overview

This document consolidates research findings for testing the Studio page ([`app/studio/page.tsx`](../../app/studio/page.tsx)). All technical decisions are documented here with rationale.

---

## Testing Framework Decision

### Decision: Jest 29+ + React Testing Library 13+

**Rationale**:
- **Existing Infrastructure**: Project already uses Jest 29+ and React Testing Library 13+ (see [`jest.config.js`](../../jest.config.js), [`jest.setup.js`](../../jest.setup.js))
- **Constitution Alignment**: Complies with Principle IV (Code Quality & Testing) requiring TypeScript strict mode and comprehensive testing
- **Team Familiarity**: Established test patterns exist in `__tests__/integration/config-preview/` and `__tests__/examples/config-preview/`
- **User-Centric**: RTL promotes testing from user's perspective, aligning with Principle I (User Experience First)

**Alternatives Considered**:

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Vitest | Faster execution, native ESM | Requires migration of entire test suite | Migration cost outweighs benefits for this feature |
| Cypress | Excellent E2E testing | Overkill for unit/integration tests, slower feedback loop | Better suited for full user journey tests, not component logic |
| Playwright | Modern, cross-browser | Similar to Cypress - better for E2E | Not needed for component-level testing |

---

## Mocking Strategy

### Decision: Custom Mock Utilities with Factory Pattern

**Rationale**:
- **Zustand Stores**: No built-in Jest support, requires custom mocking with `jest.fn()` implementations
- **localStorage**: jsdom provides implementation but needs controlled behavior for testing edge cases
- **Framer Motion**: `AnimatePresence` needs mock to avoid animation complexity in tests
- **Async Operations**: `loadScriptAction` needs controlled timing and predictable results

**Implementation Pattern**:

```typescript
// Factory function for creating mock stores
const createMockTeleprompterStore = (overrides = {}) => ({
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
```

**Alternatives Considered**:

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Manual mocks in __mocks__ | Automatic loading | Hard to customize per test | Too rigid for diverse test scenarios |
| Mock Service Worker | Realistic network mocking | Overkill for component tests | Adds unnecessary complexity |

---

## Test Organization Strategy

### Decision: Split by User Story with Shared Utilities

**Rationale**:
- **Alignment with Spec**: Each user story gets focused test file, matching spec structure
- **Maintainability**: Smaller files are easier to navigate and debug
- **Independent Testing**: Each test file can run independently
- **Clear Coverage Mapping**: Easy to verify all requirements have tests

**File Structure**:

```
__tests__/integration/studio/
├── initialization.test.tsx        # User Story 1: Initial Page Load
├── template-loading.test.tsx      # User Story 2: Template Loading
├── script-loading.test.tsx        # User Story 3: Script Loading
├── local-draft.test.tsx          # User Story 4: Local Draft & Auto-Save
└── mode-switching.test.tsx        # User Story 5: Mode Switching
```

**Alternatives Considered**:

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Single monolithic file | All tests in one place | Hard to navigate, slow to run | Violates maintainability principle |
| One file per requirement | Very granular | Loses user story context, too many files | Over-fragmentation makes discovery hard |

---

## Timer Control Strategy

### Decision: Jest Fake Timers with Manual Advancement

**Rationale**:
- **Auto-Save Tests**: Need to control 5-second intervals without actually waiting
- **Deterministic**: Tests run faster and are flake-free
- **Precision**: Can verify exact timing with `jest.advanceTimersByTime()`

**Implementation Pattern**:

```typescript
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test('auto-saves after 5 seconds', () => {
  // Trigger state change
  // Advance time by 5 seconds
  jest.advanceTimersByTime(5000);
  // Verify localStorage was called
  expect(localStorage.setItem).toHaveBeenCalledWith(...);
});
```

**Alternatives Considered**:

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Real timers | Tests actual timing | Slow, flaky | Unacceptable for CI/CD |
| No timer tests | Simpler | Can't test auto-save | Would miss critical functionality |

---

## URL Parameter Testing Strategy

### Decision: Mock `next/navigation` with Custom Router

**Rationale**:
- **Next.js App Router**: `useSearchParams()` requires mock
- **Controlled Testing**: Need to simulate different URL states
- **React Context**: `next/navigation` uses React context, needs proper mock structure

**Implementation Pattern**:

```typescript
const mockSearchParams = new Map([['template', 'test-template']]);

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams.get(key) || null
  })
}));
```

**Alternatives Considered**:

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Render with different routes | More realistic | Requires Next.js routing setup | Too complex for component tests |
| Query string parsing | Simpler | Doesn't test actual hook | Doesn't verify real implementation |

---

## Store Integration Testing Strategy

### Decision: Spy on Real Stores with Controlled State

**Rationale**:
- **Integration Tests**: Should use real store logic where possible
- **State Control**: Initialize stores with known state for each test
- **Verification**: Spy on store methods to verify calls
- **Reset**: Clear store state between tests

**Implementation Pattern**:

```typescript
import { useTeleprompterStore } from '@/stores/useTeleprompterStore';

const createSpiedStore = () => {
  const store = useTeleprompterStore.getState();
  return {
    ...store,
    setText: jest.spyOn(store, 'setText'),
    setAll: jest.spyOn(store, 'setAll')
  };
};

beforeEach(() => {
  useTeleprompterStore.setState({ text: '', mode: 'setup' });
});
```

**Alternatives Considered**:

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Fully mocked stores | Complete isolation | Doesn't test real store logic | Misses integration bugs |
| Real stores without spies | Tests real behavior | Hard to verify calls | Makes assertions difficult |

---

## Toast Notification Testing Strategy

### Decision: Mock `sonner` Toast with Verification Helpers

**Rationale**:
- **User Feedback**: Toasts are critical user-facing notifications (Principle I)
- **Verification**: Need to assert correct toasts appear
- **Timing**: SC-013 requires toasts appear within 200ms

**Implementation Pattern**:

```typescript
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  },
  Toaster: () => null
}));

// Helper to verify toast calls
const expectToastSuccess = (message: string) => {
  expect(toast.success).toHaveBeenCalledWith(
    expect.stringContaining(message)
  );
};
```

**Alternatives Considered**:

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Don't test toasts | Simpler | Misses critical user feedback | Violates Principle I (UX) |
| Test DOM for toasts | More realistic | Fragile, implementation-dependent | Breaks when toast library changes |

---

## localStorage Testing Strategy

### Decision: Spy on jsdom localStorage with Error Injection

**Rationale**:
- **jsdom Support**: Jest environment includes localStorage implementation
- **Error Testing**: Need to test quota exceeded and parse errors
- **Verification**: Spy on `getItem` and `setItem` calls

**Implementation Pattern**:

```typescript
const mockLocalStorage = {
  getItem: jest.spyOn(Storage.prototype, 'getItem'),
  setItem: jest.spyOn(Storage.prototype, 'setItem'),
  
  // Simulate quota exceeded error
  simulateQuotaExceeded: () => {
    Storage.prototype.setItem.mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
  },
  
  // Simulate corrupted data
  simulateCorruptedData: () => {
    Storage.prototype.getItem.mockReturnValue('{invalid json');
  }
};
```

**Alternatives Considered**:

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Don't test errors | Simpler | Misses edge cases | Spec requires error handling tests |
| Custom localStorage mock | More control | Reimplementing jsdom | Unnecessary complexity |

---

## Coverage Requirements

### Decision: 100% Branch Coverage with Istanbul Reports

**Rationale**:
- **Constitutional Requirement**: Principle IV requires comprehensive testing
- **Success Criterion**: SC-015 explicitly requires 100% coverage
- **Quality Assurance**: All code paths including error handling must be tested

**Implementation**:

```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'app/studio/page.tsx',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  }
};
```

---

## Summary of Decisions

| Decision | Key Benefit | Constitutional Alignment |
|----------|-------------|-------------------------|
| Jest + RTL | Existing infrastructure, user-centric | IV: Code Quality & Testing, I: UX First |
| Custom mock factories | Flexible, maintainable | IV: Clean architecture |
| Split by user story | Aligned with spec, maintainable | IV: Clear organization |
| Fake timers | Fast, deterministic | II: Performance & Reliability |
| Spy on real stores | Tests integration | IV: Comprehensive testing |
| Toast verification | User feedback validated | I: UX First |
| localStorage spies | Error testing | III: Security (error handling) |
| 100% coverage | All paths tested | IV: Comprehensive testing |

All decisions align with constitutional principles and support the success criteria defined in the specification.
