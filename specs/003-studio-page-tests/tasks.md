# Implementation Tasks: Studio Page Core Module Testing

**Feature**: Studio Page Core Module Testing  
**Branch**: `003-studio-page-tests`  
**Date**: 2025-12-31  
**Status**: Ready for Implementation

## Overview

This document provides actionable, dependency-ordered tasks for implementing a comprehensive test suite for the Studio page ([`app/studio/page.tsx`](../../app/studio/page.tsx)). The test suite will achieve 100% code coverage across all code paths including edge cases and error scenarios.

**Total Tasks**: 45  
**Estimated Duration**: 6-8 hours  
**Team Size**: 1 developer

---

## Implementation Strategy

### MVP Scope (Phase 1-3)
**Minimum Viable Product**: User Story 1 (Initial Page Load) + Test Infrastructure
- Enables verification of core initialization behavior
- Establishes testing patterns for remaining stories
- Can be independently tested and validated

### Incremental Delivery
Each user story phase is independently testable and can be completed in any order (after foundational phase). Stories are prioritized as P1 (critical) and P2 (enhancement).

---

## Phase 1: Setup & Test Infrastructure

**Goal**: Establish project structure, configure Jest environment, and create base test utilities

**Independent Test Criteria**:
- Jest can run without errors
- Test utilities are exported and usable
- Mock setup functions work correctly

### Tasks

- [X] T001 Create test directory structure at `__tests__/integration/studio/` and `__tests__/mocks/` and `__tests__/utils/`
- [X] T002 [P] Configure Jest coverage thresholds for 100% in `jest.config.js`
- [X] T003 [P] Create TypeScript type definitions for test mocks in `__tests__/types/test-mocks.ts`
- [X] T004 Create shared test setup utilities in `__tests__/utils/test-helpers.tsx`
- [X] T005 Create render wrapper with mock providers in `__tests__/utils/test-renderers.tsx`

---

## Phase 2: Foundational Mocks & Utilities

**Goal**: Create all mock configurations, store mocks, and helper utilities needed across all test files

**Dependencies**: Must complete Phase 1 first  
**Independent Test Criteria**:
- All mocks compile without TypeScript errors
- Mock helper functions are testable in isolation
- localStorage simulation works correctly

### Tasks

- [X] T006 [P] Create Teleprompter store mock factory in `__tests__/mocks/stores/teleprompter-store.mock.ts`
- [X] T007 [P] Create Config store mock factory in `__tests__/mocks/stores/config-store.mock.ts`
- [X] T008 [P] Create Demo store mock factory in `__tests__/mocks/stores/demo-store.mock.ts`
- [X] T009 [P] Create React hook mocks for useTeleprompterStore in `__tests__/mocks/hooks/use-teleprompter-store.mock.ts`
- [X] T010 [P] Create React hook mocks for useConfigStore in `__tests__/mocks/hooks/use-config-store.mock.ts`
- [X] T011 [P] Create React hook mocks for useDemoStore in `__tests__/mocks/hooks/use-demo-store.mock.ts`
- [X] T012 [P] Create next/navigation useSearchParams mock in `__tests__/mocks/next-navigation.mock.ts`
- [X] T013 [P] Create sonner toast mock with assertion helpers in `__tests__/mocks/toast.mock.ts`
- [X] T014 [P] Create localStorage mock with error simulation in `__tests__/mocks/local-storage.mock.ts`
- [X] T015 [P] Create Framer Motion AnimatePresence mock in `__tests__/mocks/framer-motion.mock.tsx`
- [X] T016 [P] Create loadScriptAction mock in `__tests__/mocks/actions/load-script-action.mock.ts`
- [X] T017 [P] Create getTemplateById mock in `__tests__/mocks/actions/get-template-by-id.mock.ts`
- [X] T018 Create centralized mock setup function in `__tests__/utils/studio-page-mocks.ts`

---

## Phase 3: User Story 1 - Initial Page Load (P1)

**Goal**: Test initialization behavior, demo mode handling, and default editor display

**User Story**: A user opens the Studio page without parameters → system initializes cleanly → editor appears with demo mode disabled

**Dependencies**: Phase 2 must be complete  
**Independent Test Criteria**:
- All initialization tests pass
- Demo mode is disabled exactly once
- Editor component is displayed by default
- No infinite initialization loops occur

### Tasks

