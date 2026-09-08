import { Text } from '@components/atoms/Text';
import { cn } from '@utils/cn';
import styles from './PerformanceChart.module.css';

export type PerformanceChartPoint = {
  label: string;
  net: number;
};

export type PerformanceChartDetail = {
  label: string;
  value: string;
  tone?: 'success' | 'danger' | 'primary';
};

export type PerformanceChartProps = {
  points: PerformanceChartPoint[];
  details?: PerformanceChartDetail[];
  emptyLabel: string;
  className?: string;
};

export function PerformanceChart({ points, details, emptyLabel, className }: PerformanceChartProps) {
  const width = 320;
  const height = 118;
  const padL = 6;
  const padR = 6;
  const padT = 10;
  const padB = 22;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const maxAbs = Math.max(0.01, ...points.map((point) => Math.abs(point.net)));
  const zeroY = padT + plotH / 2;
  const slot = points.length > 0 ? plotW / points.length : plotW;
  const barW = Math.max(3, Math.min(14, slot * 0.62));
  const labelEvery = Math.max(1, Math.ceil(points.length / 6));

  return (
    <div className={cn(styles.wrap, className)}>
      {points.length === 0 ? (
        <Text variant="caption" tone="caption" className={styles.empty}>
          {emptyLabel}
        </Text>
      ) : (
        <svg
          className={styles.svg}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={emptyLabel}
        >
          <line
            x1={padL}
            y1={zeroY}
            x2={width - padR}
            y2={zeroY}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={1}
          />
          {points.map((point, index) => {
            const x = padL + slot * index + slot / 2;
            const magnitude = (Math.abs(point.net) / maxAbs) * (plotH / 2 - 2);
            const isUp = point.net >= 0;
            const y = isUp ? zeroY - magnitude : zeroY;
            return (
              <g key={`${point.label}-${index}`}>
                <rect
                  x={x - barW / 2}
                  y={y}
                  width={barW}
                  height={Math.max(2, magnitude)}
                  rx={2}
                  fill={isUp ? '#12e655' : '#ef4444'}
                  opacity={point.net === 0 ? 0.35 : 0.92}
                />
                {index % labelEvery === 0 || index === points.length - 1 ? (
                  <text
                    x={x}
                    y={height - 6}
                    textAnchor="middle"
                    fill="#8b8e97"
                    fontSize={8}
                  >
                    {point.label}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      )}

      {details && details.length > 0 ? (
        <div className={styles.details}>
          {details.map((detail) => (
            <div key={detail.label} className={styles.detail}>
              <Text variant="caption-xs" tone="caption">
                {detail.label}
              </Text>
              <Text variant="caption" tone={detail.tone ?? 'primary'} className={styles.detailValue}>
                {detail.value}
              </Text>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
