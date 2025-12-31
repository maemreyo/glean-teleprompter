/**
 * Script Fixtures
 * Provides mock saved script data for testing script loading functionality
 */

import { ScriptActionResult } from '../types/test-mocks';

/**
 * Script with modern config format
 */
export const scriptWithConfig: ScriptActionResult = {
  success: true,
  script: {
    content: 'This is a saved script with modern config',
    bg_url: 'https://example.com/background.jpg',
    music_url: 'https://example.com/music.mp3',
    config: {
      typography: {
        fontFamily: 'Classic',
        fontSize: 48,
        lineHeight: 1.5,
        align: 'center'
      },
      colors: {
        colorIndex: 0
      },
      effects: {
        shadow: { enabled: false },
        glow: { enabled: true, color: '#00ffff' }
      }
    }
  }
};

/**
 * Script with legacy settings format
 */
export const scriptWithLegacySettings: ScriptActionResult = {
  success: true,
  script: {
    content: 'This is a saved script with legacy settings',
    bg_url: 'https://example.com/bg.jpg',
    music_url: '',
    settings: {
      font: 'Modern',
      colorIndex: 2,
      speed: 4,
      fontSize: 52,
      align: 'left',
      lineHeight: 1.6,
      margin: 10,
      overlayOpacity: 0.6
    }
  }
};

/**
 * Script without config or settings
 */
export const scriptWithoutConfig: ScriptActionResult = {
  success: true,
  script: {
    content: 'Basic script without any styling',
    bg_url: '',
    music_url: ''
  }
};

/**
 * Script with background and music URLs
 */
export const scriptWithMedia: ScriptActionResult = {
  success: true,
  script: {
    content: 'Script with background image and music',
    bg_url: 'https://example.com/cool-bg.jpg',
    music_url: 'https://example.com/upbeat-music.mp3',
    config: {
      typography: {
        fontFamily: 'Neon',
        fontSize: 56,
        lineHeight: 1.7,
        align: 'center'
      },
      colors: {
        colorIndex: 3
      },
      effects: {
        shadow: { enabled: false },
        glow: { enabled: true, color: '#ff00ff' }
      }
    }
  }
};

/**
 * Script error result (script not found)
 */
export const scriptNotFoundError: ScriptActionResult = {
  success: false,
  error: 'Script not found'
};

/**
 * Script error result (generic error)
 */
export const scriptGenericError: ScriptActionResult = {
  success: false,
  error: 'Failed to load script'
};

/**
 * Script with invalid config values
 */
export const scriptWithInvalidValues: ScriptActionResult = {
  success: true,
  script: {
    content: 'Script with invalid config values',
    bg_url: '',
    music_url: '',
    settings: {
      font: 'Classic',
      colorIndex: -1, // Invalid
      speed: 0,
      fontSize: -48, // Invalid
      align: 'center',
      lineHeight: 0, // Invalid
      margin: 0,
      overlayOpacity: 2 // Invalid (>1)
    }
  }
};

/**
 * Script with all legacy properties
 */
export const scriptWithAllLegacyProperties: ScriptActionResult = {
  success: true,
  script: {
    content: 'Script with all legacy properties populated',
    bg_url: 'https://example.com/bg.jpg',
    music_url: 'https://example.com/music.mp3',
    settings: {
      font: 'Typewriter',
      colorIndex: 1,
      speed: 3,
      fontSize: 44,
      align: 'center',
      lineHeight: 1.4,
      margin: 5,
      overlayOpacity: 0.3
    }
  }
};

/**
 * Script with partial config (only some properties)
 */
export const scriptWithPartialConfig: ScriptActionResult = {
  success: true,
  script: {
    content: 'Script with partial config',
    bg_url: '',
    music_url: '',
    config: {
      typography: {
        fontFamily: 'Novel',
        fontSize: 40,
        lineHeight: 1.8,
        align: 'center'
      }
    }
  }
};
