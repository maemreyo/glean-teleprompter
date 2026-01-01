# Implementation Plan: Unified State Architecture

**Branch**: `007-unified-state-architecture` | **Date**: 2026-01-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-unified-state-architecture/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Unify the teleprompter state architecture by creating a clean separation of concerns across four Zustand stores: useContentStore for content data (text, bgUrl, musicUrl), useConfigStore for all styling configuration, usePlaybackStore for runtime playback state, and useUIStore for UI navigation state. Remove the legacy useTeleprompterStore entirely and update the Runner component to consume useConfigStore for styling, ensuring 100% visual consistency between Editor preview and Runner display. Add a Quick Settings panel to Runner for common adjustments (scroll speed, font size, alignment, background) with immediate synchronization to Editor via Zustand's pub/sub mechanism.

## Technical Context

**Language/Version**: TypeScript 5.3+ (strict mode)
**Primary Dependencies**: React 18.2+, Next.js 14+, Zustand 4.4+, Supabase 2.39+, Tailwind CSS, shadcn/ui, Radix UI components, Framer Motion, Sonner (toasts)
**Storage**: localStorage for persistence (primary), Supabase (optional cloud backup)
**Testing**: Jest 29+, React Testing Library 13+
**Target Platform**: Web (browser-based teleprompter application)
**Project Type**: Single web application with frontend/backend in monorepo
**Performance Goals**: 
  - State synchronization within 100ms between Editor and Runner
  - 60fps smooth text scrolling
  - Sub-100ms UI interactions
**Constraints**:
  - Must maintain backward compatibility during migration
  - No legacy data migration (app unpublished)
  - Must follow single responsibility principle for stores
**Scale/Scope**: 
  - 4 Zustand stores to manage
  - Removal of 1 legacy store (useTeleprompterStore)
  - Updates to 2 major components (Editor, Runner)
  - Updates to ~50+ test files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Evaluation (Before Phase 0)

### I. User Experience First ✓
- **GATE**: Visual consistency between Editor and Runner must be 100% accurate
- **GATE**: Quick Settings panel must be intuitive and accessible in Runner
- **GATE**: State changes must reflect immediately (within 100ms)

### II. Performance & Reliability ✓
- **GATE**: State synchronization must use Zustand's optimized pub/sub, not manual polling
- **GATE**: Error handling must revert UI state on failed Quick Settings actions
- **GATE**: localStorage persistence must be reliable across store migrations

### III. Security & Privacy ✓
- **GATE**: No user data logged during state management operations
- **GATE**: localStorage keys must be namespaced appropriately

### IV. Code Quality & Testing ✓
- **GATE**: All stores must use TypeScript strict mode with proper type definitions
- **GATE**: Each store must have single responsibility with no overlapping concerns
- **GATE**: All tests must be updated incrementally as code is migrated
- **GATE**: Tests must cover store interactions, state synchronization, and error scenarios

### V. Technology Standards ✓
- **GATE**: Must use Zustand 4.4+ for state management
- **GATE**: Must use shadcn/ui and Radix components for Quick Settings panel
- **GATE**: Must use Sonner for toast notifications
- **GATE**: Must use Tailwind CSS for styling

**Pre-Design Constitution Status**: ✓ PASSED - All gates satisfied

---

### Post-Design Evaluation (After Phase 1)

#### I. User Experience First ✓
- **Design Decision**: Four-store architecture ensures clear separation, making state predictable and easier to debug
- **Quick Settings Panel**: Collapsible floating panel using Radix UI provides accessible, non-intrusive access to common settings
- **State Sync**: Zustand's built-in pub/sub ensures <100ms synchronization between Editor and Runner
- **Visual Indication**: Dual indicators (badge + color change) ensure users know when Runner changes affect Editor
- **Status**: ✓ SATISFIED

#### II. Performance & Reliability ✓
- **State Synchronization**: Uses Zustand's optimized React hooks integration, no polling needed
- **Error Handling**: QuickSettingsPanel includes try/catch blocks with toast notifications and UI reversion
- **Persistence**: Three stores persist via Zustand persist middleware with proper namespacing
- **Runtime State**: PlaybackStore does not persist (intentional design - resets on refresh)
- **Status**: ✓ SATISFIED

#### III. Security & Privacy ✓
- **No Logging**: Store implementations do not log user data
- **localStorage Keys**: Properly namespaced (`teleprompter-content`, `teleprompter-config`, `teleprompter-ui-store`)
- **No Tracking**: No analytics or tracking in store implementations
- **Status**: ✓ SATISFIED

#### IV. Code Quality & Testing ✓
- **TypeScript**: All stores use strict mode with comprehensive type definitions
- **Single Responsibility**: Each store has clear, non-overlapping purpose:
  - useContentStore: Content data only
  - useConfigStore: Styling configuration only
  - usePlaybackStore: Runtime playback state only
  - useUIStore: UI navigation and visibility only
- **Test Strategy**: Incremental migration with mock files for all stores
- **Coverage**: Tests will cover store actions, state transitions, validation, and component integration
- **Status**: ✓ SATISFIED

#### V. Technology Standards ✓
- **State Management**: Zustand 4.4+ with persist middleware
- **UI Components**: Radix UI (Dialog, Slider) wrapped by shadcn/ui
- **Toast Notifications**: Sonner for error feedback
- **Styling**: Tailwind CSS for all component styling
- **New Technologies Added**:
  - Radix UI primitives (Dialog, Slider)
  - Sonner (toast notifications)
- **Status**: ✓ SATISFIED

**Post-Design Constitution Status**: ✓ PASSED - All gates satisfied with design decisions

**Overall Constitution Status**: ✓ PASSED - No violations, no justifications needed

## Project Structure

### Documentation (this feature)

```text
specs/007-unified-state-architecture/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── store-contracts.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
lib/stores/
├── useConfigStore.ts        # Existing - will be extended with all styling
├── useUIStore.ts            # Existing - will add mode property
├── useContentStore.ts       # NEW - content data (text, bgUrl, musicUrl, isReadOnly)
├── usePlaybackStore.ts      # NEW - playback state (isPlaying, currentTime, scrollSpeed)
└── useTeleprompterStore.ts  # DEPRECATED - to be completely removed

components/teleprompter/
├── editor/
│   ├── ContentPanel.tsx         # Will use useContentStore + useConfigStore
│   └── PreviewPanel.tsx         # Will use useContentStore + useConfigStore
├── display/
│   └── TeleprompterText.tsx     # Will use useConfigStore for styling
└── runner/
    └── Runner.tsx               # Will use useConfigStore + usePlaybackStore + QuickSettingsPanel
```

**Structure Decision**: This is a single web application following the established project structure. The new stores will be created in `lib/stores/` alongside existing stores. Components will be updated to consume the appropriate stores based on their responsibility. No new directories are required - we're refactoring existing state management within the current structure.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | All constitution gates passed | No violations to justify |