- [ ] T019 [US1] Create test file `__tests__/integration/studio/initialization.test.tsx` with describe blocks
- [ ] T020 [US1] Write test: "should display Editor component when no URL parameters present"
- [ ] T021 [US1] Write test: "should disable demo mode on initial mount"
- [ ] T022 [US1] Write test: "should initialize exactly once (no duplicate initialization)"
- [ ] T023 [US1] Write test: "should show Suspense fallback during initial load"
- [ ] T024 [US1] Write test: "should render AppProvider and Toaster components"

---

## Phase 4: User Story 2 - Template Loading (P2)

**Goal**: Test template loading via ?template= parameter with settings application and toast notifications

**User Story**: User accesses Studio with ?template=id → system loads template content and settings → displays in editor with success toast

**Dependencies**: Phase 2 must be complete  
**Independent Test Criteria**:
- Valid template loads correctly with all settings applied
- Invalid template falls through to default initialization
- Success toast appears with template name
- Mode is set to 'setup' after template load

### Tasks

- [ ] T025 [US2] Create test file `__tests__/integration/studio/template-loading.test.tsx` with describe blocks
- [X] T026 [P] [US2] Create template fixture data in `__tests__/fixtures/templates.ts`
- [ ] T027 [US2] Write test: "should load template content when ?template parameter present"
- [ ] T028 [US2] Write test: "should apply all template settings to teleprompter store"
- [ ] T029 [US2] Write test: "should show success toast with template name after loading"
- [ ] T030 [US2] Write test: "should set mode to setup after template load"
- [ ] T031 [US2] Write test: "should fall through to default initialization when template not found"
- [ ] T032 [US2] Write test: "should handle template with missing optional settings"

---

## Phase 5: User Story 3 - Saved Script Restoration (P1)

**Goal**: Test script loading via ?script= parameter with both modern config and legacy settings formats

**User Story**: User accesses Studio with ?script=id → system loads script content and configuration → displays with appropriate toast

**Dependencies**: Phase 2 must be complete  
**Independent Test Criteria**:
- Script with modern config loads correctly via config store
- Script with legacy settings loads correctly via teleprompter store
- Success toast indicates config vs legacy loading
- Invalid script shows error toast and logs to console
- Script without config/settings loads with basic content

### Tasks

- [ ] T033 [US3] Create test file `__tests__/integration/studio/script-loading.test.tsx` with describe blocks
- [X] T034 [P] [US3] Create script fixture data in `__tests__/fixtures/scripts.ts`
- [ ] T035 [US3] Write test: "should load script with modern config format"
- [ ] T036 [US3] Write test: "should apply script config to config store"
- [ ] T037 [US3] Write test: "should show success toast for script with config"
- [ ] T038 [US3] Write test: "should load script with legacy settings format"
- [ ] T039 [US3] Write test: "should apply legacy settings to teleprompter store"
- [ ] T040 [US3] Write test: "should show success toast for script with legacy settings"
- [ ] T041 [US3] Write test: "should show error toast when script not found"
- [ ] T042 [US3] Write test: "should log script loading errors to console"

---

## Phase 6: User Story 4 - Local Draft & Auto-Save (P1)

**Goal**: Test localStorage draft restoration, auto-save timing, and error handling

**User Story**: User works in editor → system auto-saves every 5 seconds → draft restores on return

**Dependencies**: Phase 2 must be complete  
**Independent Test Criteria**:
- Auto-save triggers every 5 seconds in setup mode
- Auto-save persists all required properties to localStorage
- Auto-save does not run in run mode or read-only mode
- Draft restores correctly on page reload
- Corrupted draft data is handled gracefully

### Tasks

- [ ] T043 [US4] Create test file `__tests__/integration/studio/local-draft.test.tsx` with describe blocks
- [X] T044 [P] [US4] Create draft fixture data in `__tests__/fixtures/drafts.ts`
- [ ] T045 [US4] Write test: "should auto-save to localStorage after 5 seconds in setup mode"
- [ ] T046 [US4] Write test: "should persist all required properties to localStorage"
- [ ] T047 [US4] Write test: "should not auto-save when in run mode"
- [ ] T048 [US4] Write test: "should not auto-save when in read-only mode"
- [ ] T049 [US4] Write test: "should restore draft from localStorage on page load"
- [ ] T050 [US4] Write test: "should handle corrupted localStorage data gracefully"
- [ ] T051 [US4] Write test: "should handle localStorage quota exceeded error"

---

## Phase 7: User Story 5 - Mode Switching (P1)

