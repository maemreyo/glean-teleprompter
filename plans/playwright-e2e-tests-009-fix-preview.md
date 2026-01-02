# Playwright E2E Test Plan for Feature 009-fix-preview

**Feature:** 009-fix-preview - Background Consistency in Preview Components  
**Tasks Covered:** T039-T046 (Polish Phase Manual Testing)  
**Test Approach:** Playwright MCP Server for Interactive E2E Testing  
**Created:** 2026-01-02  
**Status:** Planning Phase

---

## Executive Summary

This document outlines the plan for implementing Playwright E2E tests using the Playwright MCP server to verify manual testing requirements (T039-T046) for Feature 009-fix-preview. The tests will verify background consistency between [`FullPreviewDialog`](../components/teleprompter/editor/FullPreviewDialog.tsx) and [`PreviewPanel`](../components/teleprompter/editor/PreviewPanel.tsx) components.

### Key Findings

1. **Playwright Status**: Not currently installed in the project
2. **Existing Testing**: Jest + React Testing Library for unit/integration tests
3. **Test Execution**: Will use Playwright MCP server for interactive debugging
4. **Test Scope**: Focus on visual consistency, real-time updates, error handling, and performance

---

## 1. Test Requirements Overview

### Tasks to Verify (T039-T046)

| Task ID | Description | Test Type |
|---------|-------------|-----------|
| T039 | Default background displays correctly in both previews | Visual Regression |
| T040 | Custom background displays correctly in both previews | Visual Regression |
| T041 | Empty background state works correctly | Functional |
| T042 | Invalid URL shows graceful degradation | Error Handling |
| T043 | Real-time updates when background changes | Real-time Sync |
| T044 | Large images (5MB) load and render correctly | Performance |
| T045 | Template switching updates backgrounds immediately | State Management |
| T046 | 100ms update latency performance requirement | Performance |

---

## 2. Playwright MCP Server Integration

### 2.1 Why Playwright MCP Server?

The Playwright MCP server provides:
- **Interactive test execution** with real-time browser control
- **Screenshot capture** for visual verification
- **Network monitoring** to verify image loading
- **Performance metrics** collection
- **Debugging capabilities** through browser snapshots

### 2.2 MCP Server Setup

The Playwright MCP server is already configured in the environment:
```bash
npx -y @playwright/mcp@0.0.38
```

### 2.3 Available MCP Tools

- `browser_navigate` - Navigate to URLs
- `browser_snapshot` - Capture accessibility snapshot
- `browser_take_screenshot` - Capture visual screenshots
- `browser_click` - Click elements
- `browser_type` - Type text input
- `browser_evaluate` - Execute JavaScript in browser
- `browser_wait_for` - Wait for conditions
- `browser_console_messages` - Check console logs
- `browser_network_requests` - Monitor network activity

---

## 3. Test Scenarios

### 3.1 T039 - Default Background Display

**Objective**: Verify default background renders identically in both previews

**Test Steps:**
1. Navigate to `/studio` page
2. Wait for page to load completely
3. Take screenshot of PreviewPanel background
4. Click "Full Preview" button to open FullPreviewDialog
5. Take screenshot of FullPreviewDialog background
6. Compare background images for visual consistency

**Expected Results:**
- Both components display default background: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe`
- Background covers entire preview area
- Opacity is correctly set to 70%
- Dark overlay (bg-black/30) is applied

**Verification Points:**
- Screenshot comparison
- Computed styles: `backgroundImage`, `backgroundSize`, `backgroundPosition`
- No console errors

### 3.2 T040 - Custom Background Display

**Objective**: Verify custom background URL renders in both previews

**Test Data:**
- Valid image URL: `https://images.unsplash.com/photo-1519681393784-d120267933ba`
- Alternative: Base64 encoded small image

**Test Steps:**
1. Navigate to `/studio` page
2. Use browser_evaluate to set custom bgUrl in ContentStore:
   ```javascript
   window.useContentStore?.getState?.().setBgUrl?.('CUSTOM_URL')
   ```
3. Wait for state update (100ms threshold)
4. Capture PreviewPanel screenshot
5. Open FullPreviewDialog
6. Capture FullPreviewDialog screenshot
7. Compare backgrounds

**Expected Results:**
- Custom image loads in both previews
- Images appear identical
- Loading indicator shows briefly (50ms threshold)
- No errors in console

