"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ScrollText, Video, Cloud, Palette } from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <ScrollText className="w-6 h-6" />,
    title: 'Smart Teleprompter',
    description: 'Adjustable speed, fonts, colors, and mirror mode for reflectors'
  },
  {
    icon: <Video className="w-6 h-6" />,
    title: 'Built-in Recording',
    description: 'Record yourself while reading the script with camera overlay'
  },
  {
    icon: <Cloud className="w-6 h-6" />,
    title: 'Cloud Sync',
    description: 'Save scripts securely and access from any device'
  },
  {
    icon: <Palette className="w-6 h-6" />,
    title: 'Custom Presets',
    description: 'Save your favorite configurations and apply with one click'
  }
];

export function FeatureCards() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
          <p className="text-gray-400">Powerful features to create professional content</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-pink-500/50 transition-colors"
            >
              <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center text-pink-400 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
