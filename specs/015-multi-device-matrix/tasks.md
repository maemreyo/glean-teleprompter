# Tasks: Multi-Device Matrix Preview

**Input**: Design documents from `/specs/015-multi-device-matrix/`
**Prerequisites**: plan.md, spec.md, clarifications.md

**Tests**: This feature specification includes testing tasks. Tests are included to ensure quality for preview synchronization, state persistence, and drag-and-drop interactions.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a Next.js 14+ project with TypeScript. Component paths follow the app directory structure.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency setup

- [x] T001 Install @dnd-kit/core package for drag-and-drop functionality
- [x] T002 [P] Verify framer-motion is installed (should already exist per project guidelines)
- [x] T003 [P] Verify sonner is installed for toast notifications (should already exist per project guidelines)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create device registry constant in lib/story-builder/multi-device/deviceRegistry.ts
- [x] T005 [P] Create MultiDevicePreviewState type in lib/story-builder/types.ts
- [x] T006 [P] Create MultiDevicePreviewPreferences type in lib/story-builder/types.ts
- [x] T007 [P] Create localStorage helper utilities in lib/story-builder/multi-device/storage.ts
- [x] T008 Create memory calculation utility in lib/story-builder/multi-device/memory.ts
- [x] T009 Create useMultiDeviceStore Zustand slice in lib/stores/useMultiDeviceStore.ts
- [x] T010 Extend usePreviewSync hook for multi-iframe broadcast in lib/story-builder/hooks/useMultiDevicePreviewSync.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Multiple Devices Simultaneously (Priority: P1) 🎯 MVP

**Goal**: Enable users to view teleprompter content across multiple device types simultaneously in a responsive grid layout

**Independent Test**: 
1. Open story builder with teleprompter content
2. Click multi-device toggle button
3. Verify 3+ device frames are visible side-by-side
4. Edit content and verify all devices update simultaneously
5. Verify viewport warning appears below 1024px width

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T011 [P] [US1] Unit test for device registry in __tests__/unit/story-builder/multi-device/deviceRegistry.test.ts
- [x] T012 [P] [US1] Unit test for localStorage utilities in __tests__/unit/story-builder/multi-device/storage.test.ts
- [x] T013 [P] [US1] Unit test for memory calculation in __tests__/unit/story-builder/multi-device/memory.test.ts
- [x] T014 [P] [US1] Unit test for useMultiDeviceStore in __tests__/unit/story-builder/multi-device/store.test.ts
- [x] T015 [P] [US1] Unit test for useMultiDevicePreviewSync in __tests__/unit/story-builder/multi-device/previewSync.test.ts
- [x] T016 [P] [US1] Integration test for multi-device preview sync in __tests__/integration/story-builder/multi-device-preview-sync.test.tsx
- [x] T017 [P] [US1] E2E test for multi-device toggle functionality in __tests__/e2e/playwright/015-multi-device-matrix/toggle.spec.ts
- [x] T018 [P] [US1] E2E test for responsive grid layout in __tests__/e2e/playwright/015-multi-device-matrix/responsive-layout.spec.ts

### Implementation for User Story 1

- [x] T019 [P] [US1] Create DeviceChrome component in components/story-builder/preview/multi-device/DeviceChrome.tsx
- [x] T020 [P] [US1] Create LoadingIndicator component in components/story-builder/preview/multi-device/LoadingIndicator.tsx
- [x] T021 [P] [US1] Create ErrorState component in components/story-builder/preview/multi-device/ErrorState.tsx
- [x] T022 [US1] Create DeviceFrame component in components/story-builder/preview/multi-device/DeviceFrame.tsx (depends on T019, T020, T021)
- [x] T023 [US1] Create DeviceGrid CSS Grid container in components/story-builder/preview/multi-device/DeviceGrid.tsx (depends on T022)
- [x] T024 [US1] Create ViewportWarning component in components/story-builder/preview/multi-device/ViewportWarning.tsx
- [x] T025 [US1] Create DeviceMatrix container in components/story-builder/preview/multi-device/DeviceMatrix.tsx (depends on T023, T024)
- [x] T026 [US1] Create MultiDeviceToggle button in components/story-builder/preview/multi-device/MultiDeviceToggle.tsx
- [x] T027 [US1] Modify PreviewPanel to integrate multi-device mode in app/story-builder/components/preview/PreviewPanel.tsx (depends on T025, T026)
- [x] T028 [US1] Add CSS grid styles for responsive layout in app/story-builder/components/preview/multi-device/multi-device.css
- [x] T029 [US1] Implement viewport size detection hook in lib/story-builder/hooks/useViewportSize.ts
- [x] T030 [US1] Connect useMultiDevicePreviewSync to DeviceMatrix components (depends on T010, T025)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Customize Device Grid Layout (Priority: P2)

**Goal**: Allow users to configure grid layouts and select which device types appear in the preview

