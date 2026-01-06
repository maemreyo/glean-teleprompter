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

- [X] T001 Install @dnd-kit dependencies (@dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities)
- [X] T002 Install dompurify dependency for XSS protection
- [X] T003 Create app/story-builder directory structure with subdirectories (components, lib, hooks)
- [X] T004 [P] Add story builder route to navigation in components/Navigation/Navigation.tsx
- [X] T005 [P] Create public/templates directory for template thumbnail images

**Checkpoint**: Setup complete - ready for foundational infrastructure

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Types & Core Data Structures

- [X] T006 Create lib/story-builder/types.ts with BuilderSlide, StoryBuilder, SaveStatus interfaces
- [X] T007 [P] Create lib/story-builder/types.ts with slide content interfaces (TextContent, ImageContent, TeleprompterContent, PollContent, WidgetContent)
- [X] T008 [P] Create lib/story-builder/types.ts with template and action types

### Zustand Store

- [X] T009 Create lib/story-builder/store.ts with Zustand store structure (state, actions, selectors)
- [X] T010 Implement store slide management actions (addSlide, removeSlide, reorderSlides, updateSlide, setActiveSlide)
- [X] T011 Implement store story operations (generateUrl, loadTemplate, clearStory)
- [X] T012 Implement store auto-save actions (autoSave, restoreDraft, handleStorageEvent)

### Utility Functions

- [X] T013 [P] Create lib/story-builder/utils/dragAndDrop.ts with @dnd-kit utilities and collision detection
- [X] T014 [P] Create lib/story-builder/utils/autoSave.ts with localStorage draft storage layer
- [X] T015 [P] Create lib/story-builder/utils/tabSync.ts with cross-tab synchronization via storage event
- [X] T016 [P] Create lib/story-builder/utils/xssProtection.ts with DOMPurify wrappers for HTML sanitization
- [X] T017 [P] Create lib/story-builder/urlGenerator.ts with URL encoding/validation integration

### Template System

- [X] T018 Create lib/story-builder/templates/index.ts with template registry
- [X] T019 Create lib/story-builder/templates/data.ts with 3 pre-built templates (Product Announcement, Tutorial, Q&A)
- [X] T020 [P] Create lib/story-builder/templates/thumbnails.ts with template thumbnail paths
- [X] T021 [P] Create lib/story-builder/templates/slideTypes.ts with slide type definitions registry

### Shared Components

- [X] T022 Create components/story-builder/DragOverlay.tsx with @dnd-kit drag overlay component
- [X] T023 [P] Create components/story-builder/DropIndicator.tsx with visual drop position indicator
- [X] T024 [P] Create components/story-builder/EmptyState.tsx with onboarding card for zero slides
- [X] T025 [P] Create components/story-builder/AutoSaveIndicator.tsx with save status display component

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Drag-and-Drop Slide Creation (Priority: P1) 🎯 MVP

**Goal**: Users create stories by dragging slide type cards from a library and dropping them into a story rail, eliminating manual JSON writing.

**Independent Test**: Create a story with 3 different slide types via drag-and-drop, then export the URL to verify encoding works correctly.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T026 [P] [US1] Unit test for store addSlide action in tests/unit/story-builder/store.test.ts
- [X] T027 [P] [US1] Unit test for store removeSlide action in tests/unit/story-builder/store.test.ts
- [X] T028 [P] [US1] Unit test for store reorderSlides action in tests/unit/story-builder/store.test.ts
- [X] T029 [P] [US1] Integration test for drag from library to rail in tests/integration/story-builder/dragAndDrop.test.tsx
- [X] T030 [P] [US1] Integration test for slide reordering in rail in tests/integration/story-builder/dragAndDrop.test.tsx
- [X] T031 [US1] E2E test for complete story creation flow in tests/e2e/story-builder/basicFlow.spec.ts

### Implementation for User Story 1

#### Slide Library Panel

- [X] T032 [P] [US1] Create app/story-builder/components/SlideLibrary.tsx with left sidebar container
- [X] T033 [P] [US1] Create app/story-builder/components/slides/SlideTypeCard.tsx with draggable slide type cards
- [X] T034 [US1] Implement @dnd-kit drag context in SlideLibrary.tsx for drag start events

#### Story Rail

- [X] T035 [P] [US1] Create app/story-builder/components/StoryRail.tsx with horizontal scrollable thumbnail strip
- [X] T036 [P] [US1] Create app/story-builder/components/slides/SlideCard.tsx with individual slide thumbnail card
- [X] T037 [US1] Implement @dnd-kit sortable context in StoryRail.tsx for drop events
- [X] T038 [US1] Implement drag overlay with DragOverlay component in StoryRail.tsx
- [X] T039 [US1] Implement drop indicator with DropIndicator component in StoryRail.tsx

