# Teleprompter Preview & Multi-Form Support

This document outlines the current issues with the Teleprompter Live Preview and proposes improvements for better functionality and cross-device adaptation.

## Identified Issues

### 1. Functional Issues (Live Preview)
- **Focal Point Synchronization**: The focal point value changed in the builder is not passed to the preview iframe. The `FocalPointIndicator` component currently uses hardcoded constants instead of the slide's state.
- **Font Size Synchronization**: The preview iframe uses its own `useTeleprompterStore` instance, which doesn't receive updates from the builder's slide state.
- **Editor Initialization**: The `TeleprompterSlideEditor` uses local `useState` for `focalPoint` and `text` but doesn't correctly initialize from the `slide` prop, leading to resets when switching slides.

### 2. UI/UX Clarity
- **Yellow Line Indicator**: Users may not immediately understand that the yellow line represents the focal point (optimal reading area). A subtle label or builder-only tooltip would improve clarity.

---

## Proposed Architectural Improvements

### Multi-Form Factor Support

To support multiple screen formats (9:16 vertical, 16:9 widescreen, 1:1 square), the following changes are recommended:

1. **Responsive Container**:
   - Replace fixed `aspect-9/16` with a configurable aspect ratio property in the `StoryScript`.
   - Use CSS variables to define safe areas and focal points relative to the viewport height, ensuring the teleprompter remains usable regardless of width.

2. **Adaptive Typography**:
   - Implement `clamp()` for font sizes to ensure readability on small phone screens vs large tablets.
   - Allow "Auto-scale" based on the number of words in the paragraph.

3. **Safe Area Management**:
   - Improve the `useSafeArea` hook to detect not just notches but also UI overlays from different platforms (TikTok, Instagram Reels, etc.).

4. **Dynamic Overlays**:
   - The top/bottom gradients in `TeleprompterContent` should adjust their height based on the available screen height to maximize reading space on shorter screens.

---

## Implementation Plan (Phase 2)

### 1. Synchronization Fix
- Update `lib/story/types.ts` to include `focalPoint` and `fontSize` in `TeleprompterSlide`.
- Update `app/story-preview/page.tsx` to handle these fields during message conversion.
- Passing `fontSize` as a prop to `TeleprompterContent` to override the stored preference in preview mode.

### 2. Indicator Refinement
- Update `FocalPointIndicator` to accept a `top` percentage prop.
- Add an optional `label` ("Focal Point") that appears only in the builder or when the user is adjusting the slider.

### 3. Editor Stability
- Fix `TeleprompterSlideEditor` to correctly read from the `slide` prop on mount and update the store reliably.
