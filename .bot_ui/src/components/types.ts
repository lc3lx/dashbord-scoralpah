import type { ElementType, ReactNode } from 'react';

export type IconSize =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'nav'
  | 'fab'
  | 'notification'
  | 'trade'
  | 'avatar'
  | 'loader'
  | 'fill';

export type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'body-sm'
  | 'caption'
  | 'caption-xs'
  | 'label'
  | 'nav';

export type TextTone =
  | 'primary'
  | 'secondary'
  | 'body'
  | 'muted'
  | 'placeholder'
  | 'caption'
  | 'footer'
  | 'link'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'nav-active'
  | 'onboarding'
  | 'skip'
  | 'connector'
  | 'disclaimer';

export type ButtonVariant = 'primary' | 'ghost' | 'text-link' | 'icon';

export type ChipTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info' | 'active' | 'awaiting';

export type ChipStyle = 'solid' | 'outlined';

export type NotificationVariant =
  | 'account-not-approved'
  | 'account-approved'
  | 'activation-success'
  | 'bot-started'
  | 'new-signal'
  | 'trade-profit'
  | 'trade-loss'
  | 'profit-target'
  | 'loss-limit'
  | 'live-trade';

export type TradeDirection = 'up' | 'down';

export type BotControlAction = 'start' | 'pause' | 'stop' | 'apply';

export type NavTab = 'home' | 'bot' | 'trades' | 'profile';

export type GlowVariant = 'center' | 'top-right' | 'bottom';

export type PolymorphicProps<T extends ElementType> = {
  as?: T;
  children?: ReactNode;
  className?: string;
};