**Independent Test**: 
1. Enable multi-device preview
2. Select 2x grid configuration - verify exactly 2 device frames appear
3. Select 3x2 grid configuration - verify exactly 6 device frames appear
4. Enable/disable device types - verify grid updates accordingly
5. Refresh page - verify preferences persist

### Tests for User Story 2 ⚠️

- [x] T031 [P] [US2] Integration test for localStorage persistence in __tests__/integration/story-builder/multi-device-persistence.test.tsx
- [x] T032 [P] [US2] Integration test for grid configuration in __tests__/integration/story-builder/grid-configuration.test.tsx
- [x] T033 [P] [US2] Integration test for memory management in __tests__/integration/story-builder/memory-management.test.tsx
- [x] T034 [P] [US2] E2E test for grid layout selection in __tests__/e2e/playwright/015-multi-device-matrix/grid-configuration.spec.ts
- [x] T035 [P] [US2] E2E test for device type selection in __tests__/e2e/playwright/015-multi-device-matrix/device-selection.spec.ts

### Implementation for User Story 2

- [x] T036 [P] [US2] Create GridConfigSelector component in components/story-builder/preview/multi-device/GridConfigSelector.tsx
- [x] T037 [P] [US2] Create DeviceTypeChecklist component in components/story-builder/preview/multi-device/DeviceTypeChecklist.tsx
- [x] T038 [P] [US2] Create MemoryUsageDisplay component in components/story-builder/preview/multi-device/MemoryUsageDisplay.tsx
- [x] T039 [US2] Create GridConfiguration toolbar in components/story-builder/preview/multi-device/GridConfiguration.tsx (depends on T036, T037, T038)
- [x] T040 [US2] Create EmptySlot placeholder component in components/story-builder/preview/multi-device/EmptySlot.tsx
- [x] T041 [US2] Integrate GridConfiguration into DeviceMatrix in components/story-builder/preview/multi-device/DeviceMatrix.tsx (depends on T039, T025)
- [x] T042 [US2] Add memory limit logic to device type selection in components/story-builder/preview/multi-device/DeviceTypeChecklist.tsx
- [x] T043 [US2] Handle grid slot vs enabled device mismatch in components/story-builder/preview/multi-device/DeviceGrid.tsx (depends on T040)
- [x] T044 [US2] Connect localStorage persistence to useMultiDeviceStore in lib/stores/useMultiDeviceStore.ts (depends on T007, T009)
- [x] T045 [US2] Add memory warning toast notifications in components/story-builder/preview/multi-device/GridConfiguration.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Reorganize Device Grid (Priority: P3)

**Goal**: Enable users to drag and drop devices within the preview grid to customize layout order

**Independent Test**: 
1. Enable multi-device preview with 3+ devices
2. Drag a device frame to a new position
3. Verify grid reorganizes to reflect new arrangement
4. Refresh page - verify device positions persist

### Tests for User Story 3 ⚠️

- [x] T046 [P] [US3] Integration test for drag-and-drop reordering in __tests__/integration/story-builder/drag-drop-reorder.test.tsx
- [x] T047 [P] [US3] E2E test for drag-and-drop workflow in __tests__/e2e/playwright/015-multi-device-matrix/drag-drop.spec.ts
- [x] T048 [P] [US3] Performance test for drag-and-drop latency in __tests__/performance/story-builder/drag-drop-performance.test.ts

### Implementation for User Story 3

- [x] T049 [US3] Setup @dnd-kit providers in components/story-builder/preview/multi-device/DndProvider.tsx
- [x] T050 [US3] Add draggable indicators to DeviceFrame in components/story-builder/preview/multi-device/DeviceFrame.tsx (depends on T022)
- [x] T051 [US3] Implement drop zone logic in DeviceGrid in components/story-builder/preview/multi-device/DeviceGrid.tsx (depends on T023, T049)
- [x] T052 [US3] Update device order state on drop in lib/stores/useMultiDeviceStore.ts (depends on T009, T051)
- [x] T053 [US3] Persist device order to localStorage in lib/story-builder/multi-device/storage.ts (depends on T007, T052)
- [x] T054 [US3] Add animation transitions using framer-motion in components/story-builder/preview/multi-device/DeviceGrid.tsx
- [x] T055 [US3] Add keyboard alternative for drag-and-drop in components/story-builder/preview/multi-device/DeviceGrid.tsx

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T056 [P] Add accessibility labels and ARIA attributes to all multi-device components
- [x] T057 [P] Visual regression tests for device frame chrome styling in __tests__/visual/story-builder/device-frame-chrome.test.tsx
- [x] T058 [P] Performance optimization for iframe sync in lib/story-builder/hooks/useMultiDevicePreviewSync.ts
- [x] T059 Add error boundary for multi-device preview in components/story-builder/preview/multi-device/ErrorBoundary.tsx
- [x] T060 Update feature documentation in docs/features/multi-device-matrix-preview.md
- [x] T061 [P] Add TypeScript type exports to lib/story-builder/multi-device/index.ts
- [x] T062 Code cleanup and refactoring for multi-device components
- [x] T063 Run ESLint and fix any linting issues in multi-device files
- [x] T064 Validate all success criteria from spec.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends US1 GridConfiguration but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Extends US1/US2 DeviceFrame/DeviceGrid but independently testable

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD approach)
- Smaller components before larger composite components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Components within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for device registry in __tests__/unit/story-builder/multi-device/deviceRegistry.test.ts"
Task: "Unit test for localStorage utilities in __tests__/unit/story-builder/multi-device/storage.test.ts"
Task: "Unit test for memory calculation in __tests__/unit/story-builder/multi-device/memory.test.ts"
Task: "Unit test for useMultiDeviceStore in __tests__/unit/story-builder/multi-device/store.test.ts"
Task: "Unit test for useMultiDevicePreviewSync in __tests__/unit/story-builder/multi-device/previewSync.test.ts"
Task: "Integration test for multi-device preview sync in __tests__/integration/story-builder/multi-device-preview-sync.test.tsx"
Task: "E2E test for multi-device toggle functionality in __tests__/e2e/playwright/015-multi-device-matrix/toggle.spec.ts"
Task: "E2E test for responsive grid layout in __tests__/e2e/playwright/015-multi-device-matrix/responsive-layout.spec.ts"

