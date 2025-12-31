# Feature Specification: Studio Page Core Module Testing

**Feature Branch**: `003-studio-page-tests`  
**Created**: 2025-12-31  
**Status**: Draft  
**Input**: User description: "Generate comprehensive test specification for app/studio/page.tsx focusing on: The StudioLogic component's initialization behavior, Template loading via ?template parameter, Script loading via ?script parameter, localStorage draft loading and auto-save functionality, Mode switching between setup and runner, Demo mode handling, Integration with stores (useTeleprompterStore)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Initial Page Load and Fresh Start (Priority: P1)

A user opens the Studio page without any parameters to start a new teleprompter session. The system should initialize cleanly without triggering any auto-loading behaviors, and the user should see the editor interface ready for content input.

**Why this priority**: This is the core entry point for creating new teleprompter content. Without this working, users cannot use the application for its primary purpose.

**Independent Test**: Can be fully tested by loading the studio page without URL parameters and verifying the editor appears with default/empty state and demo mode is disabled.

**Acceptance Scenarios**:

1. **Given** a user navigates to the Studio page without any URL parameters, **When** the page loads, **Then** the Editor component should be displayed (not Runner)
2. **Given** a fresh page load without parameters, **When** the page initializes, **Then** demo mode should be disabled
3. **Given** a user opens the studio page for the first time, **When** the page loads, **Then** initialization should occur exactly once (no infinite loops or duplicate initialization)

---

### User Story 2 - Template-Based Content Creation (Priority: P2)

A user wants to start with a pre-configured template by accessing the Studio page with a `?template=template-id` parameter. The system should load the template's content and settings, displaying them in the editor with appropriate user feedback.

**Why this priority**: Templates accelerate user workflow by providing starting points. This enhances productivity and user experience but is not required for basic functionality.

**Independent Test**: Can be fully tested by navigating to Studio page with a template parameter and verifying the editor shows the template's content and settings.

**Acceptance Scenarios**:

1. **Given** a user navigates to Studio page with `?template=valid-template-id`, **When** the page loads, **Then** the editor should display the template's content and apply all template settings (font, color, speed, fontSize, align, lineHeight, margin, overlayOpacity)
2. **Given** a template is loaded successfully, **When** loading completes, **Then** a success toast notification should appear with the template name
3. **Given** a user navigates with `?template=invalid-template-id`, **When** the page loads, **Then** the system should fall through to default initialization (not crash)
4. **Given** a template is loaded, **When** loading completes, **Then** the mode should be set to 'setup' (not 'run')

---

### User Story 3 - Saved Script Restoration (Priority: P1)

A user wants to continue working on a previously saved script by accessing the Studio page with a `?script=script-id` parameter. The system should load the script content, background URL, music URL, and custom styling configuration from the database.

**Why this priority**: This is critical for users to save and resume their work. Without this, users lose all work when closing the browser.

**Independent Test**: Can be fully tested by navigating to Studio page with a script parameter and verifying the editor shows the saved content and configuration.

**Acceptance Scenarios**:

1. **Given** a user navigates to Studio page with `?script=valid-script-id` that has config, **When** the page loads, **Then** the system should load the script content and apply the full config snapshot via config store
2. **Given** a script with config is loaded successfully, **When** loading completes, **Then** a success toast should indicate "Loaded script with custom styling"
3. **Given** a user navigates with `?script=valid-script-id` with legacy settings (no config), **When** the page loads, **Then** the system should load content and apply legacy settings (font, colorIndex, speed, fontSize, align, lineHeight, margin, overlayOpacity)
4. **Given** a script with legacy settings is loaded successfully, **When** loading completes, **Then** a success toast should indicate "Loaded script"
5. **Given** a user navigates with `?script=invalid-script-id`, **When** the page loads, **Then** an error toast should indicate loading failed
6. **Given** a script loading fails, **When** the error occurs, **Then** the error should be logged to console for debugging

---

