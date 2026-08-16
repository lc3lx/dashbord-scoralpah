import { isLocale, LOCALE_STORAGE_KEY, type Locale } from './types';
import { getTelegramLanguageCode } from '../telegram/telegramWebApp';

type Listener = (locale: Locale) => void;

const listeners = new Set<Listener>();

function localeFromLanguageCode(code: string | null): Locale | null {
  if (!code) return null;
  if (code === 'ar' || code.startsWith('ar-') || code.startsWith('ar_')) return 'ar';
  if (code === 'en' || code.startsWith('en-') || code.startsWith('en_')) return 'en';
  return null;
}

function readStoredLocale(): Locale | null {
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function detectInitialLocale(): Locale {
  const stored = readStoredLocale();
  if (stored) return stored;

  const fromTelegram = localeFromLanguageCode(getTelegramLanguageCode());
  if (fromTelegram) return fromTelegram;

  return 'ar';
}

let currentLocale: Locale = detectInitialLocale();

export function getLocale(): Locale {
  return currentLocale;
}

export function getDocumentDir(locale: Locale = currentLocale): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export function applyDocumentLocale(locale: Locale = currentLocale): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = locale;
  document.documentElement.dir = getDocumentDir(locale);
}

export function setLocale(next: Locale): void {
  if (next === currentLocale) {
    applyDocumentLocale(next);
    return;
  }

  currentLocale = next;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
  } catch {
    // Ignore quota / private mode failures.
  }
  applyDocumentLocale(next);
  listeners.forEach((listener) => listener(next));
}

export function subscribeLocale(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

applyDocumentLocale(currentLocale);
