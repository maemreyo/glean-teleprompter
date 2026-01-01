# Feature Specification: Auto-save Improvements

**Feature Branch**: `006-autosave-improvements`  
**Created**: 2026-01-01  
**Status**: Draft  
**Input**: User description: "Improve the save mechanism by consolidating dual auto-save systems, adding beforeunload handler, implementing data migration with schema versioning, improving quota exceeded handling, detecting private browsing mode, and adding draft management UI"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Unified Auto-save System (Priority: P1)

Users working in the studio editor experience reliable, consistent auto-save behavior that preserves all their work without race conditions or data loss.

**Why this priority**: The current dual auto-save system creates race conditions where changes can be lost. Consolidating to a single system eliminates data loss risk and reduces code complexity.

**Independent Test**: Can be fully tested by editing content and verifying all 11 teleprompter properties are saved consistently without timing conflicts. Delivers value by ensuring no user work is lost.

**Acceptance Scenarios**:

1. **Given** a user is editing in setup mode, **When** they change any property (text, font, color, speed, etc.), **Then** all 11 teleprompter properties are saved to localStorage as a complete unit
2. **Given** a user makes multiple rapid changes, **When** the auto-save triggers after 1 second of inactivity, **Then** the latest state of all properties is persisted atomically
3. **Given** a user has been editing for 5 seconds, **When** the periodic save triggers, **Then** the complete current state is saved regardless of whether changes occurred
4. **Given** the system saves data, **When** the save operation completes, **Then** a single, consistent "Saved" status is displayed to the user

---

### User Story 2 - Protected Page Close (Priority: P1)

Users who accidentally close their browser tab or navigate away do not lose their recent work.

**Why this priority**: Users can lose up to 5 seconds of work when closing the tab. The beforeunload handler eliminates this data loss scenario completely.

**Independent Test**: Can be tested by making changes and immediately closing the tab, then reopening to verify all changes were preserved. Delivers value by preventing data loss from accidental closures.

**Acceptance Scenarios**:

1. **Given** a user has unsaved changes (up to 5 seconds old), **When** they attempt to close the tab or navigate away, **Then** the system immediately saves the complete current state before allowing the close
2. **Given** a user is in read-only mode, **When** they close the tab, **Then** no beforeunload save is triggered
3. **Given** a user is in running mode (teleprompter active), **When** they close the tab, **Then** no beforeunload save is triggered
4. **Given** a private browsing session, **When** the user closes the tab, **Then** the beforeunload save executes but data will not persist after session ends

---

### User Story 3 - Private Browsing Detection (Priority: P2)

Users opening the application in private or incognito browsing mode are informed that their drafts will not persist after the session ends.

**Why this priority**: Users in private browsing lose all work when closing the session without warning. Detection manages expectations and encourages manual saves.

**Independent Test**: Can be tested by opening the app in private browsing mode and verifying a warning banner appears. Delivers value by preventing unexpected data loss and frustration.

**Acceptance Scenarios**:

1. **Given** a user opens the application in a private browsing session, **When** the studio page loads, **Then** a warning banner indicates "Private browsing detected: Drafts will not be saved after you close this session"
2. **Given** a user is in private browsing mode, **When** they dismiss the warning banner, **Then** the banner remains dismissed for the current session only
3. **Given** a user in private browsing mode, **When** they click "Save to account" in the warning, **Then** they are prompted to authenticate and save their work to cloud storage
4. **Given** a user is in normal browsing mode, **When** the studio page loads, **Then** no private browsing warning is displayed

---

### User Story 4 - Storage Quota Management (Priority: P2)

Users approaching or exceeding localStorage storage limits receive clear guidance on storage usage and options to free up space.

**Why this priority**: When storage is full, users cannot save their work. Providing visibility and recovery options prevents frustration and data loss.

**Independent Test**: Can be tested by filling storage to near capacity and triggering save operations. Delivers value by providing actionable recovery steps when storage is full.

**Acceptance Scenarios**:

1. **Given** a user's localStorage is at 90% capacity, **When** they save their work, **Then** a warning indicates "Storage almost full: 90% used"
2. **Given** a user's localStorage is full, **When** auto-save attempts to write, **Then** an error message shows "Storage full (100% used). Clear old drafts or save to your account."
3. **Given** a storage quota error occurs, **When** the error is displayed, **Then** a "Clear Old Drafts" button is available to remove drafts older than 30 days
4. **Given** a user clicks "Clear Old Drafts", **When** the cleanup completes, **Then** a summary shows how many drafts were cleared and how much space was freed
5. **Given** a user views storage status, **When** displayed, **Then** current usage is shown as both a percentage and approximate size (e.g., "4.5 MB of 5 MB used")

---

### User Story 5 - Draft Management Interface (Priority: P3)

Users can view, manage, and restore from their saved local drafts through a dedicated interface.

**Why this priority**: Users have no visibility into their saved drafts and cannot manually manage them. This provides control and recovery options.

