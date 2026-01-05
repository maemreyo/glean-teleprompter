# Implementation Plan: Standalone Story with Teleprompter

**Branch**: `012-standalone-story` | **Date**: 2026-01-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-standalone-story/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Create a mobile-first, Instagram/TikTok-style story viewer with integrated teleprompter functionality. The system displays 9:16 aspect ratio stories with multiple slide types (text-highlight, widget-chart, image, poll, teleprompter), supports tap-based navigation, progress indicators, and auto-scrolling teleprompter mode with wake lock management. The feature is completely standalone with no authentication required, URL-based public access, localStorage-only progress persistence, and no observability/logging.

## Technical Context

**Language/Version**: TypeScript 5.3+ (strict mode) + React 18.2+, Next.js 14+
**Primary Dependencies**: Zustand 4.4+ (state), Framer Motion (animations), Wake Lock API + NoSleep.js (screen awake), Sonner (toasts), React.useRef/useCallback/useMemo hooks
**Storage**: localStorage (reading progress, <1KB per slide), JSON data via URL encoding
**Testing**: Jest 29+, React Testing Library 13+, Playwright (E2E for mobile gestures), NoSleep.js mocking required
**Target Platform**: Mobile-first (portrait 9:16), responsive desktop support, Chrome 90+/Safari 14+/Firefox 88+/Edge 90+
**Project Type**: Web application (frontend only, standalone story viewer page)
**Performance Goals**: 30fps scrolling minimum, <100ms slide transitions, virtual scrolling for 10,000+ word content, <20% battery drain vs video playback
**Constraints**: No authentication, no observability/logging/analytics, public URL-based access, localStorage quota handling graceful degradation, wake lock failure blocks teleprompter mode
**Scale/Scope**: 8 user stories (3 P1, 2 P2, 3 P3), 55 functional requirements, 15 success criteria, 10 edge cases, 5 clarifications resolved

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. User Experience First ✅ PASS
- **Requirement**: Intuitive controls, real-time text display, smooth scrolling, responsive design
- **Implementation**: Tap zones (left/right/center), auto-scroll with adjustable speed, focal point indicator, safe area handling for notches, gesture conflict prevention in teleprompter mode
- **Accessibility**: Keyboard shortcuts (Space, Arrow keys, 'r'), ARIA labels, high contrast mode support, screen reader compatible

### II. Performance & Reliability ✅ PASS
- **Requirement**: Smooth scrolling at variable speeds, low-latency interactions, proper error handling
- **Implementation**: requestAnimationFrame for 30fps+ scrolling, GPU acceleration (transform: translateZ(0)), virtual scrolling for long content, throttled progress updates (100ms), smooth deceleration on pause
- **Reliability**: Wake lock with NoSleep.js fallback, localStorage error handling, JSON validation with blocking errors, tab visibility detection

### III. Security & Privacy ✅ PASS
- **Requirement**: No authentication required (public access), no personal data collection
- **Implementation**: URL-based access control, localStorage-only progress storage (never transmitted), no external logging/analytics/services
- **Clarification**: Explicitly no observability, no metrics, no analytics per clarification session

### IV. Code Quality & Testing ✅ PASS
- **Requirement**: TypeScript strict mode, well-tested components, clean architecture
- **Implementation**: TypeScript 5.3+ strict mode, unit tests for scroll logic/kb shortcuts/localStorage, integration tests for slide transitions/progress sync, E2E tests for mobile gestures
- **Architecture**: Separate story viewer components, teleprompter-specific hooks, wake lock abstraction layer, state management with Zustand

### V. Technology Standards ✅ PASS
- **Requirement**: Next.js 14+, Tailwind CSS, shadcn/ui components
- **Implementation**: Next.js App Router for standalone story page, Tailwind for 9:16 aspect ratio and safe areas, shadcn/ui for control panel components (slider, buttons, switches), Framer Motion for slide transitions
- **Deployment**: Vercel deployment for optimal performance

**CONSTITUTION CHECK RESULT**: ✅ ALL GATES PASSED - No violations to justify

## Project Structure

### Documentation (this feature)

