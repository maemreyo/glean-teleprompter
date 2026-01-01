# Feature Specification: Unified State Architecture

**Feature Branch**: `007-unified-state-architecture`  
**Created**: 2026-01-01  
**Status**: Draft  
**Input**: User description: "Fix editor-runner preview discrepancy by unifying state architecture. Currently Editor uses useConfigStore for styling while Runner uses legacy useTeleprompterStore properties, causing visual inconsistencies. Implement unified architecture with clear separation: useContentStore for content (text, bgUrl, musicUrl), useConfigStore for ALL styling (typography, colors, effects, layout, animations), usePlaybackStore for playback state (isPlaying, currentTime, scrollSpeed), and useUIStore for UI state (mode, panel visibility). Update Runner to use useConfigStore for styling, remove legacy properties from useTeleprompterStore, and ensure single source of truth for teleprompter configuration. Add minimal Quick Settings to Runner for common adjustments (scroll speed, font size, alignment, background) while keeping Editor as primary configuration interface."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consistent Visual Preview (Priority: P1)

A user configuring their teleprompter in the Editor sees a preview that exactly matches what will appear when they switch to Runner mode. Currently, visual discrepancies occur because Editor uses useConfigStore for styling while Runner uses legacy properties from useTeleprompterStore (font, colorIndex, fontSize, align, speed, etc.). The user expects that the font, size, colors, and layout they configure in the Editor will be preserved when they start running the teleprompter.

**Why this priority**: This is the core problem causing user frustration and confusion. Without visual consistency, users cannot trust the preview, making the configuration interface unreliable.

**Independent Test**: Can be tested by configuring a teleprompter in Editor (setting font size to 60px, changing text alignment to left, adjusting colors) and then switching to Runner. The visual appearance should match exactly between Editor preview and Runner display.

**Acceptance Scenarios**:

1. **Given** a user has configured font size to 60px in Editor, **When** they switch to Runner mode, **Then** the text displays at 60px
2. **Given** a user has set text alignment to left in Editor, **When** they switch to Runner mode, **Then** the text remains left-aligned
3. **Given** a user has configured gradient colors in Editor, **When** they switch to Runner mode, **Then** the same gradient appears on the text
4. **Given** a user has enabled text effects (outline, glow, shadow) in Editor, **When** they switch to Runner mode, **Then** all effects are applied identically

---

### User Story 2 - Quick Adjustments in Runner (Priority: P2)

A user running their teleprompter needs to make quick on-the-fly adjustments without returning to the Editor. They should be able to adjust the most common settings (scroll speed, font size, text alignment, and background) directly from the Runner interface while preserving the full configuration available in Editor.

**Why this priority**: While not critical for basic functionality, this significantly improves user experience by allowing real-time adjustments during recording or performance without interrupting the flow.

**Independent Test**: Can be tested by starting the teleprompter in Runner mode and using the Quick Settings panel to adjust scroll speed, font size, alignment, and background. Changes should apply immediately and persist when returning to Editor.

**Acceptance Scenarios**:

1. **Given** a user is in Runner mode, **When** they adjust scroll speed via Quick Settings, **Then** the scrolling speed changes immediately
2. **Given** a user is in Runner mode, **When** they adjust font size via Quick Settings, **Then** the text resizes immediately and the change is reflected in Editor
3. **Given** a user is in Runner mode, **When** they change text alignment via Quick Settings, **Then** the text alignment changes immediately
4. **Given** a user makes changes in Runner Quick Settings, **When** they return to Editor, **Then** all changes are reflected in the configuration panel

---

### User Story 3 - Clean State Architecture (Priority: P3)

Developers maintaining the codebase need a clear, separated state architecture that follows single responsibility principles. The current mixed state in useTeleprompterStore (containing both content data and styling properties) makes the code difficult to maintain and prone to bugs.

**Why this priority**: While not user-facing, this is essential for long-term maintainability and prevents future bugs from state confusion.

**Independent Test**: Can be verified by code review confirming that useContentStore only contains content (text, bgUrl, musicUrl), useConfigStore only contains styling, usePlaybackStore only contains playback state, and useUIStore only contains UI state.

**Acceptance Scenarios**:

1. **Given** the new state architecture, **When** examining useContentStore, **Then** it contains content properties (text, bgUrl, musicUrl) and editor mutability state (isReadOnly)
2. **Given** the new state architecture, **When** examining useConfigStore, **Then** it contains ALL styling properties (typography with real font names, colors, effects, layout, animations with autoScrollSpeed)
3. **Given** the new state architecture, **When** examining usePlaybackStore, **Then** it only contains runtime playback state (isPlaying, currentTime, scrollSpeed for tracking, separate from config)
4. **Given** the new state architecture, **When** examining useUIStore, **Then** it contains UI state (mode for app view state, panel visibility states) and useTeleprompterStore no longer exists

---

### Edge Cases

- When a user adjusts a setting in Runner Quick Settings that conflicts with a preset loaded in Editor, the last-write-wins approach applies (Runner change takes precedence, overwriting preset values with visual indication)
- Simultaneous state updates from both Editor and Runner are handled via last-write-wins with optimistic UI updates through Zustand's state management
- If a Quick Settings action in Runner fails to update useConfigStore (validation error, storage quota exceeded), the system MUST show a toast error notification using Sonner and revert the UI control to its last valid state

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST maintain a single source of truth for all teleprompter styling configuration in useConfigStore
- **FR-002**: System MUST create new useContentStore and migrate content properties (text, bgUrl, musicUrl) from useTeleprompterStore
- **FR-003**: System MUST create new usePlaybackStore and migrate playback state (isPlaying, currentTime, scrollSpeed for runtime tracking) from useTeleprompterStore
- **FR-004**: System MUST separate UI and workflow state into useUIStore (mode for app view state, panel visibility states) and add isReadOnly to useContentStore (editor mutability state)
- **FR-005**: System MUST completely remove useTeleprompterStore after all properties are migrated: text, bgUrl, musicUrl → useContentStore; font, colorIndex, fontSize, align, lineHeight, margin, overlayOpacity, speed → useConfigStore; isPlaying, currentTime → usePlaybackStore; mode → useUIStore; isReadOnly → useContentStore
- **FR-006**: System MUST update Runner component to read all styling from useConfigStore instead of legacy useTeleprompterStore properties
- **FR-007**: System MUST provide collapsible floating Quick Settings panel in Runner using Radix components for scroll speed, font size, alignment, and background adjustments
- **FR-008**: System MUST ensure that changes made in Runner Quick Settings are immediately reflected in Editor's useConfigStore using Zustand's built-in pub/sub subscribe() mechanism
- **FR-009**: System MUST ensure that changes made in Editor are immediately reflected when switching to Runner mode
- **FR-010**: System MUST completely remove useTeleprompterStore and update all references to use new stores
- **FR-011**: System MUST provide visual indication in Editor when settings have been modified via Runner Quick Settings using both badge/dot indicator on controls AND subtle color change on modified fields; indication MUST be cleared immediately upon manual change of that specific setting in Editor
- **FR-012**: System MUST update tests incrementally - each test MUST be updated to use new store mocks when the code it tests is migrated to use the new stores

### Key Entities

- **useContentStore** (new): Content data and editor state. Attributes: text (string), bgUrl (string), musicUrl (string), isReadOnly (boolean)
- **useConfigStore** (existing, extended): All visual styling settings. Attributes: typography (font family using real font names, size, weight, spacing), colors (primary, gradients, outline, glow), effects (shadow, outline, glow, backdrop), layout (alignment, margins, columns), animations (autoScrollSpeed in pixels/sec, scroll behavior, entrance effects)
- **usePlaybackStore** (new): Playback state for runtime. Attributes: isPlaying (boolean), currentTime (number), scrollSpeed (number for runtime tracking, separate from autoScrollSpeed config)
- **useUIStore** (existing): Interface state for navigation and visibility. Attributes: mode ('setup' | 'running'), panel visibility states
- **useTeleprompterStore** (deprecated): Legacy store to be completely removed after all properties are migrated to their new homes

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Visual appearance of teleprompter in Editor preview matches Runner display with 100% accuracy for all styling properties
- **SC-002**: Changes made in Runner Quick Settings are reflected in Editor within 100 milliseconds
- **SC-003**: Code review confirms useTeleprompterStore is completely removed from codebase
- **SC-004**: Users can adjust the four Quick Settings (scroll speed, font size, alignment, background) in Runner within 3 seconds
- **SC-005**: Documentation confirms each store has single responsibility with no overlapping concerns

