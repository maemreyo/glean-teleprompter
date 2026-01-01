import React from 'react'
import { ConfigPanel } from '@/components/teleprompter/config/ConfigPanel'
import { PreviewPanel } from '@/components/teleprompter/editor/PreviewPanel'
// 007-unified-state-architecture: Use new stores with single responsibility
import { useContentStore } from '@/lib/stores/useContentStore'

interface ConfigPreviewTestWrapperProps {
  bgUrl?: string
  text?: string
  className?: string
}

/**
 * Test wrapper component that renders both ConfigPanel and PreviewPanel
 * for integration testing of config-to-preview synchronization
 */
export const ConfigPreviewTestWrapper: React.FC<ConfigPreviewTestWrapperProps> = ({
  bgUrl = '',
  text = 'Test teleprompter text',
  className = ''
}) => {
  // 007-unified-state-architecture: Use useContentStore for content initialization
  const { setText, setBgUrl } = useContentStore()
  
  React.useEffect(() => {
    setText(text)
    setBgUrl(bgUrl)
  }, [text, bgUrl, setText, setBgUrl])

  return (
    <div className={`flex h-screen ${className}`}>
      {/* Config Panel - Left side */}
      <div className="w-1/3 border-r border-border">
        <ConfigPanel />
      </div>

      {/* Preview Panel - Right side */}
      <div className="w-2/3">
        <PreviewPanel />
      </div>
    </div>
  )
}

/**
 * Simplified wrapper for testing just the preview with config changes
 */
export const PreviewOnlyTestWrapper: React.FC<{
  bgUrl?: string
  text?: string
  className?: string
}> = ({
  bgUrl = '',
  text = 'Test teleprompter text',
  className = ''
}) => {
  // 007-unified-state-architecture: Use useContentStore for content initialization
  const { setText, setBgUrl } = useContentStore()
  
  React.useEffect(() => {
    setText(text)
    setBgUrl(bgUrl)
  }, [text, bgUrl, setText, setBgUrl])

  return (
    <div className={`h-screen ${className}`}>
      <PreviewPanel />
    </div>
  )
}