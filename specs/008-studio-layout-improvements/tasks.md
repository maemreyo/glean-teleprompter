# Tasks: Studio Layout Improvements

**Input**: Design documents from `/specs/008-studio-layout-improvements/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/
**Feature**: Two-column preview layout and floating ConfigPanel overlay
**Status**: Ready for Implementation

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a Next.js web application with the following structure:
- Components: `components/teleprompter/`
- Stores: `lib/stores/`, `stores/`
- Tests: `__tests__/unit/`, `__tests__/integration/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for the feature

- [ ] T001 Create feature branch `008-studio-layout-improvements` from main
- [ ] T002 Verify Radix UI Dialog dependency is installed in package.json
- [ ] T003 [P] Review Framer Motion usage patterns from feature 004-studio-ui-ux-improvements in components/teleprompter/config/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Extend LayoutConfig interface with columnCount and columnGap in lib/stores/useConfigStore.ts
- [ ] T005 Add migration function for legacy configs in lib/stores/useConfigStore.ts
- [ ] T006 Update default layout values to include columnCount: 2 and columnGap: 32 in lib/stores/useConfigStore.ts
- [ ] T007 Extend PanelState interface with isOverlay flag in stores/useUIStore.ts
- [ ] T008 Update PanelState default to isOverlay: true in stores/useUIStore.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Two-Column Preview Layout (Priority: P1) 🎯 MVP

**Goal**: Display teleprompter text in a 2-column newspaper-style layout

**Independent Test**: Navigate to /studio page, add sample text (3+ paragraphs), verify text displays in 2 equal-width columns with 32px gap

### Tests for User Story 1

- [ ] T009 [P] [US1] Create unit test for TeleprompterText column layout rendering in __tests__/unit/components/TeleprompterText-columns.test.tsx
- [ ] T010 [P] [US1] Create unit test for config store column state in __tests__/unit/stores/config-store-columns.test.ts
- [ ] T011 [P] [US1] Create integration test for two-column layout behavior in __tests__/integration/studio/layout-two-columns.test.tsx
- [ ] T012 [P] [US1] Create accessibility test for column layout screen reader support in __tests__/a11y/config/panel-a11y.test.tsx

### Implementation for User Story 1

- [ ] T013 [US1] Add columnCount and columnGap props to TeleprompterTextProps interface in components/teleprompter/display/TeleprompterText.tsx
- [ ] T014 [US1] Implement CSS column layout with useMemo in components/teleprompter/display/TeleprompterText.tsx
- [ ] T015 [US1] Add responsive breakpoint for mobile single-column fallback in components/teleprompter/display/TeleprompterText.tsx
- [ ] T016 [US1] Update PreviewPanel to pass columnCount and columnGap to TeleprompterText in components/teleprompter/editor/PreviewPanel.tsx
- [ ] T017 [US1] Extract layout columnCount from useConfigStore in components/teleprompter/editor/PreviewPanel.tsx
- [ ] T018 [US1] Add ARIA attributes for column layout in components/teleprompter/display/TeleprompterText.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Floating Configuration Panel (Priority: P1)

**Goal**: Convert ConfigPanel to a floating overlay that doesn't cause layout shift

**Independent Test**: Note ContentPanel and PreviewPanel positions, toggle ConfigPanel (Ctrl/Cmd + ,), verify panels do NOT shift position

### Tests for User Story 2

- [ ] T019 [P] [US2] Create unit test for ConfigPanel overlay behavior in __tests__/unit/components/ConfigPanel-overlay.test.tsx
- [ ] T020 [P] [US2] Create integration test for overlay panel behavior in __tests__/integration/studio/layout-overlay-panel.test.tsx
- [ ] T021 [P] [US2] Create performance test for animation FPS in __tests__/performance/config/preview-fps.test.tsx

### Implementation for User Story 2

