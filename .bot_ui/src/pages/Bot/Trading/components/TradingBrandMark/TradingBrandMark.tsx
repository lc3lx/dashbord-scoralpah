import { tradingAssets } from '@assets/index';
import { useT } from '@shared/i18n';
import { cn } from '@utils/cn';
import styles from './TradingBrandMark.module.css';

export type TradingBrandIconProps = {
  variant?: 'header' | 'signal';
  className?: string;
};

export function TradingBrandIcon({ variant = 'header', className }: TradingBrandIconProps) {
  return (
    <div
      className={cn(
        styles.iconTile,
        variant === 'signal' ? styles.iconTileSignal : styles.iconTileHeader,
        className,
      )}
      aria-hidden="true"
    >
      <img src={tradingAssets.brandSIcon} alt="" className={styles.sIcon} />
    </div>
  );
}

export type TradingBrandWordmarkProps = {
  className?: string;
};

export function TradingBrandWordmark({ className }: TradingBrandWordmarkProps) {
  const t = useT();

  return (
    <div className={cn(styles.wordmark, className)} role="img" aria-label={t('trading.brandAria')}>
      <img src={tradingAssets.wordmarkScar} alt="" className={styles.scar} />
      <img src={tradingAssets.wordmarkAlphaAi} alt="" className={styles.alphaAi} />
    </div>
  );
}

export type TradingBrandMarkProps = {
  variant?: 'header' | 'signal';
  className?: string;
};

export function TradingBrandMark({ variant = 'header', className }: TradingBrandMarkProps) {
  return (
    <div className={cn(styles.brandRow, className)}>
      <TradingBrandIcon variant={variant} />
      <TradingBrandWordmark />
    </div>
  );
}
