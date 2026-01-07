# Feature Specification: Multi-Device Matrix Preview

**Feature Branch**: `015-multi-device-matrix`
**Created**: 2026-01-07
**Status**: Draft
**Source Context**: Brainstorm .zo/brainstorms/live-preview-component-analysis-and-testing-improvements-2026-01-07-0541.md (Ideas: 001)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Multiple Devices Simultaneously (Priority: P1)

As a content creator, I want to see my teleprompter preview across multiple device types at the same time, so that I can ensure my content looks correct on all screen sizes without manually switching between views.

**Why this priority**: This is the core value proposition of the feature - creators get instant visibility across all form factors, eliminating the need to switch views or guess how content will appear on different devices.

**Independent Test**: Can be fully tested by opening the story builder, enabling multi-device view, and verifying that multiple device frames are visible and responsive. The feature delivers value even without advanced features like drag-and-drop reorganization.

**Acceptance Scenarios**:

1. **Given** a user is in the story builder with teleprompter content, **When** they toggle multi-device preview mode, **Then** they see a grid layout showing iPhone, iPad, and Desktop previews side-by-side
2. **Given** multi-device preview is active, **When** the user edits content, **Then** all device previews update simultaneously via postMessage sync
3. **Given** multiple devices are visible, **When** the user resizes the browser window, **Then** the grid layout adapts responsively to maintain visibility of all devices

---

### User Story 2 - Customize Device Grid Layout (Priority: P2)

As a content creator, I want to configure which devices appear in my preview grid, so that I can focus on specific form factors relevant to my audience.

**Why this priority**: Allows creators to tailor the preview experience to their needs, but the feature still delivers value without this customization.

**Independent Test**: Can be tested by selecting different grid configurations (1x, 2x, 2x2, 3x2) and verifying the correct number of device frames appear with appropriate layout.

**Acceptance Scenarios**:

1. **Given** multi-device preview is active, **When** the user selects a 2x grid configuration, **Then** exactly 2 device frames are displayed side-by-side
2. **Given** multi-device preview is active, **When** the user selects a 3x2 grid configuration, **Then** exactly 6 device frames are displayed in a 3-column by 2-row grid
3. **Given** a specific grid layout is selected, **When** the page is refreshed, **Then** the grid layout preference persists

---

### User Story 3 - Reorganize Device Grid (Priority: P3)

As a content creator, I want to drag and drop devices within the preview grid, so that I can arrange devices in an order that makes sense for my workflow.

**Why this priority**: This is a convenience feature that improves the user experience but is not essential for the core functionality.

**Independent Test**: Can be tested by dragging device frames to different positions in the grid and verifying the new layout is maintained.

**Acceptance Scenarios**:

1. **Given** multi-device preview is active with multiple devices, **When** the user drags a device frame to a new position, **Then** the grid reorganizes to reflect the new arrangement
2. **Given** a custom device arrangement, **When** the page is refreshed, **Then** the device positions persist

---

### Edge Cases

- What happens when the user's device has limited memory and multiple iframes cause performance degradation? System displays toast warning at 250MB threshold and prevents enabling 7th device at 350MB hard limit
- How does the system handle when a device frame fails to load or sync? System retries 3 times with exponential backoff (1s, 2s, 4s), then displays error state with manual retry button
- What happens when the browser window is too small to display the minimum grid layout effectively? System displays message: "Multi-device preview requires a larger screen. Rotate your device or use single-device preview." when viewport is below 1024px
- How does the system behave when network latency causes delayed updates across multiple iframes? System uses existing 100ms debounce and shows loading indicators during sync
- What happens when custom device dimensions are specified that exceed the available viewport space? Custom dimensions deferred to future iteration; initial fixed device set is scaled appropriately for grid display
- What happens when grid configuration has more slots than enabled devices? Empty slots display placeholder prompting user to enable more devices
- What happens when more devices are enabled than grid slots? System displays only the first N devices based on user's device priority order

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to toggle between single-device and multi-device preview modes
- **FR-002**: System MUST support grid configurations including 1x, 2x, 2x2, and 3x2 layouts. Each configuration defines the maximum number of device slots. When fewer device types are enabled than available slots, empty slots display an enable prompt. When more device types are enabled than slots, only the first N devices (by user priority) are displayed.
- **FR-003**: System MUST render each device preview in a reusable `<DeviceFrame>` component
- **FR-004**: System MUST synchronize content changes across all device previews using the existing postMessage broadcast pattern
- **FR-005**: System MUST provide a configurable device registry array defining available device types (iPhone SE 375x667, iPhone 14 Pro 393x852, iPad Air 820x1180, Desktop 1920x1080 at 0.5x scale)
- **FR-006**: System MUST implement responsive CSS Grid layout with minimum viewport width of 1024px. Breakpoints: ≥1280px supports up to 3x2 grid (6 devices), ≥1024px supports up to 2x2 grid (4 devices). Below 1024px, display a message recommending device rotation or single-device preview mode.
- **FR-007**: System MUST allow users to select which device types to display in the grid
- **FR-008**: System MUST support drag-and-drop reorganization of device frames within the grid
- **FR-009**: System MUST persist user's grid layout preferences in localStorage under key `teleprompter-multi-device-preview` with schema: `{ enabled: boolean, gridConfig: string, enabledDeviceTypes: string[], deviceOrder: string[], lastUpdated: number }`
- **FR-010**: System MUST display each device frame with exact device-specific dimensions: iPhone SE (375x667px), iPhone 14 Pro (393x852px), iPad Air (820x1180px), Desktop (1920x1080px at 0.5x scale), and appropriate device chrome styling
- **FR-011**: System MUST monitor iframe memory efficiency with a warning threshold at 250MB (5 devices) and hard limit at 350MB. Memory is calculated as 50MB base per iframe plus 5MB per 1000 characters of content. When approaching the warning threshold, display a toast notification. When at the hard limit, disable additional device selection checkboxes.
- **FR-012**: System MUST handle device frame loading errors with retry logic: max 3 attempts with exponential backoff (1s, 2s, 4s). After failed retries, display device frame in unavailable state with error icon and manual retry button. Transient errors show loading spinner. iframe load timeout is 10 seconds.

