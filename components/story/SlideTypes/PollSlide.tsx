"use client";

/**
 * Poll Slide Component
 *
 * Displays an interactive poll question with selectable options.
 * Shows vote counts for each option.
 *
 * @feature 012-standalone-story
 */

import React, { useState } from 'react';
import type { PollSlide as PollSlideType } from '@/lib/story/types';

export interface PollSlideProps {
  slide: PollSlideType;
}

/**
 * Render a poll slide
 */
export function PollSlide({ slide }: PollSlideProps): React.JSX.Element {
  const { question, options } = slide;
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Calculate total votes for percentage display
  const totalVotes = options.reduce((sum, opt) => sum + (opt.votes || 0), 0);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Question */}
        <h3 className="mb-6 text-center text-xl font-bold text-white drop-shadow-lg">
          {question}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {options.map((option) => {
            const isSelected = selectedOption === option.id;
            const voteCount = option.votes || 0;
            const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;

            return (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`
                  relative w-full overflow-hidden rounded-lg p-4 text-left transition-all
                  ${
                    isSelected
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent'
                      : 'hover:bg-white/10'
                  }
                  `}
              >
                {/* Background fill for voted option */}
                {selectedOption && (
                  <div
                    className="absolute inset-0 bg-blue-500/30 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                )}

                {/* Option text and votes */}
                <div className="relative flex items-center justify-between">
                  <span className="text-white font-medium">{option.text}</span>
                  {selectedOption && (
                    <span className="text-sm text-white">
                      {voteCount} votes ({percentage.toFixed(0)}%)
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Helper text */}
        {selectedOption === null && (
          <p className="mt-6 text-center text-sm text-white/70">
            Tap an option to vote
          </p>
        )}
      </div>
    </div>
  );
}
