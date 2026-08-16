import { cn } from '@utils/cn';
import type { ChipStyle, ChipTone } from '../../types';
import styles from './Chip.module.css';

export type ChipProps = {
  label: string;
  tone?: ChipTone;
  style?: ChipStyle;
  showDot?: boolean;
  className?: string;
};

const toneStyleMap: Record<ChipTone, Record<ChipStyle, string>> = {
  success: {
    solid: styles.toneSuccessSolid,
    outlined: styles.toneSuccessOutlined,
  },
  warning: {
    solid: styles.toneWarningSolid,
    outlined: styles.toneWarningOutlined,
  },
  danger: {
    solid: styles.toneDangerSolid,
    outlined: styles.toneDangerOutlined,
  },
  neutral: {
    solid: styles.toneNeutralSolid,
    outlined: styles.toneNeutralOutlined,
  },
  info: {
    solid: styles.toneInfoSolid,
    outlined: styles.toneInfoOutlined,
  },
  active: {
    solid: styles.toneActiveSolid,
    outlined: styles.toneActiveOutlined,
  },
  awaiting: {
    solid: styles.toneAwaitingSolid,
    outlined: styles.toneAwaitingOutlined,
  },
};

const dotToneMap: Record<ChipTone, string> = {
  success: styles.dotSuccess,
  warning: styles.dotWarning,
  danger: styles.dotDanger,
  neutral: styles.dotNeutral,
  info: styles.dotInfo,
  active: styles.dotActive,
  awaiting: styles.dotAwaiting,
};

export function Chip({
  label,
  tone = 'neutral',
  style = 'solid',
  showDot = true,
  className,
}: ChipProps) {
  return (
    <span className={cn(styles.chip, toneStyleMap[tone][style], className)}>
      {showDot && <span className={cn(styles.dot, dotToneMap[tone])} aria-hidden="true" />}
      <span className={styles.label}>{label}</span>
    </span>
  );
}

export type BadgeProps = ChipProps;

export function Badge(props: BadgeProps) {
  return <Chip {...props} style="outlined" />;
}
