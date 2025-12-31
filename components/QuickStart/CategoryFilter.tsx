"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'business', name: 'Business' },
    { id: 'creative', name: 'Creative' },
    { id: 'education', name: 'Education' },
    { id: 'blank', name: 'Blank' }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-all',
            selectedCategory === category.id
              ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/25'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
