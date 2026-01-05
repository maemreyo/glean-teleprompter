# Feature Specification: Standalone Story with Teleprompter

**Feature Branch**: `012-standalone-story`  
**Created**: 2026-01-05  
**Status**: Draft  
**Input**: User description: "Create a comprehensive specification for the standalone story feature using the speckit.specify workflow"

## Clarifications

### Session 2026-01-05

- Q: What authentication and access control mechanism should the standalone story viewer implement? → A: No authentication - stories are publicly viewable by anyone with the URL
- Q: What level of observability (logging, metrics, analytics) should the standalone story viewer implement for production monitoring and debugging? → A: No observability - no logging, metrics, or analytics (minimal implementation)
- Q: When both Wake Lock API and NoSleep.js fallback fail to keep the screen awake, what should the teleprompter experience be? → A: Block usage - prevent teleprompter mode and show error message
- Q: What should happen when a user tries to view a story URL that contains malformed or invalid JSON data? → A: Block with error - show error screen and prevent viewing
- Q: When the NoSleep.js external library fails to load from the CDN (network error, CDN down), what should happen? → A: Block teleprompter - show error if browser lacks Wake Lock API

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mobile Story Viewer (Priority: P1)

A content creator opens the standalone story viewer on their mobile device to review a teleprompter script. The viewer displays a 9:16 aspect ratio story with multiple slides including text highlights, images, and interactive widgets. The creator taps to navigate between slides, watches progress bars animate at the top, and experiences smooth transitions.

**Why this priority**: This is the foundation of the entire feature. Without a working story viewer, no other functionality can be delivered. It represents the core user value proposition.

**Independent Test**: Can be fully tested by creating a story with 3-5 slides of different types and verifying that users can view, navigate, and see progress indicators without any teleprompter functionality.

**Acceptance Scenarios**:

1. **Given** a story with 5 slides, **When** user opens the story, **Then** the first slide displays in 9:16 aspect ratio with progress bars for all slides visible at the top
2. **Given** user is viewing slide 3, **When** user taps the right side of screen, **Then** slide 4 appears with smooth animation and progress bar 3 becomes 100% complete
3. **Given** user is viewing slide 1, **When** user taps the left side of screen, **Then** nothing happens (already at first slide)
4. **Given** a slide with 5-second duration, **When** the slide displays, **Then** its progress bar animates from 0% to 100% over 5 seconds
5. **Given** user pauses the story, **When** the story is paused, **Then** progress bars stop animating and resume when unpaused

---

### User Story 2 - Teleprompter Reading Experience (Priority: P1)

A user activates the teleprompter slide mode to read a long script. The text scrolls automatically at a comfortable reading speed with a focal point indicator showing where to focus. The user adjusts the scrolling speed, font size, and even enables mirror mode for use with a teleprompter glass device. Progress updates sync to the story's progress bar based on scroll depth rather than time.

**Why this priority**: This is the core differentiator and primary value proposition of the feature. It delivers the teleprompter capability that users cannot get from standard story viewers.

**Independent Test**: Can be fully tested by loading a teleprompter slide with long text content and verifying that auto-scrolling works, speed adjustments take effect in real-time, and progress bar updates based on scroll position percentage.

**Acceptance Scenarios**:

1. **Given** a teleprompter slide with long text, **When** user taps "Start Reading", **Then** text begins scrolling smoothly with a yellow focal indicator at 33% from top
2. **Given** text is scrolling at speed 1.5, **When** user moves speed slider to 3.0, **Then** scrolling speed increases immediately without interruption
3. **Given** text is scrolling, **When** user taps "Pause", **Then** scrolling stops smoothly with deceleration (not abrupt stop)
4. **Given** text has scrolled 50% through content, **When** user checks the progress bar, **Then** the current slide's progress bar shows 50% complete
5. **Given** user increases font size from 28px to 36px, **When** font size changes, **Then** the reading position (scroll ratio) is maintained at the same relative location
6. **Given** user enables mirror mode, **When** mirror is active, **Then** the entire content displays horizontally flipped (scaleX(-1))

---

### User Story 3 - Screen Wake Lock Management (Priority: P1)

