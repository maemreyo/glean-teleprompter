# Standalone Story Viewer - Troubleshooting Guide

This guide helps you diagnose and resolve common issues with the standalone story viewer.

## Wake Lock Issues

### Screen Sleeps During Teleprompter Use

**Problem:** Device screen goes to sleep while reading teleprompter.

**Possible Causes:**
1. Browser doesn't support Wake Lock API
2. NoSleep.js fallback failed to load
3. Low battery mode restrictions
4. System settings override

**Solutions:**

1. **Check Browser Support:**
   - Chrome 90+: Wake Lock API supported natively
   - Safari 14+: Uses NoSleep.js fallback
   - Firefox 88+: Wake Lock API supported

2. **Verify Wake Lock Status:**
   - Open browser console
   - Type: `navigator.wakeLock` (should exist in Chrome/Firefox)
   - Check for errors in console

3 **Test NoSleep.js Loading:**
   ```javascript
   // In browser console
   fetch('https://unpkg.com/nosleep.js@0.12.0/dist/NoSleep.min.js')
     .then(r => r.text())
     .then(code => {
       window.eval(code);
       console.log('NoSleep loaded:', window.NoSleep);
     });
   ```

4 **Check Low Battery Mode:**
   - Disable low battery mode temporarily
   - Wake lock may be restricted by OS in this mode

5 **Alternative Browsers:**
   - Try Chrome if Safari fails
   - Test on different devices

### Wake Lock Error Message

If you see:
> "Screen wake lock not available - please try a different browser or check your network connection"

**Steps:**
1. Check internet connection (for NoSleep.js CDN)
2. Try a different browser
3. Update browser to latest version
4. Check if device supports wake lock features

## Performance Issues

### Scrolling is Jerky or Slow

**Problem:** Teleprompter scrolling isn't smooth.

**Solutions:**

1. **Check FPS in Dev Mode:**
   - Open browser console
   - Type: `__teleprompterFPS.getMetrics()`
   - Verify FPS is 30fps+

2. **Reduce Content Size:**
   - Split long scripts into smaller stories
   - Virtual scrolling activates at 50+ paragraphs

3. **Close Other Tabs:**
   - Too many open tabs can affect performance

4. **Check Device:**
   - Test on different devices
   - Older devices may struggle with long content

### High Battery Drain

**Problem:** Battery drains quickly during use.

**Solutions:**

1. **Lower Scroll Speed:**
   - Reduce speed from 3.0+ to 1.5-2.0

2. **Shorter Sessions:**
   - Take breaks between long reading sessions

3 **Charge Device:**
   - Keep device plugged in during very long sessions

4. **Normal Usage:**
   - Battery drain should be comparable to video playback
   - If significantly worse, check for issues

## Content Display Issues

### Invalid Story Data Error

**Problem:** "Invalid story data - please check the URL or contact the story creator"

**Causes:**
- Malformed JSON
- Missing required fields
- Invalid slide types
- Encoding errors

**Solutions:**

1. **Validate JSON:**
   ```javascript
   const story = JSON.parse(jsonString);
   console.log(story);
   ```

2. **Check Structure:**
   - Has `id` field
   - Has `slides` array
   - Each slide has `type` and `content`/`data`

3. **Verify Encoding:**
   ```javascript
   const decoded = atob(encodedUrl);
   const unescaped = decodeURIComponent(decoded);
   console.log(JSON.parse(unescaped));
   ```

### Content Doesn't Display

**Problem:** Page loads but content is missing.

**Solutions:**

1. **Check Console:**
   - Look for JavaScript errors
   - Check for failed resource loads

2. **Verify Data:**
   - Story has valid slide content
   - Images have accessible URLs (if applicable)

3. **Test Different Browsers:**
   - Try Chrome, Firefox, Safari, Edge
   - Check if issue is browser-specific

## Teleprompter Controls

### Can't Control Teleprompter

**Problem:** Controls don't respond to taps.

**Solutions:**

1. **Check for Teleprompter Mode:**
   - Only teleprompter slides show controls
   - Verify slide type is "teleprompter"

2. **Tap Zones:**
   - Left side: Previous slide (non-teleprompter)
   - Right side: Next slide (non-teleprompter)
   - Center: Pause/Resume (time-based slides)
   - **Teleprompter:** Tap anywhere shows controls

3. **Control Panel:**
   - Tap anywhere on teleprompter slide shows controls
   - Controls auto-hide after 3 seconds

