# Tasks: Professional UI Configuration System for Teleprompter Studio

**Input**: Design documents from `/specs/001-ui-config-system/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Install core dependencies (zustand, react-colorful) in package.json
- [x] T002 Create database tables for presets and collections in Supabase SQL Editor
- [x] T003 Configure RLS policies for preset and collection tables
- [x] T004 [P] Create types directory structure (lib/config/types.ts, types/config.ts)
- [x] T005 [P] Setup basic project directories for config system (lib/config/, lib/fonts/, lib/stores/)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create TypeScript type definitions for all config entities (TypographyConfig, ColorConfig, EffectConfig, LayoutConfig, AnimationConfig, ConfigSnapshot) in lib/config/types.ts
- [x] T007 Create Zustand store for configuration state management in lib/stores/useConfigStore.ts
- [x] T008 Implement Google Fonts integration and font library in lib/fonts/google-fonts.ts
- [x] T009 Create base UI components (ColorPicker, SliderInput) in components/teleprompter/config/ui/
- [x] T010 Create configuration panel container component in components/teleprompter/config/ConfigPanel.tsx
- [x] T011 Setup API routes for preset management (GET/POST /api/presets/route.ts)
- [x] T012 Create validation utilities for configuration values in lib/config/validation.ts
- [x] T013 Implement contrast calculation for WCAG compliance in lib/config/contrast.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Typography System (Priority: P1) 🎯 MVP

**Goal**: Content creators can customize font families, weights, sizes, letter spacing, and line height for professional teleprompter presentations.

**Independent Test**: Users can select fonts from categorized library, adjust sizes and spacing, and see immediate changes to teleprompter text rendering without other features.

### Implementation for User Story 1

- [x] T014 [P] [US1] Create FontSelector component with categorized dropdown in components/teleprompter/config/typography/FontSelector.tsx
- [x] T015 [P] [US1] Create FontSizeControl component with slider and input in components/teleprompter/config/typography/FontSizeControl.tsx
- [x] T016 [P] [US1] Create TypographyTab component integrating font controls in components/teleprompter/config/typography/TypographyTab.tsx
- [x] T017 [P] [US1] Add font weight selection controls to TypographyTab
- [x] T018 [P] [US1] Add letter spacing controls to TypographyTab
- [x] T019 [P] [US1] Add line height controls to TypographyTab
- [x] T020 [US1] Integrate TypographyTab into ConfigTabs component in components/teleprompter/config/ConfigTabs.tsx
- [x] T021 [US1] Connect typography controls to Zustand store state updates
- [x] T022 [US1] Apply typography configuration to teleprompter text rendering

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Advanced Color System (Priority: P1)

**Goal**: Broadcasters can customize text colors, gradients, and ensure WCAG AA compliance for professional presentations.

**Independent Test**: Users can select colors from palettes, pick custom colors, apply gradients, and see contrast validation without other features.

### Implementation for User Story 2

- [x] T023 [P] [US2] Create ColorsTab component for color controls in components/teleprompter/config/colors/ColorsTab.tsx
- [x] T024 [P] [US2] Create GradientPicker component for gradient configuration in components/teleprompter/config/colors/GradientPicker.tsx
- [x] T025 [P] [US2] Create ContrastBadge component for WCAG validation display in components/teleprompter/config/colors/ContrastBadge.tsx
- [x] T026 [P] [US2] Implement color palette selection in ColorsTab
- [x] T027 [P] [US2] Add custom color picker integration to ColorsTab
- [x] T028 [P] [US2] Add gradient enable/disable and configuration controls
- [x] T029 [P] [US2] Add outline and glow color pickers to ColorsTab
- [x] T030 [US2] Integrate ColorsTab into ConfigTabs component
- [x] T031 [US2] Connect color controls to Zustand store state updates
- [x] T032 [US2] Apply color configuration to teleprompter text rendering
- [x] T033 [US2] Implement real-time contrast validation and display

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Layout & Spacing System (Priority: P2)

**Goal**: Studio operators can adjust margins, padding, alignment, and text area positioning for different recording setups.

**Independent Test**: Users can adjust margins, padding, alignment, and positioning, seeing layout changes without other features.

### Implementation for User Story 3

- [x] T034 [P] [US3] Create LayoutTab component for layout controls in components/teleprompter/config/layout/LayoutTab.tsx
- [x] T035 [P] [US3] Add horizontal margin controls to LayoutTab
- [x] T036 [P] [US3] Add vertical padding controls to LayoutTab
- [x] T037 [P] [US3] Add text alignment selection (left, center, right, justify) to LayoutTab
- [x] T038 [P] [US3] Add column count and gap controls to LayoutTab
- [x] T039 [P] [US3] Add text area width percentage controls to LayoutTab
- [x] T040 [P] [US3] Add text area position controls to LayoutTab
- [x] T041 [US3] Integrate LayoutTab into ConfigTabs component
- [x] T042 [US3] Connect layout controls to Zustand store state updates
- [x] T043 [US3] Apply layout configuration to teleprompter display positioning

**Checkpoint**: User Stories 1, 2, and 3 should all work independently

---

## Phase 6: User Story 4 - Visual Effects System (Priority: P2)

**Goal**: Production designers can add shadows, outlines, glows, and backdrop filters for enhanced readability and presentation value.

**Independent Test**: Users can enable/disable effects and adjust parameters, seeing smooth rendering without impacting other features.

### Implementation for User Story 4

- [x] T044 [P] [US4] Create EffectsTab component for visual effects in components/teleprompter/config/effects/EffectsTab.tsx
- [x] T045 [P] [US4] Create ShadowControl component for shadow configuration in components/teleprompter/config/effects/ShadowControl.tsx
- [x] T046 [P] [US4] Create OutlineControl component for outline effects in components/teleprompter/config/effects/OutlineControl.tsx
- [x] T047 [P] [US4] Create GlowControl component for glow effects in components/teleprompter/config/effects/GlowControl.tsx
- [x] T048 [P] [US4] Add backdrop filter controls to EffectsTab
- [x] T049 [US4] Integrate EffectsTab into ConfigTabs component
- [x] T050 [US4] Connect effect controls to Zustand store state updates
- [x] T051 [US4] Apply visual effects to teleprompter text rendering

**Checkpoint**: All P1 and P2 user stories should be independently functional

---

## Phase 7: User Story 5 - Theme & Preset Management (Priority: P3)

**Goal**: Media companies can save, organize, and quickly switch between branded themes and configurations.

**Independent Test**: Users can save current configuration as preset, organize into collections, and apply presets without other features.

### Implementation for User Story 5

- [x] T052 [P] [US5] Create PresetsTab component for preset management in components/teleprompter/config/presets/PresetsTab.tsx
- [x] T053 [P] [US5] Create PresetGrid component for displaying presets in components/teleprompter/config/presets/PresetGrid.tsx
- [x] T054 [P] [US5] Create SavePresetDialog component for preset creation in components/teleprompter/config/presets/SavePresetDialog.tsx
- [x] T055 [P] [US5] Create SyncControls component for cloud synchronization in components/teleprompter/config/presets/SyncControls.tsx
- [x] T056 [US5] Implement preset saving functionality in PresetsTab
- [x] T057 [US5] Implement preset loading and application
- [x] T058 [US5] Implement preset deletion functionality
- [x] T059 [US5] Implement collection creation and management
- [x] T060 [US5] Add preset export to JSON functionality
- [x] T061 [US5] Add preset import from JSON functionality
- [x] T062 [US5] Integrate preset management into ConfigTabs
- [x] T063 [US5] Connect preset actions to API routes and Zustand store

**Checkpoint**: All user stories should be independently functional

---

## Phase 8: User Story 6 - Animation & Transition System (Priority: P3)

**Goal**: Presenters experience smooth scrolling, entrance animations, and highlighting for enhanced engagement.

**Independent Test**: Users can enable animations, adjust timing, and see smooth transitions without other features.

### Implementation for User Story 6

- [x] T064 [P] [US6] Create AnimationsTab component for animation controls in components/teleprompter/config/animations/AnimationsTab.tsx
- [x] T065 [P] [US6] Add smooth scroll damping controls to AnimationsTab
- [x] T066 [P] [US6] Add entrance animation selection and duration controls
- [x] T067 [P] [US6] Add word-by-word highlighting controls with color and speed
- [x] T068 [P] [US6] Add auto-scroll speed and acceleration controls
- [x] T069 [US6] Integrate AnimationsTab into ConfigTabs component
- [x] T070 [US6] Connect animation controls to Zustand store state updates
- [x] T071 [US6] Apply animation configuration to teleprompter scrolling and transitions

**Checkpoint**: All P1-P3 user stories should be complete and independently functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T072 [P] Add undo/redo functionality to configuration changes
- [x] T073 [P] Implement keyboard shortcuts for common configuration adjustments
- [x] T074 [P] Add configuration panel responsive behavior
- [x] T075 Create default preset configurations (Broadcast, Minimal, Cinematic, Corporate, Creative)
- [x] T076 Add configuration validation and error handling
- [x] T077 Implement local storage persistence for configuration state
- [x] T078 Add loading states and error handling for font loading
- [x] T079 [P] Documentation updates for configuration system
- [x] T080 Final integration testing of all user stories together

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Components within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all components for User Story 1 together:
Task: "Create FontSelector component with categorized dropdown in components/teleprompter/config/typography/FontSelector.tsx"
Task: "Create FontSizeControl component with slider and input in components/teleprompter/config/typography/FontSizeControl.tsx"
Task: "Create TypographyTab component integrating font controls in components/teleprompter/config/typography/TypographyTab.tsx"
Task: "Add font weight selection controls to TypographyTab"
```

---

## Implementation Strategy

### MVP First (User Stories 1-2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phases 3-4: User Stories 1 and 2
4. **STOP and VALIDATE**: Test User Stories 1 and 2 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Stories 1-2 → Test independently → Deploy/Demo (MVP!)
3. Add User Stories 3-4 → Test independently → Deploy/Demo
4. Add User Stories 5-6 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Stories 1-2 (Typography & Colors)
   - Developer B: User Stories 3-4 (Layout & Effects)
   - Developer C: User Stories 5-6 (Presets & Animations)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence