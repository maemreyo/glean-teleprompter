# Tasks: Studio Page UI/UX Improvements

**Feature**: 004-studio-ui-ux-improvements  
**Branch**: `004-studio-ui-ux-improvements`  
**Input**: Design documents from `/specs/004-studio-ui-ux-improvements/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅  

**Tests**: Tests are NOT included in this phase. Focus is on UI/UX implementation. Tests can be added in a follow-up iteration.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app (Next.js 14+)**: `app/`, `components/`, `hooks/`, `lib/`, `stores/` at repository root
- Paths below follow the existing project structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create base infrastructure for all UI improvements

- [ ] T001 Install new dependency: react-keyboard-event-listener in package.json
- [ ] T002 Create new Zustand store skeleton at stores/useUIStore.ts with persist middleware
- [ ] T003 [P] Create lib/utils/formatRelativeTime.ts utility function
- [ ] T004 [P] Create lib/utils/errorMessages.ts utility function
- [ ] T005 [P] Create lib/a11y/ariaLabels.ts constants file
- [ ] T006 [P] Create lib/a11y/focusManagement.ts utility functions
- [ ] T007 [P] Create lib/utils/performance.ts utility functions

**Checkpoint**: Dependencies installed, utility functions created, store skeleton ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core UI infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T008 Complete useUIStore implementation with AutoSaveStatus, TextareaPreferences, FooterState, PreviewPanelState, KeyboardShortcutsStats, and ErrorContext in stores/useUIStore.ts
- [ ] T009 [P] Create components/teleprompter/config/ui/LoadingSkeleton.tsx with ContentPanelSkeleton, ConfigPanelSkeleton, and PreviewPanelSkeleton variants
- [ ] T010 [P] Create components/teleprompter/config/ui/AutoSaveStatus.tsx component with spinner, timestamp display, and error indicator
- [ ] T011 [P] Create hooks/useAutoSave.ts hook with requestIdleCallback and debouncing logic
- [ ] T012 [P] Create hooks/useKeyboardShortcuts.ts hook with react-keyboard-event-listener integration
- [ ] T013 [P] Add global focus styles to app/globals.css for 2px outline with 3:1 contrast

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Mobile Preview Visibility (Priority: P1) 🎯 MVP

**Goal**: Enable mobile users to see teleprompter preview without leaving Editor mode

**Independent Test**: A mobile user (< 1024px viewport) can toggle preview panel and see styling changes reflect immediately without switching to Runner mode

### Implementation for User Story 1

- [ ] T014 [P] [US1] Create hooks/useMediaQuery.ts for responsive breakpoint detection (mobile < 768px, tablet 768-1024px, desktop >= 1024px)
- [ ] T015 [US1] Add mobile preview toggle button to components/teleprompter/editor/ContentPanel.tsx header (show only on < 1024px)
- [ ] T016 [US1] Create mobile bottom sheet in components/teleprompter/editor/PreviewPanel.tsx using Framer Motion drag="y" with 60% screen height
- [ ] T017 [US1] Add tablet right-side panel variant (40% width) to components/teleprompter/editor/PreviewPanel.tsx for 768-1024px viewport
- [ ] T018 [US1] Implement swipe-down gesture to close preview panel using Framer Motion dragConstraints
- [ ] T019 [US1] Add isOpen state management to PreviewPanel via useUIStore.previewState
- [ ] T020 [US1] Ensure preview updates within 100ms of config changes (use React.memo for TeleprompterText)

**Checkpoint**: Mobile preview toggle works, bottom sheet slides up/down, preview updates in real-time

---

## Phase 4: User Story 2 - Auto-Save Visual Feedback (Priority: P1)

**Goal**: Display auto-save status indicator so users know when their work is being saved

**Independent Test**: User sees "Saving..." spinner, then "Saved ✓" with relative timestamp (e.g., "Saved 2m ago") after auto-save completes

### Implementation for User Story 2

- [ ] T021 [P] [US2] Add useAutoSave hook to components/teleprompter/editor/ContentPanel.tsx with store text, bgUrl, musicUrl as data
- [ ] T022 [US2] Integrate AutoSaveStatus component into ContentPanel.tsx header with position top-right
- [ ] T023 [US2] Implement "Saving..." spinner UI in components/teleprompter/config/ui/AutoSaveStatus.tsx
- [ ] T024 [US2] Implement "Saved ✓" with formatRelativeTime timestamp display
- [ ] T025 [US2] Add error indicator with retry button for auto-save failures
- [ ] T026 [US2] Update timestamp to "Just now" immediately when user clicks manual Save button
- [ ] T027 [US2] Persist auto-save status to localStorage key 'teleprompter_autosave_status'

**Checkpoint**: Auto-save status visible, timestamps work correctly, error handling with retry works

---

## Phase 5: User Story 3 - Footer Content Visibility (Priority: P1)

**Goal**: Fix footer obstruction so all textarea content is visible and editable

**Independent Test**: User can scroll to bottom of textarea and see all text with 100px padding below last line

### Implementation for User Story 3

- [ ] T028 [P] [US3] Add pb-32 (128px) padding-bottom to textarea container in components/teleprompter/editor/ContentPanel.tsx
- [ ] T029 [US3] Implement auto-scroll logic to keep new lines visible above footer when user presses Enter
- [ ] T030 [US3] Create collapse/expand button in footer with toggle functionality
- [ ] T031 [US3] Implement minimized footer state (thin bar with only Preview button)
- [ ] T032 [US3] Add semi-transparent backdrop (bg-card/90 backdrop-blur) to footer
- [ ] T033 [US3] Integrate footer state management via useUIStore.footerState with localStorage persistence

**Checkpoint**: Footer no longer obstructs content, collapse/expand works, semi-transparent backdrop shows underlying content

---

## Phase 6: User Story 4 - Loading State Improvements (Priority: P1)

**Goal**: Replace plain "Loading Studio..." text with skeleton screens and progress indicators

**Independent Test**: User sees skeleton screens for all panels during load, with 300ms fade-out animation

### Implementation for User Story 4

- [ ] T034 [P] [US4] Create StudioLoadingScreen component with ContentPanelSkeleton, ConfigPanelSkeleton, PreviewPanelSkeleton
- [ ] T035 [US4] Replace Suspense fallback in app/studio/page.tsx with StudioLoadingScreen component
- [ ] T036 [US4] Add progress bar in Studio page header when loading scripts/templates via URL parameters
- [ ] T037 [US4] Implement 300ms fade-out animation using Framer Motion AnimatePresence with mode="wait"
- [ ] T038 [US4] Add error message with "Retry" button when script/template loading fails after 3 seconds
- [ ] T039 [US4] Implement success animation and toast notification when template loads successfully

**Checkpoint**: Skeleton screens display during load, smooth fade-out transitions, progress bar shows for async loads

---

## Phase 7: User Story 5 - Accessibility Compliance (Priority: P1)

**Goal**: Make all config controls keyboard navigable with proper ARIA labels for screen readers

**Independent Test**: Screen reader user can navigate all config tabs and controls using Tab key, hearing proper announcements

### Implementation for User Story 5

- [ ] T040 [P] [US5] Add role="tablist" to ConfigTabs container in components/teleprompter/config/ConfigTabs.tsx
- [ ] T041 [P] [US5] Add aria-label, aria-selected, and tabIndex to each tab button using ARIA_LABELS constants
- [ ] T042 [P] [US5] Implement arrow key navigation (Left/Right) for tab switching in onKeyDown handler
- [ ] T043 [P] [US5] Add role="grid" and aria-label to color palette in components/teleprompter/config/colors/ColorsTab.tsx
- [ ] T044 [P] [US5] Make color swatches keyboard accessible with arrow keys and Enter/Space to select
- [ ] T045 [P] [US5] Add aria-label to slider controls showing current value (e.g., "Font size, 48 pixels")
- [ ] T046 [P] [US5] Implement real-time aria-label updates when slider values change
- [ ] T047 [US5] Add focus-visible styles with 2px solid outline and 3:1 contrast in app/globals.css
- [ ] T048 [US5] Add prefers-reduced-motion query to Framer Motion animations in Editor.tsx and Runner.tsx
- [ ] T049 [US5] Ensure all interactive elements have minimum 3:1 contrast ratio in high contrast mode

**Checkpoint**: All controls keyboard navigable, ARIA labels correct, focus indicators visible, respects prefers-reduced-motion

---

## Phase 8: User Story 6 - Expandable Text Editor (Priority: P2)

**Goal**: Allow users to expand textarea to 300px, 500px, or fullscreen for comfortable editing

**Independent Test**: User can click expand button to cycle through sizes, enter fullscreen with Esc to exit

### Implementation for User Story 6

- [ ] T050 [P] [US6] Create components/teleprompter/editor/TextareaExpandButton.tsx with Maximize2/Minimize2 icons
- [ ] T051 [US6] Add expand button to textarea corner in components/teleprompter/editor/ContentPanel.tsx
- [ ] T052 [US6] Implement toggleTextareaSize function in useUIStore to cycle: default → medium → large → fullscreen
- [ ] T053 [US6] Apply dynamic height styles based on textareaPrefs.size (128px, 300px, 500px, 100vh)
- [ ] T054 [US6] Implement Esc key handler to exit fullscreen mode and return to previous size
- [ ] T055 [US6] Persist textarea preferences to localStorage key 'teleprompter_textarea_prefs'
- [ ] T056 [US6] Ensure config panel remains visible when textarea is in fullscreen mode (overlay approach)

**Checkpoint**: Textarea expands through 4 sizes, fullscreen works with Esc exit, preferences persist

---

## Phase 9: User Story 7 - Mobile Tab Navigation (Priority: P2)

**Goal**: Add scroll indicators and bottom sheet for easy access to all 7 config tabs on mobile

**Independent Test**: Mobile user sees gradient fade and chevron, can tap "More" to see all tabs in grid

### Implementation for User Story 7

- [ ] T057 [P] [US7] Add scroll detection logic to ConfigTabs to show/hide scroll indicators
- [ ] T058 [P] [US7] Create gradient fade overlay on right edge of tab bar using bg-linear-to-l from-card
- [ ] T059 [P] [US7] Add chevron icon indicator when tabs overflow viewport
- [ ] T060 [US7] Implement horizontal swipe gesture for tab navigation using touch events
- [ ] T061 [US7] Create "More" button in tab bar that opens bottom sheet
- [ ] T062 [US7] Create components/teleprompter/config/TabBottomSheet.tsx with Framer Motion bottom sheet animation
- [ ] T063 [US7] Implement 2-column grid layout in TabBottomSheet showing all 7 tabs with icons and labels
- [ ] T064 [US7] Add tap handler to select tab, close bottom sheet, and activate selected tab
- [ ] T065 [US7] Implement tabs wrap to 2 rows on tablet viewport (768-1024px) using flex-wrap

**Checkpoint**: Scroll indicators visible, swipe works, bottom sheet shows all tabs, tablet tabs wrap

---

## Phase 10: User Story 8 - Contextual Error Messages (Priority: P2)

**Goal**: Replace generic errors with specific messages and actionable recovery buttons

**Independent Test**: Script loading errors show specific messages with contextual action buttons (Retry, Browse Templates, Sign Up)

### Implementation for User Story 8

- [ ] T066 [P] [US8] Create getErrorContext function in lib/utils/errorMessages.ts mapping error types to messages
- [ ] T067 [P] [US8] Define ERROR_MESSAGES constant with 404, network, permission, and quota error mappings
- [ ] T068 [US8] Update app/studio/page.tsx script loading error handling to use getErrorContext
- [ ] T069 [US8] Create components/teleprompter/ErrorDialog.tsx with Dialog, DialogContent, DialogHeader, DialogFooter
- [ ] T070 [US8] Add contextual action buttons (Retry, Browse Templates, Sign Up) based on error type
- [ ] T071 [US8] Implement "Copy error" button that copies error details and technical info to clipboard
- [ ] T072 [US8] Update toast notifications to use error messages from ErrorContext with appropriate severity styling
- [ ] T073 [US8] Add console.error logging with sufficient context for debugging

**Checkpoint**: Each error type shows specific message, action buttons work, copy error functions correctly

---

## Phase 11: User Story 9 - Keyboard Shortcuts Discovery (Priority: P2)

**Goal**: Make keyboard shortcuts discoverable via modal and tooltip hints

**Independent Test**: User can press "?" to open modal showing all shortcuts, tooltips show hints on hover

### Implementation for User Story 9

- [ ] T074 [P] [US9] Create components/teleprompter/KeyboardShortcutsModal.tsx with Dialog and search functionality
- [ ] T075 [P] [US9] Define SHORTCUTS constant array organized by category (Editing, Navigation, Config)
- [ ] T076 [P] [US9] Add search input to modal with filtering logic for shortcut descriptions
- [ ] T077 [US9] Add "?" button to ConfigPanel header in components/teleprompter/config/ConfigPanel.tsx
- [ ] T078 [US9] Wire Shift+? keyboard shortcut to toggle modal using useKeyboardShortcuts hook
- [ ] T079 [P] [US9] Add Tooltip components to Undo/Redo buttons showing "Undo (Ctrl+Z)" hints
- [ ] T080 [US9] Implement "Pro tip" toast that appears after 5+ sessions using useUIStore.shortcutsStats
- [ ] T081 [US9] Add keyboard shortcut categories display in modal (Editing, Navigation, Config, Media)
- [ ] T082 [US9] Increment shortcutsStats.modalOpenedCount and save to localStorage

**Checkpoint**: Modal opens with "?", search works, tooltips show hints, pro tips appear after 5 sessions

---

## Phase 12: User Story 10 - Performance Optimization (Priority: P2)

**Goal**: Optimize rendering to maintain < 50ms typing latency and 60fps during config adjustments

**Independent Test**: Typing 5000-word script stays < 50ms, config slider changes maintain 60fps

### Implementation for User Story 10

- [ ] T083 [P] [US10] Add React.memo to components/teleprompter/display/TeleprompterText.tsx with custom comparison function
- [ ] T084 [P] [US10] Wrap TeleprompterText with React.memo to prevent re-renders when text or config unchanged
- [ ] T085 [US10] Implement debounced config updates using useDeferredValue or custom debounce hook
- [ ] T086 [US10] Add usePerformanceMonitor hook in lib/utils/performance.ts for development FPS tracking
- [ ] T087 [US10] Implement non-blocking auto-save using requestIdleCallback (already in useAutoSave hook)
- [ ] T088 [US10] Add performance warning for scripts > 50,000 characters suggesting to split
- [ ] T089 [US10] Optimize slider onChange handlers to use requestAnimationFrame for 60fps updates
- [ ] T090 [US10] Add React.memo to PreviewPanel to prevent unnecessary re-renders during config changes

**Checkpoint**: Typing fast with 5000 words, sliders smooth at 60fps, auto-save doesn't block typing

---

## Phase 13: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, integration testing, and validation

- [ ] T091 [P] Update messages/en.json with new i18n keys for all UI elements (auto-save status, error messages, shortcuts modal)
- [ ] T092 [P] Add TypeScript type definitions for all new components and hooks
- [ ] T093 [P] Run ESLint and fix any linting errors in new files
- [ ] T094 Test all 10 user stories manually to verify independent functionality
- [ ] T095 [P] Verify WCAG 2.1 AA compliance using axe-core or similar tool
- [ ] T096 [P] Test keyboard navigation on all config controls
- [ ] T097 [P] Test responsive behavior on mobile, tablet, and desktop viewports
- [ ] T098 [P] Verify localStorage persistence and quota handling
- [ ] T099 Run quickstart.md validation and update if needed
- [ ] T100 Final code review and cleanup

**Checkpoint**: All user stories work independently, accessibility compliant, performance targets met

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-12)**: All depend on Foundational phase completion
  - P1 stories (Phases 3-7): US1, US2, US3, US4, US5 - Critical for MVP
  - P2 stories (Phases 8-12): US6, US7, US8, US9, US10 - Can run in parallel after P1 complete
- **Polish (Phase 13)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (Mobile Preview)**: Can start after Foundational - No dependencies on other stories
- **US2 (Auto-Save)**: Can start after Foundational - No dependencies on other stories
- **US3 (Footer)**: Can start after Foundational - No dependencies on other stories
- **US4 (Loading States)**: Can start after Foundational - No dependencies on other stories
- **US5 (Accessibility)**: Can start after Foundational - Affects all components but independently testable
- **US6 (Expandable Textarea)**: Can start after Foundational - No dependencies on other stories
- **US7 (Mobile Tabs)**: Can start after Foundational - No dependencies on other stories
- **US8 (Error Messages)**: Can start after Foundational - No dependencies on other stories
- **US9 (Keyboard Shortcuts)**: Can start after Foundational - No dependencies on other stories
- **US10 (Performance)**: Can start after Foundational - Affects multiple components but independently testable

### Within Each User Story

- Tasks marked [P] can run in parallel within the story
- Complete tasks in order (TXXX sequence) within each story
- Each story should be independently testable after completion

### Parallel Opportunities

**Within Setup Phase (Phase 1)**:
```bash
# Can run in parallel:
T003, T004, T005, T006, T007 (all utility functions)
```

**Within Foundational Phase (Phase 2)**:
```bash
# Can run in parallel:
T009, T010, T011, T012, T013 (independent components/hooks)
```

**After Foundational Phase**:
- All P1 user stories (US1-US5) can run in parallel by different developers
- All P2 user stories (US6-US10) can run in parallel after P1 complete

**Within User Story 1 (Mobile Preview)**:
```bash
# Can run in parallel:
T014 (useMediaQuery hook)
```

**Within User Story 5 (Accessibility)**:
```bash
# Can run in parallel:
T040, T041, T042 (tab navigation)
T043, T044 (color picker)
T045, T046 (sliders)
```

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phases 3-7: All P1 Stories (US1-US5)
4. **STOP and VALIDATE**: Test all P1 stories independently
5. Deploy/demo if ready

**MVP Scope**: Mobile preview, auto-save feedback, footer fix, loading states, accessibility compliance

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 (Mobile Preview) → Test independently → Deploy/Demo
3. Add US2 (Auto-Save) → Test independently → Deploy/Demo
4. Add US3 (Footer) → Test independently → Deploy/Demo
5. Add US4 (Loading) → Test independently → Deploy/Demo
6. Add US5 (Accessibility) → Test independently → Deploy/Demo (MVP Complete!)
7. Add US6-US10 (P2 stories) → Each tested and deployed independently

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 (Mobile Preview)
   - Developer B: US2 (Auto-Save)
   - Developer C: US3 (Footer)
   - Developer D: US4 (Loading)
   - Developer E: US5 (Accessibility)
3. After P1 complete, add P2 stories in parallel

---

## Task Summary by Category

| Category | Task Count | Tasks |
|----------|------------|-------|
| Setup | 7 | T001-T007 |
| Foundational | 6 | T008-T013 |
| US1: Mobile Preview (P1) | 7 | T014-T020 |
| US2: Auto-Save (P1) | 7 | T021-T027 |
| US3: Footer (P1) | 6 | T028-T033 |
| US4: Loading (P1) | 6 | T034-T039 |
| US5: Accessibility (P1) | 10 | T040-T049 |
| US6: Textarea (P2) | 7 | T050-T056 |
| US7: Mobile Tabs (P2) | 9 | T057-T065 |
| US8: Errors (P2) | 8 | T066-T073 |
| US9: Shortcuts (P2) | 9 | T074-T082 |
| US10: Performance (P2) | 8 | T083-T090 |
| Polish | 10 | T091-T100 |
| **TOTAL** | **100** | |

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All P1 stories (US1-US5) constitute MVP
- P2 stories (US6-US10) are enhancements that can be delivered incrementally

---

**Tasks Status**: ✅ Ready for Implementation  
**Total Tasks**: 100  
**Estimated Duration**: 40-60 hours (varies by developer experience)  
**MVP Scope**: Phases 1-7 (Tasks T001-T049 = 49 tasks)