**Independent Test**: Can be tested by accessing the draft management UI and performing actions like viewing, restoring, and deleting drafts. Delivers value by giving users control over their local data.

**Acceptance Scenarios**:

1. **Given** a user has multiple saved drafts, **When** they open the draft management interface, **Then** they see a list of drafts with timestamps, preview text, and size information
2. **Given** a user is viewing the draft list, **When** they select a draft and click "Restore", **Then** the selected draft is loaded into the editor
3. **Given** a user is viewing the draft list, **When** they select one or more drafts and click "Delete", **Then** the selected drafts are removed from localStorage
4. **Given** a user has multiple drafts, **When** they hover over a draft in the list, **Then** a preview shows the first 100 characters of the script content
5. **Given** a user deletes a draft, **When** the deletion completes, **Then** the draft list updates and a success message appears

---

### User Story 6 - Data Migration Support (Priority: P2)

Users with existing saved drafts continue to have their drafts work correctly after application updates that change the draft data structure.

**Why this priority**: Without migration support, application updates could corrupt or break existing user drafts, causing data loss.

**Independent Test**: Can be tested by simulating old draft formats and verifying they are correctly migrated to the current format. Delivers value by ensuring backward compatibility.

**Acceptance Scenarios**:

1. **Given** a user has a saved draft from a previous application version (schema v1.0), **When** they open the application (now on schema v2.0), **Then** the draft is automatically migrated to v2.0 format
2. **Given** a draft is being migrated, **When** the migration completes successfully, **Then** the user sees their content correctly with new properties set to sensible defaults
3. **Given** a migration encounters an error (corrupted data), **When** the error occurs, **Then** the user is informed and the corrupted draft is preserved for manual recovery
4. **Given** a user's draft is migrated, **When** they continue editing and save, **Then** the updated schema version is persisted

---

### Edge Cases

- What happens when multiple browser tabs are open and editing simultaneously? The system detects conflicts via timestamp comparison and shows a warning dialog allowing the user to choose between overwriting or reloading to get the newer version.
- How does the system handle a browser crash or force quit while a save is in progress? The localStorage write may be incomplete, but JSON parsing errors are caught and the app continues with default state.
- What happens when a user pastes a very large script (100,000+ characters)? The save may succeed initially but could exceed quota on subsequent saves.
- How does the system behave when the user's system clock changes after a save? The relative time display may show incorrect information (e.g., "Saved 1h ago" when it was just now).
- What occurs when localStorage is available but in session-only mode (not true private browsing)? System uses multi-layered defense: proactive general storage info toast on first visit, nudge to save to Supabase after 5min editing, best-effort detection attempt (unreliable), beforeunload warning for unsaved work, and encourages cloud save as primary storage.
- What happens when a user saves to cloud storage (Supabase) while an auto-save draft exists? The two systems operate independently, creating potential conflicts.
- How does the system handle rapid mode switching (setup ↔ running)? Auto-save may trigger during mode transitions, potentially saving inconsistent state.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST consolidate dual auto-save mechanisms into a single system that saves all 11 teleprompter properties atomically
- **FR-002**: System MUST save user content every 5 seconds during periods of inactivity (periodic save)
- **FR-003**: System MUST save user content within 1 second after the last change (debounced save)
- **FR-004**: System MUST use non-blocking save operations that do not interrupt user typing
- **FR-005**: System MUST save complete state immediately before tab close when in setup mode and not read-only
- **FR-006**: System MUST detect private browsing mode and display a warning that drafts will not persist
- **FR-007**: System MUST track localStorage schema version and apply migrations when loading old drafts
- **FR-008**: System MUST provide clear error messages when storage quota is exceeded
- **FR-009**: System MUST display current storage usage to users when approaching quota limits
- **FR-010**: System MUST provide a mechanism to clear old drafts (older than 30 days) when storage is full
- **FR-011**: System MUST provide a user interface for viewing, restoring, and deleting local drafts
- **FR-012**: System MUST show visual feedback indicating save status (idle, saving, saved, error)
- **FR-013**: System MUST display relative timestamps for when drafts were last saved
- **FR-014**: System MUST NOT save when in read-only mode or running (teleprompter active) mode
- **FR-015**: System MUST preserve draft data across application updates through schema migrations
- **FR-016**: System MUST detect when another browser tab has modified a draft more recently and present a conflict warning dialog with options to overwrite or reload
- **FR-017**: System MUST handle Supabase "Save to account" failures by showing specific error messages with retry button based on error type (network offline, rate limit, auth failure), while preserving local draft
- **FR-018**: System MUST implement multi-layered defense for session-only localStorage scenarios: show general storage info toast on first visit, nudge to save to Supabase after 5 minutes of editing, attempt best-effort session-only detection, and provide beforeunload warning for unsaved work not saved to account
- **FR-019**: System MUST meet WCAG 2.1 Level AA accessibility standards: full keyboard navigation, visible focus indicators, screen reader support (aria-labels, aria-live for status updates), semantic HTML, color contrast ratio ≥4.5:1 for text, toast notifications visible for ≥5 seconds, and proper heading hierarchy