#### Main Builder Container

- [X] T040 [US1] Create app/story-builder/components/StoryBuilder.tsx with main builder container
- [X] T041 [US1] Wire up DndContext with sensors and collision detection in StoryBuilder.tsx
- [X] T042 [US1] Implement onDragStart handler to show drag overlay in StoryBuilder.tsx
- [X] T043 [US1] Implement onDragOver handler to show drop indicator in StoryBuilder.tsx
- [X] T044 [US1] Implement onDragEnd handler to add/reorder slides via store in StoryBuilder.tsx
- [X] T045 [US1] Handle empty state with EmptyState component when slides.length === 0 in StoryRail.tsx

#### Slide Editor Panel

- [X] T046 [P] [US1] Create app/story-builder/components/SlideEditor.tsx with dynamic editor panel container
- [X] T047 [P] [US1] Create app/story-builder/components/slides/editors/TextSlideEditor.tsx with text content editor
- [X] T048 [P] [US1] Create app/story-builder/components/slides/editors/ImageSlideEditor.tsx with image URL input and preview
- [X] T049 [P] [US1] Create app/story-builder/components/slides/editors/TeleprompterSlideEditor.tsx with focal point slider
- [X] T050 [P] [US1] Create app/story-builder/components/slides/editors/PollSlideEditor.tsx with poll options management
- [X] T051 [P] [US1] Create app/story-builder/components/slides/editors/WidgetSlideEditor.tsx with chart configuration
- [X] T052 [US1] Implement common controls (duration slider, background color picker) in SlideEditor.tsx
- [X] T053 [US1] Wire up updateSlide store action when editor fields change in SlideEditor.tsx

#### Header & Actions

- [X] T054 [P] [US1] Create app/story-builder/components/Header.tsx with top bar actions
- [X] T055 [P] [US1] Implement save status indicator with AutoSaveIndicator in Header.tsx
- [X] T056 [US1] Implement Copy URL button with clipboard API in Header.tsx
- [X] T057 [US1] Add success/error toast notifications for URL generation in Header.tsx

#### Page Integration

- [X] T058 [US1] Create app/story-builder/page.tsx with StoryBuilder component
- [X] T059 [US1] Create app/story-builder/layout.tsx for builder section layout
- [X] T060 [US1] Integrate useAutoSave hook for 30s auto-save timer in StoryBuilder.tsx
- [X] T061 [US1] Handle localStorage disabled/full scenarios with warning toast in StoryBuilder.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional - users can create, edit, reorder, and export stories via drag-and-drop

---

## Phase 4: User Story 2 - Real-Time Mobile Preview (Priority: P2)

**Goal**: Users see a live 9:16 mobile preview of their story that updates instantly as they edit slides, providing immediate visual feedback.

**Independent Test**: Edit slide properties and verify the preview updates within 100ms without page reload.

### Tests for User Story 2

- [X] T062 [P] [US2] Unit test for postMessage communication in tests/unit/story-builder/utils/previewSync.test.ts
- [X] T063 [P] [US2] Integration test for preview update latency in tests/integration/story-builder/previewSync.test.tsx
- [X] T064 [US2] Integration test for preview error states in tests/integration/story-builder/previewSync.test.tsx

### Implementation for User Story 2

#### Preview Infrastructure

- [X] T065 [P] [US2] Create lib/story-builder/hooks/usePreviewSync.ts with iframe postMessage sync hook
- [X] T066 [P] [US2] Implement debounced preview updates (100ms threshold) in usePreviewSync.ts
- [X] T067 [P] [US2] Implement shallow comparison to prevent unnecessary updates in usePreviewSync.ts

#### Preview Panel Component

- [X] T068 [P] [US2] Create app/story-builder/components/PreviewPanel.tsx with right sidebar container
- [X] T069 [US2] Implement iframe container with 9:16 aspect ratio in PreviewPanel.tsx
- [X] T070 [US2] Add slide indicator overlay (current/total) in PreviewPanel.tsx
- [X] T071 [US2] Add duration overlay for current slide in PreviewPanel.tsx
- [X] T072 [US2] Implement loading state with LoaderIcon in PreviewPanel.tsx

#### Preview Route

