# Tasks: Configuration Panel UI/UX Improvements

> **🎉 ALL USER STORIES COMPLETE**: Phase 1 (Setup), Phase 2 (Foundational), and ALL 6 user stories (US1-US6) implementation tasks are complete. Optional test tasks remain unimplemented.

**Input**: Design documents from `/specs/005-config-panel-improvements/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: Tests are OPTIONAL for this feature. The specification mentions testing requirements but does not explicitly request TDD approach. Test tasks are included as optional items that can be completed alongside or after implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Components**: `components/teleprompter/`
- **State**: `stores/`, `lib/stores/`
- **Types**: `lib/config/types.ts`
- **Tests**: `__tests__/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type definitions and utility functions required by multiple user stories

- [x] T001 Create PanelState interface in lib/config/types.ts
- [x] T002 [P] Create HistoryEntry interface in lib/config/types.ts
- [x] T003 [P] Create HistoryStack interface in lib/config/types.ts
- [x] T004 [P] Create TextareaScaleState interface in lib/config/types.ts
- [x] T005 [P] Create FooterState interface in lib/config/types.ts
- [x] T006 [P] Create scale multipliers constant in lib/config/types.ts
- [x] T007 [P] Create useMediaQuery hook in hooks/useMediaQuery.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core store extensions that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Extend useUIStore with panelState, textareaScale, footerState in stores/useUIStore.ts
- [x] T009 [P] Add setPanelVisible, togglePanel actions to useUIStore in stores/useUIStore.ts
- [x] T010 [P] Add setTextareaSize action to useUIStore in stores/useUIStore.ts
- [x] T011 [P] Add setFooterVisible, toggleFooterCollapsed actions to useUIStore in stores/useUIStore.ts
- [x] T012 Extend useConfigStore with history management interface in lib/stores/useConfigStore.ts
- [x] T013 Create history middleware skeleton for useConfigStore in lib/stores/useConfigStore.ts

**Checkpoint**: ✅ Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Config Panel Toggle with Smooth Animation (Priority: P1) 🎯 MVP

**Goal**: Enable users to toggle configuration panel visibility with smooth 300ms animation, keyboard shortcuts, and persistent state

**Independent Test**: Toggle panel open/closed and verify (1) button in correct position, (2) smooth 300ms animation, (3) state persists across reloads, (4) content/preview panels expand to fill space

### Tests for User Story 1 (OPTIONAL) ⚠️

> **NOTE: Tests can be written alongside or after implementation**

- [ ] T014 [P] [US1] Unit test: Panel toggle button click updates state in __tests__/unit/config/panel-toggle.test.tsx
- [ ] T015 [P] [US1] Unit test: localStorage persistence across reloads in __tests__/unit/config/panel-persistence.test.tsx
- [ ] T016 [P] [US1] Unit test: Keyboard shortcut (Ctrl/Cmd + ,) functionality in __tests__/unit/config/panel-keyboard-shortcut.test.tsx
- [ ] T017 [US1] Integration test: Panel animation smoothness in __tests__/integration/config/panel-animation.test.tsx
- [ ] T018 [US1] Accessibility test: ARIA labels and announcements in __tests__/a11y/config/panel-a11y.test.tsx

### Implementation for User Story 1

- [x] T019 [US1] Add toggle button (Settings icon) to ContentPanel header in components/teleprompter/editor/ContentPanel.tsx
- [x] T020 [US1] Implement panel slide animation with Framer Motion in components/teleprompter/config/ConfigPanel.tsx
- [x] T021 [US1] Wrap ConfigPanel with AnimatePresence in components/teleprompter/Editor.tsx
- [x] T022 [US1] Add localStorage persistence for 'configPanelVisible' in stores/useUIStore.ts
- [x] T023 [US1] Implement keyboard shortcut (Ctrl/Cmd + ,) in components/teleprompter/editor/ContentPanel.tsx
- [x] T024 [US1] Add debounce mechanism for rapid toggle clicks in stores/useUIStore.ts
- [x] T025 [US1] Ensure responsive behavior (hidden by default on mobile/tablet) in components/teleprompter/Editor.tsx
- [x] T026 [US1] Add ARIA labels and screen reader announcements in components/teleprompter/editor/ContentPanel.tsx
- [x] T027 [US1] Respect prefers-reduced-motion for panel animation in components/teleprompter/config/ConfigPanel.tsx

