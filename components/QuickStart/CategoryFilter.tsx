"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const t = useTranslations('QuickStart.categories');
  
  const categories = [
    { id: 'all', name: t('all') },
    { id: 'business', name: t('business') },
    { id: 'creative', name: t('creative') },
    { id: 'education', name: t('education') },
    { id: 'blank', name: t('blank') }
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
