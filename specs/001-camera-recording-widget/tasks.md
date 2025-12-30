# Implementation Tasks: Floating Camera Widget & Recording

**Feature**: Floating Camera Widget & Recording
**Branch**: `1-camera-recording-widget`
**Total Tasks**: 28
**Estimated Time**: 16-20 hours

## Overview

This task breakdown organizes implementation by user story priority to enable incremental delivery and independent testing. Tasks are sequenced for efficient parallel execution where possible.

### User Story Dependencies
- **US1** (Camera Mirror): Foundation for all camera functionality
- **US2** (Draggable Widget): Builds on US1, adds positioning
- **US3** (Video Recording): Depends on US1+US2, adds recording capability
- **US4** (Cloud Storage): Depends on US3, adds persistence layer

### Parallel Execution Opportunities
- Database setup can run parallel to foundational components
- API endpoints can be implemented parallel to frontend components
- Tests can be written parallel to implementation within each story

## Phase 1: Setup & Infrastructure

### Database & Storage Setup
- [x] T001 Create recordings table in Supabase SQL editor with constraints and indexes
- [x] T002 Create user_recording_settings table in Supabase SQL editor
- [x] T003 Set up user_recordings storage bucket in Supabase dashboard
- [x] T004 Configure storage policies for user-scoped file access in Supabase
- [x] T005 Create Row Level Security policies for recordings table

### TypeScript Types & Interfaces
- [x] T006 Create shared TypeScript interfaces for recording entities in types/recording.ts
- [x] T007 Define API response types and error structures in types/api.ts

## Phase 2: Foundational Components

### Core Utilities
- [x] T008 [P] Create utility functions for video format detection in lib/utils/video.ts
- [x] T009 [P] Implement storage quota calculation helpers in lib/utils/quota.ts
- [x] T010 [P] Create error handling utilities for media operations in lib/utils/media-errors.ts

### Base UI Components
- [x] T011 [P] Create base camera widget component structure in components/teleprompter/camera/BaseCamera.tsx
- [x] T012 [P] Implement camera permission request dialog in components/teleprompter/camera/PermissionDialog.tsx

## Phase 3: User Story 1 - Camera Mirror (Priority: P1)

**Goal**: Enable real-time camera preview with mirrored video display
**Independent Test**: Can enable camera and verify mirrored video feed without recording functionality

### Core Functionality
- [x] T013 [US1] Implement camera permission handling with user-friendly error messages in hooks/useCamera.ts
- [x] T014 [US1] Create video stream initialization with mirroring support in hooks/useCamera.ts
- [x] T015 [US1] Build basic camera widget component with video display in components/teleprompter/camera/CameraWidget.tsx
- [x] T016 [US1] Add mirror transformation to video element in components/teleprompter/camera/CameraWidget.tsx

### Integration & Controls
- [ ] T017 [US1] Integrate camera widget toggle in teleprompter page in app/protected/teleprompter/page.tsx
- [ ] T018 [US1] Add camera enable/disable button to teleprompter controls in components/teleprompter/Runner.tsx

### Testing & Polish
- [ ] T019 [US1] Add unit tests for camera permission handling in hooks/__tests__/useCamera.test.ts
- [ ] T020 [US1] Test video mirroring across different browsers in components/teleprompter/camera/CameraWidget.test.tsx

## Phase 4: User Story 2 - Draggable Widget (Priority: P2)

**Goal**: Allow repositioning of camera widget without obstructing text
**Independent Test**: Can drag camera widget to different positions while maintaining video feed

### Drag Functionality
- [x] T021 [US2] Implement drag controls using framer-motion in components/teleprompter/camera/DraggableCamera.tsx
- [x] T022 [US2] Add position persistence across page reloads in components/teleprompter/camera/DraggableCamera.tsx
- [x] T023 [US2] Implement boundary constraints to keep widget on screen in components/teleprompter/camera/DraggableCamera.tsx

### UX Enhancements
- [x] T024 [US2] Add visual feedback during dragging (shadow changes) in components/teleprompter/camera/DraggableCamera.tsx
- [x] T025 [US2] Implement touch gesture support for mobile devices in components/teleprompter/camera/DraggableCamera.tsx

### Testing
- [ ] T026 [US2] Add drag interaction tests in components/teleprompter/camera/__tests__/DraggableCamera.test.tsx

## Phase 5: User Story 3 - Video Recording (Priority: P1)

**Goal**: Capture synchronized video and audio during teleprompter sessions
**Independent Test**: Can start/stop recording and verify video file contains camera feed and audio

### Recording Logic
- [x] T027 [US3] Implement MediaRecorder integration with cross-browser fallbacks in hooks/useCameraRecorder.ts
- [x] T028 [US3] Add recording state management (start/stop/pause) in hooks/useCameraRecorder.ts
- [x] T029 [US3] Implement audio echo cancellation and noise suppression in hooks/useCameraRecorder.ts
- [x] T030 [US3] Add recording duration limits and memory management in hooks/useCameraRecorder.ts

### UI Controls
- [x] T031 [US3] Add recording start/stop button to camera widget in components/teleprompter/camera/RecordingControls.tsx
- [x] T032 [US3] Implement recording status indicator (red border, blinking REC) in components/teleprompter/camera/RecordingIndicator.tsx
- [x] T033 [US3] Create recording preview modal with save/discard options in components/teleprompter/camera/RecordingModal.tsx