**Checkpoint**: ✅ User Story 1 complete - fully functional and testable independently

---

## Phase 4: User Story 2 - Real-Time Configuration Preview (Priority: P1) 🎯 MVP

**Goal**: Configuration changes appear in preview panel within 100ms with loading/error states for slow operations

**Independent Test**: Make configuration changes (typography, colors, layout, effects) and verify (1) all changes appear in preview within 100ms, (2) changes apply when config panel hidden, (3) loading states appear for slow operations

### Tests for User Story 2 (OPTIONAL) ⚠️

- [ ] T028 [P] [US2] Integration test: Preview updates within 100ms in __tests__/integration/config/preview-update-latency.test.tsx
- [ ] T029 [P] [US2] Performance test: 60 FPS during rapid changes in __tests__/performance/config/preview-fps.test.tsx
- [ ] T030 [US2] Unit test: Loading states display correctly in __tests__/unit/config/preview-loading.test.tsx
- [ ] T031 [US2] Unit test: Error states for invalid media URLs in __tests__/unit/config/preview-error.test.tsx

### Implementation for User Story 2

- [x] T032 [US2] Ensure PreviewPanel subscribes to useConfigStore in components/teleprompter/editor/PreviewPanel.tsx
- [x] T033 [US2] Add loading state indicators to PreviewPanel in components/teleprompter/editor/PreviewPanel.tsx
- [x] T034 [US2] Add error state handling for invalid media URLs in components/teleprompter/editor/PreviewPanel.tsx
- [x] T035 [US2] Implement batch update debouncing (50ms window) in lib/stores/useConfigStore.ts
- [x] T036 [US2] Create "Test" button for entrance animations in components/teleprompter/config/animations/AnimationsTab.tsx
- [x] T037 [US2] Optimize PreviewPanel with React.memo in components/teleprompter/editor/PreviewPanel.tsx
- [x] T038 [US2] Add performance monitoring for preview updates in components/teleprompter/editor/PreviewPanel.tsx

**Checkpoint**: ✅ MVP COMPLETE! User Stories 1 AND 2 both work independently

---

## Phase 5: User Story 3 - Proportional UI Scaling with Textarea Expansion (Priority: P2)

**Goal**: All UI elements (buttons, icons, labels) scale proportionally with textarea size without horizontal scroll

**Independent Test**: Expand textarea to each size level and verify (1) all buttons scale proportionally, (2) no horizontal scroll appears, (3) expand/collapse button remains centered, (4) footer actions remain accessible

### Tests for User Story 3 (OPTIONAL) ⚠️

- [ ] T039 [P] [US3] Visual regression test: Button scaling at each size level in __tests__/visual/config/scaling-buttons.test.tsx
- [ ] T040 [P] [US3] Unit test: Scale multipliers calculated correctly in __tests__/unit/config/scale-calculations.test.ts
- [ ] T041 [US3] Integration test: No horizontal scroll appears in __tests__/integration/config/scaling-scroll.test.tsx
- [ ] T042 [US3] Responsive test: Layout intact at 375px width in __tests__/responsive/config/scaling-mobile.test.tsx

### Implementation for User Story 3

- [x] T043 [P] [US3] Define scale multipliers CSS variables in components/teleprompter/editor/ContentPanel.tsx
- [x] T044 [P] [US3] Update TextareaExpandButton with scale styles in components/teleprompter/editor/TextareaExpandButton.tsx
- [x] T045 [US3] Update footer action buttons with proportional scaling in components/teleprompter/editor/ContentPanel.tsx
- [x] T046 [US3] Implement 200ms size transition in components/teleprompter/editor/ContentPanel.tsx
- [x] T047 [US3] Add cap for label text (16px max) in components/teleprompter/editor/ContentPanel.tsx
- [x] T048 [US3] Ensure no horizontal scroll at any size in components/teleprompter/editor/ContentPanel.tsx
- [x] T049 [US3] Test and adjust layout for 375px minimum viewport width in components/teleprompter/editor/ContentPanel.tsx

