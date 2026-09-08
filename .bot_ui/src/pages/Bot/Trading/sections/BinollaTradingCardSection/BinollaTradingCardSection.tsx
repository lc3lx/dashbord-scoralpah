import { Text } from '@components/atoms/Text';
import { CandlestickChart } from '@components/organisms/CandlestickChart';
import { useEffect, useMemo, useState } from 'react';
import { useT } from '@shared/i18n';
import type { BinollaCardContent } from '../../types';
import styles from './BinollaTradingCardSection.module.css';

export type BinollaTradingCardSectionProps = {
  content: BinollaCardContent;
};

function remainingSeconds(createdAt: string, durationSeconds: number): number {
  const start = new Date(createdAt).getTime();
  if (!Number.isFinite(start) || durationSeconds <= 0) return 0;
  const endsAt = start + durationSeconds * 1000;
  return Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
}

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatEntryTime(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return '—';
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function formatEntryPrice(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 100) return value.toFixed(2);
  if (abs >= 1) return value.toFixed(4);
  if (abs >= 0.01) return value.toFixed(5);
  return value.toFixed(6);
}

function resolveEntryPrice(
  candles: BinollaCardContent['candleData'],
  createdAt: string,
): { timeSec: number; price: number | undefined; candleIndex: number } {
  const timeSec = Math.floor(new Date(createdAt).getTime() / 1000);
  let candleIndex = -1;
  for (let i = 0; i < candles.length; i += 1) {
    const candleTime = candles[i]?.time;
    if (candleTime == null) continue;
    if (candleTime <= timeSec) candleIndex = i;
  }
  if (candleIndex < 0 && candles.length > 0) candleIndex = candles.length - 1;
  return {
    timeSec,
    candleIndex,
    price: candleIndex >= 0 ? candles[candleIndex]?.close : undefined,
  };
}

/** Read-only market chart — bot places trades; no manual pair/amount/expiry controls. */
export function BinollaTradingCardSection({ content }: BinollaTradingCardSectionProps) {
  const t = useT();
  const last = content.candleData[content.candleData.length - 1];
  const priceTone = last == null ? undefined : last.close >= last.open ? 'up' : 'down';
  const pair = content.pairSymbol ?? content.pairName;
  const active = content.activeTrade;
  const [leftSec, setLeftSec] = useState(() =>
    active ? remainingSeconds(active.createdAt, active.durationSeconds) : 0,
  );

  const entry = useMemo(
    () => (active ? resolveEntryPrice(content.candleData, active.createdAt) : null),
    [active, content.candleData],
  );

  useEffect(() => {
    if (!active) {
      setLeftSec(0);
      return;
    }
    const tick = () => setLeftSec(remainingSeconds(active.createdAt, active.durationSeconds));
    tick();
    const id = window.setInterval(tick, 1000);
    // #region agent log
    fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '1892a4' },
      body: JSON.stringify({
        sessionId: '1892a4',
        runId: 'countdown',
        hypothesisId: 'TIME1',
        location: 'BinollaTradingCardSection.tsx:countdown',
        message: 'countdown_armed',
        data: {
          asset: active.asset,
          durationSeconds: active.durationSeconds,
          createdAt: active.createdAt,
          leftSec: remainingSeconds(active.createdAt, active.durationSeconds),
          entryLocal: formatEntryTime(active.createdAt),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    return () => window.clearInterval(id);
  }, [active?.id, active?.createdAt, active?.durationSeconds]);

  useEffect(() => {
    if (!active || !entry) return;
    // #region agent log
    fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '1892a4' },
      body: JSON.stringify({
        sessionId: '1892a4',
        runId: 'pre-fix',
        hypothesisId: 'B',
        location: 'BinollaTradingCardSection.tsx:entryMarker',
        message: 'trade_entry_marker',
        data: {
          hasActive: true,
          candleCount: content.candleData.length,
          candleIndex: entry.candleIndex,
          timeSec: entry.timeSec,
          price: entry.price ?? null,
          direction: active.direction,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, [active, content.candleData.length, entry]);

  const isDown =
    (active?.direction ?? '').toUpperCase() === 'PUT' ||
    (active?.direction ?? '').toUpperCase() === 'DOWN';

  return (
    <section className={styles.section} aria-label={t('nav.trading')}>
      <article className={styles.card}>
        <div className={styles.statusBar}>
          <div className={styles.statusLeft}>
            <Text variant="body-sm" tone="primary" className={styles.pairName}>
              {pair}
              {content.pairSuffix ? ` · ${content.pairSuffix}` : ''}
            </Text>
            <p className={styles.price} data-tone={priceTone}>
              {content.priceDisplay}
            </p>
          </div>
          <Text variant="caption-xs" tone="caption" className={styles.balance}>
            {content.balancePrefix}{' '}
            <Text as="span" variant="caption-xs" tone="primary">
              {content.balanceValue}
            </Text>
          </Text>
        </div>

        {active ? (
          <div
            className={styles.activeTrade}
            data-side={isDown ? 'down' : 'up'}
            aria-live="polite"
          >
            <span className={styles.activeDot} />
            <div className={styles.activeTradeBody}>
              <Text variant="caption-xs" tone="primary" className={styles.activeTradeTitle}>
                {t('trading.chartEntry')} · {active.direction} {active.asset}
                {' · '}${active.amount.toFixed(2)}
              </Text>
              <Text variant="caption-xs" tone="caption" className={styles.activeTradeMeta}>
                {t('trading.entryAt', { time: formatEntryTime(active.createdAt) })}
                {entry?.price != null
                  ? ` · ${t('trading.entryPrice', { price: formatEntryPrice(entry.price) })}`
                  : ''}
                {' · '}
                {t('trading.remaining', { time: formatClock(leftSec) })}
              </Text>
            </div>
          </div>
        ) : null}

        <div className={styles.chartWrap}>
          {content.candleData.length > 0 ? (
            <CandlestickChart
              data={content.candleData}
              height={560}
              visibleBars={48}
              className={styles.chart}
              entryMarker={
                active && entry
                  ? {
                      timeSec: entry.timeSec,
                      price: entry.price,
                      direction: active.direction,
                      label: t('trading.chartEntry'),
                    }
                  : undefined
              }
            />
          ) : (
            <div className={styles.chartEmpty} role="img" aria-label={t('trading.noCandlesFallback')}>
              <Text variant="caption" tone="caption" align="center">
                {content.chartStatusLabel ?? t('trading.noCandlesFallback')}
              </Text>
            </div>
          )}
        </div>
      </article>
    </section>
  );
}