### User Story 4 - Local Draft Persistence and Auto-Save (Priority: P1)

A user works on content in the editor. The system should automatically save their work to localStorage every 5 seconds, and restore it when they return to the Studio page (if no template or script parameter is present).

**Why this priority**: This protects user work against browser crashes and accidental closures. Without this, users risk losing all unsaved work.

**Independent Test**: Can be fully tested by editing content, waiting 5+ seconds, reloading the page without parameters, and verifying content is restored.

**Acceptance Scenarios**:

1. **Given** a user is in setup mode with read-write access, **When** 5 seconds have passed since the last save, **Then** the system should save the current state to localStorage as 'teleprompter_draft'
2. **Given** the auto-save runs, **When** saving to localStorage, **Then** it should persist: text, bgUrl, musicUrl, font, colorIndex, speed, fontSize, align, lineHeight, margin, overlayOpacity
3. **Given** a user is in run mode, **When** the auto-save timer triggers, **Then** no save should occur (only save in setup mode)
4. **Given** a user has read-only access, **When** the auto-save timer triggers, **Then** no save should occur (only save when not read-only)
5. **Given** a user returns to Studio page without parameters after having a draft, **When** the page loads, **Then** the draft should be restored from localStorage
6. **Given** localStorage contains corrupted draft data, **When** the page attempts to load it, **Then** the system should handle the error gracefully and continue with default state

---

### User Story 5 - Mode Switching Between Editor and Runner (Priority: P1)

A user switches between the setup/edit mode (Editor) and playback mode (Runner). The system should display the correct component based on the current mode state, using smooth transitions.

**Why this priority**: This is the core workflow of the teleprompter - users must be able to configure content and then play it back.

**Independent Test**: Can be fully tested by changing the mode state and verifying the correct component (Editor or Runner) is displayed.

**Acceptance Scenarios**:

1. **Given** the mode is set to 'setup', **When** the component renders, **Then** the Editor component should be displayed
2. **Given** the mode is set to 'run' (or any value other than 'setup'), **When** the component renders, **Then** the Runner component should be displayed
3. **Given** the mode changes from 'setup' to 'run', **When** the change occurs, **Then** AnimatePresence should handle the transition with exit animation for Editor and enter animation for Runner
4. **Given** the mode changes from 'run' to 'setup', **When** the change occurs, **Then** AnimatePresence should handle the transition with exit animation for Runner and enter animation for Editor

---

### User Story 6 - Template Parameter Priority Over Script (Priority: P2)

A user navigates with both `?template=` and `?script=` parameters present. The system should prioritize template loading and not attempt to load the script.

**Why this priority**: This is an edge case that defines behavior when conflicting parameters exist. While rare, it prevents ambiguous state.

**Independent Test**: Can be fully tested by navigating with both parameters and verifying only the template is loaded.

**Acceptance Scenarios**:

1. **Given** a user navigates with both `?template=valid-id` and `?script=valid-id`, **When** the page loads, **Then** only the template should be loaded (script parameter ignored)
2. **Given** both parameters are present and template loading succeeds, **When** loading completes, **Then** a success toast should indicate template was loaded (not script)

---

### Edge Cases

### Error Handling

- What happens when the template configuration is missing required fields (e.g., no font, no content)?
- What happens when `loadScriptAction` throws an unexpected error (not a standard result object)?
- What happens when localStorage is disabled or quota exceeded?
- What happens when the user rapidly switches between modes multiple times in quick succession?
- What happens when URL parameters change after the page has already loaded?

### Concurrency and Race Conditions

