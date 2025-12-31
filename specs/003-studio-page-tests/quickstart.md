# Quickstart Guide: Studio Page Testing

**Feature**: Studio Page Core Module Testing  
**Date**: 2025-12-31  
**Audience**: Developers implementing or running tests

## Overview

This guide helps developers quickly understand, run, and extend the Studio page test suite. Tests cover initialization, template/script loading, localStorage persistence, and mode switching for [`app/studio/page.tsx`](../../app/studio/page.tsx).

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Running Tests](#running-tests)
3. [Test Organization](#test-organization)
4. [Writing New Tests](#writing-new-tests)
5. [Common Patterns](#common-patterns)
6. [Debugging](#debugging)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

- **Node.js**: 18+ (check with `node --version`)
- **npm**: Latest (check with `npm --version`)
- **Jest**: 29+ (configured in project)
- **TypeScript**: 5.3+ (strict mode)

### Verify Setup

```bash
# Verify Node.js version
node --version  # Should be v18+

# Verify dependencies installed
npm test -- --passWithNoTests

# Verify TypeScript
npx tsc --noEmit
```

---

## Running Tests

### Run All Studio Page Tests

```bash
# Run all tests
npm test

# Run only studio page tests
npm test -- studio

# Run with coverage
npm test -- --coverage
```

### Run Specific Test Files

```bash
# Run initialization tests
npm test -- initialization

# Run template loading tests
npm test -- template-loading

# Run script loading tests
npm test -- script-loading

# Run local draft tests
npm test -- local-draft

# Run mode switching tests
npm test -- mode-switching
```

### Run Individual Tests

```bash
# Run a specific test by name
npm test -- -t "should initialize exactly once"

# Run tests matching a pattern
npm test -- -t "template.*success"
```

### Watch Mode

```bash
# Run tests in watch mode (re-run on file changes)
npm test -- --watch

# Watch only studio page tests
npm test -- --watch --testPathPattern=studio
```

### Debug Mode

```bash
# Run with debugger enabled
node --inspect-brk node_modules/.bin/jest --runInBand

# Then connect in Chrome DevTools: chrome://inspect
```

---

## Test Organization

### Directory Structure

```text
__tests__/
├── integration/studio/
│   ├── initialization.test.tsx        # User Story 1
│   ├── template-loading.test.tsx      # User Story 2
│   ├── script-loading.test.tsx        # User Story 3
│   ├── local-draft.test.tsx          # User Story 4
│   └── mode-switching.test.tsx        # User Story 5
├── mocks/
│   ├── stores/                        # Store mocks
│   ├── hooks/                         # Hook mocks
│   ├── actions/                       # Action mocks
│   └── utils/                         # Utility mocks
└── utils/
    ├── test-helpers.tsx               # Shared helpers
    └── studio-page-mocks.ts           # Mock setup
```

### Test File Naming Convention

- Format: `{user-story}.test.tsx`
- Matches spec user story names
- All test files end in `.test.tsx` or `.test.ts`

---

## Writing New Tests

### Basic Test Structure

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import StudioPage from '@/app/studio/page';
import { setupStudioPageMocks, teardownStudioPageMocks } from '../utils/studio-page-mocks';

describe('Studio Page - Feature Name', () => {
  beforeEach(() => {
    setupStudioPageMocks();
  });

  afterEach(() => {
    teardownStudioPageMocks();
  });

  it('should do something specific', async () => {
    // Arrange: Set up test conditions
    // ...configure mocks...

    // Act: Execute the test
    render(<StudioPage />);

    // Assert: Verify expected outcome
    expect(screen.getByText(/expected text/)).toBeInTheDocument();
  });
});
```

### Testing with URL Parameters

```typescript
import { setSearchParams } from '../mocks/next-navigation.mock';

it('should load template with ?template parameter', () => {
  // Arrange
  setSearchParams({ template: 'classic-news' });
  setMockTemplate({
    id: 'classic-news',
    name: 'Classic News',
    content: 'News content',
    settings: { font: 'Classic' }
  });

  // Act
  render(<StudioPage />);

  // Assert
  expect(screen.getByText(/News content/)).toBeInTheDocument();
});
```

### Testing Toast Notifications

```typescript
import { expectToastSuccess, expectToastError } from '../mocks/toast.mock';

it('should show success toast when template loads', () => {
  // Arrange & Act
  render(<StudioPage />);

  // Assert
  expectToastSuccess('Loaded template');
});
```

### Testing localStorage

```typescript
import { expectStored, expectRetrieved } from '../mocks/local-storage.mock';

it('should save draft to localStorage', () => {
  // Arrange
  render(<StudioPage />);

  // Act: Advance timers to trigger auto-save
  jest.advanceTimersByTime(5000);

  // Assert
  expectStored('teleprompter_draft', expect.any(String));
});
```

### Testing Async Operations

```typescript
import { waitFor } from '@testing-library/react';

it('should load script asynchronously', async () => {
  // Arrange
  setSearchParams({ script: 'script-001' });
  setMockScriptResult({
    success: true,
    script: {
      content: 'Script content',
      bg_url: '',
      music_url: '',
      config: { /* ... */ }
    }
  });

  // Act
  render(<StudioPage />);

  // Assert: Wait for async operation
  await waitFor(() => {
    expect(screen.getByText(/Script content/)).toBeInTheDocument();
  });
});
```

---

## Common Patterns

### Given-When-Then Pattern

```typescript
it('should disable demo mode on initial load', () => {
  // Given: User navigates to studio page
  setSearchParams({});
  
  // When: Page loads
  render(<StudioPage />);
  
  // Then: Demo mode should be disabled
  const { setDemoMode } = mockUseDemoStore();
  expect(setDemoMode).toHaveBeenCalledWith(false);
});
```

### Timer Control Pattern

```typescript
describe('Auto-save functionality', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should auto-save after 5 seconds', () => {
    // Arrange
    render(<StudioPage />);

    // Act: Advance time by 5 seconds
    jest.advanceTimersByTime(5000);

    // Assert
    expectStored('teleprompter_draft', expect.any(String));
  });
});
```

### Store Verification Pattern

```typescript
it('should apply template settings to store', () => {
  // Arrange
  setSearchParams({ template: 'test-template' });
  const store = mockUseTeleprompterStore();

  // Act
  render(<StudioPage />);

  // Assert
  expect(store.setAll).toHaveBeenCalledWith(
    expect.objectContaining({
      font: 'Classic',
      speed: 3
    })
  );
});
```

### Error Testing Pattern

```typescript
it('should handle script loading errors gracefully', async () => {
  // Arrange
  setSearchParams({ script: 'invalid-script' });
  setMockScriptError('Script not found');

  // Act
  render(<StudioPage />);

  // Assert
  expectToastError('Failed to load script');
});
```

---

## Debugging

### Enable Verbose Output

```bash
npm test -- --verbose
```

### Debug Specific Test

```bash
# Run single test with debugger
npm test -- -t "test name" --no-coverage --runInBand
```

### Console Logging in Tests

```typescript
it('should debug something', () => {
  // Debug rendered DOM
  const { container } = render(<StudioPage />);
  console.log(container.innerHTML);

  // Debug store calls
  const store = mockUseTeleprompterStore();
  console.log('setText calls:', store.setText.mock.calls);
});
```

### Debug Mock Calls

```typescript
it('should debug mock state', () => {
  render(<StudioPage />);

  // Check all mock calls
  const store = mockUseTeleprompterStore();
  expect(store.setAll).toHaveBeenCalled();

  // Print call details
  console.log(store.setAll.mock.calls);
});
```

---

## Troubleshooting

### Common Issues

#### Issue: Tests Timeout

**Symptom**: Tests fail with "Timeout - Async callback was not invoked"

**Solution**:
```typescript
// Ensure async operations are awaited
it('should load script', async () => {
  render(<StudioPage />);
  await waitFor(() => {
    expect(/* assertion */);
  });
});
```

#### Issue: Mock Not Working

**Symptom**: Real implementation is called instead of mock

**Solution**:
```typescript
// Ensure mock is setup before importing component
beforeEach(() => {
  setupStudioPageMocks(); // Reset mocks
});

// Or explicitly call jest.clearAllMocks()
beforeEach(() => {
  jest.clearAllMocks();
});
```

#### Issue: Timers Not Advancing

**Symptom**: Auto-save tests fail because timers don't fire

**Solution**:
```typescript
// Ensure fake timers are enabled
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers(); // Clean up
  jest.useRealTimers();
});
```

#### Issue: Store State Persists Between Tests

**Symptom**: Tests affect each other

**Solution**:
```typescript
// Reset store state in beforeEach
beforeEach(() => {
  const store = mockUseTeleprompterStore();
  store.text = '';
  store.mode = 'setup';
  // ... reset other properties
});
```

#### Issue: localStorage Not Mocked

**Symptom**: Tests fail with "localStorage is not defined"

**Solution**:
```typescript
// Ensure jsdom environment is configured
// jest.config.js should have:
module.exports = {
  testEnvironment: 'jsdom'
};
```

### Getting Help

1. **Check the specification**: [`spec.md`](spec.md) for requirement details
2. **Check the research**: [`research.md`](research.md) for testing approach
3. **Check existing tests**: Look at similar test files for patterns
4. **Check mock documentation**: [`contracts/mock-configurations.md`](contracts/mock-configurations.md)

---

## Best Practices

### DO ✅

- Use `describe` blocks to group related tests
- Use descriptive test names (should... when...)
- Follow Given-When-Then pattern
- Clean up mocks in `afterEach`
- Use `waitFor` for async assertions
- Test user behavior, not implementation
- Keep tests focused and independent
- Use helper functions for common setup

### DON'T ❌

- Don't test implementation details
- Don't use `setTimeout` with real delays (use fake timers)
- Don't share state between tests
- Don't ignore console errors
- Don't make tests dependent on execution order
- Don't use excessive mocking (only mock external dependencies)
- Don't write flaky tests

---

## Coverage Requirements

### Target Metrics

- **Branches**: 100%
- **Functions**: 100%
- **Lines**: 100%
- **Statements**: 100%

### Check Coverage

```bash
# Run tests with coverage
npm test -- --coverage

