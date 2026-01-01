# Implementation Plan: Auto-save Improvements

**Branch**: `006-autosave-improvements` | **Date**: 2026-01-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-autosave-improvements/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Consolidate dual auto-save systems into a single unified mechanism that saves all 11 teleprompter properties atomically, eliminating race conditions and data loss. Add beforeunload handler for protected page closes, implement data migration with schema versioning, improve storage quota exceeded handling, detect private browsing mode, and provide a draft management interface. The solution uses localStorage for local drafts with optional Supabase cloud backup, meets WCAG 2.1 Level AA accessibility standards, and maintains backward compatibility through schema migrations.

## Technical Context

**Language/Version**: TypeScript 5.3+ (strict mode)
**Primary Dependencies**: React 18.2+, Next.js 14+, Zustand 4.4+, Framer Motion, Sonner (toasts), Supabase 2.39+, Tailwind CSS, shadcn/ui
**Storage**: localStorage (primary draft storage), Supabase (optional cloud backup)
**Testing**: Jest 29+, React Testing Library 13+, Node.js 18+
**Target Platform**: Web browser (Chrome/Edge ~10MB localStorage, Safari ~5MB, Firefox ~10MB)
**Project Type**: web (Next.js App Router application)
**Performance Goals**: Auto-save operations <200ms, save status updates <500ms, non-blocking saves, beforeunload handler <100ms
**Constraints**: WCAG 2.1 Level AA compliance, localStorage quota limits, private browsing mode limitations, session-only storage detection
**Scale/Scope**: Single-user local drafts with typical script content <50,000 characters, 30-day draft retention, 5-second periodic save interval

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: User Experience First ✓
- **Requirement**: Intuitive auto-save with clear visual feedback
- **Implementation**: Single unified auto-save system, visible save status indicators, draft management UI
- **Status**: PASS - Spec includes comprehensive UI/UX requirements for save status, private browsing warnings, and draft management

### Principle II: Performance & Reliability ✓
- **Requirement**: Smooth, non-blocking save operations
- **Implementation**: Debounced 1-second save, 5-second periodic save, <200ms save operations, beforeunload protection
- **Status**: PASS - Performance goals defined (SC-007: <200ms saves, SC-002: <100ms beforeunload)

### Principle III: Security & Privacy ✓
- **Requirement**: Secure data handling with proper error handling
- **Implementation**: Private browsing detection, clear warnings about data persistence, Supabase integration for authenticated saves
- **Status**: PASS - Spec includes private browsing warnings (FR-006) and secure cloud save option

### Principle IV: Code Quality & Testing ✓
- **Requirement**: TypeScript strict mode, comprehensive testing
- **Implementation**: TypeScript 5.3+ strict mode, Jest + RTL tests for all components, unit tests for migrations
- **Status**: PASS - Spec requires testing for auto-save, conflict detection, migrations, and accessibility

### Principle V: Technology Standards ✓
- **Requirement**: Next.js, Supabase, Tailwind CSS, shadcn/ui
- **Implementation**: Uses existing Next.js 14+ architecture, integrates with Supabase, Tailwind styling, shadcn/ui components
- **Status**: PASS - All dependencies align with constitution requirements

### Technology Stack Requirements ✓
- Next.js 14+ with App Router: Required (existing architecture)
- Supabase for backend: Required (cloud save functionality)
- Tailwind CSS for styling: Required (existing setup)
- shadcn/ui for components: Required (draft management UI, toasts, dialogs)
- TypeScript for type safety: Required (strict mode enforced)
- Vercel deployment: Required (existing deployment)

**PRE-DESIGN GATE RESULT**: ✓ PASS - All constitutional principles satisfied. No violations requiring justification.

### Post-Design Re-evaluation (Phase 1)

#### Principle I: User Experience First ✓
- **Design Verification**:
  - Draft management UI with keyboard navigation and ARIA labels (contracts/hooks-api.md)
  - Save status component with visual feedback (research.md section 8)
  - Private browsing warning banner (research.md section 2)
  - Storage quota warning with actionable recovery options (research.md section 3)
- **Status**: ✓ PASS - Design fully addresses UX requirements with accessible, user-friendly interfaces

#### Principle II: Performance & Reliability ✓
- **Design Verification**:
  - Debounced save (1s) + periodic save (5s) for balance (research.md section 1)
  - Performance targets: <200ms saves, <500ms status updates, <100ms beforeunload (Technical Context)
  - Non-blocking saves using requestIdleCallback (research.md section 1)
  - Error handling preserves data on failures (data-model.md)
- **Status**: ✓ PASS - Performance requirements met with defensive programming