**Checkpoint**: ✅ User Stories 1, 2, AND 3 all work independently

---

## Phase 6: User Story 4 - Configuration Undo/Redo (Priority: P2)

**Goal**: Users can undo/redo up to 50 configuration changes with keyboard shortcuts and visual indicator

**Independent Test**: Make multiple configuration changes and verify (1) each change recorded in history, (2) undo restores previous states, (3) redo restores undone states, (4) keyboard shortcuts work, (5) history resets on preset/template load

### Tests for User Story 4 (OPTIONAL) ⚠️

- [ ] T050 [P] [US4] Unit test: History stack maintains 50-state limit in __tests__/unit/config/history-limit.test.ts
- [ ] T051 [P] [US4] Unit test: FIFO removal when limit exceeded in __tests__/unit/config/history-fifo.test.ts
- [ ] T052 [US4] Integration test: Undo/redo restores correct states in __tests__/integration/config/history-undo-redo.test.tsx
- [ ] T053 [US4] Unit test: Keyboard shortcuts work correctly in __tests__/unit/config/history-keyboard.test.tsx
- [ ] T054 [US4] Integration test: History resets on preset/template load in __tests__/integration/config/history-reset.test.tsx

### Implementation for User Story 4

- [x] T055 [US4] Implement HistoryStack data structure in lib/stores/useConfigStore.ts
- [x] T056 [US4] Complete history management middleware in lib/stores/useConfigStore.ts
- [x] T057 [US4] Add hybrid recording logic (discrete=immediate, continuous=batched) in lib/stores/useConfigStore.ts
- [x] T058 [US4] Implement undo/redo keyboard shortcuts (Ctrl/Cmd + Z, Ctrl/Cmd + Shift + Z) in components/teleprompter/config/ConfigPanel.tsx
- [x] T059 [US4] Add visual indicator ("5/10 changes") in components/teleprompter/config/ConfigPanel.tsx
- [x] T060 [US4] Create "Clear History" confirmation dialog in components/teleprompter/config/ConfigPanel.tsx
- [x] T061 [US4] Implement history reset on preset/template/script load in lib/stores/useConfigStore.ts
- [x] T062 [US4] Add localStorage persistence for history in lib/stores/useConfigStore.ts
- [x] T063 [US4] Update undo/redo button states in components/teleprompter/config/ConfigPanel.tsx

**Checkpoint**: ✅ User Stories 1-4 all work independently

---

## Phase 7: User Story 5 - Mobile-Optimized Configuration Interface (Priority: P3)

**Goal**: Mobile users access all configuration options through touch-optimized bottom sheet interface

**Independent Test**: On mobile device/simulator verify (1) config panel opens as bottom sheet, (2) all controls touch-optimized (48px), (3) gestures work, (4) panel adapts to orientation changes

### Tests for User Story 5 (OPTIONAL) ⚠️

- [ ] T064 [P] [US5] Mobile integration test: Bottom sheet opens correctly in __tests__/integration/mobile/config-bottom-sheet.test.tsx
- [ ] T065 [P] [US5] Touch test: Sliders meet 48px touch target in __tests__/touch/config/slider-touch-targets.test.tsx
- [ ] T066 [US5] Gesture test: Swipe-to-close works at 100px threshold in __tests__/touch/config/swipe-gesture.test.tsx
- [ ] T067 [US5] Responsive test: Landscape split view activates in __tests__/responsive/mobile/config-landscape.test.tsx
- [ ] T068 [US5] Accessibility test: "Done" button and gestures accessible in __tests__/a11y/mobile/config-a11y.test.tsx

### Implementation for User Story 5

