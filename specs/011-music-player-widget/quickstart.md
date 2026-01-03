# Music Player Widget - Quick Start

**Feature**: 011-music-player-widget  
**Phase**: 1 - Design & Contracts  
**Status**: Ready for Implementation  
**Created**: 2026-01-03

---

## Overview

The floating music player widget enables background music playback in Runner mode with three visual styles (Capsule, Vinyl, and Spectrum). Music can be sourced from YouTube URLs or uploaded audio files (stored in Supabase). The widget is draggable, persists position across sessions, and syncs playback state across multiple browser tabs using BroadcastChannel API.

**Key Features**:
- Three widget styles with unique animations
- YouTube and file upload support
- Drag-and-drop positioning with inertia physics
- Cross-tab playback synchronization
- localStorage persistence + Supabase cloud sync

---

## Quick Start

### Step 1: Create the Zustand Store

Create `lib/stores/useMusicPlayerStore.ts` following the contract in [`contracts/music-player-store.md`](./contracts/music-player-store.md):

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useMusicPlayerStore = create<MusicPlayerStore>()(
  persist(
    (set, get) => ({
      // State
      sourceType: 'youtube',
      widgetStyle: 'capsule',
      playbackState: 'idle',
      position: { x: 0, y: 0 },
      isVisible: false,
      activeSource: null,
      error: null,
      isDragging: false,
      tabId: typeof crypto !== 'undefined' ? crypto.randomUUID() : '',

      // Actions
      play: () => set({ playbackState: 'playing' }),
      pause: () => set({ playbackState: 'paused' }),
      togglePlayback: () => {
        const s = get();
        s.playbackState === 'playing' ? s.pause() : s.play();
      },
      setPosition: (position) => set({ position }),
      // ... implement remaining actions
    }),
    {
      name: 'teleprompter-music',
      partialize: (state) => ({
        sourceType: state.sourceType,
        widgetStyle: state.widgetStyle,
        position: state.position,
      }),
    }
  )
);
```

### Step 2: Add Widget to Runner Mode

Update `components/teleprompter/Runner.tsx` to conditionally render the widget:

```typescript
import { useMusicPlayerStore } from '@/lib/stores/useMusicPlayerStore';
import { MusicPlayerWidget } from '@/components/teleprompter/music/MusicPlayerWidget';

export function Runner() {
  const isConfigured = useMusicPlayerStore((s) => s.isConfigured);
  const widgetStyle = useMusicPlayerStore((s) => s.widgetStyle);
  const position = useMusicPlayerStore((s) => s.position);
  const playbackState = useMusicPlayerStore((s) => s.playbackState);
  const togglePlayback = useMusicPlayerStore((s) => s.togglePlayback);
  const setPosition = useMusicPlayerStore((s) => s.setPosition);

  return (
    <div className="runner-container">
      {/* Teleprompter content */}
      <TeleprompterText />

      {/* Music player widget - only shows when configured */}
      {isConfigured && (
        <MusicPlayerWidget
          widgetStyle={widgetStyle}
          position={position}
          isPlaying={playbackState === 'playing'}
          error={null}
          isDragging={false}
          prefersReducedMotion={false}
          onPlayPauseToggle={togglePlayback}
          onPositionChange={setPosition}
          onDragStart={() => {}}
          onDragEnd={() => {}}
          onErrorDismiss={() => {}}
          onReconfigure={() => {}}
        />
      )}
    </div>
  );
}
```

### Step 3: Create Settings Panel

Add music configuration to the settings page (extend existing settings):

```typescript
import { useMusicPlayerStore } from '@/lib/stores/useMusicPlayerStore';

function MusicSettings() {
  const sourceType = useMusicPlayerStore((s) => s.sourceType);
  const youtubeUrl = useMusicPlayerStore((s) => s.youtubeUrl);
  const setSourceType = useMusicPlayerStore((s) => s.setSourceType);
  const setYoutubeUrl = useMusicPlayerStore((s) => s.setYoutubeUrl);

  return (
    <div className="music-settings">
      <h2>Background Music</h2>
      
      {/* Source selection */}
      <RadioGroup value={sourceType} onValueChange={setSourceType}>
        <RadioGroupItem value="youtube">YouTube URL</RadioGroupItem>
        <RadioGroupItem value="upload">Upload File</RadioGroupItem>
      </RadioGroup>

      {/* YouTube URL input */}
      {sourceType === 'youtube' && (
        <Input
          type="url"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
        />
      )}

      {/* File upload */}
      {sourceType === 'upload' && (
        <Input type="file" accept="audio/*" />
      )}

      {/* Style selection with previews */}
      <WidgetStyleSelector />
    </div>
  );
}
```

### Step 4: Set Up Supabase Storage

Create a Supabase Storage bucket for audio files:

```sql
-- Run in Supabase SQL editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-audio-files', 'user-audio-files', false);

