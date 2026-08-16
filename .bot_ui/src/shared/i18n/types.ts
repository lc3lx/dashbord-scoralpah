export type Locale = 'en' | 'ar';

export type TranslateParams = Record<string, string | number>;

export type TranslateFn = (key: string, params?: TranslateParams) => string;

export const LOCALE_STORAGE_KEY = 'scar-alpha-locale';

export const SUPPORTED_LOCALES: Locale[] = ['ar', 'en'];

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'ar';
}
