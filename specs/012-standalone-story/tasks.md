# Tasks: Standalone Story with Teleprompter

**Feature**: 012-standalone-story
**Input**: Design documents from `/specs/012-standalone-story/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md
**Tests**: Included - Jest 29+, React Testing Library 13+, Playwright E2E

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a Next.js 14+ web application structure:
- `app/story/[storyId]/` - Next.js App Router pages
- `components/story/` - React components
- `lib/story/` - Types, utilities, hooks
- `__tests__/` - Test files

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create directory structure for story feature (app/story, components/story, lib/story, __tests__/story)
- [x] T002 Install required dependencies (js-base64, pako, ajv, @types/nosleep.js)
- [x] T003 [P] Create TypeScript type definitions in lib/story/types.ts
- [x] T004 [P] Add NoSleep.js TypeScript declarations in types/nosleep.d.ts
- [x] T005 [P] Configure StoryScript JSON schema in specs/012-standalone-story/contracts/story-schema.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Create Zustand story store in lib/stores/useStoryStore.ts (navigation state)
- [ ] T007 [P] Create Zustand teleprompter store in lib/stores/useTeleprompterStore.ts (scroll state)
- [ ] T008 [P] Implement JSON schema validation in lib/story/validation.ts using ajv
- [ ] T009 [P] Implement URL encoding/decoding in lib/story/utils/urlUtils.ts (js-base64 + pako)
- [ ] T010 [P] Create story data loading utility in lib/story/utils/storyLoader.ts
- [ ] T011 [P] Create safe area detection hook in lib/story/hooks/useSafeArea.ts
- [ ] T012 [P] Create viewport height fix hook in lib/story/hooks/useVHFix.ts
- [ ] T013 Create error screen component in components/story/ErrorScreen.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Mobile Story Viewer (Priority: P1) 🎯 MVP

**Goal**: Display story content in 9:16 aspect ratio with tap navigation, progress bars, and slide transitions

**Independent Test**: Create a story with 3-5 slides (text-highlight, image, widget types) and verify users can view, navigate, and see progress indicators

**Functional Requirements Coverage**: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010

### Tests for User Story 1

- [ ] T014 [P] [US1] Write navigation logic unit tests in __tests__/unit/story/hooks/useStoryNavigation.test.ts
- [ ] T015 [P] [US1] Write validation unit tests in __tests__/unit/story/validation.test.ts
- [ ] T016 [P] [US1] Write URL encoding/decoding tests in __tests__/unit/story/utils/urlUtils.test.ts
- [ ] T017 [P] [US1] Write slide transition integration tests in __tests__/integration/story/slide-transitions.test.tsx
- [ ] T018 [P] [US1] Write E2E mobile gesture tests in __tests__/e2e/story/mobile-gestures.spec.ts

### Implementation for User Story 1

- [ ] T019 [P] [US1] Create StoryViewer component in components/story/StoryViewer.tsx
- [ ] T020 [P] [US1] Create StoryProgressBar component in components/story/StoryProgressBar.tsx
- [ ] T021 [P] [US1] Create SlideContainer component in components/story/SlideContainer.tsx
- [ ] T022 [P] [US1] Create TextHighlightSlide component in components/story/SlideTypes/TextHighlightSlide.tsx
- [ ] T023 [P] [US1] Create WidgetChartSlide component in components/story/SlideTypes/WidgetChartSlide.tsx
- [ ] T024 [P] [US1] Create ImageSlide component in components/story/SlideTypes/ImageSlide.tsx
- [ ] T025 [P] [US1] Create PollSlide component in components/story/SlideTypes/PollSlide.tsx
- [ ] T026 [US1] Create story viewer page in app/story/[storyId]/page.tsx (data loading + error handling)
- [ ] T027 [US1] Create story layout in app/story/layout.tsx (minimal, no nav/footer)
- [ ] T028 [US1] Implement useStoryNavigation hook in lib/story/hooks/useStoryNavigation.ts (tap zones)
- [ ] T029 [US1] Add slide preloading logic in lib/story/utils/preload.ts (+1 and +2 ahead)
- [ ] T030 [US1] Implement 9:16 aspect ratio CSS with --vh fix in app/story/[storyId]/page.css
- [ ] T031 [US1] Add slide transition animations with Framer Motion in components/story/SlideContainer.tsx
- [ ] T032 [US1] Implement pause/resume logic for time-based slides in lib/stores/useStoryStore.ts
- [ ] T033 [US1] Add auto-advance logic for non-manual slides in lib/story/hooks/useStoryNavigation.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently
**Success Criteria**: SC-001 (<100ms slide transitions)

---

## Phase 4: User Story 2 - Teleprompter Reading Experience (Priority: P1)

**Goal**: Auto-scrolling teleprompter with focal point indicator, speed controls, and scroll-based progress

**Independent Test**: Load a teleprompter slide with long text and verify auto-scrolling works, speed adjusts in real-time, and progress bar syncs to scroll depth

**Functional Requirements Coverage**: FR-011, FR-012, FR-013, FR-014, FR-015, FR-016, FR-017, FR-018, FR-019, FR-020, FR-021, FR-022, FR-023, FR-024, FR-025, FR-026

### Tests for User Story 2

- [ ] T034 [P] [US2] Write scroll logic unit tests in __tests__/unit/story/hooks/useTeleprompterScroll.test.ts
- [ ] T035 [P] [US2] Write scroll utils tests in __tests__/unit/story/utils/scrollUtils.test.ts
- [ ] T036 [P] [US2] Write progress sync integration tests in __tests__/integration/story/progress-sync.test.tsx
- [ ] T037 [P] [US2] Write teleprompter controls integration tests in __tests__/integration/story/teleprompter-controls.test.tsx
- [ ] T038 [P] [US2] Write scrolling performance E2E tests in __tests__/e2e/story/teleprompter-scrolling.spec.ts

### Implementation for User Story 2

- [ ] T039 [P] [US2] Create TeleprompterSlide component in components/story/SlideTypes/TeleprompterSlide.tsx
- [ ] T040 [P] [US2] Create TeleprompterContent component in components/story/Teleprompter/TeleprompterContent.tsx
- [ ] T041 [P] [US2] Create FocalPointIndicator component in components/story/Teleprompter/FocalPointIndicator.tsx
- [ ] T042 [P] [US2] Create TeleprompterControls component in components/story/Teleprompter/TeleprompterControls.tsx
- [ ] T043 [P] [US2] Create SpeedSlider component in components/story/Teleprompter/SpeedSlider.tsx
- [ ] T044 [P] [US2] Create FontSizeControl component in components/story/Teleprompter/FontSizeControl.tsx
- [ ] T045 [P] [US2] Create PlayPauseButton component in components/story/Teleprompter/PlayPauseButton.tsx
- [ ] T046 [P] [US2] Create SkipToNextButton component in components/story/Teleprompter/SkipToNextButton.tsx
- [ ] T047 [P] [US2] Create MirrorToggle component in components/story/Teleprompter/MirrorToggle.tsx
- [ ] T048 [US2] Implement useTeleprompterScroll hook in lib/story/hooks/useTeleprompterScroll.ts (RAF-based scrolling)
- [ ] T049 [US2] Implement scroll depth calculation in lib/story/utils/scrollUtils.ts
- [ ] T050 [US2] Implement progress bar synchronization to scroll depth in lib/story/utils/progressUtils.ts
- [ ] T051 [US2] Add top/bottom gradient overlays (35vh each) in components/story/Teleprompter/TeleprompterContent.tsx
- [ ] T052 [US2] Implement font size change with scroll position preservation in lib/story/hooks/useTeleprompterScroll.ts
- [ ] T053 [US2] Implement mirror mode (scaleX(-1)) in components/story/Teleprompter/TeleprompterContent.tsx
- [ ] T054 [US2] Add auto-hide control panel (3 second inactivity) in components/story/Teleprompter/TeleprompterControls.tsx
- [ ] T055 [US2] Implement smooth deceleration on pause in lib/story/hooks/useTeleprompterScroll.ts
- [ ] T056 [US2] Detect end of content and trigger slide completion in lib/story/hooks/useTeleprompterScroll.ts
- [ ] T057 [US2] Disable tap-to-next navigation for teleprompter slides in lib/story/hooks/useStoryNavigation.ts

**Checkpoint**: At this point, User Story 2 should be fully functional and testable independently
**Success Criteria**: SC-002 (30fps+ scrolling), SC-006 (<5% font change deviation), SC-007 (<2% progress error), SC-014 (<100ms control panel)

---

## Phase 5: User Story 3 - Screen Wake Lock Management (Priority: P1)

**Goal**: Prevent screen sleep during teleprompter use with Wake Lock API + NoSleep.js fallback

**Independent Test**: Open teleprompter slide, enable auto-scroll, verify screen stays awake for 2+ minutes without interaction (Chrome and Safari)

**Functional Requirements Coverage**: FR-027, FR-028, FR-029, FR-030, FR-054

### Tests for User Story 3

- [ ] T058 [P] [US3] Write wake lock unit tests in __tests__/unit/story/hooks/useWakeLock.test.ts (mocked Wake Lock + NoSleep.js)
- [ ] T059 [P] [US3] Write visibility handling integration tests in __tests__/integration/story/wake-lock-visibility.test.tsx
- [ ] T060 [P] [US3] Write screen wake E2E tests in __tests__/e2e/story/wake-lock.spec.ts

### Implementation for User Story 3

- [ ] T061 [P] [US3] Implement useWakeLock hook in lib/story/hooks/useWakeLock.ts (Wake Lock API + NoSleep.js)
- [ ] T062 [US3] Add NoSleep.js CDN loading with error handling in lib/story/hooks/useWakeLock.ts
- [ ] T063 [US3] Implement wake lock request on scroll start in lib/story/hooks/useTeleprompterScroll.ts
- [ ] T064 [US3] Implement wake lock release on scroll stop in lib/story/hooks/useTeleprompterScroll.ts
- [ ] T065 [US3] Handle tab visibility changes (re-request on return) in lib/story/hooks/useWakeLock.ts
- [ ] T066 [US3] Create wake lock error screen in components/story/ErrorScreen.tsx (wake lock unavailable)
- [ ] T067 [US3] Block teleprompter mode if both Wake Lock and NoSleep.js fail in lib/story/hooks/useTeleprompterScroll.ts
- [ ] T068 [US3] Add graceful degradation for low battery mode in lib/story/hooks/useWakeLock.ts

**Checkpoint**: At this point, User Story 3 should be fully functional and testable independently
**Success Criteria**: SC-003 (100% wake lock success on supported browsers)

---

## Phase 6: User Story 4 - Safe Area & Notch Handling (Priority: P2)

**Goal**: Handle notches, Dynamic Island, and home indicators on modern mobile devices

**Independent Test**: View story on iPhone with Dynamic Island, verify all content visible and readable without being cut off

**Functional Requirements Coverage**: FR-031, FR-032, FR-033, FR-034

### Tests for User Story 4

- [ ] T069 [P] [US4] Write safe area calculation tests in __tests__/unit/story/hooks/useSafeArea.test.ts
- [ ] T070 [P] [US4] Write orientation change tests in __tests__/integration/story/orientation-change.test.tsx

### Implementation for User Story 4

- [ ] T071 [P] [US4] Implement env(safe-area-inset-*) CSS variables in app/story/[storyId]/page.css
- [ ] T072 [US4] Adjust focal point from 33vh to 38vh with safe area in components/story/Teleprompter/FocalPointIndicator.tsx
- [ ] T073 [US4] Apply minimum 2rem padding plus safe area insets in components/story/SafeAreaWrapper.tsx
- [ ] T074 [US4] Handle orientation changes with layout recalculation in lib/story/hooks/useOrientationChange.ts
- [ ] T075 [US4] Preserve scroll ratio on orientation change in lib/story/hooks/useTeleprompterScroll.ts
- [ ] T076 [US4] Create SafeAreaWrapper component in components/story/SafeAreaWrapper.tsx
- [ ] T077 [US4] Apply safe area to all slide types in components/story/SlideContainer.tsx

**Checkpoint**: At this point, User Story 4 should be fully functional and testable independently
**Success Criteria**: SC-005 (100% content visibility on modern mobile devices)

---

## Phase 7: User Story 5 - Gesture Conflict Prevention (Priority: P2)

**Goal**: Prevent accidental slide advancement during teleprompter reading

**Independent Test**: Activate teleprompter mode, tap various screen areas, verify taps don't advance slides, only SkipToNext button advances

**Functional Requirements Coverage**: FR-022, FR-023, FR-024

### Tests for User Story 5

- [ ] T078 [P] [US5] Write gesture conflict prevention tests in __tests__/integration/story/gesture-conflict.test.tsx
- [ ] T079 [P] [US5] Write E2E tap behavior tests in __tests__/e2e/story/tap-behavior.spec.ts

### Implementation for User Story 5

- [ ] T080 [US5] Ensure tap zones disabled for teleprompter slides in lib/story/hooks/useStoryNavigation.ts
- [ ] T081 [US5] Implement tap shows control panel (not slide change) in components/story/Teleprompter/TeleprompterSlide.tsx
- [ ] T082 [US5] Implement SkipToNext button functionality in lib/story/hooks/useStoryNavigation.ts
- [ ] T083 [US5] Ensure tap zones work for non-teleprompter slides in lib/story/hooks/useStoryNavigation.ts

**Checkpoint**: At this point, User Story 5 should be fully functional and testable independently
**Success Criteria**: SC-004 (95% completion without accidental advancement)

---

## Phase 8: User Story 6 - Performance & Battery Optimization (Priority: P3)

**Goal**: Maintain smooth 30fps scrolling for long-form content with minimal battery drain

**Independent Test**: Load 10,000-word teleprompter slide, enable auto-scroll for 30 minutes, monitor FPS (stays above 25fps), battery usage, device temperature

**Functional Requirements Coverage**: FR-035, FR-036, FR-037, FR-038, FR-039, FR-040

### Tests for User Story 6

- [ ] T084 [P] [US6] Write virtual scrolling tests in __tests__/unit/story/utils/virtualScroller.test.ts
- [ ] T085 [P] [US6] Write performance benchmarks in __tests__/performance/story/scrolling-performance.test.ts

### Implementation for User Story 6

- [ ] T086 [P] [US6] Implement virtual scrolling for 50+ paragraphs in lib/story/utils/virtualScroller.ts
- [ ] T087 [US6] Add scroll progress throttling (100ms max) in lib/story/utils/progressUtils.ts
- [ ] T088 [US6] Apply GPU acceleration (transform: translateZ(0)) in components/story/Teleprompter/TeleprompterContent.tsx
- [ ] T089 [US6] Disable text selection during scrolling in components/story/Teleprompter/TeleprompterContent.tsx
- [ ] T090 [US6] Use React.memo for heavy components in components/story/SlideTypes/WidgetChartSlide.tsx
- [ ] T091 [US6] Monitor FPS during scrolling in lib/story/hooks/useTeleprompterScroll.ts (dev mode only)
- [ ] T092 [US6] Optimize re-render performance in components/story/StoryViewer.tsx

**Checkpoint**: At this point, User Story 6 should be fully functional and testable independently
**Success Criteria**: SC-002 (30fps+ scrolling), SC-009 (90% DOM reduction with virtual scrolling), SC-010 (<20% battery drain vs video)

---

## Phase 9: User Story 7 - Auto-Save & Recovery (Priority: P3)

**Goal**: Save reading progress to localStorage every 2 seconds and offer restore on reopen

**Independent Test**: Read teleprompter to 50% completion, force-close browser, reopen to story, verify reading position restored to 50%

**Functional Requirements Coverage**: FR-041, FR-042, FR-043, FR-044

### Tests for User Story 7

- [ ] T093 [P] [US7] Write persistence unit tests in __tests__/unit/story/hooks/useProgressPersistence.test.ts
- [ ] T094 [P] [US7] Write save/restore integration tests in __tests__/integration/story/progress-recovery.test.tsx
- [ ] T095 [P] [US7] Write browser crash recovery E2E tests in __tests__/e2e/story/progress-recovery.spec.ts

### Implementation for User Story 7

- [ ] T096 [P] [US7] Implement useProgressPersistence hook in lib/story/hooks/useProgressPersistence.ts
- [ ] T097 [US7] Implement localStorage save every 2 seconds in lib/story/hooks/useProgressPersistence.ts
- [ ] T098 [US7] Store slide ID and scroll ratio (0-1) in saved progress in lib/story/hooks/useProgressPersistence.ts
- [ ] T099 [US7] Add timestamp to saved progress in lib/story/hooks/useProgressPersistence.ts
- [ ] T100 [US7] Offer restore dialog on reopen in components/story/Teleprompter/TeleprompterSlide.tsx
- [ ] T101 [US7] Handle localStorage quota exceeded errors gracefully in lib/story/hooks/useProgressPersistence.ts
- [ ] T102 [US7] Continue without saving on quota error in lib/story/hooks/useProgressPersistence.ts

**Checkpoint**: At this point, User Story 7 should be fully functional and testable independently
**Success Criteria**: SC-008 (90% successful restore after closure)

---

## Phase 10: User Story 8 - Keyboard Shortcuts & Accessibility (Priority: P3)

**Goal**: Desktop keyboard control and screen reader support for accessibility

**Independent Test**: Open story on desktop, press keyboard shortcuts (Space, Arrow keys, 'r'), verify expected behaviors. Test with screen reader to ensure proper announcements

**Functional Requirements Coverage**: FR-045, FR-046, FR-047, FR-048, FR-049

### Tests for User Story 8

- [ ] T103 [P] [US8] Write keyboard shortcuts unit tests in __tests__/unit/story/hooks/useKeyboardShortcuts.test.ts
- [ ] T104 [P] [US8] Write accessibility integration tests in __tests__/a11y/story/keyboard-navigation.test.tsx
- [ ] T105 [P] [US8] Write screen reader tests in __tests__/a11y/story/screen-reader.test.tsx

### Implementation for User Story 8

- [ ] T106 [P] [US8] Implement useKeyboardShortcuts hook in lib/story/hooks/useKeyboardShortcuts.ts
- [ ] T107 [US8] Implement Space (play/pause), ArrowUp (speed+), ArrowDown (speed-), 'r' (reset) in lib/story/hooks/useKeyboardShortcuts.ts
- [ ] T108 [US8] Add ARIA labels to all interactive elements in components/story/Teleprompter/TeleprompterControls.tsx
- [ ] T109 [US8] Set role="region" and aria-live="polite" on teleprompter content in components/story/Teleprompter/TeleprompterContent.tsx
- [ ] T110 [US8] Implement high contrast mode (white on black) in components/story/Teleprompter/TeleprompterContent.tsx
- [ ] T111 [US8] Display WPM calculation (speed × 150) in components/story/Teleprompter/TeleprompterControls.tsx
- [ ] T112 [US8] Add screen reader announcements in lib/story/hooks/useTeleprompterScroll.ts

**Checkpoint**: At this point, User Story 8 should be fully functional and testable independently
**Success Criteria**: SC-011 (100% keyboard shortcut functionality), SC-012 (100% screen reader coverage)

---

## Phase 11: Edge Cases & Error Handling (Cross-Cutting)

**Purpose**: Robustness and user experience for all edge cases

**Functional Requirements Coverage**: FR-050, FR-051, FR-052, FR-053, FR-055

- [ ] T113 Detect content height < viewport and disable auto-scrolling in lib/story/hooks/useTeleprompterScroll.ts
- [ ] T114 Pause auto-scrolling when user manually scrolls in lib/story/hooks/useTeleprompterScroll.ts
- [ ] T115 Show toast "Auto-scroll paused - tap to resume" in components/story/Teleprompter/TeleprompterSlide.tsx
- [ ] T116 Recalculate scroll height after font size changes in lib/story/hooks/useTeleprompterScroll.ts
- [ ] T117 Pause auto-scrolling when browser tab inactive (visibilitychange API) in lib/story/hooks/useTeleprompterScroll.ts
- [ ] T118 Handle NoSleep.js CDN loading failures in lib/story/hooks/useWakeLock.ts
- [ ] T119 Validate JSON and block on invalid data in app/story/[storyId]/page.tsx
- [ ] T120 Write E2E tests for all 10 edge cases in __tests__/e2e/story/edge-cases.spec.ts

**Checkpoint**: All edge cases handled gracefully
**Success Criteria**: SC-013 (<500ms resume after tab switch)

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements that affect multiple user stories

- [ ] T121 [P] Copy NoSleep.js library to public/libs/nosleep.js
- [ ] T122 [P] Add story JSON format documentation to docs/standalone-story/
- [ ] T123 [P] Document URL generation process in docs/standalone-story/url-generation.md
- [ ] T124 [P] Create troubleshooting guide for wake lock issues in docs/standalone-story/troubleshooting.md
- [ ] T125 [P] Update project README with story viewer feature in README.md
- [ ] T126 Code cleanup and refactoring across all story components
- [ ] T127 Run quickstart.md validation procedures
- [ ] T128 Verify all 55 functional requirements implemented
- [ ] T129 Verify all 15 success criteria met
- [ ] T130 Final browser compatibility testing (Chrome, Safari, Firefox, Edge)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-10)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Edge Cases (Phase 11)**: Depends on US2 (Teleprompter) and US3 (Wake Lock) being complete
- **Polish (Phase 12)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Integrates with US2 but independently testable
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 5 (P2)**: Can start after US2 (Teleprompter) complete - Extends US2 behavior
- **User Story 6 (P3)**: Can start after US2 (Teleprompter) complete - Optimizes US2
- **User Story 7 (P3)**: Can start after US2 (Teleprompter) complete - Extends US2
- **User Story 8 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Critical Path (MVP - User Stories 1, 2, 3)

```
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1) + Phase 4 (US2) + Phase 5 (US3)
                                                      ↓
                                                MVP Ready!
