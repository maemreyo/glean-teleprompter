# Tasks: Auto-save Improvements

**Input**: Design documents from `/specs/006-autosave-improvements/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are included as this feature requires comprehensive testing per spec.md requirements.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a Next.js 14+ web application with hooks in `hooks/`, utilities in `lib/`, components in `components/`, and tests in `__tests__//`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create directory structure and type definitions

- [x] T001 Create lib/storage directory for draft storage modules
- [x] T002 Create __tests__/unit/storage directory for storage tests
- [x] T003 Create __tests__/unit/hooks directory for hook tests
- [x] T004 Create __tests__/integration/autosave directory for auto-save integration tests
- [x] T005 Create __tests__/integration/draft-management directory for draft management integration tests

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definitions and storage utilities that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Type Definitions

- [x] T006 [P] Create TeleprompterDraft interface in lib/storage/types.ts
- [x] T007 [P] Create DraftsCollection interface in lib/storage/types.ts
- [x] T008 [P] Create StorageUsageMetrics interface in lib/storage/types.ts
- [x] T009 [P] Create SaveStatus, ConflictResolution, QuotaWarningLevel types in lib/storage/types.ts
- [x] T010 [P] Create storage error classes (QuotaExceededError, CorruptedDataError, MigrationError, StorageUnavailableError) in lib/storage/types.ts
- [x] T011 [P] Export CURRENT_SCHEMA_VERSION constant and STORAGE_KEYS in lib/storage/types.ts

### Core Storage Layer

- [x] T012 [P] Implement saveDraft function in lib/storage/draftStorage.ts
- [x] T013 [P] Implement loadDraft function in lib/storage/types.ts
- [x] T014 [P] Implement loadAllDrafts function in lib/storage/draftStorage.ts
- [x] T015 [P] Implement addToCollection and removeFromCollection functions in lib/storage/draftStorage.ts
- [x] T016 [P] Implement getUsage function in lib/storage/storageQuota.ts
- [x] T017 [P] Implement getWarningLevel function in lib/storage/storageQuota.ts
- [x] T018 [P] Implement cleanupOldDrafts function in lib/storage/storageQuota.ts
- [x] T019 [P] Implement getCurrentVersion and getDraftVersion functions in lib/storage/draftMigration.ts
- [x] T020 [P] Implement migrateDraft function in lib/storage/draftMigration.ts
- [x] T021 [P] Implement registerMigration function in lib/storage/draftMigration.ts
- [x] T022 Register migration 1.0 → 2.0 in lib/storage/draftMigration.ts (depends on T020, T021)

### Detection Utilities

- [x] T023 Implement detectPrivateBrowsing function in lib/utils/privateBrowsing.ts

### ARIA Labels

- [x] T024 Add draft management ARIA labels in lib/a11y/ariaLabels.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Unified Auto-save System (Priority: P1) 🎯 MVP

**Goal**: Consolidate dual auto-save mechanisms into a single system that saves all 11 teleprompter properties atomically

**Independent Test**: Edit content in studio and verify all properties are saved consistently without race conditions

### Tests for User Story 1

- [x] T025 [P] [US1] Create useAutoSave unit test in __tests__/unit/hooks/useAutoSave.test.ts
- [x] T026 [P] [US1] Create draftStorage unit test in __tests__/unit/storage/draftStorage.test.ts
- [x] T027 [P] [US1] Create unified save integration test in __tests__/integration/autosave/unified-save.test.tsx
- [x] T028 [P] [US1] Create conflict detection integration test in __tests__/integration/autosave/conflict-detection.test.tsx

### Implementation for User Story 1

- [x] T029 [P] [US1] Implement saveDraftWithConflictDetection function in lib/storage/draftStorage.ts (depends on T012, T013)
- [x] T030 [US1] Refactor hooks/useAutoSave.ts to consolidate dual save mechanisms into single unified hook (depends on T029)
- [x] T031 [US1] Add debounced save (1s) to useAutoSave hook in hooks/useAutoSave.ts (depends on T030)
- [x] T032 [US1] Add periodic save (5s) to useAutoSave hook in hooks/useAutoSave.ts (depends on T030)
- [x] T033 [US1] Add conflict detection logic to useAutoSave hook in hooks/useAutoSave.ts (depends on T030, T029)
- [x] T034 [US1] Add requestIdleCallback for non-blocking saves in hooks/useAutoSave.ts (depends on T030)
- [x] T035 [US1] Update AutoSaveStatus component to show unified save status in components/teleprompter/config/ui/AutoSaveStatus.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional - atomic saves of all 11 properties

---

## Phase 4: User Story 2 - Protected Page Close (Priority: P1)