```text
specs/012-standalone-story/
├── spec.md              # Feature specification (already exists)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── story-schema.json      # JSON schema for story data validation
│   └── teleprompter-state.md  # Teleprompter runtime state contract
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Web application structure (standalone story viewer)
app/
└── story/
    ├── [storyId]/            # Dynamic route for story viewer
    │   └── page.tsx          # Main story viewer page (9:16 aspect ratio)
    └── layout.tsx            # Story layout (minimal, no nav/footer)

components/
└── story/
    ├── StoryViewer.tsx           # Main viewer component
    ├── StoryProgressBar.tsx      # Progress bars at top
    ├── SlideContainer.tsx        # Slide wrapper with transitions
    ├── SlideTypes/
    │   ├── TextHighlightSlide.tsx
    │   ├── WidgetChartSlide.tsx
    │   ├── ImageSlide.tsx
    │   ├── PollSlide.tsx
    │   └── TeleprompterSlide.tsx # Special teleprompter handling
    ├── Teleprompter/
    │   ├── TeleprompterContent.tsx    # Scrollable text area
    │   ├── FocalPointIndicator.tsx    # Yellow line indicator
    │   ├── TeleprompterControls.tsx   # Floating control panel
    │   ├── SpeedSlider.tsx            # Speed control (0-5)
    │   ├── FontSizeControl.tsx        # Font size (16-48px)
    │   ├── MirrorToggle.tsx           # Mirror mode switch
    │   ├── PlayPauseButton.tsx        # Play/pause control
    │   └── SkipToNextButton.tsx       # Explicit slide advancement
    └── SafeAreaWrapper.tsx        # Handles notches/home indicator

lib/
└── story/
    ├── types.ts                    # Story, Slide, TeleprompterState types
    ├── validation.ts               # JSON schema validation
    ├── hooks/
    │   ├── useStoryNavigation.ts   # Slide navigation logic
    │   ├── useTeleprompterScroll.ts # Auto-scroll engine
    │   ├── useWakeLock.ts          # Wake Lock + NoSleep.js abstraction
    │   ├── useSafeArea.ts          # Safe area detection
    │   ├── useProgressPersistence.ts # localStorage save/restore
    │   └── useKeyboardShortcuts.ts  # Desktop keyboard controls
    ├── utils/
    │   ├── scrollUtils.ts          # Scroll position calculations
    │   ├── progressUtils.ts        # Progress bar synchronization
    │   └── virtualScroller.ts      # Virtual scrolling for long content
    └── constants.ts                # Default speeds, sizes, durations

public/
└── libs/
└── nosleep.js                      # NoSleep.js library for Safari fallback

__tests__/
├── unit/
│   └── story/
│       ├── validation.test.ts              # JSON validation tests
│       ├── hooks/
│       │   ├── useTeleprompterScroll.test.ts
│       │   ├── useWakeLock.test.ts
│       │   ├── useProgressPersistence.test.ts
│       │   └── useKeyboardShortcuts.test.ts
│       └── utils/
│           ├── scrollUtils.test.ts
│           └── progressUtils.test.ts
├── integration/
│   └── story/
│       ├── slide-transitions.test.tsx      # Slide navigation tests
│       ├── progress-sync.test.tsx          # Progress bar sync tests
│       └── teleprompter-controls.test.tsx  # Control panel tests
└── e2e/
    └── story/
        ├── mobile-gestures.spec.ts         # Tap navigation tests
        ├── teleprompter-scrolling.spec.ts  # Auto-scroll E2E tests
        └── wake-lock.spec.ts               # Screen wake lock tests
```

**Structure Decision**: Web application structure selected because this is a standalone Next.js page with React components. The feature is frontend-only with no backend requirements (data comes from URL, progress stored in localStorage). Components are organized by feature area (story viewer, slide types, teleprompter), with shared logic extracted into reusable hooks and utilities.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | Constitution Check passed with no violations | N/A |

## Phase 0: Research & Technology Decisions

### Research Tasks (NEEDS CLARIFICATION → Research Required)

Based on Technical Context, the following research tasks are identified:

