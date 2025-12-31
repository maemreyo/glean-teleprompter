"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="container mx-auto"
      >
        <div className="bg-gradient-to-r from-pink-500/20 to-violet-500/20 border border-pink-500/30 rounded-2xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Creating?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Join thousands of content creators who use Glean Teleprompter
            to create professional videos and presentations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/quickstart"
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold rounded-full hover:shadow-lg hover:shadow-pink-500/25 transition-all inline-flex items-center gap-2"
            >
              Create Your First Script
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/demo"
              className="px-8 py-4 bg-gray-800 text-white font-bold rounded-full hover:bg-gray-700 transition-colors"
            >
              Try Demo First
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
