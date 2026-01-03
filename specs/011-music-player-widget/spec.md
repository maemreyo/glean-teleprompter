# Feature Specification: Floating Music Player Widget

**Feature Branch**: `011-music-player-widget`  
**Created**: 2026-01-03  
**Status**: Draft  
**Input**: User description: "Floating Music Player Widget with three visual styles (Capsule, Vinyl, Spectrum) for background music in Runner mode"

## Clarifications

### Session 2026-01-03

- **Q: Vinyl Rotation Speed Mechanism** → **A: Manual RPM presets (33⅓, 45, 78) + optional custom BPM input** - Users select rotation speed manually through preset options or custom BPM value. No automatic tempo detection will be implemented to ensure reliability and performance during teleprompter scrolling.
- **Q: Widget Z-Index Layering Strategy** → **A: Dynamic z-index that auto-increments when clicked** - Widget will use a dynamic z-index management system that brings it to the front when clicked, allowing multiple floating widgets (camera, music player) to coexist without permanent overlap.
- **Q: File Management UI for Quota Recovery** → **A: Link to settings page only** - When quota is exceeded, error messages will provide a link to navigate to the settings page where users can manage and delete existing audio files. No inline file browser or dedicated management UI will be built.
- **Q: Cross-Tab Source Change Behavior** → **A: Update active source immediately** - When one tab changes the music source, all other tabs will immediately update their active source reference to match. This ensures consistency across all open tabs.
- **Q: Spectrum Visualization Fidelity** → **A: Document the limitation** - Spectrum visualization will use simulated animation (pseudo-random pattern) for YouTube sources due to CORS restrictions. Real frequency analysis via Web Audio API will only be available for uploaded audio files. The spec should be updated to clarify this technical constraint.

---

## User Scenarios & Testing *(mandatory)*

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Music Source Selection & Widget Style Configuration (Priority: P1)

As a content creator, I want to configure background music settings for my teleprompter sessions so that I can have appropriate audio accompaniment while recording or practicing my scripts.

**Why this priority**: This is the foundational capability - without music source and style selection, no other features can function. Users must be able to set up their music before they can interact with the player widget.

**Independent Test**: Can be fully tested by accessing settings, selecting a music source (YouTube URL or file upload), choosing a widget style from visual previews, and verifying that preferences persist across browser sessions. Delivers value by enabling music configuration even before Runner mode is accessed.

**Acceptance Scenarios**:

1. **Given** I am in the teleprompter settings interface, **When** I navigate to the music configuration section, **Then** I MUST see options to select music source (YouTube URL or file upload) and three visual style previews (Capsule, Vinyl, Spectrum)
2. **Given** I have selected "YouTube URL" as music source, **When** I enter a valid YouTube URL and save, **Then** the URL MUST be stored and available in Runner mode
3. **Given** I have selected "File Upload" as music source, **When** I upload an audio file, **Then** the file MUST be stored in my account and available in Runner mode
4. **Given** I am viewing widget style options, **When** I hover over each style option (Capsule, Vinyl, Spectrum), **Then** I MUST see a live preview of what that style looks like
5. **Given** I have selected a widget style, **When** I save my settings, **Then** my selection MUST persist to local storage and sync to my cloud account (if logged in)
6. **Given** I have not configured any music source, **When** I access the settings, **Then** I MUST see a clear indication that no music is configured and guidance on how to set it up

---

### User Story 2 - Floating Draggable Widget in Runner Mode (Priority: P2)

As a content creator using Runner mode, I want a floating music player widget that I can drag anywhere on screen so that it doesn't obstruct my teleprompter text while I'm recording or practicing.

**Why this priority**: This is the core interactive experience - users need to see and control their music without it interfering with the primary teleprompter display. This provides the essential player functionality.

**Independent Test**: Can be fully tested by entering Runner mode with a configured music source, verifying the widget appears, dragging it to different positions, using play/pause controls, and confirming position persistence. Delivers value by enabling music playback control during teleprompter use.

**Acceptance Scenarios**:

1. **Given** I have configured a music source in settings, **When** I enter Runner mode, **Then** a music player widget MUST appear in its last saved position (or default position if first use)
2. **Given** I have not configured any music source, **When** I enter Runner mode, **Then** NO music player widget MUST appear
3. **Given** the music player widget is visible, **When** I click and drag the widget, **Then** it MUST follow my cursor/finger with smooth inertia physics (slight deceleration when released)
4. **Given** I have dragged the widget to a new position, **When** I release it, **Then** the position MUST be saved to local storage immediately
5. **Given** I exit and re-enter Runner mode, **When** the widget appears, **Then** it MUST be in the last saved position
6. **Given** the music player widget is visible, **When** I click the play/pause button, **Then** the music MUST toggle between playing and paused states with visual feedback (icon change or animation state)
7. **Given** the music player widget is visible, **When** I press the "M" key on my keyboard, **Then** the music MUST toggle between playing and paused states
8. **Given** I am playing music, **When** I navigate away from Runner mode or close the browser tab, **Then** the music MUST stop playing

---

### User Story 3 - Audio Visualization & Style-Specific Animations (Priority: P3)

As a content creator, I want to choose from three distinct music player styles (Capsule, Vinyl, and Spectrum) with unique animations so that I can match my personal aesthetic or recording environment.

**Why this priority**: This enhances user experience and personalization but is not essential for core functionality. Users can still play and control music with a basic style, but visual variety provides delight and matches different use cases (professional vs. creative).

**Independent Test**: Can be fully tested by selecting each widget style in settings, entering Runner mode, and verifying that the correct visual style appears with its unique animations for both play and pause states. Delivers value by providing visual customization options.

**Acceptance Scenarios**:

1. **Given** I have selected "Capsule" style in settings, **When** I enter Runner mode with music configured, **Then** I MUST see a glassmorphic pill-shaped widget with frosted glass effect
2. **Given** the Capsule style widget is playing music, **When** music is active, **Then** I MUST see a subtle pulsing glow effect that syncs with the music rhythm
3. **Given** the Capsule style widget is paused, **When** music is paused, **Then** the pulsing glow MUST stop and the widget MUST show a reduced opacity "sleeping" state
4. **Given** I have selected "Vinyl" style in settings, **When** I enter Runner mode with music configured, **Then** I MUST see a circular widget that resembles a vinyl record
5. **Given** the Vinyl style widget is playing music, **When** music is active, **Then** the record MUST rotate continuously at a speed proportional to the music tempo
6. **Given** the Vinyl style widget is paused, **When** music is paused, **Then** the record rotation MUST slow down and stop gradually with a deceleration animation
7. **Given** I have selected "Spectrum" style in settings, **When** I enter Runner mode with music configured, **Then** I MUST see a widget with multiple vertical bars representing audio frequencies
8. **Given** the Spectrum style widget is playing music, **When** music is active, **Then** the bars MUST animate dynamically, with heights corresponding to audio frequency levels in real-time
9. **Given** the Spectrum style widget is paused, **When** music is paused, **Then** the bars MUST settle to a baseline flat line with minimal movement
10. **Given** my system preferences indicate reduced motion preference, **When** I view any widget style, **Then** all animations MUST be disabled or significantly reduced while maintaining core functionality

---

### Edge Cases

- What happens when a YouTube URL becomes invalid or the video is removed?
  - System MUST display an error message in the widget indicating the music source is unavailable and provide a link to reconfigure
- What happens when the uploaded audio file exceeds storage quota?
  - System MUST display a clear error message explaining the storage limit and provide options to upgrade storage or delete existing files
- What happens when the user drags the widget outside the visible viewport?
  - System MUST constrain widget position to keep at least 50% of the widget within the visible viewport at all times
- What happens when music is playing and the user switches to a different browser tab?
  - Music MUST continue playing in the background, with widget position and state preserved when returning to the tab
- What happens when the user's device has a slow internet connection affecting YouTube streaming?
  - System MUST display a loading indicator and buffer music appropriately without blocking the teleprompter functionality
