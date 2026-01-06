# Tasks: Visual Drag-and-Drop Story Builder

**Input**: Design documents from `/specs/013-visual-story-builder/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, design.md ✅, quickstart.md ✅

**Tests**: This feature includes comprehensive testing per the implementation plan.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a Next.js 14+ web application. Paths are relative to repository root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Install @dnd-kit dependencies (@dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities)
- [ ] T002 Install dompurify dependency for XSS protection
- [ ] T003 Create app/story-builder directory structure with subdirectories (components, lib, hooks)
- [ ] T004 [P] Add story builder route to navigation in components/Navigation/Navigation.tsx
- [ ] T005 [P] Create public/templates directory for template thumbnail images

**Checkpoint**: Setup complete - ready for foundational infrastructure

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Types & Core Data Structures

- [ ] T006 Create lib/story-builder/types.ts with BuilderSlide, StoryBuilder, SaveStatus interfaces
- [ ] T007 [P] Create lib/story-builder/types.ts with slide content interfaces (TextContent, ImageContent, TeleprompterContent, PollContent, WidgetContent)
- [ ] T008 [P] Create lib/story-builder/types.ts with template and action types

### Zustand Store

- [ ] T009 Create lib/story-builder/store.ts with Zustand store structure (state, actions, selectors)
- [ ] T010 Implement store slide management actions (addSlide, removeSlide, reorderSlides, updateSlide, setActiveSlide)
- [ ] T011 Implement store story operations (generateUrl, loadTemplate, clearStory)
- [ ] T012 Implement store auto-save actions (autoSave, restoreDraft, handleStorageEvent)

### Utility Functions

- [ ] T013 [P] Create lib/story-builder/utils/dragAndDrop.ts with @dnd-kit utilities and collision detection
- [ ] T014 [P] Create lib/story-builder/utils/autoSave.ts with localStorage draft storage layer
- [ ] T015 [P] Create lib/story-builder/utils/tabSync.ts with cross-tab synchronization via storage event
- [ ] T016 [P] Create lib/story-builder/utils/xssProtection.ts with DOMPurify wrappers for HTML sanitization
- [ ] T017 [P] Create lib/story-builder/urlGenerator.ts with URL encoding/validation integration

### Template System

- [ ] T018 Create lib/story-builder/templates/index.ts with template registry
- [ ] T019 Create lib/story-builder/templates/data.ts with 3 pre-built templates (Product Announcement, Tutorial, Q&A)
- [ ] T020 [P] Create lib/story-builder/templates/thumbnails.ts with template thumbnail paths
- [ ] T021 [P] Create lib/story-builder/templates/slideTypes.ts with slide type definitions registry

### Shared Components

- [ ] T022 Create components/story-builder/DragOverlay.tsx with @dnd-kit drag overlay component
- [ ] T023 [P] Create components/story-builder/DropIndicator.tsx with visual drop position indicator
- [ ] T024 [P] Create components/story-builder/EmptyState.tsx with onboarding card for zero slides
- [ ] T025 [P] Create components/story-builder/AutoSaveIndicator.tsx with save status display component

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Drag-and-Drop Slide Creation (Priority: P1) 🎯 MVP

**Goal**: Users create stories by dragging slide type cards from a library and dropping them into a story rail, eliminating manual JSON writing.

**Independent Test**: Create a story with 3 different slide types via drag-and-drop, then export the URL to verify encoding works correctly.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T026 [P] [US1] Unit test for store addSlide action in tests/unit/story-builder/store.test.ts
- [ ] T027 [P] [US1] Unit test for store removeSlide action in tests/unit/story-builder/store.test.ts
- [ ] T028 [P] [US1] Unit test for store reorderSlides action in tests/unit/story-builder/store.test.ts
- [ ] T029 [P] [US1] Integration test for drag from library to rail in tests/integration/story-builder/dragAndDrop.test.tsx
- [ ] T030 [P] [US1] Integration test for slide reordering in rail in tests/integration/story-builder/dragAndDrop.test.tsx
- [ ] T031 [US1] E2E test for complete story creation flow in tests/e2e/story-builder/basicFlow.spec.ts

### Implementation for User Story 1

#### Slide Library Panel

- [ ] T032 [P] [US1] Create app/story-builder/components/SlideLibrary.tsx with left sidebar container
- [ ] T033 [P] [US1] Create app/story-builder/components/slides/SlideTypeCard.tsx with draggable slide type cards
- [ ] T034 [US1] Implement @dnd-kit drag context in SlideLibrary.tsx for drag start events

#### Story Rail

- [ ] T035 [P] [US1] Create app/story-builder/components/StoryRail.tsx with horizontal scrollable thumbnail strip
- [ ] T036 [P] [US1] Create app/story-builder/components/slides/SlideCard.tsx with individual slide thumbnail card
- [ ] T037 [US1] Implement @dnd-kit sortable context in StoryRail.tsx for drop events
- [ ] T038 [US1] Implement drag overlay with DragOverlay component in StoryRail.tsx
- [ ] T039 [US1] Implement drop indicator with DropIndicator component in StoryRail.tsx

#### Main Builder Container

- [ ] T040 [US1] Create app/story-builder/components/StoryBuilder.tsx with main builder container
- [ ] T041 [US1] Wire up DndContext with sensors and collision detection in StoryBuilder.tsx
- [ ] T042 [US1] Implement onDragStart handler to show drag overlay in StoryBuilder.tsx
- [ ] T043 [US1] Implement onDragOver handler to show drop indicator in StoryBuilder.tsx
- [ ] T044 [US1] Implement onDragEnd handler to add/reorder slides via store in StoryBuilder.tsx
- [ ] T045 [US1] Handle empty state with EmptyState component when slides.length === 0 in StoryRail.tsx

#### Slide Editor Panel

- [ ] T046 [P] [US1] Create app/story-builder/components/SlideEditor.tsx with dynamic editor panel container
- [ ] T047 [P] [US1] Create app/story-builder/components/slides/editors/TextSlideEditor.tsx with text content editor
- [ ] T048 [P] [US1] Create app/story-builder/components/slides/editors/ImageSlideEditor.tsx with image URL input and preview
- [ ] T049 [P] [US1] Create app/story-builder/components/slides/editors/TeleprompterSlideEditor.tsx with focal point slider
- [ ] T050 [P] [US1] Create app/story-builder/components/slides/editors/PollSlideEditor.tsx with poll options management
- [ ] T051 [P] [US1] Create app/story-builder/components/slides/editors/WidgetSlideEditor.tsx with chart configuration
- [ ] T052 [US1] Implement common controls (duration slider, background color picker) in SlideEditor.tsx
- [ ] T053 [US1] Wire up updateSlide store action when editor fields change in SlideEditor.tsx

#### Header & Actions

- [ ] T054 [P] [US1] Create app/story-builder/components/Header.tsx with top bar actions
- [ ] T055 [P] [US1] Implement save status indicator with AutoSaveIndicator in Header.tsx
- [ ] T056 [US1] Implement Copy URL button with clipboard API in Header.tsx
- [ ] T057 [US1] Add success/error toast notifications for URL generation in Header.tsx

#### Page Integration

- [ ] T058 [US1] Create app/story-builder/page.tsx with StoryBuilder component
- [ ] T059 [US1] Create app/story-builder/layout.tsx for builder section layout
- [ ] T060 [US1] Integrate useAutoSave hook for 30s auto-save timer in StoryBuilder.tsx
- [ ] T061 [US1] Handle localStorage disabled/full scenarios with warning toast in StoryBuilder.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional - users can create, edit, reorder, and export stories via drag-and-drop

---

## Phase 4: User Story 2 - Real-Time Mobile Preview (Priority: P2)

**Goal**: Users see a live 9:16 mobile preview of their story that updates instantly as they edit slides, providing immediate visual feedback.

**Independent Test**: Edit slide properties and verify the preview updates within 100ms without page reload.

### Tests for User Story 2

- [ ] T062 [P] [US2] Unit test for postMessage communication in tests/unit/story-builder/utils/previewSync.test.ts
- [ ] T063 [P] [US2] Integration test for preview update latency in tests/integration/story-builder/previewSync.test.tsx
- [ ] T064 [US2] Integration test for preview error states in tests/integration/story-builder/previewSync.test.tsx

### Implementation for User Story 2

#### Preview Infrastructure

- [ ] T065 [P] [US2] Create lib/story-builder/hooks/usePreviewSync.ts with iframe postMessage sync hook
- [ ] T066 [P] [US2] Implement debounced preview updates (100ms threshold) in usePreviewSync.ts
- [ ] T067 [P] [US2] Implement shallow comparison to prevent unnecessary updates in usePreviewSync.ts

#### Preview Panel Component

- [ ] T068 [P] [US2] Create app/story-builder/components/PreviewPanel.tsx with right sidebar container
- [ ] T069 [US2] Implement iframe container with 9:16 aspect ratio in PreviewPanel.tsx
- [ ] T070 [US2] Add slide indicator overlay (current/total) in PreviewPanel.tsx
- [ ] T071 [US2] Add duration overlay for current slide in PreviewPanel.tsx
- [ ] T072 [US2] Implement loading state with LoaderIcon in PreviewPanel.tsx

#### Preview Route

- [ ] T073 [US2] Create app/story-preview/page.tsx with isolated preview route
- [ ] T074 [US2] Implement postMessage event listener for UPDATE_STORY messages in preview page
- [ ] T075 [US2] Implement story rendering with existing StoryViewer component in preview page
- [ ] T076 [US2] Add error handling for invalid story data in preview page

#### Integration with Builder

- [ ] T077 [US2] Integrate usePreviewSync hook in StoryBuilder.tsx
- [ ] T078 [US2] Wire up preview updates when slides change in StoryBuilder.tsx
- [ ] T079 [US2] Handle preview loading and error states in PreviewPanel.tsx

#### Performance Testing

- [ ] T080 [US2] Add performance.mark() calls to measure preview update latency in PreviewPanel.tsx
- [ ] T081 [US2] Log preview updates that exceed 100ms threshold for monitoring

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - users have full drag-and-drop creation with real-time preview

---

## Phase 5: User Story 3 - Template Gallery (Priority: P3)

**Goal**: Users can start with pre-built story templates to accelerate creation, providing common layouts like "product announcement", "tutorial", "Q&A".

**Independent Test**: Select a template and verify it pre-populates the story rail with configured slides.

### Tests for User Story 3

- [ ] T082 [P] [US3] Unit test for template data structure in tests/unit/story-builder/templates/data.test.ts
- [ ] T083 [P] [US3] Unit test for getTemplateById function in tests/unit/story-builder/templates/data.test.ts
- [ ] T084 [US3] Integration test for template loading in tests/integration/story-builder/templates.test.tsx
- [ ] T085 [US3] E2E test for template-based story creation in tests/e2e/story-builder/templates.spec.ts

### Implementation for User Story 3

#### Template Modal Component

- [ ] T086 [P] [US3] Create app/story-builder/components/TemplateGalleryModal.tsx with modal dialog
- [ ] T087 [P] [US3] Implement template grid layout with responsive columns in TemplateGalleryModal.tsx
- [ ] T088 [US3] Add template thumbnail images with hover overlay in TemplateGalleryModal.tsx
- [ ] T089 [US3] Implement template selection handler in TemplateGalleryModal.tsx

#### Store Integration

- [ ] T090 [US3] Implement loadTemplate store action in lib/story-builder/store.ts
- [ ] T091 [US3] Handle template slides with UUID generation in loadTemplate action
- [ ] T092 [US3] Set activeSlideIndex to 0 after template load in loadTemplate action

#### Header Integration

- [ ] T093 [US3] Add Templates button to Header.tsx
- [ ] T094 [US3] Implement template modal open/close state in Header.tsx
- [ ] T095 [US3] Handle template selection and modal close in Header.tsx

#### Template Assets

- [ ] T096 [P] [US3] Create public/templates/product-announcement.jpg thumbnail image
- [ ] T097 [P] [US3] Create public/templates/tutorial.jpg thumbnail image
- [ ] T098 [P] [US3] Create public/templates/qa.jpg thumbnail image

**Checkpoint**: All user stories should now be independently functional - users can create from scratch, see real-time preview, and start from templates

---

## Phase 6: Responsive Design (Priority: P2)

**Purpose**: Mobile accessibility and touch-optimized interactions

- [ ] T099 [P] Implement desktop three-column layout (≥1024px) in StoryBuilder.tsx with grid-cols-[280px_1fr_320px]
- [ ] T100 [P] Implement tablet two-column layout (768-1023px) in StoryBuilder.tsx with grid-cols-[1fr_280px]
- [ ] T101 Implement mobile tab-based layout (<768px) in StoryBuilder.tsx with flex and tab navigation
- [ ] T102 Add touch-optimized drag handlers with TouchSensor in StoryBuilder.tsx
- [ ] T103 Ensure 44×44px touch targets throughout all components (audit and fix)
- [ ] T104 Test on mobile devices (iOS Safari, Chrome Android, Samsung Internet)

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Documentation

- [ ] T105 [P] Add inline code comments to complex logic in store.ts and hooks
- [ ] T106 [P] Create JSDoc for public APIs in lib/story-builder/
- [ ] T107 Update main README.md with feature overview
- [ ] T108 Add story builder to navigation menu

### Performance

- [ ] T109 [P] Memoize expensive computations with useMemo in SlideCard.tsx
- [ ] T110 [P] Implement virtual scrolling for large stories (>15 slides) if needed
- [ ] T111 Optimize preview updates with requestAnimationFrame in usePreviewSync.ts

### Accessibility

- [ ] T112 [P] Add ARIA labels to all interactive elements
- [ ] T113 [P] Implement keyboard navigation (Tab, Arrow keys, Enter, Escape) in StoryBuilder.tsx
- [ ] T114 Add screen reader announcements with aria-live regions
- [ ] T115 Conduct accessibility audit with screen reader testing

### Error Handling

- [ ] T116 [P] Add error boundaries for component error handling
- [ ] T117 Implement URL length limit validation (32KB) with user-friendly error in store.ts
- [ ] T118 Add image size validation (<5MB) in ImageSlideEditor.tsx
- [ ] T119 Handle localStorage QuotaExceededError with graceful degradation

### Browser Compatibility

- [ ] T120 [P] Test on Chrome, Firefox, Safari, Edge
- [ ] T121 [P] Fix browser-specific issues discovered during testing
- [ ] T122 Verify @dnd-kit performance across browsers

### Security

- [ ] T123 Integrate DOMPurify sanitization in all text content rendering
- [ ] T124 Add origin validation for postMessage in preview page
- [ ] T125 Verify no eval() or dangerous code execution

### Final Testing

- [ ] T126 Run all unit tests with npm test
- [ ] T127 Run all integration tests with npm test
- [ ] T128 Run all E2E tests with Playwright
- [ ] T129 Run ESLint and fix issues with npm run lint
- [ ] T130 Verify quickstart.md examples work correctly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P2): Can start after Foundational - Integrates with US1 but independently testable
  - User Story 3 (P3): Can start after Foundational - Integrates with US1 but independently testable
- **Responsive Design (Phase 6)**: Depends on US1 completion (needs working UI)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Requires US1 for preview data but preview can be tested independently
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Uses US1 editor but template loading is independently testable

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Types before components
- Components before integration
- Core implementation before polish
- Story complete before moving to next priority

### Parallel Opportunities

**Setup (Phase 1)**:
- T004, T005 can run in parallel

**Foundational (Phase 2)**:
- T007, T008 can run in parallel (different parts of types.ts)
- T013, T014, T015, T016, T017 can run in parallel (different utility files)
- T020, T021 can run in parallel (different template files)
- T023, T024, T025 can run in parallel (different shared components)

**User Story 1 Tests**:
- T026, T027, T028, T029, T030 can run in parallel (different test files)

**User Story 1 Slide Library**:
- T032, T033 can run in parallel (different files)

**User Story 1 Story Rail**:
- T035, T036 can run in parallel (different files)

**User Story 1 Slide Editors**:
- T047, T048, T049, T050, T051 can run in parallel (different editor files)

**User Story 1 Header**:
- T054, T055 can run in parallel (different files)

**User Story 2 Tests**:
- T062, T063, T064 can run in parallel (different test files)

**User Story 2 Preview Infrastructure**:
- T065, T066, T067 can run in parallel (same file but different functions)

**User Story 3 Tests**:
- T082, T083, T084 can run in parallel (different test files)

**User Story 3 Template Assets**:
- T096, T097, T098 can run in parallel (different image files)

**Polish**:
- T105, T106, T107, T109, T110, T112, T113, T116, T117, T120, T121 can run in parallel (different files/concerns)

---

## Parallel Example: User Story 1 Slide Editors

```bash
# Launch all slide editor implementations together:
Task: "Create TextSlideEditor.tsx in app/story-builder/components/slides/editors/"
Task: "Create ImageSlideEditor.tsx in app/story-builder/components/slides/editors/"
Task: "Create TeleprompterSlideEditor.tsx in app/story-builder/components/slides/editors/"
Task: "Create PollSlideEditor.tsx in app/story-builder/components/slides/editors/"
Task: "Create WidgetSlideEditor.tsx in app/story-builder/components/slides/editors/"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T025) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T026-T061)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo MVP (drag-and-drop story creation with URL export)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (T001-T025)
2. Add User Story 1 → Test independently → Deploy/Demo (T026-T061) - **MVP!**
3. Add User Story 2 → Test independently → Deploy/Demo (T062-T081)
4. Add User Story 3 → Test independently → Deploy/Demo (T082-T098)
5. Add Responsive Design → Deploy/Demo (T099-T104)
6. Add Polish → Final release (T105-T130)

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T025)
2. Once Foundational is done:
   - Developer A: User Story 1 (T026-T061)
   - Developer B: User Story 2 (T062-T081)
   - Developer C: User Story 3 (T082-T098)
