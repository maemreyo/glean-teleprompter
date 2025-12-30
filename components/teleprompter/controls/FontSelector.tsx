"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { FONT_STYLES } from '@/lib/constants';

interface FontSelectorProps {
  selectedFont: string;
  onSelect: (font: string) => void;
}

export const FontSelector: React.FC<FontSelectorProps> = ({ selectedFont, onSelect }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {FONT_STYLES.map((style) => (
        <button 
            key={style.name} 
            onClick={() => onSelect(style.name)}
            className={cn(
                "px-3 py-1.5 rounded-md text-xs border transition-all whitespace-nowrap", 
                selectedFont === style.name 
                    ? "bg-white text-black font-bold" 
                    : "border-gray-800 text-gray-500 hover:border-gray-600"
            )}
        >
          {style.name}
        </button>
      ))}
    </div>
  );
};
