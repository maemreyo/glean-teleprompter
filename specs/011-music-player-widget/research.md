# Music Player Widget - Technical Research

**Feature**: 011-music-player-widget  
**Research Date**: 2026-01-03  
**Status**: Complete

---

## Executive Summary

This document provides technical recommendations for 7 critical unknowns in the music player widget feature. Research includes codebase analysis of existing patterns (storage, error handling, audio playback) and evaluation of browser capabilities and third-party solutions.

**Key Findings**:
- **YouTube Audio**: Use existing ReactPlayer approach (already in codebase) - no audio extraction needed
- **Spectrum Visualizer**: Simulated animation required for YouTube; real frequency analysis only for uploaded files
- **Storage Quota**: 50MB per file limit recommended; existing Supabase storage + localStorage patterns available
- **Tempo Detection**: Manual BPM input with preset speeds recommended over unreliable auto-detection
- **Tab Communication**: Implement new BroadcastChannel API (no existing pattern in codebase)
- **Widget Dimensions**: Specific sizes recommended for each style (Capsule: 280x80px, Vinyl: 200x200px, Spectrum: 320x120px)
- **Error Recovery**: Use Sonner toast notifications (existing pattern in codebase)

---

## 1. YouTube Audio Extraction

**Decision**: Use YouTube IFrame API via ReactPlayer library (playback only, no audio extraction)

**Rationale**: 
- **Browser Security**: CORS policies prevent direct audio stream access from YouTube
- **YouTube ToS**: Audio extraction violates YouTube Terms of Service
- **Existing Solution**: Codebase already uses [`ReactPlayer`](components/teleprompter/audio/AudioPlayer.tsx:5) for YouTube audio in [`AudioPlayer.tsx`](components/teleprompter/audio/AudioPlayer.tsx:1-86)
- **Sufficient UX**: Background music playback works without audio-only extraction

**Alternatives Considered**:
- **Audio-only extraction services** (ytdl-core, youtube-dl): Require backend proxy, violate YouTube ToS, high maintenance burden, can be blocked by YouTube
- **Direct video playback with hidden iframe**: Chosen approach - ReactPlayer handles this already
- **Server-side audio processing**: Adds infrastructure cost, latency, and legal risk

**Implementation Notes**:
```typescript
// Use existing pattern from AudioPlayer.tsx
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

// Hidden iframe approach
<div className="hidden">
  <ReactPlayer
    url={youtubeUrl}
    playing={isPlaying}
    loop={true}
    volume={volume}
    width="0"
    height="0"
    config={{
      youtube: {
        disablekb: 1,
        rel: 0,
        iv_load_policy: 3,
        cc_load_policy: 1
      }
    }}
  />
</div>
```
- **Mobile Autoplay Policy**: YouTube requires user interaction before autoplay on mobile
- **Background Play**: iOS Safari may pause hidden iframes when tab is backgrounded
- **Error Handling**: ReactPlayer provides `onError` callback for invalid/removed videos

---

## 2. Spectrum Visualizer CORS Limitation

**Decision**: Hybrid approach - simulated CSS animation for YouTube, real Web Audio API for uploaded files

**Rationale**:
- **YouTube CORS Restriction**: YouTube iframe API doesn't expose audio data for frequency analysis
- **Web Audio API Requirement**: `createMediaElementSource()` requires direct audio element access with CORS-enabled audio
- **Uploaded Files**: Full CORS control enables real frequency analysis using AnalyserNode

**Alternatives Considered**:
- **Simulated visualization for all sources**: Loses "wow factor" for uploaded files
- **Proxy YouTube audio**: Adds backend complexity, violates YouTube ToS
- **Remove spectrum style**: Degrades feature value; spec requires 3 styles

**Implementation Notes**:

