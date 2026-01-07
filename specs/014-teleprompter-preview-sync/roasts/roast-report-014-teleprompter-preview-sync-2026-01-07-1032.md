# ROAST REPORT: 2026-01-07

**Reviewer**: The Sr. Principal Engineer from Hell  
**Victim Branch**: 014-teleprompter-preview-sync  
**Features Analyzed**: Feature 014 - Teleprompter Preview Synchronization  
**Roast Iteration**: 1  
**Previous Report**: N/A

## Executive Summary

Oh, where do I even begin? I've seen better code written by a random number generator that had a stroke. You claimed to implement "teleprompter preview synchronization" but what you actually delivered is a crime scene against TypeScript and basic engineering principles. 

You've managed to take a straightforward feature—syncing some teleprompter settings from builder to preview—and turned it into a masterpiece of "how NOT to write code." With 98 of 101 tasks marked "complete," I can only conclude that your definition of "complete" is "it compiles, ship it." 

The `any` types alone are enough to make TypeScript cry itself to sleep at night. You've basically stripped the type system down, beat it with a stick, and left it for dead in a ditch. Combined with console.log statements scattered like confetti and performance issues that would make a sloth look proactive, this code is an insult to the profession.

## Audit & Roast Checklist

### Type System Crimes

- [ ] **T001-T002, T045-T053** 🔴 **`any` TYPES EVERYWHERE** - I counted **37 instances** of `(slide as any)` casts across [`TeleprompterSlideEditor.tsx`](app/story-builder/components/slides/editors/TeleprompterSlideEditor.tsx:43-54) and [`page.tsx`](app/story-preview/page.tsx:32-85). You added all these properties to `TeleprompterSlide` in types.ts but couldn't be bothered to update `BuilderSlide` to match? Now you're casting away type safety like it's going out of style. Define proper discriminated unions or update your BuilderSlide type. TypeScript strict mode is laughing at you right now.

- [ ] **T003-T005** 🔴 **NO RUNTIME VALIDATION** - Your clamp functions in [`validation.ts`](lib/story/validation.ts:163-264) are great, but you never call them! Settings can be ANY value and you just pass them through. User sets fontSize to 999999? Sure, why not! backgroundColor = "not-a-color"? Ship it! You built validation utilities and then proceeded to ignore them completely.

- [ ] **T012-T016, T072-T073** 🔴 **WEAK POSTMESSAGE CONTRACT** - Your [`PreviewMessage`](lib/story-builder/hooks/usePreviewSync.ts:15-21) interface claims `slides: BuilderSlide[]` but we both know that's a lie since BuilderSlide doesn't have these teleprompter properties. You're lying to the type system and hoping nobody notices. That's not engineering, that's deception.

### Performance Disasters

- [ ] **T016** 🔴 **O(n²) DEEP COMPARISON IN EFFECT** - Line 37 in [`usePreviewSync.ts`](lib/story-builder/hooks/usePreviewSync.ts:37): `JSON.stringify(slides) !== JSON.stringify(previousSlidesRef.current)`. You're serializing the entire slides array on EVERY render to detect changes. For a story with 20 slides and rich content, this is expensive. Use a proper deep equality check or, even better, track changes at the slide level. This is lazy optimization.

- [ ] **T016** 🔴 **DOUBLED SERIALIZATION** - Line 76: you do the EXACT SAME JSON.stringify comparison again. You couldn't cache the result from line 37? Now you're paying the O(n²) cost TWICE. Your performance monitoring (lines 92-128) is going to be yelling at you constantly, and you deserve it.

- [ ] **T094-T098** 🔴 **CONSOLE.LOGS IN PRODUCTION** - I see console.log statements littered throughout [`usePreviewSync.ts`](lib/story-builder/hooks/usePreviewSync.ts:39-47), [`store.ts`](lib/story-builder/store.ts:370-384), and [`page.tsx`](app/story-preview/page.tsx:101-112). These are not behind DEBUG flags. They're going to production. Your users' consoles are going to be spammed with your debugging garbage. Clean up after yourself.

### React Anti-Patterns

