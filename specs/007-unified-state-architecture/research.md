# Research: Unified State Architecture

**Feature**: 007-unified-state-architecture  
**Date**: 2026-01-01  
**Status**: Complete

## Overview

This document consolidates research findings for implementing a unified state architecture that separates concerns across four Zustand stores: useContentStore, useConfigStore, usePlaybackStore, and useUIStore.

## Key Decisions

### 1. State Store Separation

**Decision**: Create four stores with single responsibility

- **useContentStore** (NEW): Content data and editor mutability state
- **useConfigStore** (EXISTING - already has all styling): Visual styling configuration
- **usePlaybackStore** (NEW): Runtime playback state
- **useUIStore** (EXISTING - extend with mode): UI navigation and visibility state
- **useTeleprompterStore** (DEPRECATED): To be completely removed

**Rationale**: The current useTeleprompterStore mixes concerns (content, styling, playback, UI) making it difficult to maintain. Separating into four stores follows the single responsibility principle and aligns with the existing codebase where useConfigStore and useUIStore already exist.

**Alternatives Considered**:
- Keep useTeleprompterStore and reorganize internally: Rejected because the mixed concerns would remain, just organized differently
- Merge everything into a single store: Rejected because it would violate single responsibility and make the store too large
- Create more than four stores: Rejected as over-engineering for this use case

### 2. Property Migration Mapping

**Decision**: Migrate properties from useTeleprompterStore as follows

| Legacy Property | Destination | Notes |
|----------------|-------------|-------|
| `text` | useContentStore.text | Content data |
| `bgUrl` | useContentStore.bgUrl | Content data |
| `musicUrl` | useContentStore.musicUrl | Content data |
| `isReadOnly` | useContentStore.isReadOnly | Editor mutability state |
| `font` | REMOVED | Legacy FontStyle enum, useConfigStore already uses real font names |
| `colorIndex` | REMOVED | Legacy color preset, useConfigStore.colors has full color config |
| `fontSize` | useConfigStore.typography.fontSize | Already exists in useConfigStore |
| `align` | useConfigStore.layout.textAlign | Already exists in useConfigStore |
| `lineHeight` | useConfigStore.typography.lineHeight | Already exists in useConfigStore |
| `margin` | useConfigStore.layout.horizontalMargin | Already exists in useConfigStore |
| `overlayOpacity` | NEEDS NEW FIELD | Add to useConfigStore.effects as overlayOpacity |
| `speed` | useConfigStore.animations.autoScrollSpeed | Already exists as autoScrollSpeed |
| `mode` | useUIStore.mode | App view state ('setup' | 'running') |
| `isPlaying` | usePlaybackStore.isPlaying | Runtime playback state |
| `currentTime` | usePlaybackStore.currentTime | Runtime playback state |

**Rationale**: This mapping maintains semantic separation while preserving all existing functionality. Legacy properties like `font` (FontStyle enum) and `colorIndex` are removed because useConfigStore already uses real font names and full color configuration.

**Alternatives Considered**:
- Keep legacy `font` enum and map to real fonts: Rejected because useConfigStore already uses real font names directly
- Create a migration layer to translate legacy properties: Rejected because app is unpublished, no existing users
- Keep `overlayOpacity` separate: Rejected because it's a visual effect, belongs in useConfigStore.effects

### 3. scrollSpeed vs autoScrollSpeed

**Decision**: Keep separate - `autoScrollSpeed` in useConfigStore.animations, `scrollSpeed` in usePlaybackStore

- **autoScrollSpeed** (pixels/sec): Configuration setting in useConfigStore.animations - defines the default scroll speed
- **scrollSpeed** (multiplier 1-10): Runtime tracking in usePlaybackStore - current actual scroll velocity

