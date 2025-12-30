# Implementation Plan: Floating Camera Widget & Recording

**Branch**: `1-camera-recording-widget` | **Date**: 2025-12-30 | **Spec**: specs/1-camera-recording-widget/spec.md
**Input**: Feature specification from `/specs/1-camera-recording-widget/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a floating camera widget with recording capabilities for the teleprompter application. The feature allows users to enable camera preview, drag the widget to any position, and record synchronized video/audio during teleprompter sessions. Recordings are stored in Supabase with automatic format conversion for cross-browser compatibility.

## Technical Context

**Language/Version**: TypeScript 5.x (Next.js project standard)
**Primary Dependencies**: Next.js 14+, React 18+, Tailwind CSS, framer-motion, Supabase client
**Storage**: Supabase PostgreSQL (recordings table) + Supabase Storage (video files)
**Testing**: Jest + React Testing Library (existing project standards)
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge) on desktop and mobile
**Project Type**: Web application (Next.js single project)
**Performance Goals**: <100ms widget drag latency, <2 second recording start, <2 minute video upload
**Constraints**: Max 5-minute recordings, 100MB/user storage limit, real-time video processing
**Scale/Scope**: Single feature with 12 functional requirements, 4 user stories, cross-browser video handling

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ User Experience First
- **PASS**: Feature prioritizes UX with draggable widget, mirrored video, and accessibility support
- **PASS**: Responsive design for desktop and mobile devices
- **PASS**: Intuitive controls and real-time feedback

### ✅ Performance & Reliability
- **PASS**: Smooth scrolling text with camera overlay
- **PASS**: Low-latency video recording and real-time preview
- **PASS**: Comprehensive error handling for camera/microphone failures
- **PASS**: Memory management with 5-minute recording limits

### ✅ Security & Privacy
- **PASS**: Uses Supabase Auth for user authentication
- **PASS**: Secure storage policies (user-only access to own recordings)
- **PASS**: No unnecessary data logging or storage
- **PASS**: Privacy-compliant camera/microphone permission handling

### ✅ Code Quality & Testing
- **PASS**: TypeScript implementation with strict mode
- **PASS**: Clean architecture with separated concerns (hooks, components, services)
- **PASS**: Comprehensive test coverage planned for critical paths
- **PASS**: Well-structured component hierarchy

### ✅ Technology Standards
- **PASS**: Next.js 14+ with App Router
- **PASS**: Supabase for authentication and data
- **PASS**: Tailwind CSS for styling
- **PASS**: shadcn/ui compatible component design
- **PASS**: Vercel deployment ready

**OVERALL RESULT**: ✅ ALL GATES PASSED - Feature aligns with constitution principles

## Project Structure

### Documentation (this feature)

```text
specs/1-camera-recording-widget/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Web application structure (Next.js project)
app/
├── protected/
│   └── teleprompter/
│       ├── camera-widget.tsx       # Main camera widget component
│       ├── use-camera-recorder.ts  # Camera recording hook
│       ├── recording-modal.tsx     # Video preview/save modal
│       └── types.ts                # TypeScript interfaces

components/
├── teleprompter/
│   ├── camera/
│   │   ├── DraggableCamera.tsx     # Floating camera widget
│   │   ├── CameraControls.tsx      # Start/stop recording controls
│   │   └── CameraPreview.tsx       # Video preview component
│   └── audio/
│       └── AudioPlayer.tsx         # Existing audio player

lib/
├── supabase/
│   ├── recordings.ts               # Recording CRUD operations
│   └── storage.ts                  # File upload utilities
└── utils/
    └── video-converter.ts          # Server-side format conversion

hooks/
└── useCameraRecorder.ts            # Main recording logic hook
```

**Structure Decision**: Single Next.js web application structure following existing project patterns. Camera functionality integrated into teleprompter feature with dedicated components and utilities.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No violations detected - all constitutional requirements satisfied.*