/**
 * Mock for next-intl package
 */

export const useTranslations = jest.fn(() => jest.fn((key: string) => key));
export const useLocale = jest.fn(() => 'en');
export const useFormatter = jest.fn(() => ({
  date: jest.fn(() => ''),
  time: jest.fn(() => ''),
  number: jest.fn(() => ''),
}));
export const useMessages = jest.fn(() => ({}));
export const useNow = jest.fn(() => new Date());
export const useTimeZone = jest.fn(() => 'UTC');

export const NextIntlClientProvider = ({ children }: { children: React.ReactNode }) => children;
export const IntlProvider = ({ children }: { children: React.ReactNode }) => children;