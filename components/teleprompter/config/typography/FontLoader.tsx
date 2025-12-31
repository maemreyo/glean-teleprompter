'use client'

import { useEffect, useRef } from 'react'
import { getFontByName, getAllFonts } from '@/lib/fonts/google-fonts'

/**
 * FontLoader - Dynamically loads Google Fonts
 *
 * This component loads Google Fonts on demand when they are needed.
 * It maintains a cache of loaded fonts to avoid duplicate requests.
 */
export function FontLoader({ fontFamily }: { fontFamily: string }) {
  const loadedFontsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    // Don't load if already loaded or if it's a system font
    if (loadedFontsRef.current.has(fontFamily) || !fontFamily) {
      return
    }

    // Get font info
    const fontInfo = getFontByName(fontFamily)
    if (!fontInfo || !fontInfo.url) {
      console.warn(`Font "${fontFamily}" not found in font library or has no URL`)
      return
    }

    // Check if link element already exists
    const existingLink = document.querySelector(`link[href="${fontInfo.url}"]`)
    if (existingLink) {
      loadedFontsRef.current.add(fontFamily)
      return
    }

    // Create and append link element
    const link = document.createElement('link')
    link.href = fontInfo.url
    link.rel = 'stylesheet'
    link.crossOrigin = 'anonymous'

    // Add to document head
    document.head.appendChild(link)

    // Mark as loaded
    loadedFontsRef.current.add(fontFamily)

    console.log(`[FontLoader] Loaded font: ${fontFamily} from ${fontInfo.url}`)

    // Cleanup function (though we keep fonts loaded for performance)
    return () => {
      // We don't remove fonts once loaded for performance reasons
      // They can be reused across the app
    }
  }, [fontFamily])

  return null // This component doesn't render anything
}

/**
 * PreloadFonts - Preloads all fonts for better performance
 *
 * This component can be used to preload all fonts on app startup
 * if desired, though it increases initial load time.
 */
export function PreloadFonts() {
  useEffect(() => {
    const fonts = getAllFonts()

    fonts.forEach(font => {
      if (font.url) {
        const link = document.createElement('link')
        link.href = font.url
        link.rel = 'preload'
        link.as = 'style'
        link.crossOrigin = 'anonymous'
        document.head.appendChild(link)
      }
    })

    console.log('[FontLoader] Preloaded all fonts')
  }, [])

  return null
}