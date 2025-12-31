"use client";

import React from 'react';
import { TemplateCard } from './TemplateCard';
import { ScriptTemplate } from '@/lib/templates/templateConfig';

interface TemplateGridProps {
  templates: ScriptTemplate[];
  category?: string;
}

export function TemplateGrid({ templates, category }: TemplateGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template, index) => (
        <TemplateCard
          key={template.id}
          template={template}
          index={index}
        />
      ))}
    </div>
  );
}
