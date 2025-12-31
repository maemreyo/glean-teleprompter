/**
 * Local Draft Fixtures
 * Provides mock localStorage draft data for testing draft persistence and auto-save functionality
 */

export interface LocalDraftFixture {
  text: string;
  bgUrl: string;
  musicUrl: string;
  font: string;
  colorIndex: number;
  speed: number;
  fontSize: number;
  align: string;
  lineHeight: number;
  margin: number;
  overlayOpacity: number;
}

/**
 * Valid draft with all properties
 */
export const validDraft: LocalDraftFixture = {
  text: 'My saved draft content',
  bgUrl: 'https://example.com/background.jpg',
  musicUrl: 'https://example.com/music.mp3',
  font: 'Typewriter',
  colorIndex: 1,
  speed: 2,
  fontSize: 44,
  align: 'center',
  lineHeight: 1.4,
  margin: 5,
  overlayOpacity: 0.4
};

/**
 * Minimal draft with default values
 */
export const minimalDraft: LocalDraftFixture = {
  text: '',
  bgUrl: '',
  musicUrl: '',
  font: 'Classic',
  colorIndex: 0,
  speed: 2,
  fontSize: 48,
  align: 'center',
  lineHeight: 1.5,
  margin: 0,
  overlayOpacity: 0.5
};

/**
 * Draft with modern settings
 */
export const modernDraft: LocalDraftFixture = {
  text: 'Modern draft content',
  bgUrl: 'https://example.com/modern-bg.jpg',
  musicUrl: '',
  font: 'Modern',
  colorIndex: 2,
  speed: 4,
  fontSize: 52,
  align: 'left',
  lineHeight: 1.6,
  margin: 10,
  overlayOpacity: 0.6
};

/**
 * Draft with neon styling
 */
export const neonDraft: LocalDraftFixture = {
  text: 'Neon styled draft',
  bgUrl: 'https://example.com/neon-bg.jpg',
  musicUrl: 'https://example.com/electronic-music.mp3',
  font: 'Neon',
  colorIndex: 3,
  speed: 5,
  fontSize: 56,
  align: 'center',
  lineHeight: 1.7,
  margin: 0,
  overlayOpacity: 0.7
};

/**
 * Draft with typewriter font
 */
export const typewriterDraft: LocalDraftFixture = {
  text: 'Typewriter draft content',
  bgUrl: '',
  musicUrl: '',
  font: 'Typewriter',
  colorIndex: 1,
  speed: 2,
  fontSize: 44,
  align: 'center',
  lineHeight: 1.4,
  margin: 5,
  overlayOpacity: 0.3
};

/**
 * Novel reader draft
 */
export const novelDraft: LocalDraftFixture = {
  text: 'Chapter 1: The Beginning\n\nOnce upon a time...',
  bgUrl: '',
  musicUrl: '',
  font: 'Novel',
  colorIndex: 0,
  speed: 1,
  fontSize: 40,
  align: 'center',
  lineHeight: 1.8,
  margin: 20,
  overlayOpacity: 0.2
};

/**
 * Draft with extra properties (schema evolution)
 */
export const draftWithExtraProps = {
  text: 'Content',
  bgUrl: '',
  musicUrl: '',
  font: 'Classic',
  colorIndex: 0,
  speed: 2,
  fontSize: 48,
  align: 'center',
  lineHeight: 1.5,
  margin: 0,
  overlayOpacity: 0.5,
  // Extra properties that don't exist in current schema
  newProperty: 'should be ignored',
  anotherNewProp: 123
} as unknown as LocalDraftFixture;

/**
 * Empty draft
 */
export const emptyDraft: LocalDraftFixture = {
  text: '',
  bgUrl: '',
  musicUrl: '',
  font: 'Classic',
  colorIndex: 0,
  speed: 2,
  fontSize: 48,
  align: 'center',
  lineHeight: 1.5,
  margin: 0,
  overlayOpacity: 0.5
};

/**
 * Draft in run mode (edge case)
 */
export const runModeDraft: LocalDraftFixture = {
  text: 'Playing content',
  bgUrl: '',
  musicUrl: '',
  font: 'Modern',
  colorIndex: 2,
  speed: 4,
  fontSize: 52,
  align: 'left',
  lineHeight: 1.6,
  margin: 10,
  overlayOpacity: 0.6
};