#### Principle III: Security & Privacy ✓
- **Design Verification**:
  - Private browsing detection with multi-layered defense (research.md section 2)
  - Secure Supabase integration with error-specific messages (research.md section 10)
  - No unnecessary data logging or storage (data-model.md)
  - Local drafts preserved on cloud save failures (contracts/storage-api.md)
- **Status**: ✓ PASS - Privacy respected with secure cloud backup option

#### Principle IV: Code Quality & Testing ✓
- **Design Verification**:
  - TypeScript 5.3+ strict mode enforced (Technical Context)
  - Comprehensive test coverage: 6 unit tests + 5 integration tests defined (quickstart.md)
  - Test patterns documented in contracts (storage-api.md, hooks-api.md)
  - Mocked localStorage for consistent testing (research.md section 9)
- **Status**: ✓ PASS - Quality standards met with extensive test planning

#### Principle V: Technology Standards ✓
- **Design Verification**:
  - Next.js 14+ App Router (Technical Context)
  - Supabase 2.39+ for cloud saves (contracts/storage-api.md)
  - Tailwind CSS + shadcn/ui for UI components (contracts/hooks-api.md)
  - All dependencies align with constitution (agent context updated)
- **Status**: ✓ PASS - Technology stack fully compliant

#### Technology Stack Requirements ✓
- ✓ Next.js 14+ with App Router
- ✓ Supabase for backend services
- ✓ Tailwind CSS for styling
- ✓ shadcn/ui for components
- ✓ TypeScript for type safety
- ✓ Vercel deployment

**FINAL GATE RESULT**: ✓ PASS - All constitutional principles satisfied post-design. No violations or deviations introduced during design phase.

---

## Design Verification Summary

| Constitutional Principle | Pre-Design | Post-Design | Notes |
|--------------------------|------------|-------------|-------|
| I. User Experience First | ✓ PASS | ✓ PASS | UI components fully designed with accessibility |
| II. Performance & Reliability | ✓ PASS | ✓ PASS | Performance targets defined in contracts |
| III. Security & Privacy | ✓ PASS | ✓ PASS | Privacy-first design with optional cloud sync |
| IV. Code Quality & Testing | ✓ PASS | ✓ PASS | Comprehensive test strategy documented |
| V. Technology Standards | ✓ PASS | ✓ PASS | All technologies compliant |
| Technology Stack | ✓ PASS | ✓ PASS | Agent context updated successfully |

## Project Structure

### Documentation (this feature)

```text
specs/006-autosave-improvements/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Web application (Next.js 14+ App Router)
hooks/
├── useAutoSave.ts                    # Unified auto-save hook (refactored)
└── useDraftManagement.ts             # NEW: Draft management hook

lib/
├── storage/
│   ├── draftStorage.ts               # NEW: LocalStorage draft operations
│   ├── draftMigration.ts             # NEW: Schema migration system
│   └── storageQuota.ts               # NEW: Quota detection & management
├── utils/
│   └── privateBrowsing.ts            # NEW: Private browsing detection
└── a11y/
    └── ariaLabels.ts                 # UPDATE: Add draft management labels

components/teleprompter/
├── config/
│   └── ui/
│       ├── AutoSaveStatus.tsx        # UPDATE: Enhanced save status component
│       ├── PrivateBrowsingWarning.tsx # NEW: Private browsing banner
│       └── StorageQuotaWarning.tsx    # NEW: Quota exceeded warning
└── editor/
    └── DraftManagementDialog.tsx     # NEW: Draft list/restore/delete UI

__tests__/
├── unit/
│   ├── hooks/
│   │   ├── useAutoSave.test.ts       # UPDATE: Unified auto-save tests
│   │   └── useDraftManagement.test.ts # NEW: Draft management tests
│   ├── storage/
│   │   ├── draftStorage.test.ts      # NEW: LocalStorage operations tests
│   │   ├── draftMigration.test.ts    # NEW: Migration tests
│   │   └── storageQuota.test.ts      # NEW: Quota management tests
│   └── utils/
│       └── privateBrowsing.test.ts   # NEW: Detection tests
└── integration/
    ├── autosave/
    │   ├── unified-save.test.tsx     # NEW: Single save system tests
    │   ├── beforeunload.test.tsx     # NEW: Page close protection tests
    │   └── conflict-detection.test.tsx # NEW: Multi-tab conflict tests
    └── draft-management/
        ├── draft-list.test.tsx       # NEW: Draft management UI tests
        └── restore-delete.test.tsx   # NEW: Draft operations tests
```

**Structure Decision**: Web application structure (Next.js 14+ App Router). The feature extends the existing hooks, lib utilities, and components structure. New hooks for auto-save unification and draft management, new lib modules for storage operations, migrations, and quota management, updated UI components for save status and warnings, and new draft management dialog. Comprehensive test coverage at unit and integration levels.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