### Speed Doesn't Change

**Problem:** Speed slider doesn't affect scrolling speed.

**Solutions:**

1. **Check Slider Value:**
   - Range is 0 to 5
   - Check if slider is disabled

2. **Verify Store State:**
   ```javascript
   // In browser console
   window.__teleprompterStore?.getState?.scrollSpeed
   ```

3. **Restart Scrolling:**
   - Pause then resume scrolling
   - Speed change takes effect on resume

### Mirror Mode Not Working

**Problem:** Content doesn't appear mirrored.

**Solutions:**

1. **Check Teleprompter Slide:**
   - Mirror mode only works on teleprompter slides
   - Other slide types ignore mirror toggle

2. **Verify Transform:**
   ```javascript
   // Check CSS transform
   const content = document.querySelector('[data-scroll-container]');
   console.log(getComputedStyle(content).transform);
   // Should show scaleX(-1) when mirrored
   ```

## Progress Bar Issues

### Progress Bar Not Updating

**Problem:** Progress bar doesn't show scroll depth for teleprompter.

**Solutions:**

1. **Check Scroll Events:**
   - Teleprompter uses scroll depth (0-100%)
   - Time-based slides use duration (0-100%)

2. **Verify Progress Calculation:**
   ```javascript
   // Check scroll depth
   const depth = window.__teleprompterStore?.getState?.scrollDepth
   console.log('Scroll depth:', depth)
   ```

3. **Check Throttling:**
   - Progress updates are throttled to 100ms
   - May appear delayed but should update eventually

## Auto-Save Issues

### Progress Not Saving

**Problem:** Reading position not restored after closing and reopening.

**Solutions:**

1. **Check localStorage:**
   ```javascript
   const key = 'teleprompter-progress-[slide-id]';
   console.log(localStorage.getItem(key));
   ```

2. **Verify Timestamp:**
   - Saved progress includes timestamp field
   - Recent saves have newer timestamps

3. **Check Quota:**
   - Full localStorage prevents saving
   - Clear some data to make space

### Can't Restore Progress

**Problem:** No restore prompt appears.

**Solutions:**

1. **Check for Saved Progress:**
   - Progress is only saved for teleprompter slides
   - Must have scrolled at least once
   - Saved progress is slide-specific

2. **Manual Restore:**
   - Progress is automatically checked on mount
   - If no dialog appears, no saved progress exists

3. **Start Fresh:**
   - Decline restore to start from beginning
   - New progress will be saved on next session

## Keyboard Shortcuts Not Working

### Desktop Shortcuts Fail

**Problem:** Space, Arrow keys, 'r' don't work.

**Solutions:**

1. **Check Focus:**
   - Click on story viewer first
   - Ensure no input fields have focus

2. **Verify Browser Support:**
   - All modern browsers supported
   - Check for browser extensions that might intercept keys

3. **Check Console:**
   - Look for keyboard event errors
   - Verify hook is mounted

### Screen Reader Not Announcing

**Problem:** Screen reader doesn't announce changes.

**Solutions:**
1. Check ARIA labels are present
2. Verify aria-live regions exist
3. Test with different screen readers (NVDA, VoiceOver)

## Browser Compatibility

### Tested Browsers

| Browser | Wake Lock | NoSleep.js | Status |
|---------|-----------|-----------|--------|
| Chrome 90+ | ✓ | N/A | ✅ Full Support |
| Safari 14+ | ✗ | ✓ | ✅ Full Support |
| Firefox 88+ | ✓ | N/A | ✅ Full Support |
| Edge 90+ | ✓ | N/A | ✅ Full Support |

### Browser-Specific Issues

**Safari:**
- Uses NoSleep.js fallback exclusively
- Wake Lock API not supported
- May require user interaction to enable audio

**Firefox:**
- Wake Lock API fully supported
- Best performance on desktop

**Chrome:**
- Full Wake Lock API support
- Best mobile performance
- May prompt for permission

## Getting Help

If you can't resolve your issue:

1. **Check Console:**
   - All errors are logged to browser console
   - Look for red text in console

2. **Report Issue:**
   - Include browser and version
   - Include error messages from console
   - Describe steps to reproduce
   - Attach story JSON if relevant

3. **Known Issues:**
   - Some devices restrict wake lock (OS-level)
   - Private browsing may limit localStorage
   - Network issues prevent NoSleep.js loading
   - Very long URLs may fail in some browsers