1. **NoSleep.js Integration Pattern**
   - **Question**: What is the best pattern for loading NoSleep.js from CDN with fallback handling?
   - **Research Needed**: CDN URL, error detection, async loading pattern, TypeScript types
   - **Alternatives**: Bundle NoSleep.js vs CDN, Wake Lock only vs Wake Lock + NoSleep

2. **Virtual Scrolling Library Selection**
   - **Question**: Should we use react-window or react-virtualized or custom implementation?
   - **Research Needed**: Library size, API compatibility, React 18+ support, mobile performance
   - **Alternatives**: Custom virtual scrolling with intersection observer vs library

3. **9:16 Aspect Ratio Implementation**
   - **Question**: Best practice for mobile viewport handling with --vh fix and safe areas?
   - **Research Needed**: CSS custom properties, env() support, orientation change handling
   - **Alternatives**: Fixed height vs viewport units vs container queries

4. **URL-Based JSON Data Loading**
   - **Question**: Maximum URL length limits and compression strategies for story data?
   - **Research Needed**: Browser URL limits (2048 chars vs 2MB+), gzip compression, base64 encoding
   - **Alternatives**: URL param vs hash vs route param, compression vs no compression

5. **Progress Synchronization Strategy**
   - **Question**: How to throttle scroll events to 100ms without losing accuracy?
   - **Research Needed**: requestAnimationFrame timing, event throttling patterns, RAF + throttle combo
   - **Alternatives**: Throttle only vs debounce vs RAF only

6. **Safe Area Detection Cross-Browser**
   - **Question**: Reliable safe area detection for iOS vs Android vs desktop?
   - **Research Needed**: env() support detection, CSS fallbacks, JavaScript detection
   - **Alternatives**: CSS-only vs JS detection vs hybrid approach

### Best Practices Research

1. **React 18+ with Framer Motion**: Story viewer animation patterns
2. **Zustand for Story State**: State management patterns for multi-slide viewers
3. **Mobile Touch Gestures**: Tap zone implementation without libraries
4. **localStorage Error Handling**: Graceful degradation patterns
5. **TypeScript Strict Mode**: Pattern for strict mode with external libraries (NoSleep.js)
6. **Jest + React Testing Library**: Testing patterns for requestAnimationFrame
7. **Playwright Mobile E2E**: Mobile emulation and gesture testing

## Phase 1: Design Artifacts

### Data Model

See [`data-model.md`](./data-model.md) for complete entity definitions, relationships, and state transitions.

**Key Entities**:
- `StoryScript`: Complete story with slides array
- `Slide`: Individual slide with type-specific content
- `TeleprompterState`: Runtime scrolling state
- `ReadingProgress`: Saved user progress

### API Contracts

See [`contracts/`](./contracts/) directory for:
- `story-schema.json`: JSON schema for story data validation
- `teleprompter-state.md`: Teleprompter runtime state contract

**Note**: No backend API contracts - this is a frontend-only feature with URL-based data loading and localStorage persistence.

### Quickstart Guide

See [`quickstart.md`](./quickstart.md) for:
- Development setup instructions
- Story JSON format examples
- Testing different slide types
- URL generation for sharing stories
- Wake lock testing procedures

## Implementation Phases

### Phase 2: Core Story Viewer (Priority 1)

**Focus**: Basic story viewing functionality without teleprompter

**Tasks**:
1. Create Next.js story viewer page route
2. Implement 9:16 aspect ratio container with --vh fix
3. Build StoryViewer component with slide state management (Zustand)
4. Implement StoryProgressBar component (multiple bars at top)
5. Create slide transition animations (Framer Motion)
6. Build tap zone navigation (left/right/center)
7. Implement slide preloading (+1 and +2 ahead)
8. Create slide type components: TextHighlight, WidgetChart, Image, Poll
9. Add JSON schema validation for story data
10. Create error screen for invalid/malformed JSON
11. Implement pause/resume for time-based slides
12. Add auto-advance logic for non-manual slides
13. Write unit tests for navigation logic
14. Write integration tests for slide transitions
15. Write E2E tests for tap gestures

**Success Criteria**:
- SC-001: <100ms delay between slide transitions
- Story loads and displays all slide types correctly
- Progress bars animate for time-based slides
- Invalid JSON shows error screen