# View coverage report
open coverage/index.html
```

### Coverage for Specific File

```bash
npm test -- --coverage --collectCoverageFrom=app/studio/page.tsx
```

---

## Next Steps

1. **Review the specification**: Read [`spec.md`](spec.md) to understand requirements
2. **Review the data model**: Read [`data-model.md`](data-model.md) for test fixtures
3. **Review mock configurations**: Read [`contracts/mock-configurations.md`](contracts/mock-configurations.md)
4. **Run existing tests**: `npm test -- studio`
5. **Write new tests**: Follow patterns in this guide
6. **Check coverage**: Ensure 100% coverage before submitting

---

## Quick Reference

### Common Imports

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import StudioPage from '@/app/studio/page';
import { setupStudioPageMocks, teardownStudioPageMocks } from '../utils/studio-page-mocks';
import { setSearchParams } from '../mocks/next-navigation.mock';
import { setMockTemplate, setMockScriptResult } from '../mocks/actions';
import { expectToastSuccess, expectToastError } from '../mocks/toast.mock';
import { expectStored, expectRetrieved } from '../mocks/local-storage.mock';
```

### Common Setup

```typescript
beforeEach(() => {
  setupStudioPageMocks();
});

afterEach(() => {
  teardownStudioPageMocks();
});
```

### Common Assertions

```typescript
// DOM assertions
expect(screen.getByText(/text/)).toBeInTheDocument();
expect(screen.queryByText(/text/)).not.toBeInTheDocument();

// Mock assertions
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(expectedArgs);
expect(mockFn).toHaveBeenCalledTimes(count);

// Toast assertions
expectToastSuccess('message');
expectToastError('message');

// localStorage assertions
expectStored('key', 'value');
expectRetrieved('key');
```

---

**For more details**, see:
- [Specification](spec.md) - Requirements and success criteria
- [Research](research.md) - Testing approach and decisions
- [Data Model](data-model.md) - Test fixtures and data structures
- [Mock Configurations](contracts/mock-configurations.md) - Mock setup and usage