A user is reading a teleprompter script that takes several minutes. Without any interaction, the device's screen would normally sleep after 30-60 seconds. The story viewer prevents this by requesting a wake lock, keeping the screen active throughout the reading session. If the user switches tabs and returns, the wake lock automatically re-requests.

**Why this priority**: Without wake lock, the teleprompter becomes unusable for any script longer than a minute. This is a critical failure point that would make the feature fundamentally broken.

**Independent Test**: Can be fully tested by opening a teleprompter slide, enabling auto-scroll, and verifying the screen stays awake for 2+ minutes without user interaction. Test both Wake Lock API (Chrome) and NoSleep.js fallback (Safari).

**Acceptance Scenarios**:

1. **Given** user is viewing a teleprompter slide with auto-scroll active, **When** 2 minutes pass without user interaction, **Then** the screen remains awake (does not sleep)
2. **Given** wake lock is active, **When** user switches to another browser tab, **Then** wake lock releases automatically
3. **Given** user returns to the story tab after switching away, **When** the tab becomes visible again, **Then** wake lock automatically re-requests
4. **Given** user stops scrolling and exits the teleprompter slide, **When** scrolling stops, **Then** wake lock releases to allow normal screen sleep behavior

---

### User Story 4 - Safe Area & Notch Handling (Priority: P2)

A user views the story on an iPhone with Dynamic Island. The content automatically adjusts padding to account for the notch and home indicator, ensuring no text is obscured by hardware features. The focal point adjusts from 33% to 38% from top to accommodate the safe area.

**Why this priority**: This ensures the feature works correctly on modern mobile devices. While not blocking functionality, poor safe area handling would make the teleprompter unusable on iPhones.

**Independent Test**: Can be fully tested by viewing the story on an iPhone with Dynamic Island or Android with notch and verifying all content is visible and readable without being cut off.

**Acceptance Scenarios**:

1. **Given** user views story on iPhone with Dynamic Island, **When** the teleprompter slide loads, **Then** content has additional padding at top equal to env(safe-area-inset-top)
2. **Given** user views story on device with notch, **When** focal indicator displays, **Then** it positions at 38vh from top (adjusted from 33vh)
3. **Given** user views story on device with home indicator, **When** content scrolls, **Then** bottom padding prevents text from being hidden by home indicator
4. **Given** user rotates device from portrait to landscape, **When** orientation changes, **Then** safe area insets recalculate and content adjusts accordingly

---

### User Story 5 - Gesture Conflict Prevention (Priority: P2)

A user is reading a teleprompter script and accidentally taps the screen while scrolling. Normally, tapping would advance to the next slide, but in teleprompter mode, tap zones are disabled. The user must explicitly tap a "Skip to next" button in the control panel to advance, preventing accidental navigation during reading.

**Why this priority**: This prevents frustrating user experiences where accidental taps cause loss of reading position. It's a critical UX improvement for the teleprompter use case.

**Independent Test**: Can be fully tested by activating teleprompter mode and tapping various areas of the screen, verifying that taps do NOT advance slides, and only the "Skip to next" button advances.

**Acceptance Scenarios**:

1. **Given** user is viewing a teleprompter slide with scrolling active, **When** user taps anywhere on the screen, **Then** the slide does NOT change (no accidental advancement)
2. **Given** user taps the screen while teleprompter is active, **When** user taps center area, **Then** the control panel appears (but slide does not change)
3. **Given** user wants to advance from teleprompter slide, **When** user taps "Skip to next" button in control panel, **Then** the story advances to the next slide
4. **Given** user is viewing a non-teleprompter slide (e.g., image), **When** user taps right side of screen, **Then** the story advances normally (tap zones active for non-teleprompter slides)

---

### User Story 6 - Performance & Battery Optimization (Priority: P3)

A user reads a very long teleprompter script (10,000+ words) for 30 minutes. The story viewer maintains smooth 30fps scrolling without excessive battery drain or device heating. Virtual scrolling renders only visible content, and scroll progress updates are throttled to 100ms intervals.

**Why this priority**: While not blocking, poor performance would make the feature unusable for long-form content. This ensures the feature works well for real-world use cases.