- [x] T069 [P] [US5] Extend TabBottomSheet for mobile config panel in components/teleprompter/config/TabBottomSheet.tsx
- [x] T070 [P] [US5] Implement bottom sheet with 90% height in components/teleprompter/config/TabBottomSheet.tsx
- [x] T071 [P] [US5] Add horizontally scrollable tab pills in components/teleprompter/config/ConfigTabs.tsx
- [x] T072 [P] [US5] Touch-optimize sliders (48px minimum) in components/teleprompter/config/ui/SliderInput.tsx
- [x] T073 [US5] Create mobile color picker wrapper (native input) in components/teleprompter/config/colors/ColorsTab.tsx
- [x] T074 [US5] Create mobile font picker (native select/modal) in components/teleprompter/config/typography/FontSelector.tsx
- [x] T075 [US5] Implement swipe-to-close gesture (100px threshold) in components/teleprompter/config/TabBottomSheet.tsx
- [x] T076 [US5] Add "Done" button to mobile config panel in components/teleprompter/config/TabBottomSheet.tsx
- [x] T077 [US5] Implement landscape split view in components/teleprompter/config/TabBottomSheet.tsx
- [x] T078 [US5] Add compact layout for < 375px devices in components/teleprompter/config/TabBottomSheet.tsx
- [x] T079 [US5] Integrate mobile config panel with Editor in components/teleprompter/Editor.tsx

**Checkpoint**: ✅ User Stories 1-5 all work independently

---

## Phase 8: User Story 6 - Adaptive Footer with Textarea Scaling (Priority: P3)

**Goal**: Footer actions remain accessible and properly positioned at all textarea sizes with fixed positioning and proper content padding

**Independent Test**: Expand textarea to each size level and verify (1) footer remains visible and accessible, (2) no content hidden behind footer, (3) buttons maintain 44x44px minimum, (4) footer hidden in fullscreen mode

### Tests for User Story 6 (OPTIONAL) ⚠️

- [ ] T080 [P] [US6] Integration test: Footer remains fixed at bottom in __tests__/integration/config/footer-fixed.test.tsx
- [ ] T081 [P] [US6] Visual test: No content hidden behind footer in __tests__/visual/config/footer-padding.test.tsx
- [ ] T082 [US6] Responsive test: Touch targets maintained in __tests__/responsive/config/footer-touch-targets.test.tsx
- [ ] T083 [US6] Mobile test: Footer reflow works on small screens in __tests__/responsive/mobile/footer-reflow.test.tsx

### Implementation for User Story 6

- [x] T084 [US6] Calculate footer scale multiplier based on textarea size in components/teleprompter/editor/ContentPanel.tsx
- [x] T085 [US6] Implement fixed/sticky positioning at viewport bottom in components/teleprompter/editor/ContentPanel.tsx
- [x] T086 [US6] Add bottom padding to content equal to footer height in components/teleprompter/editor/ContentPanel.tsx
- [x] T087 [US6] Ensure 44x44px minimum touch targets for footer buttons in components/teleprompter/editor/ContentPanel.tsx
- [x] T088 [US6] Hide footer in fullscreen mode in components/teleprompter/editor/ContentPanel.tsx
- [x] T089 [US6] Add semi-transparent backdrop (bg-card/90) in components/teleprompter/editor/ContentPanel.tsx
- [x] T090 [US6] Implement footer reflow for mobile in components/teleprompter/editor/ContentPanel.tsx

**Checkpoint**: ✅ ALL user stories (1-6) are independently functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T091 [P] Update component documentation in components/teleprompter/config/ConfigPanel.md
- [ ] T092 [P] Update store type definitions in lib/config/types.ts
- [ ] T093 Code cleanup and refactoring across config components
- [ ] T094 Performance optimization across all config stories
- [ ] T095 [P] Additional unit tests for edge cases in __tests__/unit/config/
- [ ] T096 Security hardening (localStorage XSS protection) in stores/useUIStore.ts
- [ ] T097 Run quickstart.md validation scenarios
- [ ] T098 Verify WCAG 2.1 AA compliance for all new features

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - US1 (P1) and US2 (P1) can proceed in parallel after Foundational
  - US3 (P2) and US4 (P2) can proceed in parallel after Foundational
  - US5 (P3) and US6 (P3) can proceed in parallel after Foundational
  - Or sequentially in priority order: P1 → P2 → P3
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Tests (if included) can be written alongside implementation
- Type definitions before components
- Store extensions before components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] (T002-T007) can run in parallel
- All Foundational tasks marked [P] (T009-T011) can run in parallel
- Once Foundational phase completes:
  - US1 (Phase 3) and US2 (Phase 4) can be developed in parallel
  - US3 (Phase 5) and US4 (Phase 6) can be developed in parallel
  - US5 (Phase 7) and US6 (Phase 8) can be developed in parallel
