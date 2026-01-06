# Feature Specification: Visual Drag-and-Drop Story Builder

**Feature Branch**: `013-visual-story-builder`
**Created**: 2026-01-06
**Status**: Draft
**Source Context**: Brainstorm: .zo/brainstorms/012-standalone-story-2026-01-06-0815.md (Idea: #1)

## Overview

A visual, Instagram-inspired story builder that eliminates manual JSON encoding. Users create stories by dragging and dropping beautiful slide cards, with real-time mobile preview and one-click URL generation.

**Why this matters**: Current story creation requires manual JSON editing and URL encoding - a process that takes 30+ minutes and is error-prone. This feature reduces that to 5 minutes through intuitive visual editing.

---

## User Scenarios & Testing

### User Story 1 - Drag-and-Drop Slide Creation (Priority: P1)

Users create stories by dragging slide type cards from a library and dropping them into a story rail, eliminating manual JSON writing.

**Why this priority**: This is the core value proposition - replacing manual JSON encoding with visual interaction. Without this, the feature doesn't exist.

**Independent Test**: Can be fully tested by creating a story with 3 different slide types via drag-and-drop, then exporting the URL to verify encoding works correctly.

**Acceptance Scenarios**:

1. **Given** a user is on the story builder page, **When** they drag a "Text" slide card from the slide library to the story rail, **Then** the slide appears in the story rail with a visual thumbnail
2. **Given** a slide is in the story rail, **When** the user drags it to a new position, **Then** the slide reorders with snap animation and the preview updates
3. **Given** a user has added multiple slides, **When** they click the "Copy URL" button, **Then** the system encodes all slides to JSON, compresses it, and copies a valid story URL to clipboard
4. **Given** a user drags a slide over the story rail, **When** they hover over a valid drop position, **Then** a visual drop indicator appears showing where the slide will be inserted

---

### User Story 2 - Real-Time Mobile Preview (Priority: P2)

Users see a live 9:16 mobile preview of their story that updates instantly as they edit slides, providing immediate visual feedback.

**Why this priority**: Preview is essential for confidence in story creation, but the builder can function without it (users can test via the generated URL). This enables rapid iteration but isn't blocking.

**Independent Test**: Can be tested by editing slide properties and verifying the preview updates within 100ms without page reload.

**Acceptance Scenarios**:

1. **Given** a user has added a slide with text content, **When** they type in the text editor, **Then** the mobile preview updates within 100ms showing the new text
2. **Given** a user adjusts the teleprompter focal point slider, **When** they move the slider, **Then** the preview shows the text position changing in real-time
3. **Given** a user has a story with 5 slides, **When** they click through slides in the story rail, **Then** the preview instantly switches to show the selected slide
4. **Given** a user changes slide duration, **When** they adjust the duration slider, **Then** the preview shows the updated time without flicker or lag

---

### User Story 3 - Template Gallery (Priority: P3)

Users can start with pre-built story templates to accelerate creation, providing common layouts like "product announcement", "tutorial", "Q&A".

**Why this priority**: Templates accelerate workflows but aren't essential - users can still build stories from scratch. This is an enhancement to improve adoption.

**Independent Test**: Can be tested by selecting a template and verifying it pre-populates the story rail with configured slides.

**Acceptance Scenarios**:

1. **Given** a user is on the story builder page, **When** they click the "Templates" button and select "Product Announcement", **Then** the story rail populates with 4 pre-configured slides (intro, features, demo, CTA)
2. **Given** a user has selected a template, **When** they modify any template slide, **Then** those modifications persist as normal user edits
3. **Given** a user selects a template, **When** they click "Copy URL", **Then** the generated URL contains the template-based story with all their customizations

---

## Edge Cases

- What happens when the user drags a slide outside the browser window?
  - The slide returns to its original position with a spring animation
- What happens when the generated URL exceeds browser length limits (~2MB)?
  - System shows a warning toast and disables the "Copy URL" button with a message: "Story too large for URL encoding. Consider reducing slide count or media size."
- What happens when a user uploads an image larger than 5MB?
  - System shows inline error: "Image too large. Please use images under 5MB." and rejects the upload
- How does the system handle rapid slide reordering (spamming drag operations)?
  - Drag operations are debounced with 100ms throttle; only the final drop position is applied
- What happens when localStorage is disabled or full?
  - System falls back to session-only storage and shows warning: "Auto-save unavailable. Your story will be lost if you close this tab."

---

## Requirements

### Functional Requirements

**Slide Management**
- **FR-001**: System MUST allow users to drag slide type cards from a library panel to a story rail
- **FR-002**: System MUST provide slide type cards for: Text, Image, Teleprompter, Poll, and Widget
- **FR-003**: System MUST allow users to reorder slides in the story rail via drag-and-drop
- **FR-004**: System MUST remove slides from the story rail when a user clicks the delete button on a slide card
- **FR-005**: System MUST limit stories to maximum 20 slides to prevent URL length overflow

**Visual Editing**
- **FR-006**: System MUST provide a text editor for Text slides with formatting controls (bold, italic, color)
- **FR-007**: System MUST provide an image uploader for Image slides with preview
- **FR-008**: System MUST provide a focal point adjustment control for Teleprompter slides
- **FR-009**: System MUST provide a duration slider (1-60 seconds) for all slide types
- **FR-010**: System MUST allow users to customize slide background color via a color picker

**Real-Time Preview**
- **FR-011**: System MUST display a 9:16 mobile preview panel that updates within 100ms of any edit
- **FR-012**: System MUST show the active slide highlighted in the story rail with a gradient border
- **FR-013**: System MUST allow clicking slide cards in the story rail to switch the preview to that slide
- **FR-014**: System MUST display slide duration and transition type in the preview header

**URL Generation**
- **FR-015**: System MUST generate a shareable URL when users click the "Copy URL" button
- **FR-016**: System MUST encode the story to JSON, compress with gzip, and base64-encode for the URL
- **FR-017**: System MUST validate the generated URL can be decoded and displays the story correctly
- **FR-018**: System MUST show a success toast message when URL is copied to clipboard
- **FR-019**: System MUST show an error message if URL generation fails (e.g., encoding error)

**Auto-Save**
- **FR-020**: System MUST automatically save the current story to localStorage every 30 seconds
- **FR-021**: System MUST restore the last auto-saved story when the user returns to the builder page
- **FR-022**: System MUST show an indicator when auto-save occurs: "Saved just now"

**Templates**
- **FR-023**: System MUST provide a template gallery with at least 3 pre-built templates
- **FR-024**: System MUST allow users to select a template to pre-populate the story rail
- **FR-025**: System MUST treat template slides as normal slides that can be edited or deleted

### Key Entities

**Story**
- Represents a complete story with ordered slides
- Attributes: id (string), slides (array of Slide), createdAt (timestamp), lastModified (timestamp)

**Slide**
- Represents a single story slide
- Attributes: id (string), type (enum: text, image, teleprompter, poll, widget), content (object), duration (number, seconds), backgroundColor (string, hex)

**SlideType**
- Represents available slide types in the library
- Attributes: type (enum), name (string), icon (string), description (string), defaultContent (object)

**Template**
- Represents a pre-built story layout
- Attributes: id (string), name (string), description (string), thumbnail (string), slides (array of Slide)

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can create a 5-slide story in under 5 minutes (measured by time tracking from page load to URL copy)
- **SC-002**: 90% of users successfully generate a valid story URL on first attempt (measured by error rate analytics)
- **SC-003**: Preview updates within 100ms for 95% of edit operations (measured by performance monitoring)
- **SC-004**: Drag-and-drop operations complete with smooth animations (no dropped frames, measured by 60fps capture)
- **SC-005**: 80% of users report the visual builder is "easier" or "much easier" than manual JSON editing (measured by post-launch survey)

---

## Assumptions

1. **Drag-and-Drop Library**: We will use `@dnd-kit/core` and `@dnd-kit/sortable` for drag-and-drop functionality, which is already used in the project and provides smooth animations.
2. **Story Format Compatibility**: The visual builder generates stories in the existing StoryScript format, ensuring compatibility with the current story viewer.
3. **Browser URL Length Limit**: Modern browsers support URLs up to ~2MB. The 20-slide limit should keep most stories under this threshold, but we handle overflow gracefully.
4. **Image Storage**: Images are referenced by URL only; we do not implement image hosting or upload in this feature (users provide external image URLs).
5. **Preview Performance**: The preview uses the existing story viewer component in an iframe to ensure exact rendering without duplication.

---

## Dependencies

### Existing System Components
- `lib/story/types.ts` - StoryScript type definitions
- `lib/story/utils/urlEncoder.ts` - URL encoding/decoding utilities
- `lib/story/validation.ts` - Story JSON schema validation
- Existing story viewer component for preview rendering

### External Libraries (to be added)
- `@dnd-kit/core` - Drag-and-drop core functionality (may already exist)
- `@dnd-kit/sortable` - Sortable list for slide reordering (may already exist)
- `react-colorful` - Color picker for background customization (may already exist)

### Technical Constraints
- No backend changes required - all processing is client-side
- Must work in mobile browsers (touch-based drag-and-drop)
- Must respect the existing StoryScript schema for backward compatibility

---

## Open Questions

1. **Template Storage**: Should templates be stored in a separate file or hardcoded in the component?
   - *Recommendation*: Start with hardcoded in `app/story-builder/templates.ts`, move to separate file if template count exceeds 10.
2. **Auto-Save Conflict Handling**: If two browser tabs are open, how do we handle conflicting auto-saves?
   - *Recommendation*: Use localStorage with tab synchronization via `storage` event; last write wins with a warning.
3. **URL Shortener**: Should we integrate URL shortening (Idea #3 from brainstorm) or use full URLs?
   - *Recommendation*: Start with full URLs. Shortener is a separate feature (Idea #3) and can be added later.