### 3.3 T041 - Empty Background State

**Objective**: Verify empty/invalid bgUrl is handled gracefully

**Test Data:**
- Empty string: `''`
- Null value: `null`

**Test Steps:**
1. Navigate to `/studio` page
2. Set bgUrl to empty string via browser_evaluate
3. Verify no error overlay appears
4. Verify background falls back to default or solid color
5. Check console for no errors

**Expected Results:**
- No error overlay displayed
- Background displays transparent or default color
- Console has no errors
- Both previews handle identically

### 3.4 T042 - Invalid URL Graceful Degradation

**Objective**: Verify invalid image URLs show error state

**Test Data:**
- Invalid URL: `https://invalid-domain-that-does-not-exist.com/image.jpg`
- 404 URL: `https://images.unsplash.com/photo-invalid`
- Malformed URL: `not-a-url`

**Test Steps:**
1. Navigate to `/studio` page
2. Set bgUrl to invalid URL
3. Wait for image load timeout
4. Verify error overlay appears
5. Verify error icon (AlertCircle) is displayed
6. Verify error message: "Failed to load background"
7. Check browser_console_messages for error logs
8. Repeat for FullPreviewDialog

**Expected Results:**
- Error overlay appears with backdrop-blur
- AlertCircle icon visible (red color)
- Error message displayed
- No browser crash
- Both previews handle identically

### 3.5 T043 - Real-time Background Updates

**Objective**: Verify both previews update immediately when bgUrl changes

**Test Steps:**
1. Navigate to `/studio` page with default background
2. Take initial screenshot of both previews
3. Use browser_evaluate to change bgUrl:
   ```javascript
   const start = performance.now()
   window.useContentStore?.getState?.().setBgUrl?.('NEW_URL')
   ```
4. Wait for update (monitor via browser_evaluate for DOM changes)
5. Measure time to update: `performance.now() - start`
6. Take new screenshot
7. Compare before/after
8. Verify update in FullPreviewDialog

**Expected Results:**
- Both previews update within 100ms
- Update is synchronous (no flicker)
- Loading indicator shows briefly
- Background changes in both components simultaneously

### 3.6 T044 - Large Image Loading (5MB)

**Objective**: Verify large images load and display correctly

**Test Data:**
- Large image URL (need test asset ~5MB)
- Could use: Large Unsplash image or host test file

**Test Steps:**
1. Navigate to `/studio` page
2. Set bgUrl to large image URL
3. Monitor loading indicator appearance
4. Measure load time via browser_network_requests
5. Verify loading indicator shows during load
6. Verify loading indicator disappears after load
7. Verify image renders correctly
8. Check for memory issues in console

**Expected Results:**
- Loading indicator appears immediately
- Loading indicator displays until image loads
- No timeout errors
- Image renders at full quality
- No memory leaks or performance degradation
- Browser handles large image gracefully

### 3.7 T045 - Template Switching Background Updates

**Objective**: Verify background updates when template changes

**Test Steps:**
1. Navigate to `/studio` page with template loaded
2. Note current background (screenshot)
3. Use browser_evaluate to load different template:
   ```javascript
   // Simulate template loading that changes bgUrl
   window.useContentStore?.getState?.().setBgUrl?.(templateBgUrl)
   ```
4. Verify background updates immediately
5. Verify no stale background remains
6. Check both PreviewPanel and FullPreviewDialog
7. Monitor console for template-related logs

**Expected Results:**
- Background changes immediately on template switch
- No visual artifacts from old background
- Both previews update synchronously
- No flicker or flash during transition
- Template background persists correctly

### 3.8 T046 - 100ms Update Latency Performance

**Objective**: Verify background updates meet 100ms performance threshold

**Test Steps:**
1. Navigate to `/studio` page
2. For multiple iterations (10-20):
   a. Record start time via browser_evaluate
   b. Change bgUrl to new URL
   c. Poll DOM for background update
   d. Record end time when update completes
   e. Calculate latency
3. Calculate average, min, max latency
4. Verify all measurements < 100ms
5. Check for performance warnings in console

**Expected Results:**
- Average update time < 100ms
- 95th percentile < 100ms
- No individual update > 150ms (allowing margin)
- Console has no performance warnings for PreviewPanel
- Background style updates are efficient

---

## 4. Test Data Requirements

### 4.1 Image URLs for Testing

