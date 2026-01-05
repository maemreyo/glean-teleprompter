Tuyệt vời! Đây là các **pain points thực chiến** rất quan trọng. Tôi sẽ tích hợp và bổ sung thêm:

---

## Critical Pain Points & Solutions

### 1. **Screen Sleep/Auto-lock (QUAN TRỌNG NHẤT) ⭐**

**Vấn đề:** Màn hình tự tắt sau 30s-1 phút khi user không chạm, phá hỏng hoàn toàn trải nghiệm đọc.

**Giải pháp:**

```typescript
// Hook để quản lý Wake Lock
import { useEffect, useRef } from 'react';

const useWakeLock = (isActive: boolean) => {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const requestWakeLock = async () => {
      try {
        // Modern browsers (Chrome, Edge)
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          console.log('✅ Wake Lock active');

          // Re-request khi tab visible lại
          wakeLockRef.current.addEventListener('release', () => {
            console.log('Wake Lock released');
          });
        } else {
          // Fallback cho Safari/iOS: Dùng NoSleep.js
          console.warn('Wake Lock API not supported, using NoSleep.js fallback');
          // Import: import NoSleep from 'nosleep.js';
          // const noSleep = new NoSleep();
          // noSleep.enable();
        }
      } catch (err) {
        console.error('Wake Lock error:', err);
      }
    };

    requestWakeLock();

    // Handle visibility change (user switch tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && wakeLockRef.current === null) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, [isActive]);
};

// Sử dụng trong TeleprompterSlide:
const TeleprompterSlide = ({ isActive }) => {
  useWakeLock(isActive && isScrolling); // Chỉ active khi đang scroll
  // ...
};
```

**Thư viện fallback cho Safari:**
```bash
npm install nosleep.js
```

---

### 2. **Gesture Conflict (Xung đột thao tác)**

**Vấn đề:** User vô tình tap/swipe khi đang đọc → Chuyển slide → Mất nội dung.

**Giải pháp:**

```typescript
// Trong InteractionLayer, disable tap-to-next cho Teleprompter slides
const InteractionLayer = ({ currentSlide, onNext, onPrev, onPause }) => {
  const isTeleprompter = currentSlide.type === 'teleprompter';

  return (
    <div className="absolute inset-0 z-30 flex">
      {/* LEFT zone - Prev */}
      <div 
        className={`w-1/5 h-full ${isTeleprompter ? 'pointer-events-none' : ''}`}
        onClick={onPrev} 
      />

      {/* CENTER zone - Pause/Resume hoặc Show Controls */}
      <div 
        className="flex-1 h-full" 
        onClick={() => {
          if (isTeleprompter) {
            // Chỉ show controls, KHÔNG next
            setShowControls(true);
          } else {
            // Story bình thường: toggle pause
            onPause();
          }
        }}
      />

      {/* RIGHT zone - Next (Disable cho Teleprompter) */}
      <div 
        className={`w-1/5 h-full ${isTeleprompter ? 'pointer-events-none' : ''}`}
        onClick={onNext} 
      />
    </div>
  );
};
```

**Thêm nút "Skip" rõ ràng cho Teleprompter:**
```tsx
{/* Trong FloatingControlPanel */}
<button 
  onClick={onFinish}
  className="mt-2 text-sm opacity-60 hover:opacity-100"
>
  ⏭ Skip to next
</button>
```

---

### 3. **Safe Area (Notch & Dynamic Island)**

**Vấn đề:** Chữ bị che bởi tai thỏ, Dynamic Island, home indicator.

**Giải pháp:**

```css
/* globals.css */
:root {
  /* Custom properties cho safe area */
  --safe-top: env(safe-area-inset-top);
  --safe-bottom: env(safe-area-inset-bottom);
  --safe-left: env(safe-area-inset-left);
  --safe-right: env(safe-area-inset-right);
}
```

```tsx
const TeleprompterSlide = () => {
  return (
    <div 
      className="relative w-full h-full"
      style={{
        paddingTop: 'max(2rem, env(safe-area-inset-top))',
        paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
      }}
    >
      {/* Focal Point ở 35-40% thay vì 33% */}
      <div className="absolute top-[38vh] left-0 w-full">
        {/* Focal indicator */}
      </div>

      {/* Content với safe padding */}
      <div 
        ref={containerRef}
        className="w-full h-full overflow-y-scroll scrollbar-hide"
        style={{ 
          paddingTop: 'calc(40vh + env(safe-area-inset-top))',
          paddingBottom: 'calc(40vh + env(safe-area-inset-bottom))',
          paddingLeft: 'max(2rem, env(safe-area-inset-left))',
          paddingRight: 'max(2rem, env(safe-area-inset-right))',
        }}
      >
        {content}
      </div>
    </div>
  );
};
```