-- Set up RLS policies
CREATE POLICY "Users can upload their own audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'user-audio-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can read their own audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-audio-files' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### Step 5: Add Keyboard Shortcut

Register the 'M' key shortcut in the keyboard shortcuts handler:

```typescript
// hooks/useKeyboardShortcuts.ts
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'm' || e.key === 'M') {
      const store = useMusicPlayerStore.getState();
      if (store.isConfigured) {
        store.togglePlayback();
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

---

## File Structure

### New Files to Create

```
lib/
  stores/
    useMusicPlayerStore.ts          # Zustand store with persistence
  music/
    broadcastChannel.ts              # BroadcastChannel manager
    audioSourceValidation.ts         # URL and file validation
    widgetDimensions.ts              # Widget size constants

components/teleprompter/music/
  MusicPlayerWidget.tsx              # Main widget component
  styles/
    CapsuleWidget.tsx                # Capsule style implementation
    VinylWidget.tsx                  # Vinyl style implementation
    SpectrumWidget.tsx               # Spectrum style implementation
  settings/
    MusicSettingsPanel.tsx           # Settings UI
    WidgetStyleSelector.tsx          # Style selector with previews
    YouTubeUrlInput.tsx              # YouTube URL input with validation
    FileUploadInput.tsx              # File upload with quota management

__tests__/
  unit/stores/musicPlayerStore.test.ts
  unit/music/audioSourceValidation.test.ts
  integration/music/broadcastChannel.test.ts
  integration/music/widgetDrag.test.ts
```

### Files to Modify

```
components/teleprompter/Runner.tsx     # Add widget rendering
hooks/useKeyboardShortcuts.ts          # Add 'M' key handler
lib/supabase/storage.ts                # Add audio file upload/delete
messages/en.json                       # Add translation keys
tailwind.config.ts                     # Add widget animation classes
```

---

## Integration Points

### 1. Existing Runner Component

**File**: [`components/teleprompter/Runner.tsx`](../../components/teleprompter/Runner.tsx)

**Changes**:
- Import `useMusicPlayerStore`
- Conditionally render `MusicPlayerWidget` when `isConfigured === true`
- Ensure widget has proper z-index to float above teleprompter text

### 2. Keyboard Shortcuts Hook

**File**: [`hooks/useKeyboardShortcuts.ts`](../../hooks/useKeyboardShortcuts.ts)

**Changes**:
- Add case for 'M' key to toggle music playback
- Only trigger when music is configured
- Prevent conflict with existing shortcuts

### 3. Supabase Storage

**File**: [`lib/supabase/storage.ts`](../../lib/supabase/storage.ts)

**Changes**:
- Add `uploadAudioFile(file, userId)` function
- Add `deleteAudioFile(fileId, userId)` function
- Add `getAudioStorageUsage(userId)` function
- Enforce 50MB per file and 500MB total quotas

### 4. Error Toasts

**Pattern**: Use existing `toast` from Sonner (already in codebase)

```typescript
import { toast } from 'sonner';

// Example usage
toast.error('YouTube video unavailable', {
  description: 'The video may have been removed',
  action: {
    label: 'Reconfigure',
    onClick: () => router.push('/settings?tab=music'),
  },
});
```

---

## Usage Example

### Basic Configuration

```typescript
import { useMusicPlayerStore } from '@/lib/stores/useMusicPlayerStore';

function MyComponent() {
  const setSourceType = useMusicPlayerStore((s) => s.setSourceType);
  const setYoutubeUrl = useMusicPlayerStore((s) => s.setYoutubeUrl);
  const setWidgetStyle = useMusicPlayerStore((s) => s.setWidgetStyle);

  const configureMusic = () => {
    setSourceType('youtube');
    setYoutubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    setWidgetStyle('capsule');
  };

  return <button onClick={configureMusic}>Configure Music</button>;
}
```

### Widget Rendering

```typescript
import { MusicPlayerWidget } from '@/components/teleprompter/music/MusicPlayerWidget';

