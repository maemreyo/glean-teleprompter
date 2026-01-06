/**
 * Template Data
 *
 * Pre-built story templates for quick starts.
 * Three templates: Product Announcement, Tutorial, Q&A
 *
 * @feature 013-visual-story-builder
 */

import type { Template } from '../types';
import type { AnySlide } from '../../story/types';

// ============================================================================
// Templates
// ============================================================================

export const templates: Template[] = [
  {
    id: 'product-announcement',
    name: 'Product Announcement',
    description: 'Introduce your new product with key features and call-to-action',
    thumbnail: '/templates/product-announcement.jpg',
    category: 'business',
    difficulty: 'beginner',
    estimatedTime: 5,
    slides: [
      {
        id: crypto.randomUUID(),
        type: 'text-highlight',
        duration: 5,
        animation: { type: 'fade', duration: 300 },
        content: '🎉 New Product Launch!',
        highlights: [],
      },
      {
        id: crypto.randomUUID(),
        type: 'text-highlight',
        duration: 5,
        animation: { type: 'slide-in', direction: 'up', duration: 300 },
        content: 'Introducing our latest innovation',
        highlights: [],
      },
      {
        id: crypto.randomUUID(),
        type: 'image',
        duration: 7,
        animation: { type: 'zoom', duration: 500 },
        content: 'https://via.placeholder.com/1080x1920/8B5CF6/FFFFFF?text=Product+Showcase',
        alt: 'Product showcase image',
      },
      {
        id: crypto.randomUUID(),
        type: 'text-highlight',
        duration: 10,
        animation: { type: 'fade', duration: 300 },
        content: 'Key Features:\n\n✨ Feature 1\n✨ Feature 2\n✨ Feature 3',
        highlights: [],
      },
    ],
  },
{
  id: 'tutorial',
  name: 'Step-by-Step Tutorial',
  description: 'Guide your audience through a process with clear steps',
  thumbnail: '/templates/tutorial.jpg',
  category: 'education',
  difficulty: 'intermediate',
  estimatedTime: 10,
  slides: [
    {
      id: crypto.randomUUID(),
      type: 'text-highlight',
      duration: 5,
      animation: { type: 'fade', duration: 300 },
      content: 'How to Get Started',
      highlights: [],
    },
    {
      id: crypto.randomUUID(),
      type: 'text-highlight',
      duration: 7,
      animation: { type: 'slide-in', direction: 'left', duration: 300 },
      content: 'Step 1: Preparation',
      highlights: [],
    },
    {
      id: crypto.randomUUID(),
      type: 'text-highlight',
      duration: 7,
      animation: { type: 'slide-in', direction: 'left', duration: 300 },
      content: 'Step 2: Execution',
      highlights: [],
    },
    {
      id: crypto.randomUUID(),
      type: 'text-highlight',
      duration: 7,
      animation: { type: 'slide-in', direction: 'left', duration: 300 },
      content: 'Step 3: Completion',
      highlights: [],
    },
    {
      id: crypto.randomUUID(),
      type: 'text-highlight',
      duration: 10,
      animation: { type: 'fade', duration: 300 },
      content: '🎯 You\'re all set!\n\nReady to begin?',
      highlights: [],
    },
  ],
},
  {
    id: 'qa',
    name: 'Q&A Session',
    description: 'Engage your audience with common questions and answers',
    thumbnail: '/templates/qa.jpg',
    category: 'social',
    difficulty: 'beginner',
    estimatedTime: 5,
    slides: [
      {
        id: crypto.randomUUID(),
        type: 'poll',
        duration: 10,
        animation: { type: 'fade', duration: 300 },
        question: 'What\'s your biggest challenge?',
        options: [
          { id: 'opt-1', text: 'Time management' },
          { id: 'opt-2', text: 'Budget constraints' },
          { id: 'opt-3', text: 'Technical skills' },
          { id: 'opt-4', text: 'Other' },
        ],
      },
      {
        id: crypto.randomUUID(),
        type: 'text-highlight',
        duration: 8,
        animation: { type: 'slide-in', direction: 'up', duration: 300 },
        content: 'Here\'s the solution!\n\n💡 Pro tip inside',
        highlights: [],
      },
      {
        id: crypto.randomUUID(),
        type: 'teleprompter',
        duration: 'manual',
        animation: { type: 'fade', duration: 300 },
        content: 'Want to learn more? Check out our full guide at the link in bio. Don\'t forget to follow for daily tips and tricks!',
      },
    ],
  },
];