```

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD approach)
- Type definitions before components
- Hooks before components that use them
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

#### Phase 2 (Foundational) - After Phase 1 Complete
```bash
# Can run in parallel:
T003: Create TypeScript type definitions
T004: Add NoSleep.js TypeScript declarations
T005: Configure StoryScript JSON schema

T006: Create Zustand story store
T007: Create Zustand teleprompter store
T008: Implement JSON schema validation
T009: Implement URL encoding/decoding
T010: Create story data loading utility
T011: Create safe area detection hook
T012: Create viewport height fix hook
```

#### Phase 3 (User Story 1) - After Phase 2 Complete
```bash
# Tests can run in parallel:
T014: Write navigation logic unit tests
T015: Write validation unit tests
T016: Write URL encoding/decoding tests
T017: Write slide transition integration tests
T018: Write E2E mobile gesture tests

# Components can run in parallel:
T019: Create StoryViewer component
T020: Create StoryProgressBar component
T021: Create SlideContainer component
T022: Create TextHighlightSlide component
T023: Create WidgetChartSlide component
T024: Create ImageSlide component
T025: Create PollSlide component
```

#### Phase 4 (User Story 2) - After Phase 2 Complete
```bash
# Tests can run in parallel:
T034: Write scroll logic unit tests
T035: Write scroll utils tests
T036: Write progress sync integration tests
T037: Write teleprompter controls integration tests
T038: Write scrolling performance E2E tests

