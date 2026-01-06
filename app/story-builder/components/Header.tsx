'use client';

import { Copy, Check, LayoutTemplate, Undo, Redo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AutoSaveIndicator } from '@/components/story-builder/AutoSaveIndicator';
import { useStoryBuilderStore } from '@/lib/story-builder/store';
import { TemplateGalleryModal } from './TemplateGalleryModal';
import { templates } from '@/lib/story-builder/templates/data';
import { useState } from 'react';
import { toast } from 'sonner';

export function Header() {
  const { generateUrl, saveStatus, slides, loadTemplate, undo, redo, canUndo, canRedo } = useStoryBuilderStore();
  const [copied, setCopied] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const handleCopyUrl = async () => {
    try {
      const url = generateUrl();
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      loadTemplate(template);
      toast.success('Template loaded!');
    }
  };

  return (
    <header className="h-14 border-b flex items-center justify-between px-4 bg-background">
      <div>
        <h1 className="text-lg font-semibold">Story Builder</h1>
        <p className="text-xs text-muted-foreground">
          {slides.length} {slides.length === 1 ? 'slide' : 'slides'}
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <AutoSaveIndicator status={saveStatus} />
        
        {/* Undo/Redo Buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => undo()}
            disabled={!canUndo()}
            aria-label="Undo"
            title="Undo last action"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => redo()}
            disabled={!canRedo()}
            aria-label="Redo"
            title="Redo last action"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsTemplateModalOpen(true)}
        >
          <LayoutTemplate className="w-4 h-4 mr-2" />
          Templates
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyUrl}
          disabled={slides.length === 0}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy URL
            </>
          )}
        </Button>
      </div>

      <TemplateGalleryModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </header>
  );
}