| Type | URL | Purpose |
|------|-----|---------|
| Default | `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe` | Existing default |
| Custom 1 | `https://images.unsplash.com/photo-1519681393784-d120267933ba` | Mountain landscape |
| Custom 2 | `https://images.unsplash.com/photo-1506905925346-21bda4d32df4` | Nature scene |
| Invalid | `https://invalid-domain-12345.com/notfound.jpg` | Error testing |
| Large | `https://images.unsplash.com/photo-1469474968028-56623f02e42e` (4K+) | Performance testing |

### 4.2 Base64 Test Images

Create small base64 images for offline testing:
```javascript
// 1x1 transparent pixel
const transparentPixel = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

// Small test pattern (100x100)
// Generate during implementation
```

### 4.3 Store State Test Data

```javascript
// Default state
const defaultState = {
  text: 'Chào mừng! Hãy nhập nội dung của bạn vào đây...',
  bgUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
  musicUrl: '',
  isReadOnly: false
}

// Custom state
const customState = {
  text: 'Test content for Playwright E2E',
  bgUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba',
  musicUrl: '',
  isReadOnly: false
}

// Empty state
const emptyState = {
  text: '',
  bgUrl: '',
  musicUrl: '',
  isReadOnly: false
}
```

---

## 5. Prerequisites and Setup

### 5.1 Environment Requirements

- **Node.js**: 18+ (already in project)
- **Next.js Dev Server**: Must be running on `http://localhost:3000`
- **Browser**: Chromium (via Playwright MCP)
- **MCP Server**: Playwright MCP server already available

### 5.2 Dev Server Startup

```bash
# Terminal 1: Start dev server
npm run dev

# Server will start on http://localhost:3000
# Studio page available at http://localhost:3000/studio
```

### 5.3 Authentication Requirements

**Current Assessment**: Based on existing test structure, the `/studio` page may:
- Require authentication (Supabase auth)
- Have public access for testing

**Options:**
1. **Public Access**: If `/studio` is publicly accessible, no auth needed
2. **Mock Auth**: Use browser_evaluate to mock localStorage auth tokens
3. **Test User**: Create test user and login via browser automation

**Recommendation**: Verify auth requirements during implementation

### 5.4 Test Page URL

```
http://localhost:3000/studio
```

**Verification Needed:**
- Confirm `/studio` route exists in app directory
- Check if authentication is required
- Verify page loads without errors

---

## 6. Test File Structure

### 6.1 Proposed Directory Structure

```
__tests__/
├── e2e/
│   ├── playwright/
│   │   ├── 009-fix-preview/
│   │   │   ├── background-consistency.spec.ts
│   │   │   ├── real-time-updates.spec.ts
│   │   │   ├── error-handling.spec.ts
│   │   │   ├── performance.spec.ts
│   │   │   └── test-data/
│   │   │       ├── images.ts
│   │   │       ├── store-states.ts
│   │   │       └── urls.ts
│   │   ├── helpers/
│   │   │   ├── browser-helpers.ts
│   │   │   ├── screenshot-helpers.ts
│   │   │   └── store-helpers.ts
│   │   └── fixtures/
│   │       ├── studio-page.ts
│   │       └── preview-components.ts
│   └── screenshots/
│       └── 009-fix-preview/
│           ├── baseline/
│           └── actual/
```

### 6.2 Test File Organization

| File | Purpose | Tests Covered |
|------|---------|---------------|
| `background-consistency.spec.ts` | Visual consistency tests | T039, T040 |
| `real-time-updates.spec.ts` | Real-time sync tests | T043, T045 |
| `error-handling.spec.ts` | Error state tests | T041, T042 |
| `performance.spec.ts` | Performance tests | T044, T046 |
| `browser-helpers.ts` | Reusable browser actions | Shared |
| `screenshot-helpers.ts` | Screenshot comparison utilities | Shared |
| `store-helpers.ts` | Zustand store manipulation | Shared |
| `studio-page.ts` | Page object model for /studio | Shared |
| `preview-components.ts` | Component selectors and actions | Shared |

---

## 7. Page Object Model

### 7.1 StudioPage Object