# Components can run in parallel:
T039: Create TeleprompterSlide component
T040: Create TeleprompterContent component
T041: Create FocalPointIndicator component
T042: Create TeleprompterControls component
T043: Create SpeedSlider component
T044: Create FontSizeControl component
T045: Create PlayPauseButton component
T046: Create SkipToNextButton component
T047: Create MirrorToggle component
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 3 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T013) - CRITICAL
3. Complete Phase 3: User Story 1 (T014-T033)
4. Complete Phase 4: User Story 2 (T034-T057)
5. Complete Phase 5: User Story 3 (T058-T068)
6. **STOP and VALIDATE**: Test all 3 P1 stories independently
7. Deploy/demo MVP (mobile story viewer + teleprompter + wake lock)

### Incremental Delivery (All User Stories)

1. Complete Setup + Foundational → Foundation ready
2. Add US1 (Mobile Story Viewer) → Test independently → Deploy/Demo (MVP foundation)
3. Add US2 (Teleprompter) → Test independently → Deploy/Demo (MVP!)
4. Add US3 (Wake Lock) → Test independently → Deploy/Demo (Complete MVP)
5. Add US4 (Safe Area) → Test independently → Deploy/Demo (P1+P2)
6. Add US5 (Gesture Conflict) → Test independently → Deploy/Demo
7. Add US6 (Performance) → Test independently → Deploy/Demo
8. Add US7 (Auto-Save) → Test independently → Deploy/Demo
9. Add US8 (Accessibility) → Test independently → Deploy/Demo
10. Add Edge Cases + Polish → Final release
11. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers after Foundational phase:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - **Developer A**: User Story 1 (T014-T033)
   - **Developer B**: User Story 2 (T034-T057)
   - **Developer C**: User Story 3 (T058-T068)