- What happens when two teleprompter sessions are open simultaneously (e.g., in different tabs)?
  - Each session MUST maintain independent widget positions, but music playback in one tab SHOULD pause music in other tabs to prevent audio conflicts
- What happens when the user's screen is resized (desktop window resize or mobile orientation change)?
  - Widget position MUST be automatically adjusted to remain within the visible viewport, maintaining relative position when possible
- What happens when an audio file format is not supported by the browser?
  - System MUST display a clear error message listing supported formats and prompt the user to upload a compatible file

## Requirements *(mandatory)*

### Functional Requirements

**Configuration Requirements**

- **FR-001**: System MUST allow users to select music source from two options: YouTube URL or file upload
- **FR-002**: System MUST validate YouTube URLs to ensure they point to valid video content before saving
- **FR-003**: System MUST support audio file uploads in common formats (MP3, WAV, M4A, OGG) with maximum file size of 50MB per file
- **FR-004**: System MUST display three widget style options (Capsule, Vinyl, Spectrum) with visual previews in settings
- **FR-005**: System MUST persist music configuration (source URL or file reference, selected style) to local storage
- **FR-006**: System MUST sync music configuration to cloud storage when user is logged in

**Widget Display Requirements**

- **FR-007**: System MUST display the music player widget in Runner mode ONLY when a music source has been configured
- **FR-008**: System MUST render the widget in the selected visual style (Capsule, Vinyl, or Spectrum)
- **FR-009**: System MUST position the widget in the last saved position, or a default non-obtrusive position (e.g., bottom-right corner with margin) on first use
- **FR-010**: System MUST maintain the widget's visibility above the teleprompter text (z-index layering)
- **FR-011**: System MUST ensure the widget does not obscure the primary teleprompter controls (play/pause, speed adjustment, etc.)

**Interaction Requirements**

- **FR-012**: System MUST allow users to drag the widget to any position within the viewport using mouse or touch input
- **FR-013**: System MUST apply inertia physics to widget movement, providing natural deceleration when the user releases the drag
- **FR-014**: System MUST constrain widget position to keep at least 50% of the widget within the visible viewport
- **FR-015**: System MUST save widget position to local storage immediately after drag operation completes
- **FR-016**: System MUST provide play/pause control button within the widget
- **FR-017**: System MUST toggle music playback state when play/pause button is activated
- **FR-018**: System MUST toggle music playback state when "M" keyboard shortcut is pressed
- **FR-019**: System MUST provide visual feedback indicating current playback state (playing vs. paused)

**Playback Requirements**

- **FR-020**: System MUST play audio from YouTube URLs through an embedded audio player
- **FR-021**: System MUST play uploaded audio files directly from cloud storage
- **FR-022**: System MUST stop audio playback when user navigates away from Runner mode or closes the browser tab
- **FR-023**: System MUST pause audio playback in other teleprompter tabs when playback starts in the current tab
- **FR-024**: System MUST handle audio loading errors gracefully with clear error messages and recovery options

**Visual Style Requirements**

**Note**: Due to YouTube CORS restrictions, Spectrum style visualization uses simulated animation (pseudo-random pattern) for YouTube sources. Real frequency analysis via Web Audio API is only available for uploaded audio files.

- **FR-025**: System MUST render Capsule style as a pill-shaped widget with glassmorphic visual design (frosted glass effect)
- **FR-026**: System MUST render Vinyl style as a circular widget resembling a vinyl record with grooves
- **FR-027**: System MUST render Spectrum style as a multi-bar frequency display
- **FR-028**: System MUST animate Capsule style with a pulsing glow effect synchronized to music rhythm when playing
- **FR-029**: System MUST animate Capsule style with reduced opacity and static state when paused
- **FR-030**: System MUST animate Vinyl style with continuous rotation at speed proportional to music tempo when playing
- **FR-031**: System MUST animate Vinyl style with gradual deceleration to stop when paused
- **FR-032**: System MUST animate Spectrum style with dynamic bar heights corresponding to real-time audio frequency levels when playing
- **FR-033**: System MUST animate Spectrum style with baseline flat line and minimal movement when paused
- **FR-034**: System MUST respect user's motion preference settings by disabling or reducing animations when reduced motion is preferred

