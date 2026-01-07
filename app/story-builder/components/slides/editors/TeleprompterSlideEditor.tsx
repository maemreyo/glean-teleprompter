'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TypographyControls } from './controls/TypographyControls';
import { DisplayControls } from './controls/DisplayControls';
import { StylingControls } from './controls/StylingControls';
import { LayoutControls } from './controls/LayoutControls';
import type { BuilderSlide, BuilderTeleprompterSlide } from '@/lib/story-builder/types';
import { useStoryBuilderStore } from '@/lib/story-builder/store';
import { useState, useEffect, useMemo } from 'react';
import {
  clampFocalPoint,
  clampFontSize,
  clampLineHeight,
  clampLetterSpacing,
  clampBackgroundOpacity,
  clampSafeAreaPadding,
  isValidHexColor,
} from '@/lib/story/validation';
import {
  FOCAL_POINT_MIN,
  FOCAL_POINT_MAX,
  FOCAL_POINT_STEP,
  FONT_SIZE_MIN,
  FONT_SIZE_MAX,
  FONT_SIZE_STEP,
  getFocalPointRegionLabel,
} from '@/lib/story-builder/teleprompterConstants';

// Help icon component
const HelpIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" x2="12.01" y1="17" y2="17" />
  </svg>
);

interface TeleprompterSlideEditorProps {
  slide: BuilderSlide;
  index: number;
}