### Key Entities

- **Device Registry**: Collection of device type definitions including name (string), dimensions (width/height in pixels), scale (number, default 1.0), category (mobile|tablet|desktop). Initial registry includes iPhone SE (375x667), iPhone 14 Pro (393x852), iPad Air (820x1180), Desktop (1920x1080 at 0.5x scale)
- **Grid Configuration**: User's selected layout arrangement (1x, 2x, 2x2, 3x2), enabled device types (array of device IDs), device priority order, and mode toggle state. Stored in localStorage under key `teleprompter-multi-device-preview` with schema: `{ enabled: boolean, gridConfig: string, enabledDeviceTypes: string[], deviceOrder: string[], lastUpdated: number }`
- **Device Frame**: Individual preview instance containing iframe, device chrome/frame styling, sync logic, error handling, and retry state machine
- **Preview State**: Shared content state broadcast to all device frames via postMessage

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view content across at least 3 different device types simultaneously
- **SC-002**: Content changes propagate to all device previews within 100ms for ≤3 iframes or 150ms for 4-6 iframes. Timing is measured from state change to last iframe acknowledgment receipt using Performance API
- **SC-003**: Multi-device preview mode can be toggled on/off with a single click
- **SC-004**: Grid layout persists across browser sessions using localStorage
- **SC-005**: System functions without performance degradation when displaying up to 6 device frames (350MB memory limit)
- **SC-006**: Device frames display accurate representations of target device dimensions (iPhone SE: 375x667, iPhone 14 Pro: 393x852, iPad Air: 820x1180, Desktop: 1920x1080 at 0.5x scale)
- **SC-007**: Drag-and-drop reorganization completes within 200ms and maintains state

## Assumptions

1. **Memory Constraints**: Based on the brainstorm analysis, each iframe consumes approximately 50MB of memory. We assume users have sufficient memory for up to 6 concurrent previews (300MB total). The system will provide performance warnings if memory usage exceeds safe thresholds.

2. **Device Registry**: The feature will start with a predefined set of common devices (iPhone SE: 375x667, iPhone 14 Pro: 393x852, iPad Air: 820x1180, Desktop: 1920x1080 at 0.5x scale). Custom device dimensions will be supported in future iterations.

3. **Sync Performance**: The existing postMessage sync mechanism used in `usePreviewSync` will be extended using a broadcast pattern to all iframes. We assume the current sync implementation can handle multiple recipients without significant performance impact.

4. **Browser Support**: The feature targets modern browsers that support CSS Grid and Drag and Drop API. Progressive enhancement will ensure the single-device preview remains available on older browsers.

5. **Device-Specific Content**: This feature does NOT support device-specific content variants. All device previews display identical content synchronized via broadcast. Device-specific content editing is deferred to a future enhancement (P1).

## Technical Approach Summary

- Extract device frame rendering into a reusable `<DeviceFrame>` component
- Map over a configurable device registry array to render multiple frames
- Extend existing `usePreviewSync` hook to broadcast to all iframes
- Implement responsive CSS Grid layout for flexible arrangement
- Add drag-and-drop functionality using HTML5 Drag and Drop API
- Persist preferences using localStorage