**Goal**: Add beforeunload handler to save state immediately before tab close

**Independent Test**: Make changes and immediately close tab, then reopen to verify all changes were preserved

### Tests for User Story 2

- [x] T036 [P] [US2] Create beforeunload handler unit test in __tests__/unit/hooks/useAutoSave.test.ts
- [x] T037 [P] [US2] Create beforeunload integration test in __tests__/integration/autosave/beforeunload.test.tsx

### Implementation for User Story 2

- [x] T038 [US2] Create useBeforeUnloadSave hook in hooks/useBeforeUnloadSave.ts (depends on T030)
- [x] T039 [US2] Integrate useBeforeUnloadSave with useAutoSave in hooks/useAutoSave.ts (depends on T038, T030)
- [x] T040 [US2] Add conditional save logic (setup mode only) in hooks/useBeforeUnloadSave.ts (depends on T038)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Private Browsing Detection (Priority: P2)

**Goal**: Detect private browsing mode and display warning banner

**Independent Test**: Open app in private browsing mode and verify warning banner appears

### Tests for User Story 3

- [x] T041 [P] [US3] Create private browsing detection unit test in __tests__/unit/utils/privateBrowsing.test.ts
- [x] T042 [P] [US3] Create private browsing warning component test in __tests__/unit/components/PrivateBrowsingWarning.test.tsx

### Implementation for User Story 3

- [x] T043 [P] [US3] Create usePrivateBrowsing hook in hooks/usePrivateBrowsing.ts (depends on T023)
- [x] T044 [US3] Create PrivateBrowsingWarning component in components/teleprompter/config/ui/PrivateBrowsingWarning.tsx (depends on T043, T024)
- [x] T045 [US3] Add "Save to account" CTA in PrivateBrowsingWarning component in components/teleprompter/config/ui/PrivateBrowsingWarning.tsx (depends on T044)
- [x] T046 [US3] Integrate PrivateBrowsingWarning in studio page in app/[locale]/studio/page.tsx (depends on T044)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Storage Quota Management (Priority: P2)

**Goal**: Track localStorage usage and provide cleanup tools when quota is exceeded

**Independent Test**: Fill storage to near capacity and trigger save operations to verify warnings appear

### Tests for User Story 4

- [x] T047 [P] [US4] Create storage quota unit tests in __tests__/unit/storage/storageQuota.test.ts
- [x] T048 [P] [US4] Create quota warning component test in __tests__/unit/components/StorageQuotaWarning.test.tsx

### Implementation for User Story 4

- [x] T049 [P] [US4] Create useStorageQuota hook in hooks/useStorageQuota.ts (depends on T016, T017, T018)
- [x] T050 [US4] Create StorageQuotaWarning component in components/teleprompter/config/ui/StorageQuotaWarning.tsx (depends on T049)
- [x] T051 [US4] Add "Clear Old Drafts" button in StorageQuotaWarning component in components/teleprompter/config/ui/StorageQuotaWarning.tsx (depends on T050)
- [x] T052 [US4] Display storage usage as percentage and size in StorageQuotaWarning component in components/teleprompter/config/ui/StorageQuotaWarning.tsx (depends on T050)
- [x] T053 [US4] Integrate StorageQuotaWarning with save operations in hooks/useAutoSave.ts (depends on T049, T030)

**Checkpoint**: At this point, User Stories 1, 2, 3, AND 4 should all work independently

---

## Phase 7: User Story 6 - Data Migration Support (Priority: P2)

**Goal**: Ensure existing drafts continue to work after schema changes

**Independent Test**: Simulate old draft format and verify correct migration to current format

### Tests for User Story 6

- [x] T054 [P] [US6] Create migration unit tests in __tests__/unit/storage/draftMigration.test.ts
- [x] T055 [P] [US6] Create migration path tests (1.0 → 2.0) in __tests__/unit/storage/draftMigration.test.ts

### Implementation for User Story 6

- [x] T056 [US6] Implement migrate_1_0_to_2_0 function in lib/storage/draftMigration.ts (depends on T020, T021)
- [x] T057 [US6] Add migration on load in loadDraft function in lib/storage/draftStorage.ts (depends on T056, T013)
- [x] T058 [US6] Handle migration errors and preserve original data in lib/storage/draftMigration.ts (depends on T056)

**Checkpoint**: At this point, User Stories 1, 2, 3, 4, AND 6 should all work independently

---

## Phase 8: User Story 5 - Draft Management Interface (Priority: P3)

**Goal**: Provide UI for viewing, managing, and restoring local drafts

**Independent Test**: Access draft management UI and perform view, restore, delete operations

