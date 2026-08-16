import { useI18n, type Locale } from '@shared/i18n';
import { cn } from '@utils/cn';
import styles from './LanguageSwitcher.module.css';

export type LanguageSwitcherProps = {
  className?: string;
};

const OPTIONS: Array<{ locale: Locale; labelKey: 'language.english' | 'language.arabic' }> = [
  { locale: 'ar', labelKey: 'language.arabic' },
  { locale: 'en', labelKey: 'language.english' },
];

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n();

  return (
    <section className={cn(styles.section, className)} aria-label={t('language.label')}>
      <p className={styles.label}>{t('language.label')}</p>
      <div className={styles.row} role="group">
        {OPTIONS.map((option) => {
          const active = option.locale === locale;
          return (
            <button
              key={option.locale}
              type="button"
              className={cn(styles.option, active && styles.active)}
              aria-pressed={active}
              onClick={() => setLocale(option.locale)}
            >
              {t(option.labelKey)}
            </button>
          );
        })}
      </div>
    </section>
  );
}