**Goal**: Test Editor/Runner component rendering and AnimatePresence transitions

**User Story**: User switches between setup and run modes → system displays correct component with smooth transition

**Dependencies**: Phase 2 must be complete  
**Independent Test Criteria**:
- Editor component displays in setup mode
- Runner component displays in run mode
- AnimatePresence handles transitions correctly
- Mode switches trigger appropriate animations

### Tasks

- [ ] T052 [US5] Create test file `__tests__/integration/studio/mode-switching.test.tsx` with describe blocks
- [ ] T053 [US5] Write test: "should display Editor component when mode is setup"
- [ ] T054 [US5] Write test: "should display Runner component when mode is run"
- [ ] T055 [US5] Write test: "should handle AnimatePresence transition from setup to run"
- [ ] T056 [US5] Write test: "should handle AnimatePresence transition from run to setup"
- [ ] T057 [US5] Write test: "should use mode='wait' for AnimatePresence"

---

## Phase 8: User Story 6 - Template Parameter Priority (P2)

**Goal**: Test that template parameter takes precedence over script parameter when both are present

**User Story**: User navigates with both ?template= and ?script= → system loads template only

**Dependencies**: Phase 2 must be complete  
**Independent Test Criteria**:
- Template loads when both parameters present
- Script loading is skipped when template present
- Success toast indicates template was loaded

### Tasks

- [ ] T058 [US6] Create test file `__tests__/integration/studio/parameter-priority.test.tsx` with describe blocks
- [ ] T059 [US6] Write test: "should prioritize template over script when both parameters present"
- [ ] T060 [US6] Write test: "should not load script when template parameter is present"
- [ ] T061 [US6] Write test: "should show template success toast (not script toast)"

---

## Phase 9: Polish & Validation

**Goal**: Achieve 100% code coverage, run full test suite, validate all success criteria

**Dependencies**: All user story phases must be complete  
**Independent Test Criteria**:
- All tests pass (100% pass rate)
- Coverage report shows 100% for app/studio/page.tsx
- Tests execute in under 10 seconds
- No flaky tests
- Documentation is updated

### Tasks

- [ ] T062 Run full test suite and verify all tests pass
- [ ] T063 Generate coverage report and verify 100% coverage for app/studio/page.tsx
- [ ] T064 Verify tests execute in under 10 seconds
- [ ] T065 Run tests multiple times to ensure no flaky tests
- [ ] T066 Update quickstart.md with any new patterns discovered
- [ ] T067 Add edge case tests for error handling scenarios
- [ ] T068 Add edge case tests for concurrency scenarios
- [ ] T069 Add edge case tests for data integrity scenarios
- [ ] T070 Add edge case tests for browser scenarios
- [ ] T071 Create test execution documentation in README
- [ ] T072 Verify all 20 functional requirements have corresponding tests
- [ ] T073 Verify all 15 success criteria are validated through tests

---

## Dependencies & Execution Order

### Prerequisite Chain

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational Mocks)
    ↓
Phase 3-8 (User Stories) ← Can run in parallel after Phase 2
    ↓