**Meta tags cần thiết:**
```html
<!-- In your HTML head or Next.js _document.tsx -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

---

### 4. **Performance & Battery Drain**

**Vấn đề:** `requestAnimationFrame` + DOM heavy → Nóng máy → FPS drop → Giật lag.

**Giải pháp:**

#### A. Virtual Scrolling cho văn bản dài

```typescript
// Chỉ render đoạn text trong viewport + buffer
const VirtualTeleprompterContent = ({ content, fontSize }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  
  // Split content thành paragraphs
  const paragraphs = content.split('\n\n');
  
  const handleScroll = (e) => {
    const container = e.target;
    const scrollTop = container.scrollTop;
    const avgParagraphHeight = fontSize * 5; // Ước tính
    
    const start = Math.max(0, Math.floor(scrollTop / avgParagraphHeight) - 5);
    const end = Math.min(paragraphs.length, start + 20);
    
    setVisibleRange({ start, end });
  };

  return (
    <div onScroll={handleScroll} className="overflow-y-scroll">
      {/* Spacer phía trên */}
      <div style={{ height: visibleRange.start * fontSize * 5 }} />
      
      {/* Chỉ render paragraphs trong range */}
      {paragraphs.slice(visibleRange.start, visibleRange.end).map((p, i) => (
        <p key={visibleRange.start + i}>{p}</p>
      ))}
      
      {/* Spacer phía dưới */}
      <div style={{ height: (paragraphs.length - visibleRange.end) * fontSize * 5 }} />
    </div>
  );
};
```

#### B. CSS Optimization

```css
.teleprompter-content {
  /* GPU acceleration */
  will-change: scroll-position;
  transform: translateZ(0);
  
  /* Smooth scrolling performance */
  -webkit-overflow-scrolling: touch;
  
  /* Tắt text selection để tránh lag */
  user-select: none;
  -webkit-user-select: none;
}
```

#### C. Throttle scroll updates

```typescript
import { throttle } from 'lodash';