- What happens if the user navigates away from the page while a script is still loading?
- What happens if multiple auto-save intervals overlap (shouldn't happen, but defensive testing)?
- What happens if the URL parameters change during initial initialization?
- What happens if template loading is slow and the user tries to interact with the page?

### Data Integrity

- What happens when localStorage draft contains properties that no longer exist in the current store schema?
- What happens when a script's config contains settings with invalid values (e.g., negative font size, invalid color index)?
- What happens when a template's settings have null or undefined values?

### Browser Scenarios

- What happens when the user opens the Studio page in multiple browser tabs with different URL parameters?
- What happens when the user refreshes the page while a script is loading?
- What happens when the browser's back button is used to return to the Studio page?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Studio page MUST initialize exactly once on mount, preventing duplicate initialization cycles
- **FR-002**: The Studio page MUST disable demo mode on initial mount
- **FR-003**: The Studio page MUST support loading pre-configured templates via the `?template=` URL parameter
- **FR-004**: The Studio page MUST support loading saved scripts via the `?script=` URL parameter
- **FR-005**: The Studio page MUST restore draft content from localStorage when no URL parameters are present
- **FR-006**: The Studio page MUST automatically save the current state to localStorage every 5 seconds when in setup mode and not read-only
- **FR-007**: The Studio page MUST display the Editor component when mode is 'setup'
- **FR-008**: The Studio page MUST display the Runner component when mode is not 'setup'
- **FR-009**: The Studio page MUST prioritize template loading over script loading when both parameters are present
- **FR-010**: The Studio page MUST show appropriate toast notifications for template loading success
- **FR-011**: The Studio page MUST show appropriate toast notifications for script loading success
- **FR-012**: The Studio page MUST show appropriate toast notifications for script loading failures
- **FR-013**: The Studio page MUST apply template settings to the teleprompter store when a template is loaded
- **FR-014**: The Studio page MUST apply script content to the teleprompter store when a script is loaded
- **FR-015**: The Studio page MUST apply script config to the config store when a script with config is loaded
- **FR-016**: The Studio page MUST apply legacy script settings to the teleprompter store when a script without config is loaded
- **FR-017**: The Studio page MUST handle localStorage parsing errors gracefully without breaking the application
- **FR-018**: The Studio page MUST log script loading errors to console for debugging
- **FR-019**: The Studio page MUST wrap the StudioLogic component in a Suspense boundary with a loading fallback
- **FR-020**: The Studio page MUST use AnimatePresence with mode="wait" for smooth transitions between Editor and Runner

### Key Entities

- **Studio Page State**: Represents the current state of the studio page including initialization status, URL parameters, and auto-save interval
- **Template**: A pre-configured content and settings package with properties: name, content, settings (font, colorIndex, speed, fontSize, align, lineHeight, margin, overlayOpacity)
- **Saved Script**: A persisted teleprompter script with properties: content, bg_url, music_url, config (optional, contains full config snapshot), settings (optional, legacy format)
- **Local Draft**: Auto-saved state stored in localStorage with key 'teleprompter_draft' containing current editor state

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of initialization events occur exactly once (verified through test execution logs showing no duplicate initializations)
- **SC-002**: 100% of template loads result in the editor displaying the template content with all settings applied
- **SC-003**: 100% of script loads with config restore the full configuration snapshot correctly
- **SC-004**: 100% of script loads with legacy settings apply all legacy properties correctly
- **SC-005**: 100% of script load failures display an appropriate error toast notification
- **SC-006**: Auto-save executes every 5 seconds ±100ms when in setup mode with read-write access
- **SC-007**: Auto-save does not execute when in run mode or read-only mode
- **SC-008**: 100% of localStorage drafts are successfully restored on page reload when no URL parameters present
- **SC-009**: Mode switches between Editor and Runner render the correct component in 100% of cases
- **SC-010**: AnimatePresence transitions complete within 500ms for mode switches
- **SC-011**: Template parameter takes priority over script parameter in 100% of cases when both are present
- **SC-012**: localStorage parsing errors are handled gracefully 100% of the time without crashing the application
- **SC-013**: All toast notifications appear within 200ms of the triggering event completing
- **SC-014**: Suspense fallback displays within 100ms of page load and disappears once StudioLogic is ready
- **SC-015**: Test suite achieves 100% coverage of all code paths in app/studio/page.tsx
