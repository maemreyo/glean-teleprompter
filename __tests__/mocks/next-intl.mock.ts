/**
 * Mock for next-intl package
 */

// Create a translation function that returns the key as-is
const createT = (namespace: string) => (key: string) => {
  // If key includes a dot, it's already namespaced
  if (key.includes('.')) {
    return key;
  }
  // Otherwise prefix with namespace
  return `${namespace}.${key}`;
};

export const useTranslations = jest.fn((namespace: string = 'Config') => {
  return createT(namespace);
});
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