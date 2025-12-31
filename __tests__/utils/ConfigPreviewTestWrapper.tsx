import React from 'react'
import { ConfigPanel } from '@/components/teleprompter/config/ConfigPanel'
import { PreviewPanel } from '@/components/teleprompter/editor/PreviewPanel'
import { useTeleprompterStore } from '@/stores/useTeleprompterStore'

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
  // Initialize teleprompter store for testing
  React.useEffect(() => {
    useTeleprompterStore.getState().setText(text)
    useTeleprompterStore.getState().setBgUrl(bgUrl)
  }, [text, bgUrl])

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
  React.useEffect(() => {
    useTeleprompterStore.getState().setText(text)
    useTeleprompterStore.getState().setBgUrl(bgUrl)
  }, [text, bgUrl])

  return (
    <div className={`h-screen ${className}`}>
      <PreviewPanel />
    </div>
  )
}