### Phase 3: Teleprompter Core (Priority 1)

**Focus**: Auto-scrolling teleprompter functionality

**Tasks**:
1. Create TeleprompterSlide component with focal point indicator (33% from top)
2. Implement top/bottom gradient overlays (35vh each)
3. Build useTeleprompterScroll hook with requestAnimationFrame
4. Implement auto-scroll engine with variable speed (0-5)
5. Create scroll depth percentage calculation
6. Sync progress bar to scroll depth (not time-based)
7. Build TeleprompterControls floating panel
8. Implement speed slider (0-5 range)
9. Add font size control (16-48px, default 28px)
10. Implement scroll position ratio preservation on font change
11. Create play/pause button with smooth deceleration
12. Add auto-hide control panel (3 second inactivity)
13. Detect end of content and trigger slide completion
14. Disable tap-to-next navigation for teleprompter slides
15. Add SkipToNext button for explicit advancement
16. Write unit tests for scroll logic
17. Write integration tests for progress sync
18. Write E2E tests for scrolling performance

**Success Criteria**:
- SC-002: 30fps+ scrolling on mid-range mobile
- SC-006: <5% deviation on font size changes
- SC-007: <2% error margin on progress bar sync
- SC-014: <100ms control panel appearance

### Phase 4: Wake Lock Management (Priority 1)

**Focus**: Screen stay-awake functionality

**Tasks**:
1. Create useWakeLock hook with Wake Lock API
2. Implement NoSleep.js fallback for Safari/iOS
3. Add CDN loading for NoSleep.js with error handling
4. Implement wake lock request on scroll start
5. Add wake lock release on scroll stop
6. Handle tab visibility changes (re-request on return)
7. Create error screen for wake lock unavailability
8. Block teleprompter mode if both Wake Lock and NoSleep.js fail
9. Add graceful degradation for low battery mode
10. Write unit tests for wake lock logic (mocked)
11. Write integration tests for visibility handling
12. Write E2E tests for screen wake behavior

**Success Criteria**:
- SC-003: 100% wake lock success on supported browsers
- Wake lock releases on tab switch
- Wake lock re-requests on tab return
- Clear error message when wake lock unavailable

### Phase 5: Safe Area & Layout (Priority 2)

**Focus**: Notch/Dynamic Island handling

**Tasks**:
1. Create useSafeArea hook for safe area detection
2. Implement env(safe-area-inset-*) CSS variables
3. Adjust focal point from 33vh to 38vh with safe area
4. Add minimum 2rem padding plus safe area insets
5. Handle orientation changes with layout recalculation
6. Preserve scroll ratio on orientation change
7. Create SafeAreaWrapper component
8. Add safe area to all slide types
9. Write tests for safe area calculations
10. Test on iPhone with Dynamic Island (real device)

**Success Criteria**:
- SC-005: 100% content visibility on modern mobile devices
- Focal point adjusts correctly with safe area
- Orientation changes preserve scroll position

### Phase 6: Gesture Conflict Prevention (Priority 2)

**Focus**: Prevent accidental slide advancement during teleprompter

**Tasks**:
1. Disable tap zones for teleprompter slides
2. Tap shows control panel (not slide change)
3. Implement SkipToNext button functionality
4. Ensure tap zones work for non-teleprompter slides
5. Write tests for gesture conflict prevention
6. Write E2E tests for tap behavior

**Success Criteria**:
- SC-004: 95% completion without accidental advancement
- Taps don't advance during teleprompter
- SkipToNext button works correctly

### Phase 7: Performance Optimization (Priority 3)

**Focus**: Long-form content handling

**Tasks**:
1. Implement virtual scrolling for 50+ paragraphs
2. Add scroll progress throttling (100ms max)
3. Apply GPU acceleration (transform: translateZ(0))
4. Disable text selection during scrolling
5. Use React.memo for heavy components
6. Monitor FPS during scrolling
7. Optimize re-render performance
8. Write performance tests
9. Test with 10,000+ word content

**Success Criteria**:
- SC-002: 30fps+ maintained during scrolling
- SC-009: 90% DOM node reduction with virtual scrolling
- SC-010: <20% battery drain vs video playback

