"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, ChevronRight } from 'lucide-react';
import { ScriptTemplate, formatDuration } from '@/lib/templates/templateConfig';
import { cn } from '@/lib/utils';

interface TemplateCardProps {
  template: ScriptTemplate;
  index: number;
}

export function TemplateCard({ template, index }: TemplateCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <Link href={`/studio?template=${template.id}`}>
        <div className="h-full bg-card border border-border rounded-xl p-6 hover:border-pink-500/50 transition-all hover:shadow-lg hover:shadow-pink-500/10">
          {/* Icon and Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="text-4xl">{template.icon}</div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-pink-400 transition-colors" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-card-foreground mb-2 group-hover:text-pink-400 transition-colors">
            {template.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-400 mb-4 line-clamp-2">
            {template.description}
          </p>

          {/* Metadata */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {template.estimatedDuration > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(template.estimatedDuration)}</span>
              </div>
            )}
            <div className="px-2 py-0.5 bg-gray-800 rounded-full capitalize">
              {template.category}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
