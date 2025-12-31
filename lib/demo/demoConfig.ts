/**
 * Demo mode configuration
 * Pre-loaded demo script with realistic content for showcasing teleprompter features
 */

// Re-define types locally since they're not exported from the store
type FontStyle = 'Classic' | 'Modern' | 'Typewriter' | 'Novel' | 'Neon';
type TextAlign = 'left' | 'center';

export const demoConfig = {
  script: {
    text: `// Welcome to Glean Teleprompter Demo!

This is a sample script to help you explore all the features.

🎯 Try adjusting the SPEED slider to find your perfect reading pace.

🎨 Change the FONT style to see how different fonts look on screen.

🌈 Pick a COLOR that matches your brand or mood.

📸 Click the CAMERA button to try recording yourself!

💾 When you're ready to save your own scripts, sign up for a free account.

The teleprompter will scroll automatically when you click the Preview button.
You can pause, play, and adjust speed while reading.

Happy recording! 🎬`,
    font: 'Modern' as FontStyle,
    colorIndex: 2,
    speed: 2,
    fontSize: 48,
    align: 'center' as TextAlign,
    lineHeight: 1.5,
    margin: 0,
    overlayOpacity: 0.5
  },
  media: {
    bgUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=2500',
    musicUrl: '' // Music disabled for demo
  },
  limits: {
    maxRecordingDuration: 60, // 60 seconds for demo
    warnBeforeSave: true
  }
};

/**
 * Demo mode state limits
 */
export interface DemoLimits {
  maxRecordingDuration: number;
  warnBeforeSave: boolean;
  noSaveAllowed: boolean;
  noCloudSync: boolean;
}

export const demoLimits: DemoLimits = {
  maxRecordingDuration: 60,
  warnBeforeSave: true,
  noSaveAllowed: true,
  noCloudSync: true
};