### Error Handling
- [x] T034 [US3] Add automatic retry logic for recording failures in hooks/useCameraRecorder.ts
- [x] T035 [US3] Implement partial recording save on errors in components/teleprompter/camera/RecordingModal.tsx

### Testing
- [ ] T036 [US3] Add recording lifecycle tests in hooks/__tests__/useCameraRecorder.test.ts
- [ ] T037 [US3] Test MediaRecorder API integration in components/teleprompter/camera/__tests__/RecordingControls.test.tsx

## Phase 6: User Story 4 - Cloud Storage (Priority: P2)

**Goal**: Save and manage recorded videos in personal cloud library
**Independent Test**: Can upload recordings and view them in personal library

### Storage Integration
- [ ] T038 [US4] Implement file upload to Supabase Storage in lib/supabase/storage.ts
- [ ] T039 [US4] Create recording metadata persistence in lib/supabase/recordings.ts
- [ ] T040 [US4] Add quota checking before uploads in lib/supabase/recordings.ts

### API Endpoints
- [ ] T041 [US4] Create recording list API endpoint in app/api/recordings/route.ts
- [ ] T042 [US4] Implement recording detail API in app/api/recordings/[id]/route.ts
- [ ] T043 [US4] Add storage quota API endpoint in app/api/recordings/quota/route.ts
- [ ] T044 [US4] Create upload endpoint with validation in app/api/recordings/upload/route.ts

### Format Conversion
- [ ] T045 [US4] Implement server-side WebM to MP4 conversion in app/api/recordings/convert/route.ts
- [ ] T046 [US4] Add conversion job status tracking in lib/supabase/recordings.ts

### Library UI
- [ ] T047 [US4] Create recordings library component in components/teleprompter/RecordingsLibrary.tsx
- [ ] T048 [US4] Add recording playback functionality in components/teleprompter/RecordingPlayer.tsx
- [ ] T049 [US4] Implement download functionality in components/teleprompter/RecordingDownload.tsx

### Quota Management
- [ ] T050 [US4] Add storage quota warnings in components/teleprompter/StorageQuota.tsx
- [ ] T051 [US4] Implement reduced quality recording when quota exceeded in hooks/useCameraRecorder.ts

### Testing
- [ ] T052 [US4] Add storage integration tests in lib/supabase/__tests__/storage.test.ts
- [ ] T053 [US4] Test quota enforcement in lib/supabase/__tests__/recordings.test.ts
- [ ] T054 [US4] Add API endpoint tests in app/api/recordings/__tests__/route.test.ts

## Final Phase: Polish & Integration

### Accessibility & Performance
- [ ] T055 Add keyboard navigation support for all camera controls in components/teleprompter/camera/
- [ ] T056 Implement screen reader labels and ARIA attributes in components/teleprompter/camera/
- [ ] T057 Add performance monitoring for video rendering in hooks/useCamera.ts
- [ ] T058 Optimize bundle size for camera components in next.config.js

### Cross-Browser Compatibility
- [ ] T059 Test Safari/iOS video format conversion end-to-end in app/api/recordings/convert/
- [ ] T060 Add Firefox-specific MediaRecorder workarounds in hooks/useCameraRecorder.ts
- [ ] T061 Implement progressive enhancement for older browsers in components/teleprompter/camera/

### Error Handling & Monitoring
- [ ] T062 Add comprehensive error boundaries for camera components in components/teleprompter/camera/ErrorBoundary.tsx
- [ ] T063 Implement user-friendly error messages for all failure scenarios in lib/utils/media-errors.ts
- [ ] T064 Add recording analytics and success rate tracking in lib/analytics/recording.ts

### Documentation & Deployment
- [ ] T065 Update component documentation and prop types in components/teleprompter/camera/
- [ ] T066 Add environment variable validation for Supabase credentials in lib/supabase/config.ts
- [ ] T067 Create deployment checklist for FFmpeg requirements in Vercel in docs/deployment/camera-recording.md

## Implementation Strategy

### MVP Scope (Recommended Start)
Complete **Phase 1 (Setup)** + **US1** + **US2** + **US3** for basic camera + recording functionality.

### Parallel Execution Guidelines
- **Setup Phase**: Can run parallel to foundational components
- **Within Each Story**: API work can parallel frontend component development
- **Testing**: Write tests parallel to implementation, not after

### Risk Mitigation
- **Start with Chrome**: Focus on primary browser first, add Safari compatibility later
- **Progressive Enhancement**: Core functionality works without advanced features
- **Error Boundaries**: Comprehensive error handling prevents crashes
- **Performance Monitoring**: Track metrics from day one

## Success Criteria Validation

Each user story includes specific success criteria that can be validated independently:

- **US1**: Camera enables within 30 seconds, video displays mirrored
- **US2**: Widget drags smoothly without blocking teleprompter text
- **US3**: Recording captures synchronized video/audio under 5 minutes
- **US4**: Uploads complete within 2 minutes, recordings accessible within 10 seconds

Tasks are designed to be executable by an LLM with clear file paths and specific deliverables.