3. Stories complete and integrate independently
4. P2 stories can start in parallel after P1 stories complete
5. P3 stories can start in parallel after P2 stories complete

---

## Task Summary

**Total Tasks**: 130 tasks
- **Setup**: 5 tasks (T001-T005)
- **Foundational**: 8 tasks (T006-T013)
- **User Story 1 (P1)**: 20 tasks (T014-T033) - 5 tests + 15 implementation
- **User Story 2 (P1)**: 24 tasks (T034-T057) - 5 tests + 19 implementation
- **User Story 3 (P1)**: 11 tasks (T058-T068) - 3 tests + 8 implementation
- **User Story 4 (P2)**: 9 tasks (T069-T077) - 2 tests + 7 implementation
- **User Story 5 (P2)**: 6 tasks (T078-T083) - 2 tests + 4 implementation
- **User Story 6 (P3)**: 9 tasks (T084-T092) - 2 tests + 7 implementation
- **User Story 7 (P3)**: 10 tasks (T093-T102) - 3 tests + 7 implementation
- **User Story 8 (P3)**: 10 tasks (T103-T112) - 3 tests + 7 implementation
- **Edge Cases**: 8 tasks (T113-T120)
- **Polish**: 10 tasks (T121-T130)

**Test Distribution**:
- **Unit Tests**: 17 test files (T014-T016, T034-T035, T058, T069, T084, T093-T094, T103-T105)
- **Integration Tests**: 11 test files (T017, T036-T037, T059, T070, T078, T094, T104-T105)
- **E2E Tests**: 8 test files (T018, T038, T060, T079, T095, T120)
- **Performance Tests**: 1 test file (T085)
- **Total Tests**: 37 test files