**Independent Test**: Can be fully tested by loading a teleprompter slide with 10,000 words, enabling auto-scroll for 30 minutes, and monitoring FPS (stays above 25fps), battery usage (reasonable), and device temperature (no excessive heating).

**Acceptance Scenarios**:

1. **Given** teleprompter slide with 10,000 words, **When** auto-scrolling is active for 30 minutes, **Then** scrolling maintains 30fps or higher
2. **Given** long content is scrolling, **When** user monitors battery usage, **Then** battery drain is comparable to normal video playback (not excessive)
3. **Given** virtual scrolling is enabled, **When** only 20 paragraphs are visible in viewport, **Then** only those 20 paragraphs are rendered in DOM (not all 10,000 words)
4. **Given** scroll position updates, **When** progress callback triggers, **Then** updates are throttled to maximum once per 100ms

---

### User Story 7 - Auto-Save & Recovery (Priority: P3)

A user is reading a teleprompter script when the browser crashes or the tab closes unexpectedly. When the user reopens the story, their reading position is automatically restored, allowing them to continue from where they left off. Progress is saved to localStorage every 2 seconds.

**Why this priority**: This provides resilience against crashes and interruptions. While not core functionality, it significantly improves user experience for long-form content.

**Independent Test**: Can be fully tested by reading a teleprompter script to 50% completion, force-closing the browser, reopening to the story, and verifying the reading position is restored to 50%.

**Acceptance Scenarios**:

1. **Given** user has read 50% of a teleprompter script, **When** browser tab closes and reopens, **Then** the story offers to restore reading position to 50%
2. **Given** user is actively scrolling, **When** 2 seconds pass, **Then** current scroll ratio is saved to localStorage
3. **Given** user has saved progress at 75%, **When** user declines to restore on reopen, **Then** the story starts from the beginning (0%)

---

### User Story 8 - Keyboard Shortcuts & Accessibility (Priority: P3)

A user on a desktop device uses keyboard shortcuts to control the teleprompter. Space bar toggles play/pause, arrow up/down adjust speed, and 'r' resets to top. The teleprompter also supports screen readers with proper ARIA labels and high contrast mode for visual accessibility.

**Why this priority**: This extends the feature to desktop users and ensures accessibility compliance. While mobile-first, desktop support enables additional use cases.

**Independent Test**: Can be fully tested by opening the story on desktop, pressing keyboard shortcuts, and verifying expected behaviors. Test with screen reader to ensure proper announcements.

**Acceptance Scenarios**:

1. **Given** user is viewing teleprompter on desktop, **When** user presses Space key, **Then** scrolling toggles between play and pause
2. **Given** scrolling is active, **When** user presses ArrowUp key, **Then** scroll speed increases by 0.2
3. **Given** scrolling is active, **When** user presses ArrowDown key, **Then** scroll speed decreases by 0.2
4. **Given** user has scrolled to middle, **When** user presses 'r' key, **Then** scroll position resets to top (0%)
5. **Given** screen reader is active, **When** teleprompter slide loads, **Then** proper ARIA labels announce "Teleprompter content, use arrow keys to control speed"
6. **Given** user has high contrast mode enabled, **When** teleprompter displays, **Then** text shows as white on black background (maximum contrast)

---

### Edge Cases

- What happens when the teleprompter text is shorter than the viewport height (no scrolling needed)?
  - Auto-scrolling should disable automatically and display a message "Content fits on screen - manual scroll only"
  
- What happens when user manually scrolls while auto-scrolling is active?
  - Auto-scrolling should pause immediately and show a toast "Auto-scroll paused - tap to resume"
  
- What happens when the Wake Lock API is not supported (older browsers)?
  - Fallback to NoSleep.js library should activate automatically
  - If NoSleep.js fails to load from CDN (network error, CDN down) AND browser lacks Wake Lock API, block teleprompter mode and show error message "Screen wake lock not available - please try a different browser or check your network connection"

- What happens when a user opens a story URL with malformed or invalid JSON data?
  - Block viewing and show error screen with message "Invalid story data - please check the URL or contact the story creator"
  - Provide no option to continue viewing partially valid content
  
