# Tasks: Floating Music Player Widget

**Input**: Design documents from `/specs/011-music-player-widget/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are optional for this feature - tasks below focus on implementation per the specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app structure**: Paths are relative to repository root
- Components: `components/teleprompter/music/`
- Libraries: `lib/stores/`, `lib/music/`
- Tests: `__tests__/unit/`, `__tests__/integration/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create Supabase Storage bucket `user-audio-files` with RLS policies via SQL editor
- [ ] T002 [P] Create directory structure for music components at `components/teleprompter/music/`
- [ ] T003 [P] Create directory structure for music utilities at `lib/music/`
- [ ] T004 [P] Create directory structure for style components at `components/teleprompter/music/styles/`
- [ ] T005 [P] Create directory structure for settings components at `components/teleprompter/music/settings/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Implement audio source validation schemas in `lib/music/audioSourceValidation.ts` (YouTube URLs, file formats, quota limits)
- [ ] T007 [P] Implement widget dimension constants in `lib/music/widgetDimensions.ts` (Capsule: 280×80, Vinyl: 200×200, Spectrum: 320×120)
- [ ] T008 [P] Implement BroadcastChannel manager for cross-tab sync in `lib/music/broadcastChannel.ts`
- [ ] T009 Create Zustand store with persist middleware in `lib/stores/useMusicPlayerStore.ts` (includes all state, actions, BroadcastChannel integration)
- [ ] T010 Add translation keys for music widget in `messages/en.json` (error messages, labels)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Music Source Selection & Widget Style Configuration (Priority: P1) 🎯 MVP

**Goal**: Enable users to configure music source (YouTube URL or file upload) and select widget style with visual previews in settings

**Independent Test**: Access settings, select music source, choose widget style from visual previews, verify preferences persist across browser sessions

### Implementation for User Story 1

- [ ] T011 [P] [US1] Create YouTube URL input component with validation in `components/teleprompter/music/settings/YouTubeUrlInput.tsx`
- [ ] T012 [P] [US1] Create file upload input component with quota management in `components/teleprompter/music/settings/FileUploadInput.tsx`
- [ ] T013 [P] [US1] Create widget style selector with live previews in `components/teleprompter/music/settings/WidgetStyleSelector.tsx`
- [ ] T014 [US1] Create main music settings panel component in `components/teleprompter/music/settings/MusicSettingsPanel.tsx` (integrates all inputs, uses store)
- [ ] T015 [US1] Add vinyl speed selector (33⅓, 45, 78, custom BPM) in `components/teleprompter/music/settings/VinylSpeedSelector.tsx`
- [ ] T016 [US1] Integrate music settings into existing settings page (modify settings routing/navigation to include music tab)
- [ ] T017 [US1] Add Supabase Storage upload/delete functions in `lib/supabase/storage.ts` (uploadAudioFile, deleteAudioFile, getAudioStorageUsage)

**Checkpoint**: At this point, User Story 1 should be fully functional - users can configure music and select widget style in settings

---

## Phase 4: User Story 2 - Floating Draggable Widget in Runner Mode (Priority: P2)

**Goal**: Display floating music player widget in Runner mode with drag-and-drop positioning and play/pause controls

**Independent Test**: Enter Runner mode with configured music source, verify widget appears, drag to different positions, use play/pause controls, confirm position persistence

### Implementation for User Story 2

- [ ] T018 [P] [US2] Create main widget component with drag handling in `components/teleprompter/music/MusicPlayerWidget.tsx`
- [ ] T019 [P] [US2] Create Capsule style widget with glassmorphic design in `components/teleprompter/music/styles/CapsuleWidget.tsx`
- [ ] T020 [P] [US2] Create Vinyl style widget with rotating record in `components/teleprompter/music/styles/VinylWidget.tsx`
- [ ] T021 [P] [US2] Create Spectrum style widget with frequency bars in `components/teleprompter/music/styles/SpectrumWidget.tsx`
- [ ] T022 [US2] Add hidden ReactPlayer for YouTube playback in `components/teleprompter/music/MusicPlayerWidget.tsx`
- [ ] T023 [US2] Add audio element for uploaded file playback in `components/teleprompter/music/MusicPlayerWidget.tsx`
- [ ] T024 [US2] Integrate widget into Runner component in `components/teleprompter/Runner.tsx` (conditional render when isConfigured)
- [ ] T025 [US2] Add 'M' keyboard shortcut handler in `hooks/useKeyboardShortcuts.ts` (toggle playback when configured)
- [ ] T026 [US2] Implement position constraint logic in `lib/music/widgetDimensions.ts` (keep 50% widget visible in viewport)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - users can configure music AND see/play it in Runner mode

---

## Phase 5: User Story 3 - Audio Visualization & Style-Specific Animations (Priority: P3)

**Goal**: Implement unique animations for each widget style (pulsing glow for Capsule, rotating vinyl for Vinyl, animated frequency bars for Spectrum)

**Independent Test**: Select each widget style in settings, enter Runner mode, verify correct visual style appears with unique animations for play/pause states

### Implementation for User Story 3

- [ ] T027 [P] [US3] Add pulsing glow animation to Capsule widget using Framer Motion in `components/teleprompter/music/styles/CapsuleWidget.tsx`
- [ ] T028 [P] [US3] Add reduced opacity "sleeping" state to Capsule widget when paused in `components/teleprompter/music/styles/CapsuleWidget.tsx`
- [ ] T029 [P] [US3] Implement continuous rotation animation for Vinyl widget in `components/teleprompter/music/styles/VinylWidget.tsx`
- [ ] T030 [P] [US3] Implement gradual deceleration animation when Vinyl widget is paused in `components/teleprompter/music/styles/VinylWidget.tsx`
- [ ] T031 [US3] Add simulated frequency bar animation for YouTube sources in `components/teleprompter/music/styles/SpectrumWidget.tsx`
- [ ] T032 [US3] Add real Web Audio API frequency analysis for uploaded files in `components/teleprompter/music/styles/SpectrumWidget.tsx`
- [ ] T033 [US3] Implement baseline flat line state when Spectrum widget is paused in `components/teleprompter/music/styles/SpectrumWidget.tsx`
- [ ] T034 [US3] Add `prefers-reduced-motion` detection and disable/reduce animations across all styles in respective widget components

**Checkpoint**: All user stories should now be independently functional - complete music player widget with all three visual styles

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T035 [P] Add error inline indicators and toast notifications using Sonner in `components/teleprompter/music/MusicPlayerWidget.tsx`
- [ ] T036 [P] Add reconfigure button that navigates to settings in `components/teleprompter/music/MusicPlayerWidget.tsx`
- [ ] T037 [P] Add ARIA labels and accessibility attributes to all widget components (screen reader support, keyboard navigation)
- [ ] T038 [P] Add touch support for mobile drag interactions in `components/teleprompter/music/MusicPlayerWidget.tsx`
- [ ] T039 [P] Implement dynamic z-index management to bring widget to front when clicked in `components/teleprompter/music/MusicPlayerWidget.tsx`
- [ ] T040 Add widget CSS classes to Tailwind config in `tailwind.config.ts` (animation variants, style-specific classes)
- [ ] T041 Add cross-browser compatibility checks (BroadcastChannel support detection) in `lib/music/broadcastChannel.ts`
- [ ] T042 Verify localStorage persistence works across browser sessions (test manual flow)
- [ ] T043 Verify Supabase cloud sync works when authenticated (test manual flow)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Uses same store but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Builds on widget components from US2 but can be tested independently

### Within Each User Story

- US1: All components can be built in parallel (T011-T013), then integrated (T014-T017)
- US2: Widget styles can be built in parallel (T019-T021), then integrated (T018, T022-T026)
- US3: Style animations can be added in parallel (T027-T030 for Capsule/Vinyl, T031-T033 for Spectrum), then reduced motion support (T034)

### Parallel Opportunities

- Phase 1: All directory creation tasks (T002-T005) can run in parallel
- Phase 2: Utility tasks (T007-T008) can run in parallel after T006
- US1: Input components (T011-T013) can run in parallel
- US2: Style components (T019-T021) can run in parallel
- US3: Animation tasks (T027-T030) can run in parallel
- Phase 6: Most polish tasks (T035-T039) can run in parallel

---

## Parallel Example: User Story 2

```bash
# Launch all widget styles together:
Task T019: "Create Capsule style widget with glassmorphic design in components/teleprompter/music/styles/CapsuleWidget.tsx"
Task T020: "Create Vinyl style widget with rotating record in components/teleprompter/music/styles/VinylWidget.tsx"
Task T021: "Create Spectrum style widget with frequency bars in components/teleprompter/music/styles/SpectrumWidget.tsx"

