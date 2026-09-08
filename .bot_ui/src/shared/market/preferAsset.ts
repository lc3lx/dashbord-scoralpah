/** Forex currency pairs only — majors/minors; excludes crypto, equities, indices, commodities. */
const FX_CODES = new Set([
  'EUR',
  'GBP',
  'USD',
  'AUD',
  'CAD',
  'CHF',
  'JPY',
  'NZD',
  'TRY',
  'MXN',
  'ZAR',
  'SGD',
  'HKD',
  'CNH',
  'CNY',
  'SEK',
  'NOK',
  'PLN',
  'DKK',
  'INR',
  'BRL',
  'RUB',
  'CZK',
  'HUF',
  'ILS',
  'THB',
]);

/** Prefer liquid Binolla OTC FX majors — avoid first-in-list equity OTC like 0700.HK_otc. */
const PREFERRED_SYMBOLS = [
  'EURUSD_otc',
  'GBPUSD_otc',
  'USDJPY_otc',
  'EURGBP_otc',
  'AUDUSD_otc',
  'USDCAD_otc',
  'USDCHF_otc',
  'EURUSD',
  'GBPUSD',
  'USDJPY',
] as const;

export type MarketAssetLike = {
  symbol: string;
  available?: boolean;
};

export function isFxCurrencySymbol(symbol: string): boolean {
  let s = symbol.trim().replace(/\//g, '');
  if (/_otc$/i.test(s)) s = s.slice(0, -4);
  if (!/^[A-Za-z]{6}$/.test(s)) return false;
  return FX_CODES.has(s.slice(0, 3).toUpperCase()) && FX_CODES.has(s.slice(3).toUpperCase());
}

export function filterFxCurrencyAssets<T extends MarketAssetLike>(assets: T[]): T[] {
  return assets.filter((a) => isFxCurrencySymbol(a.symbol));
}

export function isPreferredMarketSymbol(symbol: string): boolean {
  const s = symbol.trim();
  return PREFERRED_SYMBOLS.some((p) => p.toLowerCase() === s.toLowerCase());
}

export function pickPreferredMarketAsset<T extends MarketAssetLike>(
  assets: T[],
): T | undefined {
  const fx = filterFxCurrencyAssets(assets);
  if (!fx.length) return undefined;

  for (const preferred of PREFERRED_SYMBOLS) {
    const hit = fx.find(
      (a) =>
        a.symbol.toLowerCase() === preferred.toLowerCase() &&
        (a.available === undefined || a.available),
    );
    if (hit) return hit;
  }

  return fx.find((a) => a.available) ?? fx[0];
}