<MusicPlayerWidget
  widgetStyle="capsule"
  position={{ x: 100, y: 100 }}
  isPlaying={true}
  error={null}
  isDragging={false}
  prefersReducedMotion={false}
  onPlayPauseToggle={() => store.togglePlayback()}
  onPositionChange={(pos) => store.setPosition(pos)}
  onDragStart={() => store.setDragging(true)}
  onDragEnd={() => store.setDragging(false)}
  onErrorDismiss={() => store.clearError()}
  onReconfigure={() => router.push('/settings?tab=music')}
/>
```

---

## Testing Checklist

### Unit Tests

- [ ] Store actions (play, pause, toggle, setStyle, setPosition)
- [ ] YouTube URL validation (valid formats, invalid formats, empty)
- [ ] Audio file validation (size limits, MIME types, formats)
- [ ] File quota checking
- [ ] BroadcastChannel message handling

### Integration Tests

- [ ] Widget drag-and-drop with position persistence
- [ ] Cross-tab playback sync (one tab starts, others pause)
- [ ] Settings → Store persistence flow
- [ ] Error handling (invalid URL, file too large, network errors)

### E2E Tests

- [ ] Complete workflow: configure music → enter runner → play/pause → drag widget
- [ ] Keyboard shortcut ('M' key) toggles playback
- [ ] Widget position persists across page refreshes
- [ ] Different widget styles render correctly

### Accessibility Tests

- [ ] Widget is keyboard navigable
- [ ] ARIA labels are present and descriptive
- [ ] Reduced motion preference is respected
- [ ] Error messages are announced to screen readers

---

## Key Dependencies

### Required Packages

```json
{
  "dependencies": {
    "zustand": "^4.4.0",
    "framer-motion": "^10.16.0",
    "sonner": "^1.0.0",
    "react-player": "^2.12.0"
  }
}
```

### Install Command

```bash
npm install zustand framer-motion sonner react-player
```

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Widget rendering | ✅ 54+ | ✅ 52+ | ✅ 15+ | ✅ 79+ |
| BroadcastChannel | ✅ 54+ | ✅ 38+ | ✅ 15.4+ | ✅ 79+ |
| Web Audio API | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| ReactPlayer (YouTube) | ✅ Full | ✅ Full | ⚠️ No BG play | ✅ Full |

**Note**: Safari < 15.4 gracefully degrades - music works but without cross-tab sync.

---

## Common Issues & Solutions

### Issue: Widget doesn't appear in Runner mode

**Solution**: Check that `isConfigured` is `true` in the store. The widget only shows when a music source has been configured.

### Issue: YouTube video won't play

**Solution**: YouTube requires user interaction before autoplay on mobile. Ensure the user has clicked play at least once.

### Issue: Cross-tab sync not working

**Solution**: Check browser console for BroadcastChannel support warning. Safari < 15.4 doesn't support this API.

### Issue: Widget position is lost on refresh

**Solution**: Ensure the `partialize` function in zustand persist includes the `position` field.

### Issue: File upload fails with quota error

**Solution**: User has exceeded 500MB total quota. Delete existing files or upgrade storage.

---

## Related Documents

- **Feature Specification**: [`specs/011-music-player-widget/spec.md`](./spec.md)
- **Technical Research**: [`specs/011-music-player-widget/research.md`](./research.md)
- **Data Model**: [`specs/011-music-player-widget/data-model.md`](./data-model.md)
- **Contracts Directory**: [`specs/011-music-player-widget/contracts/`](./contracts/)

---

## Next Steps

1. **Review all contract documents** in the [`contracts/`](./contracts/) directory
2. **Implement the Zustand store** following the store contract
3. **Build the widget component** with all three styles
4. **Add settings UI** for music configuration
5. **Set up Supabase Storage** bucket and RLS policies
6. **Write tests** for all validation and sync logic
7. **Test cross-browser** compatibility

---

**Document Status**: ✅ Complete  
**Ready for**: Implementation Phase (Code mode)
