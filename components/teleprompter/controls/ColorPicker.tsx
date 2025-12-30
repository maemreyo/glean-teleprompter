"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { TEXT_COLORS } from '@/lib/constants';

interface ColorPickerProps {
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ selectedIndex, onSelect }) => {
  return (
    <div className="flex gap-3 items-center">
      {TEXT_COLORS.map((color, idx) => (
        <button 
            key={color.name} 
            onClick={() => onSelect(idx)}
            className={cn(
                "w-5 h-5 rounded-full transition-transform border border-transparent hover:scale-110", 
                selectedIndex === idx ? "ring-2 ring-white scale-110" : "opacity-60"
            )}
            style={{ backgroundColor: color.value }}
            title={color.name}
        />
      ))}
    </div>
  );
};