**For YouTube (Simulated)**:
```typescript
// Use Framer Motion for rhythmic bar animation
// Generate pseudo-random pattern synchronized to playback state
const bars = Array.from({ length: 16 }, (_, i) => i);

{bars.map((i) => (
  <motion.div
    key={i}
    animate={isPlaying ? {
      height: [20, 60 + Math.random() * 40, 20],
    } : { height: 20 }}
    transition={{
      duration: 0.5,
      repeat: Infinity,
      delay: i * 0.05,
      ease: "easeInOut"
    }}
    className="w-2 bg-linear-to-t from-purple-500 to-pink-500 rounded-full"
  />
))}
```

**For Uploaded Files (Real Frequency Analysis)**:
```typescript
// Web Audio API with CORS-enabled audio
useEffect(() => {
  if (!audioRef.current || !isUploadedFile) return;

  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaElementSource(audioRef.current);
  
  source.connect(analyser);
  analyser.connect(audioContext.destination);
  
  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  const animate = () => {
    analyser.getByteFrequencyData(dataArray);
    // Update bar heights from dataArray
    requestAnimationFrame(animate);
  };
  
  animate();
}, [isUploadedFile, audioRef]);
```

**Browser Compatibility**: Web Audio API supported in 98%+ of modern browsers

---

## 3. Storage Quota

**Decision**: 50MB per audio file limit, stored in Supabase Storage (not localStorage)

**Rationale**:
- **localStorage Limits**: Browser limits range 5-10MB total (Safari: 5MB, Firefox: 10MB, Chrome: unlimited but impractical for blobs)
- **Existing Pattern**: [`lib/storage/storageQuota.ts`](lib/storage/storageQuota.ts:1-242) shows browser-specific quota management for text data only
- **Supabase Storage**: Project already uses Supabase for cloud storage; extend for audio files
- **50MB Limit**: Balance between audio quality (128-320kbps MP3) and storage costs

**Alternatives Considered**:
- **localStorage for audio**: Not viable - would exceed quota with 1-2 songs
- **IndexedDB**: More complex, still local-only, no cloud sync
- **External CDN**: Adds dependency, Supabase already available

**Implementation Notes**:

**Storage Architecture**:
```
localStorage: Music configuration only (< 1KB)
├── musicSourceType: 'youtube' | 'upload'
├── youtubeUrl: string (if YouTube)
├── uploadedFileId: string (if uploaded)
├── widgetStyle: 'capsule' | 'vinyl' | 'spectrum'
├── widgetPosition: { x: number, y: number }
└── vinylBPM?: number (user-set tempo)

Supabase Storage: Audio files
├── Bucket: user-audio-files
│   └── Path: {userId}/{fileId}.mp3
└── Quota: 50MB per file, 500MB total per user
```

**Quota Enforcement**:
```typescript
// Extend existing storageQuota.ts pattern
export const AUDIO_FILE_LIMIT = 50 * 1024 * 1024; // 50MB
export const AUDIO_TOTAL_LIMIT = 500 * 1024 * 1024; // 500MB

export async function uploadAudioFile(
  file: File,
  userId: string
): Promise<string> {
  // Validate file size
  if (file.size > AUDIO_FILE_LIMIT) {
    throw new QuotaExceededError(
      `Audio file exceeds ${AUDIO_FILE_LIMIT / 1024 / 1024}MB limit`
    );
  }
  
  // Check total usage
  const { data: existingFiles } = await supabase
    .storage
    .from('user-audio-files')
    .list(userId);
    
  const totalSize = existingFiles?.reduce((sum, f) => sum + (f.metadata?.size || 0), 0) || 0;
  
  if (totalSize + file.size > AUDIO_TOTAL_LIMIT) {
    throw new QuotaExceededError(
      `Total audio storage would exceed ${AUDIO_TOTAL_LIMIT / 1024 / 1024}MB limit. Delete existing files to upload more.`
    );
  }
  
  // Upload with unique ID
  const fileId = crypto.randomUUID();
  const filePath = `${userId}/${fileId}${getExtension(file.name)}`;
  
  const { error } = await supabase.storage
    .from('user-audio-files')
    .upload(filePath, file);
    
  if (error) throw error;
  
  return fileId;
}
```