- [X] T073 [US2] Create app/story-preview/page.tsx with isolated preview route
- [X] T074 [US2] Implement postMessage event listener for UPDATE_STORY messages in preview page
- [X] T075 [US2] Implement story rendering with existing StoryViewer component in preview page
- [X] T076 [US2] Add error handling for invalid story data in preview page

#### Integration with Builder

- [X] T077 [US2] Integrate usePreviewSync hook in StoryBuilder.tsx
- [X] T078 [US2] Wire up preview updates when slides change in StoryBuilder.tsx
- [X] T079 [US2] Handle preview loading and error states in PreviewPanel.tsx

#### Performance Testing

- [X] T080 [US2] Add performance.mark() calls to measure preview update latency in PreviewPanel.tsx
- [X] T081 [US2] Log preview updates that exceed 100ms threshold for monitoring

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - users have full drag-and-drop creation with real-time preview

---

## Phase 5: User Story 3 - Template Gallery (Priority: P3)

**Goal**: Users can start with pre-built story templates to accelerate creation, providing common layouts like "product announcement", "tutorial", "Q&A".

**Independent Test**: Select a template and verify it pre-populates the story rail with configured slides.

### Tests for User Story 3

- [X] T082 [P] [US3] Unit test for template data structure in tests/unit/story-builder/templates/data.test.ts
- [X] T083 [P] [US3] Unit test for getTemplateById function in tests/unit/story-builder/templates/data.test.ts
- [X] T084 [US3] Integration test for template loading in tests/integration/story-builder/templates.test.tsx
- [X] T085 [US3] E2E test for template-based story creation in tests/e2e/story-builder/templates.spec.ts

### Implementation for User Story 3

#### Template Modal Component

- [X] T086 [P] [US3] Create app/story-builder/components/TemplateGalleryModal.tsx with modal dialog
- [X] T087 [P] [US3] Implement template grid layout with responsive columns in TemplateGalleryModal.tsx
- [X] T088 [US3] Add template thumbnail images with hover overlay in TemplateGalleryModal.tsx
- [X] T089 [US3] Implement template selection handler in TemplateGalleryModal.tsx

#### Store Integration

- [X] T090 [US3] Implement loadTemplate store action in lib/story-builder/store.ts (already existed)
- [X] T091 [US3] Handle template slides with UUID generation in loadTemplate action (already existed)
- [X] T092 [US3] Set activeSlideIndex to 0 after template load in loadTemplate action (already existed)

#### Header Integration

- [X] T093 [US3] Add Templates button to Header.tsx
- [X] T094 [US3] Implement template modal open/close state in Header.tsx
- [X] T095 [US3] Handle template selection and modal close in Header.tsx

#### Template Assets

- [X] T096 [P] [US3] Create public/templates/product-announcement.svg thumbnail image
- [X] T097 [P] [US3] Create public/templates/tutorial.svg thumbnail image
- [X] T098 [P] [US3] Create public/templates/qa.svg thumbnail image

**Checkpoint**: All user stories should now be independently functional - users can create from scratch, see real-time preview, and start from templates

---

## Phase 5.5: High Priority Roast Fixes (Priority: P0)

**Purpose**: Fix critical design system and performance issues identified in roast review

- [X] T099.1 [DS-HIGH-1] Fix slide card dimensions to 120×213px (9:16 Instagram ratio) in SlideCard.tsx
- [X] T099.2 [DS-HIGH-2] Add gradient borders for active slides in SlideCard.tsx
- [X] T099.3 [DS-HIGH-3] Verify shadow-drag elevation in DragOverlay.tsx (already implemented)
- [X] T099.4 [PERF-HIGH-1] Fix JSON.stringify() deep comparison in usePreviewSync.ts
- [X] T099.5 [PERF-HIGH-2] Use Zustand selectors in StoryBuilder.tsx

**Checkpoint**: High priority roast violations addressed - design system compliance and performance optimized

---

## Phase 5.75: Medium Priority Roast Fixes (Priority: P1)

**Purpose**: Fix medium priority code quality and responsive design issues identified in roast review

- [X] T099.6 [CODE-MED-1] Add error boundary around StoryBuilder component in app/story-builder/page.tsx
- [X] T099.7 [CODE-MED-2] Replace console.warn() with toast notifications in lib/story-builder/store.ts
- [X] T099.8 [CODE-MED-2] Replace console.warn() with toast notifications in lib/story-builder/urlGenerator.ts
- [X] T099.9 [CODE-MED-2] Replace empty catch blocks with toast notifications in lib/story-builder/utils/autoSave.ts
- [X] T099.10 [CODE-MED-3] Create lib/story-builder/constants.ts with all magic numbers
- [X] T099.11 [CODE-MED-3] Update lib/story-builder/store.ts to import and use constants
- [X] T099.12 [CODE-MED-4] Add custom comparison function to SlideCard memo in app/story-builder/components/slides/SlideCard.tsx
- [X] T099.13 [RESP-MED-1] Add tablet layout (md: breakpoint) in app/story-builder/components/StoryBuilder.tsx
- [X] T099.14 [CODE-MED-1] Create components/ui/error-boundary.tsx component

