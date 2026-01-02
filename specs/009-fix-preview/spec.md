# Feature Specification: Fix Preview Inconsistency

**Feature Branch**: `001-fix-preview`
**Created**: 2026-01-02
**Status**: Draft
**Input**: User description: "Fix preview inconsistency between studio setup mode and full preview dialog. The FullPreviewDialog component doesn't display background images because it doesn't use bgUrl from useContentStore, while PreviewPanel correctly shows them."

## Clarifications

### Session 2026-01-02

- Q: When the background image URL fails to load (404, network error, invalid URL, or CORS issue), what should the preview display? → A: Show the teleprompter content without the background and display a subtle "image failed to load" indicator
- Q: When a background image is removed (set to empty/null) or cleared by the user, what should both preview modes display? → A: Show the teleprompter text on the default theme background
- Q: When loading very large background images (e.g., 4K+ resolution, 5MB+ files), what should the preview display during the loading period? → A: Show the previous state (or default background) with a subtle loading indicator
- Q: For the 100ms update latency success criterion (SC-002), what is the maximum acceptable file size for background images to meet this performance target? → A: 5MB maximum
- Q: When switching between different templates with different background configurations, how should the preview modes handle the transition? → A: Immediately apply the new template's background (if set) or show default

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consistent Background Preview (Priority: P1)

As a content creator preparing a teleprompter script, I need to see the exact same background image in both the inline preview panel and the full preview dialog so that I can trust the preview and adjust my settings confidently.

**Why this priority**: This is the core issue - visual inconsistency between two preview modes undermines user confidence and makes the full preview dialog unreliable for verifying settings before recording.

**Independent Test**: Can be fully tested by opening studio setup mode, uploading or selecting a background image, observing both the inline preview panel and full preview dialog to verify identical background display.

**Acceptance Scenarios**:

1. **Given** the user is in studio setup mode with a background image configured, **When** they view the inline PreviewPanel, **Then** the background image must be displayed correctly
2. **Given** the user is in studio setup mode with a background image configured, **When** they click the Preview button to open FullPreviewDialog, **Then** the background image must be displayed identically to the inline preview
3. **Given** the user has no background image configured, **When** they view either preview mode, **Then** both must show the same default/empty state

---

### User Story 2 - Real-time Preview Updates (Priority: P2)

As a content creator adjusting teleprompter settings, I need both preview modes to update immediately when I change settings so that I can see the impact of my changes without delay.

**Why this priority**: Ensures the fix works dynamically as settings change, not just on initial load. Lower priority than Story 1 because the visual inconsistency must be fixed first.

**Independent Test**: Can be tested by changing background image settings in studio setup mode and verifying both preview panels update to reflect the new background immediately.

**Acceptance Scenarios**:

1. **Given** the user is viewing the inline preview, **When** they change the background image in settings, **Then** the preview must update to show the new background
2. **Given** the user has the full preview dialog open, **When** they change the background image in settings, **Then** the full preview dialog must update to show the new background
3. **Given** the user has both preview modes visible, **When** they change settings, **Then** both must update simultaneously to maintain visual consistency

---

### Edge Cases

- **Invalid background image URL**: When the background image URL fails to load (404, network error, invalid URL, or CORS issue), the preview displays the teleprompter content without the background and shows a subtle "image failed to load" indicator. This ensures the preview remains usable while providing user feedback.
- **Background image removed**: When a background image is removed (set to empty/null) or cleared by the user, both preview modes display the teleprompter text on the default theme background. This provides clear visual feedback that no custom background is configured.
- **Template switching**: When switching between different templates with different background configurations, both preview modes immediately apply the new template's background (if set) or show the default background. This provides instant visual feedback and prevents stale state during template changes.
- **Background changed while dialog open**: When the background image is changed while FullPreviewDialog is open, the dialog updates immediately to show the new background without requiring close/reopen. This is achieved through reactive state subscription to bgUrl changes in useContentStore.
- How does the preview behave when the background image is changed while the full dialog is open?
- **Large image loading**: When loading large background images (e.g., 4K+ resolution, 5MB+ files), the preview displays the previous state (or default background) with a subtle loading indicator during the loading period. This maintains visual continuity while providing feedback that an image is loading, preventing layout shifts and jarring visual transitions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The FullPreviewDialog component MUST display the background image from the same source as PreviewPanel
- **FR-007**: Background images MUST support files up to 5MB in size to balance image quality with loading performance
- **FR-002**: Both PreviewPanel and FullPreviewDialog MUST render identically when the same settings are applied
- **FR-003**: Changes to background settings in studio setup mode (including template switches) MUST reflect immediately in both preview modes without requiring manual refresh or dialog reopen
- **FR-004**: The system MUST handle invalid background image URLs gracefully by displaying the teleprompter content without the background and showing a subtle "image failed to load" indicator
- **FR-005**: When no background image is configured, both preview modes MUST display the teleprompter text on the default theme background
- **FR-006**: Background image changes MUST propagate to both preview modes without requiring page refresh or dialog close/reopen
- **FR-007**: The preview rendering logic MUST be consistent between PreviewPanel and FullPreviewDialog

### Key Entities

- **Background Image**: User-configured visual backdrop for teleprompter display, sourced from URL (bgUrl property in content store)
- **Preview Modes**: Two visual preview interfaces - inline PreviewPanel (always visible in setup mode) and FullPreviewDialog (opened via Preview button)
- **Content Store**: State management source providing bgUrl and other content settings to components

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: FullPreviewDialog displays background images identical to PreviewPanel in 100% of test cases with configured backgrounds
- **SC-002**: Both preview modes update within 100ms of background setting changes (for images up to 5MB; larger images may take longer but must show loading state)
- **SC-003**: No visual differences detectable between inline preview and full preview dialog when viewing same configuration
- **SC-004**: Users successfully verify teleprompter appearance using full preview dialog with accuracy equal to inline preview
- **SC-005**: Zero support tickets related to preview inconsistency after deployment
- **SC-006**: Background images up to 5MB load and render correctly in both preview modes without performance degradation

## Assumptions

- The bgUrl value is correctly managed in useContentStore (existing working implementation)
- PreviewPanel correctly displays background images (confirmed working reference implementation)
- The issue is isolated to FullPreviewDialog not accessing the bgUrl from content store
- Users expect visual consistency between all preview modes in the application
