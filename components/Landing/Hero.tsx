"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Play } from 'lucide-react';

export function Hero() {
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
            <span className="text-sm text-pink-300 font-medium">Professional Teleprompter</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Glean Teleprompter
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-gray-400 mb-4">
            Professional teleprompter for content creators
          </p>
          <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
            Write, rehearse, and record your scripts with ease. Perfect for YouTubers,
            podcasters, presenters, and anyone who speaks to an audience.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/quickstart"
              className="group px-8 py-4 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold rounded-full hover:shadow-lg hover:shadow-pink-500/25 transition-all flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              Start Writing
            </Link>
            <Link
              href="/demo"
              className="px-8 py-4 bg-gray-800 text-white font-bold rounded-full hover:bg-gray-700 transition-colors"
            >
              Try Demo
            </Link>
          </div>

          {/* Secondary link */}
          <p className="mt-6 text-sm text-gray-500">
            No account required to try • <Link href="/auth/sign-up" className="text-pink-400 hover:text-pink-300">Sign up for free</Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