export function TeleprompterSlideEditor({ slide, index }: TeleprompterSlideEditorProps) {
  const { updateSlide } = useStoryBuilderStore();
  
  // Type guard to narrow BuilderSlide to BuilderTeleprompterSlide
  const isTeleprompterSlide = slide.type === 'teleprompter';
  if (!isTeleprompterSlide) {
    throw new Error(`TeleprompterSlideEditor received invalid slide type: ${slide.type}`);
  }
  
  const teleprompterSlide = slide as BuilderTeleprompterSlide;
  
  // Use useMemo for derived values from slide props
  // This avoids re-computing defaults on every render
  const teleprompterSettings = useMemo(() => ({
    content: teleprompterSlide.content || '',
    focalPoint: teleprompterSlide.focalPoint ?? 50,
    fontSize: teleprompterSlide.fontSize ?? 24,
    textAlign: teleprompterSlide.textAlign ?? 'left',
    lineHeight: teleprompterSlide.lineHeight ?? 1.4,
    letterSpacing: teleprompterSlide.letterSpacing ?? 0,
    scrollSpeed: teleprompterSlide.scrollSpeed ?? 'medium',
    mirrorHorizontal: teleprompterSlide.mirrorHorizontal ?? false,
    mirrorVertical: teleprompterSlide.mirrorVertical ?? false,
    backgroundColor: teleprompterSlide.backgroundColor ?? '#000000',
    backgroundOpacity: teleprompterSlide.backgroundOpacity ?? 100,
    safeAreaPadding: teleprompterSlide.safeAreaPadding ?? { top: 0, right: 0, bottom: 0, left: 0 },
  }), [teleprompterSlide]);
  
  // Only use local state for the text content to maintain cursor position during typing
  // All other settings are controlled directly from the slide props
  const [text, setText] = useState(teleprompterSettings.content);

  // Update local text state when slide changes (navigation between slides)
  // This is the only state we need to sync since it's the only input with focus management
  useEffect(() => {
    setText(teleprompterSettings.content);
  }, [teleprompterSettings.content]);

  return (
    <div className="space-y-6 overflow-y-auto h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Content Text Area */}
      <div className="space-y-2">
        <Label htmlFor="text" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Story Text</Label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => {
            const newValue = e.target.value;
            setText(newValue);
            updateSlide(index, { content: newValue });
          }}
          placeholder="Compose your story narrative..."
          className="w-full min-h-[120px] rounded-xl border bg-background px-3 py-2 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary resize-none"
        />
      </div>

      {/* Basic Controls - Focal Point & Font Size */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="focal-point" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Focal Point</Label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex"
                  aria-label="Learn more about focal point"
                >
                  <HelpIcon />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" side="top">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">What is Focal Point?</h4>
                  <p className="text-xs text-muted-foreground">
                    The focal point is the optimal reading position on screen during recording.
                    Position your text so the most important content appears at this line.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="text-xs font-medium">Quick Guide:</div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• <strong>0-33%:</strong> Top section</li>
                      <li>• <strong>34-66%:</strong> Center (recommended)</li>
                      <li>• <strong>67-100%:</strong> Bottom section</li>
                    </ul>
                    <div className="mt-3 pt-2 border-t">
                      <div className="text-xs text-center text-muted-foreground mb-1">Preview</div>
                      <div className="relative h-16 bg-background border rounded overflow-hidden">
                        <div className="absolute left-0 right-0 h-0.5 bg-yellow-400 opacity-80 top-1/2" />
                        <div className="text-[8px] text-center text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                          Yellow line = Focal Point
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="p-3 bg-muted/30 rounded-xl space-y-3">
            <Slider
              id="focal-point"
              min={FOCAL_POINT_MIN}
              max={FOCAL_POINT_MAX}
              step={FOCAL_POINT_STEP}
              value={[teleprompterSettings.focalPoint]}
              onValueChange={([value]) => {
                const clampedValue = clampFocalPoint(value);
                updateSlide(index, { focalPoint: clampedValue });
              }}
              className="py-2"
              aria-label="Focal Point"
              aria-valuemin={FOCAL_POINT_MIN}
              aria-valuemax={FOCAL_POINT_MAX}
              aria-valuenow={teleprompterSettings.focalPoint}
              aria-valuetext={`${getFocalPointRegionLabel(teleprompterSettings.focalPoint)} section (${teleprompterSettings.focalPoint}%)`}
            />
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                {getFocalPointRegionLabel(teleprompterSettings.focalPoint)}
              </span>
              <span className="text-[10px] font-mono bg-background px-1.5 py-0.5 rounded border">{teleprompterSettings.focalPoint}%</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="font-size" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Size</Label>
          <div className="p-3 bg-muted/30 rounded-xl space-y-3">
            <Slider
              id="font-size"
              min={FONT_SIZE_MIN}
              max={FONT_SIZE_MAX}
              step={FONT_SIZE_STEP}
              value={[teleprompterSettings.fontSize]}
              onValueChange={([value]) => {
                const clampedValue = clampFontSize(value);
                updateSlide(index, { fontSize: clampedValue });
              }}
              className="py-2"
              aria-label="Font Size"
              aria-valuemin={FONT_SIZE_MIN}
              aria-valuemax={FONT_SIZE_MAX}
              aria-valuenow={teleprompterSettings.fontSize}
              aria-valuetext={`${teleprompterSettings.fontSize} pixels`}
            />
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Scale</span>
              <span className="text-[10px] font-mono bg-background px-1.5 py-0.5 rounded border">{teleprompterSettings.fontSize}px</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Settings - Organized in Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Typography Controls */}
        <TypographyControls
          textAlign={teleprompterSettings.textAlign}
          lineHeight={teleprompterSettings.lineHeight}
          letterSpacing={teleprompterSettings.letterSpacing}
          onTextAlignChange={(value) => {
            updateSlide(index, { textAlign: value });
          }}
          onLineHeightChange={(value) => {
            const clampedValue = clampLineHeight(value);
            updateSlide(index, { lineHeight: clampedValue });
          }}
          onLetterSpacingChange={(value) => {
            const clampedValue = clampLetterSpacing(value);
            updateSlide(index, { letterSpacing: clampedValue });
          }}
        />

        {/* Display Controls */}
        <DisplayControls
          scrollSpeed={teleprompterSettings.scrollSpeed}
          mirrorHorizontal={teleprompterSettings.mirrorHorizontal}
          mirrorVertical={teleprompterSettings.mirrorVertical}
          onScrollSpeedChange={(value) => {
            updateSlide(index, { scrollSpeed: value });
          }}
          onMirrorHorizontalChange={(value) => {
            updateSlide(index, { mirrorHorizontal: value });
          }}
          onMirrorVerticalChange={(value) => {
            updateSlide(index, { mirrorVertical: value });
          }}
        />

        {/* Styling Controls */}
        <StylingControls
          backgroundColor={teleprompterSettings.backgroundColor}
          backgroundOpacity={teleprompterSettings.backgroundOpacity}
          onBackgroundColorChange={(value) => {
            // Validate hex color before saving
            if (!isValidHexColor(value)) {
              // Silently reject invalid colors - the UI should prevent this
              return;
            }
            updateSlide(index, { backgroundColor: value });
          }}
          onBackgroundOpacityChange={(value) => {
            const clampedValue = clampBackgroundOpacity(value);
            updateSlide(index, { backgroundOpacity: clampedValue });
          }}
        />

        {/* Layout Controls */}
        <LayoutControls
          safeAreaPadding={teleprompterSettings.safeAreaPadding}
          onSafeAreaPaddingChange={(value) => {
            const clampedValue = clampSafeAreaPadding(value);
            updateSlide(index, { safeAreaPadding: clampedValue });
          }}
        />
      </div>
    </div>
  );
}
