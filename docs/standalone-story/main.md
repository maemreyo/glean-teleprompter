Dựa trên document bạn cung cấp, tôi sẽ tổng hợp và mở rộng kiến trúc chi tiết hơn:

## Kiến trúc tổng thể

### Tech Stack đề xuất

**Core:**
- React (hoặc Next.js nếu cần SSR)
- TypeScript cho type safety

**Animation & Gestures (Quan trọng nhất):**
- **Framer Motion** - Tiêu chuẩn vàng cho story transitions
  - Xử lý `AnimatePresence` cho slide transitions
  - `staggerChildren` cho hiệu ứng karaoke (highlight từng từ)
  - Drag/tap gestures tích hợp sẵn
- **react-use-gesture** (optional) - nếu cần gestures phức tạp hơn

**State Management:**
- **Zustand** - Nhẹ, không boilerplate
  - Track: currentSlideIndex, isPaused, playbackSpeed, slideProgress

**Carousel Logic:**
- Tự code với Framer Motion (linh hoạt nhất cho teleprompter)
- Hoặc **Swiper** nếu muốn nhanh (dùng effect-cards/fade)

---

## Cấu trúc dữ liệu (Data Schema)

```typescript
interface Slide {
  id: string;
  type: 'text-highlight' | 'widget-chart' | 'image' | 'poll';
  content?: string;
  data?: any; // Widget-specific data
  duration: number | 'manual'; // ms hoặc chờ user tap
  animation?: {
    enter: 'slide' | 'fade' | 'zoom';
    exit: 'slide' | 'fade';
  };
  effects?: {
    type: 'blur' | 'gradient' | 'particles';
    config: any;
  };
}

interface TeleprompterScript {
  id: string;
  title: string;
  slides: Slide[];
  settings: {
    autoAdvance: boolean;
    showProgress: boolean;
  };
}
```

---

## Kiến trúc Component (Layers)

```
<StoryContainer> // 9:16 ratio, full-height
  │
  ├─ <StoryHeader> (z-index: 20)
  │   ├─ <ProgressBarGroup>
  │   │   └─ ProgressBar[] // Số lượng = số slides
  │   └─ <UserInfo> + <CloseButton>
  │
  ├─ <SlideRenderer> (z-index: 10) ★ CORE
  │   └─ <AnimatePresence mode="wait">
  │       └─ <SlideFactory currentSlide={slides[index]}>
  │           ├─ <TeleprompterText /> // type: text-highlight
  │           ├─ <WidgetChart />      // type: widget-chart
  │           ├─ <ImageWidget />      // type: image
  │           └─ <PollWidget />       // type: poll
  │
  ├─ <EffectsLayer> (z-index: 5)
  │   └─ WebGL/Canvas effects (particles, blur...)
  │
  └─ <InteractionLayer> (z-index: 30, transparent)
      ├─ <LeftTapZone> → handlePrev()
      ├─ <CenterHoldZone> → pause/resume
      └─ <RightTapZone> → handleNext()
```

---

## Core Logic: SlideFactory Pattern

```typescript
const SlideFactory: React.FC<{ data: Slide }> = ({ data }) => {
  switch (data.type) {
    case 'text-highlight':
      return <TeleprompterText content={data.content} duration={data.duration} />;
    
    case 'widget-chart':
      return <ChartWidget data={data.data} />;
    
    case 'image':
      return <ImageWidget src={data.data.src} />;
    
    case 'poll':
      return <PollWidget question={data.data.question} options={data.data.options} />;
    
    default:
      return null;
  }
};
```

---

## Các thách thức kỹ thuật quan trọng

### 1. **Hiệu ứng Karaoke (Word-by-word highlighting)**

```typescript
const TeleprompterText = ({ content, duration }) => {
  const words = content.split(' ');
  const delayPerWord = duration / words.length;

  return (
    <motion.div className="text-3xl font-bold text-white p-8">
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ color: '#666' }}
          animate={{ color: '#fff' }}
          transition={{ 
            delay: i * (delayPerWord / 1000),
            duration: 0.3 
          }}
          className="mr-2"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};
```

### 2. **Progress Bar Animation (Quan trọng!)**

```typescript
<div className="flex gap-1 p-2">
  {slides.map((slide, index) => (
    <div key={index} className="h-1 flex-1 bg-gray-600 rounded overflow-hidden">
      <motion.div 
        className="h-full bg-white"
        initial={{ width: index < currentIndex ? "100%" : "0%" }}
        animate={{ 
          width: index === currentIndex ? "100%" : 
                 (index < currentIndex ? "100%" : "0%") 
        }}
        transition={
          index === currentIndex 
            ? { duration: slide.duration / 1000, ease: "linear" } 
            : { duration: 0 }
        }
      />
    </div>
  ))}
</div>
```

### 3. **Pre-loading Assets**

```typescript
useEffect(() => {
  // Preload slide +1 và +2
  const preloadSlides = [currentIndex + 1, currentIndex + 2];
  
  preloadSlides.forEach(index => {
    if (slides[index]?.type === 'image') {
      const img = new Image();
      img.src = slides[index].data.src;
    }
  });
}, [currentIndex]);
```

### 4. **Mobile Viewport Height Fix**

```typescript
useEffect(() => {
  // Fix cho thanh địa chỉ trình duyệt mobile
  const setVh = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  
  setVh();
  window.addEventListener('resize', setVh);
  return () => window.removeEventListener('resize', setVh);
}, []);

// CSS: height: calc(var(--vh, 1vh) * 100);
```

---

## Auto-advance Timer Logic

```typescript
useEffect(() => {
  if (isPaused || slides[currentIndex].duration === 'manual') return;
  
  const timer = setTimeout(() => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, slides[currentIndex].duration);

  return () => clearTimeout(timer);
}, [currentIndex, isPaused]);
```

---

## Performance Optimizations

1. **React.memo** cho widget components nặng
2. **Virtual list** nếu có nhiều slides (>50)
3. **Lazy load** cho widgets phức tạp
4. **RequestAnimationFrame** cho smooth scrolling text
5. **Web Workers** nếu có xử lý data phức tạp trong widgets

---

## Thư viện bổ sung cho Widgets

- **Recharts** - Biểu đồ
- **Lottie** - Animations JSON
- **React-spring** - Physics-based animations
- **Three.js** - 3D effects (nếu cần)
