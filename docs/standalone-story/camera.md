Đây là **tính năng killer** biến teleprompter thành content creation tool! Tôi sẽ phân tích chi tiết:

---

## Camera Recording Architecture

### 1. Layer Stack (Từ dưới lên)

```
<CameraRecordingContainer>
  │
  ├─ Layer 1 (z-0): <VideoPreview> // Camera feed
  │   └─ <video autoplay playsinline muted>
  │
  ├─ Layer 2 (z-10): <TeleprompterOverlay> // Text với opacity
  │   ├─ <FocalPointGuide />
  │   └─ <ScrollingText />
  │
  ├─ Layer 3 (z-20): <RecordingControls>
  │   ├─ <RecordButton />
  │   ├─ <FlipCameraButton />
  │   └─ <CountdownTimer />
  │
  └─ Layer 4 (z-30): <RecordingIndicator>
      └─ Red dot + Timer
```

### 2. Core Implementation

```typescript
interface CameraRecordingState {
  // Camera stream
  mediaStream: MediaStream | null;
  videoTrack: MediaStreamTrack | null;
  
  // Recording
  mediaRecorder: MediaRecorder | null;
  isRecording: boolean;
  recordedChunks: Blob[];
  recordingDuration: number;
  
  // Camera settings
  facingMode: 'user' | 'environment'; // Selfie vs back camera
  resolution: { width: number; height: number };
  
  // Teleprompter sync
  isTeleprompterActive: boolean;
  textOpacity: number; // 0.7-0.9 để thấy mặt phía sau
}
```

### 3. Camera Setup Hook

```typescript
const useCameraStream = (facingMode: 'user' | 'environment') => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        // Request camera permission
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30, max: 60 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100
          }
        });

        currentStream = mediaStream;
        setStream(mediaStream);

        // Gắn stream vào video element
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

      } catch (err) {
        console.error('Camera error:', err);
        setError(
          err.name === 'NotAllowedError' 
            ? 'Camera permission denied' 
            : 'Camera not available'
        );
      }
    };

    startCamera();

    // Cleanup
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  return { stream, videoRef, error };
};
```

### 4. MediaRecorder Implementation

```typescript
const useMediaRecorder = (stream: MediaStream | null) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(() => {
    if (!stream) return;

    try {
      // Kiểm tra codec support
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 5000000, // 5 Mbps - Chất lượng cao
      });

      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        setRecordedChunks(chunks);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recorder.start(100); // Lấy data mỗi 100ms
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      // Timer
      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds += 1;
        setDuration(seconds);
      }, 1000);

    } catch (err) {
      console.error('Recording error:', err);
    }
  }, [stream]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const downloadVideo = useCallback(() => {
    if (recordedChunks.length === 0) return;

    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `teleprompter-${Date.now()}.webm`;
    a.click();
    
    URL.revokeObjectURL(url);
  }, [recordedChunks]);

  return {
    isRecording,
    duration,
    startRecording,
    stopRecording,
    downloadVideo,
    hasRecording: recordedChunks.length > 0
  };
};
```

### 5. Complete Component