### Tests for User Story 5

- [x] T059 [P] [US5] Create useDraftManagement unit tests in __tests__/unit/hooks/useDraftManagement.test.ts
- [x] T060 [P] [US5] Create draft list component test in __tests__/integration/draft-management/draft-list.test.tsx
- [x] T061 [P] [US5] Create restore/delete operations test in __tests__/integration/draft-management/restore-delete.test.tsx

### Implementation for User Story 5

- [x] T062 [P] [US5] Create useDraftManagement hook in hooks/useDraftManagement.ts (depends on T014, T015)
- [x] T063 [US5] Create DraftManagementDialog component in components/teleprompter/editor/DraftManagementDialog.tsx (depends on T062, T024)
- [x] T064 [US5] Add draft list with timestamps and previews in DraftManagementDialog component in components/teleprompter/editor/DraftManagementDialog.tsx (depends on T063)
- [x] T065 [US5] Implement restoreDraft function in hooks/useDraftManagement.ts (depends on T062)
- [x] T066 [US5] Implement deleteDrafts function in hooks/useDraftManagement.ts (depends on T062)
- [x] T067 [US5] Add keyboard navigation (Arrow keys, Enter, Escape) in DraftManagementDialog component in components/teleprompter/editor/DraftManagementDialog.tsx (depends on T063)
- [x] T068 [US5] Add multi-select for bulk delete in DraftManagementDialog component in components/teleprompter/editor/DraftManagementDialog.tsx (depends on T063)
- [x] T069 [US5] Add success toast notifications in DraftManagementDialog component in components/teleprompter/editor/DraftManagementDialog.tsx (depends on T063)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T070 [P] Add accessibility validation tests using jest-axe in __tests__/a11y/
- [x] T071 [P] Run performance profiling to verify <200ms save operations in __tests__/performance/
- [x] T072 Update lib/a11y/ariaLabels.ts with any missing labels from implementation
- [x] T073 Add keyboard shortcut (Ctrl/Cmd+S) for manual save in hooks/useAutoSave.ts
- [x] T074 Verify all toasts meet 5-second visibility requirement (Sonner library)
- [x] T075 Run quickstart.md validation checklist
- [x] T076 Verify color contrast ratios ≥4.5:1 for all new UI components
- [x] T077 Add comprehensive error logging for production debugging

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P1 → P2 → P2 → P2 → P3)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Integrates with US1 but independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Independent of US1/US2
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Independent of US1/US2/US3
- **User Story 6 (P2)**: Can start after Foundational (Phase 2) - Independent of US1/US2/US3/US4
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - Uses storage APIs but independently testable

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD)
- Type definitions before implementations
- Storage functions before hooks
- Hooks before UI components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks (T001-T005) can run in parallel
- All Foundational type definitions (T006-T011) can run in parallel
- All Foundational storage functions (T012-T022) can run in parallel after types
- All tests within a user story marked [P] can run in parallel
- US3, US4, US5, US6 can be worked on in parallel by different team members after US1/US2

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task T025: Create useAutoSave unit test
Task T026: Create draftStorage unit test
Task T027: Create unified save integration test
Task T028: Create conflict detection integration test

# After tests are written and failing, implement in parallel:
Task T029: Implement saveDraftWithConflictDetection function
# Then:
Task T030: Refactor useAutoSave hook
# Then in parallel:
Task T031: Add debounced save
Task T032: Add periodic save
# Then:
Task T033: Add conflict detection logic
Task T034: Add requestIdleCallback
# Finally:
Task T035: Update AutoSaveStatus component
```

---

## Parallel Example: All P2 User Stories (US3, US4, US6)

Once Foundational phase is complete, these can proceed in parallel:

```bash
# Team Member A: User Story 3 (Private Browsing)
Task T041: Create private browsing detection unit test
Task T042: Create private browsing warning component test
Task T043: Create usePrivateBrowsing hook
Task T044: Create PrivateBrowsingWarning component
Task T045: Add "Save to account" CTA
Task T046: Integrate in studio page

# Team Member B: User Story 4 (Storage Quota)
Task T047: Create storage quota unit tests
Task T048: Create quota warning component test
Task T049: Create useStorageQuota hook
Task T050: Create StorageQuotaWarning component
Task T051: Add "Clear Old Drafts" button
Task T052: Display storage usage
Task T053: Integrate with save operations

# Team Member C: User Story 6 (Data Migration)
Task T054: Create migration unit tests
Task T055: Create migration path tests
Task T056: Implement migrate_1_0_to_2_0 function
Task T057: Add migration on load
Task T058: Handle migration errors
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T024) - CRITICAL
3. Complete Phase 3: User Story 1 (T025-T035)
4. **STOP and VALIDATE**: Test atomic saves with no race conditions
5. Deploy/demo if ready