```typescript
// fixtures/studio-page.ts
class StudioPage {
  // URL
  readonly url = '/studio'

  // Selectors
  readonly previewPanel = '[data-testid="preview-panel"]'
  readonly previewBackground = '.preview-background'
  readonly fullPreviewButton = 'button:has-text("Full Preview")'
  readonly fullPreviewDialog = '[data-testid="full-preview-dialog"]'
  readonly loadingIndicator = '[data-testid="loading-indicator"]'
  readonly errorIndicator = '[data-testid="error-indicator"]'

  // Actions
  async navigate() { /* ... */ }
  async getPreviewBackground() { /* ... */ }
  async openFullPreview() { /* ... */ }
  async getFullPreviewBackground() { /* ... */ }
  async waitForLoadingComplete() { /* ... */ }
  async hasError() { /* ... */ }
}
```

### 7.2 Store Helpers

```typescript
// helpers/store-helpers.ts
class StoreHelpers {
  // Get ContentStore state
  async getContentState() {
    return await page.evaluate(() => {
      return window.useContentStore?.getState?.() || null
    })
  }

  // Set bgUrl in ContentStore
  async setBackgroundUrl(url: string) {
    await page.evaluate((bgUrl) => {
      window.useContentStore?.getState?.().setBgUrl?.(bgUrl)
    }, url)
  }

  // Reset ContentStore
  async resetContentStore() {
    await page.evaluate(() => {
      window.useContentStore?.getState?.().reset?.()
    })
  }

  // Get computed background style
  async getBackgroundStyle(element: string) {
    return await page.evaluate((sel) => {
      const el = document.querySelector(sel)
      return window.getComputedStyle(el).backgroundImage
    }, element)
  }
}
```

---

## 8. Performance Measurement Strategy

### 8.1 Latency Measurement

```typescript
// Measure update latency
async function measureUpdateLatency(action: () => Promise<void>): Promise<number> {
  const startTime = await page.evaluate(() => performance.now())
  await action()
  
  // Wait for DOM update
  await page.waitForSelector('[data-updated="true"]')
  
  const endTime = await page.evaluate(() => performance.now())
  return endTime - startTime
}
```

### 8.2 Performance Metrics Collection

```typescript
// Collect performance metrics
async function collectPerformanceMetrics() {
  return await page.evaluate(() => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return {
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
      renderTime: perfData.loadEventEnd - perfData.requestStart
    }
  })
}
```

### 8.3 Network Monitoring

```typescript
// Monitor image load time
async function measureImageLoadTime(url: string): Promise<number> {
  const startTime = Date.now()
  
  // Set bgUrl
  await setBackgroundUrl(url)
  
  // Wait for network request to complete
  await page.waitForResponse(response => 
    response.url().includes(url) && response.status() === 200
  )
  
  return Date.now() - startTime
}
```

---

## 9. Implementation Roadmap

### Phase 1: Setup and Foundation

1. **Verify Playwright MCP Server**
   - Confirm MCP server connectivity
   - Test basic browser operations
   - Validate screenshot capture

2. **Create Test Infrastructure**
   - Set up test directory structure
   - Create helper functions
   - Define test data fixtures

3. **Dev Server Verification**
   - Start Next.js dev server
   - Verify `/studio` page accessibility
   - Confirm authentication requirements

### Phase 2: Core Test Implementation

4. **Implement Background Consistency Tests** (T039, T040)
   - Default background verification
   - Custom background verification
   - Screenshot comparison logic

5. **Implement Error Handling Tests** (T041, T042)
   - Empty state handling
   - Invalid URL error states
   - Error overlay verification

6. **Implement Real-time Update Tests** (T043, T045)
   - Store state change monitoring
   - DOM update verification
   - Template switching tests

7. **Implement Performance Tests** (T044, T046)
   - Large image loading
   - Latency measurement
   - Performance threshold validation

### Phase 3: Refinement and Documentation

8. **Test Refinement**
   - Fix flaky tests
   - Optimize test execution
   - Add retry logic for network-dependent tests

9. **Documentation**
   - Update test plan with actual findings
   - Document any workarounds
   - Create test execution guide

---

## 10. Key Implementation Considerations

### 10.1 Store Access in Browser

The Zustand stores need to be accessible via `window` for browser_evaluate:

```typescript
// In components or page, expose store to window
if (typeof window !== 'undefined') {
  ;(window as any).useContentStore = useContentStore
  ;(window as any).useConfigStore = useConfigStore
  ;(window as any).useUIStore = useUIStore
}
```

**Action Item**: Verify stores are accessible or add exposure logic

### 10.2 Test Data Attributes

Components need test-friendly selectors:

```typescript
// Add to PreviewPanel and FullPreviewDialog
<div data-testid="preview-background" className="..." />
<div data-testid="loading-indicator" />
<div data-testid="error-indicator" />
<div data-testid="full-preview-dialog" />
```

**Status**: Already partially implemented in FullPreviewDialog (lines 88, 98)

**Action Item**: Add to PreviewPanel if missing

### 10.3 Screenshot Comparison Strategy

Options:
1. **Visual comparison** using pixel matching (needs additional setup)
2. **Manual verification** by saving screenshots for review
3. **Hash-based comparison** of computed styles

**Recommendation**: Start with manual verification, add automated comparison if needed

### 10.4 Network Mocking

For controlled testing:
```typescript
// Mock network responses for consistent testing
await page.route('**/images/**', route => {
  route.fulfill({
    status: 200,
    body: testImageData,
    contentType: 'image/jpeg'
  })
})
```

---

## 11. Success Criteria

### Test Coverage
- [ ] All 8 tasks (T039-T046) have corresponding E2E tests
- [ ] Tests cover both PreviewPanel and FullPreviewDialog
- [ ] Error scenarios are thoroughly tested
- [ ] Performance requirements are validated

### Test Quality
- [ ] Tests are repeatable and reliable
- [ ] Tests execute within reasonable time
- [ ] Screenshots capture relevant states
- [ ] Performance metrics are accurately measured

### Documentation
- [ ] Test scenarios are clearly documented
- [ ] Test data is well-defined
- [ ] Setup instructions are complete
- [ ] Execution guide is provided

---

## 12. Next Steps

1. **Review this plan** and provide feedback
2. **Verify authentication requirements** for `/studio` page
3. **Confirm test data attributes** are present in components
4. **Create test infrastructure** (directory structure, helpers)
5. **Implement first test** (T039 - Default Background)
6. **Iterate on remaining tests**

---

## Appendix A: Component Analysis

### FullPreviewDialog ([`FullPreviewDialog.tsx`](../components/teleprompter/editor/FullPreviewDialog.tsx))

**Key Features:**
- Uses `useContentStore` for `text` and `bgUrl`
- Loading state (lines 38-39, 87-94)
- Error state (lines 34-36, 97-104)
- Background layer (lines 107-112)
- Keyboard shortcut: Ctrl/Cmd + \ (lines 71-81)

**Test Identifiers:**
- `loading-indicator` (line 88)
- `loading-spinner` (line 90)
- `loading-message` (line 91)
- `error-indicator` (line 98)
- `error-icon` (line 100)
- `error-message` (line 101)

### PreviewPanel ([`PreviewPanel.tsx`](../components/teleprompter/editor/PreviewPanel.tsx))

**Key Features:**
- Uses `useContentStore` for `text` and `bgUrl`
- Responsive design (desktop/tablet/mobile)
- Loading state (lines 62-63, 193-197)
- Error state (lines 66-67, 200-207)
- Background layer (lines 222-227 for desktop)
- Performance monitoring (lines 70-72, 118-129)
- React.memo optimization (lines 44-47)

**Performance Threshold:**
- `PERFORMANCE_THRESHOLD_MS = 100` (line 36)
- `LOADING_THRESHOLD_MS = 50` (line 37)

### ContentStore ([`useContentStore.ts`](../lib/stores/useContentStore.ts))

**State Properties:**
- `text`: Teleprompter text content
- `bgUrl`: Background image URL
- `musicUrl`: Background music URL
- `isReadOnly`: Editor read-only state

**Actions:**
- `setBgUrl(url: string)`: Update background URL
- `reset()`: Reset to defaults
- `resetMedia()`: Reset only media properties

**Default Background:**
```
https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe
```

---

## Appendix B: Existing Test Reference

### Jest Integration Test ([`full-preview-dialog.test.tsx`](../__tests__/integration/config/full-preview-dialog.test.tsx))

**Existing Coverage:**
- Dialog render when open/closed
- Full teleprompter preview display
- Keyboard shortcut functionality
- Config respect (typography, layout)
- Empty content handling
- Accessibility attributes
- State persistence

**Gap Analysis:**
- No visual regression testing (requires browser)
- No performance measurement
- No network monitoring
- No real-time update verification
- No large image testing

**Conclusion:** Playwright E2E tests complement existing Jest tests by adding browser-level verification.

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-02  
**Next Review:** After implementation begins
