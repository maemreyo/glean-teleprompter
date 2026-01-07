'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { TypographyControls } from './controls/TypographyControls';
import { DisplayControls } from './controls/DisplayControls';
import { StylingControls } from './controls/StylingControls';
import { LayoutControls } from './controls/LayoutControls';
import type { BuilderSlide } from '@/lib/story-builder/types';
import { useStoryBuilderStore } from '@/lib/story-builder/store';
import { useState, useEffect } from 'react';

interface TeleprompterSlideEditorProps {
  slide: BuilderSlide;
  index: number;
}

export function TeleprompterSlideEditor({ slide, index }: TeleprompterSlideEditorProps) {
  const { updateSlide } = useStoryBuilderStore();
  
  // Extract all teleprompter settings with defaults
  const content = (slide as any).content || '';
  const slideFocalPoint = (slide as any).focalPoint ?? 50;
  const slideFontSize = (slide as any).fontSize ?? 24;
  const slideTextAlign = (slide as any).textAlign ?? 'left';
  const slideLineHeight = (slide as any).lineHeight ?? 1.4;
  const slideLetterSpacing = (slide as any).letterSpacing ?? 0;
  const slideScrollSpeed = (slide as any).scrollSpeed ?? 'medium';
  const slideMirrorHorizontal = (slide as any).mirrorHorizontal ?? false;
  const slideMirrorVertical = (slide as any).mirrorVertical ?? false;
  const slideBackgroundColor = (slide as any).backgroundColor ?? '#000000';
  const slideBackgroundOpacity = (slide as any).backgroundOpacity ?? 100;
  const slideSafeAreaPadding = (slide as any).safeAreaPadding ?? { top: 0, right: 0, bottom: 0, left: 0 };
  
  // State for all settings
  const [text, setText] = useState(content);
  const [focalPoint, setFocalPoint] = useState(slideFocalPoint);
  const [fontSize, setFontSize] = useState(slideFontSize);
  const [textAlign, setTextAlign] = useState(slideTextAlign);
  const [lineHeight, setLineHeight] = useState(slideLineHeight);
  const [letterSpacing, setLetterSpacing] = useState(slideLetterSpacing);
  const [scrollSpeed, setScrollSpeed] = useState(slideScrollSpeed);
  const [mirrorHorizontal, setMirrorHorizontal] = useState(slideMirrorHorizontal);
  const const [mirrorVertical, setMirrorVertical] = useState(slideMirrorVertical);
  const [backgroundColor, setBackgroundColor] = useState(slideBackgroundColor);
  const [backgroundOpacity, setBackgroundOpacity] = useState(slideBackgroundOpacity);
  const [safeAreaPadding, setSafeAreaPadding] = useState(slideSafeAreaPadding);

  // Update editor state when slide changes (navigation between slides)
  useEffect(() => {
    setText(content);
    setFocalPoint(slideFocalPoint);
    setFontSize(slideFontSize);
    setTextAlign(slideTextAlign);
    setLineHeight(slideLineHeight);
    setLetterSpacing(slideLetterSpacing);
    setScrollSpeed(slideScrollSpeed);
    setMirrorHorizontal(slideMirrorHorizontal);
    setMirrorVertical(slideMirrorVertical);
    setBackgroundColor(slideBackgroundColor);
    setBackgroundOpacity(slideBackgroundOpacity);
    setSafeAreaPadding(slideSafeAreaPadding);
  }, [
    slide,
    content,
    slideFocalPoint,
    slideFontSize,
    slideTextAlign,
    slideLineHeight,
    slideLetterSpacing,
    slideScrollSpeed,
    slideMirrorHorizontal,
    slideMirrorVertical,
    slideBackgroundColor,
    slideBackgroundOpacity,
    slideSafeAreaPadding,
  ]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Content Text Area */}
      <div className="space-y-2">
        <Label htmlFor="text" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Story Text</Label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            updateSlide(index, { content: e.target.value });
          }}
          placeholder="Compose your story narrative..."
          className="w-full min-h-[120px] rounded-xl border bg-background px-3 py-2 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary resize-none"
        />
      </div>

      {/* Basic Controls - Focal Point & Font Size */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label htmlFor="focal-point" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Focal Point</Label>
          <div className="p-3 bg-muted/30 rounded-xl space-y-3">
            <Slider
              id="focal-point"
              min={0}
              max={100}
              step={5}
              value={[focalPoint]}
              onValueChange={([value]) => {
                setFocalPoint(value);
                updateSlide(index, { focalPoint: value } as any);
              }}
              className="py-2"
            />
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                {focalPoint < 33 ? 'Top' : focalPoint < 66 ? 'Center' : 'Bottom'}
              </span>
              <span className="text-[10px] font-mono bg-background px-1.5 py-0.5 rounded border">{focalPoint}%</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="font-size" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Size</Label>
          <div className="p-3 bg-muted/30 rounded-xl space-y-3">
            <Slider
              id="font-size"
              min={16}
              max={48}
              step={2}
              value={[fontSize]}
              onValueChange={([value]) => {
                setFontSize(value);
                updateSlide(index, { fontSize: value } as any);
              }}
              className="py-2"
            />
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Scale</span>
              <span className="text-[10px] font-mono bg-background px-1.5 py-0.5 rounded border">{fontSize}px</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Settings - Organized in Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Typography Controls */}
        <TypographyControls
          textAlign={textAlign}
          lineHeight={lineHeight}
          letterSpacing={letterSpacing}
          onTextAlignChange={setTextAlign}
          onLineHeightChange={setLineHeight}
          onLetterSpacingChange={(value) => {
            setLetterSpacing(value);
            updateSlide(index, { letterSpacing: value } as any);
          }}
        />

        {/* Display Controls */}
        <DisplayControls
          scrollSpeed={scrollSpeed}
          mirrorHorizontal={mirrorHorizontal}
          mirrorVertical={mirrorVertical}
          onScrollSpeedChange={(value) => {
            setScrollSpeed(value);
            updateSlide(index, { scrollSpeed: value } as any);
          }}
          onMirrorHorizontalChange={(value) => {
            setMirrorHorizontal(value);
            updateSlide(index, { mirrorHorizontal: value } as any);
          }}
          onMirrorVerticalChange={(value) => {
            setMirrorVertical(value);
            updateSlide(index, { mirrorVertical: value } as any);
          }}
        />

        {/* Styling Controls */}
        <StylingControls
          backgroundColor={backgroundColor}
          backgroundOpacity={backgroundOpacity}
          onBackgroundColorChange={(value) => {
            setBackgroundColor(value);
            updateSlide(index, { backgroundColor: value } as any);
          }}
          onBackgroundOpacityChange={(value) => {
            setBackgroundOpacity(value);
            updateSlide(index, { backgroundOpacity: value } as any);
          }}
        />

        {/* Layout Controls */}
        <LayoutControls
          safeAreaPadding={safeAreaPadding}
          onSafeAreaPaddingChange={(value) => {
            setSafeAreaPadding(value);
            updateSlide(index, { safeAreaPadding: value } as any);
          }}
        />
      </div>
    </div>
  );
}