**Error Handling**: Use existing [`QuotaExceededError`](lib/storage/types.ts:95-97) pattern from draft storage

---

## 4. Tempo Detection

**Decision**: Manual BPM input with preset speeds (33⅓, 45, 78 RPM)

**Rationale**:
- **Browser Accuracy**: Web Audio API beat detection libraries (web-audio-beat-detector, bpm-detect) have 60-70% accuracy
- **Performance**: Real-time tempo analysis consumes CPU, affecting teleprompter scrolling
- **User Control**: Manual input ensures vinyl rotation matches user's rhythmic preference
- **Classic Metaphor**: 33⅓, 45, 78 RPM presets align with vinyl record conventions

**Alternatives Considered**:
- **Auto BPM detection**: Unreliable accuracy, performance overhead, requires full audio download first
- **Fixed rotation speed**: Loses personalization, doesn't match music energy
- **Machine learning models**: Overkill, large library size, still imperfect

**Implementation Notes**:

```typescript
// Vinyl rotation speed presets
type VinylSpeed = '33-1/3' | '45' | '78' | 'custom';

interface VinylConfig {
  speed: VinylSpeed;
  customBPM?: number; // Only used if speed === 'custom'
}

// Rotation calculations
const RPM_TO_RADIANS_PER_MS = {
  '33-1/3': (2 * Math.PI) / (60 / (33 + 1/3) * 1000), // ~0.0035 rad/ms
  '45': (2 * Math.PI) / (60 / 45 * 1000), // ~0.0047 rad/ms
  '78': (2 * Math.PI) / (60 / 78 * 1000), // ~0.0082 rad/ms
};

// Framer Motion animation
const rotation = useMotionValue(0);

useEffect(() => {
  if (!isPlaying) return;
  
  const speed = RPM_TO_RADIANS_PER_MS[config.speed] || 
    RPM_TO_RADIANS_PER_MS['45'];
  
  let lastTime = performance.now();
  let rafId: number;
  
  const animate = (time: number) => {
    const delta = time - lastTime;
    rotation.set(rotation.get() + speed * delta);
    lastTime = time;
    rafId = requestAnimationFrame(animate);
  };
  
  rafId = requestAnimationFrame(animate);
  return () => cancelAnimationFrame(rafId);
}, [isPlaying, config.speed]);

// Deceleration on pause (simulating vinyl friction)
const rotateTo = useTransform(rotation, (r) => `${r}deg`);

<motion.div
  style={{ rotate: useSpring(rotateTo, { damping: 20, stiffness: 100 }) }}
  animate={isPlaying ? { rotate: rotation.get() } : {}}
  transition={{ type: 'spring', damping: 30 }}
  className="vinyl-record"
/>
```

**UI Component**:
```typescript
// Speed selector in settings
<Select value={speed} onValueChange={setSpeed}>
  <SelectItem value="33-1/3">33⅓ RPM (Album)</SelectItem>
  <SelectItem value="45">45 RPM (Single)</SelectItem>
  <SelectItem value="78">78 RPM (Vintage)</SelectItem>
  <SelectItem value="custom">
    Custom BPM
    {speed === 'custom' && (
      <Input
        type="number"
        value={customBPM}
        onChange={(e) => setCustomBPM(Number(e.target.value))}
        min={60}
        max={200}
      />
    )}
  </SelectItem>
</Select>
```

---

## 5. Tab Communication

**Decision**: Implement new BroadcastChannel API for cross-tab music state sync

**Rationale**:
- **No Existing Pattern**: Codebase search found no BroadcastChannel or cross-tab sync in [`lib/stores/`](lib/stores/)
- **Browser Support**: BroadcastChannel API supported in 95%+ of modern browsers (Chrome 54+, Firefox 38+, Safari 15.4+)
- **Lightweight**: No server required, direct browser-to-browser communication
- **Spec Requirement**: FR-023 requires pausing audio in other tabs when playback starts

