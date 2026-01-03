# Feature Specification: Fix Runner Mode Settings Not Applying

**Feature Branch**: `010-runner-settings`  
**Created**: 2026-01-02  
**Status**: Draft  
**Input**: User description: "Fix Runner mode settings not applying: scroll speed changes ignored due to hardcoded interval, and background URL changes not rendering due to unstable style reference. Both settings work correctly in Setup Preview mode but fail in Runner mode."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real-time Scroll Speed Control (Priority: P1)

As a presenter using Runner mode, I want scroll speed adjustments in the QuickSettingsPanel to affect the teleprompter scrolling rate immediately, so that I can control the reading pace in real-time without restarting playback.

**Why this priority**: This is the most critical issue as it affects the core functionality of the teleprompter. Users cannot control their reading speed during playback, which defeats the purpose of having speed controls in Runner mode.

**Independent Test**: Can be fully tested by entering Runner mode, starting auto-scroll, adjusting the speed slider, and verifying the scroll rate changes immediately. Delivers direct user value by enabling real-time pace control.

**Acceptance Scenarios**:

1. **Given** I am in Runner mode with auto-scroll active, **When** I adjust the speed slider to a different value, **Then** the scrolling rate changes immediately without pausing or resuming
2. **Given** I have paused auto-scroll, **When** I change the speed setting and resume playback, **Then** the new speed is applied correctly
3. **Given** I set auto-scroll speed to X pixels/second, **When** I measure scrolling over 1 second, **Then** the text scrolls at approximately X pixels (±5% tolerance)
4. **Given** I am actively scrolling, **When** I make multiple rapid speed adjustments, **Then** each change takes effect smoothly without creating multiple scrolling intervals

---

### User Story 2 - Live Background Customization (Priority: P2)

As a presenter customizing the Runner display, I want background URL changes in Runner QuickSettingsPanel to render immediately, so that I can see the visual impact of background changes without exiting Runner mode.

**Why this priority**: While important for visual consistency, this is a lower priority than scroll speed as it affects customization rather than core playback functionality. Users can still set backgrounds in Setup mode before entering Runner mode.

**Independent Test**: Can be fully tested by entering Runner mode, changing the background URL in QuickSettingsPanel, and verifying the background image updates immediately. Delivers value by enabling seamless visual adjustments during presentation setup.

**Acceptance Scenarios**:

1. **Given** I am in Runner mode, **When** I change the background URL in QuickSettingsPanel, **Then** the background image updates immediately on the display
2. **Given** I have set a background in Setup Preview, **When** I enter Runner mode, **Then** the same background appears with no visual difference
3. **Given** the background image is loading, **When** the image loads successfully, **Then** the visual transition is smooth with approximately 1-second fade duration
4. **Given** I am in Runner mode, **When** I switch between multiple background URLs in sequence, **Then** each change renders correctly without flickering or missing images

---

### Edge Cases

- **Invalid URL**: System reverts to previous valid background URL
- **Load failure (404, network error)**: System reverts to previous valid background URL
- **Speed at 0**: Auto-scroll pauses automatically (isPlaying set to false)
- **Speed at maximum (200 px/sec)**: System should not cause performance issues or rendering problems
- **Large background files**: System should not block rendering while loading; files >5 MB show warning
- **Rapid URL changes**: System should handle without memory leaks or stale image references
- **Rapid speed changes**: Debounced with 100ms delay to prevent multiple interval recalculations
- **Speed changes during playback**: No visual feedback required; scrolling rate adjusts implicitly
- **Browser close/reopen**: Scroll speed persists via localStorage

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST apply scroll speed changes in Runner mode within 100ms of user adjustment (after 100ms debounce)
- **FR-002**: System MUST calculate scroll interval dynamically based on configured auto-scroll speed (pixels per second)
- **FR-003**: System MUST update scroll rate during active playback without requiring pause/resume
- **FR-004**: System MUST render background URL changes in Runner mode within 200ms of user input
- **FR-005**: System MUST maintain visual consistency between Setup Preview and Runner mode for background images
- **FR-006**: System MUST persist speed and background settings across mode switches (Setup ↔ Runner) and browser sessions (localStorage)
- **FR-007**: System MUST handle invalid background URLs by reverting to previous valid URL
- **FR-008**: System MUST prevent multiple scroll intervals from running simultaneously during rapid speed changes (via debouncing)
- **FR-009**: System MUST apply background changes smoothly with approximately 1-second transition duration
- **FR-010**: System MUST maintain scroll speed setting across pause/resume cycles
- **FR-011**: System MUST pause auto-scroll when speed is set below 10 pixels/second (isPlaying = false)
- **FR-012**: System MUST persist scroll speed to localStorage to survive browser sessions

### Key Entities

- **Scroll Speed Configuration**: Represents the target scrolling rate in pixels per second (range: 10-200), persisted in user configuration store
- **Background URL**: Represents the image URL for teleprompter background, persisted in content store with validation for supported formats
- **Scroll Interval**: Calculated runtime value determining milliseconds between scroll increments, derived from scroll speed configuration

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can adjust scroll speed during active playback and see changes take effect within 100ms
- **SC-002**: Scroll rate accuracy is within ±5% of configured pixels per second value
- **SC-003**: Background URL changes render in Runner mode within 200ms of user input
- **SC-004**: Visual consistency between Setup Preview and Runner mode backgrounds is 100% (no visible differences)
- **SC-005**: Zero performance degradation or memory leaks from rapid setting changes
- **SC-006**: Settings persist correctly across 100% of mode switches (Setup ↔ Runner)
- **SC-007**: System handles invalid background URLs gracefully with 100% success rate (no crashes or hangs)

## Clarifications

### Session 2026-01-02

- **Q**: When scroll speed is set to 0 or below minimum threshold, what should happen? → **A**: Pause auto-scroll (set isPlaying to false)
- **Q**: What visual feedback should users see when scroll speed is changed during active playback? → **A**: No visual feedback (change is implicit - scrolling rate adjusts immediately)
- **Q**: How should the system handle rapid consecutive speed changes (e.g., user drags slider quickly)? → **A**: Debounce changes with 100ms delay
- **Q**: What should happen when a background image fails to load (network error, 404, etc.)? → **A**: Revert to previous valid background URL
- **Q**: Should scroll speed settings persist across different browser sessions (localStorage) or only during current session? → **A**: Persist to localStorage (survives browser close)

## Assumptions

- Auto-scroll speed range is 10-200 pixels per second (based on existing configuration)
- When speed is set below 10 pixels/second, auto-scroll pauses automatically (isPlaying = false)
- Speed changes during playback provide no visual feedback; rate adjustment is implicit
- Background images are standard web formats (JPG, PNG, WebP, GIF)
- Invalid background URLs revert to previous valid URL or default background
- Background images larger than 5 MB show a size warning but still load
- Users primarily adjust settings during pauses, but real-time changes should also work
- Transition duration for background changes is approximately 1 second (based on existing CSS classes)
- Browser background-image caching may cause some delay in rendering changes
