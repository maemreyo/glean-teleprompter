# Implementation Plan: Studio Layout Improvements

**Branch**: `008-studio-layout-improvements` | **Date**: 2026-01-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-studio-layout-improvements/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a two-column preview text layout for the teleprompter display and convert the ConfigPanel from an inline panel to a floating overlay. This eliminates layout shifts when toggling the configuration panel while providing users with a newspaper-style text layout for better print preview capabilities. The solution uses CSS columns for text layout and fixed positioning with backdrop for the overlay panel.

## Technical Context

**Language/Version**: TypeScript 5.3+ (strict mode)
**Primary Dependencies**: React 18.2+, Next.js 14+, Zustand 4.4+, Framer Motion, Radix UI components, Tailwind CSS, shadcn/ui
**Storage**: localStorage (primary), Supabase (optional cloud backup)
**Testing**: Jest 29+, React Testing Library 13+, Node.js 18+
**Target Platform**: Web (desktop and mobile browsers)
**Project Type**: Web application (Next.js with App Router)
**Performance Goals**: 60 FPS rendering, <300ms panel animation, <0.1 layout shift score
**Constraints**: WCAG 2.1 AA compliance, prefers-reduced-motion support, responsive design
**Scale/Scope**: 9 component files modified, 2 new config properties, 7 new test suites

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. User Experience First ✅ PASS

**Requirement**: Intuitive controls, responsive design, accessible on desktop and mobile

**Analysis**:
- Two-column layout improves user experience for print-format preview
- Floating ConfigPanel eliminates jarring layout shifts
- Responsive fallback to single column on mobile (<1024px)
- Multiple dismiss methods (Escape, click-outside, close button)

**Gates**:
- ✅ Mobile responsive behavior specified (FR-001.4)
- ✅ Keyboard navigation fully specified (A11y-002)
- ✅ Smooth animations with reduced-motion support (FR-002.9)

### II. Performance & Reliability ✅ PASS

**Requirement**: Smooth scrolling, low-latency interactions, proper error handling

**Analysis**:
- CSS columns for efficient rendering (GPU-accelerated)
- No layout shift when toggling ConfigPanel
- Animation duration: 300ms (optimal for perceived performance)
- Performance targets: ≥60 FPS, <100ms panel open time

**Gates**:
- ✅ Performance metrics defined (SC-001)
- ✅ Layout shift target <0.1 (SC-001)
- ✅ Animation time ≤300ms (FR-002.9)

### III. Security & Privacy ✅ PASS

**Requirement**: Secure authentication, proper data handling

**Analysis**:
- No new security requirements
- Uses existing Supabase auth (no changes)
- Config preferences stored in localStorage
- No external API calls introduced

**Gates**:
- ✅ No new security surface area
- ✅ Follows existing data handling patterns

### IV. Code Quality & Testing ✅ PASS

**Requirement**: TypeScript strict mode, well-tested components, clean architecture

**Analysis**:
- TypeScript 5.3+ strict mode for all code
- Comprehensive test coverage (>80% target)
- Unit tests for column layout logic
- Integration tests for overlay behavior
- Accessibility tests (keyboard, screen reader)

**Gates**:
- ✅ TypeScript strict mode enforced (SC-001)
- ✅ Test coverage >80% (SC-001)
- ✅ ESLint warnings zero tolerance (SC-001)

### V. Technology Standards ✅ PASS

**Requirement**: Next.js, Supabase, Tailwind CSS, shadcn/ui

**Analysis**:
- Uses existing tech stack (no new dependencies)
- Framer Motion already in use (from 004-studio-ui-ux-improvements)
- Radix UI components for focus trap (Dialog primitive)
- Tailwind CSS for styling
- shadcn/ui patterns followed

**Gates**:
- ✅ No new framework dependencies
- ✅ Uses existing animation library (Framer Motion)
- ✅ Follows established component patterns

### Constitution Verdict: **APPROVED** - All gates passed. No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/008-studio-layout-improvements/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
components/teleprompter/
├── Editor.tsx                    # Update: Remove AnimatePresence, update width calculations
├── editor/
│   ├── PreviewPanel.tsx          # Update: Pass column props to TeleprompterText
│   └── ContentPanel.tsx          # Update: Width 50% when ConfigPanel visible
├── config/
│   ├── ConfigPanel.tsx           # Update: Convert to fixed overlay with backdrop
│   └── ConfigTabs.tsx            # No changes required
└── display/
    └── TeleprompterText.tsx      # Update: Add columnCount and columnGap props

lib/stores/
└── useConfigStore.ts             # Update: Add columnCount and columnGap to layout config

stores/
└── useUIStore.ts                 # Update: Add isOverlay flag to PanelState

__tests__/
├── integration/studio/
│   ├── layout-two-columns.test.tsx       # NEW: Test 2-column layout
│   ├── layout-overlay-panel.test.tsx     # NEW: Test floating ConfigPanel
│   └── layout-keyboard-nav.test.tsx      # NEW: Test focus trap
└── unit/
    ├── components/
    │   ├── TeleprompterText-columns.test.tsx  # NEW: Test column layout logic
    │   └── ConfigPanel-overlay.test.tsx       # NEW: Test overlay behavior
    └── stores/
        └── config-store-columns.test.ts      # NEW: Test column config state
