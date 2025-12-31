"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/useUIStore'
import { getActionLabel } from '@/lib/utils/errorMessages'
import { Copy, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { ErrorContext } from '@/stores/useUIStore'

interface ErrorDialogProps {
  errorContext: ErrorContext | null
  onRetry?: () => void
  scriptId?: string
}

/**
 * ErrorDialog component for displaying contextual error messages
 * with actionable recovery buttons
 */
export function ErrorDialog({ errorContext, onRetry, scriptId }: ErrorDialogProps) {
  const router = useRouter()
  const { setErrorContext } = useUIStore()
  const [copied, setCopied] = useState(false)

  const open = errorContext !== null

  const handleClose = () => {
    setErrorContext(null)
    setCopied(false)
  }

  const handleAction = () => {
    if (!errorContext) return

    switch (errorContext.action) {
      case 'retry':
        if (onRetry) {
          onRetry()
        }
        break
      case 'browse_templates':
        router.push('/quickstart')
        break
      case 'sign_up':
        router.push('/auth/sign-up')
        break
      case 'none':
        // Just close the dialog
        break
      default:
        break
    }
    handleClose()
  }

  const handleCopyError = async () => {
    if (!errorContext) return

    const errorDetails = {
      type: errorContext.type,
      message: errorContext.message,
      details: errorContext.details,
      timestamp: new Date(errorContext.timestamp).toISOString(),
      scriptId: scriptId || 'N/A',
    }

    const textToCopy = `Error Details:
----------------
Type: ${errorDetails.type}
Message: ${errorDetails.message}
Description: ${errorDetails.details}
Timestamp: ${errorDetails.timestamp}
Script ID: ${errorDetails.scriptId}`

    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      toast.success('Error details copied to clipboard', { duration: 2000 })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy error details')
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const getActionLabelForError = (): string => {
    if (!errorContext) return 'Retry'
    return getActionLabel(errorContext)
  }

  const getErrorIcon = () => {
    return <AlertCircle className="h-6 w-6 text-destructive" />
  }

  if (!errorContext) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getErrorIcon()}
            <DialogTitle>Error</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {errorContext.message}
          </DialogDescription>
        </DialogHeader>

        {errorContext.details && (
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              {errorContext.details}
            </p>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopyError}
            disabled={copied}
            className="sm:order-1"
          >
            <Copy className="h-4 w-4 mr-2" />
            {copied ? 'Copied!' : 'Copy error'}
          </Button>

          <div className="flex gap-2 sm:order-2">
            {errorContext.action !== 'none' && (
              <Button
                type="button"
                variant="default"
                onClick={handleAction}
              >
                {getActionLabelForError()}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
