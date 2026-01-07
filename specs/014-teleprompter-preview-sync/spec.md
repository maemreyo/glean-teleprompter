# Feature Specification: Teleprompter Preview Synchronization

**Feature Branch**: `014-teleprompter-preview-sync`
**Created**: 2026-01-07
**Status**: Draft
**Input**: Fix teleprompter preview synchronization for focal point and font size settings, and add enhanced teleprompter customization options

## Clarifications

### Session 2026-01-07

- Q: Which typography enhancement settings should be added to the teleprompter preview sync specification? → A: Text alignment (left/center/right), line height (1.0-2.0), letter spacing (-2px to +10px)
- Q: Should scroll speed presets (slow/medium/fast) be added as a new teleprompter setting? → A: Yes - add predefined speed presets
- Q: Should mirroring options (for use with teleprompter glass/mirror hardware) be added? → A: Yes - add horizontal and vertical mirroring
- Q: Should background color and opacity customization be added to the teleprompter settings? → A: Yes - full color picker with opacity slider
- Q: Should safe area padding customization be added for devices with notches/cutouts? → A: Yes - customizable padding for all sides

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real-time Focal Point Preview (Priority: P1)

As a content creator using the story builder, I want to see the focal point indicator position update in the live preview immediately when I adjust the focal point slider, so that I can accurately position where the text will scroll during recording.

**Why this priority**: This is the most critical issue affecting the core user experience. Creators cannot effectively prepare their teleprompter content if the preview doesn't reflect the actual focal point position they've configured. Without this fix, the WYSIWYG experience is fundamentally broken.

**Independent Test**: Can be fully tested by opening the story builder with a teleprompter slide, adjusting the focal point slider, and verifying the yellow indicator line moves to the matching position in the preview iframe within 100ms. Delivers immediate visual feedback for content positioning.

**Acceptance Scenarios**:

1. **Given** a story builder page with a teleprompter slide open, **When** the creator adjusts the focal point slider from 50 to 75, **Then** the yellow indicator line in the preview iframe moves to the 75% position within 100ms
2. **Given** a teleprompter slide with focal point set to 30, **When** the creator switches to a different slide and back, **Then** the preview displays the focal point at 30% without requiring any additional user action
3. **Given** a new teleprompter slide with default focal point (50), **When** the slide is first rendered in preview, **Then** the yellow indicator line appears at the 50% position

---

### User Story 2 - Font Size Preview Synchronization (Priority: P2)

As a content creator, I want the font size changes I make in the builder to be reflected in the live preview, so that I can verify the text will be readable at the intended size during recording.

**Why this priority**: Font size directly affects readability and recording quality. While less critical than focal point (users can somewhat infer font size from the editor), lack of preview sync forces creators to switch to preview mode repeatedly to verify changes, disrupting their workflow.

**Independent Test**: Can be fully tested by adjusting the font size control in the teleprompter slide editor and verifying the text in the preview iframe renders at the matching size. Delivers accurate visual confirmation of text readability.

**Acceptance Scenarios**:

1. **Given** a story builder page with a teleprompter slide containing text, **When** the creator increases font size from 24px to 32px, **Then** the text in the preview iframe renders at 32px within 100ms
2. **Given** a teleprompter slide with font size set to 28px, **When** the creator switches between multiple slides, **Then** each slide's preview displays its respective font size correctly
3. **Given** a teleprompter slide with font size at minimum value (16px), **When** previewed on a mobile device viewport, **Then** the text remains readable without horizontal scrolling

---

### User Story 3 - Persistent Settings Across Slide Navigation (Priority: P1)

As a content creator working with multiple teleprompter slides, I want my focal point and font size settings to persist when I switch between slides, so that I don't lose my configurations and have to re-enter them.

**Why this priority**: This is a data loss bug that directly impacts productivity. Creators working on multi-slide stories lose their work every time they navigate, making the feature unreliable and frustrating. This breaks the fundamental expectation that settings should persist.

**Independent Test**: Can be fully tested by creating a teleprompter slide, setting focal point to 60 and font size to 30, switching to a different slide, then switching back. Delivers confidence that configuration work is preserved during navigation.

**Acceptance Scenarios**:

1. **Given** a teleprompter slide with focal point set to 65 and font size set to 30, **When** the creator switches to a different slide and then returns, **Then** both focal point and font size display the previously configured values
2. **Given** two teleprompter slides with different focal points (50 and 80), **When** the creator switches between them, **Then** each slide retains its unique focal point setting
3. **Given** a teleprompter slide with custom settings, **When** the creator refreshes the page, **Then** the settings remain applied to the slide

---

### User Story 4 - Focal Point Indicator Clarity (Priority: P3)

As a new content creator, I want to understand what the yellow line indicator represents in the teleprompter preview, so that I can effectively use it to position my content.