**Alternatives Considered**:
- **localStorage events**: Legacy approach, only fires on same-origin storage changes, not real-time
- **SharedWorker**: More complex setup, overkill for simple state sync
- **Server-side polling**: Adds latency, infrastructure cost, unnecessary complexity

**Implementation Notes**:

```typescript
// lib/stores/useMusicStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MUSIC_CHANNEL = 'teleprompter-music-sync';

// BroadcastChannel singleton
let musicChannel: BroadcastChannel | null = null;

function getMusicChannel() {
  if (!musicChannel && typeof BroadcastChannel !== 'undefined') {
    musicChannel = new BroadcastChannel(MUSIC_CHANNEL);
  }
  return musicChannel;
}

interface MusicState {
  isPlaying: boolean;
  sourceType: 'youtube' | 'upload';
  sourceUrl: string;
  tabId: string;
}

interface MusicActions {
  setIsPlaying: (playing: boolean) => void;
  setSource: (type: 'youtube' | 'upload', url: string) => void;
}

export const useMusicStore = create<MusicState & MusicActions>()(
  persist(
    (set, get) => {
      // Generate unique tab ID on mount
      const tabId = crypto.randomUUID();
      
      // Listen for messages from other tabs
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = getMusicChannel();
        
        channel.onmessage = (event) => {
          const { type, payload, senderTabId } = event.data;
          
          // Ignore messages from this tab
          if (senderTabId === tabId) return;
          
          switch (type) {
            case 'PLAYBACK_STARTED':
              // Pause playback in this tab
              if (get().isPlaying) {
                set({ isPlaying: false });
              }
              break;
              
            case 'PLAYBACK_STOPPED':
              // Optional: Resume if this was the original tab?
              // For now, just keep state in sync
              break;
              
            case 'SOURCE_CHANGED':
              // Update source reference
              set({
                sourceType: payload.sourceType,
                sourceUrl: payload.sourceUrl,
              });
              break;
          }
        };
      }
      
      return {
        // State
        isPlaying: false,
        sourceType: 'youtube',
        sourceUrl: '',
        tabId,
        
        // Actions
        setIsPlaying: (playing) => {
          set({ isPlaying: playing });
          
          // Notify other tabs
          const channel = getMusicChannel();
          channel.postMessage({
            type: playing ? 'PLAYBACK_STARTED' : 'PLAYBACK_STOPPED',
            senderTabId: tabId,
            timestamp: Date.now(),
          });
        },
        
        setSource: (sourceType, sourceUrl) => {
          set({ sourceType, sourceUrl });
          
          // Notify other tabs
          const channel = getMusicChannel();
          channel.postMessage({
            type: 'SOURCE_CHANGED',
            payload: { sourceType, sourceUrl },
            senderTabId: tabId,
            timestamp: Date.now(),
          });
        },
      };
    },
    {
      name: 'teleprompter-music',
      partialize: (state) => ({
        sourceType: state.sourceType,
        sourceUrl: state.sourceUrl,
        // Don't persist isPlaying or tabId
      }),
    }
  )
);

// Cleanup on unmount
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    getMusicChannel()?.close();
  });
}
```

**Fallback for Older Browsers**:
```typescript
// Graceful degradation for Safari < 15.4
if (typeof BroadcastChannel === 'undefined') {
  console.warn('BroadcastChannel not supported - cross-tab sync disabled');
  // Music still works, just without multi-tab coordination
}
```

---

## 6. Widget Dimensions

**Decision**: Style-specific dimensions optimized for mobile and desktop

**Rationale**:
- **Touch Targets**: Minimum 44x44px per WCAG 2.1 accessibility guidelines
- **Visual Hierarchy**: Widget must be visible but not obstruct teleprompter text
- **Mobile Constraints**: Maximum widget width should be < 90% of viewport width
- **Aspect Ratios**: Each style has different optimal aspect ratio

