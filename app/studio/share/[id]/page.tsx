'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTeleprompterStore } from '@/stores/useTeleprompterStore'
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
  const [script, setScript] = useState<SharedScript | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const store = useTeleprompterStore()
  const router = useRouter()

  useEffect(() => {
    async function loadSharedScript() {
      try {
        const response = await fetch(`/api/share/${params.id}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('Script not found or not publicly shared')
          } else {
            setError('Failed to load script')
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

        store.setAll({
          text: data.script.content,
          bgUrl: data.script.bg_url || '',
          musicUrl: data.script.music_url || '',
          font,
          colorIndex: data.script.settings?.colorIndex || 0,
          align,
          speed: data.script.settings?.speed || 2,
          fontSize: data.script.settings?.fontSize || 48,
          lineHeight: data.script.settings?.lineHeight || 1.5,
          margin: data.script.settings?.margin || 0,
          mode: 'running',
          isReadOnly: true
        })
      } catch (err) {
        console.error('Error loading shared script:', err)
        setError('Failed to load script')
      } finally {
        setLoading(false)
      }
    }

    loadSharedScript()
  }, [params.id, store])

  if (loading) {
    return (
      <AppProvider>
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p>Loading shared script...</p>
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
            <h1 className="text-2xl font-bold mb-4">Script Not Available</h1>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
            >
              Go to Studio
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
        {store.mode === 'setup' ? <Editor key="editor" /> : <Runner key="runner" />}
      </AnimatePresence>
    </AppProvider>
  )
}