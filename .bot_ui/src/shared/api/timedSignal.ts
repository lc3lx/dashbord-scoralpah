/** AbortSignal that fires after `ms` — keeps Home/Trading from hanging on slow market APIs. */
export function timedSignal(ms: number): AbortSignal {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(ms);
  }
  const controller = new AbortController();
  window.setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

export const MARKET_FETCH_MS = 35_000;
/** Playwright capture + WS auth regularly needs 30–60s — do not abort early. */
export const BINOLLA_LOGIN_MS = 90_000;
