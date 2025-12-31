# Quickstart: Config Panel to Preview Integration Tests

**Date**: 2025-12-31
**Purpose**: Guide for setting up and running the config-to-preview integration tests.

## Prerequisites

- Node.js 18+
- npm or yarn
- Jest and React Testing Library installed
- Project dependencies installed (`npm install`)

## Setup

1. Ensure you're on the correct branch:
   ```bash
   git checkout 001-config-preview-integration
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Verify Jest configuration:
   ```bash
   npx jest --version
   ```

## Running Tests

### Run all integration tests:
```bash
npm test -- __tests__/integration/config-preview/
```

### Run specific test categories:
```bash
# Typography tests only
npm test -- __tests__/integration/config-preview/typography-integration.test.tsx

# Colors tests only
npm test -- __tests__/integration/config-preview/colors-integration.test.tsx

# All config integration tests
npm test -- config-preview
```

### Run with coverage:
```bash
npm test -- --coverage __tests__/integration/config-preview/
```

### Run in watch mode (for development):
```bash
npm test -- --watch __tests__/integration/config-preview/
```

## Test Structure

The integration tests verify that configuration changes in the ConfigPanel immediately reflect in the PreviewPanel:

- **Typography Integration**: Font family, size, weight, spacing, transforms
- **Colors Integration**: Primary colors, gradients, color transitions
- **Effects Integration**: Shadows, outlines, glows, backdrop filters
- **Layout Integration**: Margins, alignment, columns, positioning
- **Animations Integration**: Scroll damping, entrance effects, highlights

## Expected Results

Each test scenario should:
- ✅ Pass with immediate visual feedback (<100ms)
- ✅ Show correct style application in PreviewPanel
- ✅ Maintain component stability during config changes
- ✅ Handle edge cases gracefully

## Troubleshooting

### Tests failing due to timing:
- Increase timeout in Jest config if needed
- Ensure `act()` wrappers are used for state updates
- Use `waitFor()` for async assertions

### Visual assertions failing:
- Check that components are properly mounted
- Verify CSS-in-JS is applied correctly
- Ensure no conflicting styles override test expectations

### Store-related issues:
- Reset Zustand store between tests
- Mock external dependencies if interfering
- Check store initialization

## Development Workflow

1. Write test scenario in data-model.md
2. Implement test in appropriate .test.tsx file
3. Run test suite to verify
4. Update test if implementation changes
5. Commit with descriptive message

## Performance Benchmarks

- Individual test: <500ms
- Full suite: <30 seconds
- Memory usage: <100MB during execution
- No flaky tests (100% reliability)