```typescript
const CameraRecordingTeleprompter = ({ script }) => {
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [textOpacity, setTextOpacity] = useState(0.85);
  const [showCountdown, setShowCountdown] = useState(false);

  // Camera
  const { stream, videoRef, error: cameraError } = useCameraStream(facingMode);
  
  // Recording
  const { 
    isRecording, 
    duration, 
    startRecording, 
    stopRecording, 
    downloadVideo,
    hasRecording 
  } = useMediaRecorder(stream);

  // Teleprompter
  const [isScrolling, setIsScrolling] = useState(false);
  const [speed, setSpeed] = useState(1.5);

  // Countdown trước khi record
  const handleStartWithCountdown = () => {
    setShowCountdown(true);
    let count = 3;
    
    const interval = setInterval(() => {
      count--;
      if (count === 0) {
        clearInterval(interval);
        setShowCountdown(false);
        startRecording();
        setIsScrolling(true); // Bắt đầu chạy chữ
      }
    }, 1000);
  };

  const handleStop = () => {
    stopRecording();
    setIsScrolling(false);
  };

  const flipCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  if (cameraError) {
    return <CameraErrorScreen error={cameraError} />;
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      
      {/* ========== LAYER 1: Camera Video ========== */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* ========== LAYER 2: Teleprompter Overlay ========== */}
      <div 
        className="absolute inset-0 z-10"
        style={{ 
          backgroundColor: `rgba(0, 0, 0, ${1 - textOpacity})` // Tối nền để chữ rõ
        }}
      >
        <TeleprompterSlide
          content={script}
          isActive={true}
          isScrolling={isScrolling}
          speed={speed}
          onFinish={handleStop}
          textOpacity={textOpacity}
        />
      </div>

      {/* ========== LAYER 3: Recording Indicator ========== */}
      {isRecording && (
        <motion.div 
          className="absolute top-8 left-8 z-30 flex items-center gap-2"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="w-4 h-4 rounded-full bg-red-500" />
          <span className="text-white font-mono text-lg">
            {formatDuration(duration)}
          </span>
        </motion.div>
      )}

      {/* ========== LAYER 4: Controls ========== */}
      {!isRecording && (
        <div className="absolute bottom-12 left-0 w-full z-40 flex flex-col items-center gap-4 px-6">
          
          {/* Opacity Slider */}
          <div className="flex items-center gap-3 bg-black/60 backdrop-blur px-4 py-2 rounded-full">
            <span className="text-white text-xs">Text</span>
            <input
              type="range"
              min="0.3"
              max="1"
              step="0.05"
              value={textOpacity}
              onChange={(e) => setTextOpacity(parseFloat(e.target.value))}
              className="w-32 accent-white"
            />
            <span className="text-white text-xs">{(textOpacity * 100).toFixed(0)}%</span>
          </div>

          {/* Main Controls */}
          <div className="flex items-center gap-6">
            {/* Flip Camera */}
            <button
              onClick={flipCamera}
              className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl"
            >
              🔄
            </button>

            {/* Record Button */}
            <button
              onClick={handleStartWithCountdown}
              className="w-20 h-20 rounded-full bg-red-500 shadow-2xl active:scale-95 transition flex items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full bg-white" />
            </button>

            {/* Download (if has recording) */}
            {hasRecording && (
              <button
                onClick={downloadVideo}
                className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl"
              >
                ⬇️
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stop Recording Button */}
      {isRecording && (
        <button
          onClick={handleStop}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40 w-16 h-16 rounded-xl bg-red-500 shadow-2xl"
        >
          <div className="w-6 h-6 mx-auto bg-white rounded-sm" />
        </button>
      )}

      {/* ========== Countdown Overlay ========== */}
      {showCountdown && (
        <motion.div
          className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="text-white text-9xl font-bold"
            key={Math.random()} // Force re-render
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5 }}
          >
            3...
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

// Helper
const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
```

---

## Critical Challenges & Solutions

### 1. **Performance Optimization (QUAN TRỌNG)**

**Vấn đề:** Camera + Recording + Scrolling text = Nóng máy + Lag

**Giải pháp:**

```typescript
// A. Giảm resolution khi recording
const optimizedConstraints = {
  video: {
    facingMode: 'user',
    width: { ideal: 1280 }, // Thay vì 1920
    height: { ideal: 720 }, // Thay vì 1080
    frameRate: { ideal: 24, max: 30 } // Thay vì 60fps
  }
};

// B. Throttle scroll updates khi đang record
const scrollStep = () => {
  if (isRecording) {
    // Giảm tần suất update xuống 20fps thay vì 60fps
    if (frameCount % 3 !== 0) {
      frameCount++;
      animationFrameId = requestAnimationFrame(scrollStep);
      return;
    }
  }
  // ... normal scroll logic
};

// C. Pause Wake Lock khi không record để tiết kiệm pin
useEffect(() => {
  if (isRecording) {
    wakeLock?.release();
  }
}, [isRecording]);
```

### 2. **Memory Management**

```typescript
// Clear chunks định kỳ để tránh memory leak
useEffect(() => {
  if (recordedChunks.length > 1000) { // ~10MB
    console.warn('Too many chunks, stopping recording');
    stopRecording();
  }
}, [recordedChunks]);

// Cleanup khi unmount
useEffect(() => {
  return () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (recordedChunks.length > 0) {
      // Free memory
      setRecordedChunks([]);
    }
  };
}, []);
```

### 3. **Text Legibility (Chữ rõ trên camera)**

