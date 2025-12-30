'use client';

/**
 * DraggableCamera Component
 * Floating camera widget with drag functionality and position persistence
 * @module components/teleprompter/camera/DraggableCamera
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, useDragControls, PanInfo } from 'framer-motion';
import { CameraWidget } from './CameraWidget';

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
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [isDragging, setIsDragging] = useState(false);
  const dragControls = useDragControls();

  // Load saved position on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const savedPos = JSON.parse(saved);
          // Ensure position is within viewport bounds
          const boundedPos = boundPosition(savedPos.x, savedPos.y);
          setPosition(boundedPos);
        }
      } catch {
        // Use default position if localStorage fails
      }
    }
  }, []);

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

  // Bound position to keep widget on screen
  const boundPosition = useCallback((x: number, y: number) => {
    if (typeof window === 'undefined') {
      return { x: DEFAULT_POSITION.x, y: DEFAULT_POSITION.y };
    }

    const maxX = window.innerWidth - WIDGET_WIDTH - 20;
    const maxY = window.innerHeight - WIDGET_HEIGHT - 20;

    return {
      x: Math.max(10, Math.min(x, maxX)),
      y: Math.max(10, Math.min(y, maxY)),
    };
  }, []);

  // Handle drag end with position bounds and persistence
  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);

      const newX = position.x + info.offset.x;
      const newY = position.y + info.offset.y;

      const boundedPos = boundPosition(newX, newY);
      setPosition(boundedPos);
      savePosition(boundedPos.x, boundedPos.y);
    },
    [position, boundPosition, savePosition]
  );

  // Handle drag start for visual feedback
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  // Handle window resize to keep widget in bounds
  useEffect(() => {
    const handleResize = () => {
      const bounded = boundPosition(position.x, position.y);
      if (bounded.x !== position.x || bounded.y !== position.y) {
        setPosition(bounded);
        savePosition(bounded.x, bounded.y);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position, boundPosition, savePosition]);

  if (!isVisible) return null;

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{
        left: 10,
        right: window.innerWidth - WIDGET_WIDTH - 10,
        top: 10,
        bottom: window.innerHeight - WIDGET_HEIGHT - 10,
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      initial={false}
      animate={{
        x: position.x,
        y: position.y,
      }}
      className="fixed z-50"
      style={{
        touchAction: 'none', // Prevent scrolling while dragging on mobile
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 1.05 }}
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
        {/* Drag Handle Indicator */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/20 to-transparent z-30 cursor-move flex items-center justify-center group">
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