### Phase 8: Progress Persistence (Priority 3)

**Focus**: Auto-save and recovery

**Tasks**:
1. Create useProgressPersistence hook
2. Implement localStorage save every 2 seconds
3. Store slide ID and scroll ratio (0-1)
4. Add timestamp to saved progress
5. Offer restore dialog on reopen
6. Handle localStorage quota exceeded errors
7. Gracefully continue without saving on error
8. Write unit tests for persistence logic
9. Write integration tests for save/restore
10. Test browser crash recovery

**Success Criteria**:
- SC-008: 90% successful restore after closure
- Progress saves every 2 seconds
- Quota errors don't break functionality

### Phase 9: Accessibility & Keyboard (Priority 3)

**Focus**: Desktop and screen reader support

**Tasks**:
1. Create useKeyboardShortcuts hook
2. Implement Space (play/pause), ArrowUp (speed+), ArrowDown (speed-), 'r' (reset)
3. Add ARIA labels to all interactive elements
4. Set role="region" and aria-live="polite" on teleprompter
5. Implement high contrast mode (white on black)
6. Display WPM calculation (speed × 150)
7. Add screen reader announcements
8. Write accessibility tests
9. Test with screen reader (VoiceOver/NVDA)

**Success Criteria**:
- SC-011: 100% keyboard shortcut functionality
- SC-012: 100% screen reader coverage
- High contrast mode works correctly

### Phase 10: Edge Cases & Error Handling

**Focus**: Robustness and user experience

**Tasks**:
1. Detect content height < viewport and disable auto-scroll
2. Pause auto-scroll on manual scroll
3. Show toast "Auto-scroll paused - tap to resume"
4. Recalculate scroll height after font changes
5. Pause on tab inactive (visibilitychange API)
6. Handle wake lock failure gracefully
7. Validate JSON and block on invalid data
8. Handle NoSleep.js CDN loading failures
9. Test all 10 edge cases from spec
10. Write E2E tests for edge cases

**Success Criteria**:
- SC-013: <500ms resume after tab switch
- All edge cases handled gracefully
- Clear error messages for failures

## Risk Assessment

### High Risk Items

1. **Wake Lock API + NoSleep.js Reliability**
   - **Risk**: Browser inconsistencies, system restrictions, CDN failures
   - **Impact**: Teleprompter becomes unusable if wake lock fails
   - **Mitigation**: Clear error messaging, graceful blocking, comprehensive testing across browsers

2. **Virtual Scrolling Performance**
   - **Risk**: Complex implementation, potential flickering, scroll position loss
   - **Impact**: Poor UX for long-form content
   - **Mitigation**: Thorough testing with real long content, fallback to full render if needed

3. **Cross-Browser Safe Area Support**
   - **Risk**: Different implementations, missing env() support
   - **Impact**: Content obscured on notched devices
   - **Mitigation**: Progressive enhancement, test on real devices

### Medium Risk Items

1. **URL Length Limits**
   - **Risk**: Story data too large for URL
   - **Impact**: Cannot share long stories
   - **Mitigation**: Research compression, document limits, consider alternative data loading

2. **Scroll Performance at 30fps**
   - **Risk**: Device limitations, background processing
   - **Impact**: Janky scrolling, poor UX
   - **Mitigation**: GPU acceleration, virtual scrolling, performance monitoring

3. **localStorage Quota**
   - **Risk**: Quota exceeded, private browsing mode
   - **Impact**: Progress not saved
   - **Mitigation**: Graceful error handling, clear user communication

### Low Risk Items

1. **NoSleep.js CDN Availability**
   - **Risk**: CDN downtime, network issues
   - **Impact**: Fallback fails for Safari users
   - **Mitigation**: Error handling, clear messaging, consider bundling

2. **Gesture Conflict Complexity**
   - **Risk**: Tap zones interfere with controls
   - **Impact**: Confusing UX
   - **Mitigation**: Clear UI separation, extensive testing

## Testing Strategy