**Alternatives Considered**:
- **Uniform size across styles**: Doesn't account for style-specific needs (vinyl needs to be circular)
- **Responsive units only**: Lacks pixel precision for drag boundary calculations
- **User-configurable size**: Adds UI complexity, spec doesn't require it

**Implementation Notes**:

```typescript
// lib/music/widgetDimensions.ts

export interface WidgetDimensions {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export const WIDGET_DIMENSIONS: Record<
  'capsule' | 'vinyl' | 'spectrum',
  WidgetDimensions
> = {
  // Capsule: Horizontal pill shape
  capsule: {
    width: 280,        // Fits mobile screens (320px minimum)
    height: 80,        // Accommodates play/pause button + drag handle
    minWidth: 240,     // Minimum for touch targets
    minHeight: 72,     // Minimum for 44px touch target + padding
    maxWidth: 400,     // Don't dominate desktop screens
    maxHeight: 96,     // Don't obscure too much text
  },
  
  // Vinyl: Circular record
  vinyl: {
    width: 200,        // 200px diameter (classic record aesthetic)
    height: 200,       // Perfect circle
    minWidth: 160,     // Smaller for mobile
    minHeight: 160,    // Maintain aspect ratio
    maxWidth: 280,     // Larger for desktop
    maxHeight: 280,    // Maintain aspect ratio
  },
  
  // Spectrum: Wide frequency display
  spectrum: {
    width: 320,        // Width for 16 bars (20px each + gaps)
    height: 120,       // Height for frequency visualization
    minWidth: 280,     // Minimum for 8 bars (scaled down mobile)
    minHeight: 100,    // Minimum bar visibility
    maxWidth: 480,     // Wider on desktop
    maxHeight: 160,    // Don't obscure text
  },
};

// Responsive adjustments
export function getResponsiveDimensions(
  style: 'capsule' | 'vinyl' | 'spectrum',
  viewportWidth: number
): WidgetDimensions {
  const base = WIDGET_DIMENSIONS[style];
  
  // Mobile adjustment (< 480px)
  if (viewportWidth < 480) {
    return {
      ...base,
      width: Math.min(base.width, viewportWidth * 0.85),
      height: Math.min(base.height, viewportWidth * 0.3),
    };
  }
  
  return base;
}

// Drag boundary constraints
export function constrainPosition(
  x: number,
  y: number,
  widgetWidth: number,
  widgetHeight: number,
  viewportWidth: number,
  viewportHeight: number
): { x: number; y: number } {
  // Ensure at least 50% of widget is visible (FR-014)
  const minX = -widgetWidth / 2;
  const maxX = viewportWidth - widgetWidth / 2;
  const minY = -widgetHeight / 2;
  const maxY = viewportHeight - widgetHeight / 2;
  
  return {
    x: Math.max(minX, Math.min(maxX, x)),
    y: Math.max(minY, Math.min(maxY, y)),
  };
}
```

**CSS Implementation**:
```css
/* Capsule style */
.music-widget-capsule {
  width: 280px;
  height: 80px;
  border-radius: 40px; /* Fully rounded ends */
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.1);
}

/* Vinyl style */
.music-widget-vinyl {
  width: 200px;
  height: 200px;
  border-radius: 50%; /* Perfect circle */
}

/* Spectrum style */
.music-widget-spectrum {
  width: 320px;
  height: 120px;
  border-radius: 16px; /* Rounded corners */
}

/* Mobile responsive */
@media (max-width: 480px) {
  .music-widget-capsule {
    width: 85vw;
    height: 24vw;
    min-height: 72px;
  }
  
  .music-widget-vinyl {
    width: 44vw;
    height: 44vw;
    max-width: 200px;
    max-height: 200px;
  }
  
  .music-widget-spectrum {
    width: 85vw;
    height: 32vw;
    min-height: 100px;
  }
}
```

---

## 7. Error Recovery UX

**Decision**: Inline error within widget + Sonner toast notification (existing pattern)

