'use client';

/**
 * DragOverlay Component
 * 
 * Visual feedback during drag operations showing a ghost image
 * of the dragged item. Follows @dnd-kit patterns and global design system.
 * 
 * @feature 013-visual-story-builder
 */

import React from 'react';
import {
  DragOverlay as DndDragOverlay,
  useDraggable,
} from '@dnd-kit/core';
import type { DragOverlayProps } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the custom DragOverlay wrapper
 */
export interface StoryBuilderDragOverlayProps {
  /**
   * The currently active draggable data (from onDragStart)
   */
  active: any;
  /**
   * The currently active draggable node to display
   */
  activeNode?: React.ReactNode;
  
  /**
   * Whether the overlay should use custom styling for slide types
   */
  variant?: 'slide' | 'card';
  
  /**
   * Label for the dragged item (for card variant)
   */
  label?: string;
  
  /**
   * Description for the dragged item (for card variant)
   */
  description?: string;
  
  /**
   * Icon for the dragged item (for card variant)
   */
  icon?: React.ReactNode;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Drag overlay component that shows visual feedback during drag operations.
 * 
 * Uses @dnd-kit's DragOverlay with custom styling to match the
 * Instagram-inspired design system.
 * 
 * @example
 * ```tsx
 * <DragOverlay
 *   active={active}
 *   activeNode={<SlideCard slide={activeSlide} />}
 *   variant="slide"
 * />
 * ```
 * 
 * @example Card variant (for slide library)
 * ```tsx
 * <DragOverlay
 *   active={active}
 *   label="Text Slide"
 *   description="Add text content"
 *   icon={<TypeIcon />}
 *   variant="card"
 * />
 * ```
 */
export function DragOverlay({
  active,
  activeNode,
  variant = 'slide',
  label,
  description,
  icon,
  className,
  ...props
}: StoryBuilderDragOverlayProps) {
  // Default card content if no custom node provided
  const defaultContent = variant === 'card' && (label || description || icon) ? (
    <div className="
      w-64
      bg-white dark:bg-gray-900
      rounded-xl
      shadow-drag
      p-4
      flex items-start gap-3
      border-2 border-purple-500
    ">
      {/* Icon container */}
      {icon && (
        <div className="
          w-10 h-10
          rounded-lg
          bg-linear-to-br from-purple-500 to-pink-500
          flex items-center justify-center
          shrink-0
        ">
          <div className="w-5 h-5 text-white">
            {icon}
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        {label && (
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {label}
          </h3>
        )}
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {description}
          </p>
        )}
      </div>
    </div>
  ) : null;

  return (
    <DndDragOverlay
      active={active}
      className={cn(
        // Base styles from design system
        'z-50',
        // Drop shadow for elevation during drag
        'shadow-drag',
        className
      )}
      {...props}
    >
      {activeNode || defaultContent}
    </DndDragOverlay>
  );
}

// ============================================================================
// Slide Drag Overlay (Specialized)
// ============================================================================

/**
 * Props for the specialized slide drag overlay
 */
export interface SlideDragOverlayProps {
  /**
   * The slide being dragged
   */
  slide: {
    id: string;
    type: string;
    thumbnail?: string;
    backgroundColor?: string;
  };
  
  /**
   * Current slide index
   */
  index: number;
}

/**
 * Specialized drag overlay for slide thumbnails.
 * Shows a scaled-up version of the slide with visual feedback.
 * 
 * @example
 * ```tsx
 * <SlideDragOverlay
 *   slide={activeSlide}
 *   index={activeIndex}
 * />
 * ```
 */
export function SlideDragOverlay({ slide, index }: SlideDragOverlayProps) {
  return (
    <div className="
      w-[120px] h-[213px]
      rounded-2xl
      shadow-drag
      border-2 border-purple-500
      overflow-hidden
      relative
      bg-gray-100 dark:bg-gray-800
    ">
      {/* Slide number indicator */}
      <div className="
        absolute top-2 left-2
        w-6 h-6
        bg-black/50
        backdrop-blur-sm
        rounded-full
        flex items-center justify-center
        z-10
      ">
        <span className="text-white text-xs font-medium">
          {index + 1}
        </span>
      </div>
      
      {/* Thumbnail or placeholder */}
      {slide.thumbnail ? (
        <img
          src={slide.thumbnail}
          alt={`Slide ${index + 1}`}
          className="w-full h-full object-cover"
        />
      ) : (
        <div
          className="w-full h-full"
          style={{ backgroundColor: slide.backgroundColor || '#FFFFFF' }}
        >
          {/* Slide type indicator */}
          <div className="
            absolute inset-0
            flex items-center justify-center
            text-gray-400 dark:text-gray-600
          ">
            <span className="text-xs font-medium capitalize">
              {slide.type.replace('-', ' ')}
            </span>
          </div>
        </div>
      )}
      
      {/* Dragging indicator border */}
      <div className="
        absolute inset-0
        border-4 border-purple-500/30
        rounded-2xl
        pointer-events-none
      " />
    </div>
  );
}

// ============================================================================
// Default Export
// ============================================================================

export default DragOverlay;
