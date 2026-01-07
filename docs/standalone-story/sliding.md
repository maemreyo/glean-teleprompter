Tuyệt vời! Đây là phần **quan trọng nhất** cho teleprompter. Tôi sẽ tích hợp và mở rộng chi tiết:

---

## Kiến trúc cho Teleprompter Slide với điều chỉnh tốc độ

### 1. UI Components bổ sung (Layers đặc biệt)

```
<TeleprompterSlide>
  │
  ├─ <FocalPointOverlay> (z-30, pointer-events-none)
  │   ├─ <TopGradient /> // Mờ dần phía trên
  │   ├─ <FocalIndicator /> // Mũi tên/Line chỉ dòng đang đọc
  │   └─ <BottomGradient /> // Mờ dần phía dưới
  │
  ├─ <ScrollableContent> (z-10)
  │   └─ <TextContent> // Padding top/bottom ~40vh
  │
  └─ <FloatingControlPanel> (z-40, auto-hide)
      ├─ <SpeedSlider> // WPM control
      ├─ <FontSizeControl> // A+ / A-
      ├─ <MirrorModeToggle> // Flip horizontal (cho kính phản chiếu)
      └─ <PlayPauseButton>
```

### 2. State Management mở rộng

```typescript
// Store (Zustand)
interface TeleprompterState {
  // Slide-specific states
  scrollSpeed: number; // px/frame (0-5)
  fontSize: number; // px
  isScrolling: boolean; // Tách biệt với isPaused của Story
  isMirrored: boolean; // Flip cho teleprompter glass
  
  // Scroll position tracking
  scrollPosition: number; // Current scrollTop
  scrollDepth: number; // % (0-100) - Quan trọng cho Progress Bar
  totalScrollHeight: number;
  
  // Actions
  setScrollSpeed: (speed: number) => void;
  toggleMirror: () => void;
}
```

### 3. Core Logic: requestAnimationFrame Engine

**QUAN TRỌNG:** Không dùng CSS animation vì không thể thay đổi tốc độ on-the-fly!

```typescript
const TeleprompterSlide = ({ 
  content, 
  isActive, 
  onFinish, 
  onProgressUpdate // ★ Callback để sync Progress Bar
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [speed, setSpeed] = useState(1.5); // 0-5
  const [fontSize, setFontSize] = useState(28);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isMirrored, setIsMirrored] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // ★ CORE: Smooth scroll engine
  useEffect(() => {
    let animationFrameId: number;
    
    const scrollStep = () => {
      if (!containerRef.current || !isScrolling || !isActive) return;

      const container = containerRef.current;
      const { scrollTop, scrollHeight, clientHeight } = container;
      
      // Tính pixel cần cuộn (speed * 0.5 mỗi frame ≈ 30fps)
      const pixelsPerFrame = speed * 0.5;
      container.scrollTop += pixelsPerFrame;

      // ★ Tính scroll depth % để báo lên Progress Bar
      const maxScroll = scrollHeight - clientHeight;
      const scrollDepth = (container.scrollTop / maxScroll) * 100;
      onProgressUpdate?.(Math.min(scrollDepth, 100));

      // Check xem đã đến cuối chưa
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setIsScrolling(false);
        onFinish?.(); // Báo cho Story container chuyển slide
        return;
      }

      animationFrameId = requestAnimationFrame(scrollStep);
    };

    if (isScrolling) {
      animationFrameId = requestAnimationFrame(scrollStep);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isScrolling, speed, isActive, onFinish, onProgressUpdate]);

  // Auto-hide controls sau 3s
  useEffect(() => {
    if (!showControls) return;
    const timer = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(timer);
  }, [showControls]);

  return (
    <motion.div 
      className="relative w-full h-full bg-black text-white overflow-hidden"
      onClick={() => setShowControls(true)} // Tap để hiện controls
      style={{
        transform: isMirrored ? 'scaleX(-1)' : 'none' // ★ Mirror mode
      }}
    >
      
      {/* ========== 1. FOCAL POINT OVERLAY ========== */}
      <div className="absolute inset-0 pointer-events-none z-30">
        {/* Gradient trên - Mờ chữ chưa đến */}
        <div className="absolute top-0 left-0 w-full h-[35vh] bg-linear-to-b from-black via-black/50 to-transparent" />
        
        {/* Focal line - Vị trí mắt tập trung (1/3 từ trên) */}
        <div className="absolute top-[33vh] left-0 w-full flex items-center">
          <motion.div 
            className="w-2 h-2 rounded-full bg-yellow-400 ml-4"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <div className="flex-1 h-[2px] bg-yellow-400/30 ml-2" />
        </div>

        {/* Gradient dưới - Mờ chữ đã qua */}
        <div className="absolute bottom-0 left-0 w-full h-[35vh] bg-linear-to-t from-black via-black/50 to-transparent" />
      </div>

      {/* ========== 2. SCROLLABLE CONTENT ========== */}
      <div 
        ref={containerRef}
        className="w-full h-full overflow-y-scroll scrollbar-hide px-8 py-[40vh] z-10"
        // ★ py-[40vh]: Padding to/bottom để dòng đầu có thể cuộn lên focal point
        style={{ 
          fontSize: `${fontSize}px`,
          lineHeight: '1.6',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontWeight: 500
        }}
      >
        <div className="max-w-3xl mx-auto">
          {content}
        </div>
      </div>

      {/* ========== 3. FLOATING CONTROL PANEL ========== */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="bg-gray-900/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10">
              
              {/* Speed Slider */}
              <div className="flex items-center gap-4 mb-4">
                <span className="text-xs opacity-60">🐢</span>
                <input 
                  type="range" 
                  min="0" 
                  max="5" 
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-48 accent-yellow-400"
                />
                <span className="text-xs opacity-60">🐇</span>
                <span className="text-sm font-mono ml-2">{speed.toFixed(1)}x</span>
              </div>

              {/* Font Size Controls */}
              <div className="flex items-center gap-2 mb-4">
                <button 
                  onClick={() => setFontSize(prev => Math.max(16, prev - 2))}
                  className="px-3 py-1 bg-white/10 rounded-lg text-sm hover:bg-white/20"
                >
                  A-
                </button>
                <span className="text-xs mx-2">{fontSize}px</span>
                <button 
                  onClick={() => setFontSize(prev => Math.min(48, prev + 2))}
                  className="px-3 py-1 bg-white/10 rounded-lg text-sm hover:bg-white/20"
                >
                  A+
                </button>

                {/* Mirror Mode (Cho teleprompter glass) */}
                <button 
                  onClick={() => setIsMirrored(!isMirrored)}
                  className={`ml-4 px-3 py-1 rounded-lg text-sm ${
                    isMirrored ? 'bg-yellow-400 text-black' : 'bg-white/10'
                  }`}
                >
                  🪞 Mirror
                </button>
              </div>

              {/* Play/Pause */}
              <button 
                onClick={() => setIsScrolling(!isScrolling)}
                className="w-full bg-linear-to-r from-yellow-400 to-orange-500 text-black px-6 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition"
              >
                {isScrolling ? "⏸ Pause" : "▶ Start Reading"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
```

