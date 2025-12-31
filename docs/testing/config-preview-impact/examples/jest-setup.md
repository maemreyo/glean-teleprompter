# Jest Setup Guide for Config Preview Testing

**Purpose**: Configure Jest environment for config-preview impact testing

## Installation

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

## Basic Configuration

### jest.config.js

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  testMatch: [
    '<rootDir>/__tests__/**/*.test.{js,jsx,ts,tsx}',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

### jest.setup.js

```javascript
import '@testing-library/jest-dom'

// Mock performance API for tests
global.performance = {
  ...global.performance,
  now: jest.fn(() => Date.now()),
}

// Mock requestAnimationFrame for animation tests
global.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 16) // 60 FPS
}

global.cancelAnimationFrame = (id) => {
  clearTimeout(id)
}

// Configure test timeouts
jest.setTimeout(10000)

// Suppress console errors in tests (optional)
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
```

## Test Utilities Setup

### Mock Config Store

Create `__tests__/utils/mock-config-store.ts`:

```typescript
import { renderHook } from '@testing-library/react'
import { useConfigStore } from '@/lib/stores/useConfigStore'

export function resetConfigStore() {
  const { result } = renderHook(() => useConfigStore())
  result.current.reset()
}

export function setConfigState(update: Partial<ConfigState>) {
  const { result } = renderHook(() => useConfigStore())
  result.current.setConfig(update)
}

export function getConfigState() {
  const { result } = renderHook(() => useConfigStore())
  return result.current.config
}

export function createTestConfigUpdate = {
  typography: (props: Partial<TypographyConfig>) => ({ typography: props }),
  colors: (props: Partial<ColorConfig>) => ({ colors: props }),
  effects: (props: Partial<EffectConfig>) => ({ effects: props }),
  layout: (props: Partial<LayoutConfig>) => ({ layout: props }),
  animations: (props: Partial<AnimationConfig>) => ({ animations: props }),
}

// Batch update helper
export function setMultipleConfigChanges(updates: Partial<ConfigState>[]) {
  updates.forEach(update => setConfigState(update))
}
```

### Test Environment Helpers

Create `__tests__/utils/test-helpers.ts`:

```typescript
export function setupTestEnvironment() {
  // Set up global test state
  document.body.innerHTML = ''
  
  // Mock IntersectionObserver for scroll tests
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords() {
      return []
    }
    unobserve() {}
  } as any
  
  // Mock ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  } as any
}

export function teardownTestEnvironment() {
  // Clean up after tests
  jest.clearAllMocks()
  jest.clearAllTimers()
}

// Performance measurement helper
export async function measureFrameTime(fn: () => void | Promise<void>): Promise<number> {
  const frames: number[] = []
  let measuring = true
  
  const measureFrame = () => {
    if (measuring) {
      frames.push(performance.now())
      requestAnimationFrame(measureFrame)
    }
  }
  
  requestAnimationFrame(measureFrame)
  await fn()
  
  // Wait for a few frames to ensure rendering is complete
  await new Promise(resolve => setTimeout(resolve, 50))
  measuring = false
  
  // Calculate average frame time
  if (frames.length < 2) return 0
  return frames.reduce((sum, time) => sum + time, 0) / frames.length
}

// Color conversion helpers
export function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return hex
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  return `rgb(${r}, ${g}, ${b})`
}

// Style assertion helpers
export function expectStyle(
  element: HTMLElement,
  property: string,
  expected: string | number,
  validator: 'exact' | 'contains' | 'range' = 'exact'
) {
  const computed = window.getComputedStyle(element)
  const actual = computed.getPropertyValue(property)
  
  switch (validator) {
    case 'exact':
      expect(actual).toBe(String(expected))
      break
    case 'contains':
      expect(actual).toContain(String(expected))
      break
    case 'range':
      const numericActual = parseFloat(actual)
      expect(numericActual).toBeGreaterThanOrEqual(parseFloat(String(expected)))
      break
  }
}
```

## Config Preview Test Wrapper

Create `__tests__/utils/ConfigPreviewTestWrapper.tsx`:

```typescript
import React, { ReactNode } from 'react'
import { render } from '@testing-library/react'
import { AppProvider } from '@/components/AppProvider'

interface ConfigPreviewTestWrapperProps {
  children: ReactNode
  config?: Partial<ConfigState>
}

export function ConfigPreviewTestWrapper({
  children,
  config,
}: ConfigPreviewTestWrapperProps) {
  return (
    <AppProvider>
      {children}
    </AppProvider>
  )
}

export function renderWithConfig(
  ui: ReactNode,
  config?: Partial<ConfigState>
) {
  return render(<ConfigPreviewTestWrapper config={config}>{ui}</ConfigPreviewTestWrapper>)
}
```

## Package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:config-preview": "jest __tests__/integration/config-preview/",
    "test:config-preview:watch": "jest --watch __tests__/integration/config-preview/"
  }
}
```

## VS Code Integration

### .vscode/settings.json

```json
{
  "jest.autoRun": "watch",
  "jest.showCoverageOnLoad": true,
  "jest.enabledWorkspaceGlobs": [
    "**/config-preview*"
  ]
}
```

## Running Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific config preview tests
npm run test:config-preview

# Run specific test file
npm test -- typography-integration.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="font size"
```

## Troubleshooting

### Import Resolution Issues

If Jest can't resolve `@/` imports:

```javascript
// jest.config.js
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
}
```

### Test Environment Errors

If tests fail with "document is not defined":

```javascript
// jest.config.js
testEnvironment: 'jsdom',
```

### Async Test Timeouts

Increase timeout for slow tests:

```javascript
jest.setTimeout(30000) // 30 seconds
```

Or for specific tests:

```typescript
it('slow test', async () => {
  // test code
}, 30000)
```

### Font Loading Issues

Web fonts may not load in test environment. Test the CSS property instead:

```typescript
// ❌ Tests actual font rendering
expect(element).toHaveFont('Roboto')

// ✅ Tests font-family property
expect(window.getComputedStyle(element).fontFamily).toContain('Roboto')
```

## Next Steps

- [Test Patterns Guide](./test-patterns.md) - Common testing patterns
- [Main Methodology](../methodology.md) - Complete methodology
