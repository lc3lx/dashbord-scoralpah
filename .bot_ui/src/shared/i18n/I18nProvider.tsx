import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  applyDocumentLocale,
  getDocumentDir,
  getLocale,
  setLocale as setStoreLocale,
  subscribeLocale,
} from './localeStore';
import { t as translate } from './translate';
import type { Locale, TranslateFn, TranslateParams } from './types';

type I18nContextValue = {
  locale: Locale;
  dir: 'rtl' | 'ltr';
  setLocale: (locale: Locale) => void;
  t: TranslateFn;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getLocale());

  useEffect(() => {
    applyDocumentLocale(locale);
    return subscribeLocale((next) => setLocaleState(next));
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setStoreLocale(next);
    setLocaleState(next);
  }, []);

  const t = useCallback<TranslateFn>(
    (key: string, params?: TranslateParams) => translate(key, params),
    // Re-bind when locale changes so consumers re-render with fresh strings.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      dir: getDocumentDir(locale),
      setLocale,
      t,
    }),
    [locale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}

export function useT(): TranslateFn {
  return useI18n().t;
}