- [ ] T022 [US2] Import Radix UI Dialog primitive in components/teleprompter/config/ConfigPanel.tsx
- [ ] T023 [US2] Wrap ConfigPanel with Dialog.Root using panel.visible state in components/teleprompter/config/ConfigPanel.tsx
- [ ] T024 [US2] Create Dialog.Overlay backdrop with bg-black/50 and backdrop-blur-sm in components/teleprompter/config/ConfigPanel.tsx
- [ ] T025 [US2] Convert ConfigPanel to fixed positioning with centered layout in components/teleprompter/config/ConfigPanel.tsx
- [ ] T026 [US2] Add panel width constraints: w-[400px] max-w-[90vw] h-[80vh] in components/teleprompter/config/ConfigPanel.tsx
- [ ] T027 [US2] Add z-index management: z-50 for panel, z-40 for backdrop in components/teleprompter/config/ConfigPanel.tsx
- [ ] T028 [US2] Implement fade + scale animation variants (300ms duration) in components/teleprompter/config/ConfigPanel.tsx
- [ ] T029 [US2] Add close button (X) to panel header in components/teleprompter/config/ConfigPanel.tsx
- [ ] T030 [US2] Remove AnimatePresence wrapper around ConfigPanel in components/teleprompter/Editor.tsx
- [ ] T031 [US2] Update ContentPanel width to lg:w-[50%] in components/teleprompter/Editor.tsx
- [ ] T032 [US2] Update PreviewPanel width to lg:w-[50%] in components/teleprompter/Editor.tsx
- [ ] T033 [US2] Remove conditional rendering of ConfigPanel in components/teleprompter/Editor.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Accessible Configuration Interface (Priority: P1)

**Goal**: Full keyboard navigation and screen reader support for ConfigPanel overlay

**Independent Test**: Use keyboard only - press Ctrl/Cmd + , to open, Tab through controls, press Escape to close, verify focus returns to trigger button

### Tests for User Story 3

- [ ] T034 [P] [US3] Create integration test for keyboard navigation in __tests__/integration/studio/layout-keyboard-nav.test.tsx
- [ ] T035 [P] [US3] Create accessibility test for focus trap in __tests__/a11y/config/panel-a11y.test.tsx

### Implementation for User Story 3

- [ ] T036 [US3] Add role="dialog" and aria-modal="true" to Dialog.Content in components/teleprompter/config/ConfigPanel.tsx
- [ ] T037 [US3] Add aria-label="Close configuration panel" to close button in components/teleprompter/config/ConfigPanel.tsx
- [ ] T038 [US3] Add aria-hidden="true" to backdrop in components/teleprompter/config/ConfigPanel.tsx
- [ ] T039 [US3] Verify Radix UI Dialog focus trap is working (built-in to Dialog primitive) in components/teleprompter/config/ConfigPanel.tsx
- [ ] T040 [US3] Ensure Escape key closes panel via Radix UI Dialog onOpenChange in components/teleprompter/config/ConfigPanel.tsx
- [ ] T041 [US3] Ensure clicking outside closes panel via Radix UI Dialog onOpenChange in components/teleprompter/config/ConfigPanel.tsx
- [ ] T042 [US3] Verify focus restoration on close via Radix UI Dialog in components/teleprompter/config/ConfigPanel.tsx
- [ ] T043 [US3] Update tab ARIA attributes in components/teleprompter/config/ConfigTabs.tsx
- [ ] T044 [US3] Test keyboard navigation with useKeyboardShortcuts hook in hooks/useKeyboardShortcuts.ts

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T045 [P] Update ConfigPanel.md documentation in components/teleprompter/config/ConfigPanel.md
- [ ] T046 [P] Update component examples in docs/
- [ ] T047 [P] Document new columnCount and columnGap config properties in docs/
- [ ] T048 [P] Update accessibility notes in docs/
- [ ] T049 Run ESLint and fix warnings: npm run lint
- [ ] T050 Run TypeScript type check: npx tsc --noEmit
- [ ] T051 Run all tests: npm test
- [ ] T052 Run quickstart.md validation steps from specs/008-studio-layout-improvements/quickstart.md
- [ ] T053 Update .roo/rules/specify-rules.md with any new technologies (none for this feature)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (Two-Column Layout)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (Floating ConfigPanel)**: Can start after Foundational (Phase 2) - No dependencies on US1
- **User Story 3 (Accessibility)**: Can start after Foundational (Phase 2) - Integrates with US2 ConfigPanel but independently testable

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD approach)
- Component implementation before integration
- Each story complete before moving to next story (if doing sequential delivery)