**Rationale**:
- **Consistency**: Project uses [`Sonner toast`](components/teleprompter/runner/QuickSettingsPanel.tsx:26) for errors (see [`QuickSettingsPanel.tsx:72`](components/teleprompter/runner/QuickSettingsPanel.tsx:72))
- **Visibility**: Inline error shows directly in widget; toast provides additional context
- **Non-blocking**: Widget remains draggable with error state; user can reconfigure
- **Accessibility**: Toast announcements are screen reader friendly

**Alternatives Considered**:
- **Modal dialog**: Too intrusive, blocks teleprompter workflow
- **Inline only**: May be missed if widget is minimized or off-screen
- **Toast only**: Widget appears broken with no visible error indicator

**Implementation Notes**:

```typescript
// components/music/MusicPlayerWidget.tsx
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

type MusicError = 
  | { type: 'youtube_unavailable'; url: string }
  | { type: 'youtube_invalid_url'; url: string }
  | { type: 'file_not_found'; fileId: string }
  | { type: 'file_unsupported'; format: string }
  | { type: 'network_error'; message: string }
  | null;

export function MusicPlayerWidget() {
  const t = useTranslations('MusicWidget');
  const [error, setError] = useState<MusicError>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Error handler for ReactPlayer
  const handleError = (err: Error | unknown) => {
    console.error('[MusicWidget] Playback error:', err);
    
    // Determine error type
    let errorType: MusicError;
    
    if (sourceType === 'youtube') {
      errorType = { type: 'youtube_unavailable', url: sourceUrl };
      
      // Show toast notification
      toast.error(t('errors.youtubeUnavailable'), {
        description: t('errors.youtubeUnavailableDesc'),
        action: {
          label: t('errors.reconfigure'),
          onClick: () => router.push('/settings?tab=music'),
        },
        duration: 5000,
      });
    } else if (sourceType === 'upload') {
      errorType = { type: 'file_not_found', fileId: uploadedFileId };
      
      toast.error(t('errors.fileNotFound'), {
        description: t('errors.fileNotFoundDesc'),
        action: {
          label: t('errors.reconfigure'),
          onClick: () => router.push('/settings?tab=music'),
        },
        duration: 5000,
      });
    } else {
      errorType = { type: 'network_error', message: String(err) };
      
      toast.error(t('errors.networkError'), {
        description: t('errors.networkErrorDesc'),
        duration: 5000,
      });
    }
    
    setError(errorType);
    setIsPlaying(false);
  };
  
  return (
    <div
      className={cn(
        'music-widget',
        style,
        error && 'music-widget-error' // Red border/shadow
      )}
      style={position}
    >
      {/* Inline error indicator */}
      {error && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg">
          <AlertCircle className="w-4 h-4" />
        </div>
      )}
      
      {/* Inline error message on hover */}
      {error && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-red-500/95 text-white text-xs px-3 py-2 rounded-lg shadow-xl z-50">
          <p className="font-medium">
            {error.type === 'youtube_unavailable' && t('errors.youtubeUnavailable')}
            {error.type === 'file_not_found' && t('errors.fileNotFound')}
            {error.type === 'network_error' && t('errors.networkError')}
          </p>
          <button
            onClick={() => router.push('/settings?tab=music')}
            className="underline mt-1 hover:text-white/80"
          >
            {t('errors.reconfigure')}
          </button>
        </div>
      )}
      
      {/* Player controls */}
      {!error ? (
        <ReactPlayer
          url={sourceType === 'youtube' ? sourceUrl : uploadedFileUrl}
          playing={isPlaying}
          onError={handleError}
          // ... other props
        />
      ) : (
        <div className="error-placeholder">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-sm">{t('playbackFailed')}</p>
        </div>
      )}
    </div>
  );
}
```

**Error Message Pattern** (consistent with existing codebase):
```typescript
// Similar to QuickSettingsPanel.tsx error handling
try {
  // Music operation
} catch (error) {
  toast.error(t('errors.operationFailed'), {
    description: error instanceof Error ? error.message : t('errors.unknownError'),
    duration: 5000, // T047 [Phase 6]: 5-second visibility
  });
}
```