- All tests for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1 (Config Panel Toggle)

```bash
# Launch all type definitions together (if starting fresh):
Task: "Create HistoryEntry interface in lib/config/types.ts"
Task: "Create HistoryStack interface in lib/config/types.ts"
Task: "Create TextareaScaleState interface in lib/config/types.ts"
Task: "Create FooterState interface in lib/config/types.ts"
Task: "Create scale multipliers constant in lib/config/types.ts"
Task: "Create useMediaQuery hook in hooks/useMediaQuery.ts"

# After Foundational, launch all tests for US1 together (if doing TDD):
Task: "Unit test: Panel toggle button click updates state"
Task: "Unit test: localStorage persistence across reloads"
Task: "Unit test: Keyboard shortcut functionality"
Task: "Integration test: Panel animation smoothness"
Task: "Accessibility test: ARIA labels and announcements"
```

---

## Parallel Example: User Story 4 (Undo/Redo)

```bash
# Launch all tests for US4 together:
Task: "Unit test: History stack maintains 50-state limit"
Task: "Unit test: FIFO removal when limit exceeded"
Task: "Integration test: Undo/redo restores correct states"
Task: "Unit test: Keyboard shortcuts work correctly"
Task: "Integration test: History resets on preset/template load"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: Foundational (T008-T013) - CRITICAL
3. Complete Phase 3: User Story 1 (T014-T027)
4. Complete Phase 4: User Story 2 (T028-T038)
5. **STOP and VALIDATE**: Test US1 and US2 independently
6. Deploy/demo MVP if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 (Config Toggle) + US2 (Real-Time Preview) → Test independently → Deploy/Demo (MVP!)
3. Add US3 (Scaling) + US4 (Undo/Redo) → Test independently → Deploy/Demo
4. Add US5 (Mobile) + US6 (Footer) → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup (Phase 1) + Foundational (Phase 2) together
2. Once Foundational is done:
   - Developer A: US1 (Config Toggle) + US2 (Real-Time Preview) - P1 priority
   - Developer B: US3 (Scaling) + US4 (Undo/Redo) - P2 priority
   - Developer C: US5 (Mobile) + US6 (Footer) - P3 priority
3. Stories complete and integrate independently

### Minimum Viable Product (MVP) Scope

**Recommended MVP**: User Stories 1 & 2 (P1 priority)
- Config Panel Toggle with Smooth Animation
- Real-Time Configuration Preview

This provides:
- Immediate workspace improvement (toggle)
- Core configuration UX enhancement (real-time preview)
- Foundation for P2/P3 features

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests are OPTIONAL - can be written alongside implementation rather than strict TDD
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Task Summary

**Total Tasks**: 98
- Setup: 7 tasks
- Foundational: 6 tasks
- US1 (P1 - Config Toggle): 14 tasks (5 optional tests + 9 implementation)
- US2 (P1 - Real-Time Preview): 11 tasks (4 optional tests + 7 implementation)
- US3 (P2 - Scaling): 11 tasks (4 optional tests + 7 implementation)
- US4 (P2 - Undo/Redo): 14 tasks (5 optional tests + 9 implementation)
- US5 (P3 - Mobile): 16 tasks (5 optional tests + 11 implementation)
- US6 (P3 - Footer): 11 tasks (4 optional tests + 7 implementation)
- Polish: 8 tasks

**Test Tasks**: 31 (optional, marked clearly)
**Implementation Tasks**: 67 (required)

**Parallel Opportunities**: 35 tasks marked [P] can run in parallel within their phases

**MVP Scope**: 25 implementation tasks (Setup + Foundational + US1 + US2)