3. Stories complete and integrate independently
4. Team completes Responsive Design + Polish together

---

## Task Count Summary

- **Phase 1 (Setup)**: 5 tasks
- **Phase 2 (Foundational)**: 20 tasks
- **Phase 3 (User Story 1)**: 36 tasks (including tests)
- **Phase 4 (User Story 2)**: 20 tasks (including tests)
- **Phase 5 (User Story 3)**: 18 tasks (including tests)
- **Phase 6 (Responsive)**: 6 tasks
- **Phase 7 (Polish)**: 25 tasks

**Total**: 130 tasks

### Tasks by User Story

- **User Story 1 (P1)**: 36 tasks
- **User Story 2 (P2)**: 20 tasks
- **User Story 3 (P3)**: 18 tasks

### Parallel Opportunities

- **Setup**: 2 parallelizable tasks
- **Foundational**: 9 parallelizable tasks
- **User Story 1**: 16 parallelizable tasks (tests + editors + components)
- **User Story 2**: 7 parallelizable tasks (tests + preview infrastructure)
- **User Story 3**: 7 parallelizable tasks (tests + template assets)
- **Polish**: 11 parallelizable tasks

**Total Parallelizable**: 52 tasks across all phases

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- MVP = User Story 1 only (T001-T061)
- Full feature = All phases (T001-T130)
