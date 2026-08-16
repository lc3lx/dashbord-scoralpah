import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react';
import { useT } from '@shared/i18n';
import { cn } from '@utils/cn';
import styles from './CandlestickChart.module.css';

export type CandlestickPoint = {
  open: number;
  high: number;
  low: number;
  close: number;
  /** Candle open time in unix seconds (optional; used for live rollover). */
  time?: number;
};

export type CandlestickChartProps = {
  data: CandlestickPoint[];
  width?: number;
  height?: number;
  className?: string;
  /** Bars visible in the viewport at default zoom (pan/zoom to adjust). */
  visibleBars?: number;
};

const UP = '#12e655';
const DOWN = '#ef4444';
const GRID = 'rgba(42, 46, 57, 0.95)';
const AXIS = '#787b86';
const CROSS = 'rgba(120, 123, 134, 0.55)';
const BG = '#131722';

const ZOOM_MIN = 12;
const ZOOM_MAX = 80;

type PriceDomain = { lo: number; hi: number };

function formatPrice(value: number, range: number): string {
  if (range >= 100) return value.toFixed(2);
  if (range >= 1) return value.toFixed(4);
  if (range >= 0.01) return value.toFixed(5);
  return value.toFixed(6);
}

function formatCandleTime(timeSec: number | undefined): string {
  if (timeSec == null || !Number.isFinite(timeSec)) return '';
  const d = new Date(timeSec * 1000);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function sanitize(point: CandlestickPoint): CandlestickPoint {
  const open = point.open;
  const close = point.close;
  let high = point.high;
  let low = point.low;
  if (low > high) {
    const t = low;
    low = high;
    high = t;
  }
  high = Math.max(high, open, close);
  low = Math.min(low, open, close);
  return { ...point, open, high, low, close };
}

function domainFrom(points: CandlestickPoint[]): PriceDomain {
  const minPrice = Math.min(...points.map((p) => p.low));
  const maxPrice = Math.max(...points.map((p) => p.high));
  const raw = maxPrice - minPrice || 0.0001;
  const pad = raw * 0.14;
  return { lo: minPrice - pad, hi: maxPrice + pad };
}

/** Keep live price near vertical center with generous breathing room. */
function domainTrackingFocus(points: CandlestickPoint[], focus: number): PriceDomain {
  const minPrice = Math.min(...points.map((p) => p.low), focus);
  const maxPrice = Math.max(...points.map((p) => p.high), focus);
  const dataSpan = Math.max(maxPrice - minPrice, Math.abs(focus) * 1e-4, 1e-5);
  const above = Math.max(maxPrice - focus, dataSpan * 0.45);
  const below = Math.max(focus - minPrice, dataSpan * 0.45);
  const half = Math.max(above, below) * 1.28;
  return { lo: focus - half, hi: focus + half };
}

function lerpDomain(prev: PriceDomain | null, next: PriceDomain, t: number): PriceDomain {
  if (!prev) return next;
  return {
    lo: prev.lo + (next.lo - prev.lo) * t,
    hi: prev.hi + (next.hi - prev.hi) * t,
  };
}

export function CandlestickChart({
  data,
  width = 362,
  height = 220,
  className,
  visibleBars = 28,
}: CandlestickChartProps) {
  const t = useT();
  const hostRef = useRef<HTMLDivElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState(width);
  /** Pixel offset: 0 = live candle at horizontal center. Positive = older history. */
  const [panPx, setPanPx] = useState(0);
  const [barsVisible, setBarsVisible] = useState(() =>
    Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, visibleBars)),
  );
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ x: number; pan: number } | null>(null);
  const frozenDomainRef = useRef<PriceDomain | null>(null);
  const smoothDomainRef = useRef<PriceDomain | null>(null);
  const panPxRef = useRef(0);
  const barsVisibleRef = useRef(barsVisible);
  const clipId = useId().replace(/:/g, '');
  const [, bump] = useState(0);

  useEffect(() => {
    barsVisibleRef.current = barsVisible;
  }, [barsVisible]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof ResizeObserver === 'undefined') return;

    const applyWidth = (next: number) => {
      const rounded = Math.max(1, Math.round(next));
      setMeasuredWidth((prev) => (prev === rounded ? prev : rounded));
    };

    applyWidth(host.clientWidth || width);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      applyWidth(entry.contentRect.width);
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, [width]);

  const chartWidth = measuredWidth > 0 ? measuredWidth : width;
  const sanitized = useMemo(() => data.map(sanitize), [data]);

  // Extra space: roomy plot + time axis strip under candles.
  const padL = 10;
  const padR = 54;
  const padT = 14;
  const padB = 26;
  const plotW = Math.max(1, chartWidth - padL - padR);
  const plotH = Math.max(1, height - padT - padB);
  const slot = plotW / Math.max(barsVisible, 1);
  const bodyW = Math.max(3, Math.min(14, slot * 0.72));
  const wickW = bodyW >= 5 ? 1.5 : 1.2;
  /** Live candle sits on the horizontal midpoint of the plot when pan ≈ 0. */
  const liveCenterX = padL + plotW / 2;
  const maxPanPx = Math.max(0, (sanitized.length - Math.ceil(barsVisible / 2)) * slot);
  const clampedPan = Math.min(Math.max(0, panPx), maxPanPx);
  const followLive = clampedPan < slot * 0.25 && !dragging;

  const rightIndex =
    sanitized.length === 0
      ? 0
      : sanitized.length - 1 - Math.round(clampedPan / slot);
  const halfBars = Math.floor(barsVisible / 2);
  const leftIndex = Math.max(0, rightIndex - halfBars);
  const visiblePoints = useMemo(() => {
    if (sanitized.length === 0) return [];
    const end = Math.min(sanitized.length, rightIndex + 1);
    const start = Math.max(0, end - barsVisible);
    return sanitized.slice(start, end);
  }, [sanitized, rightIndex, barsVisible]);

  const liveClose = sanitized.length > 0 ? sanitized[sanitized.length - 1]!.close : 0;

  const targetDomain = useMemo(() => {
    if (visiblePoints.length === 0) return { lo: 0, hi: 1 };
    if (followLive) return domainTrackingFocus(visiblePoints, liveClose);
    return domainFrom(visiblePoints);
  }, [visiblePoints, followLive, liveClose]);

  useEffect(() => {
    if (dragging || !followLive) return;
    smoothDomainRef.current = lerpDomain(smoothDomainRef.current, targetDomain, 0.4);
    bump((n) => n + 1);
  }, [targetDomain, dragging, followLive]);

  const domain: PriceDomain = (() => {
    if (dragging || !followLive) {
      return frozenDomainRef.current ?? targetDomain;
    }
    return smoothDomainRef.current ?? targetDomain;
  })();

  const lo = domain.lo;
  const hi = domain.hi;
  const priceRange = hi - lo || 1;

  const applyZoom = useCallback((nextBars: number) => {
    const clamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, nextBars));
    const prevBars = barsVisibleRef.current;
    if (clamped === prevBars) return;
    const prevSlot = plotW / Math.max(prevBars, 1);
    const nextSlot = plotW / Math.max(clamped, 1);
    // Keep the live-relative pan distance stable across zoom.
    const panCandles = panPxRef.current / Math.max(prevSlot, 1e-6);
    const nextPan = panCandles * nextSlot;
    const nextMax = Math.max(0, (sanitized.length - Math.ceil(clamped / 2)) * nextSlot);
    const clampedPanNext = Math.min(Math.max(0, nextPan), nextMax);
    panPxRef.current = clampedPanNext;
    setPanPx(clampedPanNext);
    barsVisibleRef.current = clamped;
    setBarsVisible(clamped);
  }, [plotW, sanitized.length]);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      frozenDomainRef.current = smoothDomainRef.current ?? targetDomain;
      dragRef.current = { x: event.clientX, pan: clampedPan };
      setDragging(true);
    },
    [clampedPan, targetDomain],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = event.clientX - drag.x;
      const next = Math.min(maxPanPx, Math.max(0, drag.pan + dx));
      panPxRef.current = next;
      setPanPx(next);
    },
    [maxPanPx],
  );

  const endDrag = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      dragRef.current = null;
      setDragging(false);
      if (panPxRef.current < slot * 0.25) {
        frozenDomainRef.current = null;
        smoothDomainRef.current = null;
      }
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        /* already released */
      }
    },
    [slot],
  );

  const onWheel = useCallback(
    (event: ReactWheelEvent<SVGSVGElement>) => {
      event.preventDefault();
      const step = event.deltaY > 0 ? 4 : -4;
      applyZoom(barsVisibleRef.current + step);
    },
    [applyZoom],
  );

  useEffect(() => {
    setPanPx((p) => {
      const next = Math.min(p, maxPanPx);
      panPxRef.current = next;
      return next;
    });
  }, [maxPanPx]);

  // #region agent log
  useEffect(() => {
    if (sanitized.length === 0) return;
    const liveX = liveCenterX + clampedPan;
    fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '660ec2' },
      body: JSON.stringify({
        sessionId: '660ec2',
        runId: 'chart-center',
        hypothesisId: 'H-chart',
        location: 'CandlestickChart.tsx:layout',
        message: 'chart_layout',
        data: {
          plotMid: padL + plotW / 2,
          liveCenterX,
          liveXWhenFollow: liveX,
          followLive,
          barsVisible,
          padB,
          hasTimeAxis: true,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }, [sanitized.length, liveCenterX, clampedPan, followLive, barsVisible, padL, plotW, padB]);
  // #endregion

  if (sanitized.length === 0) return null;

  const scaleY = (price: number) => padT + plotH - ((price - lo) / priceRange) * plotH;

  const drawStart = Math.max(0, leftIndex - 2);
  const drawEnd = Math.min(sanitized.length - 1, rightIndex + Math.ceil(barsVisible / 2) + 2);

  const gridSteps = 4;
  const gridLines = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const step = i / gridSteps;
    const price = hi - step * priceRange;
    return { y: padT + plotH * step, price };
  });

  const liveCandle = sanitized[sanitized.length - 1]!;
  const lastUp = liveCandle.close >= liveCandle.open;
  const lastColor = lastUp ? UP : DOWN;
  const lastY = scaleY(liveCandle.close);
  const priceLabel = formatPrice(liveCandle.close, priceRange);
  const labelH = 16;
  const labelW = Math.max(44, priceLabel.length * 6.4 + 10);
  const labelY = Math.min(Math.max(lastY - labelH / 2, padT), padT + plotH - labelH);

  const xForIndex = (index: number) =>
    liveCenterX - (sanitized.length - 1 - index) * slot + clampedPan;

  // Time ticks under the plot — pick evenly spaced visible candles.
  const timeTickCount = Math.min(5, Math.max(2, visiblePoints.length));
  const timeTicks: { x: number; label: string }[] = [];
  if (visiblePoints.length > 0) {
    for (let i = 0; i < timeTickCount; i++) {
      const idxInVisible =
        timeTickCount === 1
          ? 0
          : Math.round((i * (visiblePoints.length - 1)) / (timeTickCount - 1));
      const point = visiblePoints[idxInVisible]!;
      const globalIndex = sanitized.indexOf(point);
      const index =
        globalIndex >= 0
          ? globalIndex
          : leftIndex + idxInVisible;
      const label = formatCandleTime(point.time);
      if (!label) continue;
      const x = xForIndex(index);
      if (x < padL + 8 || x > padL + plotW - 8) continue;
      timeTicks.push({ x, label });
    }
  }

  return (
    <div ref={hostRef} className={cn(styles.chartHost, className)}>
      <div className={styles.zoomBar} role="group" aria-label={t('trading.chartZoom')}>
        <button
          type="button"
          className={styles.zoomBtn}
          aria-label={t('trading.chartZoomIn')}
          disabled={barsVisible <= ZOOM_MIN}
          onClick={(e) => {
            e.stopPropagation();
            applyZoom(barsVisible - 4);
          }}
        >
          +
        </button>
        <button
          type="button"
          className={styles.zoomBtn}
          aria-label={t('trading.chartZoomOut')}
          disabled={barsVisible >= ZOOM_MAX}
          onClick={(e) => {
            e.stopPropagation();
            applyZoom(barsVisible + 4);
          }}
        >
          −
        </button>
      </div>

      <svg
        className={styles.chart}
        width={chartWidth}
        height={height}
        viewBox={`0 0 ${chartWidth} ${height}`}
        role="img"
        aria-label={t('trading.chartAria')}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onWheel={onWheel}
        style={{
          touchAction: 'none',
          cursor: maxPanPx > 0 ? (dragging ? 'grabbing' : 'grab') : 'default',
        }}
      >
        <rect x={0} y={0} width={chartWidth} height={height} fill={BG} />

        {gridLines.map(({ y, price }) => (
          <g key={`g-${price}`}>
            <line
              x1={padL}
              y1={y}
              x2={chartWidth - padR}
              y2={y}
              stroke={GRID}
              strokeWidth={1}
              strokeDasharray={y === padT || y === padT + plotH ? undefined : '2 3'}
            />
            <text
              x={chartWidth - padR + 6}
              y={y + 3}
              className={styles.axisLabel}
              fill={AXIS}
              fontSize={9}
              fontFamily="Trebuchet MS, Segoe UI, sans-serif"
            >
              {formatPrice(price, priceRange)}
            </text>
          </g>
        ))}

        <line
          x1={chartWidth - padR}
          y1={padT}
          x2={chartWidth - padR}
          y2={padT + plotH}
          stroke={GRID}
          strokeWidth={1}
        />

        <line
          x1={padL}
          y1={padT + plotH}
          x2={padL + plotW}
          y2={padT + plotH}
          stroke={GRID}
          strokeWidth={1}
        />

        <defs>
          <clipPath id={clipId}>
            <rect x={padL} y={padT} width={plotW} height={plotH} />
          </clipPath>
        </defs>

        <g clipPath={`url(#${clipId})`}>
          {/* Vertical guide at horizontal center (live candle home). */}
          {followLive ? (
            <line
              x1={liveCenterX}
              y1={padT}
              x2={liveCenterX}
              y2={padT + plotH}
              stroke="rgba(120, 123, 134, 0.22)"
              strokeWidth={1}
              strokeDasharray="3 4"
            />
          ) : null}

          {Array.from({ length: Math.max(0, drawEnd - drawStart + 1) }, (_, i) => {
            const index = drawStart + i;
            const point = sanitized[index]!;
            const isUp = point.close >= point.open;
            const color = isUp ? UP : DOWN;
            const xCenter = xForIndex(index);
            const x = xCenter - bodyW / 2;
            const bodyTop = scaleY(Math.max(point.open, point.close));
            const bodyBottom = scaleY(Math.min(point.open, point.close));
            const bodyHeight = Math.max(1.5, bodyBottom - bodyTop);
            const isLive = index === sanitized.length - 1;

            return (
              <g key={point.time != null ? `t-${point.time}` : `i-${index}`}>
                <line
                  x1={xCenter}
                  y1={scaleY(point.high)}
                  x2={xCenter}
                  y2={scaleY(point.low)}
                  stroke={color}
                  strokeWidth={wickW}
                  strokeLinecap="butt"
                />
                <rect
                  x={x}
                  y={bodyTop}
                  width={bodyW}
                  height={bodyHeight}
                  fill={color}
                  stroke={color}
                  strokeWidth={isLive ? 1.2 : 0.75}
                  className={isLive ? styles.liveBody : undefined}
                />
              </g>
            );
          })}
        </g>

        {/* Time axis under the plot */}
        {timeTicks.map(({ x, label }) => (
          <g key={`time-${label}-${x}`}>
            <line
              x1={x}
              y1={padT + plotH}
              x2={x}
              y2={padT + plotH + 4}
              stroke={AXIS}
              strokeWidth={1}
            />
            <text
              x={x}
              y={height - 8}
              textAnchor="middle"
              className={styles.axisLabel}
              fill={AXIS}
              fontSize={9}
              fontFamily="Trebuchet MS, Segoe UI, sans-serif"
            >
              {label}
            </text>
          </g>
        ))}

        <line
          x1={padL}
          y1={lastY}
          x2={chartWidth - padR}
          y2={lastY}
          stroke={CROSS}
          strokeWidth={1}
          strokeDasharray="4 3"
        />
        <rect
          x={chartWidth - padR + 1}
          y={labelY}
          width={labelW}
          height={labelH}
          rx={2}
          fill={lastColor}
        />
        <text
          x={chartWidth - padR + 1 + labelW / 2}
          y={labelY + 11.5}
          textAnchor="middle"
          fill="#fff"
          fontSize={9}
          fontWeight={700}
          fontFamily="Trebuchet MS, Segoe UI, sans-serif"
        >
          {priceLabel}
        </text>
      </svg>
    </div>
  );
}