# Then integrate them together:
Task T018: "Create main widget component with drag handling in components/teleprompter/music/MusicPlayerWidget.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (music configuration in settings)
4. Complete Phase 4: User Story 2 (widget in Runner mode with basic styles)
5. **STOP and VALIDATE**: Test music configuration → enter Runner → play/pause → drag widget
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Configure music works → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Play music in Runner → Deploy/Demo
4. Add User Story 3 → Test independently → Enhanced visual styles → Deploy/Demo
5. Add Polish → Final polish and cross-cutting improvements → Deploy/Demo
6. Each phase adds value without breaking previous phases

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (settings UI)
   - Developer B: User Story 2 (widget component + styles)
   - Developer C: User Story 3 (animations)
3. Stories complete and integrate independently

---

## Task Count Summary

- **Phase 1 (Setup)**: 5 tasks
- **Phase 2 (Foundational)**: 5 tasks (BLOCKS all user stories)
- **Phase 3 (User Story 1)**: 7 tasks
- **Phase 4 (User Story 2)**: 9 tasks
- **Phase 5 (User Story 3)**: 8 tasks
- **Phase 6 (Polish)**: 9 tasks
- **Total**: 43 tasks

### Parallel Opportunities

- **Phase 1**: 4 parallel tasks
- **Phase 2**: 2 parallel tasks
- **US1**: 3 parallel tasks
- **US2**: 3 parallel tasks
- **US3**: 4 parallel tasks
- **Polish**: 5 parallel tasks

---

## MVP Scope Recommendation

**Minimum Viable Product**: User Story 1 + User Story 2 (Phases 1-4)

- 26 tasks total
- Enables music configuration in settings
- Displays and plays music in Runner mode
- Draggable widget with position persistence
- Play/pause controls and keyboard shortcut

**Optional Enhancement**: User Story 3 (Phase 5)

- 8 additional tasks
- Adds visual delight with unique animations
- Spectrum visualization for uploaded files
- Vinyl rotation with deceleration
- Capsule pulsing glow effect

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Supabase Storage bucket setup (T001) requires manual SQL execution in Supabase dashboard
- ReactPlayer must be loaded with `ssr: false` due to client-side only rendering
- BroadcastChannel gracefully degrades on Safari < 15.4 - no special handling needed
- Web Audio API for spectrum visualization only works with uploaded files (YouTube CORS limitation)
