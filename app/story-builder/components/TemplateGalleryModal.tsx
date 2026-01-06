'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { templates } from '@/lib/story-builder/templates/data';
import { getTemplateThumbnail } from '@/lib/story-builder/templates/thumbnails';

interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
}

export function TemplateGalleryModal({ isOpen, onClose, onSelectTemplate }: TemplateGalleryModalProps) {
  const handleSelectTemplate = (templateId: string) => {
    onSelectTemplate(templateId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Start with a pre-built story template to accelerate your creation
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={() => handleSelectTemplate(template.id)}
            />
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface TemplateCardProps {
  template: {
    id: string;
    name: string;
    description: string;
    category?: string;
    difficulty?: string;
    estimatedTime?: number;
    thumbnail?: string;
    slides: unknown[];
  };
  onSelect: () => void;
}

function TemplateCard({ template, onSelect }: TemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const thumbnail = template.thumbnail || getTemplateThumbnail(template.id);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card
        className="cursor-pointer overflow-hidden transition-all hover:shadow-lg"
        onClick={onSelect}
      >
        <div className="relative aspect-[9/16] bg-muted">
          <img
            src={thumbnail}
            alt={template.name}
            className="w-full h-full object-cover"
          />
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center"
            >
              <span className="text-white font-medium">Use Template</span>
            </motion.div>
          )}
        </div>
        
        <div className="p-3">
          <h3 className="font-medium text-sm">{template.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {template.slides.length} {template.slides.length === 1 ? 'slide' : 'slides'}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
