# Implementation Plan: Floating Music Player Widget

**Branch**: `011-music-player-widget` | **Date**: 2026-01-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-music-player-widget/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

---

## Summary

This feature implements a floating music player widget for background music playback in Runner mode. Users can configure music from YouTube URLs or uploaded audio files, with three visual styles (Capsule, Vinyl, Spectrum) featuring unique animations. The widget is draggable with inertia physics, persists position across sessions, and synchronizes playback state across multiple browser tabs using BroadcastChannel API. Configuration is stored in localStorage and optionally synced to Supabase cloud storage.

**Technical Approach**: 
- ReactPlayer for YouTube playback (existing pattern)
- Web Audio API for spectrum visualization (uploaded files only)
- BroadcastChannel API for cross-tab sync
- Zustand store with persist middleware for state management
- Framer Motion for animations and drag physics
- Supabase Storage for audio file hosting (50MB/file, 500MB total quota)

---

## Technical Context

**Language/Version**: TypeScript 5.3+ (strict mode) + React 18.2+, Next.js 14+
**Primary Dependencies**: Zustand 4.4+, Framer Motion, Sonner (toasts), ReactPlayer, Supabase 2.39+, Tailwind CSS, shadcn/ui
**Storage**: localStorage (primary, <1KB), Supabase Storage (audio files, 50MB/file, 500MB total)
**Testing**: Jest 29+, React Testing Library 13+, Node.js 18+
**Target Platform**: Web browser (Chrome 54+, Firefox 38+, Safari 15.4+, Edge 79+)
**Project Type**: Web application (Next.js frontend)
**Performance Goals**: 60fps widget drag response, <100ms keyboard shortcut response, <5s cloud sync
**Constraints**: Cross-tab sync requires BroadcastChannel API (Safari < 15.4 graceful degradation), YouTube CORS limits spectrum to simulated animation
**Scale/Scope**: Single audio track per session, three widget styles, configuration persists across sessions

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. User Experience First
**Status**: ✅ PASS

- **Intuitive Controls**: Single play/pause button, drag handle, keyboard shortcut ('M' key)
- **Real-time Feedback**: Visual animations sync to playback state (pulse, rotate, spectrum)
- **Smooth Scrolling**: Widget uses Framer Motion with inertia physics, 60fps target (SC-004: SC-007)
- **Responsive Design**: Style-specific dimensions with mobile scaling (research.md:463-614)
- **Desktop & Mobile**: Touch and mouse input support, responsive sizing

### II. Performance & Reliability
**Status**: ✅ PASS

- **Smooth Scrolling**: Widget drag targets 60fps (16ms response), minimal DOM manipulation (SC-004)
- **Low-Latency Audio**: Direct audio element for uploads, hidden ReactPlayer iframe for YouTube
- **Responsive UI**: Framer Motion animations, reduced motion preference support
- **Error Handling**: Comprehensive error types with inline indicators + Sonner toasts (research.md:618-760)
- **Data Persistence**: localStorage immediate save on drag, Supabase cloud sync within 5s (SC-003)

### III. Security & Privacy
**Status**: ✅ PASS

- **Supabase Auth**: Existing authentication used for file access control
- **Secure Storage**: RLS policies on `user-audio-files` bucket (userId-based)
- **No Logging**: No user data logged beyond Supabase's built-in audit
- **CORS Compliance**: YouTube respects browser CORS policies, uploaded files have full CORS control

### IV. Code Quality & Testing
**Status**: ✅ PASS

- **TypeScript Strict Mode**: All code uses TypeScript 5.3+ with strict mode
- **Well-Tested**: Unit tests for store, validation, BroadcastChannel; integration tests for drag/sync
- **Clean Architecture**: Separation of concerns (store, components, validation, utilities)
- **Zustand Pattern**: Follows existing [`usePlaybackStore.ts`](../../lib/stores/usePlaybackStore.ts) pattern

### V. Technology Standards
**Status**: ✅ PASS

- **Next.js 14+**: Used for routing and SSR
- **Supabase**: Used for auth, data, and storage
- **Tailwind CSS**: Used for styling
- **shadcn/ui**: Used for UI components
- **Dependencies Up-to-Date**: All packages are current versions

**Gate Result**: ✅ ALL PASSED - Proceed to Phase 0