### Unit Tests
- **Scroll Logic**: useTeleprompterScroll hook tests
- **Wake Lock**: Mocked Wake Lock API and NoSleep.js
- **Navigation**: Slide transition logic
- **Progress Calculation**: Scroll depth and ratio calculations
- **Validation**: JSON schema validation
- **Persistence**: localStorage save/restore
- **Keyboard Shortcuts**: Key mapping and state changes

### Integration Tests
- **Slide Transitions**: Full navigation flow
- **Progress Sync**: Scroll to progress bar synchronization
- **Control Panel**: Show/hide and interaction
- **Safe Area**: Layout adjustments
- **Wake Lock Lifecycle**: Request/release/re-request

### E2E Tests (Playwright)
- **Mobile Gestures**: Tap zones, swipe gestures
- **Teleprompter Scrolling**: Full scrolling session
- **Screen Wake**: Wake lock behavior (visual only)
- **Progress Recovery**: Save and restore flow
- **Edge Cases**: All 10 edge cases

### Performance Tests
- **FPS Monitoring**: 30fps+ during scrolling
- **Battery Usage**: Compare to video baseline
- **DOM Nodes**: Verify virtual scrolling reduction
- **Memory Usage**: Monitor for leaks

### Accessibility Tests
- **Keyboard Navigation**: All shortcuts work
- **Screen Reader**: NVDA/VoiceOver announcements
- **High Contrast**: Mode switching works
- **ARIA Labels**: All elements labeled

## Dependencies & Integration Points

### External Libraries
- **NoSleep.js**: CDN loaded for Safari wake lock fallback
- **Framer Motion**: Slide transition animations
- **Zustand**: Story and teleprompter state management
- **Sonner**: Toast notifications
- **Tailwind CSS**: Styling and 9:16 aspect ratio

### Internal Dependencies
- **Existing Teleprompter Components**: NOT reused - this is standalone
- **Config System**: NOT used - independent feature
- **Authentication**: NOT used - public access

### Browser APIs
- **Wake Lock API**: Screen wake lock (Chrome/Edge)
- **Screen Orientation API**: Orientation change detection
- **Page Visibility API**: Tab visibility detection
- **localStorage**: Progress persistence
- **requestAnimationFrame**: Smooth scrolling
- **Intersection Observer**: Virtual scrolling (if used)

## Deployment Considerations

### Vercel Deployment
- Next.js App Router compatible
- Static page generation possible
- CDN for static assets (NoSleep.js)
- Edge functions not needed (client-side only)

### Performance Optimization
- Code splitting for story viewer route
- Lazy load NoSleep.js
- Image optimization for story images
- Font optimization for story content

### Monitoring
- **No production monitoring** per clarifications
- Console logging for development only
- Error tracking not implemented (privacy-first)

## Success Metrics

### Quantitative Metrics
- **SC-001**: <100ms slide transition delay
- **SC-002**: 30fps+ scrolling on iPhone 12+
- **SC-003**: 100% wake lock success on supported browsers
- **SC-004**: 95% completion without accidental advancement
- **SC-005**: 100% content visibility on notched devices
- **SC-006**: <5% scroll position deviation on font change
- **SC-007**: <2% progress bar error margin
- **SC-008**: 90% successful progress restore
- **SC-009**: 90% DOM reduction with virtual scrolling
- **SC-010**: <20% battery drain vs video
- **SC-011**: 100% keyboard shortcut functionality
- **SC-012**: 100% screen reader coverage
- **SC-013**: <500ms resume after tab switch
- **SC-014**: <100ms control panel appearance
- **SC-015**: Correct mirror mode flip

### Qualitative Metrics
- Intuitive tap navigation
- Smooth scrolling experience
- Clear error messages
- Responsive design on all devices
- Accessible to keyboard and screen reader users

## Post-Implementation Tasks

### Documentation
- Update project README with story viewer feature
- Add story JSON format documentation
- Document URL generation process
- Create troubleshooting guide for wake lock issues

### Developer Experience
- Add story creator tool (future feature)
- Create story templates
- Build story previewer
- Add story validation CLI tool

### Future Enhancements (Out of Scope)
- Story creation UI
- Story analytics (if privacy requirements change)
- Offline support (PWA)
- Story sharing with QR codes
- Multi-language support
- Custom themes and branding
