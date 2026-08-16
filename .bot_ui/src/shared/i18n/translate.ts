import { en, type TranslationKey } from './locales/en';
import { ar } from './locales/ar';
import { getLocale } from './localeStore';
import type { Locale, TranslateFn, TranslateParams } from './types';

const dictionaries: Record<Locale, Record<TranslationKey, string>> = {
  en,
  ar,
};

function interpolate(template: string, params?: TranslateParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = params[key];
    return value === undefined || value === null ? match : String(value);
  });
}

export function t(key: TranslationKey | string, params?: TranslateParams): string {
  const locale = getLocale();
  const dict = dictionaries[locale] ?? dictionaries.en;
  const fallback = dictionaries.en;
  const template =
    (dict as Record<string, string>)[key] ??
    (fallback as Record<string, string>)[key] ??
    key;
  return interpolate(template, params);
}

export function createTranslator(locale: Locale): TranslateFn {
  return (key, params) => {
    const dict = dictionaries[locale] ?? dictionaries.en;
    const fallback = dictionaries.en;
    const template =
      (dict as Record<string, string>)[key] ??
      (fallback as Record<string, string>)[key] ??
      key;
    return interpolate(template, params);
  };
}

export type { TranslationKey };
