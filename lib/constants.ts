import { inter, oswald, robotoMono, merriweather, lobster } from './fonts';

// Re-export z-index constants for centralized layer management
export * from './constants/z-index';

export const FONT_STYLES = [
  { name: 'Classic', font: inter.className, label: 'Cổ điển' },
  { name: 'Modern', font: oswald.className, label: 'Hiện đại' },
  { name: 'Typewriter', font: robotoMono.className, label: 'Máy chữ' },
  { name: 'Novel', font: merriweather.className, label: 'Tiểu thuyết' },
  { name: 'Neon', font: lobster.className, label: 'Bay bổng' },
];

export const TEXT_COLORS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Yellow', value: '#fbbf24' },
  { name: 'Green', value: '#4ade80' },
  { name: 'Blue', value: '#60a5fa' },
  { name: 'Pink', value: '#f472b6' },
  { name: 'Red', value: '#f87171' },
];
