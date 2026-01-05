/**
 * Mirror Toggle Component
 * 
 * Toggles mirror mode for teleprompter glass compatibility.
 * Uses scaleX(-1) to horizontally flip the content.
 * 
 * @feature 012-standalone-story
 */

import { useCallback } from 'react';
import { useTeleprompterStore } from '@/lib/stores/useTeleprompterStore';

interface MirrorToggleProps {
  className?: string;
}

/**
 * Mirror mode toggle switch for teleprompter
 */
export function MirrorToggle({ className = '' }: MirrorToggleProps) {
  const { isMirrored, toggleMirror } = useTeleprompterStore();

  const handleChange = useCallback(() => {
    toggleMirror();
  }, [toggleMirror]);

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <label
        htmlFor="teleprompter-mirror"
        className="text-sm font-medium text-white cursor-pointer"
      >
        Mirror Mode
      </label>
      <button
        id="teleprompter-mirror"
        type="button"
        role="switch"
        aria-checked={isMirrored}
        onClick={handleChange}
        className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isMirrored ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