**Priority Distribution**:
- **P1 (Critical)**: 55 tasks (US1, US2, US3) - MVP scope
- **P2 (Important)**: 15 tasks (US4, US5)
- **P3 (Nice-to-have)**: 29 tasks (US6, US7, US8)
- **Infrastructure**: 31 tasks (Setup, Foundational, Edge Cases, Polish)

**Functional Requirements Coverage**:
- ✅ FR-001 to FR-055: All 55 functional requirements covered
- ✅ SC-001 to SC-015: All 15 success criteria mapped to tasks

**Key Dependencies**:
- Phase 2 (Foundational) blocks all user stories
- US5 depends on US2 (Teleprompter)
- US6 depends on US2 (Teleprompter)
- US7 depends on US2 (Teleprompter)
- Phase 11 (Edge Cases) depends on US2 and US3
- Phase 12 (Polish) depends on all user stories

**Parallel Execution Opportunities**:
- 40 tasks marked [P] can run in parallel within their phases
- After Phase 2, all P1 user stories can proceed in parallel
- After P1 complete, all P2 stories can proceed in parallel
- After P2 complete, all P3 stories can proceed in parallel

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests written first (TDD approach), should fail before implementation
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All tasks follow checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
- MVP = User Stories 1, 2, 3 (Phases 3, 4, 5) - 55 tasks total
- Full feature = All 8 user stories + edge cases + polish - 130 tasks total