- [ ] **T029-T032** 🔴 **MASSIVE USEEFFECT DEPENDENCY ARRAY** - Look at [`TeleprompterSlideEditor.tsx`](app/story-builder/components/slides/editors/TeleprompterSlideEditor.tsx:84-98). Your useEffect has **13 dependencies**. Every single one of those derived values triggers a full re-initialization of all your local state. This is a performance nightmare. You should be using useMemo for the derived values, not triggering effects.

- [ ] **T022, T029** 🔴 **REDUNDANT STATE MIRRORING** - You have local state for all 11 teleprompter properties (lines 57-68) that mirrors what's in the store/slide props. Then you have a massive useEffect to sync them. This is unnecessary complexity. Either use the store directly or use controlled components without local state duplication. You're doing both and it's messy.

- [ ] **T030** 🔴 **MISSING CLEANUP IN USEEFFECT** - Your state update effect has no cleanup function. If the component unmounts during the update, you'll get the classic "can't perform a React state update on an unmounted component" warning. But you probably won't see it because you didn't add error handling.

### Missing Error Handling

- [ ] **T072, T073** 🔴 **POSTMESSAGE WITHOUT TRY/CATCH** - Line 63 in [`usePreviewSync.ts`](lib/story-builder/hooks/usePreviewSync.ts:63): `iframe.contentWindow.postMessage(message, window.location.origin)`. No try/catch. If the iframe is cross-origin or gets destroyed, this throws. Your entire preview sync dies silently. Hope you like silent failures!

- [ ] **T062** 🔴 **LOCALSTORAGE WITHOUT QUOTA HANDLING** - You're storing teleprompter settings in the draft but [`store.ts`](lib/story-builder/store.ts:509) only handles QuotaExceededError at the top level. When your enhanced settings bloat the draft beyond localStorage limits, users lose everything. No warning, no graceful degradation. Poof, gone.

- [ ] **T082** 🔴 **NO HEX COLOR VALIDATION BEFORE APPLYING** - Your [`TeleprompterContent`](components/story/Teleprompter/TeleprompterContent.tsx:94-102) parses hex colors with `parseInt` but never validates. User passes "##BAD" or "rgb(255,0,0)" and you just let it through. `parseInt("#GGGGGG", 16)` returns NaN, and you're rendering `rgba(NaN, NaN, NaN, 1)` which the browser silently ignores. That's not handling errors, that's ignoring them.

### Code Quality Issues

- [ ] **All Tasks** 🔴 **MAGIC NUMBERS EVERYWHERE** - 33, 38, 35vh, 100ms, 200px... These constants are scattered all over. [`FocalPointIndicator.tsx`](components/story/Teleprompter/FocalPointIndicator.tsx:25-26) has `FOCAL_POINT_BASE = 33` and `FOCAL_POINT_WITH_SAFE_AREA = 38` with zero explanation. Why 33? Why 38? Document your magic or, better yet, make them configurable.

- [ ] **T036-T040** 🔴 **INCONSISTENT TOOLTIP IMPLEMENTATION** - Your FocalPointIndicator tooltip is custom-built (lines 74-83) but the rest of your app uses shadcn/ui Tooltip. You're introducing inconsistency for no reason. Use your design system components or don't have a design system.

- [ ] **T068-T071** 🔴 **PROPS DRILLING IN CONTROLS** - Your control components ([`TypographyControls`](app/story-builder/components/slides/editors/controls/TypographyControls.tsx), [`DisplayControls`](app/story-builder/components/slides/editors/controls/DisplayControls.tsx), etc.) take onChange callbacks that then call `updateSlide` in the parent. This is unnecessary prop drilling. These controls should be passed the slide/index directly or use a context. The callback chains are getting ridiculous.

- [ ] **T087** 🔴 **NO ACCESSIBILITY LABELS ON SLIDERS** - Your sliders in [`TeleprompterSlideEditor.tsx`](app/story-builder/components/slides/editors/TeleprompterSlideEditor.tsx:161-201) have `id` attributes but no `aria-valuenow`, `aria-valuetext`, or proper labels. Screen readers announce "slider, minimum 0, maximum 100" but not what it controls. Accessibility is not optional.

### Testing Gaps

- [ ] **T094** 🔴 **TESTS DON'T COVER ERROR CASES** - I looked at your test files. They all test the happy path. What happens when postMessage fails? What happens when localStorage is full? What happens with invalid hex colors? Your tests assume everything works perfectly. That's not testing, that's praying.

