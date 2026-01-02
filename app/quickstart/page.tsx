"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CategoryFilter } from '@/components/QuickStart/CategoryFilter';
import { TemplateGrid } from '@/components/QuickStart/TemplateGrid';
import { templates, getTemplatesByCategory, ScriptTemplate } from '@/lib/templates/templateConfig';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

/**
 * Quick Start page with template selection
 * Users can choose pre-built script templates to get started faster
 */
export default function QuickStartPage() {
  const t = useTranslations("QuickStartPage");
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'all') {
      return templates;
    }
    return getTemplatesByCategory(selectedCategory as ScriptTemplate['category']);
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t("back")}</span>
            </Link>
            <ThemeSwitcher />
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
              {t("brand")}
            </h1>
            <div className="w-16" /> {/* Spacer for balance */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-pink-500/20 rounded-full">
              <Sparkles className="w-8 h-8 text-pink-400" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            {t("title")}
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {t("description")}
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Template Grid */}
        <TemplateGrid templates={filteredTemplates} />

        {/* CTA Section */}
        <div className="text-center mt-16 pt-8 border-t border-gray-800">
          <p className="text-gray-400 mb-4">
            {t("dontSeeTemplate")}{' '}
            <Link href="/studio" className="text-pink-400 hover:text-pink-300 font-medium">
              {t("startFromScratch")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