**MVP Scope**: Unified auto-save system that eliminates data loss from race conditions

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 6 → Test independently → Deploy/Demo
7. Add User Story 5 → Test independently → Deploy/Demo
8. Complete Phase 9: Polish → Final release

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With 3+ developers:

1. **Week 1**: Team completes Setup + Foundational together
2. **Week 2-3**: Once Foundational is done:
   - **Developer A**: User Story 1 (P1) + User Story 2 (P1)
   - **Developer B**: User Story 3 (P2) + User Story 4 (P2)
   - **Developer C**: User Story 6 (P2) + User Story 5 (P3)
3. **Week 4**: Polish phase (all developers)

---

## Notes

- **[P]** tasks = different files, no dependencies
- **[Story]** label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Follow TDD: Write tests first, ensure they FAIL, then implement
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- TypeScript strict mode must be maintained throughout
- All components must meet WCAG 2.1 Level AA accessibility standards
- Performance targets: <200ms saves, <500ms status updates, <100ms beforeunload

---

## Task Count Summary

| Category | Count |
|----------|-------|
| Setup (Phase 1) | 5 tasks |
| Foundational (Phase 2) | 19 tasks |
| User Story 1 - Unified Auto-save (P1) | 11 tasks |
| User Story 2 - Protected Page Close (P1) | 4 tasks |
| User Story 3 - Private Browsing Detection (P2) | 6 tasks |
| User Story 4 - Storage Quota Management (P2) | 7 tasks |
| User Story 6 - Data Migration Support (P2) | 5 tasks |
| User Story 5 - Draft Management Interface (P3) | 11 tasks |
| Polish & Cross-Cutting (Phase 9) | 8 tasks |
| **TOTAL** | **76 tasks** |

---

## Parallel Opportunities Summary

- **Setup Phase**: 5 tasks can run in parallel (T001-T005)
- **Foundational Types**: 6 tasks can run in parallel (T006-T011)
- **Foundational Storage**: 11 tasks can run in parallel (T012-T022)
- **User Story 1 Tests**: 4 tasks can run in parallel (T025-T028)
- **User Story 2 Tests**: 2 tasks can run in parallel (T036-T037)
- **User Story 3 Tests**: 2 tasks can run in parallel (T041-T042)
- **User Story 4 Tests**: 2 tasks can run in parallel (T047-T048)
- **User Story 6 Tests**: 2 tasks can run in parallel (T054-T055)
- **User Story 5 Tests**: 3 tasks can run in parallel (T059-T061)
- **Polish Phase**: 2 tasks can run in parallel (T070-T071)

---

## Format Validation

**✓ ALL tasks follow the checklist format:**
- ✓ Start with `- [ ]` (checkbox)
- ✓ Sequential Task ID (T001-T077)
- ✓ [P] marker only for parallelizable tasks
- ✓ [Story] label for user story phase tasks (US1, US2, US3, US4, US5, US6)
- ✓ Clear description with exact file path
- ✓ No tasks missing required elements

---

## Independent Test Criteria Summary

| User Story | Independent Test Criteria |
|------------|---------------------------|
| **US1 - Unified Auto-save** | Edit content and verify all 11 properties saved atomically |
| **US2 - Protected Page Close** | Make changes, close tab, reopen to verify all changes preserved |
| **US3 - Private Browsing** | Open in private mode and verify warning banner appears |
| **US4 - Storage Quota** | Fill storage to capacity and verify cleanup tools work |
| **US6 - Data Migration** | Simulate old draft format and verify correct migration |
| **US5 - Draft Management** | Access UI and perform view, restore, delete operations |

---

## Suggested MVP Scope

**MVP = User Story 1 Only** (Tasks T001-T035: 35 tasks)

**Deliverable**: Unified auto-save system that:
- Consolidates dual save mechanisms into single atomic operation
- Saves all 11 teleprompter properties consistently
- Eliminates race conditions and data loss
- Provides clear save status feedback
- Includes comprehensive tests

**Timeline Estimate** (1 developer):
- Phase 1 (Setup): 1 day
- Phase 2 (Foundational): 3-4 days
- Phase 3 (User Story 1): 2-3 days
- Total MVP: ~1 week

**Post-MVP Roadmap**:
- Week 2: User Story 2 (Protected Page Close)
- Week 3: User Stories 3 & 4 (Private Browsing + Storage Quota)
- Week 4: User Story 6 (Data Migration) + Polish
- Week 5: User Story 5 (Draft Management UI)
