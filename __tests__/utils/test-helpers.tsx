import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

// Custom render function that includes providers if needed
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>
  }

  return render(ui, { wrapper: AllTheProviders, ...options })
}

// Helper to wait for state updates
export const waitForStateUpdate = () =>
  new Promise(resolve => setTimeout(resolve, 0))

// Helper to flush promises
export const flushPromises = () => new Promise(setImmediate)

// Helper to reset all Zustand stores between tests
export const resetStores = () => {
  // Reset localStorage for persist middleware
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.clear()
  }
}

// Test environment cleanup utilities
export const cleanupTestEnvironment = () => {
  // Reset stores
  resetStores()

  // Clean up DOM
  document.body.innerHTML = ''
}

// Setup function for beforeEach
export const setupTestEnvironment = () => {
  cleanupTestEnvironment()
}

// Teardown function for afterEach
export const teardownTestEnvironment = () => {
  cleanupTestEnvironment()
}

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { customRender as render }