**Why this priority**: This is a UX enhancement that improves onboarding but doesn't block functionality. The feature works without this improvement, but users may be confused initially. Priority is lower as it doesn't cause data loss or broken workflows.

**Independent Test**: Can be fully tested by hovering over the focal point indicator in the builder and verifying a tooltip appears explaining its purpose. Delivers improved user understanding without changing core functionality.

**Acceptance Scenarios**:

1. **Given** a story builder page with a teleprompter slide, **When** the creator hovers over the yellow indicator line in the preview, **Then** a tooltip appears with text "Focal Point - Optimal reading area during recording"
2. **Given** a creator adjusting the focal point slider, **When** they hover over the indicator, **Then** the tooltip shows the current percentage value (e.g., "Focal Point: 65%")
3. **Given** the preview in playback mode, **When** the teleprompter is displayed, **Then** the indicator label is hidden to avoid cluttering the recording view

---

### User Story 5 - Enhanced Teleprompter Settings (Priority: P2)

As a content creator, I want comprehensive customization options for my teleprompter display including typography, scroll speed, mirroring, background styling, and safe area padding, so that I can adapt the teleprompter to different recording scenarios, devices, and personal preferences.

**Why this priority**: These enhancements significantly improve the teleprompter's versatility and user experience. While not as critical as the core synchronization fixes (P1), these settings address the "poor settings" limitation and enable professional teleprompter usage across various scenarios (mirror hardware, different screen sizes, accessibility needs, aesthetic preferences).

**Independent Test**: Can be fully tested by adjusting each new setting in the story builder and verifying the changes reflect in the preview iframe within 100ms. Delivers comprehensive teleprompter customization capabilities.

**Acceptance Scenarios**:

1. **Given** a story builder page with a teleprompter slide, **When** the creator adjusts text alignment to center, line height to 1.5, and letter spacing to 2px, **Then** the preview iframe reflects all typography changes within 100ms
2. **Given** a teleprompter slide with scroll speed set to "fast", **When** the creator switches to playback mode, **Then** the text scrolls at the fast preset speed
3. **Given** a creator using teleprompter mirror hardware, **When** they enable horizontal mirroring, **Then** the preview iframe displays the text flipped horizontally within 100ms
4. **Given** a teleprompter slide, **When** the creator selects a semi-transparent blue background (#0000FF at 50% opacity), **Then** the preview iframe displays the background color with correct opacity
5. **Given** a device with a notch, **When** the creator sets top safe area padding to 44px, **Then** the preview iframe respects the padding and text doesn't overlap the notch

---

### Edge Cases

- What happens when the focal point is set to extreme values (0% or 100%)?
  - System should clamp values to valid range (10%-90%) and display validation message
- How does the system handle rapid slider adjustments (multiple changes within 100ms)?
  - System should debounce updates and only render final state to avoid unnecessary re-renders
- What happens when font size exceeds viewport height on small screens?
  - System should apply max-height constraint and allow text scrolling within the preview area
- How does the system handle missing or corrupted focalPoint/fontSize values?
  - System should fall back to defaults (focalPoint: 50, fontSize: 24) and log warning
- What happens when the preview iframe fails to load or loses connection?
  - System should display connection error message and retry synchronization when connection restores
- How does the system handle simultaneous edits from multiple browser tabs?
  - System should use BroadcastChannel API to sync changes across tabs and resolve conflicts using last-write-wins
- What happens when line height is set to extreme values (1.0 or 2.0)?
  - System should clamp values to valid range (1.0-2.0) and display validation message
- What happens when letter spacing causes text to overflow viewport?
  - System should apply max-width constraint and allow horizontal scrolling if needed
- How does the system handle invalid color values for background?
  - System should validate hex format and fall back to default (#000000) with warning
- What happens when mirroring is enabled on incompatible browsers?
  - System should apply CSS transforms (scaleX/scaleY) which are widely supported; warn if not supported
- What happens when safe area padding exceeds viewport dimensions?
  - System should clamp padding values to ensure minimum content area (50% of viewport)
- How does the system handle scroll speed on different devices with varying performance?
  - System should use requestAnimationFrame for smooth scrolling and adjust timing based on device capabilities

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST synchronize focal point position changes from the story builder to the preview iframe within 100ms of user adjustment
- **FR-002**: System MUST synchronize font size changes from the story builder to the preview iframe within 100ms of user adjustment
- **FR-003**: System MUST persist focal point and font size values when switching between teleprompter slides in the editor
- **FR-004**: System MUST initialize focal point and font size from the slide's stored state when the slide editor mounts, rather than using hardcoded defaults
- **FR-005**: System MUST include `focalPoint` and `fontSize` properties in the `TeleprompterSlide` type definition in `lib/story/types.ts`
- **FR-006**: System MUST pass `focalPoint` and `fontSize` through the postMessage synchronization from builder to preview iframe
- **FR-007**: System MUST update the `convertBuilderSlideToStorySlide` function to preserve `focalPoint` and `fontSize` values during conversion
- **FR-008**: System MUST provide the `FocalPointIndicator` component with a `focalPoint` prop to receive the slide's configuration
- **FR-009**: System MUST provide the `TeleprompterContent` component with optional `focalPoint` and `fontSize` props to override store defaults in preview mode
- **FR-010**: System MUST display a tooltip or label explaining the focal point indicator when the creator hovers over it in the builder
- **FR-011**: System MUST apply default values (focalPoint: 50, fontSize: 24) when creating new teleprompter slides
- **FR-012**: System MUST validate focal point values are within range 0-100 and clamp values outside this range
- **FR-013**: System MUST validate font size values are within range 16-72 and clamp values outside this range
- **FR-014**: System MUST maintain backward compatibility with existing slides that don't have `focalPoint` or `fontSize` properties
- **FR-015**: System MUST synchronize text alignment (left, center, right) changes from builder to preview iframe within 100ms
- **FR-016**: System MUST synchronize line height (1.0-2.0) changes from builder to preview iframe within 100ms
- **FR-017**: System MUST synchronize letter spacing (-2px to +10px) changes from builder to preview iframe within 100ms
- **FR-018**: System MUST synchronize scroll speed preset (slow, medium, fast) changes from builder to preview iframe within 100ms
- **FR-019**: System MUST synchronize horizontal mirroring (enabled/disabled) state from builder to preview iframe within 100ms
- **FR-020**: System MUST synchronize vertical mirroring (enabled/disabled) state from builder to preview iframe within 100ms
- **FR-021**: System MUST synchronize background color (hex) and opacity (0-100%) changes from builder to preview iframe within 100ms
- **FR-022**: System MUST synchronize safe area padding (top, right, bottom, left in pixels) from builder to preview iframe within 100ms
- **FR-023**: System MUST include new typography properties in `TeleprompterSlide` type: `textAlign`, `lineHeight`, `letterSpacing`
- **FR-024**: System MUST include new display properties in `TeleprompterSlide` type: `scrollSpeed`, `mirrorHorizontal`, `mirrorVertical`
- **FR-025**: System MUST include new styling properties in `TeleprompterSlide` type: `backgroundColor`, `backgroundOpacity`
- **FR-026**: System MUST include new layout properties in `TeleprompterSlide` type: `safeAreaPadding` object with top, right, bottom, left
- **FR-027**: System MUST apply default values for new settings when creating new teleprompter slides: textAlign='left', lineHeight=1.4, letterSpacing=0, scrollSpeed='medium', mirrorHorizontal=false, mirrorVertical=false, backgroundColor='#000000', backgroundOpacity=100, safeAreaPadding={top:0,right:0,bottom:0,left:0}
- **FR-028**: System MUST validate line height range (1.0-2.0) and clamp values outside this range
- **FR-029**: System MUST validate letter spacing range (-2px to +10px) and clamp values outside this range
- **FR-030**: System MUST validate background opacity range (0-100%) and clamp values outside this range
- **FR-031**: System MUST validate safe area padding values (0-100px) and clamp values outside this range
- **FR-032**: System MUST maintain backward compatibility with existing slides that don't have new enhanced properties

### Key Entities

- **TeleprompterSlide**: A slide type in the story builder that displays scrolling text for recording. Key attributes include:
  - `id`: Unique identifier for the slide
  - `text`: The text content to be displayed
  - `focalPoint`: Vertical position (0-100) representing the optimal reading area during recording
  - `fontSize`: Text size in pixels (16-72) for the teleprompter display
  - `textAlign`: Text alignment setting (left, center, right)
  - `lineHeight`: Line height ratio (1.0-2.0) for text spacing
  - `letterSpacing`: Letter spacing in pixels (-2 to +10)
  - `scrollSpeed`: Scroll speed preset (slow, medium, fast)
  - `mirrorHorizontal`: Boolean flag for horizontal mirroring (for teleprompter glass)
  - `mirrorVertical`: Boolean flag for vertical mirroring
  - `backgroundColor`: Background color in hex format (#000000 default)
  - `backgroundOpacity`: Background opacity percentage (0-100)
  - `safeAreaPadding`: Object with top, right, bottom, left padding values in pixels
  - `duration`: Optional recording duration in seconds

- **BuilderSlide**: The internal representation of a slide in the story builder, containing all configuration including teleprompter-specific settings. Relationships:
  - One-to-one mapping with `TeleprompterSlide` during conversion
  - Contains `TeleprompterContent` with `focalPoint` and `fontSize` properties

- **PreviewMessage**: Data structure sent via postMessage from builder to preview iframe. Key attributes:
  - `type`: Message type identifier
  - `slides`: Array of slide data including teleprompter settings
  - `currentSlideIndex`: Index of the currently active slide

- **FocalPointIndicator**: UI component that renders the yellow line indicator in the preview. Key attributes:
  - `focalPoint`: Prop receiving the position percentage (0-100)
  - `label`: Optional label text for clarity
  - `showLabel`: Boolean to control label visibility

- **TeleprompterContent**: Component that renders the scrolling teleprompter text. Key attributes:
  - `text`: The text content to display
  - `focalPoint`: Optional prop to override store default
  - `fontSize`: Optional prop to override store default
  - `textAlign`: Optional prop for text alignment
  - `lineHeight`: Optional prop for line height
  - `letterSpacing`: Optional prop for letter spacing
  - `scrollSpeed`: Optional prop for scroll speed preset
  - `mirrorHorizontal`: Optional prop for horizontal mirroring
  - `mirrorVertical`: Optional prop for vertical mirroring
  - `backgroundColor`: Optional prop for background color
  - `backgroundOpacity`: Optional prop for background opacity
  - `safeAreaPadding`: Optional prop for safe area padding
  - `isPreview`: Boolean indicating if rendering in preview mode

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Focal point adjustments in the builder reflect in the preview within 100ms for 95% of adjustments
- **SC-002**: Font size adjustments in the builder reflect in the preview within 100ms for 95% of adjustments
- **SC-003**: Creators can switch between 10 teleprompter slides without losing any focal point or font size settings (100% data retention)
- **SC-004**: 90% of new users correctly identify the yellow line as the focal point indicator when shown the tooltip
- **SC-005**: Zero data loss incidents occur during slide navigation after implementing the initialization fix
- **SC-006**: Preview synchronization successfully handles rapid adjustments (5+ changes within 1 second) without performance degradation
- **SC-007**: Existing stories without `focalPoint` or `fontSize` properties continue to function with default values (100% backward compatibility)
- **SC-008**: Enhanced teleprompter settings (alignment, line height, letter spacing, scroll speed, mirroring, background, safe area) synchronize to preview within 100ms for 95% of adjustments
- **SC-009**: Creators can customize teleprompter for mirror hardware (horizontal/vertical mirroring) and verify in preview before recording
- **SC-010**: Creators can adjust background color/opacity and see changes in preview to optimize readability for different lighting conditions
- **SC-011**: Creators can set safe area padding to prevent text overlap with device notches/cutouts
- **SC-012**: All new enhanced settings persist correctly during slide navigation (100% data retention)
- **SC-013**: Existing stories without enhanced properties function with default values (100% backward compatibility)

## Technical Context

### Current Architecture

The teleprompter preview system uses a builder-to-preview iframe communication pattern:

1. **Builder Side**: `usePreviewSync` hook in `lib/story-builder/hooks/usePreviewSync.ts` sends slide data via postMessage
2. **Conversion**: `convertBuilderSlideToStorySlide` in `app/story-preview/page.tsx` transforms builder slides to story slides
3. **Preview Side**: Preview iframe receives messages and updates its local `useTeleprompterStore` instance

### Root Causes Identified

1. **Type System Gap**: `TeleprompterSlide` in `lib/story/types.ts` doesn't define `focalPoint` or `fontSize` properties, while `TeleprompterContent` in `lib/story-builder/types.ts` does
2. **Conversion Loss**: The `convertBuilderSlideToStorySlide` function discards `focalPoint` and `fontSize` during transformation
3. **Component Props**: `FocalPointIndicator` has no prop to receive focal point value, uses hardcoded constants (33% or 38%)
4. **Editor Initialization**: `TeleprompterSlideEditor` initializes with hardcoded value (50) instead of reading from slide prop

### Implementation Scope

This specification addresses **Phase 1** of the teleprompter preview improvements, focusing on:
1. Core synchronization and data persistence issues for existing settings (focalPoint, fontSize)
2. Enhanced teleprompter settings including:
   - Typography customization (textAlign, lineHeight, letterSpacing)
   - Scroll speed presets (slow, medium, fast)
   - Mirroring options for teleprompter glass hardware (horizontal, vertical)
   - Background styling (color with opacity slider)
   - Safe area padding for devices with notches/cutouts

Multi-form factor support (responsive aspect ratios, adaptive typography) is deferred to a future phase.

### Dependencies

- Existing postMessage infrastructure in `usePreviewSync`
- Zustand stores for state management
- TypeScript type definitions in `lib/story/types.ts` and `lib/story-builder/types.ts`
- CSS transforms for mirroring (scaleX, scaleY) - widely supported across browsers
- Color picker component (react-colorful already in use per project guidelines)
- requestAnimationFrame for smooth scroll speed implementation
- CSS custom properties for dynamic background color/opacity
