import type { ComponentPropsWithoutRef, ElementType } from 'react';
import { cn } from '@utils/cn';
import type { PolymorphicProps, TextTone, TextVariant } from '../../types';
import styles from './Text.module.css';

type TextOwnProps = {
  variant?: TextVariant;
  tone?: TextTone;
  align?: 'left' | 'center' | 'right';
  truncate?: boolean;
};

export type TextProps<T extends ElementType = 'p'> = PolymorphicProps<T> & TextOwnProps;

const defaultElements: Record<TextVariant, ElementType> = {
  display: 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  body: 'p',
  'body-sm': 'p',
  caption: 'p',
  'caption-xs': 'p',
  label: 'span',
  nav: 'span',
};

const variantClassMap: Record<TextVariant, string> = {
  display: styles.variantDisplay,
  h1: styles.variantH1,
  h2: styles.variantH2,
  h3: styles.variantH3,
  body: styles.variantBody,
  'body-sm': styles.variantBodySm,
  caption: styles.variantCaption,
  'caption-xs': styles.variantCaptionXs,
  label: styles.variantLabel,
  nav: styles.variantNav,
};

const toneClassMap: Record<TextTone, string> = {
  primary: styles.tonePrimary,
  secondary: styles.toneSecondary,
  body: styles.toneBody,
  muted: styles.toneMuted,
  placeholder: styles.tonePlaceholder,
  caption: styles.toneCaption,
  footer: styles.toneFooter,
  link: styles.toneLink,
  success: styles.toneSuccess,
  danger: styles.toneDanger,
  warning: styles.toneWarning,
  info: styles.toneInfo,
  'nav-active': styles.toneNavActive,
  onboarding: styles.toneOnboarding,
  skip: styles.toneSkip,
  connector: styles.toneConnector,
  disclaimer: styles.toneDisclaimer,
};

export function Text<T extends ElementType = 'p'>({
  as,
  variant = 'body',
  tone = 'primary',
  align = 'left',
  truncate = false,
  className,
  children,
  ...rest
}: TextProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof TextProps<T>>) {
  const Component = as ?? defaultElements[variant];

  return (
    <Component
      className={cn(
        styles.text,
        variantClassMap[variant],
        toneClassMap[tone],
        styles[`align${align.charAt(0).toUpperCase()}${align.slice(1)}`],
        truncate && styles.truncate,
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