# Launch all leaf components for User Story 1 together:
Task: "Create DeviceChrome component in components/story-builder/preview/multi-device/DeviceChrome.tsx"
Task: "Create LoadingIndicator component in components/story-builder/preview/multi-device/LoadingIndicator.tsx"
Task: "Create ErrorState component in components/story-builder/preview/multi-device/ErrorState.tsx"
```

---

## Parallel Example: User Story 2

```bash
# Launch all tests for User Story 2 together:
Task: "Integration test for localStorage persistence in __tests__/integration/story-builder/multi-device-persistence.test.tsx"
Task: "Integration test for grid configuration in __tests__/integration/story-builder/grid-configuration.test.tsx"
Task: "Integration test for memory management in __tests__/integration/story-builder/memory-management.test.tsx"
Task: "E2E test for grid layout selection in __tests__/e2e/playwright/015-multi-device-matrix/grid-configuration.spec.ts"
Task: "E2E test for device type selection in __tests__/e2e/playwright/015-multi-device-matrix/device-selection.spec.ts"

# Launch all components for User Story 2 together:
Task: "Create GridConfigSelector component in components/story-builder/preview/multi-device/GridConfigSelector.tsx"
Task: "Create DeviceTypeChecklist component in components/story-builder/preview/multi-device/DeviceTypeChecklist.tsx"
Task: "Create MemoryUsageDisplay component in components/story-builder/preview/multi-device/MemoryUsageDisplay.tsx"
```

---

## Parallel Example: User Story 3

```bash
# Launch all tests for User Story 3 together:
Task: "Integration test for drag-and-drop reordering in __tests__/integration/story-builder/drag-drop-reorder.test.tsx"
Task: "E2E test for drag-and-drop workflow in __tests__/e2e/playwright/015-multi-device-matrix/drag-drop.spec.ts"
Task: "Performance test for drag-and-drop latency in __tests__/performance/story-builder/drag-drop-performance.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T010) - CRITICAL
3. Complete Phase 3: User Story 1 (T011-T030)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

**MVP Delivers**:
- Toggle between single/multi-device preview modes
- View 3+ devices simultaneously in responsive grid
- Content syncs across all device frames
- Viewport warning below 1024px

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Complete Polish → Final feature delivery

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (P1) - 20 tasks (8 tests + 12 implementation)
   - Developer B: User Story 2 (P2) - 15 tasks (5 tests + 10 implementation)
   - Developer C: User Story 3 (P3) - 10 tasks (3 tests + 7 implementation)
3. Stories complete and integrate independently

---

## Summary

- **Total Tasks**: 64
- **User Story 1 (P1)**: 20 tasks (8 tests + 12 implementation)
- **User Story 2 (P2)**: 15 tasks (5 tests + 10 implementation)
- **User Story 3 (P3)**: 10 tasks (3 tests + 7 implementation)
- **Setup**: 3 tasks
- **Foundational**: 7 tasks
- **Polish**: 9 tasks

### Parallel Opportunities

- **8 test tasks** can run in parallel for User Story 1
- **3 test tasks** can run in parallel for User Story 2
- **3 test tasks** can run in parallel for User Story 3
- **3 leaf components** can run in parallel for User Story 1
- **3 sub-components** can run in parallel for User Story 2

### Independent Test Criteria

- **US1**: Toggle on/off, view 3+ devices, content syncs, viewport warning
- **US2**: Select grid configs, enable/disable devices, memory warnings, persistence
- **US3**: Drag-to-reorder, animations, keyboard alternative, persistence

### Suggested MVP Scope

**User Story 1 only** (Tasks T001-T030) - Deliverable as standalone feature with core value proposition.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