---

## Project Structure

### Documentation (this feature)

```text
specs/011-music-player-widget/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (technical research complete)
├── data-model.md        # Phase 1 output (data model complete)
├── quickstart.md        # Phase 1 output (quick start guide complete)
├── contracts/           # Phase 1 output (all contracts complete)
│   ├── music-player-store.md      # Zustand store interface
│   ├── music-player-widget.md     # Widget component interface
│   ├── broadcast-channel.md       # Tab sync protocol
│   └── audio-source-validation.md # Validation schemas
└── checklists/          # Testing checklists (created separately)
    └── requirements.md  # Requirements checklist
```

### Source Code (repository root)

```text
lib/
  stores/
    useMusicPlayerStore.ts          # Zustand store with persistence & BroadcastChannel
  music/
    broadcastChannel.ts              # BroadcastChannel manager
    audioSourceValidation.ts         # URL and file validation
    widgetDimensions.ts              # Widget size constants

components/teleprompter/music/
  MusicPlayerWidget.tsx              # Main widget component (handles drag & style routing)
  styles/
    CapsuleWidget.tsx                # Capsule style implementation
    VinylWidget.tsx                  # Vinyl style implementation
    SpectrumWidget.tsx               # Spectrum style implementation
  settings/
    MusicSettingsPanel.tsx           # Settings UI (source selection, style picker)
    WidgetStyleSelector.tsx          # Style selector with live previews
    YouTubeUrlInput.tsx              # YouTube URL input with validation
    FileUploadInput.tsx              # File upload with quota management

__tests__/
  unit/stores/
    musicPlayerStore.test.ts         # Store actions & persistence tests
  unit/music/
    audioSourceValidation.test.ts    # URL & file validation tests
    broadcastChannel.test.ts         # Tab sync tests
  integration/music/
    widgetDrag.test.tsx              # Drag & drop persistence tests
    crossTabSync.test.tsx            # Multi-tab playback coordination
```

**Structure Decision**: Web application structure (Option 2) - follows existing Next.js frontend pattern. New music components integrate with existing Runner component at [`components/teleprompter/Runner.tsx`](../../components/teleprompter/Runner.tsx).

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. All constitutional principles are satisfied with standard patterns.

---

## Phase Summary

### Phase 0: Research ✅ COMPLETE
**Output**: [`research.md`](./research.md)

Researched 7 technical unknowns:
1. YouTube Audio → ReactPlayer (existing pattern)
2. Spectrum Visualizer → Hybrid (simulated for YouTube, real for uploads)
3. Storage Quota → Supabase Storage (50MB/file, 500MB total)
4. Tempo Detection → Manual BPM with RPM presets
5. Tab Communication → New BroadcastChannel API
6. Widget Dimensions → Style-specific sizes defined
7. Error Recovery → Sonner toast (existing pattern)

### Phase 1: Design ✅ COMPLETE
**Outputs**: 
- [`data-model.md`](./data-model.md) - Entities, relationships, persistence, state transitions
- [`contracts/`](./contracts/) directory - 4 TypeScript interface contracts
- [`quickstart.md`](./quickstart.md) - Implementation guide

### Phase 2: Tasks (NOT CREATED)
**Output**: `tasks.md` (created by `/speckit.tasks` command - separate workflow)

---

## Next Steps

1. **Run `/speckit.tasks`** to generate `tasks.md` with implementation tasks
2. **Update agent context** with: `.specify/scripts/bash/update-agent-context.sh roo`
3. **Begin implementation** following the task list

---

## Implementation Order

1. Set up Supabase Storage bucket (`user-audio-files`) with RLS policies
2. Implement validation utilities (`audioSourceValidation.ts`)
3. Create Zustand store (`useMusicPlayerStore.ts`) with BroadcastChannel
4. Build widget component (`MusicPlayerWidget.tsx`) with three styles
5. Create settings UI (`MusicSettingsPanel.tsx`, style selector, inputs)
6. Integrate widget into Runner component
7. Add keyboard shortcut ('M' key) to existing shortcuts handler
8. Write tests for all components and utilities
9. Test cross-browser compatibility

---

**Document Status**: ✅ Planning Complete  
**Ready for**: `/speckit.tasks` command (generate implementation tasks)