---

## 4. Đồng bộ Progress Bar theo Scroll Depth

**Vấn đề:** Progress bar của Story thường chạy theo time, nhưng Teleprompter phải chạy theo % scroll.

### Cách giải quyết:

```typescript
// ========== Trong StoryContainer (Component cha) ==========
const [currentSlide, setCurrentSlide] = useState(0);
const [progressOverride, setProgressOverride] = useState<number | null>(null);

const handleTeleprompterProgress = (depth: number) => {
  setProgressOverride(depth); // Ghi đè progress
};

// ========== Trong ProgressBarGroup Component ==========
const ProgressBarGroup = ({ slides, currentIndex, progressOverride }) => {
  return (
    <div className="flex gap-1 p-2">
      {slides.map((slide, index) => {
        let widthValue;
        
        if (index < currentIndex) {
          widthValue = "100%"; // Đã xong
        } else if (index > currentIndex) {
          widthValue = "0%"; // Chưa đến
        } else {
          // Slide hiện tại
          if (slide.type === 'teleprompter' && progressOverride !== null) {
            // ★ Dùng scroll depth thay vì time
            widthValue = `${progressOverride}%`;
          } else {
            // Normal time-based progress
            widthValue = "100%"; // CSS animation handle
          }
        }

        return (
          <div key={index} className="h-1 flex-1 bg-white/30 rounded overflow-hidden">
            <motion.div 
              className="h-full bg-white"
              style={{ width: widthValue }}
              transition={
                slide.type === 'teleprompter' 
                  ? { duration: 0 } // Instant update
                  : { duration: slide.duration / 1000, ease: "linear" }
              }
            />
          </div>
        );
      })}
    </div>
  );
};
```

---

## 5. Tính năng nâng cao

### WPM (Words Per Minute) Display

```typescript
const calculateWPM = (speed: number) => {
  // Speed 1.0 ≈ 150 WPM (average reading speed)
  const baseWPM = 150;
  return Math.round(baseWPM * speed);
};

// Trong UI:
<span className="text-xs opacity-60">
  {calculateWPM(speed)} WPM
</span>
```

### Keyboard Shortcuts

```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (!isActive) return;
    
    switch(e.key) {
      case ' ': // Space = Play/Pause
        e.preventDefault();
        setIsScrolling(prev => !prev);
        break;
      case 'ArrowUp': // Speed up
        setSpeed(prev => Math.min(5, prev + 0.2));
        break;
      case 'ArrowDown': // Slow down
        setSpeed(prev => Math.max(0, prev - 0.2));
        break;
      case 'r': // Reset to top
        if (containerRef.current) {
          containerRef.current.scrollTop = 0;
        }
        break;
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [isActive]);
```

### Smooth Font Size Transition

```typescript
<motion.div
  animate={{ fontSize: `${fontSize}px` }}
  transition={{ duration: 0.3 }}
>
  {content}
</motion.div>
```

---

## 6. Edge Cases cần xử lý

1. **Văn bản quá ngắn:** Nếu content < viewport height, disable auto-scroll
2. **User scroll thủ công:** Detect manual scroll và pause auto-scroll tạm thời
3. **Orientation change:** Recalculate scroll height khi xoay màn hình
4. **Background/Foreground:** Pause khi tab không active (visibilitychange API)

```typescript
// Detect manual scroll
const handleManualScroll = (e: React.UIEvent) => {
  if (isScrolling) {
    setIsScrolling(false); // User muốn control manual
  }
};

<div 
  ref={containerRef}
  onScroll={handleManualScroll}
  // ...
>
```

---

## Tóm tắt kiến trúc

**3 điểm cốt lõi:**
1. **requestAnimationFrame** thay vì CSS animation (để thay đổi speed real-time)
2. **Callback `onProgressUpdate(scrollDepth%)`** để sync Progress Bar
3. **Focal Point Overlay** với gradients để guide mắt người đọc