**Translation Keys** (to add to `messages/en.json`):
```json
{
  "MusicWidget": {
    "errors": {
      "youtubeUnavailable": "YouTube video unavailable",
      "youtubeUnavailableDesc": "The video may have been removed or is not accessible.",
      "youtubeInvalidUrl": "Invalid YouTube URL",
      "youtubeInvalidUrlDesc": "Please check the URL and try again.",
      "fileNotFound": "Audio file not found",
      "fileNotFoundDesc": "The uploaded file may have been deleted.",
      "fileUnsupported": "Unsupported audio format",
      "fileUnsupportedDesc": "Supported formats: MP3, WAV, M4A, OGG",
      "networkError": "Network error",
      "networkErrorDesc": "Check your internet connection and try again.",
      "reconfigure": "Reconfigure Music"
    }
  }
}
```

---

## Summary of Technical Decisions

| Unknown | Decision | Key Technology |
|---------|----------|----------------|
| 1. YouTube Audio | Use ReactPlayer with hidden iframe (no extraction) | [`react-player`](components/teleprompter/audio/AudioPlayer.tsx:5) |
| 2. Spectrum Visualizer | Simulated for YouTube, real Web Audio API for uploads | Framer Motion, Web Audio API |
| 3. Storage Quota | 50MB/file in Supabase Storage, config in localStorage | Supabase Storage, [`storageQuota.ts`](lib/storage/storageQuota.ts:1) |
| 4. Tempo Detection | Manual BPM with RPM presets (33⅓, 45, 78) | Framer Motion springs |
| 5. Tab Communication | New BroadcastChannel API implementation | BroadcastChannel API |
| 6. Widget Dimensions | Style-specific sizes (Capsule: 280×80, Vinyl: 200×200, Spectrum: 320×120) | CSS + TypeScript constraints |
| 7. Error Recovery | Inline error + Sonner toast (existing pattern) | [`toast`](components/teleprompter/runner/QuickSettingsPanel.tsx:26) from sonner |

---

## Browser Compatibility Matrix

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| ReactPlayer (YouTube) | ✅ Full | ✅ Full | ⚠️ No background play | ✅ Full |
| Web Audio API | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| BroadcastChannel | ✅ 54+ | ✅ 38+ | ✅ 15.4+ | ✅ 79+ |
| Framer Motion | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Supabase Storage | ✅ Full | ✅ Full | ✅ Full | ✅ Full |

**Target**: 98% browser compatibility (as specified in feature requirements)

---

## Next Steps

1. **Review and approve** these technical recommendations
2. **Create detailed implementation plan** based on these decisions
3. **Set up Supabase Storage bucket** for audio files
4. **Implement BroadcastChannel** for tab sync
5. **Build widget components** with specified dimensions
6. **Test cross-browser** compatibility, especially Safari background play limitations

---

## References

- **Existing Codebase Patterns**:
  - [`AudioPlayer.tsx`](components/teleprompter/audio/AudioPlayer.tsx:1) - YouTube playback strategy
  - [`storageQuota.ts`](lib/storage/storageQuota.ts:1) - Quota management utilities
  - [`QuickSettingsPanel.tsx`](components/teleprompter/runner/QuickSettingsPanel.tsx:26) - Error handling with Sonner
  - [`CameraWidget.tsx`](components/teleprompter/camera/CameraWidget.tsx:1) - Draggable widget pattern (280×380px)
  
- **External Documentation**:
  - [ReactPlayer Documentation](https://github.com/cookpete/react-player)
  - [Web Audio API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
  - [BroadcastChannel API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel_API)
  - [Framer Motion Documentation](https://www.framer.com/motion/)
  - [Sonner Documentation](https://sonner.emilkowal.ski/)

---

**Document Status**: ✅ Research Complete  
**Ready for**: Implementation Planning