- What happens when device orientation changes mid-scroll?
  - Scroll ratio should be preserved, total scroll height recalculated, and position restored to same percentage
  
- What happens when user rapidly changes font size multiple times?
  - Each change should anchor to the same scroll position ratio, preventing layout shift
  
- What happens when progress bar synchronization fails (callback not received)?
  - Progress bar should fall back to time-based animation for teleprompter slide (though less accurate)
  
- What happens when localStorage is quota exceeded (saving progress)?
  - Gracefully handle error, continue without saving, and log warning to console
  
- What happens when user has very long content (>50,000 words)?
  - Virtual scrolling must activate automatically to render only visible paragraphs
  
- What happens when browser tab is inactive (backgrounded) for >5 minutes?
  - Auto-scrolling should pause automatically to prevent wasting resources
  
- What happens when mirror mode is enabled on a non-teleprompter slide?
  - Mirror mode should have no effect (only applies to teleprompter slides)

## Requirements *(mandatory)*

### Functional Requirements

**Story Viewer Core**

- **FR-001**: System MUST display story content in 9:16 aspect ratio (vertical orientation) optimized for mobile viewing
- **FR-002**: System MUST render different slide types including text-highlight, widget-chart, image, poll, and teleprompter
- **FR-003**: System MUST display one progress bar per slide at the top of the story viewer
- **FR-004**: System MUST animate progress bars from 0% to 100% based on slide duration for non-teleprompter slides
- **FR-005**: System MUST support tap gestures for navigation: left side (previous), right side (next), center (pause/resume)
- **FR-006**: System MUST preload slides +1 and +2 ahead of current slide to prevent loading delays
- **FR-007**: System MUST use CSS custom property `--vh` to fix mobile viewport height issues (address bar overlap)
- **FR-008**: System MUST support slide transitions with animations: slide-in, fade, and zoom effects
- **FR-009**: System MUST automatically advance slides after duration expires (unless duration is 'manual')
- **FR-010**: System MUST support pause/resume for time-based slides

**Teleprompter Functionality**

- **FR-011**: System MUST display teleprompter slides with a focal point indicator at 33% from top (38% with safe area)
- **FR-012**: System MUST provide top and bottom gradient overlays (35vh each) to fade content outside focal point
- **FR-013**: System MUST automatically scroll text content from bottom to top using requestAnimationFrame
- **FR-014**: System MUST allow real-time speed adjustment from 0 to 5 during active scrolling without interruption
- **FR-015**: System MUST calculate and display scroll depth percentage (0-100%) for progress synchronization
- **FR-016**: System MUST sync progress bar to scroll depth percentage (not time-based) for teleprompter slides
- **FR-017**: System MUST provide font size controls ranging from 16px to 48px (default 28px)
- **FR-018**: System MUST maintain scroll position ratio (percentage) when font size changes
- **FR-019**: System MUST support mirror mode (horizontal flip) for teleprompter glass compatibility
- **FR-020**: System MUST provide a floating control panel with speed slider, font controls, mirror toggle, and play/pause
- **FR-021**: System MUST auto-hide control panel after 3 seconds of inactivity
- **FR-022**: System MUST show control panel when user taps anywhere on teleprompter slide
- **FR-023**: System MUST disable tap-to-next navigation for teleprompter slides
- **FR-024**: System MUST provide a "Skip to next" button in the control panel for explicit slide advancement
- **FR-025**: System MUST stop scrolling smoothly with deceleration when user pauses (not abrupt stop)
- **FR-026**: System MUST auto-detect end of content and trigger slide completion when scroll reaches bottom

**Wake Lock & Screen Management**

- **FR-027**: System MUST request Wake Lock API when teleprompter scrolling is active on supported browsers
- **FR-028**: System MUST fallback to NoSleep.js library when Wake Lock API is not supported (Safari/iOS)
- **FR-029**: System MUST re-request wake lock when user returns to tab after switching away (visibility change)
- **FR-030**: System MUST release wake lock when scrolling stops or user exits teleprompter slide

**Safe Area & Layout**

