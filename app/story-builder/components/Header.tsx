'use client';

import { Copy, Check, LayoutTemplate, Undo, Redo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AutoSaveIndicator } from '@/components/story-builder/AutoSaveIndicator';
import { useStoryBuilderStore } from '@/lib/story-builder/store';
import { TemplateGalleryModal } from './TemplateGalleryModal';
import { templates } from '@/lib/story-builder/templates/data';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
    <header className="sticky top-0 z-50 h-14 border-b flex items-center justify-between px-4 bg-background/80 backdrop-blur-md">
      <div className="flex flex-col">
        <h1 className="text-sm md:text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          Story Builder
        </h1>
        <p className="hidden md:block text-[10px] text-muted-foreground">
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
          className="h-9 px-3 md:px-4"
        >
          <LayoutTemplate className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">Templates</span>
        </Button>
        
        <Button
          variant="default"
          size="sm"
          onClick={handleCopyUrl}
          disabled={slides.length === 0}
          className={cn(
            "h-9 px-3 md:px-4 font-medium transition-all duration-300",
            !copied && "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:opacity-90 border-0"
          )}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Copy URL</span>
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