- [ ] **T095** 🔴 **NO PERFORMANCE TESTS FOR 100MS REQUIREMENT** - You have a 100ms sync requirement (T016, T098) but your E2E tests don't actually measure this. The performance test exists but doesn't validate the SLA. You're measuring performance but not enforcing it.

## Scorched Earth Score

**Score**: 4 / 10

**Verdict**: 
This code "works" but it's ugly, unoptimized, and barely maintainable. It's like a house built on a foundation of `any` types and console.logs—technically standing, but I wouldn't want to live in it during an earthquake. The type safety violations alone drop this to intern-level quality. 

You get points for:
- Actually implementing the feature (it does sync)
- Adding comprehensive validation utilities (even if you don't use them)
- Good test coverage of happy paths
- Solid component structure

You lose points for:
- `any` type abuse (TypeScript weeps)
- Performance anti-patterns (JSON.stringify comparison)
- Poor error handling (postMessage throws, localStorage fails)
- Redundant state management
- Production console.logs
- Missing accessibility
- No runtime validation

This is **barely acceptable** code. I wouldn't ship it without fixes, but I also wouldn't fire you over it. I'd put you on a PIP though.

## Path to Redemption

1. **[CRITICAL] Eliminate `any` type casts** - Update `BuilderSlide` type in [`lib/story-builder/types.ts`](lib/story-builder/types.ts) to include all teleprompter properties (focalPoint, fontSize, textAlign, lineHeight, letterSpacing, scrollSpeed, mirrorHorizontal, mirrorVertical, backgroundColor, backgroundOpacity, safeAreaPadding). Remove all `(slide as any)` casts. This is non-negotiable.

2. **[CRITICAL] Add runtime validation** - Call your clamp functions! In [`TeleprompterSlideEditor.tsx`](app/story-builder/components/slides/editors/TeleprompterSlideEditor.tsx), wrap user input with `clampFontSize(value)`, `clampFocalPoint(value)`, etc. before calling `updateSlide`. Validate hex colors with `isValidHexColor` before applying. You wrote the utilities—use them!

3. **[HIGH] Fix performance disaster in usePreviewSync** - Replace the `JSON.stringify` comparison with a proper deep equality check (use lodash isEqual or write your own). Cache the comparison result to avoid doing it twice. Better yet, use Immer or immer-based Zustand middleware for automatic change detection.

4. **[HIGH] Remove all console.log statements** - Create a `logger.ts` utility with DEBUG flag that only logs in development. Replace all `console.log` calls with this logger. Production should be silent unless there's an actual error.

5. **[HIGH] Simplify state management in TeleprompterSlideEditor** - Remove local state mirroring. Use the slide/store values directly or use controlled components with `useMemo` for derived values. The 13-department useEffect is a code smell.

6. **[MEDIUM] Add error handling around postMessage** - Wrap `iframe.contentWindow.postMessage` in try/catch. Log errors and show a toast notification when sync fails. Don't fail silently.

7. **[MEDIUM] Improve accessibility** - Add `aria-valuenow`, `aria-valuetext`, and proper labels to all sliders. Ensure keyboard navigation works for all controls. Run through with a screen reader.

8. **[LOW] Extract magic constants** - Create a `constants.ts` file for FOCAL_POINT_BASE, FOCAL_POINT_WITH_SAFE_AREA, SYNC_DEBOUNCE_MS, etc. Document why these values were chosen.

9. **[LOW] Standardize tooltip implementation** - Replace custom FocalPointIndicator tooltip with shadcn/ui Tooltip for consistency.

10. **[LOW] Add error case tests** - Write tests for postMessage failure, localStorage quota exceeded, invalid hex colors, and boundary conditions. Praying is not testing.

---

**Final Words**: 
You implemented the feature, and I'll give you credit for that. But the way you implemented it suggests you view TypeScript strict mode as a suggestion rather than a requirement. The `any` types alone are enough to make me question your judgment. 

Clean up the type safety, fix the performance issues, and handle errors like a professional engineer. Then we can talk about this being "production-ready." Until then, this code is on thin ice.

Now go fix it before I `git reset --hard` your entire career.

**Sr. Principal Engineer from Hell** 🔥
