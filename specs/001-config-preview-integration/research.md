# Research: Config Panel to Preview Integration Tests

**Date**: 2025-12-31
**Purpose**: Resolve technical unknowns for implementing integration tests between ConfigPanel and PreviewPanel components.

## Research Questions & Findings

### 1. Best practices for testing React component integration with Zustand stores

**Decision**: Use real Zustand stores in tests with proper cleanup
**Rationale**: Zustand stores are lightweight and fast, providing realistic test conditions without complex mocking
**Alternatives considered**:
- Deep mocking of store methods (rejected: too brittle and doesn't test real integration)
- Using test-specific store instances (rejected: may not catch integration issues)

### 2. How to test visual style changes in React Testing Library

**Decision**: Use getComputedStyle assertions on rendered elements
**Rationale**: Provides direct verification of CSS property application without external visual testing tools
**Alternatives considered**:
- Snapshot testing of styles (rejected: too fragile for dynamic values)
- Visual regression tools like Chromatic (rejected: overkill for integration tests, better for UI component libraries)

### 3. Testing strategy for real-time config updates

**Decision**: Use act() wrapper for state updates and waitFor for async assertions
**Rationale**: Ensures proper timing of React updates and async operations
**Alternatives considered**:
- Fixed timeouts (rejected: unreliable and slow)
- Immediate assertions (rejected: may fail due to React's asynchronous nature)

### 4. Handling complex CSS-in-JS style objects in tests

**Decision**: Test key style properties individually rather than full objects
**Rationale**: Focuses on functional correctness rather than implementation details
**Alternatives considered**:
- Snapshot testing of style objects (rejected: too implementation-specific)
- CSS class presence testing (rejected: doesn't verify actual applied styles)

### 5. Mocking Google Fonts for testing

**Decision**: Allow real font loading but skip actual font rendering verification
**Rationale**: Font loading is a browser-level concern, focus on font-family property application
**Alternatives considered**:
- Mocking font loading (rejected: complex and may miss integration issues)
- Skipping font-related tests (rejected: important for typography validation)

## Technical Approach

The integration tests will:

1. Render both ConfigPanel and PreviewPanel in a test environment
2. Use React Testing Library to simulate user interactions on config controls
3. Verify that PreviewPanel updates immediately with correct styles
4. Test all 5 configuration categories: typography, colors, effects, layout, animations
5. Ensure no visual lag (<100ms) between config change and preview update

## Implementation Notes

- Tests will run in jsdom environment
- Zustand store will be reset between tests
- Style assertions will check computed styles on rendered elements
- Animation tests will verify CSS property application (not actual animations)