### Parallel Opportunities

**Setup Phase**:
- T002, T003 can run in parallel [P]

**Foundational Phase**:
- T004, T007 can run in parallel [P] (different stores)

**User Story 1 Tests** (all parallel):
- T009, T010, T011, T012 can all run in parallel [P]

**User Story 1 Implementation**:
- T013-T018 must be sequential (same file or dependent changes)

**User Story 2 Tests** (all parallel):
- T019, T020, T021 can all run in parallel [P]

**User Story 2 Implementation**:
- T022-T033 must be sequential (builds on same component)

**User Story 3 Tests** (all parallel):
- T034, T035 can run in parallel [P]

**User Story 3 Implementation**:
- T036-T044 mostly sequential (same component)

**Polish Phase**:
- T045-T048 can run in parallel [P] (different documentation files)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: T009 - Unit test for TeleprompterText column layout
Task: T010 - Unit test for config store column state
Task: T011 - Integration test for two-column layout
Task: T012 - Accessibility test for column layout

# After tests are written and failing:
Task: T013 - Add props to TeleprompterText interface
Task: T014 - Implement CSS column layout (depends on T013)
Task: T015 - Add responsive breakpoint (depends on T014)
Task: T016 - Update PreviewPanel to pass props (depends on T013-T015)
Task: T017 - Extract columnCount from configStore (parallel to T016)
Task: T018 - Add ARIA attributes (parallel to T016-T017)
```

---

## Parallel Example: User Story 2

```bash
# Launch all tests for User Story 2 together:
Task: T019 - Unit test for ConfigPanel overlay
Task: T020 - Integration test for overlay panel behavior
Task: T021 - Performance test for animation FPS

# After tests are written and failing:
Task: T022 - Import Radix UI Dialog
Task: T023 - Wrap ConfigPanel with Dialog.Root (depends on T022)
Task: T024 - Create Dialog.Overlay backdrop (depends on T023)
Task: T025 - Convert to fixed positioning (depends on T023-T024)
# ... continue sequential implementation
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Two-Column Layout)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Open /studio page
   - Add sample text (3+ paragraphs)
   - Verify text displays in 2 equal-width columns
   - Verify 32px gap between columns
   - Test mobile fallback to single column
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Two-Column Layout)
   - Developer B: User Story 2 (Floating ConfigPanel)
   - Developer C: User Story 3 (Accessibility)
3. Stories complete and integrate independently
4. Final Polish phase together

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests use TDD approach: write tests first, ensure they fail, then implement
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Radix UI Dialog provides built-in accessibility features (focus trap, escape handling)
- CSS columns use GPU acceleration for 60 FPS rendering
- Fixed positioning eliminates layout shift (CLS < 0.1 target)

---

## Success Criteria Validation

### Layout Metrics (SC-001)
- Layout Shift Score: < 0.1 (measure via Chrome DevTools Performance)
- Toggle Animation Time: ≤ 300ms (measure via Performance API)
- Column Rendering FPS: ≥ 60 FPS (measure via Chrome DevTools Performance)
- Panel Open Time: ≤ 100ms (measure via Performance API)

### User Experience (SC-002)
- No visible layout shift when toggling ConfigPanel
- Smooth column flow between columns
- All 3 dismiss methods work (Escape, click outside, close button)
- Full keyboard navigation possible

### Code Quality (SC-003)
- TypeScript strict mode: 100%
- Test coverage: >80%
- ESLint warnings: 0

---

**Generated**: 2026-01-01
**Feature Branch**: 008-studio-layout-improvements
**Total Tasks**: 53
**Tests Included**: Yes (TDD approach)