- **FR-031**: System MUST use CSS `env(safe-area-inset-*)` for padding on devices with notches/Dynamic Island
- **FR-032**: System MUST adjust focal point position from 33vh to 38vh when safe area is detected
- **FR-033**: System MUST apply minimum 2rem padding plus safe area insets to content edges
- **FR-034**: System MUST handle orientation changes by recalculating layout and preserving scroll ratio

**Performance & Optimization**

- **FR-035**: System MUST implement virtual scrolling for content exceeding 50 paragraphs
- **FR-036**: System MUST throttle scroll progress updates to maximum once per 100ms
- **FR-037**: System MUST apply GPU acceleration (transform: translateZ(0)) for smooth scrolling
- **FR-038**: System MUST disable text selection (user-select: none) to prevent lag during scrolling
- **FR-039**: System MUST use React.memo for heavy widget components to prevent unnecessary re-renders
- **FR-040**: System MUST maintain 30fps or higher during active scrolling

**Data Persistence & Recovery**

- **FR-041**: System MUST save teleprompter reading progress to localStorage every 2 seconds
- **FR-042**: System MUST store slide ID and scroll ratio (0-1) in saved progress data
- **FR-043**: System MUST offer to restore reading position when user reopens a previously viewed teleprompter slide
- **FR-044**: System MUST handle localStorage quota exceeded errors gracefully (continue without saving)

**Accessibility & Keyboard Control**

- **FR-045**: System MUST support keyboard shortcuts: Space (play/pause), ArrowUp (speed+), ArrowDown (speed-), r (reset)
- **FR-046**: System MUST provide ARIA labels for all interactive elements
- **FR-047**: System MUST set role="region" and aria-live="polite" on teleprompter content area
- **FR-048**: System MUST support high contrast mode with white text on black background
- **FR-049**: System MUST display current WPM (Words Per Minute) based on scroll speed (speed × 150 = WPM)

**Error Handling & Edge Cases**

- **FR-050**: System MUST detect when content height is less than viewport and disable auto-scrolling
- **FR-051**: System MUST pause auto-scrolling when user manually scrolls the content
- **FR-052**: System MUST recalculate scroll height after font size changes
- **FR-053**: System MUST pause auto-scrolling when browser tab becomes inactive (visibilitychange API)
- **FR-054**: System MUST block teleprompter mode and display error message when wake lock is not available and NoSleep.js fallback also fails or fails to load from CDN
- **FR-055**: System MUST validate story JSON data on load and block viewing with error screen if data is malformed or invalid

### Key Entities

**Story Script**
- Represents a complete story with multiple slides
- Attributes: id, title, array of slides, autoAdvance setting, showProgress setting
- Relationships: Contains multiple Slide entities

**Slide**
- Represents a single piece of content in the story
- Attributes: id, type (text-highlight/widget-chart/image/poll/teleprompter), content (text), data (widget-specific), duration (milliseconds or 'manual'), animation settings, effects
- Relationships: Belongs to one Story Script

**Teleprompter State**
- Represents the runtime state of an active teleprompter slide
- Attributes: scrollSpeed (0-5), fontSize (16-48), isScrolling (boolean), isMirrored (boolean), scrollPosition (pixels), scrollDepth (0-100%), totalScrollHeight (pixels)
- Relationships: Associated with one active Teleprompter Slide