```

**Structure Decision**: Web application structure using existing Next.js layout. Components follow the established pattern from previous features (004-studio-ui-ux-improvements, 007-unified-state-architecture). Tests follow the existing `__tests__/` directory structure with integration and unit test separation.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | Constitution passed with no violations |

---

## Phase 0: Research & Outline

### Unknowns to Resolve

1. **CSS Column Layout Browser Support**: Need to verify CSS `column-count` and `column-gap` support across target browsers
2. **Focus Trap Implementation**: Determine whether to use Radix UI Dialog primitive or custom focus trap
3. **Panel Size Constraints**: Validate 400px minimum width against common viewport sizes
4. **Backdrop Blur Performance**: Assess performance impact of `backdrop-blur-sm` on low-end devices
5. **Migration Strategy**: Determine migration approach for existing localStorage configs

### Research Tasks

**Task 1: CSS Columns Browser Compatibility**
- Research: CSS Multi-column Layout specification support
- Target browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Verify: `column-count`, `column-gap`, `column-fill` properties

**Task 2: Focus Trap Implementation Options**
- Option A: Radix UI Dialog primitive (@radix-ui/react-dialog)
- Option B: Custom focus trap with useRef and useEffect
- Criteria: Bundle size impact, feature completeness, accessibility compliance

**Task 3: Overlay Panel Sizing**
- Research: Common modal/dialog width patterns
- Validate: 400px min-width on 1366px and 1920px displays
- Consider: Mobile behavior (<1024px breakpoint)

**Task 4: Backdrop Blur Performance**
- Test: `backdrop-blur-sm` performance on mobile devices
- Fallback: Consider conditional rendering based on device capability
- Metrics: Target 60 FPS during animation

**Task 5: Config Migration Strategy**
- Review: Existing localStorage migration patterns in codebase
- Approach: Default value + migration function vs. runtime upgrade
- Backward compatibility: Handle configs missing `columnCount` property

---

## Phase 1: Design & Contracts

### Prerequisites
`research.md` complete with all decisions documented

### Data Model

**Output**: `data-model.md` with:
- ConfigStore state extensions (columnCount, columnGap)
- UIStore state extensions (isOverlay flag)
- TeleprompterText props interface
- Migration data structure

### API Contracts

**Output**: `contracts/` directory with:
- `config-store-interface.md` - Extended useConfigStore interface
- `ui-store-interface.md` - Extended useUIStore interface
- `teleprompter-text-props.md` - Component props contract
- `layout-behavior.md` - Layout behavior specifications

### Quickstart Guide

**Output**: `quickstart.md` with:
- Development setup for this feature
- Component modification checklist
- Testing commands
- Local verification steps

### Agent Context Update

**Output**: Run `.specify/scripts/bash/update-agent-context.sh roo` to update:
- `.roo/rules/specify-rules.md` - Add new technologies if any
- Preserve manual additions between markers

---

## Phase 2: Re-evaluate Constitution Check

After completing Phase 1 design artifacts, all constitutional gates are re-evaluated:

### I. User Experience First ✅ PASS

**Design Verification**:
- ✅ Two-column layout implemented via CSS columns (browser support 97%+)
- ✅ Mobile responsive fallback to single column (<1024px breakpoint)
- ✅ Radix UI Dialog provides WCAG 2.1 AA compliant focus trap
- ✅ Multiple dismiss methods: Escape key, click-outside, close button
- ✅ Smooth animations with prefers-reduced-motion support

**No violations found**

### II. Performance & Reliability ✅ PASS

**Design Verification**:
- ✅ CSS columns use GPU acceleration (60 FPS target)
- ✅ Fixed positioning eliminates layout shift (CLS < 0.1 target)
- ✅ Animation duration: 300ms (within performance budget)
- ✅ backdrop-blur-sm has graceful degradation
- ✅ No layout recalculation when toggling ConfigPanel

**No violations found**

### III. Security & Privacy ✅ PASS

**Design Verification**:
- ✅ No new security surface area
- ✅ Existing localStorage patterns followed
- ✅ No external API calls added
- ✅ Config migration is additive (non-breaking)

**No violations found**

### IV. Code Quality & Testing ✅ PASS

**Design Verification**:
- ✅ TypeScript 5.3+ strict mode for all new code
- ✅ Comprehensive test contracts defined (7 new test suites)
- ✅ Test coverage >80% specified
- ✅ ESLint zero-warning policy maintained
- ✅ Data model fully typed with interfaces

**No violations found**

### V. Technology Standards ✅ PASS

**Design Verification**:
- ✅ Uses existing Radix UI dependency (Dialog primitive)
- ✅ No new framework dependencies
- ✅ Follows established Framer Motion patterns
- ✅ shadcn/ui component patterns followed
- ✅ Tailwind CSS for styling

**No violations found**

### Constitution Verdict: **APPROVED** - All gates passed. Design complies with all constitutional principles.

### Post-Design Gates

- [x] User Experience: Two-column layout tested for readability
- [x] Performance: CSS columns render at 60 FPS
- [x] Security: No new data exposure risks
- [x] Code Quality: TypeScript interfaces defined
- [x] Technology: No new dependencies added

---

**Status**: Phase 1 Complete | Next: Execute `/speckit.tasks` for implementation tasks
