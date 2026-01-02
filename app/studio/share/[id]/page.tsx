'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
// 007-unified-state-architecture: Use new stores with single responsibility
import { useContentStore } from '@/lib/stores/useContentStore'
import { useConfigStore } from '@/lib/stores/useConfigStore'
import { useUIStore } from '@/stores/useUIStore'
import { Editor } from '@/components/teleprompter/Editor'
import { Runner } from '@/components/teleprompter/Runner'
import { AppProvider } from '@/components/AppProvider'
import { Toaster } from 'sonner'
import { AnimatePresence } from 'framer-motion'

interface ScriptSettings {
  font?: string
  colorIndex?: number
  align?: string
  speed?: number
  fontSize?: number
  lineHeight?: number
  margin?: number
  overlayOpacity?: number
}

interface SharedScript {
  share_id: string
  script: {
    id: string
    title: string
    content: string
    bg_url?: string
    music_url?: string
    settings: ScriptSettings
  }
  author: {
    display_name?: string
    avatar_url?: string
  }
  shared_at: string
}

export default function SharedScriptPage({ params }: { params: { id: string } }) {
  const t = useTranslations("SharedScriptPage")
  const [script, setScript] = useState<SharedScript | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // 007-unified-state-architecture: Use new stores with single responsibility
  const { setAll: setContentAll, setIsReadOnly } = useContentStore()
  const { setAll: setConfigAll } = useConfigStore()
  const { setMode } = useUIStore()
  const router = useRouter()

  useEffect(() => {
    async function loadSharedScript() {
      try {
        const response = await fetch(`/api/share/${params.id}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError(t("scriptNotFound"))
          } else {
            setError(t("failedToLoad"))
          }
          return
        }

        const data: SharedScript = await response.json()
        setScript(data)

        // Load script into teleprompter store
        const fontName = data.script.settings?.font || 'Classic'
        const validFonts = ['Classic', 'Modern', 'Typewriter', 'Novel', 'Neon'] as const
        const font = validFonts.includes(fontName as typeof validFonts[number]) ? fontName as typeof validFonts[number] : 'Classic'

        const alignValue = data.script.settings?.align || 'center'
        const validAligns = ['left', 'center'] as const
        const align = validAligns.includes(alignValue as typeof validAligns[number]) ? alignValue as typeof validAligns[number] : 'center'

        // 007-unified-state-architecture: Use new stores - set content in useContentStore
        setContentAll({
          text: data.script.content,
          bgUrl: data.script.bg_url || '',
          musicUrl: data.script.music_url || ''
        })
        
        // Set read-only mode
        setIsReadOnly(true)
        
        // 007-unified-state-architecture: Set config in useConfigStore
        setConfigAll({
          version: '1.0.0',
          typography: {
            fontFamily: font,
            fontSize: data.script.settings?.fontSize || 48,
            fontWeight: 400,
            letterSpacing: 0,
            lineHeight: data.script.settings?.lineHeight || 1.5,
            textTransform: 'none'
          },
          colors: {
            primaryColor: '#ffffff',
            gradientEnabled: false,
            gradientType: 'linear',
            gradientColors: ['#ffffff'],
            gradientAngle: 0,
            outlineColor: '#000000',
            glowColor: '#ffffff'
          },
          effects: {
            shadowEnabled: false,
            shadowColor: '#000000',
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowOpacity: 1,
            outlineEnabled: false,
            outlineColor: '#000000',
            outlineWidth: 0,
            glowEnabled: false,
            glowColor: '#ffffff',
            glowIntensity: 0.5,
            glowBlurRadius: 20,
            backdropFilterEnabled: false,
            backdropBlur: 0,
            backdropBrightness: 100,
            backdropSaturation: 100,
            overlayOpacity: data.script.settings?.overlayOpacity || 0.5
          },
          layout: {
            textAlign: align,
            horizontalMargin: data.script.settings?.margin || 20,
            verticalPadding: 20,
            columnCount: 1,
            columnGap: 20,
            textAreaWidth: 100,
            textAreaPosition: 'center'
          },
          animations: {
            smoothScrollEnabled: true,
            scrollDamping: 0.95,
            entranceAnimation: 'none',
            entranceDuration: 300,
            wordHighlightEnabled: false,
            highlightColor: '#ffff00',
            highlightSpeed: 3,
            autoScrollEnabled: true,
            autoScrollSpeed: (data.script.settings?.speed || 2) * 10,
            autoScrollAcceleration: 0
          },
          metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            appVersion: '1.0.0'
          }
        })
        
        // Set mode to running
        setMode('running')
      } catch (err) {
        console.error('Error loading shared script:', err)
        setError(t("failedToLoad"))
      } finally {
        setLoading(false)
      }
    }

    loadSharedScript()
  }, [params.id, setContentAll, setIsReadOnly, setConfigAll, setMode])

  if (loading) {
    return (
      <AppProvider>
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p>{t("loadingSharedScript")}</p>
          </div>
        </div>
      </AppProvider>
    )
  }

  if (error) {
    return (
      <AppProvider>
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">{t("scriptNotAvailable")}</h1>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
            >
              {t("goToStudio")}
            </button>
          </div>
        </div>
      </AppProvider>
    )
  }

  return (
    <AppProvider>
      <Toaster position="top-center" richColors />
      <AnimatePresence mode="wait">
        {/* 007-unified-state-architecture: Shared scripts always run in Runner mode */}
        <Runner key="runner" />
      </AnimatePresence>
    </AppProvider>
  )
}