```tsx
// Thêm text shadow để chữ nổi bật
<div 
  className="text-white font-bold"
  style={{
    textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.8)',
    WebkitTextStroke: '1px rgba(0,0,0,0.3)' // Outline
  }}
>
  {content}
</div>

// Hoặc thêm blur background phía sau chữ
<div className="relative">
  <div className="absolute inset-0 backdrop-blur-sm bg-black/40" />
  <div className="relative z-10 text-white">
    {content}
  </div>
</div>
```

### 4. **Platform-specific Issues**

```typescript
// iOS Safari cần user interaction để start camera
const handleUserInteraction = async () => {
  if (iOS) {
    // Force user to tap before camera starts
    await videoRef.current?.play();
  }
};

// Android Chrome có issue với audio echo
const audioConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true, // Quan trọng cho Android
};
```

---

## Tính năng bổ sung nên có

### 1. **Beauty Filter/Effects**

```typescript
// Sử dụng Canvas để apply filters
const applyBeautyFilter = (videoElement: HTMLVideoElement) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Apply blur filter (làm đẹp da)
  ctx.filter = 'blur(1px) brightness(1.1) contrast(0.95)';
  ctx.drawImage(videoElement, 0, 0);
  
  return canvas.captureStream(30);
};
```

### 2. **Grid Overlay (Composition Guides)**

```tsx
<div className="absolute inset-0 z-20 pointer-events-none">
  {/* Rule of thirds */}
  <div className="absolute left-1/3 top-0 w-px h-full bg-white/20" />
  <div className="absolute left-2/3 top-0 w-px h-full bg-white/20" />
  <div className="absolute top-1/3 left-0 w-full h-px bg-white/20" />
  <div className="absolute top-2/3 left-0 w-full h-px bg-white/20" />
</div>
```

### 3. **Timestamp & Watermark**

```tsx
<div className="absolute bottom-4 right-4 z-30 text-white text-xs font-mono opacity-60">
  {new Date().toLocaleString()}
</div>
```

### 4. **Export với Multiple Formats**

```typescript
const exportVideo = async (format: 'webm' | 'mp4') => {
  const blob = new Blob(recordedChunks, { type: 'video/webm' });
  
  if (format === 'mp4') {
    // Cần FFmpeg.wasm để convert
    const ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();
    
    ffmpeg.FS('writeFile', 'input.webm', await fetchFile(blob));
    await ffmpeg.run('-i', 'input.webm', '-c:v', 'libx264', 'output.mp4');
    
    const data = ffmpeg.FS('readFile', 'output.mp4');
    return new Blob([data.buffer], { type: 'video/mp4' });
  }
  
  return blob;
};
```

---

## Những điều khác nên biết

### 1. **UI/UX Best Practices**

- **Pre-recording checklist:**
  - Hiện preview 3s trước khi record để user check góc quay
  - Cho phép adjust brightness/contrast
  - Microphone level indicator

- **During recording:**
  - Disable screen sleep (Wake Lock)
  - Minimize UI để không che video
  - Show clear visual feedback (red dot pulse)

- **Post-recording:**
  - Preview video trước khi save
  - Trim tool để cắt đầu/cuối
  - Retry option nếu không hài lòng

### 2. **Storage Strategy**

```typescript
// Check storage quota trước khi record
const checkStorageQuota = async () => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const { usage, quota } = await navigator.storage.estimate();
    const percentUsed = (usage / quota) * 100;
    
    if (percentUsed > 90) {
      alert('Storage almost full! Please free up space.');
      return false;
    }
  }
  return true;
};
```

### 3. **Analytics & Metrics**

Track:
- Average recording duration
- Most common resolution used
- Drop frame rate
- Peak memory usage
- Battery drain rate

### 4. **Monetization Ideas**

- **Free tier:** 720p, watermark, 5 min max
- **Pro tier:** 1080p, no watermark, unlimited, beauty filters
- **Enterprise:** API access, custom branding

---

## Final Architecture Diagram

```
┌─────────────────────────────────────────┐
│         PWA Shell (Fullscreen)          │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │  Camera Layer (getUserMedia)      │  │ ← navigator.mediaDevices
│  │  + MediaRecorder                  │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Teleprompter Overlay             │  │
│  │  (opacity 0.7-0.9)                │  │ ← requestAnimationFrame
│  │  + Focal Point + Gradients        │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Recording Controls               │  │
│  │  (Floating UI)                    │  │ ← Framer Motion
│  └───────────────────────────────────┘  │
├─────────────────────────────────────────┤
│  Wake Lock + Safe Area + Orientation   │
└─────────────────────────────────────────┘
```