**Rationale**: Maintains clear separation between configuration (what it should look like) and runtime state (what's currently happening). Quick Settings will adjust `autoScrollSpeed` in useConfigStore, which affects both preview and playback.

**Alternatives Considered**:
- Use only autoScrollSpeed everywhere: Rejected because runtime needs to track current velocity separately from config
- Use only scrollSpeed everywhere: Rejected because speed as pixels/sec is more intuitive than multiplier
- Rename to avoid confusion: Rejected because the names are semantically correct once understood

### 4. Mode Property Placement

**Decision**: Add `mode` ('setup' | 'running') to useUIStore

**Rationale**: While mode represents workflow, it fundamentally controls what UI view is shown (Editor vs Runner), making it appropriate for useUIStore alongside panel visibility and other UI state.

**Alternatives Considered**:
- Create useWorkflowStore for mode: Rejected as over-engineering for a single property
- Keep mode in useTeleprompterStore: Rejected because we're removing that store entirely
- Put mode in useContentStore: Rejected because mode is not content-related

### 5. localStorage Strategy

**Decision**: No migration needed - use fresh keys for new stores

- useContentStore: 'teleprompter-content' (NEW)
- useConfigStore: 'teleprompter-config' (EXISTING - no change)
- usePlaybackStore: No persistence (runtime-only state)
- useUIStore: 'teleprompter-ui-store' (EXISTING - no change, add mode)

**Rationale**: App is unpublished with no existing users, so no legacy data to migrate. Starting fresh avoids complexity.

**Alternatives Considered**:
- Migrate existing useTeleprompterStore data: Rejected because no existing users
- Use same keys to preserve hypothetical data: Rejected because structure changes completely
- Don't persist new stores: Rejected because persistence is important for UX

### 6. Font Family Handling

**Decision**: Use real font family names only in useConfigStore

Remove legacy `font` property (FontStyle enum: 'Classic' | 'Modern' | 'Typewriter' | 'Novel' | 'Neon') entirely. useConfigStore.typography.fontFamily already uses real CSS font family names like 'Inter', 'Roboto', etc.

**Rationale**: The FontStyle preset enum was a legacy abstraction. All font selection should use actual font family names directly, matching the current design system.

**Alternatives Considered**:
- Keep enum and map to real fonts internally: Rejected because it adds unnecessary complexity
- Support both enum and real fonts during transition: Rejected because no existing users
- Create a font preset system: Rejected because useConfigStore already has this with presets

### 7. Visual Indication for Runner Changes

**Decision**: Both badge/dot indicator AND subtle color change on affected controls

When settings are modified via Runner Quick Settings:
1. Show badge/dot indicator on affected controls in Editor
2. Apply subtle color change (e.g., amber border or background) to modified fields
3. Clear indication immediately upon manual change of that specific setting in Editor

**Rationale**: Dual indicators ensure maximum visibility. Badge is standard pattern, color change provides additional visual cue. Immediate clear on manual change prevents stale indicators.

**Alternatives Considered**:
- Badge only: Rejected because less visible for color-blind users
- Color change only: Rejected because non-standard pattern
- Toast notification: Rejected because too intrusive for every change
- Persistent indicator until cleared manually: Rejected because stale indicators are confusing

### 8. Quick Settings Panel Implementation

**Decision**: Collapsible floating panel using Radix UI components

Four Quick Settings in Runner:
1. Scroll speed (adjusts useConfigStore.animations.autoScrollSpeed)
2. Font size (adjusts useConfigStore.typography.fontSize)
3. Alignment (adjusts useConfigStore.layout.textAlign)
4. Background (adjusts useContentStore.bgUrl)

**Rationale**: Radix UI provides accessible, well-tested primitives. Collapsible floating panel doesn't obstruct content while remaining accessible.

**Alternatives Considered**:
- Fixed sidebar: Rejected because reduces available screen space
- Modal dialog: Rejected because too heavy for quick adjustments
- Bottom sheet (mobile-style): Rejected because less intuitive on desktop
- Inline controls: Rejected because clutters the Runner interface

### 9. State Synchronization Mechanism

**Decision**: Use Zustand's built-in pub/sub with subscribe()

Changes made in Runner Quick Settings use Zustand's state updates, which automatically notify all subscribed components via React's reactivity. No manual synchronization needed.

**Rationale**: Zustand's built-in pub/sub is optimized for performance (uses React hooks) and automatically ensures all subscribers receive updates. The 100ms target is easily achievable with this approach.

**Alternatives Considered**:
- Manual polling: Rejected because inefficient and not real-time
- Event bus: Rejected because Zustand already provides this
- WebSocket: Rejected because overkill for local state sync
- Context API: Rejected because we're using Zustand

### 10. Error Handling for Quick Settings

**Decision**: Show toast error + revert UI to last valid state

When a Quick Settings action fails (validation error, storage quota exceeded):
1. Display toast notification using Sonner with error message
2. Revert the UI control (slider, dropdown, etc.) to its last valid state
3. Log error for debugging

**Rationale**: Toast notifications are non-intrusive but visible. Reverting UI prevents user confusion from thinking the change applied when it didn't.

**Alternatives Considered**:
- Alert dialog: Rejected because too intrusive
- Silent failure: Rejected because user has no feedback
- Retry automatically: Rejected because might fail repeatedly
- Disable control temporarily: Rejected because unclear UX

## Technology Choices

### State Management
- **Zustand 4.4+**: Already in use, lightweight, excellent TypeScript support, built-in pub/sub
- **persist middleware**: For localStorage persistence of content, config, and UI stores
- **No persistence for playback**: Runtime state doesn't need persistence

### UI Components
- **Radix UI**: For Quick Settings panel (Collapsible, Dialog, Slider, etc.)
- **shadcn/ui**: Wrapper components built on Radix UI
- **Framer Motion**: For panel animations
- **Sonner**: For toast notifications

### Testing
- **Jest 29+**: Unit tests for store logic
- **React Testing Library**: Integration tests for component-store interactions
- **Incremental migration**: Update tests when code is migrated

## Implementation Considerations

### 1. Test Migration Strategy
- Update tests incrementally as code is migrated
- Each test should be updated when the code it tests uses new stores
- Create new mock files for useContentStore and usePlaybackStore
- Update existing mocks for useConfigStore and useUIStore as needed

### 2. Component Updates
- **Runner.tsx**: Major update - replace useTeleprompterStore with useContentStore + useConfigStore + usePlaybackStore + useUIStore, add QuickSettingsPanel
- **Editor.tsx**: Minor update - already uses useConfigStore and useUIStore, may need useContentStore
- **TeleprompterText.tsx**: No change - already uses useConfigStore correctly
- **ContentPanel.tsx**: Update to use useContentStore instead of useTeleprompterStore
- **PreviewPanel.tsx**: Verify it uses useConfigStore (likely already does)

### 3. Backward Compatibility
- No backward compatibility needed - app is unpublished
- No migration scripts needed
- No legacy data cleanup needed

### 4. Performance
- Zustand's pub/sub is highly optimized
- No unnecessary re-renders due to selector usage
- Quick Settings changes are immediate via React reactivity
- 100ms sync target is easily achievable

### 5. Accessibility
- Quick Settings panel must be keyboard navigable
- Toast notifications must be screen reader friendly
- Visual indicators must have aria-labels
- All controls must have proper focus management

## Open Questions (Resolved)

All questions from the spec have been resolved in this research. No outstanding questions remain.

## Next Steps

1. **Phase 1**: Generate data-model.md with entity definitions
2. **Phase 1**: Generate contracts/store-contracts.md with API contracts
3. **Phase 1**: Generate quickstart.md with development setup
4. **Phase 2**: Update agent context with new technologies
5. **Phase 2**: Re-evaluate Constitution Check