// Chỉ update progress mỗi 100ms thay vì mỗi frame
const throttledProgressUpdate = useCallback(
  throttle((depth: number) => {
    onProgressUpdate?.(depth);
  }, 100),
  []
);
```

---

### 5. **Font Resizing - Giữ vị trí đọc (CRITICAL)**

**Vấn đề:** Khi thay đổi font size → Layout shift → User mất vị trí đang đọc.

**Giải pháp: Position Anchoring Algorithm**

```typescript
const TeleprompterSlide = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(28);
  const savedScrollRatioRef = useRef(0); // Lưu % vị trí

  // Hook để anchor position khi resize
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    
    // TRƯỚC khi resize: Lưu vị trí hiện tại theo %
    const saveScrollPosition = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const maxScroll = scrollHeight - clientHeight;
      savedScrollRatioRef.current = scrollTop / maxScroll;
    };

    // SAU khi resize: Khôi phục vị trí theo %
    const restoreScrollPosition = () => {
      // Chờ DOM re-render (requestAnimationFrame)
      requestAnimationFrame(() => {
        const { scrollHeight, clientHeight } = container;
        const maxScroll = scrollHeight - clientHeight;
        const newScrollTop = savedScrollRatioRef.current * maxScroll;
        container.scrollTop = newScrollTop;
      });
    };

    saveScrollPosition();
    return () => restoreScrollPosition();
  }, [fontSize]); // Trigger khi fontSize thay đổi

  const handleFontSizeChange = (delta: number) => {
    // Save position trước khi thay đổi
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      savedScrollRatioRef.current = scrollTop / (scrollHeight - clientHeight);
    }

    // Thay đổi font size
    setFontSize(prev => Math.max(16, Math.min(48, prev + delta)));
  };

  return (
    <>
      <div ref={containerRef} style={{ fontSize: `${fontSize}px` }}>
        {content}
      </div>

      <button onClick={() => handleFontSizeChange(2)}>A+</button>
      <button onClick={() => handleFontSizeChange(-2)}>A-</button>
    </>
  );
};
```

**Improved version với smooth transition:**

```typescript
const handleFontSizeChange = (delta: number) => {
  if (!containerRef.current) return;

  const container = containerRef.current;
  const { scrollTop, scrollHeight, clientHeight } = container;
  const scrollRatio = scrollTop / (scrollHeight - clientHeight);

  // Pause scrolling
  setIsScrolling(false);

  // Change font size
  setFontSize(prev => {
    const newSize = Math.max(16, Math.min(48, prev + delta));
    
    // Restore position sau khi render
    setTimeout(() => {
      const newMaxScroll = container.scrollHeight - container.clientHeight;
      container.scrollTo({
        top: scrollRatio * newMaxScroll,
        behavior: 'smooth' // Smooth scroll đến vị trí mới
      });
    }, 0);
    
    return newSize;
  });
};
```

---

## Các Pain Points bổ sung khác

### 6. **Orientation Change (Xoay màn hình)**

```typescript
useEffect(() => {
  const handleOrientationChange = () => {
    // Recalculate scroll height
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const ratio = scrollTop / (scrollHeight - clientHeight);
      
      setTimeout(() => {
        const newMaxScroll = containerRef.current!.scrollHeight - containerRef.current!.clientHeight;
        containerRef.current!.scrollTop = ratio * newMaxScroll;
      }, 100); // Đợi layout ổn định
    }
  };

  window.addEventListener('orientationchange', handleOrientationChange);
  window.addEventListener('resize', handleOrientationChange);
  
  return () => {
    window.removeEventListener('orientationchange', handleOrientationChange);
    window.removeEventListener('resize', handleOrientationChange);
  };
}, []);
```

### 7. **Smooth Stop (Dừng mượt thay vì giật cục)**

```typescript
const stopScrolling = () => {
  // Thay vì dừng đột ngột, giảm tốc độ dần
  let currentSpeed = speed;
  const decelerate = () => {
    currentSpeed *= 0.9; // Giảm 10% mỗi frame
    if (currentSpeed > 0.1) {
      containerRef.current!.scrollTop += currentSpeed * 0.5;
      requestAnimationFrame(decelerate);
    } else {
      setIsScrolling(false);
    }
  };
  
  requestAnimationFrame(decelerate);
};
```

### 8. **PWA Features cho Teleprompter**

```json
// manifest.json
{
  "name": "Story Teleprompter",
  "display": "fullscreen", // QUAN TRỌNG: Fullscreen mode
  "orientation": "portrait",
  "theme_color": "#000000",
  "background_color": "#000000",
  "start_url": "/",
  "scope": "/",
  "icons": [...]
}
```

```tsx
// Request fullscreen
const requestFullscreen = () => {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  }
};
```

### 9. **Accessibility cho Teleprompter**

```tsx
// ARIA labels
<div 
  role="region" 
  aria-label="Teleprompter content"
  aria-live="polite"
>
  {content}
</div>

// Voice control hints
<button aria-label="Increase reading speed">A+</button>

// High contrast mode support
@media (prefers-contrast: high) {
  .teleprompter-text {
    color: #ffffff;
    background: #000000;
  }
}
```

### 10. **Error Recovery**

```typescript
// Auto-save reading position
useEffect(() => {
  const saveProgress = () => {
    if (containerRef.current) {
      const progress = {
        slideId: currentSlide.id,
        scrollRatio: containerRef.current.scrollTop / 
                     (containerRef.current.scrollHeight - containerRef.current.clientHeight),
        timestamp: Date.now()
      };
      localStorage.setItem('teleprompter_progress', JSON.stringify(progress));
    }
  };

  const interval = setInterval(saveProgress, 2000);
  return () => clearInterval(interval);
}, [currentSlide]);

// Restore khi load lại
useEffect(() => {
  const saved = localStorage.getItem('teleprompter_progress');
  if (saved) {
    const { slideId, scrollRatio } = JSON.parse(saved);
    // Restore position...
  }
}, []);
```

---

## Checklist tổng hợp

✅ **Wake Lock API** + NoSleep.js fallback  
✅ **Gesture Guard** - Disable tap-to-next  
✅ **Safe Area** - env(safe-area-inset-*)  
✅ **Virtual Scrolling** - Cho văn bản dài  
✅ **Font Resizing Anchor** - Giữ vị trí đọc  
✅ **Orientation Change** - Recalculate layout  
✅ **Smooth Deceleration** - Dừng mượt mà  
✅ **PWA Fullscreen** - Tối đa hóa màn hình  
✅ **Auto-save Progress** - Khôi phục khi crash  
✅ **Performance Throttle** - Giảm battery drain  