**Persistence Requirements**

- **FR-035**: System MUST save music configuration (source, style) to local storage
- **FR-036**: System MUST save widget position to local storage after each drag operation
- **FR-037**: System MUST load music configuration from local storage on page load
- **FR-038**: System MUST load widget position from local storage on Runner mode entry
- **FR-039**: System MUST sync configuration to cloud storage when user is authenticated
- **FR-040**: System MUST retrieve configuration from cloud storage when local storage is empty and user is authenticated

### Key Entities

- **Music Configuration**: Stores user's music settings including source type (YouTube URL or uploaded file), source URL/reference, selected widget style, and last modified timestamp
- **Widget State**: Represents the current state of the music player including position (x, y coordinates), playback state (playing/paused), and currently selected style
- **Audio File**: Represents an uploaded audio file with attributes including file name, file size, format, storage reference, and upload date
- **Widget Style Definition**: Defines visual properties for each of the three styles (Capsule, Vinyl, Spectrum) including dimensions, colors, animation types, and accessibility labels

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can configure music source and select widget style in under 60 seconds from first access to settings
- **SC-002**: Widget position persists correctly across 100% of browser sessions (same device/browser)
- **SC-003**: Music configuration syncs to cloud within 5 seconds of saving changes when user is authenticated
- **SC-004**: Widget drag interaction responds within 16ms (60fps) providing smooth, fluid movement
- **SC-005**: Keyboard shortcut (M key) toggles playback within 100ms of key press
- **SC-006**: 95% of users successfully complete music configuration on first attempt without errors
- **SC-007**: Widget remains fully functional during music playback with no impact on teleprompter scrolling performance (maintains 60fps)
- **SC-008**: All three widget styles render correctly across 98% of modern browsers (Chrome, Firefox, Safari, Edge versions from last 2 years)
- **SC-009**: Users can identify and switch between widget styles in under 10 seconds
- **SC-010**: System handles audio playback errors gracefully with user-friendly error messages 100% of the time

## Assumptions

1. Users have a modern web browser that supports HTML5 audio playback and CSS animations
2. YouTube URLs provided by users are publicly accessible and do not require additional authentication
3. Users have sufficient local storage capacity for storing music configuration and widget position (typically < 1KB)
4. Cloud storage integration uses the existing Supabase infrastructure already present in the application
5. Audio file uploads are subject to the same storage quota limits as other user data in the system
6. The teleprompter's Runner mode is already a functional feature where this widget will be integrated
7. Users are familiar with standard drag-and-drop interactions in web applications
8. The "M" keyboard shortcut for music toggle does not conflict with existing teleprompter keyboard shortcuts
9. Reduced motion preference is detected through standard browser accessibility APIs
10. Audio playback duration is limited to the length of the selected audio source (YouTube video or uploaded file)
11. Users understand that YouTube URL availability depends on the video remaining accessible on YouTube's platform

## Scope Boundaries

**In Scope**:
- Background music playback in Runner mode only
- Three predefined visual styles (Capsule, Vinyl, Spectrum)
- YouTube URL and file upload as music sources
- Local storage and cloud sync for configuration persistence
- Basic play/pause controls only (no volume, seek, or playlist functionality)
- Single audio track per session
- Drag and drop positioning within the viewport

**Out of Scope**:
- Music playback in Studio (editor) mode
- Custom widget styles or user-designed themes
- Additional music sources (Spotify, Apple Music, etc.)
- Volume control, seeking, or looping functionality
- Playlist management or multiple audio tracks
- Widget minimize/maximize functionality
- Audio recording or mixing capabilities
- Music visualization beyond the three specified styles
- Widget transparency or opacity controls
- Multiple widgets on screen simultaneously