## Clarifications

### Session 2026-01-01

- Q: How should multiple drafts be stored and identified in localStorage? → A: Store all drafts in a single object under `teleprompter_drafts` key with an array of draft objects
- Q: How should the system handle multiple browser tabs editing simultaneously? → A: Show conflict warning when another tab modified data more recently (detect via timestamp comparison, allow user to choose overwrite or reload)
- Q: How should the system handle Supabase failures when user tries to "Save to account"? → A: Show specific error toast with retry button based on error type (network, rate limit, auth), keep local draft intact, non-blocking
- Q: How should session-only localStorage mode (data cleared on browser close) be handled? → A: Multi-layered defense: proactive general storage info toast, nudge to save to Supabase after 5min editing, best-effort detection attempt (unreliable), beforeunload warning for unsaved work not saved to account
- Q: What accessibility standard should the draft management UI and save status components meet? → A: WCAG 2.1 Level AA (keyboard navigation, screen reader support, focus indicators, color contrast, aria-live for status updates, semantic HTML, toast timing ≥5 seconds)

### Key Entities

- **Local Draft**: A saved snapshot of the teleprompter state containing 11 properties (text, background URL, music URL, font style, color index, scroll speed, font size, text alignment, line height, margin, overlay opacity), schema version, unique ID (UUID), and timestamp. All drafts are stored collectively in browser localStorage under key `teleprompter_drafts` as an array of draft objects.
- **Drafts Collection**: The array structure stored in localStorage containing multiple draft objects. Each draft has a unique identifier for independent management (restore, delete).
- **Storage Usage Metrics**: Information about localStorage consumption including used bytes, total capacity, and percentage used. Calculated by enumerating all localStorage keys and summing their sizes.
- **Migration Function**: A transformation that converts draft data from an older schema version to a newer one, applying default values for new properties and restructuring data as needed.
- **Draft Metadata**: Information about each saved draft including unique ID, timestamp, size in bytes, preview text (first 100 characters), and schema version. Used for displaying in the draft management UI.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users experience zero data loss from race conditions between auto-save systems (measured by absence of "partial data" bug reports)
- **SC-002**: Users lose no more than 100ms of work when closing the tab (measured by beforeunload handler execution time)
- **SC-003**: Users in private browsing mode see a warning banner on page load (measured by banner display rate)
- **SC-004**: Users encountering storage quota exceeded can resolve the issue within 3 clicks (measured by task completion time to clear old drafts)
- **SC-005**: Users can view and manage their drafts through an accessible interface (measured by interface usage and task completion rate)
- **SC-006**: Existing user drafts continue to work after application updates (measured by migration success rate)
- **SC-007**: Auto-save operations complete within 200ms and do not block user typing (measured by save operation duration)
- **SC-008**: Users see clear visual feedback of save status within 500ms of save operation (measured by status update latency)
- **SC-009**: Storage usage is displayed as both percentage and approximate size for easy understanding (measured by user comprehension)
- **SC-010**: Draft management interface allows restoring a draft within 2 clicks from the studio page (measured by task completion time)

## Assumptions

1. localStorage is available and functional in the user's browser (standard web API)
2. Single page application architecture with client-side state management
3. Users primarily work on one device at a time (no cross-device sync required for local drafts)
4. Typical script content is under 50,000 characters (reasonable storage usage)
5. Users have basic understanding of browser storage limitations
6. Application updates are incremental and backward compatible
7. Private browsing detection uses standard browser behavior tests
8. 5-second periodic save interval balances freshness with performance
9. 30-day retention for old drafts is acceptable to users
10. Users prefer visual feedback over console logs for save status

## Dependencies

- Existing teleprompter store state management (useTeleprompterStore)
- Existing UI store for status tracking (useUIStore)
- Current localStorage implementation for draft storage
- Supabase integration for cloud saves (for "save to account" functionality)
- Current relative time formatting utilities

## Out of Scope

The following items are explicitly excluded from this feature:

- Cross-device synchronization of local drafts
- Real-time collaborative editing
- Automatic cloud backup of local drafts
- Compression of draft data to save space
- Cross-tab synchronization using BroadcastChannel API
- Encryption of local draft data
- Version history/revisions within drafts (only latest draft preserved)
- Advanced draft search or filtering
- Draft export/import functionality
- Custom retention periods for draft cleanup

---

## Notes

- The current dual auto-save system creates race conditions where the useAutoSave hook (partial data) and setInterval (full data) can overwrite each other
- The research document identifies this as a "Medium" severity issue with potential for user changes to be lost
- Private browsing mode detection should use a reliable test method that works across major browsers
- Storage quota limits vary by browser (Chrome/Edge: ~10MB, Safari: ~5MB, Firefox: ~10MB)
- The draft management UI could be implemented as a modal dialog or a dedicated page
- Schema migrations should be cumulative (each migration handles one version transition)
- Consider adding a "force save now" keyboard shortcut (Ctrl/Cmd+S) for user-initiated saves