Phase 9 (Polish)
```

### User Story Dependencies

- **No dependencies between user stories** - All can be implemented in parallel after Phase 2
- **Phase 3 (US1)** is recommended first as it establishes basic testing patterns

---

## Parallel Execution Opportunities

### Within Phase 2 (Foundational)
All mock files can be created simultaneously:
- Tasks T006-T017 are all parallelizable (marked with [P])

### Within User Story Phases
- **US2**: T026 (fixtures) can run in parallel with T025 (test file creation)
- **US3**: T034 (fixtures) can run in parallel with T033 (test file creation)
- **US4**: T044 (fixtures) can run in parallel with T043 (test file creation)

### User Story Phases (After Phase 2)
- **Phase 3-8 can all run in parallel** once foundational mocks are complete
- Recommended execution order: US1 → US3 → US4 → US5 → US2 → US6
  - P1 stories first (US1, US3, US4, US5)
  - P2 stories second (US2, US6)

---

## Task Summary by Category

| Category | Task Count | Tasks |
|----------|------------|-------|
| Setup & Infrastructure | 5 | T001-T005 |
| Mocks & Utilities | 13 | T006-T018 |
| US1: Initial Load | 6 | T019-T024 |
| US2: Template Loading | 8 | T025-T032 |
| US3: Script Loading | 10 | T033-T042 |
| US4: Local Draft | 9 | T043-T051 |
| US5: Mode Switching | 6 | T052-T057 |
| US6: Parameter Priority | 4 | T058-T061 |
| Polish & Validation | 12 | T062-T073 |
| **TOTAL** | **73** | |

---

## Success Metrics

### Coverage Targets
- **Branches**: 100%
- **Functions**: 100%
- **Lines**: 100%
- **Statements**: 100%

### Quality Gates
- ✅ All tests pass
- ✅ Zero TypeScript errors
- ✅ Zero ESLint warnings
- ✅ Tests execute in < 10 seconds
- ✅ No flaky tests (10 consecutive runs all pass)

### Functional Validation
- ✅ All 20 functional requirements tested
- ✅ All 15 success criteria validated
- ✅ All 6 user stories covered
- ✅ All 15 edge cases addressed

---

## File Creation Checklist

### Test Files (7 files)
- [ ] `__tests__/integration/studio/initialization.test.tsx`
- [ ] `__tests__/integration/studio/template-loading.test.tsx`
- [ ] `__tests__/integration/studio/script-loading.test.tsx`
- [ ] `__tests__/integration/studio/local-draft.test.tsx`
- [ ] `__tests__/integration/studio/mode-switching.test.tsx`
- [ ] `__tests__/integration/studio/parameter-priority.test.tsx`
- [ ] `__tests__/unit/app/studio/page.test.tsx` (if needed for unit tests)

### Mock Files (12 files)
- [ ] `__tests__/mocks/stores/teleprompter-store.mock.ts`
- [ ] `__tests__/mocks/stores/config-store.mock.ts`
- [ ] `__tests__/mocks/stores/demo-store.mock.ts`
- [ ] `__tests__/mocks/hooks/use-teleprompter-store.mock.ts`
- [ ] `__tests__/mocks/hooks/use-config-store.mock.ts`
- [ ] `__tests__/mocks/hooks/use-demo-store.mock.ts`
- [ ] `__tests__/mocks/next-navigation.mock.ts`
- [ ] `__tests__/mocks/toast.mock.ts`
- [ ] `__tests__/mocks/local-storage.mock.ts`
- [ ] `__tests__/mocks/framer-motion.mock.ts`
- [ ] `__tests__/mocks/actions/load-script-action.mock.ts`
- [ ] `__tests__/mocks/actions/get-template-by-id.mock.ts`

### Utility Files (3 files)
- [ ] `__tests__/utils/test-helpers.tsx`
- [ ] `__tests__/utils/test-renderers.tsx`
- [ ] `__tests__/utils/studio-page-mocks.ts`

### Fixture Files (3 files)
- [ ] `__tests__/fixtures/templates.ts`
- [ ] `__tests__/fixtures/scripts.ts`
- [ ] `__tests__/fixtures/drafts.ts`

### Type Definition Files (1 file)
- [ ] `__tests__/types/test-mocks.ts`

**Total Files to Create**: 26 files

---

## Implementation Notes

### Testing Best Practices
1. **Isolation**: Each test should be independent - use `beforeEach` and `afterEach` for cleanup
2. **Clarity**: Use descriptive test names following "should..." pattern
3. **User Focus**: Test user behavior, not implementation details
4. **Coverage**: Write tests for all code paths including error cases
5. **Timers**: Always use fake timers for time-dependent tests

### Mock Strategy
1. **Stores**: Mock Zustand stores with factory functions
2. **Async Operations**: Control timing with mock delays
3. **localStorage**: Use jsdom implementation with error injection
4. **URL Parameters**: Mock next/navigation useSearchParams

### Common Patterns
1. **Given-When-Then**: Structure tests with Arrange-Act-Assert
2. **Render Helpers**: Use custom render wrapper with providers
3. **Assertion Helpers**: Create reusable assertion functions
4. **Fixture Factories**: Use factory functions for test data

---

## Next Steps

1. **Start with Phase 1**: Set up test infrastructure (T001-T005)
2. **Complete Phase 2**: Create all mocks and utilities (T006-T018)
3. **Implement User Stories**: Choose any user story phase (T019-T061)
4. **Validate & Polish**: Run full suite and achieve 100% coverage (T062-T073)

**Recommended First Task**: T001 - Create test directory structure

**Quick Start Command**:
```bash
npm test -- studio
```

---

**Document Status**: ✅ Ready for Implementation  
**Last Updated**: 2025-12-31  
**Version**: 1.0