**Reading Progress**
- Represents saved user progress through a teleprompter script
- Attributes: slideId, scrollRatio (0-1), timestamp
- Relationships: Links to one Slide for restoration

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view and navigate through a 10-slide story with less than 100ms delay between slide transitions
- **SC-002**: Teleprompter scrolling maintains 30fps or higher on mid-range mobile devices (iPhone 12 or equivalent)
- **SC-003**: Screen wake lock prevents device sleep for 100% of users on supported browsers for sessions lasting 10+ minutes
- **SC-004**: 95% of users can complete reading a 5,000-word teleprompter script without accidental slide advancement
- **SC-005**: Content remains fully visible and readable on 100% of modern mobile devices (including iPhone with Dynamic Island) without being obscured by hardware features
- **SC-006**: Font size changes maintain reading position with less than 5% deviation from original scroll location
- **SC-007**: Progress bar accurately reflects scroll depth for teleprompter slides with less than 2% error margin
- **SC-008**: 90% of users can successfully restore their reading position after an unexpected browser closure
- **SC-009**: Virtual scrolling reduces DOM nodes by 90% for long-form content (10,000+ words) compared to rendering all content
- **SC-010**: Battery drain during 30 minutes of teleprompter usage is within 20% of standard video playback battery consumption
- **SC-011**: 100% of keyboard shortcuts function correctly on desktop browsers (Chrome, Firefox, Safari, Edge)
- **SC-012**: Screen reader can successfully announce teleprompter content and controls with 100% coverage of interactive elements
- **SC-013**: Auto-scrolling resumes within 500ms after user switches back to an inactive tab
- **SC-014**: Control panel appears within 100ms after user taps on teleprompter slide
- **SC-015**: Mirror mode correctly flips content horizontally as verified by displaying reversed text that appears normal when viewed through a physical teleprompter glass

## Security & Privacy

- **Public Access**: Stories are publicly viewable by anyone with the URL without requiring authentication or user accounts
- **No Personal Data Collection**: The standalone story viewer does not collect, store, or transmit any personal user data
- **Local Storage Only**: Reading progress is stored locally in the user's browser localStorage and never transmitted to external servers
- **URL-Based Sharing**: Story access is controlled through URL distribution; anyone with the URL can view the story

### Observability & Monitoring

- **No Production Logging**: The standalone story viewer does not implement any logging, metrics, or analytics for production use
- **Development Console Only**: Errors are logged to browser console for development debugging only
- **No External Services**: No integration with external logging, monitoring, or analytics services
- **Privacy-First Approach**: No user behavior tracking or telemetry data collection

## Assumptions

1. **Browser Support**: The feature targets modern browsers (Chrome 90+, Safari 14+, Firefox 88+, Edge 90+) that support Wake Lock API or can use NoSleep.js fallback. Older browsers will show a warning about potential screen sleep.

2. **No Authentication Required**: The story viewer is completely public and does not require any form of user authentication or account creation.

3. **Mobile-First Design**: The primary use case is mobile devices in portrait orientation. Desktop support is provided for accessibility and testing but is not the primary target.

4. **Standalone Implementation**: This feature is completely independent from the existing teleprompter application. It does not share state, components, or data structures with the main app.

5. **Data Source**: Story scripts are provided as JSON objects. The spec does not define how scripts are created, stored, or loaded—only how they are displayed and interacted with.

5. **Network Conditions**: The feature assumes a reasonable network connection for preloading assets. Offline support is not explicitly defined but could be added as PWA enhancements.

6. **Content Limits**: Individual slides are expected to have content that fits within reasonable memory limits. Virtual scrolling handles long text content, but individual slides are assumed to be <1MB of content.

7. **Device Capabilities**: Target devices have touchscreens for gesture control. Keyboard shortcuts are provided for desktop accessibility but touch is the primary interaction method.

8. **Safe Area Support**: Devices without safe area insets (older Android devices, desktop) will simply render with standard 2rem padding without issues.

9. **Performance Baseline**: "Mid-range mobile device" is defined as iPhone 12 (2020) or equivalent Android device released in same year. Performance requirements are based on this baseline.

10. **Storage Availability**: localStorage is assumed to be available with reasonable quota (>5MB). Quota errors are handled gracefully but are expected to be rare.

11. **Wake Lock Limitations**: Some devices may impose system-level restrictions on wake locks (e.g., low battery mode). The feature requests wake lock but respects system decisions.

12. **Teleprompter Glass Usage**: Mirror mode is designed for use with physical teleprompter glass (beamsplitter mirrors). The feature assumes users understand how to position their device relative to the glass.

13. **Reading Speed**: The WPM calculation (speed × 150) assumes average reading speed. Users with different reading abilities can adjust using speed slider.

14. **Accessibility Standards**: WCAG 2.1 AA compliance is the target for accessibility features. This includes color contrast, keyboard navigation, and screen reader support.

15. **Testing Coverage**: While not explicitly defined, success criteria imply that automated and manual testing will cover all major user flows and edge cases.
