'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SavePresetDialogProps {
  open: boolean
  onClose: () => void
  onSave: (name: string, description?: string) => void
}

export function SavePresetDialog({ open, onClose, onSave }: SavePresetDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), description.trim() || undefined)
      setName('')
      setDescription('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Preset</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="preset-name">Name *</Label>
            <Input
              id="preset-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Custom Preset"
              maxLength={100}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="preset-description">Description</Label>
            <Input
              id="preset-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              maxLength={500}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Save Preset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
