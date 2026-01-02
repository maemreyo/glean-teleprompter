# Implementation Plan: Fix Preview Inconsistency

**Branch**: `009-fix-preview` | **Date**: 2026-01-02 | **Spec**: [`spec.md`](spec.md)
**Input**: Feature specification from `/specs/009-fix-preview/spec.md`

## Summary

**Primary Requirement**: Fix visual inconsistency between [`PreviewPanel`](../../components/teleprompter/editor/PreviewPanel.tsx) and [`FullPreviewDialog`](../../components/teleprompter/editor/FullPreviewDialog.tsx). The `FullPreviewDialog` component doesn't display background images because it doesn't access `bgUrl` from [`useContentStore`](../../lib/stores/useContentStore.ts), while `PreviewPanel` correctly implements this functionality.

**Technical Approach**: Update `FullPreviewDialog` to subscribe to `bgUrl` from the Zustand-based [`useContentStore`](../../lib/stores/useContentStore.ts) and apply the background image style using memoization. Both components will consume the same state source, ensuring visual consistency and real-time updates.

**Key Changes**:
1. Extract `bgUrl` from `useContentStore` in `FullPreviewDialog`
2. Create memoized `backgroundStyle` using `useMemo`
3. Apply style to the background image div

**Impact**: Minimal code change with maximum impact - users will see consistent background images in both preview modes.

## Technical Context

**Language/Version**: TypeScript 5.3+ (strict mode) + React 18.2+, Next.js 14+
**Primary Dependencies**: Zustand 4.4+, Supabase 2.39+, Tailwind CSS, shadcn/ui, Radix UI components, Framer Motion, Sonner (toasts)
**Storage**: localStorage for persistence (primary), Supabase (optional cloud backup)
**Testing**: Jest 29+, React Testing Library 13+, Node.js 18+
**Target Platform**: Web browser (desktop and mobile)
**Project Type**: Web application (frontend-only change)
**Performance Goals**: 100ms update latency for background changes (for images up to 5MB)
**Constraints**: Handle invalid URLs gracefully, show loading states for large images
**Scale/Scope**: Single component change affecting two preview modes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Based on the [Glean Teleprompter Constitution](../../.specify/memory/constitution.md):

### I. User Experience First ✅
- **Gate**: Preview consistency directly improves user experience
- **Verification**: Both preview modes will display identically, building user trust

### II. Performance & Reliability ✅
- **Gate**: Must maintain 100ms update latency for background changes
- **Verification**: Memoization with `useMemo` ensures efficient re-renders

### III. Security & Privacy ✅
- **Gate**: No new security concerns (component only reads existing state)
- **Verification**: URLs are already validated by existing code paths

### IV. Code Quality & Testing ✅
- **Gate**: TypeScript strict mode, comprehensive testing required
- **Verification**: Unit tests for store subscription, integration tests for visual consistency

### V. Technology Standards ✅
- **Gate**: Must use existing Zustand store, React hooks, Tailwind CSS
- **Verification**: Implementation follows established patterns from `PreviewPanel`

**Result**: All gates passed. No constitutional violations.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

This is a Next.js web application with a unified frontend/backend structure. The feature primarily affects the editor preview components.

```text
glean-teleprompter/
├── components/
│   └── teleprompter/
│       └── editor/
│           ├── PreviewPanel.tsx           # Working reference implementation
│           └── FullPreviewDialog.tsx      # Component to be modified
├── lib/
│   └── stores/
│       └── useContentStore.ts            # Zustand store providing bgUrl
├── __tests__/
│   ├── unit/
│   │   └── components/
│   │       └── FullPreviewDialog.test.tsx # New test file to be created
│   └── integration/
│       └── preview-consistency.test.tsx   # Integration test for both previews
├── app/
│   └── dashboard/
│       └── page.tsx                       # Studio page using preview components
└── specs/
    └── 009-fix-preview/
        ├── spec.md                        # Feature specification
        ├── plan.md                        # This file
        ├── research.md                    # Implementation research
        ├── data-model.md                  # Data model documentation
        └── quickstart.md                  # Developer quickstart guide
```

**Structure Decision**: This is a Next.js application with App Router. The feature is a frontend-only change affecting two React components in the editor preview system. The state source (Zustand store) already exists and requires no modifications.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitutional violations. This is a straightforward bug fix with minimal complexity:

- **Scope**: Single component modification
- **Risk**: Low (existing working reference implementation)
- **Dependencies**: None (uses existing store)
- **Testing**: Standard unit and integration tests

No additional complexity tracking required.