**Checkpoint**: Medium priority roast violations addressed - error handling, code quality, and responsive design improved

---

## Phase 5.875: Low Priority Roast Fixes (Priority: P2)

**Purpose**: Fix low priority accessibility and feature gaps identified in roast review

- [X] T099.15 [DS-MED-1] Add hover states to slide cards (scale 1.05, shadow) in SlideCard.tsx
- [X] T099.16 [DS-MED-2] Use Plus Jakarta Sans (font-display) for slide titles in SlideCard.tsx
- [X] T099.17 [A11Y-LOW-1] Implement arrow key navigation (← →) for story rail in StoryRail.tsx
- [X] T099.18 [A11Y-LOW-2] Add focus restoration after slide deletion in SlideCard.tsx
- [X] T099.19 [FEAT-LOW-1] Implement undo/redo functionality with history tracking in store.ts
- [X] T099.20 [FEAT-LOW-1] Add undo/redo buttons to Header.tsx with Undo/Redo icons from lucide-react

**Checkpoint**: Low priority roast violations addressed - UX polish, accessibility, and feature completeness

---

## Phase 6: Responsive Design (Priority: P2)

**Purpose**: Mobile accessibility and touch-optimized interactions

- [X] T099 [P] Implement desktop three-column layout (≥1024px) in StoryBuilder.tsx with grid-cols-[280px_1fr_320px]
- [X] T100 [P] Implement tablet two-column layout (768-1023px) in StoryBuilder.tsx with grid-cols-[1fr_280px]
- [X] T101 [P] Implement mobile tab-based layout (<768px) in StoryBuilder.tsx with flex and tab navigation
- [X] T102 Add touch-optimized drag handlers with TouchSensor in StoryBuilder.tsx
- [X] T103 Ensure 44×44px touch targets throughout all components (audit and fix)
- [X] T104 Test on mobile devices (iOS Safari, Chrome Android, Samsung Internet)

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Documentation

- [X] T105 [P] Add inline code comments to complex logic in store.ts and hooks
- [X] T106 [P] Create JSDoc for public APIs in lib/story-builder/
- [X] T107 Update main README.md with feature overview (DOC-LOW-1)
- [X] T108 Add story builder to navigation menu

### Performance

- [X] T109 [P] Memoize expensive computations with useMemo in SlideCard.tsx
- [X] T110 [P] Implement virtual scrolling for large stories (>15 slides) if needed
- [X] T111 Optimize preview updates with requestAnimationFrame in usePreviewSync.ts

### Accessibility

- [X] T112 [P] Add ARIA labels to all interactive elements (SEC-CRITICAL-1, A11Y-CRITICAL-1)
- [X] T113 [P] Implement keyboard navigation (Tab, Arrow keys, Enter, Escape) in StoryBuilder.tsx
- [X] T114 Add screen reader announcements with aria-live regions
- [X] T115 Conduct accessibility audit with screen reader testing (A11Y-LOW-2)

### Error Handling

- [X] T116 [P] Add error boundaries for component error handling
- [X] T117 Implement URL length limit validation (32KB) with user-friendly error in store.ts
- [X] T118 Add image size validation (<5MB) in ImageSlideEditor.tsx
- [X] T119 Handle localStorage QuotaExceededError with graceful degradation

### Browser Compatibility

- [X] T120 [P] Test on Chrome, Firefox, Safari, Edge
- [X] T121 [P] Fix browser-specific issues discovered during testing
- [X] T122 Verify @dnd-kit performance across browsers

### Security

- [X] T123 Integrate DOMPurify sanitization in all text content rendering (SEC-003)
- [X] T124 Add origin validation for postMessage in preview page (SEC-CRITICAL-1)
- [X] T125 Verify no eval() or dangerous code execution

### Final Testing

- [X] T126 Run all unit tests with npm test
- [X] T127 Run all integration tests with npm test
- [X] T128 Run all E2E tests with Playwright
- [X] T129 Run ESLint and fix issues with npm run lint
- [X] T130 Verify quickstart.md examples work correctly

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
