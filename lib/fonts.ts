import { Inter, Roboto_Mono, Lobster, Merriweather, Oswald, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';

export const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});
export const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
export const robotoMono = Roboto_Mono({ subsets: ['latin'] });
export const lobster = Lobster({ weight: '400', subsets: ['latin'] });
export const merriweather = Merriweather({ weight: ['400', '700'], subsets: ['latin'] });
export const oswald = Oswald({ subsets: ['latin'] });
