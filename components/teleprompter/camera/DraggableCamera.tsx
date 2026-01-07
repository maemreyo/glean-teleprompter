'use client';

/**
 * DraggableCamera Component - Z-Index Usage
 *
 * This component uses centralized z-index constants from @/lib/constants/z-index
 *
 * Z-INDEX LAYERS:
 * - Z_INDEX_WIDGET_BASE (500): Camera widget base layer
 * - Z_INDEX_WIDGET_MAX (599): Maximum dynamic z-index
 * - Z_INDEX_WIDGET_HANDLE (530): Drag handle (nested, no actual effect)
 *
 * Dynamic z-index management: Widget increments by 10 on focus/drag to bring to front,
 * allowing it to compete with music widget (600-649 range) for visibility.
 *
 * Floating camera widget with drag functionality and position persistence
 * @module components/teleprompter/camera/DraggableCamera
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useDragControls, PanInfo } from 'framer-motion';
import { CameraWidget } from './CameraWidget';
// 012-z-index-refactor: Import centralized z-index constants
import { ZIndex } from '@/lib/constants/z-index';

const STORAGE_KEY = 'camera-widget-position';
const DEFAULT_POSITION = { x: 20, y: 20 };
const WIDGET_WIDTH = 240;
const WIDGET_HEIGHT = 320;

export interface DraggableCameraProps {
  /** Whether the camera widget is visible */
  isVisible: boolean;
  /** Callback when camera is toggled on/off */
  onToggle?: () => void;
  /** Recording quality preset */
  quality?: 'standard' | 'reduced';
}

export function DraggableCamera({
  isVisible,
  onToggle,
  quality = 'standard',
}: DraggableCameraProps) {
  const [position, setPosition] = useState<null | { x: number; y: number }>(null);
  const [isDragging, setIsDragging] = useState(false);
  // 012-z-index-refactor: Dynamic z-index management
  // Base at Z_INDEX_WIDGET_BASE (500), can increment to Z_INDEX_WIDGET_MAX (599)
  const [zIndex, setZIndex] = useState(ZIndex.WidgetBase);
  const dragControls = useDragControls();
  const hasLoadedPosition = useRef(false);

  // Bound position to keep widget on screen
  const boundPosition = useCallback((x: number, y: number) => {
    if (typeof window === 'undefined') {
      return { x: 0, y: 0 };
    }

    const maxX = window.innerWidth - WIDGET_WIDTH - 20;
    const maxY = window.innerHeight - WIDGET_HEIGHT - 20;

    return {
      x: Math.max(20, Math.min(x, maxX)),
      y: Math.max(20, Math.min(y, maxY)),
    };
  }, []);

  // Load saved position on mount or set default to top-right
  useEffect(() => {
    if (typeof window !== 'undefined' && !hasLoadedPosition.current) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const savedPos = JSON.parse(saved);
          const bounded = boundPosition(savedPos.x, savedPos.y);
          setPosition(bounded);
        } else {
          // Default to Top-Right
          setPosition({
             x: window.innerWidth - WIDGET_WIDTH - 20,
             y: 20
          });
        }
      } catch {
        // Fallback
        setPosition({ x: 20, y: 20 });
      }
      hasLoadedPosition.current = true;
    }
  }, [boundPosition]);

  // Save position to localStorage
  const savePosition = useCallback((x: number, y: number) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ x, y }));
      } catch {
        // Silently fail if localStorage is unavailable
      }
    }
  }, []);

  // Handle drag end with position bounds and persistence
  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);
      
      if (!position) return;

      const newX = position.x + info.offset.x;
      const newY = position.y + info.offset.y;

      const boundedPos = boundPosition(newX, newY);
      setPosition(boundedPos);
      savePosition(boundedPos.x, boundedPos.y);
    },
    [position, boundPosition, savePosition]
  );

  // 012-z-index-refactor: Handle drag start to bring widget to front
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    // Bring to front by incrementing z-index
    setZIndex((prev) => Math.min(prev + 10, ZIndex.WidgetMax));
  }, []);

  // Handle window resize to keep widget in bounds
  useEffect(() => {
    const handleResize = () => {
      if (!position) return;
      
      const bounded = boundPosition(position.x, position.y);
      if (bounded.x !== position.x || bounded.y !== position.y) {
        setPosition(bounded);
        savePosition(bounded.x, bounded.y);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position, boundPosition, savePosition]);

  if (!isVisible || !position) return null;

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{
        left: 20,
        right: typeof window !== 'undefined' ? window.innerWidth - WIDGET_WIDTH - 20 : 0,
        top: 20,
        bottom: typeof window !== 'undefined' ? window.innerHeight - WIDGET_HEIGHT - 20 : 0,
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      initial={false} // Use animate for positioning
      animate={{
        x: position.x,
        y: position.y,
      }}
      className="fixed top-[10px]"
      style={{
        zIndex: zIndex,
        touchAction: 'none', // Prevent scrolling while dragging on mobile
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 1.05 }}
      onFocus={() => setZIndex((prev) => Math.min(prev + 10, ZIndex.WidgetMax))}
      tabIndex={0}
    >
      <motion.div
        className={cn(
          'rounded-2xl overflow-hidden transition-shadow',
          isDragging ? 'shadow-2xl ring-4 ring-blue-500/30' : 'shadow-lg'
        )}
        animate={{
          boxShadow: isDragging
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        }}
        transition={{ duration: 0.2 }}
      >
        {/* 012-z-index-refactor: Z_INDEX_WIDGET_HANDLE (530) - Drag handle */}
        {/* NOTE: Nested z-index has no effect on stacking - only affects children within this parent */}
        <div
          className="absolute top-0 left-0 right-0 h-8 bg-linear-to-b from-black/20 to-transparent cursor-move flex items-center justify-center group"
          style={{ zIndex: ZIndex.WidgetHandle }}
        >
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-1 h-1 bg-white/70 rounded-full" />
            <div className="w-1 h-1 bg-white/70 rounded-full" />
            <div className="w-1 h-1 bg-white/70 rounded-full" />
          </div>
        </div>

        {/* Camera Widget */}
        <CameraWidget
          isVisible={isVisible}
          onToggle={onToggle}
          mirrored={true}
          quality={quality}
        />
      </motion.div>
    </motion.div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
