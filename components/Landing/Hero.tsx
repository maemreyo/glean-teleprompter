"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Play } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function Hero() {
  const t = useTranslations('Landing.hero');
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-pink-500/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(236,72,153,0.1),transparent_50%)]" />

      <div className="container mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/10 border border-pink-500/20 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span className="text-sm text-pink-300 font-medium">{t('badge')}</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
              {t('title')}
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-4">
            {t('tagline')}
          </p>
          <p className="text-muted-foreground/80 mb-8 max-w-2xl mx-auto">
            {t('description')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/quickstart"
              className="group px-8 py-4 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold rounded-full hover:shadow-lg hover:shadow-pink-500/25 transition-all flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              {t('startWriting')}
            </Link>
            <Link
              href="/demo"
              className="px-8 py-4 bg-secondary text-secondary-foreground font-bold rounded-full hover:bg-secondary/80 transition-colors"
            >
              {t('tryDemo')}
            </Link>
          </div>

          {/* Secondary link */}
          <p className="mt-6 text-sm text-muted-foreground">
            {t('noAccountRequired')} • <Link href="/auth/sign-up" className="text-primary hover:text-primary/80">{t('signUpFree')}</Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