## Clarifications

### Session 2026-01-01

- Q: How should the new stores (useContentStore, usePlaybackStore) be created? → A: Create new stores and migrate properties from useTeleprompterStore
- Q: How should the visual indication (badge/dot indicator) in Editor be cleared when a user manually changes a setting that was previously modified via Runner Quick Settings? → A: Clear indication immediately upon manual change of that specific setting
- Q: Should the existing localStorage data with useTeleprompterStore keys be migrated to the new store keys, or should it be cleared entirely since the app is unpublished? → A: Clear entirely, no migration needed
- Q: What mechanism should be used for state synchronization between Editor and Runner to achieve the 100ms target? → A: Zustand's built-in pub/sub with subscribe()
- Q: How should the system handle a Quick Settings action in Runner that fails to update useConfigStore (e.g., validation error, storage quota exceeded)? → A: Show toast error + revert UI to last valid state
- Q: How should existing tests that currently mock or use useTeleprompterStore be handled during the migration? → A: Update each test when migrating the code it tests
- Q: When should legacy state migration occur? → A: Not needed - app unpublished, remove useTeleprompterStore entirely, use new stores directly
- Q: How should the Quick Settings panel in Runner be displayed? → A: Collapsible floating panel (overlay) using Radix components
- Q: How should simultaneous state updates from Editor and Runner be handled? → A: Last-write-wins with optimistic UI updates
- Q: What visual indication should be shown in Editor when settings are modified via Runner Quick Settings? → A: Both badge/dot indicator AND subtle color change on affected controls

### Session 2026-01-01 (Second Clarification)

- Q: How should `scrollSpeed` be mapped across the new architecture given legacy `speed` (multiplier 1-10) vs existing `autoScrollSpeed` (pixels/sec)? → A: Keep separate - `autoScrollSpeed` stays in useConfigStore.animations (styling configuration), `scrollSpeed` in usePlaybackStore (runtime playback state). This maintains clear separation: useConfigStore defines what the styling looks like, usePlaybackStore tracks the current playback velocity. Quick Settings will adjust `autoScrollSpeed` in useConfigStore, which affects both preview and playback.
- Q: Where should the `mode` property live given that the spec says useUIStore should contain it, but useTeleprompterStore currently owns it and mode is workflow/navigation state, not UI preference? → A: Add `mode` ('setup' | 'running') to useUIStore as app view state. While mode represents workflow, it fundamentally controls what UI view is shown (Editor vs Runner), making it appropriate for useUIStore alongside panel visibility and other UI state.
- Q: What localStorage migration/cleanup strategy should be used for new stores given that useConfigStore uses 'teleprompter-config' key? → A: Not applicable - app is unpublished, no existing users, no legacy data to migrate. New stores can use fresh localStorage keys without cleanup concerns.
- Q: How should font family be handled given legacy useTeleprompterStore.font uses FontStyle preset enum ('Classic' | 'Modern' | etc.) but useConfigStore.typography.fontFamily uses actual CSS font family names ('Inter', 'Roboto', etc.)? → A: Use real font family names only in useConfigStore, matching the current design. The FontStyle preset enum was a legacy abstraction that should be removed entirely. All font selection should use actual font family names directly.
- Q: What should happen to useTeleprompterStore after migration, given remaining properties `mode` and `isReadOnly` don't cleanly fit the four-store architecture? → A: Distribute remaining properties meaningfully: `mode` ('setup' | 'running') → useUIStore (app view state), `isReadOnly` → useContentStore (editor mutability state). This allows complete removal of useTeleprompterStore as specified in FR-010, with all properties assigned to semantically appropriate stores.

## Assumptions

1. Existing useConfigStore is stable and can be extended to handle all styling needs
2. useUIStore already exists and handles mode/panel visibility (may need verification)
3. Local storage persistence will be maintained for new stores; existing useTeleprompterStore localStorage data will be cleared entirely (no migration)
4. Users primarily configure in Editor and only need quick adjustments in Runner
5. The four Quick Settings (scroll speed, font size, alignment, background) cover 80% of in-flight adjustment needs
6. App is unpublished - no legacy data migration needed; useTeleprompterStore will be completely removed
7. New stores (useContentStore, usePlaybackStore) will be created fresh to replace useTeleprompterStore entirely
